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
import { isLocale, LOCALES, translate, type Locale } from './lib/i18n';
import type { UIState } from './ui/types';

function requiredElement<T extends HTMLElement = HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing interface element: ${selector}`);
  return element;
}
const root = requiredElement('#app');
const desktopSummary = window.matchMedia('(min-width: 72rem)');
const LOCALE_KEY = 'decision-studio-locale';
let locale: Locale = 'en';
try {
  const savedLocale = localStorage.getItem(LOCALE_KEY);
  if (isLocale(savedLocale)) locale = savedLocale;
} catch {
  // Language remains available for this session when browser storage is disabled.
}
const tr = (key: string, values?: Record<string, string | number>) =>
  translate(locale, key, values);
let pristine = true;
let p: Project = emptyProject(locale),
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
    pristine = false;
    ui.save = 'Draft saved locally';
  }
} catch {
  ui.save = 'Local saving is unavailable. Export JSON to keep your work.';
}

function updateSaveStatus() {
  document.querySelector('#save-label')?.replaceChildren(tr(ui.save));
}

function update() {
  pristine = false;
  dirty = !!result;
  ui.error = '';
  ui.save = 'Saving draft…';
  updateSaveStatus();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      saveDraft(localStorage, p);
      ui.save = 'Draft saved locally';
    } catch {
      ui.save = 'Draft could not be saved. Export JSON to keep your work.';
    }
    updateSaveStatus();
  }, 300);
}
function rerenderSoon() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, 160);
}
function placeSummary() {
  const popover = requiredElement('#decision-summary');
  const host = desktopSummary.matches ? requiredElement('#summary-dock') : popover;
  if (desktopSummary.matches) popover.hidePopover();
  const sidebar = requiredElement('#sidebar');
  if (sidebar.parentElement !== host) host.append(sidebar);
}
function render() {
  document.documentElement.lang = locale;
  errorMap = ui.validating
    ? new Map(validate(p, ui.step > 1).map((issue) => [issue.field, issue.message]))
    : new Map();
  const { criteriaPage, alternativesPage, reviewPage, resultsPage, sidebar, pageHeading } =
    createViews({
      locale,
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
  const pages = [criteriaPage, alternativesPage, reviewPage, resultsPage];
  const errorText =
    typeof ui.error === 'string'
      ? tr(ui.error)
      : tr(
          ui.error.count === 1
            ? '{count} field needs attention.'
            : '{count} fields need attention.',
          ui.error,
        ) +
        ' ' +
        tr(ui.error.message);
  const summaryWasOpen = root.querySelector('#decision-summary:popover-open') !== null;
  root.innerHTML = `
    <header class="site-header">
      <div class="brand">${svg('chart')}<div><strong>Decision Studio</strong><span>AHP + TOPSIS</span></div></div>
      <button class="button project-trigger" id="project-trigger" type="button" popovertarget="project-actions">${tr('Project')} ${svg('chevron')}</button>
      <div class="project-actions" id="project-actions" popover aria-label="${esc(tr('Project actions'))}">
        ${btn(tr('New decision'), 'new', 'ghost')}
        ${btn(tr('Try supplier example'), 'demo', 'ghost')}
        ${btn(tr('Import project'), 'import', 'ghost')}
        ${btn(tr('Export JSON'), 'export-project', 'ghost')}
        <label class="field locale-field" for="project-locale"><span>${tr('Language')}</span><select id="project-locale" data-field="locale">${Object.entries(
          LOCALES,
        )
          .map(
            ([code, name]) =>
              `<option value="${code}" lang="${code}" ${locale === code ? 'selected' : ''}>${name}</option>`,
          )
          .join('')}</select></label>
      </div>
      <input id="import-file" type="file" accept=".json,application/json" hidden>
    </header>
    <main class="workspace">
      <div class="step-progress">
        <span id="progress-label">${tr('Step {step} of {total}', { step: ui.step, total: pages.length })}</span>
        <progress aria-labelledby="progress-label" max="${pages.length}" value="${ui.step}"></progress>
      </div>
      ${pageHeading()}
      ${ui.error ? `<div class="hint error" role="alert">${svg('info')}<p>${esc(errorText)}</p></div>` : ''}
      ${ui.notice ? `<div class="notice" role="status">${esc(tr(ui.notice))}${btn(tr('Dismiss'), 'dismiss', 'ghost small-button')}</div>` : ''}
      <div class="workspace-content">
        <section class="main-content" aria-labelledby="step-heading">${pages[ui.step - 1]()}</section>
        <div id="summary-dock"></div>
      </div>
      <footer>
        <span role="status" id="save-label">${esc(tr(ui.save))}</span>
        <a href="/docs/PRD-AHP-TOPSIS.md" target="_blank" rel="noopener">${tr('Product specification')} ↗</a>
        <span>${tr('Built on AHP Matrix Calculator')}</span>
      </footer>
    </main>
    <button class="button summary-trigger" id="summary-trigger" type="button" popovertarget="decision-summary">${svg('chart')} ${tr('Decision summary')}</button>
    <div id="decision-summary" popover>
      <aside id="sidebar" aria-label="${esc(tr('Decision summary'))}">${sidebar()}</aside>
    </div>`;
  placeSummary();
  if (summaryWasOpen && !desktopSummary.matches) requiredElement('#decision-summary').showPopover();
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
  requiredElement('#decision-summary').hidePopover();
  requiredElement('#step-heading').focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function go(step: number) {
  ui.validating = true;
  const issues = step >= 2 ? validate(p, step >= 3) : [];
  if (issues.length) {
    ui.step = validate(p, false).length ? 1 : 2;
    ui.error = { count: issues.length, message: issues[0].message };
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
  if (button.closest('#project-actions')) requiredElement('#project-actions').hidePopover();
  if (action === 'next') return go(ui.step + 1);
  if (action === 'back') return go(ui.step - 1);
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
        tr(
          action === 'new'
            ? 'Start a new decision? Export your current project first if you want to keep it.'
            : 'Load the supplier example? This replaces your current draft.',
        ),
      )
    )
      return;
    reset(action === 'demo' ? demoProject(locale) : emptyProject(locale));
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
    if (result && !dirty)
      download(markdownReport(result, locale), 'text/markdown', 'decision-report.md');
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
    const c = criterion(
      isTemplate(button.dataset.template) ? button.dataset.template : 'custom',
      locale,
    );
    const base = c.name;
    let k = 2;
    while (base && p.criteria.some((old) => old.name.toLowerCase() === c.name.toLowerCase()))
      c.name = `${base} ${k++}`;
    p.criteria.push(c);
  } else if (action === 'remove-criterion') {
    if (p.criteria.length <= 2 || !confirm(tr('Delete this criterion and its alternative values?')))
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
  } else if (action === 'add-alternative') {
    if (p.alternatives.length >= 100) return;
    let k = p.alternatives.length + 1;
    let name = tr('Alternative {number}', { number: k });
    while (p.alternatives.some((a) => a.name === name))
      name = tr('Alternative {number}', { number: ++k });
    p.alternatives.push({ id: uid(), name, values: {} });
  } else if (action === 'duplicate') {
    if (p.alternatives.length >= 100) return;
    const a = alternativeById(p, id);
    const base = tr('{name} copy', { name: a.name });
    let name = base;
    let k = 2;
    while (p.alternatives.some((a) => a.name === name)) name = `${base} ${k++}`;
    p.alternatives.push({ id: uid(), name, values: { ...a.values } });
  } else if (action === 'remove-alternative') {
    if (p.alternatives.length <= 2 || !confirm(tr('Delete this alternative and its data?'))) return;
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
    const position = Number(el.value);
    const value = SCALE[16 - position];
    setComparison(p, criterionById(p, d.a).id, criterionById(p, d.b).id, value);
    const a = criterionById(p, d.a),
      b = criterionById(p, d.b),
      text = preference(value, a, b, locale);
    requiredElement(`#caption-${d.a}-${d.b}`).textContent = text;
    el.setAttribute('aria-valuetext', text);
    el.parentElement?.style.setProperty('--position', `${(position / 16) * 100}%`);
    update();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      const views = createViews({
        locale,
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
      const next = decodeProject(await file.text(), false, locale);
      if (!confirm(tr('Import this project and replace your current draft?'))) return;
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
  if (d.field === 'locale' && isLocale(el.value) && el.value !== locale) {
    locale = el.value;
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      // Keep the selected language for the current session.
    }
    if (pristine) p = emptyProject(locale);
    render();
    requiredElement('#project-trigger').focus({ preventScroll: true });
    return;
  }
  if (d.field === 'criterion-direction' && isDirection(el.value)) {
    criterionById(p, d.id).direction = el.value;
  } else if (d.field === 'criterion-unit') {
    const c = criterionById(p, d.id);
    if (c.unit === el.value) return;
    const hasData = p.alternatives.some((a) => String(a.values[c.id] ?? '').trim());
    if (
      hasData &&
      !confirm(
        tr(
          'Changing this unit does not convert any numbers. Are the existing values already correct in the new unit?',
        ),
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
        locale,
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
desktopSummary.addEventListener('change', placeSummary);
render();
