/* birthday-card.js — read/write card data from URL params across pages */
(function () {
  'use strict';

  const PARAM_TO = 'to';
  const PARAM_MSG = 'message';
  const PARAM_FROM = 'from';
  const PARAM_THEME = 'theme';
  const VALID_THEMES = ['dreamy', 'rose', 'ocean', 'gold'];
  const DEFAULTS = {
    to: 'Friend',
    message: 'Happy Birthday! May this year bring you joy, magic, and everything you wish for.',
    from: 'Someone who cares',
    theme: 'dreamy'
  };

  function readData() {
    const p = new URLSearchParams(window.location.search);
    const to = sanitize(p.get(PARAM_TO)) || DEFAULTS.to;
    const message = sanitize(p.get(PARAM_MSG)) || DEFAULTS.message;
    const from = sanitize(p.get(PARAM_FROM)) || DEFAULTS.from;
    let theme = (p.get(PARAM_THEME) || DEFAULTS.theme).toLowerCase();
    if (!VALID_THEMES.includes(theme)) theme = DEFAULTS.theme;
    return { to, message, from, theme };
  }

  // Render user text as text content — never as HTML.
  function sanitize(value) {
    if (value == null) return '';
    return String(value).replace(/\s+/g, ' ').trim().slice(0, 240);
  }

  function buildShareUrl(data, baseUrl) {
    const url = new URL(baseUrl || (window.location.origin + window.location.pathname), window.location.href);
    url.searchParams.set(PARAM_TO, data.to);
    url.searchParams.set(PARAM_MSG, data.message);
    url.searchParams.set(PARAM_FROM, data.from);
    url.searchParams.set(PARAM_THEME, data.theme);
    return url.toString();
  }

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme || DEFAULTS.theme);
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ---------- Page-specific bindings ---------- */
  function bindLetterPage(data) {
    setText('letter-to', data.to);
    setText('letter-message', data.message);
    setText('letter-from', data.from);
  }

  function bindCelebrationPage(data) {
    setText('celebration-title', 'Make a Wish, ' + data.to + '!');
  }

  function bindCreatePage(data) {
    const form = document.getElementById('card-form');
    if (!form) return;

    // Prefill from URL if present
    const $to = form.querySelector('#to');
    const $msg = form.querySelector('#message');
    const $from = form.querySelector('#from');
    const $share = document.getElementById('share-link');
    const $status = document.getElementById('form-status');
    const $count = document.getElementById('message-count');
    const $copy = document.getElementById('copy-link');
    const $open = document.getElementById('open-link');
    const $reset = document.getElementById('reset-form');

    $to.value = data.to === DEFAULTS.to ? '' : data.to;
    $msg.value = data.message === DEFAULTS.message ? '' : data.message;
    $from.value = data.from === DEFAULTS.from ? '' : data.from;
    const themeRadio = form.querySelector(`input[name="theme"][value="${data.theme}"]`);
    if (themeRadio) themeRadio.checked = true;

    // Preview updater
    const previewTo = document.getElementById('preview-to');
    const previewMsg = document.getElementById('preview-message');
    const previewFrom = document.getElementById('preview-from');

    function updatePreview() {
      const to = $to.value.trim() || DEFAULTS.to;
      const msg = $msg.value.trim() || DEFAULTS.message;
      const from = $from.value.trim() || DEFAULTS.from;
      previewTo.textContent = to;
      previewMsg.textContent = msg;
      previewFrom.textContent = from;
      $count.textContent = $msg.value.length;
      const theme = (form.querySelector('input[name="theme"]:checked') || {}).value || 'dreamy';
      applyTheme(theme);
    }
    ['input', 'change'].forEach((ev) => form.addEventListener(ev, updatePreview));
    updatePreview();

    let currentUrl = '';

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const to = $to.value.trim();
      const msg = $msg.value.trim();
      const from = $from.value.trim();
      if (!to || !msg || !from) {
        $status.textContent = 'Please fill in all fields.';
        return;
      }
      const theme = (form.querySelector('input[name="theme"]:checked') || {}).value || 'dreamy';
      const base = new URL('letter.html', window.location.href).toString();
      currentUrl = buildShareUrl({ to, message: msg, from, theme }, base);
      $share.value = currentUrl;
      $open.href = currentUrl;
      $status.textContent = 'Link ready. Copy and share it!';
      try { localStorage.setItem('bday-card-last', JSON.stringify({ to, message: msg, from, theme })); } catch {}
    });

    $copy.addEventListener('click', async () => {
      if (!currentUrl) {
        $status.textContent = 'Generate a link first.';
        return;
      }
      try {
        await navigator.clipboard.writeText(currentUrl);
        $status.textContent = 'Link copied to clipboard ✓';
      } catch {
        // Fallback: select the input
        $share.select();
        $status.textContent = 'Press Ctrl/Cmd + C to copy the selected link.';
      }
    });

    $reset.addEventListener('click', () => {
      form.reset();
      $to.value = '';
      $msg.value = '';
      $from.value = '';
      $share.value = '';
      currentUrl = '';
      $status.textContent = '';
      updatePreview();
    });

    // Restore from previous session, if any
    try {
      const last = JSON.parse(localStorage.getItem('bday-card-last') || 'null');
      if (last && !$to.value && !$msg.value && !$from.value) {
        $to.value = last.to; $msg.value = last.message; $from.value = last.from;
        const r = form.querySelector(`input[name="theme"][value="${last.theme}"]`);
        if (r) r.checked = true;
        updatePreview();
      }
    } catch {}
  }

  function boot() {
    const data = readData();
    applyTheme(data.theme);
    const page = document.body.getAttribute('data-page');
    if (page === 'letter') bindLetterPage(data);
    if (page === 'celebration') bindCelebrationPage(data);
    if (page === 'create') bindCreatePage(data);
  }

  window.BirthdayCard = { readData, buildShareUrl, applyTheme };

  document.addEventListener('DOMContentLoaded', boot);
})();