import {
  ahp,
  matrixFor,
  comparison,
  SCALE,
  TEMPLATES,
  parseNumber,
  numericValue,
  isValidCriterionValue,
} from '../lib/model';
import type { AHPResult, Alternative, Criterion, Matrix } from '../lib/types';
import type { ViewContext } from './types';
import { esc, numberFormats, svg, btn } from './html';
import { translate, type Locale } from '../lib/i18n';

export function preference(v: number, a: Criterion, b: Criterion, locale: Locale): string {
  return v === 1
    ? translate(locale, 'Both criteria are equally important.')
    : translate(locale, '{favored} is {ratio}× as important as {other}.', {
        favored: v > 1 ? a.name : b.name,
        other: v > 1 ? b.name : a.name,
        ratio: Math.round(v > 1 ? v : 1 / v),
      });
}

export function createViews(context: ViewContext) {
  const { project: p, result, dirty, ui, errorMap, locale } = context;
  const tr = (key: string, values?: Record<string, string | number>) =>
    translate(locale, key, values);
  const { num, pct, wholePct, signedPct, score, ratio } = numberFormats(locale);
  function priorities() {
    try {
      return ahp(matrixFor(p));
    } catch {
      return null;
    }
  }
  function err(field: string) {
    return tr(errorMap.get(field) || '');
  }
  function field(id: string, label: string, value: string, attrs = '', hint = '') {
    const error = err(id);
    return `<label class="field" for="${esc(id)}"><span>${label}</span><input id="${esc(id)}" value="${esc(value)}" ${attrs} ${error ? 'aria-invalid="true"' : ''} aria-describedby="${esc(id)}-help"><small id="${esc(id)}-help" class="${error ? 'field-error' : 'muted'}">${esc(error || hint)}</small></label>`;
  }
  function statusHTML(a: AHPResult | null) {
    if (!a) return `<span class="tag amber">${tr('Complete your criteria')}</span>`;
    if (!a.converged)
      return `<span class="tag amber">${tr('Review priorities: calculation did not converge')}</span>`;
    if (a.cr === null)
      return `<span class="tag neutral">${tr('Two criteria · consistency not applicable')}</span>`;
    return `<span class="tag ${a.cr < 0.1 ? 'green' : 'amber'}">${svg(a.cr < 0.1 ? 'check' : 'info')} ${tr(a.status)} · CR ${ratio(a.cr)}</span>`;
  }
  function weightRows(criteria: Criterion[], a: AHPResult | null) {
    return criteria
      .map(
        (c, j) =>
          `<div class="weight-row"><div><span>${esc(c.name || tr('Unnamed criterion'))}</span><b>${a ? pct(a.weights[j]) : '–'}</b></div><div class="track" aria-hidden="true"><span style="width:${a ? a.weights[j] * 100 : 0}%"></span></div></div>`,
      )
      .join('');
  }
  function weightSummary(criteria = p.criteria, a = priorities()) {
    return `${weightRows(criteria, a)}<div class="status-wrap">${statusHTML(a)}</div>`;
  }
  function sidebar() {
    const ranked = ui.step === 4 ? result : null;
    const { title, criteria, alternatives } = ranked?.project ?? p;
    const summaryContext = ranked
      ? dirty
        ? tr('From the last calculation. Your draft has changed.')
        : tr('The ranking uses the weights shown here.')
      : [
          tr('Weights update as you compare your criteria.'),
          tr('Enter one value per criterion for each alternative.'),
          tr('Check your weights and data before calculating.'),
        ][ui.step - 1];
    const done = alternatives.reduce(
      (s, alt) => s + criteria.filter((c) => isValidCriterionValue(alt.values[c.id], c)).length,
      0,
    );
    const total = criteria.length * alternatives.length;
    const completeness = total ? Math.floor((done / total) * 100) : 0;
    const progress = Array.from({ length: 20 }, (_, i) => {
      const fill = Math.min(100, Math.max(0, ((done / (total || 1)) * 20 - i) * 100));
      return `<span style="--fill:${fill}%"></span>`;
    }).join('');
    return `<div class="live-panel"><div class="summary-overview"><h2>${esc(title || tr('Untitled decision'))}</h2><button class="button summary-close" type="button" popovertarget="decision-summary" popovertargetaction="hide" aria-label="${esc(tr('Close decision summary'))}">${svg('close')}</button></div><div class="summary-body" id="summary-details"><p class="summary-context">${summaryContext}</p><dl class="summary-counts"><div><dt>${tr('Criteria')}</dt><dd>${criteria.length}</dd></div><div><dt>${tr('Alternatives')}</dt><dd>${alternatives.length}</dd></div></dl><div class="completion"><div><h3>${tr('Data entered')}</h3><span>${tr('{done} of {total} values', { done, total })}</span></div><b>${wholePct(completeness / 100)}</b><div class="completion-meter" aria-hidden="true">${progress}</div></div><div class="summary-weights"><h3>${tr('Criterion weights')}</h3>${weightSummary(criteria, ranked?.ahp ?? priorities())}</div></div></div>`;
  }
  function pageHeading() {
    const headings = [
      [
        tr('Criteria & priorities'),
        tr('Choose what to measure, then compare how much each criterion matters.'),
      ],
      [tr('Alternatives'), tr('Enter the measured values for each option.')],
      [
        tr('Review your decision'),
        tr('Check the weights, values, and units before ranking the alternatives.'),
      ],
      [tr('Results'), result ? '' : tr('Complete the inputs and calculate to see a ranking.')],
    ];
    const [title, description] = headings[ui.step - 1];
    return `<header class="section-heading"><h1 id="step-heading" tabindex="-1">${title}</h1>${description ? `<p>${description}</p>` : ''}</header>`;
  }
  function criteriaPage() {
    const pairs: [Criterion, Criterion][] = [];
    for (let i = 0; i < p.criteria.length; i++)
      for (let j = i + 1; j < p.criteria.length; j++) pairs.push([p.criteria[i], p.criteria[j]]);
    return `<div class="panel">${field('decision-title', `${tr('Decision name')} <span class="muted">· ${tr('optional')}</span>`, p.title, `data-field="title" maxlength="200" placeholder="${esc(tr('e.g. Choose our next supplier'))}"`)}<div class="block-heading"><h2>${tr('Your criteria')}</h2><span class="subtle">${p.criteria.length} / 10</span></div><div class="templates">${Object.entries(
      TEMPLATES,
    )
      .map(([key, t]) =>
        btn(
          svg('plus') +
            ' ' +
            tr(key === 'custom' ? 'Custom' : key === 'duration' ? 'Duration' : t.name),
          'add-criterion',
          'chip',
          `data-template="${key}" ${p.criteria.length >= 10 ? 'disabled' : ''}`,
        ),
      )
      .join('')}</div>
  <div class="criterion-list">${p.criteria.map((c, i) => `<div class="criterion-card"><div class="card-title"><h3>${tr('Criterion {number}', { number: i + 1 })}</h3><div class="spacer"></div>${btn(svg('up'), 'move-criterion', 'icon-button', `data-id="${c.id}" data-delta="-1" aria-label="${esc(tr('Move {name} up', { name: c.name }))}" ${i === 0 ? 'disabled' : ''}`)}${btn(svg('down'), 'move-criterion', 'icon-button', `data-id="${c.id}" data-delta="1" aria-label="${esc(tr('Move {name} down', { name: c.name }))}" ${i === p.criteria.length - 1 ? 'disabled' : ''}`)}${btn(svg('trash'), 'remove-criterion', 'icon-button', `data-id="${c.id}" aria-label="${esc(tr('Delete {name}', { name: c.name }))}" ${p.criteria.length <= 2 ? 'disabled' : ''}`)}</div><div class="criterion-fields">${field(`criterion-${c.id}-name`, tr('Criterion'), c.name, `data-field="criterion-name" data-id="${c.id}" maxlength="200" placeholder="${esc(tr('Name your criterion'))}"`)}${field(`criterion-${c.id}-unit`, tr('Unit'), c.unit, `data-field="criterion-unit" data-id="${c.id}" maxlength="100" placeholder="${esc(tr('e.g. hours'))}"`)}<label class="field direction-field" for="direction-${c.id}"><span>${tr('Preferred direction')}</span><span class="direction-select"><select id="direction-${c.id}" data-field="criterion-direction" data-id="${c.id}"><option value="cost" ${c.direction === 'cost' ? 'selected' : ''}>${tr('Lower is better')}</option><option value="benefit" ${c.direction === 'benefit' ? 'selected' : ''}>${tr('Higher is better')}</option></select>${svg('chevron')}</span></label></div>${c.template === 'custom' ? `<label class="checkbox"><input id="negative-${c.id}" type="checkbox" data-field="negative" data-id="${c.id}" ${c.allowNegative ? 'checked' : ''}> ${tr('Allow negative numbers')} <span class="muted">${tr('(e.g. net cost after credits)')}</span></label>` : ''}</div>`).join('')}</div><p class="small muted unit-note">${tr('Use the same unit for every alternative. Unit changes preserve the values you entered.')}</p></div>
  <div class="panel"><div class="block-heading"><h2>${tr('Compare priorities')}</h2><span class="subtle">${tr(pairs.length === 1 ? '{count} comparison' : '{count} comparisons', { count: pairs.length })}</span></div><p class="small muted">${tr('Move toward the criterion that matters more. The center means equal importance.')}</p><div class="comparisons">${pairs
    .map(([a, b]) => {
      const v = comparison(p, a.id, b.id),
        pos = SCALE.findIndex((x) => Math.abs(x - v) < 1e-10),
        touched = p.touched.includes(JSON.stringify([a.id, b.id].sort()));
      const position = 16 - pos;
      return `<div class="pair"><div class="pair-labels"><b>${esc(a.name || tr('Unnamed'))}</b><span>${tr('vs')}</span><b>${esc(b.name || tr('Unnamed'))}</b></div><div class="slider-wrap" style="--position:${(position / 16) * 100}%"><input id="pair-${a.id}-${b.id}" class="slider" type="range" min="0" max="16" step="1" value="${position}" data-field="pair" data-a="${a.id}" data-b="${b.id}" aria-label="${esc(tr('Importance: {left} versus {right}', { left: a.name, right: b.name }))}" aria-valuetext="${esc(preference(v, a, b, locale))}"></div><div class="range-labels" aria-hidden="true"><span>${tr('Favor left')}</span><span>${tr('Equal')}</span><span>${tr('Favor right')}</span></div><p id="caption-${a.id}-${b.id}" class="pair-caption">${esc(preference(v, a, b, locale))}${!touched ? ` <span class="default-label">${tr('Default: equal')}</span>` : ''}</p></div>`;
    })
    .join(
      '',
    )}</div><div class="comparison-summary"><h3>${tr('Criterion weights')}</h3><div id="comparison-weights">${weightSummary()}</div></div></div><div class="page-actions criteria-actions">${btn(tr('Continue to alternatives') + ' ' + svg('arrow'), 'next', 'primary')}</div>`;
  }
  function dataField(a: Alternative, c: Criterion, compact = false) {
    const id = `value-${a.id}-${c.id}`;
    const value = a.values[c.id] ?? '';
    const issue = err(id);
    const error = issue && !String(value).trim() ? tr('Enter a value.') : issue;
    const unit = c.unit || tr('unitless');
    const direction = tr(c.direction === 'cost' ? 'Lower is better' : 'Higher is better');
    return `<label class="field numeric-field" for="${id}">
      ${compact ? '' : `<span>${esc(c.name)}</span><span class="value-meta">${esc(unit)} · ${direction}</span>`}
      <input id="${id}" type="text" inputmode="decimal" data-field="value" data-a="${a.id}" data-c="${c.id}" value="${esc(value)}" ${error ? 'aria-invalid="true"' : ''} aria-label="${esc(a.name)}: ${esc(c.name)} (${esc(unit)})" aria-describedby="${id}-help">
      <small id="${id}-help" class="${error ? 'field-error' : 'muted'}">${esc(error)}</small>
    </label>`;
  }
  function alternativeName(a: Alternative) {
    return field(
      `alternative-${a.id}-name`,
      `<span class="visually-hidden">${tr('Alternative name')}</span>`,
      a.name,
      `data-field="alternative-name" data-id="${a.id}" maxlength="200" placeholder="${esc(tr('Alternative name'))}"`,
    );
  }
  function alternativeActions(a: Alternative) {
    const name = a.name || tr('alternative');
    return `<div class="alternative-actions">
      ${btn(svg('copy'), 'duplicate', 'icon-button', `data-id="${a.id}" aria-label="${esc(tr('Duplicate {name}', { name }))}" ${p.alternatives.length >= 100 ? 'disabled' : ''}`)}
      ${btn(svg('trash'), 'remove-alternative', 'icon-button', `data-id="${a.id}" aria-label="${esc(tr('Delete {name}', { name }))}" ${p.alternatives.length <= 2 ? 'disabled' : ''}`)}
    </div>`;
  }
  function alternativesPage() {
    const editor =
      ui.tab === 'cards'
        ? `<div class="alternatives-grid">${p.alternatives.map((a) => `<div class="panel alternative-card"><div class="alternative-heading">${alternativeName(a)}${alternativeActions(a)}</div><div class="alternative-values">${p.criteria.map((c) => dataField(a, c)).join('')}</div></div>`).join('')}</div>`
        : `<div class="panel data-sheet table-scroll" tabindex="0" role="region" aria-label="${esc(tr('Edit alternative data'))}"><table class="data-table"><thead><tr><th scope="col">${tr('Alternative')}</th>${p.criteria.map((c) => `<th scope="col">${esc(c.name)}<small>${esc(c.unit || tr('unitless'))} · ${tr(c.direction === 'cost' ? 'Lower is better' : 'Higher is better')}</small></th>`).join('')}<th scope="col">${tr('Actions')}</th></tr></thead><tbody>${p.alternatives.map((a) => `<tr><th scope="row">${alternativeName(a)}</th>${p.criteria.map((c) => `<td>${dataField(a, c, true)}</td>`).join('')}<td>${alternativeActions(a)}</td></tr>`).join('')}</tbody></table></div>`;
    return `<div class="toolbar"><span>${tr(p.alternatives.length === 1 ? '{count} alternative' : '{count} alternatives', { count: p.alternatives.length })}</span><div class="segmented">
      ${btn(tr('Cards'), 'view', ui.tab === 'cards' ? 'selected' : '', `data-view="cards" aria-pressed="${ui.tab === 'cards'}"`)}
      ${btn(tr('Table'), 'view', ui.tab === 'table' ? 'selected' : '', `data-view="table" aria-pressed="${ui.tab === 'table'}"`)}
    </div></div><p class="small muted number-note">${tr('Use plain numbers like {integer} or {decimal}. Enter {zero} for zero and leave unknown values blank.', { integer: '<b>100100</b>', decimal: '<b>1.5</b>', zero: '<b>0</b>' })}</p>
    ${editor}
    ${btn(svg('plus') + ' ' + tr('Add alternative'), 'add-alternative', 'add-block', p.alternatives.length >= 100 ? 'disabled' : '')}
    <div class="page-actions">${btn(svg('back') + ' ' + tr('Back to criteria'), 'back', 'ghost')}${btn(tr('Review decision') + ' ' + svg('arrow'), 'next', 'primary')}</div>`;
  }
  function rawTable(project = p) {
    return `<div class="table-scroll" tabindex="0" role="region" aria-label="${esc(tr('Alternative data'))}"><table><thead><tr><th>${tr('Alternative')}</th>${project.criteria.map((c) => `<th>${esc(c.name)}<small>${tr(c.direction === 'cost' ? 'Lower is better' : 'Higher is better')} · ${esc(c.unit || tr('unitless'))}</small></th>`).join('')}</tr></thead><tbody>${project.alternatives.map((a) => `<tr><th>${esc(a.name)}</th>${project.criteria.map((c) => `<td>${num(parseNumber(a.values[c.id]).value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function reviewPage() {
    const a = priorities();
    return `<div class="panel"><div class="block-heading"><h2>${esc(p.title || tr('Your decision'))}</h2></div>${statusHTML(a)}<div class="review-weights">${p.criteria.map((c, j) => `<div><span>${esc(c.name)}</span><b>${a ? pct(a.weights[j]) : '–'}</b><small>${tr(c.direction === 'cost' ? 'Lower is better' : 'Higher is better')} · ${esc(c.unit || tr('unitless'))}</small></div>`).join('')}</div>${rawTable()}<div class="divider"></div><h3>${tr('Check your data ranges')}</h3><div class="range-summary">${p.criteria
      .map((c) => {
        const values = p.alternatives.map((a) => numericValue(a.values[c.id]));
        return `<div><b>${esc(c.name)}</b><span>${tr('{min} to {max}', { min: num(Math.min(...values)), max: num(Math.max(...values)) })} ${esc(c.unit)}</span></div>`;
      })
      .join(
        '',
      )}</div><p class="small muted">${tr('All figures in a column must use the same units and time basis. A rating is still your judgment, even when entered as a number.')}</p></div><div class="panel method-note"><h2>${tr('How your ranking is calculated')}</h2><p>${tr('Your comparisons set the priorities. TOPSIS puts different units on comparable scales, applies those priorities, and measures each option against the best and worst combinations in this set.')}</p><p class="small muted">${tr('This ranking does not enforce mandatory requirements such as a strict budget or permit. Similar or duplicated criteria can count the same factor twice.')}</p></div><div class="page-actions">${btn(svg('back') + ' ' + tr('Edit alternatives'), 'back', 'ghost')}${btn(svg('chart') + ' ' + tr('Calculate ranking'), 'calculate', 'primary', !a?.converged ? 'disabled' : '')}</div>`;
  }
  function matrixTable(title: string, m: Matrix, rows: string[], cols: string[]) {
    return `<h3>${title}</h3><div class="table-scroll" tabindex="0" role="region" aria-label="${esc(title)}"><table class="matrix"><thead><tr><th></th>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${m.map((row, i) => `<tr><th>${esc(rows[i])}</th>${row.map((v) => `<td>${num(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function calculationDetails() {
    if (!result) return '';
    const { project: q, topsis: t, ahp: a } = result;
    return `${matrixTable(
      tr('Criterion comparison matrix'),
      result.matrix,
      q.criteria.map((c) => c.name),
      q.criteria.map((c) => c.name),
    )}${matrixTable(
      tr('Raw decision matrix · X'),
      t.x,
      q.alternatives.map((alt) => alt.name),
      q.criteria.map((c) => c.name),
    )}${matrixTable(
      tr('Vector-normalized matrix · R'),
      t.r,
      q.alternatives.map((alt) => alt.name),
      q.criteria.map((c) => c.name),
    )}${matrixTable(
      tr('Weighted matrix · V'),
      t.v,
      q.alternatives.map((alt) => alt.name),
      q.criteria.map((c) => c.name),
    )}${matrixTable(
      tr('Ideal combinations'),
      [t.best, t.worst],
      [tr('Best'), tr('Worst')],
      q.criteria.map((c) => c.name),
    )}<p class="small muted">${tr('These ideal combinations may draw values from different alternatives. They do not have to be actual options.')}</p>${matrixTable(
      tr('Euclidean distances'),
      t.distances.map((d) => [d.plus, d.minus]),
      q.alternatives.map((alt) => alt.name),
      [tr('To best'), tr('To worst')],
    )}<p class="small muted">${tr('AHP converged after {count} iterations. RI table: original-calculator-ri-v1. Calculation uses full precision; displayed numbers are rounded.', { count: a.iterations })}</p>`;
  }
  function resultsPage() {
    if (!result) return btn(tr('Review and calculate'), 'to-review', 'primary');
    const { project: q, topsis: t, ahp: a } = result,
      top = t.ranking.filter((row) => row.rank === 1),
      winner = top.map((row) => q.alternatives[row.index].name).join(' & ');
    const named = t.ranking.map((row) => ({ ...row, name: q.alternatives[row.index].name }));
    ui.compare = ui.compare.map((i) => Math.min(i, q.alternatives.length - 1));
    const [left, right] = ui.compare;
    return (
      (dirty
        ? `<div class="hint amber" role="status">${svg('info')}<p><b>${tr('Your inputs changed.')}</b> ${tr('These results belong to the previous calculation. Recalculate before exporting a report.')}</p>${btn(tr('Recalculate'), 'calculate', 'primary small-button')}</div>`
        : '') +
      `<div class="winner"><div class="winner-main"><div><h2>${t.indistinguishable ? tr('All alternatives are equal') : esc(winner)}</h2><p>${t.indistinguishable ? tr('The data does not distinguish these options. No recommendation can be made.') : top.length > 1 ? tr('These alternatives share first place within the numerical tolerance.') : tr('Ranks first for the criteria and data in this decision.')}</p></div><div class="winner-score"><b>${score(top[0].score)}</b><span>${tr('TOPSIS closeness score')}</span></div></div>${!t.indistinguishable ? `<p class="small">${tr('The 0–1 scale measures relative closeness to the ideal combination.')}</p>` : ''}</div>
  <div class="panel"><div class="block-heading"><h2>${tr('All alternatives')}</h2><span class="subtle">${tr('{count} evaluated', { count: q.alternatives.length })}</span></div><div class="rankings">${named.map((row) => `<div class="ranking-row"><span class="rank ${row.rank === 1 ? 'top' : ''}">${row.rank}</span><div class="ranking-name"><b>${esc(row.name)}</b><div class="track"><span style="width:${row.score === null ? 0 : row.score * 100}%"></span></div></div><b class="mono">${score(row.score)}</b></div>`).join('')}</div><div class="divider"></div>${statusHTML(a)}${a.cr !== null && a.cr >= 0.1 ? `<p class="small caution">${tr('Your criterion judgments need review. Ranking remains available, but revise conflicting comparisons before relying on it.')}</p>` : ''}${t.constants.length ? `<p class="small caution">${esc(tr('No differences on {criteria}. These criteria do not distinguish the alternatives; their weights have not been reassigned.', { criteria: t.constants.map((j) => q.criteria[j].name).join(', ') }))}</p>` : ''}</div>
  <div class="panel"><div class="block-heading"><h2>${tr('Compare original values')}</h2></div><div class="compare-selects"><label class="field">${tr('First alternative')}<select id="compare-first" data-field="compare" data-slot="0">${q.alternatives.map((alt, i) => `<option value="${i}" ${i === left ? 'selected' : ''}>${esc(alt.name)}</option>`).join('')}</select></label><label class="field">${tr('Second alternative')}<select id="compare-second" data-field="compare" data-slot="1">${q.alternatives.map((alt, i) => `<option value="${i}" ${i === right ? 'selected' : ''}>${esc(alt.name)}</option>`).join('')}</select></label></div><div class="table-scroll" tabindex="0" role="region" aria-label="${esc(tr('Compare alternatives'))}"><table><thead><tr><th>${tr('Criterion / priority')}</th><th>${esc(q.alternatives[left].name)}</th><th>${esc(q.alternatives[right].name)}</th><th>${tr('Better value')}</th></tr></thead><tbody>${q.criteria
    .map((c, j) => {
      const l = t.x[left][j],
        r = t.x[right][j],
        better =
          l === r
            ? tr('Equal')
            : (c.direction === 'cost' ? l < r : l > r)
              ? q.alternatives[left].name
              : q.alternatives[right].name;
      return `<tr><th>${esc(c.name)}<small>${pct(a.weights[j])} · ${tr(c.direction === 'cost' ? 'Lower is better' : 'Higher is better')}</small></th><td>${num(l)} ${esc(c.unit)}</td><td>${num(r)} ${esc(c.unit)}</td><td>${esc(better)}</td></tr>`;
    })
    .join(
      '',
    )}</tbody></table></div><p class="small muted">${tr('A better value on one criterion does not guarantee a higher overall rank. Closeness combines distances across all criteria.')}</p></div>
  <div class="panel"><div class="block-heading"><h2>${tr('What if your priorities change?')}</h2>${btn(ui.sensitivity ? tr('Hide scenarios') : tr('Test ±10% weights'), 'sensitivity', 'secondary', `aria-expanded="${ui.sensitivity}" aria-controls="sensitivity-results"`)}</div><p class="small muted">${tr('Try a small relative change to each weight, one at a time. All weights are then rescaled to total 100%.')}</p><div id="sensitivity-results"${ui.sensitivity ? '' : ' hidden'}>${ui.sensitivity ? `<div class="sensitivity-summary ${result.sensitivity.some((s) => s.changed) ? 'caution' : ''}">${result.sensitivity.some((s) => s.changed) ? tr('The top-ranked set changes in some tested scenarios.') : tr('The top-ranked set stays the same in the tested ±10% weight scenarios.')}</div><div class="table-scroll" tabindex="0" role="region" aria-label="${esc(tr('Sensitivity scenarios'))}"><table><thead><tr><th>${tr('Criterion')}</th><th>${tr('Change')}</th><th>${tr('Top alternatives')}</th><th>${tr('Outcome')}</th></tr></thead><tbody>${result.sensitivity.map((s) => `<tr><th>${esc(q.criteria[s.criterion].name)}</th><td>${signedPct(s.factor < 1 ? -0.1 : 0.1)}</td><td>${s.winners.map((i) => esc(q.alternatives[i].name)).join(', ')}</td><td><span class="tag ${s.changed ? 'amber' : 'green'}">${s.changed ? tr('Changed') : tr('Same top set')}</span></td></tr>`).join('')}</tbody></table></div><p class="small muted">${tr('These scenarios do not change your original AHP judgments. They have no separate consistency ratio and do not establish certainty.')}</p>` : ''}</div></div>
  <details class="panel" data-details="details" ${ui.details ? 'open' : ''}><summary>${tr('Inspect the calculation')} <span class="muted">${tr('Matrices, ideals, and distances')}</span></summary><div id="calculation-details">${ui.details ? calculationDetails() : ''}</div></details>
  <div class="hint">${svg('info')}<p>${tr('Results depend on the alternatives included, your priorities, and the normalization method. Adding an alternative or an extreme value can change the ranking. The tested weight scenarios cover only a small part of that uncertainty.')}</p></div><div class="page-actions">${btn(svg('back') + ' ' + tr('Edit inputs'), 'edit-inputs', 'ghost')}<div class="action-group">${btn(svg('download') + ' ' + tr('Project JSON'), 'export-project', 'secondary')}${btn(svg('download') + ' ' + tr('Download report'), 'export-report', 'primary', dirty ? 'disabled' : '')}</div></div>`
    );
  }

  return {
    pageHeading,
    criteriaPage,
    alternativesPage,
    reviewPage,
    resultsPage,
    sidebar,
    weightSummary,
    calculationDetails,
  };
}
