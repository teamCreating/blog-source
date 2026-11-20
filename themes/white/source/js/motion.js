// 动效层脚本：返回顶部按钮（其余动效均由 CSS 完成）
(() => {
  'use strict';

  const SHOW_AT = 350;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-top';
  btn.setAttribute('aria-label', '返回顶部');
  btn.innerHTML = '<i class="ri-arrow-up-line"></i>';

  function toggle() {
    btn.classList.toggle('back-top-show', window.scrollY > SHOW_AT);
  }

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
  document.body.appendChild(btn);
})();
