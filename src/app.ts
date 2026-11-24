import {
  criterion,
  emptyProject,
  demoProject,
  decodeProject,
  setComparison,
  SCALE,
  uid,
  validate,
  calculate,
  criterionById,
  alternativeById,
  isTemplate,
  isDirection,
} from './lib/model';
import type { Project, DecisionResult } from './lib/types';
import { loadDraft, saveDraft } from './lib/storage';
import { markdownReport, projectJSON } from './lib/report';
import { createViews, preference } from './ui/views';
import { esc, svg, btn } from './ui/html';
import type { UIState } from './ui/types';

function requiredElement<T extends HTMLElement = HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing interface element: ${selector}`);
  return element;
}
const root = requiredElement('#app');
let p: Project = emptyProject(),
  result: DecisionResult | null = null,
  dirty = false;
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let previewTimer: ReturnType<typeof setTimeout> | undefined;
let renderTimer: ReturnType<typeof setTimeout> | undefined;
let errorMap = new Map<string, string>();
const ui: UIState = {
  step: 1,
  tab: 'cards',
  validating: false,
  error: '',
  notice: '',
  save: 'Drafts save on this device',
  compare: [0, 1],
  sensitivity: false,
  details: false,
};
try {
  const stored = loadDraft(localStorage);
  if (stored) {
    p = stored;
    ui.save = 'Draft saved locally';
    ui.notice = 'Your previous draft is ready to continue.';
  }
} catch {
  ui.save = 'Local saving is unavailable. Export JSON to keep your work.';
}

function update() {
  dirty = !!result;
  ui.error = '';
  ui.save = 'Saving draft…';
  document.querySelector('#save-label')?.replaceChildren(ui.save);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      saveDraft(localStorage, p);
      ui.save = 'Draft saved locally';
    } catch {
      ui.save = 'Draft could not be saved. Export JSON to keep your work.';
    }
    document.querySelector('#save-label')?.replaceChildren(document.createTextNode(ui.save));
  }, 300);
}
function rerenderSoon() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 160);
}
function render() {
  errorMap = ui.validating
    ? new Map(validate(p, ui.step > 1).map((issue) => [issue.field, issue.message]))
    : new Map();
  const { criteriaPage, alternativesPage, reviewPage, resultsPage, sidebar } = createViews({
    project: p,
    result,
    dirty,
    ui,
    errorMap,
  });
  const active = document.activeElement;
  const tableScroll = root.querySelector('.data-table')?.parentElement;
  const tableOffsets = tableScroll && [tableScroll.scrollLeft, tableScroll.scrollTop];
  const activeButton = active instanceof HTMLButtonElement ? active : null;
  const id = active instanceof HTMLElement ? active.id : undefined;
  const input = active instanceof HTMLInputElement ? active : null;
  const start = input?.selectionStart,
    end = input?.selectionEnd;
  const pages = [criteriaPage, alternativesPage, reviewPage, resultsPage],
    labels = ['Criteria', 'Alternatives', 'Review', 'Results'];
  root.innerHTML = `<header class="site-header"><div class="brand">${svg('chart')}<span>Decision Studio</span><span class="brand-divider"></span><span class="brand-sub">AHP + TOPSIS</span></div><div class="header-actions">${btn('Try supplier example', 'demo', 'ghost')}${btn('Import project', 'import', 'ghost')}${btn('Export JSON', 'export-project', 'ghost')}</div>${btn('New decision', 'new', 'secondary new-decision')}<input id="import-file" type="file" accept=".json,application/json" hidden></header><main class="workspace"><div class="workspace-bar"><div class="save-status" role="status" id="save-label">${esc(ui.save)}</div><nav class="steps" aria-label="Decision steps">${labels.map((label, i) => `<button data-action="step" data-step="${i + 1}" class="step ${ui.step === i + 1 ? 'active' : ''} ${ui.step > i + 1 ? 'complete' : ''}" ${ui.step === i + 1 ? 'aria-current="step"' : ''}><span class="step-number" aria-hidden="true">${ui.step > i + 1 ? svg('check') : i + 1}</span><span>${label}</span></button>`).join('')}</nav></div>${ui.error ? `<div class="hint error" role="alert">${svg('info')}<p>${esc(ui.error)}</p></div>` : ''}${ui.notice ? `<div class="notice" role="status">${esc(ui.notice)}${btn('Dismiss', 'dismiss', 'ghost small-button')}</div>` : ''}<div class="workspace-grid with-summary"><section class="main-content" aria-labelledby="step-heading">${pages[ui.step - 1]()}</section><aside id="sidebar" aria-label="Decision summary">${sidebar()}</aside></div><footer><span>Built on AHP Matrix Calculator · data stays on your device</span><a href="/docs/PRD-AHP-TOPSIS.md" target="_blank" rel="noopener">Product specification ↗</a></footer></main>`;
  const nextTableScroll = root.querySelector('.data-table')?.parentElement;
  if (tableOffsets && nextTableScroll) {
    [nextTableScroll.scrollLeft, nextTableScroll.scrollTop] = tableOffsets;
  }
  if (id) {
    const el = document.getElementById(id);
    if (el) {
      el.focus({ preventScroll: true });
      if (
        start !== null &&
        start !== undefined &&
        el instanceof HTMLInputElement &&
        ['text', 'search', 'url', 'tel', 'password'].includes(el.type)
      )
        try {
          el.setSelectionRange(start, end ?? start);
        } catch {}
    }
  } else if (activeButton?.dataset.action) {
    const match = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-action]')).find(
      (button) =>
        !button.disabled &&
        Object.entries(activeButton.dataset).every(([key, value]) => button.dataset[key] === value),
    );
    match?.focus({ preventScroll: true });
  }
}
function focusStep() {
  requiredElement('#step-heading').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function go(step: number) {
  ui.validating = true;
  const issues = step >= 2 ? validate(p, step >= 3) : [];
  if (issues.length) {
    ui.step = validate(p, false).length ? 1 : 2;
    ui.error = `${issues.length} field${issues.length === 1 ? ' needs' : 's need'} attention. ${issues[0].message}`;
    render();
    (document.getElementById(issues[0].field) ?? requiredElement('#step-heading')).focus();
    return;
  }
  if (step === 4 && !result) {
    ui.error = 'Calculate your decision from the review step first.';
    ui.step = 3;
    render();
    focusStep();
    return;
  }
  ui.step = step;
  ui.validating = false;
  ui.error = '';
  render();
  focusStep();
}
function download(text: string, type: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function reset(next: Project) {
  p = next;
  result = null;
  dirty = false;
  ui.step = 1;
  ui.validating = false;
  ui.error = '';
  ui.notice = '';
  ui.compare = [0, 1];
  ui.sensitivity = false;
  ui.details = false;
  update();
  render();
  focusStep();
}
root.addEventListener('click', (e) => {
  if (!(e.target instanceof Element)) return;
  const button = e.target.closest<HTMLButtonElement>('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action,
    id = button.dataset.id;
  if (action === 'next') return go(ui.step + 1);
  if (action === 'back') return go(ui.step - 1);
  if (action === 'step') return go(Number(button.dataset.step));
  if (action === 'to-review') return go(3);
  if (action === 'edit-inputs') return go(2);
  if (action === 'dismiss') {
    ui.notice = '';
    render();
    return;
  }
  if (action === 'view') {
    ui.tab = button.dataset.view === 'table' ? 'table' : 'cards';
    render();
    return;
  }
  if (action === 'sensitivity') {
    ui.sensitivity = !ui.sensitivity;
    render();
    return;
  }
  if (action === 'new' || action === 'demo') {
    if (
      !confirm(
        action === 'new'
          ? 'Start a new decision? Export your current project first if you want to keep it.'
          : 'Load the supplier example? This replaces your current draft.',
      )
    )
      return;
    reset(action === 'demo' ? demoProject() : emptyProject());
    return;
  }
  if (action === 'import') {
    requiredElement<HTMLInputElement>('#import-file').click();
    return;
  }
  if (action === 'export-project') {
    download(projectJSON(p), 'application/json', 'decision-project.json');
    return;
  }
  if (action === 'export-report') {
    if (result && !dirty) download(markdownReport(result), 'text/markdown', 'decision-report.md');
    return;
  }
  if (action === 'calculate') {
    ui.validating = true;
    const issues = validate(p);
    if (issues.length) {
      ui.step = 2;
      ui.error = 'Complete the highlighted fields before calculating.';
      render();
      document.getElementById(issues[0].field)?.focus();
      return;
    }
    try {
      result = calculate(p);
      dirty = false;
      ui.step = 4;
      ui.error = '';
      ui.validating = false;
      render();
      focusStep();
    } catch (error) {
      ui.error = error instanceof Error ? error.message : String(error);
      render();
    }
    return;
  }
  if (action === 'add-criterion') {
    if (p.criteria.length >= 10) return;
    const c = criterion(isTemplate(button.dataset.template) ? button.dataset.template : 'custom');
    const base = c.name;
    let k = 2;
    while (base && p.criteria.some((old) => old.name.toLowerCase() === c.name.toLowerCase()))
      c.name = `${base} ${k++}`;
    p.criteria.push(c);
  } else if (action === 'remove-criterion') {
    if (p.criteria.length <= 2 || !confirm('Delete this criterion and its alternative values?'))
      return;
    p.criteria = p.criteria.filter((c) => c.id !== id);
    for (const a of p.alternatives) delete a.values[id ?? ''];
    for (const key of Object.keys(p.comparisons))
      if (JSON.parse(key).includes(id)) delete p.comparisons[key];
    p.touched = p.touched.filter((key) => !JSON.parse(key).includes(id));
  } else if (action === 'move-criterion') {
    const i = p.criteria.findIndex((c) => c.id === id),
      j = i + Number(button.dataset.delta);
    if (j < 0 || j >= p.criteria.length) return;
    [p.criteria[i], p.criteria[j]] = [p.criteria[j], p.criteria[i]];
  } else if (action === 'direction')
    criterionById(p, id).direction = isDirection(button.dataset.direction)
      ? button.dataset.direction
      : 'cost';
  else if (action === 'add-alternative') {
    if (p.alternatives.length >= 100) return;
    let name = `Alternative ${p.alternatives.length + 1}`,
      k = p.alternatives.length + 1;
    while (p.alternatives.some((a) => a.name === name)) name = `Alternative ${++k}`;
    p.alternatives.push({ id: uid(), name, values: {} });
  } else if (action === 'duplicate') {
    if (p.alternatives.length >= 100) return;
    const a = alternativeById(p, id);
    let name = `${a.name} copy`,
      k = 2;
    while (p.alternatives.some((a) => a.name === name)) name = `${a.name} copy ${k++}`;
    p.alternatives.push({ id: uid(), name, values: { ...a.values } });
  } else if (action === 'remove-alternative') {
    if (p.alternatives.length <= 2 || !confirm('Delete this alternative and its data?')) return;
    p.alternatives = p.alternatives.filter((a) => a.id !== id);
  } else return;
  update();
  render();
});
root.addEventListener('input', (e) => {
  const el = e.target;
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
  const d = el.dataset;
  if (d.field === 'title') p.title = el.value;
  else if (d.field === 'criterion-name') criterionById(p, d.id).name = el.value;
  else if (d.field === 'alternative-name') alternativeById(p, d.id).name = el.value;
  else if (d.field === 'value') alternativeById(p, d.a).values[criterionById(p, d.c).id] = el.value;
  else if (d.field === 'pair') {
    const value = SCALE[16 - Number(el.value)];
    setComparison(p, criterionById(p, d.a).id, criterionById(p, d.b).id, value);
    const a = criterionById(p, d.a),
      b = criterionById(p, d.b),
      text = preference(value, a, b);
    requiredElement(`#caption-${d.a}-${d.b}`).textContent = text;
    el.setAttribute('aria-valuetext', text);
    update();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      const views = createViews({
        project: p,
        result,
        dirty,
        ui,
        errorMap,
      });
      const sidebar = document.querySelector('#sidebar');
      const weights = document.querySelector('#comparison-weights');
      if (sidebar) sidebar.innerHTML = views.sidebar();
      if (weights) weights.innerHTML = views.weightSummary();
    }, 120);
    return;
  } else return;
  update();
  rerenderSoon();
});
root.addEventListener('change', async (e) => {
  const el = e.target;
  if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
  const d = el.dataset;
  if (el instanceof HTMLInputElement && el.id === 'import-file') {
    const file = el.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error('Project files must be smaller than 2 MB.');
      const next = decodeProject(await file.text());
      if (!confirm('Import this project and replace your current draft?')) return;
      reset(next);
      ui.notice = next.importedMethod
        ? 'This project used another method version. Results will be recalculated with the current method.'
        : 'Project imported. Review the inputs and calculate fresh results.';
      render();
    } catch (error) {
      ui.error = error instanceof Error ? error.message : String(error);
      render();
    }
    return;
  }
  if (d.field === 'criterion-unit') {
    const c = criterionById(p, d.id);
    if (c.unit === el.value) return;
    const hasData = p.alternatives.some((a) => String(a.values[c.id] ?? '').trim());
    if (
      hasData &&
      !confirm(
        'Changing this unit does not convert any numbers. Are the existing values already correct in the new unit?',
      )
    ) {
      render();
      return;
    }
    c.unit = el.value;
  } else if (d.field === 'negative')
    criterionById(p, d.id).allowNegative = el instanceof HTMLInputElement && el.checked;
  else if (d.field === 'compare') {
    ui.compare[Number(d.slot)] = Number(el.value);
    render();
    return;
  } else return;
  update();
  render();
});
root.addEventListener(
  'toggle',
  (e) => {
    if (!(e.target instanceof HTMLDetailsElement) || e.target.dataset.details !== 'details') return;
    ui.details = e.target.open;
    const details = e.target.querySelector('#calculation-details');
    if (ui.details && details && !details.hasChildNodes()) {
      details.innerHTML = createViews({
        project: p,
        result,
        dirty,
        ui,
        errorMap,
      }).calculationDetails();
    }
  },
  true,
);
render();
