# The Math Games (Svelte)

A lightweight, ad‑free, and modular math trainer. Rewritten with Svelte + Vite.

## Tech Stack
- Svelte 4
- Vite
- TypeScript

## Development
Install dependencies and start the dev server:

```
npm run dev
```

Vite usually serves at: http://localhost:5173

## Structure
```
src/
  App.svelte         # App shell + routing
  Trainer.svelte     # Core training logic and flow
  main.ts            # Bootstrap
  style.css          # Base styles
```

## Current Features
- Operation selection (+ - x /)
- Range and total configuration
- Exact-division generation
- Auto validation with immediate advance
- Per-question timer with first-question grace
- Level progress with penalties on timeout

## Next Steps (Proposed)
- Persist configuration in localStorage
- Session history (last N)
- Infinite practice mode
- Optional error animations and sounds
- Weighted operations / progressive difficulty
- Additional modules (fractions, powers)

## Donations
If you want to help me continue and maintain this kind of projects, you can support me at [https://ko-fi.com/hugoandresamayachairez](https://ko-fi.com/hugoandresamayachairez).

## License
This project is under the MIT License. Please give proper credit to the original repository if you use it.
# TheMathGames
