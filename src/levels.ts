export type Op = '+' | '-' | 'x' | '/';

export interface LevelConfig {
  id: number;
  ops: Op[];
  min: number;
  max: number;
  total: number; // exercises required to complete the level
  desc: string;
  /** Optional list of base factors; operands will be generated as multiples of a random factor from this list when possible */
  multiples?: number[];
}

// 20-level progressive curriculum with focused practice and multiples
export const LEVELS: LevelConfig[] = [
  { id: 1,  ops: ['+','-'],          min: 1,   max: 9,    total: 12, desc: 'Single-digit addition and subtraction' },
  { id: 2,  ops: ['+','-','x'],      min: 1,   max: 9,    total: 12, desc: 'Intro to multiplication with friendly tables', multiples: [2, 5, 10] },
  { id: 3,  ops: ['+','-','x','/'],  min: 1,   max: 9,    total: 14, desc: 'Introduce exact division (kept within range)', multiples: [3, 4] },
  { id: 4,  ops: ['+','-'],          min: 1,   max: 20,   total: 14, desc: 'Add/sub within 1–20' },
  { id: 5,  ops: ['x','/'],          min: 2,   max: 12,   total: 16, desc: 'Times tables up to 12 (and their divisions)', multiples: [2, 3, 4, 5, 10] },
  { id: 6,  ops: ['+','-','x','/'],  min: 1,   max: 30,   total: 18, desc: 'Mixed up to 30', multiples: [2, 5, 10] },
  { id: 7,  ops: ['+','-','x','/'],  min: 1,   max: 50,   total: 18, desc: 'Mixed up to 50', multiples: [4, 6, 8] },
  { id: 8,  ops: ['+','-','x','/'],  min: 1,   max: 80,   total: 20, desc: 'Trickier multiples practice', multiples: [7, 8, 9] },
  { id: 9,  ops: ['+','-','x','/'],  min: 1,   max: 90,   total: 20, desc: 'Patterns and accuracy', multiples: [3, 6, 9] },
  { id: 10, ops: ['+','-','x','/'],  min: 1,   max: 99,   total: 22, desc: 'Full two-digit practice (up to 99)' },
  { id: 11, ops: ['+','-'],          min: 10,  max: 199,  total: 18, desc: 'Hundreds addition and subtraction' },
  { id: 12, ops: ['+','-','x'],      min: 1,   max: 199,  total: 20, desc: 'Products with two/three digits', multiples: [5, 10, 25] },
  { id: 13, ops: ['+','-','x','/'],  min: 1,   max: 249,  total: 20, desc: 'Mixed practice up to 250' },
  { id: 14, ops: ['+','-','x','/'],  min: 1,   max: 399,  total: 22, desc: 'Mixed up to 399', multiples: [4, 8, 12] },
  { id: 15, ops: ['+','-','x','/'],  min: 1,   max: 499,  total: 22, desc: 'Mixed up to 499' },
  { id: 16, ops: ['+','-','x','/'],  min: 1,   max: 699,  total: 24, desc: 'Trickier factors', multiples: [7, 11, 13] },
  { id: 17, ops: ['+','-','x','/'],  min: 1,   max: 799,  total: 24, desc: 'Heavier practice', multiples: [9, 12, 16] },
  { id: 18, ops: ['+','-','x','/'],  min: 1,   max: 899,  total: 24, desc: 'Approaching thousands' },
  { id: 19, ops: ['+','-','x','/'],  min: 1,   max: 950,  total: 24, desc: 'Round-number multiples', multiples: [20, 25, 50] },
  { id: 20, ops: ['+','-','x','/'],  min: 1,   max: 999,  total: 26, desc: 'Three-digit mixed challenge (up to 999)' }
];

export function getLevel(id: number): LevelConfig | undefined {
  return LEVELS.find(l => l.id === id);
}

export function nextLevel(id: number): LevelConfig | undefined {
  return getLevel(id + 1);
}
