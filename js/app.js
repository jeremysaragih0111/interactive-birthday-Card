/* app.js — per-page interactions (envelope, cake, confetti) */
(function () {
  'use strict';

  /* ---------- Letter page ---------- */
  function initLetter() {
    const envelope = document.getElementById('envelope');
    const reopen = document.getElementById('reopen-letter');
    const status = document.getElementById('letter-status');
    if (!envelope) return;

    function openEnvelope() {
      const isOpen = envelope.classList.toggle('is-open');
      envelope.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      envelope.setAttribute('aria-label', isOpen ? 'Close the letter' : 'Open the letter');
      if (isOpen) {
        if (status) status.textContent = 'Letter opened. Read your message.';
        if (window.AudioManager) window.AudioManager.sfx('open');
      } else {
        if (status) status.textContent = 'Letter closed.';
      }
    }

    envelope.addEventListener('click', openEnvelope);
    if (reopen) {
      reopen.addEventListener('click', () => {
        envelope.classList.remove('is-open');
        envelope.setAttribute('aria-expanded', 'false');
        envelope.setAttribute('aria-label', 'Open the letter');
        // Force reflow so re-open triggers the transition again
        void envelope.offsetWidth;
        openEnvelope();
      });
    }
  }

  /* ---------- Celebration page ---------- */
  function initCelebration() {
    const host = document.getElementById('candles');
    const cake = document.getElementById('cake');
    const blowAll = document.getElementById('blow-all');
    const relight = document.getElementById('relight');
    const wishMsg = document.getElementById('wish-message');
    const status = document.getElementById('wish-status');
    if (!host) return;

    const COUNT = 5;
    const candles = [];

    function makeCandle(i) {
      const btn = document.createElement('button');
      btn.className = 'candle';
      btn.type = 'button';
      btn.setAttribute('aria-label', `Candle ${i + 1}, lit. Click to blow out.`);
      const flame = document.createElement('span');
      flame.className = 'flame';
      flame.setAttribute('aria-hidden', 'true');
      btn.appendChild(flame);
      btn.addEventListener('click', () => {
        const out = btn.classList.toggle('is-out');
        btn.setAttribute('aria-label', `Candle ${i + 1}, ${out ? 'out' : 'lit'}. Click to ${out ? 'relight' : 'blow out'}.`);
        if (window.AudioManager) window.AudioManager.sfx('pop');
        checkAllOut();
      });
      host.appendChild(btn);
      candles.push(btn);
    }

    for (let i = 0; i < COUNT; i++) makeCandle(i);

    function allOut() {
      return candles.every((c) => c.classList.contains('is-out'));
    }
    function checkAllOut() {
      if (allOut()) {
        if (wishMsg) wishMsg.hidden = false;
        if (status) status.textContent = 'All candles are out. Your wish has been sent!';
        if (window.Effects) window.Effects.burstConfetti(cake, 80);
        if (window.AudioManager) window.AudioManager.sfx('chime');
      } else {
        if (wishMsg) wishMsg.hidden = true;
        if (status) status.textContent = '';
      }
    }

    if (blowAll) {
      blowAll.addEventListener('click', () => {
        candles.forEach((c) => c.classList.add('is-out'));
        checkAllOut();
      });
    }
    if (relight) {
      relight.addEventListener('click', () => {
        candles.forEach((c) => c.classList.remove('is-out'));
        if (wishMsg) wishMsg.hidden = true;
        if (status) status.textContent = 'Candles relit. Blow them out again!';
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === 'letter') initLetter();
    if (page === 'celebration') initCelebration();
  });
})();