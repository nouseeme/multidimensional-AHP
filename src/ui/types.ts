import type { DecisionResult, Project } from '../lib/types';

export interface UIState {
  step: number;
  tab: 'cards' | 'table';
  validating: boolean;
  error: string;
  notice: string;
  save: string;
  compare: number[];
  sensitivity: boolean;
  details: boolean;
}
export interface ViewContext {
  project: Project;
  result: DecisionResult | null;
  dirty: boolean;
  ui: UIState;
  errorMap: ReadonlyMap<string, string>;
}
