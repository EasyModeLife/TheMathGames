import type { Exercise, GameEngine, ModuleConfig, ValidationResult } from '../../../lib/types'

type Cfg = Required<Pick<ModuleConfig, 'level'>>

let cfg: Cfg = {
  level: 1,
}

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

// Generador de ejercicios de derivadas simples: d/dx(ax^n)
const gen = (): Exercise => {
  const n = rnd(1, 3 + cfg.level) // Potencia
  const a = rnd(1, 5 + cfg.level) // Coeficiente

  // Formateo del prompt
  const promptA = a === 1 ? '' : String(a)
  const promptN = n === 1 ? '' : `^${n}`
  const prompt = `d/dx (${promptA}x${promptN})`

  // Cálculo de la respuesta
  const newCoeff = a * n
  const newExp = n - 1
  let answer = ''
  if (newExp === 0) {
    answer = String(newCoeff)
  } else if (newExp === 1) {
    answer = `${newCoeff}x`
  } else {
    answer = `${newCoeff}x^${newExp}`
  }

  return { prompt, answer, meta: { math: true } }
}


const validate = (ex: Exercise, received: string): ValidationResult => {
  const expected = String(ex.answer)
  // Normaliza la respuesta: quita espacios, convierte 'x^1' a 'x'
  const norm = received.trim().replace(/\\s+/g, '').replace(/\*x/g, 'x').replace(/\^1/g, '')
  const correct = expected === norm
  return { correct, expected, received: norm }
}

export const calculusEngine: GameEngine<ModuleConfig> = {
  id: 'calculus',
  title: 'Cálculo',
  init: (config) => {
    cfg = {
      level: config?.level ?? 1,
    }
  },
  next: gen,
  validate,
  timeFor: ({ level }) => Math.max(4000, 12000 - level * 500),
  keyboardLayout: () => ({
    rows: [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      ['x', 'y', '^', '0'],
    ]
  }),
}
