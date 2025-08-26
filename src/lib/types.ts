// Tipos y contratos compartidos para motores de juego y sesiones

export interface Exercise {
  prompt: string
  answer: string | number
  meta?: Record<string, unknown>
}

export type Op = "+" | "-" | "x" | "/"

export interface ModuleConfig {
  level?: number
  ops?: Op[]
  range?: [number, number]
  total?: number // cantidad de ejercicios (modo juego)
}

export interface ValidationResult {
  correct: boolean
  expected: string
  received: string
}

// Motor genérico independiente de UI
export interface GameEngine<Config = unknown, Ex = Exercise, Result = ValidationResult> {
  id: string
  title: string
  init: (config: Config) => void
  next: () => Ex
  validate: (ex: Ex, received: string) => Result
  timeFor?: (ctx: { level: number; ex?: Ex }) => number
  keyboardLayout?: (ctx: { ex?: Ex }) => 'numeric' | 'calc' | { rows: string[][] }
}

export interface SessionState {
  level: number
  total: number
  correct: number
  startedAt?: number
  current?: Exercise
  elapsedMs: number
  lastAnswerMs?: number
  history: Array<{ ex: Exercise; received: string; correct: boolean; ms: number }>
}
