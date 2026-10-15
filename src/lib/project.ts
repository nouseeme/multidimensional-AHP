import { METHOD, SCALE, TEMPLATES, isDirection, isTemplate } from './constants';
import { parseNumber } from './numbers';
import type { Alternative, Criterion, Matrix, Project, Template, ValidationIssue } from './types';

export const uid = (): string => globalThis.crypto.randomUUID();
export function criterion(template: Template = 'custom'): Criterion {
  return { id: uid(), template, ...TEMPLATES[template] };
}
export function emptyProject(): Project {
  return {
    schemaVersion: 1,
    method: METHOD,
    numberFormat: 'decimal-point-no-grouping',
    title: '',
    criteria: [criterion('price'), criterion('duration')],
    alternatives: [
      { id: uid(), name: 'Alternative 1', values: {} },
      { id: uid(), name: 'Alternative 2', values: {} },
    ],
    comparisons: {},
    touched: [],
  };
}
export const pairKey = (a: string, b: string): string => JSON.stringify([a, b].sort());
export function comparison(project: Project, a: string, b: string): number {
  const value = project.comparisons[pairKey(a, b)] ?? 1;
  return a < b ? value : 1 / value;
}
export function setComparison(project: Project, a: string, b: string, value: number): void {
  const key = pairKey(a, b);
  project.comparisons[key] = a < b ? value : 1 / value;
  if (!project.touched.includes(key)) project.touched.push(key);
}
export function matrixFor(project: Project): Matrix {
  return project.criteria.map((a) =>
    project.criteria.map((b) => (a.id === b.id ? 1 : comparison(project, a.id, b.id))),
  );
}
export function criterionById(project: Project, id: string | undefined): Criterion {
  const found = project.criteria.find((c) => c.id === id);
  if (!found) throw new Error('This criterion is no longer available.');
  return found;
}
export function alternativeById(project: Project, id: string | undefined): Alternative {
  const found = project.alternatives.find((a) => a.id === id);
  if (!found) throw new Error('This alternative is no longer available.');
  return found;
}
export function isValidCriterionValue(raw: unknown, c: Criterion): boolean {
  const parsed = parseNumber(raw);
  return parsed.error === undefined && (c.allowNegative || parsed.value >= 0);
}
export function validate(project: Project, requireData = true): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (project.criteria.length < 2 || project.criteria.length > 10)
    issues.push({ field: 'criteria', message: 'Add 2–10 criteria.' });
  const names = new Set<string>();
  for (const c of project.criteria) {
    const name = c.name.trim().toLowerCase();
    if (!name || names.has(name))
      issues.push({
        field: `criterion-${c.id}-name`,
        message: name ? 'Use a unique criterion name.' : 'Name this criterion.',
      });
    names.add(name);
  }
  if (!requireData) return issues;
  if (project.alternatives.length < 2 || project.alternatives.length > 100)
    issues.push({ field: 'alternatives', message: 'Add 2–100 alternatives.' });
  const altNames = new Set<string>();
  for (const a of project.alternatives) {
    const name = a.name.trim().toLowerCase();
    if (!name || altNames.has(name))
      issues.push({
        field: `alternative-${a.id}-name`,
        message: name ? 'Use a unique alternative name.' : 'Name this alternative.',
      });
    altNames.add(name);
    for (const c of project.criteria) {
      const parsed = parseNumber(a.values[c.id]);
      const error =
        parsed.error ??
        (!c.allowNegative && parsed.value !== undefined && parsed.value < 0
          ? 'Negative values are not allowed for this criterion.'
          : null);
      if (error) issues.push({ field: `value-${a.id}-${c.id}`, message: error });
    }
  }
  return issues;
}
export function demoProject(): Project {
  const p = emptyProject();
  p.title = 'Choose a delivery supplier';
  p.alternatives[0].name = 'Supplier A';
  p.alternatives[1].name = 'Supplier B';
  [
    [100000, 10],
    [100100, 1],
  ].forEach((row, i) =>
    row.forEach((v, j) => (p.alternatives[i].values[p.criteria[j].id] = String(v))),
  );
  setComparison(p, p.criteria[0].id, p.criteria[1].id, 2);
  return p;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function record(value: unknown, message: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(message);
  return value;
}
function stringField(value: unknown, limit: number, message: string): string {
  if (typeof value !== 'string' || value.length > limit) throw new Error(message);
  return value;
}

/** JSON is untrusted at runtime, even though the application itself is typed. */
export function decodeProject(text: string, allowInvalidValues = false): Project {
  let input: unknown;
  try {
    input = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  const p = record(input, 'Unsupported project format. Use a Decision Studio JSON export.');
  if (
    p.schemaVersion !== 1 ||
    !Array.isArray(p.criteria) ||
    !Array.isArray(p.alternatives) ||
    !isRecord(p.comparisons)
  )
    throw new Error('Unsupported project format. Use a Decision Studio JSON export.');
  if (
    p.criteria.length < 2 ||
    p.criteria.length > 10 ||
    p.alternatives.length < 2 ||
    p.alternatives.length > 100
  )
    throw new Error('This project exceeds the supported limits.');
  const ids = new Set<string>();
  function identity(raw: unknown): { item: Record<string, unknown>; id: string; name: string } {
    const item = record(raw, 'Invalid project entry.');
    const id = stringField(item.id, 200, 'Invalid project identifier.');
    if (!id || ids.has(id)) throw new Error('Invalid or duplicated project identifiers.');
    ids.add(id);
    return { item, id, name: stringField(item.name, 200, 'Invalid project name.') };
  }
  const criteria: Criterion[] = p.criteria.map((raw) => {
    const { item: c, id, name } = identity(raw);
    if (
      !isDirection(c.direction) ||
      !isTemplate(c.template) ||
      typeof c.allowNegative !== 'boolean'
    )
      throw new Error('Invalid criterion settings.');
    if (c.template !== 'custom' && c.allowNegative)
      throw new Error('Only Custom criteria may allow negative values.');
    return {
      id,
      name,
      direction: c.direction,
      template: c.template,
      allowNegative: c.allowNegative,
      unit: stringField(c.unit, 100, 'Invalid criterion unit.'),
    };
  });
  const comparisons: Record<string, number> = Object.create(null);
  const allowed = new Set<string>();
  for (let i = 0; i < criteria.length; i++)
    for (let j = i + 1; j < criteria.length; j++)
      allowed.add(pairKey(criteria[i].id, criteria[j].id));
  for (const [key, value] of Object.entries(p.comparisons)) {
    if (
      !allowed.has(key) ||
      typeof value !== 'number' ||
      !SCALE.some((v) => Math.abs(v - value) < 1e-12)
    )
      throw new Error('Invalid criterion comparisons.');
    comparisons[key] = value;
  }
  const alternatives: Alternative[] = p.alternatives.map((raw) => {
    const { item: a, id, name } = identity(raw);
    const inputValues = record(a.values, 'Invalid alternative values.');
    const values: Record<string, string> = Object.create(null);
    for (const c of criteria) {
      const value = inputValues[c.id] ?? '';
      if ((typeof value !== 'string' && typeof value !== 'number') || String(value).length > 200)
        throw new Error('Invalid numeric field.');
      if (!allowInvalidValues && String(value).trim() && !isValidCriterionValue(value, c))
        throw new Error(`Invalid value in ${name}: ${c.name}.`);
      values[c.id] = String(value);
    }
    return { id, name, values };
  });
  return {
    schemaVersion: 1,
    method: METHOD,
    numberFormat: 'decimal-point-no-grouping',
    title: stringField(p.title, 200, 'Invalid project title.'),
    criteria,
    alternatives,
    comparisons,
    touched: Array.isArray(p.touched)
      ? p.touched.filter((key): key is string => typeof key === 'string' && allowed.has(key))
      : [],
    importedMethod: p.method !== METHOD ? String(p.method) : undefined,
  };
}
