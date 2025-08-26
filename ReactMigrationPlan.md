# MathRaining — Plan de migración a React (Vite + TS)

## Objetivo
Migrar la SPA actual en Svelte a React 18 + Vite + TypeScript sin perder funcionalidades ni rendimiento, manteniendo: Aritmética, Cálculo, HowTo, About, router con submenús, carga perezosa, KaTeX, theming y UX móvil/desktop (un solo header, subnav pegado).

## Decisiones de stack
- React 18 + Vite + TypeScript.
- Router: React Router v6.27+ (nested routes, loaders opcionales) o TanStack Router. Propuesta: React Router.
- Estado: Context + hooks; reducers por módulo de juego; persistencia ligera en localStorage.
- Estilos: CSS con variables (reusar `styles/themes.css`); CSS Modules o CSS-in-JS opcional para piezas locales.
- KaTeX: `katex` + CSS global; render via `dangerouslySetInnerHTML` en componente `Math`.

## Arquitectura de carpetas
```
src/
  app/
    App.tsx           # shell (layout base)
    router.tsx        # definición de rutas, lazy imports y prefetch onIdle
  pages/
    Home.tsx
    About.tsx
  modules/
    arithmetic/
      logic/          # gen, timeFor, validación
      Trainer.tsx
      HowTo.tsx
      index.ts        # contrato/exports
      styles/
    calculus/
      logic/
      Trainer.tsx
      HowTo.tsx
  components/
    Header.tsx        # back + menú móvil; desktop con acciones inline
    Subnav.tsx        # Game / Practice / Learning / HowTo
    GameFrame.tsx     # layout común: progress + enunciado + input
    ProblemDisplay.tsx# auto-fit / multilínea (medición via refs)
    LevelProgress.tsx
    FloatingJudgement.tsx
    SpeedStats.tsx
    Math.tsx
    ThemeSwitcher.tsx
  styles/
    themes.css        # reusar del proyecto actual
    globals.css       # reset + base + tokens
  lib/
    theme.ts          # ThemeContext, applyTheme, persistencia
    hooks/            # useIdlePrefetch, useLocalStorage, useKeyDown
    utils/            # normalización cálculo, helpers genéricos
```

## Contrato de módulo (interfaces)
```ts
export interface Exercise { prompt: string; answer: string | number; meta?: Record<string, unknown>; }
export interface ModuleConfig { level?: number; ops?: ("+"|"-"|"x"|"/")[]; range?: [number, number]; }
export interface ValidationResult { correct: boolean; expected: string; received: string; }
export interface TrainingModule {
  id: string;
  title: string;
  init: (config?: ModuleConfig) => void;
  gen: () => Exercise;
  validate: (received: string) => ValidationResult;
}
```

## Lógica independiente (Engine) y UI compartida (Pregunta/Respuesta)
Objetivo: que la lógica de cada juego sea intercambiable y la UI de Pregunta/Respuesta sea única y reusable.

### API de Engine (capa core, sin UI)
```ts
export interface GameEngine<Config = unknown, Ex = Exercise, Result = ValidationResult> {
  id: string;
  title: string;
  init: (config: Config) => void;
  next: () => Ex;                           // genera el siguiente ejercicio
  validate: (ex: Ex, received: string) => Result; // valida una respuesta
  timeFor?: (ctx: { level: number; ex?: Ex }) => number; // ms por ejercicio (opcional)
  keyboardLayout?: (ctx: { ex?: Ex }) => 'numeric' | 'calc' | { rows: string[][] }; // móvil
}

export interface SessionState {
  level: number;
  total: number;
  correct: number;
  startedAt?: number;        // performance.now()
  current?: Exercise;        // ejercicio actual
  elapsedMs: number;         // acumulado sesión
  lastAnswerMs?: number;     // tiempo del último reactivo
  history: Array<{ ex: Exercise; received: string; correct: boolean; ms: number }>; // trazas
}
```

Implementaciones (arithmetic/calculus) deben exponer `GameEngine` y permanecer puramente funcionales (sin efectos en UI). Cualquier normalización (p.ej., Cálculo) vive dentro del engine.

### UI compartida: QAShell (Pregunta/Respuesta)
Componente común que orquesta: enunciado, entrada, temporizador, progreso y feedback.

```ts
// Props principales
interface QAShellProps<E extends GameEngine> {
  engine: E;                         // motor de juego inyectado
  mode: 'game' | 'practice';         // afecta tiempo/flujo
  onFinish?: (state: SessionState) => void; // callback fin de sesión
}
```

QAShell compone:
- ProblemDisplay: render del enunciado (texto o KaTeX) con auto-fit/multilínea.
- AnswerArea: 
  - Desktop: input de texto + atajos Enter/Backspace.
  - Móvil: MobileKeyboard con layout de `engine.keyboardLayout()`.
