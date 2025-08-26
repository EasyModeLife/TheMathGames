# Estructura de `src/`

- `app/` — shell y (futuro) router de la SPA.
- `pages/` — pantallas top‑level (Home, About, 404).
- `components/` — UI compartida reutilizable (GameFrame, Header, Subnav, etc.).
- `modules/` — cada juego con su lógica y UI encapsulada.
- `lib/` — tipos, hooks y utilidades compartidas.
- `styles/` — CSS global y temas.

Convenciones:
- Lógica del juego en `modules/<nombre>/logic/*` con un `engine.ts` que implementa `GameEngine`.
- UI del juego en `modules/<nombre>/ui/*` (p.ej., `Trainer.tsx`).
- Barrel por módulo en `modules/<nombre>/index.ts` exportando engine y componentes.
