/* effects.js — background particles, stars, confetti, tilt */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- Particles ---------- */
  function initParticles() {
    const host = document.getElementById('particles');
    if (!host || reduceMotion) return;
    const count = window.innerWidth < 720 ? 12 : 24;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const size = 3 + Math.random() * 5;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = 12 + Math.random() * 14 + 's';
      p.style.animationDelay = -Math.random() * 20 + 's';
      frag.appendChild(p);
    }
    host.appendChild(frag);
  }

  /* ---------- Stars ---------- */
  function initStars() {
    const host = document.getElementById('stars');
    if (!host || reduceMotion) return;
    const count = window.innerWidth < 720 ? 30 : 70;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.className = 'star';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDuration = 2 + Math.random() * 3 + 's';
      s.style.animationDelay = Math.random() * 4 + 's';
      frag.appendChild(s);
    }
    host.appendChild(frag);
  }

  /* ---------- Pointer parallax on decorative orbs ---------- */
  function initParallax() {
    if (isTouch || reduceMotion) return;
    const orbs = document.querySelectorAll('.bg-orb');
    if (!orbs.length) return;
    let raf = null;
    window.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 24;
        const y = (e.clientY / window.innerHeight - 0.5) * 24;
        orbs.forEach((orb, i) => {
          const k = (i + 1) * 0.6;
          orb.style.transform = `translate3d(${x * k}px, ${y * k}px, 0)`;
        });
        raf = null;
      });
    }, { passive: true });
  }

  /* ---------- Tilt on elements with .tilt ---------- */
  function initTilt() {
    if (isTouch || reduceMotion) return;
    const els = document.querySelectorAll('.tilt');
    els.forEach((el) => {
      const max = 10;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          `perspective(900px) rotateX(${(-py * max).toFixed(2)}deg) rotateY(${(px * max).toFixed(2)}deg)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- Confetti burst (public API) ---------- */
  function burstConfetti(originEl, count = 60) {
    if (reduceMotion) return;
    const rect = originEl
      ? originEl.getBoundingClientRect()
      : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 };
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const colors = ['#ffc6e0', '#c9b8ff', '#9fd8ff', '#f3d9a4', '#ff8fb1', '#ffffff'];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.left = originX + 'px';
      piece.style.top = originY + 'px';
      piece.style.background = colors[(Math.random() * colors.length) | 0];
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const velocity = 180 + Math.random() * 320;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity - 120;
      const rot = (Math.random() - 0.5) * 900;
      const dur = 1200 + Math.random() * 900;

      piece.animate(
        [
          { transform: 'translate(0,0) rotate(0)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) rotate(${rot * 0.4}deg)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${dx * 1.4}px, ${dy + 500}px) rotate(${rot}deg)`, opacity: 0 }
        ],
        { duration: dur, easing: 'cubic-bezier(0.2,0.6,0.4,1)', fill: 'forwards' }
      ).onfinish = () => piece.remove();
    }
  }

  window.Effects = { burstConfetti, initTilt };

  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initStars();
    initParallax();
    initTilt();
  });
})();