export interface ModuleConfig {
  operations: Array<'+' | '-' | 'x' | '/'>;
  range: [number, number];
  total?: number; // número de ejercicios objetivo (opcional para modo libre)
}

export interface Exercise {
  id: string;
  a: number;
  b: number;
  op: '+' | '-' | 'x' | '/';
  question: string;
  answer: number;
}

export interface ValidationResult {
  correct: boolean;
  expected: number;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class ArithmeticModule {
  private config: ModuleConfig;
  private generated = 0;

  constructor(config: ModuleConfig) {
    this.config = config;
  }

  getNext(): Exercise {
    const [min, max] = this.config.range;
    const op = this.config.operations[Math.floor(Math.random() * this.config.operations.length)];
    let a = randomInt(min, max);
    let b = randomInt(min, max);
    if (op === '/' ) {
      // asegurar división exacta simple evitando decimales por ahora
      b = b === 0 ? 1 : b;
      const result = randomInt(min, max);
      a = result * b;
    }
    const answer = op === '+' ? a + b
      : op === '-' ? a - b
      : op === 'x' ? a * b
      : a / b;
    const ex: Exercise = {
      id: `${Date.now()}-${this.generated}`,
      a, b, op,
      question: `${a} ${op} ${b}`,
      answer
    };
    this.generated++;
    return ex;
  }

  validate(ex: Exercise, user: number): ValidationResult {
    return { correct: user === ex.answer, expected: ex.answer };
  }
}

export function createArithmeticModule(config: ModuleConfig) {
  return new ArithmeticModule(config);
}
