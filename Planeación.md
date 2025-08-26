# MathRaining – Documento de Planeación

## 1. Resumen Ejecutivo
MathRaining será una plataforma web ligera, sin publicidad ni rastreadores, enfocada en el entrenamiento rápido de habilidades matemáticas básicas y futuras extensiones temáticas. El enfoque central es: experiencia instantánea, cero fricción, interfaz minimalista y modularidad para escalar nuevos módulos (p.ej. Aritmética, Álgebra, Fracciones, etc.).

## 2. Objetivo General
Proveer un entrenador de matemáticas rápido, privado y extensible que permita al usuario practicar operaciones y recibir retroalimentación inmediata sin distracciones.

## 3. Objetivos Específicos (Versión Inicial)
1. Implementar módulo de Aritmética básica (suma, resta, multiplicación, división configurable).
2. Cargar la aplicación en < 1s (en condiciones de red promedio) con un bundle inicial mínimo.
3. No usar cookies de rastreo ni analítica invasiva (solo métricas anónimas opcionales en futuras fases).
4. Permitir configuración de dificultad y cantidad de ejercicios por sesión.
5. Mostrar retroalimentación inmediata y marcador de progreso.

## 4. Principios de Diseño
- Minimalismo: solo elementos necesarios en pantalla.
- Velocidad: tiempos de respuesta casi instantáneos (<50ms en validación local).
- Modularidad: cada módulo aislado en un paquete de componentes reutilizables.
- Accesibilidad: soporte de teclado completo y contraste adecuado.
- Privacidad primero: sin anuncios, sin tracking externo.

## 5. Alcance Inicial (MVP)
Incluye: Landing básica, módulo Aritmética, sistema de progreso local (localStorage), selector de dificultad, UI responsiva. Excluye: autenticación, perfiles múltiples, analítica avanzada, gamificación compleja, ranking online.

## 6. Público Objetivo
Estudiantes de primaria / secundaria temprana y adultos que desean agilidad mental rápida sin registrarse ni instalar apps pesadas.

## 7. Identidad y UX
- Estilo visual: limpio, monocromático con acentos de color en logros/progreso.
- Recompensas visuales: animaciones sutiles al completar una serie correcta o un nivel configurado.
- Tipografía: Sans-serif legible (p.ej. Inter / Roboto).
- Soporte dark / light mode (fase posterior si no entra en MVP).

## 8. Arquitectura y Stack Tecnológico
- Framework principal: Svelte (última versión) para optimización de carga y reactividad.
- Componentes interactivos: Svelte para todas las partes dinámicas (ejercicios, validación, timers).
- Estado local: Svelte stores; para persistencia simple: localStorage o IndexedDB (si se requiere historial más adelante).
- Construcción / Empaquetado: Vite, sin añadir dependencias pesadas innecesarias.
- Testing: Vitest + Testing Library (plan). (Puede diferirse parcialmente si MVP corre presión de tiempo.)

## 9. Estructura Modular
Plataforma base (layout, header, footer, router ligero) + carpeta `modules/` conteniendo subcarpetas autocontenidas.

Ejemplo:
```
src/
    components/ (UI compartida)
    layouts/
    modules/
        arithmetic/
            index.tsx
            logic/ (generadores de ejercicios)
            ui/ (subcomponentes)
            tests/
```

Cada módulo exporta una interfaz estándar, p.ej.:
```ts
interface TrainingModule {
    id: string;
    title: string;
    init(config: ModuleConfig): void;
    getNextExercise(): Exercise;
    validate(answer: UserAnswer): ValidationResult;
}
```
Esto permite enchufar nuevos módulos sin tocar la plataforma base.

## 10. Primer Módulo: Aritmética
Funcionalidad:
- Generación configurable de operaciones: suma, resta, multiplicación, división.
- Rango numérico seleccionable (p.ej. 0–10, 0–100).
- Modo velocidad (cantidad fija de ejercicios) y modo práctica libre.
- Feedback inmediato (correcto/incorrecto + solución si falla tras N intentos opcional).
- Estadísticas locales: aciertos totales, precisión %, tiempo promedio.

## 11. Requisitos Funcionales
RF-01: El usuario puede seleccionar tipos de operación antes de iniciar la sesión.
RF-02: El sistema genera ejercicios aleatorios dentro del rango configurado.
RF-03: La validación se realiza localmente sin llamadas externas.
RF-04: Se muestra indicador de progreso (ejercicios completados / objetivo).
RF-05: Al terminar, se presenta resumen (aciertos, errores, tiempo estimado).
RF-06: Persistir últimas configuraciones en almacenamiento local.

## 12. Requisitos No Funcionales
- Rendimiento: LCP < 1s en red 3G rápida; interacción lista < 100ms post carga.
- Accesibilidad: Navegación por teclado; labels ARIA en campos de respuesta.
- Seguridad / Privacidad: No cookies de terceros; no tracking personal.
- Mantenibilidad: Módulos desacoplados; funciones puras para lógica de ejercicios.
- Tamaño inicial de bundle interactivo objetivo: < 50kb gzip (MVP).

## 13. Métricas de Éxito (MVP)
- Tiempo de primer interacción < 1000ms.
- Sesiones completadas / sesiones iniciadas ≥ 60%.
- Precisión promedio de usuario ≥ 70% (indicador de reto equilibrado).

## 14. Roadmap Propuesto
Fase 0 (Fundación): Setup Svelte, layout base, linting, tipado, estructura módulos.
Fase 1 (MVP Aritmética): Generación ejercicios, UI respuesta, validación, resumen.
Fase 2 (Pulido UX): Animaciones, feedback visual, accesibilidad, dark mode (si cabe).
Fase 3 (Estadísticas Locales): Historial simplificado, mejores tiempos.
Fase 4 (Nuevos Módulos): Definir segundo módulo (p.ej. Fracciones) siguiendo contrato.

## 15. Riesgos y Mitigaciones
- Sobre-ingeniería temprana: Limitar alcance MVP y aplazar features opcionales.
- Crecimiento del bundle: Uso cuidadoso de dependencias; análisis con reportes de build.
- Falta de motivación del usuario: Añadir refuerzos visuales y micro-retos en Fase 2.

## 16. Convenciones de Código
- TypeScript para lógica y componentes Svelte.
- Nombres de archivos en kebab-case para componentes y snake_case para utilidades puras si aplica.
- Pruebas: nomenclatura `*.test.ts(x)` junto a la unidad o en carpeta `tests/` del módulo.

## 17. Próximos Pasos Inmediatos
1. Inicializar repositorio y estructura base Svelte.
2. Definir interfaz `TrainingModule` y stub de módulo Aritmética.
3. Implementar generador de ejercicios (suma/resta) + validación.
4. Añadir UI mínima para flujo MVP.
5. Medir tamaño del bundle y optimizar si excede objetivo.

## 18. Notas
Este documento debe actualizarse conforme se concreten decisiones técnicas y métricas reales. Mantenerlo breve y operativo (evitar que se vuelva obsoleto).

---
Versión: 1.0 (Inicial)
Fecha: 2025-08-20
