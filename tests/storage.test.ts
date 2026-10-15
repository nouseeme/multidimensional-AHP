import test from 'node:test';
import assert from 'node:assert/strict';
import { demoProject, decodeProject, validate, calculate } from '../src/lib/model';
import { DRAFT_KEY, loadDraft, saveDraft } from '../src/lib/storage';

test('Draft persistence keeps the existing key and preserves partially typed data', () => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
  assert.equal(loadDraft(storage), null);
  const project = demoProject();
  project.alternatives[0].values[project.criteria[0].id] = 'editing';
  saveDraft(storage, project);
  assert.ok(values.has('decision-studio-draft-v1'));
  const restored = loadDraft(storage);
  assert.ok(restored);
  assert.equal(restored.alternatives[0].values[restored.criteria[0].id], 'editing');
  assert.ok(validate(restored).length > 0);
  assert.throws(() => calculate(restored));
  assert.throws(() => decodeProject(values.get(DRAFT_KEY) ?? ''));
});

test('Storage errors remain visible to the caller instead of pretending a save succeeded', () => {
  assert.throws(
    () =>
      saveDraft(
        {
          setItem: () => {
            throw new Error('Quota exceeded');
          },
        },
        demoProject(),
      ),
    /Quota exceeded/,
  );
  assert.throws(
    () =>
      loadDraft({
        getItem: () => {
          throw new Error('Storage unavailable');
        },
      }),
    /Storage unavailable/,
  );
});

test('Untrusted JSON rejects null entries, array values and nonnumeric comparisons', () => {
  const project = demoProject();
  for (const invalid of [
    { ...project, criteria: [null, project.criteria[1]] },
    { ...project, alternatives: [null, project.alternatives[1]] },
    {
      ...project,
      alternatives: [{ ...project.alternatives[0], values: [] }, project.alternatives[1]],
    },
    {
      ...project,
      comparisons: Object.fromEntries(Object.keys(project.comparisons).map((key) => [key, '2'])),
    },
  ])
    assert.throws(() => decodeProject(JSON.stringify(invalid)));
});
