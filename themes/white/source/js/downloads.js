(() => {
  'use strict';

  /* ================= 找回密码 ================= */

  const dataEl = document.getElementById('dl-recover-data');
  const panel = document.getElementById('dl-recover-panel');
  const toggle = document.getElementById('dl-recover-toggle');

  if (dataEl && panel && toggle) {
    let challenges = [];
    try {
      challenges = JSON.parse(dataEl.textContent) || [];
    } catch (e) {
      challenges = [];
    }

    const qSelect = document.getElementById('dl-question');
    const answerInput = document.getElementById('dl-answer');
    const msg = document.getElementById('dl-recover-msg');

    toggle.addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      if (!panel.hidden) answerInput.focus();
    });

    // 答案归一化：与 scripts/inject-downloads.js 中的实现保持一致
    function normalizeAnswer(s) {
      return String(s).normalize('NFKC').toLowerCase()
        .replace(/[\s`~!@#$%^&*()_+\-=[\]{};':",.<>/?\\|，。；：！？、“”‘’（）《》【】…—·～]/g, '');
    }

    function b64ToBuf(b64) {
      const bin = atob(b64);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out.buffer;
    }

    // 逐个 blob 尝试：PBKDF2(答案) 解密 AES-GCM 密文，取出密码
    async function tryBlobs(blobs, answer) {
      const norm = normalizeAnswer(answer);
      if (!norm) return null;
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(norm),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      for (const blob of blobs) {
        try {
          const key = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', hash: 'SHA-256', salt: b64ToBuf(blob.salt), iterations: 200000 },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
          );
          const plain = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: b64ToBuf(blob.iv) },
            key,
            b64ToBuf(blob.ct)
          );
          const obj = JSON.parse(new TextDecoder().decode(plain));
          if (obj && obj.p) return String(obj.p);
        } catch (e) {
          // 这个答案对应的密钥不对，继续试下一个
        }
      }
      return null;
    }

    panel.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (msg) msg.textContent = '正在验证…';

      const qIndex = qSelect ? Number(qSelect.value) : 0;
      const ch = challenges[qIndex];
      const pw = ch ? await tryBlobs(ch.blobs, answerInput.value) : null;

      if (!pw) {
        if (msg) msg.textContent = '答案不对哦，再想想？';
        return;
      }

      if (msg) msg.textContent = '验证成功，正在解锁…';

      // 把找回的密码填入 hbe 输入框，合成回车键触发 hbe 的解密流程
      const input = document.getElementById('hbePass');
      const main = document.getElementById('hexo-blog-encrypt');
      if (!input || !main) return;
      input.value = pw;
      input.focus();
      const ev = new KeyboardEvent('keydown', { bubbles: true });
      Object.defineProperty(ev, 'keyCode', { get: () => 13 });
      main.dispatchEvent(ev);
    });
  }

  /* ================= 指纹复制（解密后才存在，用事件委托） ================= */

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.dl-copy');
    if (!btn) return;
    const textEl = document.querySelector('.dl-fp-text');
    if (!textEl) return;
    const text = (textEl.textContent || '').trim();

    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        ok = document.execCommand('copy');
      } catch (err2) {
        ok = false;
      }
      ta.remove();
    }

    btn.textContent = ok ? '已复制 ✓' : '复制失败';
    setTimeout(() => {
      btn.textContent = '复制';
    }, 2000);
  });
})();
