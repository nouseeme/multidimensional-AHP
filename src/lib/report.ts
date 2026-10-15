import type { DecisionResult, Matrix, Project } from './types';
import { METHOD, RI_VERSION } from './constants';
const cell = (value: unknown): string =>
  String(value ?? '—')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
const table = (headers: string[], rows: unknown[][]): string =>
  [headers, ...[headers.map(() => '---')], ...rows]
    .map((row) => '| ' + row.map(cell).join(' | ') + ' |')
    .join('\n');
export function markdownReport(result: DecisionResult): string {
  const p = result.project,
    t = result.topsis,
    names = p.criteria.map((c) => c.name),
    value = (c: number | null) => (c === null ? 'Not defined' : c.toPrecision(15));
  const matrix = (m: Matrix) =>
    table(
      ['Alternative', ...names],
      m.map((row, i) => [p.alternatives[i].name, ...row.map((v) => v.toPrecision(15))]),
    );
  return (
    [
      `# ${p.title || 'Decision report'}`,
      `Calculated: ${result.createdAt} (UTC).\n\nMethod: ${METHOD}. RI table: ${RI_VERSION}.`,
      '## Ranking',
      table(
        ['Rank', 'Alternative', 'Closeness', 'Distance to best', 'Distance to worst'],
        t.ranking.map((row) => [
          row.rank,
          p.alternatives[row.index].name,
          value(row.score),
          value(t.distances[row.index].plus),
          value(t.distances[row.index].minus),
        ]),
      ),
      'Closeness is relative to this analysis. It is not confidence, accuracy, or a probability. Scores are not normalized to sum to 1.',
      '## Criteria and priorities',
      table(
        ['Criterion', 'Direction', 'Unit', 'Weight'],
        p.criteria.map((c, j) => [
          c.name,
          c.direction,
          c.unit,
          result.ahp.weights[j].toPrecision(15),
        ]),
      ),
      `AHP status: ${result.ahp.status}. Converged: ${result.ahp.converged}. Iterations: ${result.ahp.iterations}. Lambda: ${result.ahp.lambda}. CI: ${result.ahp.ci ?? 'Not applicable'}. CR: ${result.ahp.cr ?? 'Not applicable for two criteria'}.`,
      '## AHP comparisons',
      table(
        ['Criterion', ...names],
        result.matrix.map((row, i) => [names[i], ...row]),
      ),
      '## Raw data (X)',
      matrix(t.x),
      '## Vector-normalized data (R)',
      matrix(t.r),
      '## Weighted data (V)',
      matrix(t.v),
      '## Ideal combinations',
      table(
        ['Ideal', ...names],
        [
          ['Best', ...t.best],
          ['Worst', ...t.worst],
        ],
      ),
      `Criteria with no differences: ${t.constants.map((j) => names[j]).join(', ') || 'None'}. ${t.indistinguishable ? 'All alternatives are indistinguishable; closeness is undefined.' : ''}`,
      '## Weight sensitivity',
      table(
        ['Criterion', 'Relative change', 'Scenario weights', 'Top alternatives', 'Top set changed'],
        result.sensitivity.map((s) => [
          names[s.criterion],
          s.factor < 1 ? '-10%' : '+10%',
          s.weights.map((v) => v.toPrecision(8)).join(', '),
          s.winners.map((i) => p.alternatives[i].name).join(', '),
          s.changed ? 'Yes' : 'No',
        ]),
      ),
      'Scenarios perturb one baseline weight and renormalize all weights. They are not new AHP judgments and have no consistency ratio. Stability only refers to these scenarios.',
      '## Assumptions',
      '- AHP weights represent stated preferences. TOPSIS uses vector normalization and Euclidean distances.\n- All alternatives use the same units, scale, and time basis within each criterion. No conversion is performed.\n- Adding alternatives, extreme inputs, and correlated criteria can affect ranking.\n- Higher/lower directions assume monotonic preference. Ratings remain subjective.\n- This ranking does not enforce mandatory eligibility constraints.\n- Squared distances contain squared weights; final closeness is not a linear sum of criterion scores.',
    ].join('\n\n') + '\n'
  );
}
export function projectJSON(project: Project): string {
  return JSON.stringify({ ...project, exportedAt: new Date().toISOString() }, null, 2);
}