- Timer: cuenta regresiva por ejercicio si `timeFor` existe; usa performance.now para precisión.
- LevelProgress/SpeedStats: aciertos, precisión, promedio de tiempo.
- FloatingJudgement: feedback correcto/incorrecto.

Flujo:
1) onMount → `engine.init(config)` → `next()` → set `current`.
2) Usuario responde → medir delta con performance.now → `engine.validate(current, received)`.
3) Actualizar `SessionState` (total, correct, lastAnswerMs, history).
4) Si modo "game" y hay tiempo/límite → `next()`; si termina → `onFinish`.

### Precisión y tiempo
- Reloj: `performance.now()` (monotónico) para ms por respuesta y acumulados.
- Precisión: `accuracy = correct / total` (mostrar % con 0–1 decimales).
- Velocidad media: `avgMs = sum(history.ms) / history.length`.
- Tiempo por ejercicio: `engine.timeFor({ level, ex })` en ms cuando exista; countdown visual.
- Evitar errores de coma flotante en Aritmética: preferir enteros; divisiones exactas.
- Cálculo: pipeline de normalización (espacios, unicode, `\bigl/\bigr`, mayúsculas), comparación relajada configurable.

### Hooks sugeridos
- `useSessionEngine(engine, mode)` → maneja `SessionState`, next/submit/reset.
- `useTimer(enabled, budgetMs)` → expone `remainingMs` y dispara submit en 0.
- `useLocalStorage(key, state)` → persistencia ligera de opciones.

### Métricas y almacenamiento
- Guardar en localStorage último estado básico (nivel, precisión, avgMs) por módulo.
- No tracking externo.

## Rutas
- "/" → Home (tarjetas de módulos)
- "/arithmetic/:view(game|practice|learning|howto)"
- "/calculus/:view(game|practice|learning|howto)"
- "/about"
- 404 simple

Cargar con React.lazy + Suspense por módulo (Arithmetic, Calculus, About, HowTo). Prefetch onIdle para evitar “Cargando…” prolongado.

## Layout, Header y Subnav (UX)
Principio: Todo vive dentro de una única "box" principal que ocupa el 100% del viewport; los elementos se van acomodando dentro.

- Header: altura fija del 8% del viewport (min 56px, max 84px aprox.). Rectangular, sin bordes ni redondeos.
  - Desktop: muestra acciones inline (Donar, GitHub, About, Tema) a la derecha; sin botón "Menú".
  - Móvil: oculta las acciones; aparece un botón "Menú" en el mismo renglón que "←" dentro del header; el menú despliega esas acciones.
- Menú de selección de categorías (Home): dentro de una box (contenedor) que se ajusta al ancho; mantiene el comportamiento actual de tarjetas/botones, pero siempre dentro de esa box.
- Submenú por categoría (al entrar a Aritmética/Cálculo): aparece inmediatamente debajo del header, sin espacio. Siempre en un solo renglón; en móvil es deslizable lateralmente (scroll-x), en desktop se ve completo.
- Caja del problema: debajo del submenú; flexible y adaptable al dispositivo (auto-fit y multilínea donde aplique). Debajo va la entrada de respuesta.
  - Móvil: la entrada será un teclado simulado con los caracteres necesarios según el tipo de problema (por ejemplo, numérico para aritmética; símbolos extra para cálculo). 
  - Desktop: entrada de texto estándar con teclado físico.

## Componentes clave (contratos breves)
- Header
  - Props: `path: string`, `onBack(): void`
  - Comportamiento: ocupa ~8% vh; en desktop renderiza acciones inline; en móvil muestra botón "Menú" y dropdown con Donar/GitHub/About/Tema; comparte la misma fila que el botón de back.
- Subnav
  - Props: `base: "/arithmetic" | "/calculus"`, `current: string`, `onNavigate(path: string)`
  - Comportamiento: renglón único; scroll-x en móvil; pegado al header (sin margen superior) y dentro de la box principal.
- GameFrame
  - Props: `{ children, header?: ReactNode }` o `{ renderInput }`; expone área para ProblemDisplay (caja flexible) y controles.
- ProblemDisplay
  - Props: `{ text?: string, mathExpr?: string, multiline?: boolean }`
  - Lógica: medir caja con ref; calcular escala; permitir 1–2 líneas en Cálculo.
 - MobileKeyboard
   - Props: `{ layout: 'numeric' | 'calc' | 'custom', onInput: (ch: string) => void, onBackspace: () => void, onSubmit?: () => void }`
   - Comportamiento: teclado virtual para móvil; layout por tipo de problema; visible sólo en pantallas pequeñas.

## Theming
- ThemeContext con `theme: 'ocean' | 'dark' | 'light'`, `setTheme(t)`.
- Aplica `data-theme` en `<html>`; persiste en localStorage.

