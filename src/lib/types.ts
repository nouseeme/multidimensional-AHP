export type Direction = 'cost' | 'benefit';
export type Template = 'price' | 'duration' | 'distance' | 'capacity' | 'custom';
export type Matrix = number[][];
export type Score = number | null;

export interface Criterion {
  id: string;
  name: string;
  template: Template;
  direction: Direction;
  unit: string;
  allowNegative: boolean;
}

export interface Alternative {
  id: string;
  name: string;
  values: Record<string, string>;
}

export interface Project {
  schemaVersion: 1;
  method: string;
  numberFormat: 'decimal-point-no-grouping';
  title: string;
  criteria: Criterion[];
  alternatives: Alternative[];
  comparisons: Record<string, number>;
  touched: string[];
  importedMethod?: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
}
export type ParsedNumber =
  { value: number; error?: undefined } | { error: string; value?: undefined };
export interface AHPResult {
  weights: number[];
  lambda: number;
  ci: number | null;
  cr: number | null;
  converged: boolean;
  iterations: number;
  status: 'Not applicable' | 'Consistent' | 'Review priorities' | 'Inconsistent';
}
export interface Ranking {
  score: Score;
  index: number;
  rank: number;
}
export interface TOPSISResult {
  x: Matrix;
  r: Matrix;
  v: Matrix;
  best: number[];
  worst: number[];
  distances: { plus: number; minus: number }[];
  scores: Score[];
  ranking: Ranking[];
  constants: number[];
  indistinguishable: boolean;
}
export interface SensitivityScenario {
  criterion: number;
  factor: number;
  weights: number[];
  winners: number[];
  changed: boolean;
}
export interface DecisionResult {
  project: Project;
  method: string;
  riVersion: string;
  createdAt: string;
  matrix: Matrix;
  ahp: AHPResult;
  topsis: TOPSISResult;
  sensitivity: SensitivityScenario[];
}
