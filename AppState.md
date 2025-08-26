# App State — MathRaining (2025-08-25)

Este documento resume el estado actual funcional y técnico de la aplicación, más una división de tareas inmediata para continuar el desarrollo.

## Estado funcional
- Home: tarjetas para Aritmética, Cálculo y About dentro del layout de “una caja”.
- Navegación: React Router con rutas perezosas; redirección base de cada módulo a `/game`.
- Shell/Layout: `AppShell` provee Header y Subnav único pegado debajo del Header; sin duplicación en páginas.
- Temas: selector de tema inline (light/dark/ocean) persistido en localStorage; variables en `themes.css` (incluye success/error).
- Aritmética: engine con +, -, x, /; rango configurable; `timeFor` por nivel.
- Cálculo: engine básico (derivadas d/dx(ax^n)), normalización simple; teclado tipo ‘calc’.
- Entrenador común: `QAShell` orquesta enunciado, entrada, timer, progreso, velocidad; `MobileKeyboard` en pantallas pequeñas.
- Game vs Practice: comparten UI; Practice muestra panel de configuración (ops/rango); Game lo oculta.
- Accesibilidad: aria-live con feedback “Correcto/Incorrecto”; focus vuelve al input tras enviar; botones/inputs etiquetados.
- Sesiones: al finalizar juego se guardan entradas básicas en localStorage (`math-trainer-sessions`).

## Estado técnico
- Stack: React + TS + Vite; React Router v6; CSS variables para theming.
- Estructura: módulos separados en `modules/<modulo>/{logic,ui}`; componentes compartidos en `components/`.
- KaTeX: componente `Math` presente; `ProblemDisplay` soporta `exercise` con flag `meta.math` para render matemático.
- Estilos globales: `globals.css` + `themes.css`; tokens para box, pill, success/error.
- Build: verificado; sin errores de tipo.

## Áreas pendientes y riesgos
- Header móvil: dropdown básico listo; falta pulir interacción (cerrar al navegar fuera, animación, foco inicial).
- ProblemDisplay: auto-fit/responsive de enunciados largos y multilínea (actualmente tamaño fijo base).
- Resumen de sesión: pantalla post‑juego con accuracy y promedio; botón “Reintentar” y/o “Cambiar configuración”.
- Config extra: “total” configurable y persistente en Practice; validación de rango (min <= max).
- Prefetch onIdle: evitar flashes de Suspense en primeras navegaciones.
- ThemeContext: formalizar contexto (hoy uso de hook con localStorage funciona pero puede centralizarse).
- HowTo: contenido específico por módulo (vistas ya están enroutadas, placeholders en páginas).

## División de tareas (corto plazo)

Copilot
- Header móvil: cerrar dropdown al cambiar de ruta y al perder foco; pequeña animación CSS.
- Prefetch onIdle para About/Arithmetic/Calculus (react-router lazy hints o rIC manual).
- ProblemDisplay: primer paso de auto-fit (medir ancho contenedor, clamp de font-size, hasta 2 líneas).
- ThemeContext: envolver app con proveedor y exponer `useTheme` desde contexto.
- Accesibilidad: manejar focus tras fin de sesión (llevar al primer botón del resumen) y roles en Subnav.

Gemini
- QAShell: “total” configurable (slider o input) en Practice, persistente por módulo; pasar a Game si se desea.
- SessionSummary: mostrar resumen y permitir “Play Again”/“Change Settings”; persistir estadísticas básicas.
- HowTo: redactar y renderizar HowTo para Aritmética y Cálculo.
- KaTeX/Math: casos de prueba y ejemplos largos; fallback seguro cuando falla el parseo.

## Próximos hitos
1) Resumen de sesión + total configurable (mejora inmediata de experiencia de juego).
2) Auto‑fit del enunciado para robustecer UX en móvil.
3) Prefetch onIdle para navegaciones fluidas.

