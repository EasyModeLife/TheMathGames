# The Math Games – Planning Document (EN)

## 1. Executive Summary
The Math Games is a lightweight, ad-free, tracker-free web platform focused on fast practice of basic math skills with future themed extensions. Core principles: instant experience, zero friction, minimalist UI, and modularity to scale new modules (e.g., Arithmetic, Algebra, Fractions).

## 2. General Goal
Provide a fast, privacy-first, and extensible math trainer enabling users to practice operations and receive immediate feedback without distractions.

## 3. Initial Objectives (MVP)
1. Implement basic Arithmetic module (addition, subtraction, multiplication, exact-division configurable).
2. Load in < 1s (average network) with a minimal initial bundle.
3. No tracking cookies or invasive analytics (optional anonymous metrics in later phases).
4. Allow difficulty and amount configuration per session.
5. Show immediate feedback and progress indicator.

## 4. Design Principles
- Minimalism: only necessary elements on screen.
- Speed: near‑instant response times (<50ms for local validation).
- Modularity: each module packaged with reusable components.
- Accessibility: full keyboard support and adequate contrast.
- Privacy first: no ads, no external tracking.

## 5. Initial Scope (MVP)
Includes: basic landing, Arithmetic module, local progress (localStorage), difficulty selector, responsive UI. Excludes: authentication, multi-profiles, advanced analytics, heavy gamification, online ranking.

## 6. Target Audience
Elementary/middle-school students and adults seeking quick mental agility practice without signups or heavy apps.

## 7. Identity and UX
- Visual style: clean with color accents for progress/achievements.
- Visual rewards: subtle animations when completing a streak/level.
- Typography: readable sans-serif (e.g., Inter / Roboto).
- Optional dark/light mode in later phase.

## 8. Architecture & Tech Stack
- Main framework: Svelte (latest) for load optimization and reactivity.
- Interactive components: Svelte for exercises, validation, timers.
- Local state: Svelte stores; simple persistence: localStorage or IndexedDB for history later.
- Build: Vite with minimal deps.
- Testing: Vitest + Testing Library (planned).

## 9. Modular Structure
Base platform (layout, header, footer, light router) + `modules/` with self-contained folders.

Example:
```
src/
  components/
  layouts/
  modules/
    arithmetic/
      index.tsx
      logic/
      ui/
      tests/
```
Each module exports a standard interface, e.g.:
```ts
interface TrainingModule {
  id: string;
  title: string;
  init(config: ModuleConfig): void;
  getNextExercise(): Exercise;
  validate(answer: UserAnswer): ValidationResult;
}
```

## 10. First Module: Arithmetic
- Configurable generation: +, -, x, /
- Selectable ranges (e.g., 0–10, 0–100)
- Speed mode (fixed amount) and free practice
- Immediate feedback (correct/incorrect)
- Local stats: total correct, accuracy %, avg time

## 11. Non‑Functional Requirements
- Performance: LCP < 1s on fast 3G; interaction ready < 100ms post load.
- Accessibility: keyboard navigation; ARIA labels for inputs.
- Privacy/Security: no third‑party cookies; no personal tracking.
- Maintainability: decoupled modules; pure functions for logic.
- Initial interactive bundle target: < 50kb gzip (MVP).

## 12. Success Metrics (MVP)
- Time to first interaction < 1000ms.
- Completed sessions / started sessions ≥ 60%.
- Average user accuracy ≥ 70%.

## 13. Roadmap (High‑level)
- F0 (Foundation): Svelte setup, base layout, typing, modules structure.
- F1 (MVP Arithmetic): generators, UI input, validation, summary.
- F2 (UX polish): animations, visual feedback, a11y, optional dark mode.
- F3 (Local Stats): simple history, best times.
- F4 (New Modules): define/ship second module (e.g., Fractions).

## 14. Code Conventions
- TypeScript for logic and Svelte components.
- Kebab‑case for component files; snake_case for pure utilities if needed.
- Tests: `*.test.ts(x)` colocated or in `tests/`.

---
Version: 1.0 (EN)
Date: 2025‑08‑21
