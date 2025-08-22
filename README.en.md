# The Math Games (Svelte)

A lightweight, ad-free, and modular math trainer. Rewritten version with Svelte + Vite.

## Current Stack
- Svelte 4
- Vite
- TypeScript

## Development
Install dependencies and run:

```
npm run dev
```

Vite usually opens at: http://localhost:5173

## Structure
```
src/
  App.svelte         # Configuration + trainer setup
  Trainer.svelte     # Exercise logic and flow
  main.ts            # Bootstrap
  style.css          # Base styles
```

## Current Features
- Operation selection (+ - x /)
- Range and quantity configuration
- Exact division generation
- Automatic validation and immediate progress
- Summary with correct answers, accuracy, and time

## Proposed Next Steps
- Persist configuration in localStorage
- Session history (last N)
- Infinite practice mode
- Optional error animations and sounds
- Weighted operations / progressive difficulty
- Additional modules (fractions, powers)

## Donations

If you want to help me continue and maintain this type of project, you can support me at [https://ko-fi.com/hugoandresamayachairez](https://ko-fi.com/hugoandresamayachairez).

## License

This project is under the MIT License. Please, if you use it, give the corresponding credit to the original repository.
