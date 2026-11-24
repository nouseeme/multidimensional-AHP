import type { DecisionResult, Matrix, Project } from './types';
import { METHOD, RI_VERSION } from './constants';
import { translate, type Locale } from './i18n';
const cell = (value: unknown): string =>
  String(value ?? '—')
    .replaceAll('|', '\\|')
    .replaceAll('\n', ' ');
const table = (headers: string[], rows: unknown[][]): string =>
  [headers, ...[headers.map(() => '---')], ...rows]
    .map((row) => '| ' + row.map(cell).join(' | ') + ' |')
    .join('\n');
export function markdownReport(result: DecisionResult, locale: Locale = 'en'): string {
  const tr = (key: string) => translate(locale, key);
  const p = result.project,
    t = result.topsis,
    names = p.criteria.map((c) => c.name),
    value = (c: number | null) => (c === null ? tr('Not defined') : c.toPrecision(15));
  const matrix = (m: Matrix) =>
    table(
      [tr('Alternative'), ...names],
      m.map((row, i) => [p.alternatives[i].name, ...row.map((v) => v.toPrecision(15))]),
    );
  return (
    [
      `# ${p.title || tr('Decision report')}`,
      `${tr('Calculated')}: ${result.createdAt} (UTC).\n\n${tr('Method')}: ${METHOD}. ${tr('RI table')}: ${RI_VERSION}.`,
      `## ${tr('Ranking')}`,
      table(
        [
          tr('Rank'),
          tr('Alternative'),
          tr('Closeness'),
          tr('Distance to best'),
          tr('Distance to worst'),
        ],
        t.ranking.map((row) => [
          row.rank,
          p.alternatives[row.index].name,
          value(row.score),
          value(t.distances[row.index].plus),
          value(t.distances[row.index].minus),
        ]),
      ),
      tr(
        'Closeness is relative to this analysis. It is not confidence, accuracy, or a probability. Scores are not normalized to sum to 1.',
      ),
      `## ${tr('Criteria and priorities')}`,
      table(
        [tr('Criterion'), tr('Direction'), tr('Unit'), tr('Weight')],
        p.criteria.map((c, j) => [
          c.name,
          locale === 'en'
            ? c.direction
            : tr(c.direction === 'cost' ? 'Lower is better' : 'Higher is better'),
          c.unit,
          result.ahp.weights[j].toPrecision(15),
        ]),
      ),
      `${tr('AHP status')}: ${tr(result.ahp.status)}. ${tr('Converged')}: ${locale === 'en' ? result.ahp.converged : tr(result.ahp.converged ? 'Yes' : 'No')}. ${tr('Iterations')}: ${result.ahp.iterations}. Lambda: ${result.ahp.lambda}. CI: ${result.ahp.ci ?? tr('Not applicable')}. CR: ${result.ahp.cr ?? tr('Not applicable for two criteria')}.`,
      `## ${tr('AHP comparisons')}`,
      table(
        [tr('Criterion'), ...names],
        result.matrix.map((row, i) => [names[i], ...row]),
      ),
      `## ${tr('Raw data (X)')}`,
      matrix(t.x),
      `## ${tr('Vector-normalized data (R)')}`,
      matrix(t.r),
      `## ${tr('Weighted data (V)')}`,
      matrix(t.v),
      `## ${tr('Ideal combinations')}`,
      table(
        [tr('Ideal'), ...names],
        [
          [tr('Best'), ...t.best],
          [tr('Worst'), ...t.worst],
        ],
      ),
      `${tr('Criteria with no differences')}: ${t.constants.map((j) => names[j]).join(', ') || tr('None')}. ${t.indistinguishable ? tr('All alternatives are indistinguishable; closeness is undefined.') : ''}`,
      `## ${tr('Weight sensitivity')}`,
      table(
        [
          tr('Criterion'),
          tr('Relative change'),
          tr('Scenario weights'),
          tr('Top alternatives'),
          tr('Top set changed'),
        ],
        result.sensitivity.map((s) => [
          names[s.criterion],
          s.factor < 1 ? '-10%' : '+10%',
          s.weights.map((v) => v.toPrecision(8)).join(', '),
          s.winners.map((i) => p.alternatives[i].name).join(', '),
          s.changed ? tr('Yes') : tr('No'),
        ]),
      ),
      tr(
        'Scenarios perturb one baseline weight and renormalize all weights. They are not new AHP judgments and have no consistency ratio. Stability only refers to these scenarios.',
      ),
      `## ${tr('Assumptions')}`,
      [
        'AHP weights represent stated preferences. TOPSIS uses vector normalization and Euclidean distances.',
        'All alternatives use the same units, scale, and time basis within each criterion. No conversion is performed.',
        'Adding alternatives, extreme inputs, and correlated criteria can affect ranking.',
        'Higher/lower directions assume monotonic preference. Ratings remain subjective.',
        'This ranking does not enforce mandatory eligibility constraints.',
        'Squared distances contain squared weights; final closeness is not a linear sum of criterion scores.',
      ]
        .map((note) => '- ' + tr(note))
        .join('\n'),
    ].join('\n\n') + '\n'
  );
}
export function projectJSON(project: Project): string {
  return JSON.stringify({ ...project, exportedAt: new Date().toISOString() }, null, 2);
}
