# retro flip flaps

Open-source retro split-flap display simulator for the browser with mechanical 3D flap animation, synchronized click audio, dark mode, and custom message control.

## Demo

Project page: [retro-flip-flaps](https://github.com/greedfinanace/retro-flip-flaps)

Creator links:

- GitHub: [greedfinanace](https://github.com/greedfinanace)
- X: [@greedinfinance](https://x.com/greedinfinance)
- LinkedIn: [rasheen-ak-b60174212](https://www.linkedin.com/in/rasheen-ak-b60174212/)

## Overview

This project recreates the feel of a physical split-flap board in the browser. It uses a custom React and TypeScript implementation for the flap structure, shuffle logic, audio timing, and board sequencing. There are no prebuilt split-flap libraries in the rendering path.

## Features

- 3D split-flap tiles built from custom DOM structure and CSS transforms
- Randomized shuffle cycles with staggered settle timing
- Web Audio API click playback for dense concurrent flap activity
- Dark mode and light mode
- Adjustable tile speed control
- Custom message composer with character limit
- Crypto tip panel with copy buttons
- Reference-inspired board styling and typography

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- lucide-react
- Native Web Audio API

## Local development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Controls

- Use the custom message textarea to send your own text to the board
- Use the tile speed slider to slow down or speed up the flap behavior
- Click once anywhere on the page if your browser blocks audio on first load
- Open the tip panel to copy BTC, ETH, SOL, XRP, or TRON addresses

## Project structure

```text
src/
  components/
    flap/
  hooks/
  lib/
  utils/
public/
  audio/
```

## Notes

- The board uses balanced line wrapping so words do not split awkwardly across rows
- Audio is triggered at the midpoint of the flip for tighter mechanical sync
- The app is designed as a single-page browser showcase rather than a SaaS landing page
