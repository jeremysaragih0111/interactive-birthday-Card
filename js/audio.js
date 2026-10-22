/* audio.js — single global audio manager persisted via localStorage */
(function () {
  'use strict';

  const STORAGE_KEY = 'bday-audio-prefs';
  const SRC = 'assets/audio/music.mp3';

  const defaults = { muted: false, volume: 0.4, playing: false };
  let prefs = loadPrefs();
  let audio = null;
  let ui = null;
  let sfxCtx = null;

  function loadPrefs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaults };
      return { ...defaults, ...JSON.parse(raw) };
    } catch {
      return { ...defaults };
    }
  }
  function savePrefs() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch {}
  }

  function buildAudio() {
    if (audio) return;
    audio = new Audio();
    audio.src = SRC;
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = prefs.volume;
    audio.muted = prefs.muted;
    audio.addEventListener('error', () => setStatus('Audio not available'));
  }

  function setStatus(text) {
    const el = ui && ui.querySelector('.audio-status');
    if (el) el.textContent = text;
  }

  function updateButtons() {
    if (!ui) return;
    const playBtn = ui.querySelector('[data-audio="play"]');
    const muteBtn = ui.querySelector('[data-audio="mute"]');
    if (playBtn) {
      playBtn.textContent = prefs.playing ? '❚❚' : '▶';
      playBtn.setAttribute('aria-label', prefs.playing ? 'Pause music' : 'Play music');
      playBtn.setAttribute('aria-pressed', prefs.playing ? 'true' : 'false');
    }
    if (muteBtn) {
      muteBtn.textContent = prefs.muted ? '🔇' : '🔊';
      muteBtn.setAttribute('aria-label', prefs.muted ? 'Unmute music' : 'Mute music');
      muteBtn.setAttribute('aria-pressed', prefs.muted ? 'true' : 'false');
    }
  }

  async function play() {
    buildAudio();
    try {
      await audio.play();
      prefs.playing = true;
      savePrefs();
      setStatus('Playing');
    } catch (err) {
      prefs.playing = false;
      savePrefs();
      setStatus('Tap to enable audio');
    }
    updateButtons();
  }

  function pause() {
    if (!audio) return;
    audio.pause();
    prefs.playing = false;
    savePrefs();
    updateButtons();
    setStatus('Paused');
  }

  function togglePlay() {
    if (prefs.playing) pause(); else play();
  }

  function toggleMute() {
    prefs.muted = !prefs.muted;
    if (audio) audio.muted = prefs.muted;
    savePrefs();
    updateButtons();
  }

  function setVolume(v) {
    prefs.volume = Math.max(0, Math.min(1, Number(v) || 0));
    if (audio) audio.volume = prefs.volume;
    savePrefs();
  }

  /* Simple Web Audio SFX (no external files) */
  function sfx(kind) {
    try {
      if (!sfxCtx) sfxCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (sfxCtx.state === 'suspended') sfxCtx.resume();
      const now = sfxCtx.currentTime;
      const osc = sfxCtx.createOscillator();
      const gain = sfxCtx.createGain();
      osc.connect(gain).connect(sfxCtx.destination);

      if (kind === 'open') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.start(now); osc.stop(now + 0.45);
      } else if (kind === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.start(now); osc.stop(now + 0.2);
      } else if (kind === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659, now);
        osc.frequency.setValueAtTime(988, now + 0.12);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.start(now); osc.stop(now + 0.55);
      }
    } catch { /* audio context not available */ }
  }

  function mount(container) {
    if (!container) return;
    ui = container;
    ui.innerHTML = `
      <button class="audio-btn" data-audio="play" type="button" aria-label="Play music" aria-pressed="false">▶</button>
      <button class="audio-btn" data-audio="mute" type="button" aria-label="Mute music" aria-pressed="false">🔊</button>
      <span class="audio-status" aria-live="polite">Tap ▶ to enable music</span>
    `;
    ui.querySelector('[data-audio="play"]').addEventListener('click', togglePlay);
    ui.querySelector('[data-audio="mute"]').addEventListener('click', toggleMute);
    updateButtons();
  }

  // Try to restore playback only if the user previously enabled it.
  // Must wait for a user gesture to satisfy autoplay policies.
  function tryRestore() {
    if (!prefs.playing) return;
    setStatus('Tap ▶ to resume');
    const onGesture = () => {
      document.removeEventListener('pointerdown', onGesture);
      document.removeEventListener('keydown', onGesture);
      play();
    };
    document.addEventListener('pointerdown', onGesture, { once: true });
    document.addEventListener('keydown', onGesture, { once: true });
  }

  window.AudioManager = { mount, play, pause, togglePlay, toggleMute, setVolume, sfx, tryRestore, prefs: () => ({ ...prefs }) };

  document.addEventListener('DOMContentLoaded', () => {
    mount(document.getElementById('audio-controls'));
    tryRestore();
  });
})();