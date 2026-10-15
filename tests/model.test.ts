import type { Direction } from '../src/lib/types';
import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import {
  ahp,
  topsis,
  sensitivity,
  calculate,
  demoProject,
  emptyProject,
  criterion,
  decodeProject,
  validate,
  parseNumber,
  rankScores,
  matrixFor,
  setComparison,
} from '../src/lib/model';
import { projectJSON, markdownReport } from '../src/lib/report';
const close = (a: number | null | undefined, b: number | null | undefined, tolerance = 1e-9) =>
  assert.ok(
    typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < tolerance,
    `${a} differs from ${b}`,
  );
const weights = [2 / 3, 1 / 3],
  directions: Direction[] = ['cost', 'cost'],
  x = [
    [100000, 10],
    [100100, 1],
  ];

test('Supplier fixture independently matches two-dimensional TOPSIS geometry', () => {
  const r = topsis(x, weights, directions);
  const priceGap = (weights[0] * 100) / Math.hypot(100000, 100100);
  const deliveryGap = (weights[1] * 9) / Math.hypot(10, 1);
  close(r.scores[1], deliveryGap / (priceGap + deliveryGap));
  close(r.scores[0], 0.0015759087966269966);
  close(r.scores[1], 0.998424091203373);
  assert.equal(r.ranking[0].index, 1);
});
test('AHP preserves baseline weights and labels two-criterion consistency as not applicable', () => {
  const a = ahp([
    [1, 2],
    [0.5, 1],
  ]);
  close(a.weights[0], 2 / 3);
  assert.equal(a.cr, null);
  assert.equal(a.converged, true);
});
test('Known three-criterion priorities and inconsistency examples match original calculator', () => {
  const a = ahp([
    [1, 2, 4],
    [0.5, 1, 2],
    [0.25, 0.5, 1],
  ]);
  close(a.weights[0], 4 / 7);
  close(a.cr, 0);
  const b = ahp([
    [1, 3, 1],
    [1 / 3, 1, 3],
    [1, 1 / 3, 1],
  ]);
  assert.ok(b.cr !== null && b.cr > 0.5);
  assert.equal(b.status, 'Inconsistent');
});
test('Non-convergence is observable and invalid reciprocal matrices are rejected', () => {
  assert.equal(
    ahp(
      [
        [1, 2],
        [0.5, 1],
      ],
      0,
    ).converged,
    false,
  );
  assert.throws(
    () =>
      ahp([
        [1, 2],
        [1, 1],
      ]),
    /reciprocal/,
  );
});
test('Positive unit conversions preserve scores', () => {
  const original = topsis(x, weights, directions),
    scaled = topsis(
      [
        [100, 240],
        [100.1, 24],
      ],
      weights,
      directions,
    );
  original.scores.forEach((c, i) => close(c, scaled.scores[i]));
});
test('Free costs, all-zero columns and constant columns are valid', () => {
  assert.deepEqual(
    topsis(
      [
        [0, 2],
        [10, 2],
      ],
      [0.5, 0.5],
      directions,
    ).scores,
    [1, 0],
  );
  assert.deepEqual(
    topsis(
      [
        [0, 10],
        [0, 1],
      ],
      [0.5, 0.5],
      directions,
    ).scores,
    [0, 1],
  );
  assert.deepEqual(
    topsis(
      [
        [2, 10],
        [2, 1],
      ],
      [0.5, 0.5],
      directions,
    ).constants,
    [0],
  );
});
test('Identical alternatives never produce a false winner or NaN', () => {
  const r = topsis(
    [
      [0, 5],
      [0, 5],
      [0, 5],
    ],
    [0.5, 0.5],
    directions,
  );
  assert.equal(r.indistinguishable, true);
  assert.deepEqual(r.scores, [null, null, null]);
  assert.deepEqual(
    r.ranking.map((row) => row.rank),
    [1, 1, 1],
  );
});
test('Duplicated alternatives share a rank; input row order does not affect scores', () => {
  const r = topsis([x[0], x[1], x[1]], weights, directions);
  assert.equal(r.scores[1], r.scores[2]);
  assert.deepEqual(
    r.ranking.map((row) => row.rank),
    [1, 1, 3],
  );
  const reversed = topsis([...x].reverse(), weights, directions);
  close(reversed.scores[0], topsis(x, weights, directions).scores[1]);
});
test('Tie tolerance uses a fixed group anchor rather than chained adjacent gaps', () => {
  assert.deepEqual(
    rankScores([0.9, 0.9 - 8e-10, 0.9 - 16e-10]).map((row) => row.rank),
    [1, 1, 3],
  );
});
test('Benefit and cost directions, signed data, and dominance are handled', () => {
  assert.deepEqual(
    topsis(
      [
        [0, 10],
        [10, 0],
      ],
      [0.5, 0.5],
      ['cost', 'benefit'],
    ).scores,
    [1, 0],
  );
  assert.deepEqual(
    topsis(
      [
        [-10, 10],
        [0, 1],
      ],
      [0.5, 0.5],
      ['cost', 'benefit'],
    ).scores,
    [1, 0],
  );
  for (let k = 0; k < 100; k++) {
    const a = [10 + k, 20 + k],
      b = [11 + k, 19 + k],
      c = [30 + k, 30 + k];
    const r = topsis([a, b, c], [0.4, 0.6], ['cost', 'benefit']);
    assert.ok((r.scores[0] ?? 0) >= (r.scores[1] ?? 0) - 1e-9);
  }
});
test('Extreme finite magnitudes do not overflow or underflow column normalization', () => {
  for (const factor of [1e300, 1e-300]) {
    const r = topsis(
      [
        [factor, 2 * factor],
        [2 * factor, factor],
      ],
      [0.5, 0.5],
      directions,
    );
    r.scores.forEach((c) => close(c, 0.5));
  }
  assert.throws(() =>
    topsis(
      [
        [Infinity, 1],
        [0, 2],
      ],
      [0.5, 0.5],
      directions,
    ),
  );
});
test('Parser distinguishes blank from zero and does not guess locale/grouping', () => {
  assert.ok(parseNumber('').error);
  assert.equal(parseNumber('0').value, 0);
  assert.equal(parseNumber('1.000').value, 1);
  for (const v of ['1,000', '100jt', 'NaN', 'Infinity', '1e999', 'Rp100'])
    assert.ok(parseNumber(v).error);
});
test('Blank, duplicate and negative inputs block calculation; signed custom is explicit', () => {
  const p = demoProject();
  p.alternatives[0].values[p.criteria[0].id] = '';
  assert.ok(validate(p).length);
  assert.throws(() => calculate(p));
  p.alternatives[0].values[p.criteria[0].id] = '-1';
  assert.ok(validate(p).length);
  p.criteria[0].template = 'custom';
  p.criteria[0].allowNegative = true;
  assert.equal(validate(p).length, 0);
  p.alternatives[1].name = p.alternatives[0].name;
  assert.ok(validate(p).length);
});
test('Stable IDs preserve criterion judgments when reordered or renamed', () => {
  const p = demoProject();
  setComparison(p, p.criteria[0].id, p.criteria[1].id, 2);
  p.criteria.reverse();
  close(ahp(matrixFor(p)).weights[0], 1 / 3);
  p.criteria[0].name = 'Renamed';
  close(ahp(matrixFor(p)).weights[0], 1 / 3);
  p.criteria.push(criterion('capacity'));
  assert.equal(matrixFor(p)[0][2], 1);
});
test('Sensitivity normalizes changed weights, leaves baseline untouched, and handles equal options', () => {
  const before = [...weights],
    s = sensitivity(x, weights, directions);
  assert.equal(s.length, 4);
  assert.deepEqual(weights, before);
  s.forEach((row) =>
    close(
      row.weights.reduce((a, v) => a + v, 0),
      1,
    ),
  );
  const equal = sensitivity(
    [
      [1, 2],
      [1, 2],
    ],
    [0.5, 0.5],
    directions,
  );
  equal.forEach((row) => assert.deepEqual(row.winners, [0, 1]));
});
test('JSON round-trip recomputes the fixture and rejects malformed projects without trusting results', () => {
  const p = demoProject(),
    q = decodeProject(projectJSON(p));
  close(calculate(q).topsis.scores[1], 0.998424091203373);
  assert.throws(() => decodeProject('{}'));
  assert.throws(() => decodeProject('{'));
  p.criteria[1].id = p.criteria[0].id;
  assert.throws(() => decodeProject(projectJSON(p)), /duplicated/);
});
test('Incomplete drafts preserve invalid text for correction; imported projects reject invalid values', () => {
  const p = demoProject();
  p.alternatives[0].values[p.criteria[0].id] = 'still typing';
  assert.throws(() => decodeProject(projectJSON(p)));
  assert.equal(
    decodeProject(projectJSON(p), true).alternatives[0].values[p.criteria[0].id],
    'still typing',
  );
  assert.equal(validate(decodeProject(projectJSON(emptyProject()))).length, 4);
});
test('Report includes reproducible input, scores, method, matrices and sensitivity', () => {
  const r = calculate(demoProject()),
    md = markdownReport(r);
  assert.match(md, /100100/);
  assert.match(md, /0\.998424091203373/);
  assert.match(md, /Vector-normalized/);
  assert.match(md, /Weight sensitivity/);
  assert.match(md, /not confidence/);
});
test('10-criterion / 100-alternative performance and finite outputs', () => {
  const data = Array.from({ length: 100 }, (_, i) =>
    Array.from({ length: 10 }, (_, j) => (((i + 3) * (j + 7)) % 131) + 1),
  );
  const w = Array(10).fill(0.1),
    d: Direction[] = Array.from({ length: 10 }, (_, i) => (i % 2 ? 'cost' : 'benefit'));
  const start = performance.now();
  const r = topsis(data, w, d);
  const scenarios = sensitivity(data, w, d);
  const elapsed = performance.now() - start;
  assert.equal(scenarios.length, 20);
  assert.ok(r.scores.every(Number.isFinite));
  assert.ok(elapsed < 250, `Took ${elapsed} ms`);
  console.log(`Baseline + 20 scenarios: ${elapsed.toFixed(2)} ms`);
});
