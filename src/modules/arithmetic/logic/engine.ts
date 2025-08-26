import type { Exercise, GameEngine, ModuleConfig, ValidationResult } from '../../../lib/types'

type Cfg = Required<Pick<ModuleConfig, 'level' | 'ops' | 'range'>>

let cfg: Cfg = {
  level: 1,
  ops: ['+', '-'],
  range: [0, 10],
}

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const gen = (): Exercise => {
  const [min, max] = cfg.range
  const a = rnd(min, max)
  const b = rnd(min, max)
  const op = cfg.ops[rnd(0, cfg.ops.length - 1)]
  let prompt = `${a} ${op} ${b}`
  let answer: number
  switch (op) {
    case '+':
      answer = a + b
      break
    case '-':
      answer = a - b
      break
    case 'x':
      answer = a * b
      break
    case '/':
      // división exacta intentando b != 0
      const divisor = b === 0 ? 1 : b
      const dividend = a - (a % divisor)
      prompt = `${dividend} / ${divisor}`
      answer = dividend / divisor
      break
    default:
      answer = 0
  }
  return { prompt, answer }
}

const validate = (ex: Exercise, received: string): ValidationResult => {
  const expected = String(ex.answer)
  const norm = received.trim()
  const correct = expected === norm
  return { correct, expected, received: norm }
}

export const arithmeticEngine: GameEngine<ModuleConfig> = {
  id: 'arithmetic',
  title: 'Aritmética',
  init: (config: ModuleConfig = {}) => {
    cfg = {
      level: config.level ?? 1,
      ops: config.ops ?? ['+', '-'],
      range: config.range ?? [0, 10],
    }
  },
  next: gen,
  validate,
  timeFor: ({ level }) => Math.max(2000, 8000 - level * 500),
  keyboardLayout: () => 'numeric',
}