## Lógica de juego
- Reducer por módulo: `{ startedAt, elapsed, streak, level, correct, total }`.
- Arithmetic: `gen()` respeta rangos y divisiones exactas; `timeFor(level)`.
- Calculus: normalización de entrada (espacios, símbolos, `\bigl/\bigr`), comparación básica.

## Rendimiento
- Code-splitting por rutas, lazy + Suspense.
- Prefetch con `requestIdleCallback`.
- Evitar render loops en ProblemDisplay (medir solo si cambió el enunciado o tamaño).

## Accesibilidad
- Focus-visible, aria-live="polite" para feedback, roles correctos de menú y subnav.
- Escape para volver al Home.

## Plan por fases
1. Bootstrap React en carpeta `react/` dentro del repo (Vite + TS).
2. Copiar `styles/themes.css` y crear `styles/globals.css`.
3. Implementar `App.tsx`, `router.tsx`, `Header.tsx` (8% vh + dropdown móvil), `Subnav.tsx` (renglón único + scroll-x en móvil), `Home.tsx` (categorías dentro de box), `About.tsx` (placeholders funcionales, responsive básico).
4. Portar `Math.tsx` con KaTeX y CSS global.
5. Portar `GameFrame.tsx` (caja de problema flexible) y `ProblemDisplay.tsx` con medición/auto-fit.
6. Portar Arithmetic (logic + Trainer + HowTo) y sus estilos.
7. Portar Calculus (logic + Trainer + HowTo) y sus estilos.
8. Añadir lazy loading + prefetch onIdle y ThemeContext.
9. Implementar `MobileKeyboard` y selección de layout por módulo.
10. QA responsive (360/375/414/768/1024/1366) y a11y; smoke tests.
11. Retirar Svelte/astro o mantener en rama.

## Backlog de tareas
Actualizado a 2025-08-25

- [x] Bootstrap React + TS con Vite en raíz del repo
- [x] Copiar `styles/themes.css` y crear `globals.css`
- [x] Router + layout base (AppShell), header, subnav pegado y sin duplicación
- [ ] Header móvil con dropdown (pendiente)
- [ ] Ajustar header a ~8% vh (pendiente)
- [ ] KaTeX + componente Math (pendiente)
- [ ] GameFrame (caja flexible) + ProblemDisplay con auto-fit/multilínea (parcial: caja simple)
- [x] Arithmetic (gen, timeFor, UI base) con Practice/Game compartiendo UI
- [x] Calculus (engine básico derivadas, UI base)
- [x] Lazy routing con React.lazy + Suspense
- [ ] Prefetch onIdle (pendiente)
- [ ] ThemeContext formal (parcial: ThemeSwitcher + localStorage)
- [x] MobileKeyboard básico por módulo (numeric/calc)
- [ ] QA/a11y pulidos (parcial: aria-live, focus y estados por mejorar)

### División de tareas (Copilot vs Gemini)

Copilot
- Subnav/UX: asegurar scroll-x móvil y estado activo; evitar duplicación (hecho).
- Header: quitar About del menú principal de categorías (hecho); implementar dropdown móvil (pendiente).
- Theming: mejorar ThemeSwitcher (iconos, prefers-color-scheme) y formalizar ThemeContext (pendiente).
- Router: redirecciones base a `/game` (hecho); prefetch onIdle (pendiente).
- Pages: estilizar About/404/Stats de forma consistente (parcial); tipografía/espaciado (hecho básico).
- Accesibilidad: focus management tras submit, desactivar OK con input vacío (pendiente).
- ProblemDisplay: empezar auto-fit simple y multilínea para textos largos (pendiente).

Gemini
- QAShell: integración completa de teclado móvil (hecho), aria-live (hecho), mejorar feedback visual (verde/rojo, sin layout shift) (pendiente).
- Practice: panel de configuración (ops/rango) visible solo en Practice (hecho); añadir “total” configurable y persistente (pendiente).
- Summary: pantalla/resumen fin de sesión con accuracy y avg ms; persistir stats locales (pendiente).
- HowTo: contenido por módulo (Arithmetic/Calculus) y ruta “howto” (pendiente).
- KaTeX: integrar en `Math.tsx` y usar en `ProblemDisplay` cuando haya expresiones (pendiente).

Notas
- Priorizar usabilidad móvil (teclado, focus, botones grandes) y a11y.
- Mantener single-box layout; Subnav debajo del header, sin saltos.

## Riesgos
- Diferencias en medición del texto: encapsular en un hook y validar con casos largos.
- Tamaño del bundle inicial: mantener lazy, evitar libs pesadas.
- Manejo de timers y efectos: limpiar siempre en unmount; usar refs para intervalos.
