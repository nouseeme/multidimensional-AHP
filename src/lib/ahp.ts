import { RI } from './constants';
import type { AHPResult, Matrix } from './types';

export function ahp(matrix: Matrix, maxIterations = 100): AHPResult {
  const n = matrix.length;
  if (
    n < 2 ||
    n > 10 ||
    matrix.some((row) => row.length !== n || row.some((v) => !Number.isFinite(v) || v <= 0))
  )
    throw new Error('AHP needs a positive square matrix with 2–10 criteria.');
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++)
      if (Math.abs(matrix[i][j] * matrix[j][i] - 1) > 1e-9 || (i === j && matrix[i][j] !== 1))
        throw new Error('The AHP matrix must be reciprocal with a diagonal of 1.');
  let weights = Array(n).fill(1 / n),
    converged = false,
    iterations = 0;
  for (; iterations < maxIterations; iterations++) {
    const next = matrix.map((row) => row.reduce((s, v, j) => s + v * weights[j], 0));
    const total = next.reduce((s, v) => s + v, 0);
    const normalized = next.map((v) => v / total);
    const delta = normalized.reduce((s, v, j) => s + Math.abs(v - weights[j]), 0);
    weights = normalized;
    if (delta < 1e-5) {
      converged = true;
      iterations++;
      break;
    }
  }
  const lambda =
    matrix.reduce(
      (s, row, i) => s + row.reduce((a, v, j) => a + v * weights[j], 0) / weights[i],
      0,
    ) / n;
  const ci = n === 2 ? null : Math.max(0, (lambda - n) / (n - 1));
  const cr = ci === null ? null : ci / RI[n];
  return {
    weights,
    lambda,
    ci,
    cr,
    converged,
    iterations,
    status:
      n === 2
        ? 'Not applicable'
        : cr !== null && cr < 0.1
          ? 'Consistent'
          : cr !== null && cr < 0.2
            ? 'Review priorities'
            : 'Inconsistent',
  };
}
