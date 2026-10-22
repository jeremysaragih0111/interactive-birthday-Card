# Interactive Birthday Card — 3D Immersive Experience

A multi-page, 3D glassmorphism birthday card built with vanilla HTML, CSS, and JavaScript.

## Pages
- `index.html` — Home / hero
- `letter.html` — 3D envelope with the letter
- `celebration.html` — Cake with interactive candles
- `create.html` — Form with live preview + shareable link

## Features
- Animated gradient + particle background
- 3D tilt cards (desktop) with touch fallback
- Open/close 3D envelope
- Interactive cake with candles + confetti
- Shareable links via URL query parameters (`?to=&message=&from=&theme=`)
- Global audio manager (play/pause/mute, persisted in `localStorage`)
- Accessible: labels, focus-visible, `aria-current`, `aria-live`, reduced-motion support
- Responsive down to 320 px

## Run locally
Because the site uses multiple HTML files and reads query params, open it via a local server:

```bash
# Python 3
python -m http.server 8000
# then visit http://localhost:8000/