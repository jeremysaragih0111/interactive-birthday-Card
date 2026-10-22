/* navigation.js — active nav link + smooth page transitions */
(function () {
  'use strict';

  function markActive() {
    const page = document.body.getAttribute('data-page');
    document.querySelectorAll('.nav-link[data-nav]').forEach((link) => {
      const key = link.getAttribute('data-nav');
      if (key === page) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function fadePage() {
    const main = document.getElementById('main-content') || document.querySelector('main');
    if (!main) return;
    main.classList.add('fade-up');
  }

  document.addEventListener('DOMContentLoaded', () => {
    markActive();
    fadePage();
  });
})();