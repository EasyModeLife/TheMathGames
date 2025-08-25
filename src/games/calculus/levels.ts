export type CalcTopic = 'derivative-poly' | 'integral-poly' | 'derivative-trig' | 'differential-poly';

export interface CalcLevel {
  id: number;
  topics: CalcTopic[];
  total: number;
  desc: string;
}

export const CALC_LEVELS: CalcLevel[] = [
  { id: 1, topics: ['derivative-poly'], total: 10, desc: 'Derivadas de polinomios simples' },
  { id: 2, topics: ['integral-poly'], total: 10, desc: 'Integrales de polinomios básicas' },
  { id: 3, topics: ['derivative-trig'], total: 12, desc: 'Derivadas trigonométricas' },
  { id: 4, topics: ['differential-poly'], total: 12, desc: 'Diferenciales: dy = f’(x) dx' },
  { id: 5, topics: ['derivative-poly','integral-poly','derivative-trig','differential-poly'], total: 14, desc: 'Mixto de cálculo' },
];

export function getCalcLevel(id: number): CalcLevel | undefined { return CALC_LEVELS.find(l=>l.id===id); }
export function nextCalcLevel(id: number): CalcLevel | undefined { return getCalcLevel(id+1); }
