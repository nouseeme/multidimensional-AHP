import type { DecisionResult, Project } from '../lib/types';
import type { Locale } from '../lib/i18n';

export interface UIState {
  step: number;
  tab: 'cards' | 'table';
  validating: boolean;
  error: string | { count: number; message: string };
  notice: string;
  save: string;
  compare: number[];
  sensitivity: boolean;
  details: boolean;
}
export interface ViewContext {
  locale: Locale;
  project: Project;
  result: DecisionResult | null;
  dirty: boolean;
  ui: UIState;
  errorMap: ReadonlyMap<string, string>;
}
