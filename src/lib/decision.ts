import { ahp } from './ahp';
import { topsis, sensitivity } from './topsis';
import { METHOD, RI_VERSION } from './constants';
import { matrixFor, validate } from './project';
import { numericValue } from './numbers';
import type { DecisionResult, Project } from './types';

export function calculate(project: Project): DecisionResult {
  if (validate(project).length) throw new Error('Complete all decision inputs before calculating.');
  const matrix = matrixFor(project);
  const priorities = ahp(matrix);
  if (!priorities.converged)
    throw new Error('The priority calculation did not converge. Review the comparisons.');
  const x = project.alternatives.map((a) =>
    project.criteria.map((c) => numericValue(a.values[c.id])),
  );
  const directions = project.criteria.map((c) => c.direction);
  return {
    project: structuredClone(project),
    method: METHOD,
    riVersion: RI_VERSION,
    createdAt: new Date().toISOString(),
    matrix,
    ahp: priorities,
    topsis: topsis(x, priorities.weights, directions),
    sensitivity: sensitivity(x, priorities.weights, directions),
  };
}
