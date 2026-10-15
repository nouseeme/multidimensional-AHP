import { decodeProject } from './project';
import type { Project } from './types';

export const DRAFT_KEY = 'decision-studio-draft-v1';

/** Storage is supplied by the browser; calculations never depend on it. */
export function loadDraft(storage: Pick<Storage, 'getItem'>): Project | null {
  const stored = storage.getItem(DRAFT_KEY);
  return stored === null ? null : decodeProject(stored, true);
}

export function saveDraft(storage: Pick<Storage, 'setItem'>, project: Project): void {
  storage.setItem(DRAFT_KEY, JSON.stringify(project));
}
