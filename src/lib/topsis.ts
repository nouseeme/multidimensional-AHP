import type { Direction, Matrix, Ranking, Score, SensitivityScenario, TOPSISResult } from './types';

export function rankScores(scores: Score[]): Ranking[] {
  const sorted = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  let rank = 1,
    anchor = sorted[0]?.score;
  return sorted.map((row, i) => {
    if (
      i > 0 &&
      row.score !== null &&
      anchor !== null &&
      anchor !== undefined &&
      Math.abs(row.score - anchor) > 1e-9
    ) {
      rank = i + 1;
      anchor = row.score;
    }
    return { ...row, rank };
  });
}
export function topsis(x: Matrix, weights: number[], directions: Direction[]): TOPSISResult {
  const n = weights.length;
  if (
    x.length < 2 ||
    n < 2 ||
    directions.length !== n ||
    x.some((row) => row.length !== n || row.some((v) => !Number.isFinite(v))) ||
    weights.some((w) => !Number.isFinite(w) || w <= 0) ||
    Math.abs(weights.reduce((s, v) => s + v, 0) - 1) > 1e-9 ||
    directions.some((d) => !['cost', 'benefit'].includes(d))
  )
    throw new Error('Invalid TOPSIS inputs.');
  const constants: number[] = [];
  const columns = weights.map((_, j) => {
    const values = x.map((row) => row[j]);
    if (values.every((v) => v === values[0])) constants.push(j);
    const max = Math.max(...values.map(Math.abs));
    return { max, norm: max === 0 ? 0 : Math.hypot(...values.map((v) => v / max)) };
  });
  const r = x.map((row) =>
    row.map((v, j) => (columns[j].norm === 0 ? 0 : v / columns[j].max / columns[j].norm)),
  );
  const v = r.map((row) => row.map((value, j) => value * weights[j]));
  const best = weights.map((_, j) =>
    directions[j] === 'benefit'
      ? Math.max(...v.map((row) => row[j]))
      : Math.min(...v.map((row) => row[j])),
  );
  const worst = weights.map((_, j) =>
    directions[j] === 'benefit'
      ? Math.min(...v.map((row) => row[j]))
      : Math.max(...v.map((row) => row[j])),
  );
  const distances = v.map((row) => ({
    plus: Math.hypot(...row.map((value, j) => value - best[j])),
    minus: Math.hypot(...row.map((value, j) => value - worst[j])),
  }));
  const scores = distances.map(({ plus, minus }) =>
    plus + minus === 0 ? null : minus / (plus + minus),
  );
  if (scores.some((c) => c !== null && !Number.isFinite(c)))
    throw new Error('The numeric range could not be evaluated safely.');
  return {
    x,
    r,
    v,
    best,
    worst,
    distances,
    scores,
    ranking: rankScores(scores),
    constants,
    indistinguishable: scores.every((c) => c === null),
  };
}
export function sensitivity(
  x: Matrix,
  weights: number[],
  directions: Direction[],
): SensitivityScenario[] {
  const baseline = topsis(x, weights, directions);
  const top = (result: TOPSISResult) =>
    result.ranking
      .filter((row) => row.rank === 1)
      .map((row) => row.index)
      .sort((a, b) => a - b);
  const reference = JSON.stringify(top(baseline));
  return weights.flatMap((_, j) =>
    [0.9, 1.1].map((factor) => {
      const changed = weights.map((w, k) => (k === j ? w * factor : w));
      const total = changed.reduce((s, w) => s + w, 0),
        normalized = changed.map((w) => w / total);
      const result = topsis(x, normalized, directions),
        winners = top(result);
      return {
        criterion: j,
        factor,
        weights: normalized,
        winners,
        changed: JSON.stringify(winners) !== reference,
      };
    }),
  );
}
