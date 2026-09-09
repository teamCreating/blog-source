'use strict';

/**
 * 下载页注入脚本（/downloads/）
 *
 * 读取站点根目录的 download.secrets.json，在构建期做三件事：
 *   1. 把密码设进页面，交给 hexo-blog-encrypt 加密正文（其后 hbe 的过滤器优先级 1000，在本脚本之后执行）
 *   2. 把下载直链、指纹块以 HTML 追加进正文 —— 随正文一起被加密，公网上只有密文
 *   3. 用「安全问题答案」派生密钥（PBKDF2-SHA256, 200000 次）以 AES-GCM 加密密码，
 *      生成"忘记密码"blob，通过 page.dl 交给 layout 放在公开区
 *
 * secrets 文件缺失或字段不全时直接抛错终止构建，防止部署出未加密的下载页。
 * 注意：download.secrets.json 含明文密码，仓库必须在私有状态下发布。
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PAGE_PATH = 'downloads/index.html';

// 答案归一化：与 themes/white/source/js/downloads.js 中的实现保持一致
function normalizeAnswer(s) {
  return String(s).normalize('NFKC').toLowerCase()
    .replace(/[\s`~!@#$%^&*()_+\-=[\]{};':",.<>/?\\|，。；：！？、“”‘’（）《》【】…—·～]/g, '');
}

function b64(buf) {
  return buf.toString('base64');
}

// PBKDF2(答案) -> AES-GCM(密码)
// 输出 ct 为 ciphertext || authTag，与浏览器 WebCrypto AES-GCM 的输入格式一致
function encryptForAnswer(password, answer) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.pbkdf2Sync(
    Buffer.from(normalizeAnswer(answer), 'utf8'),
    salt, 200000, 32, 'sha256'
  );
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = cipher.update(Buffer.from(JSON.stringify({ p: password }), 'utf8'));
  cipher.final();
  return {
    salt: b64(salt),
    iv: b64(iv),
    ct: b64(Buffer.concat([ct, cipher.getAuthTag()])),
  };
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 注入进正文（会被 hbe 加密）的秘密区块：下载按钮 + 指纹
function renderSecretBlock(s) {
  const sizeText = s.size ? `（${esc(s.size)}）` : '';
  let html = '<div class="dl-secret">';
  html += `<a class="dl-btn" href="${esc(s.url)}">下载 ${esc(s.name || '客户端')}${s.version ? ' ' + esc(s.version) : ''}${sizeText}</a>`;
  if (s.fingerprint) {
    html += '<div class="dl-fp">';
    html += '<div class="dl-fp-label">客户端指纹（进服校验用）</div>';
    html += '<div class="dl-fp-row">';
    html += `<code class="dl-fp-text">${esc(s.fingerprint)}</code>`;
    html += '<button type="button" class="dl-copy">复制</button>';
    html += '</div>';
    if (s.fingerprint_hint) {
      html += `<div class="dl-fp-hint">${esc(s.fingerprint_hint)}</div>`;
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

hexo.extend.filter.register('after_post_render', (data) => {
  const p = String(data.path || '').replace(/\\/g, '/');
  if (p !== PAGE_PATH) return data;
  if (data.dlInjected) return data; // 防止重复注入

  const secretsPath = path.join(hexo.base_dir, 'download.secrets.json');
  if (!fs.existsSync(secretsPath)) {
    throw new Error('[inject-downloads] download.secrets.json 不存在，拒绝构建下载页（防止未加密部署）。');
  }
  let s;
  try {
    s = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
  } catch (e) {
    throw new Error('[inject-downloads] download.secrets.json 解析失败：' + e.message);
  }
  if (!s.password || !s.url) {
    throw new Error('[inject-downloads] download.secrets.json 缺少 password 或 url 字段。');
  }

  // 1) hbe 加密密码
  data.password = s.password;

  // 2) 公开区元数据（版本卡 + 找回密码面板），layout 通过 page.dl 读取
  const challenges = Array.isArray(s.challenges) ? s.challenges : [];
  data.dl = {
    version: s.version || '',
    name: s.name || '',
    date: s.date || '',
    size: s.size || '',
    challenges: challenges
      .filter((c) => c && c.question && Array.isArray(c.answers) && c.answers.length)
      .map((c) => ({
        question: c.question,
        blobs: c.answers.map((a) => encryptForAnswer(s.password, a)),
      })),
  };

  // 3) 秘密区块并入正文，随后被 hbe 整体加密
  data.content = (data.content || '') + renderSecretBlock(s);
  data.dlInjected = true;

  hexo.log.info(
    `[inject-downloads] 下载页已注入：版本 ${s.version || '?'}，找回问题 ${data.dl.challenges.length} 个，指纹 ${s.fingerprint ? '有' : '无'}`
  );
  return data;
}, 500);
