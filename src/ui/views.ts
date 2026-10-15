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
import { esc, num, pct, score, svg, btn } from './html';

export function preference(v: number, a: Criterion, b: Criterion): string {
  return v === 1
    ? 'Both criteria are equally important.'
    : `${v > 1 ? a.name : b.name} is ${num(v > 1 ? v : 1 / v)}× as important as ${v > 1 ? b.name : a.name}.`;
}

export function createViews(context: ViewContext) {
  const { project: p, result, dirty, ui, errorMap } = context;
  function priorities() {
    try {
      return ahp(matrixFor(p));
    } catch {
      return null;
    }
  }
  function err(field: string) {
    return errorMap.get(field) || '';
  }
  function field(id: string, label: string, value: string, attrs = '', hint = '') {
    const error = err(id);
    return `<label class="field" for="${esc(id)}"><span>${label}</span><input id="${esc(id)}" value="${esc(value)}" ${attrs} ${error ? 'aria-invalid="true"' : ''} aria-describedby="${esc(id)}-help"><small id="${esc(id)}-help" class="${error ? 'field-error' : 'muted'}">${esc(error || hint)}</small></label>`;
  }
  function statusHTML(a: AHPResult | null) {
    if (!a) return '<span class="tag amber">Complete your criteria</span>';
    if (!a.converged)
      return '<span class="tag amber">Review priorities: calculation did not converge</span>';
    if (a.cr === null)
      return '<span class="tag neutral">Two criteria · consistency not applicable</span>';
    return `<span class="tag ${a.cr < 0.1 ? 'green' : 'amber'}">${svg(a.cr < 0.1 ? 'check' : 'info')} ${esc(a.status)} · CR ${a.cr.toFixed(3)}</span>`;
  }
  function sidebar() {
    const a = priorities();
    const done = p.alternatives.reduce(
      (s, alt) => s + p.criteria.filter((c) => isValidCriterionValue(alt.values[c.id], c)).length,
      0,
    );
    return `<div class="panel live-panel"><div class="eyebrow">YOUR DECISION</div><h3>${esc(p.title || 'An untitled decision')}</h3><div class="metrics"><div><b>${p.criteria.length}</b><span>criteria</span></div><div><b>${p.alternatives.length}</b><span>alternatives</span></div></div><div class="divider"></div><h4>What matters most</h4>${p.criteria.map((c, j) => `<div class="weight-row"><div><span>${esc(c.name || 'Unnamed criterion')}</span><b>${a ? pct(a.weights[j]) : '—'}</b></div><div class="track"><span style="width:${a ? a.weights[j] * 100 : 0}%"></span></div></div>`).join('')}<div class="status-wrap">${statusHTML(a)}</div><p class="small muted">${a?.cr === null ? 'One comparison sets the relative priorities. There is no consistency test with only two criteria.' : 'Consistency checks whether your comparisons agree with each other. It does not verify the data or the decision.'}</p><div class="divider"></div><div class="completion"><span>Alternative data</span><b>${done} / ${p.criteria.length * p.alternatives.length}</b></div><p class="small muted">Your priorities guide the ranking. Every alternative is evaluated against the same criteria.</p></div><div class="aside-note">${svg('info')}<p>Your work stays in this browser. Export a project file to move it to another device.</p></div>`;
  }
  function heading(kicker: string, title: string, description: string) {
    return `<div class="section-heading"><div class="eyebrow">${kicker}</div><h2>${title}</h2><p>${description}</p></div>`;
  }
  function criteriaPage() {
    const pairs: [Criterion, Criterion][] = [];
    for (let i = 0; i < p.criteria.length; i++)
      for (let j = i + 1; j < p.criteria.length; j++) pairs.push([p.criteria[i], p.criteria[j]]);
    return (
      heading(
        '01 / DEFINE YOUR PRIORITIES',
        'What matters to your decision?',
        'Choose the criteria, then compare how much each one matters. You can adjust everything later.',
      ) +
      `<div class="panel">${field('decision-title', 'Decision name <span class="muted">· optional</span>', p.title, 'data-field="title" maxlength="200" placeholder="e.g. Choose our next supplier"')}<div class="block-heading"><h3>Your criteria</h3><span class="subtle">${p.criteria.length} / 10</span></div><p class="small muted">Start with a template, or define your own measurable criterion.</p><div class="templates">${Object.entries(
        TEMPLATES,
      )
        .map(([key, t]) =>
          btn(
            svg('plus') +
              ' ' +
              (key === 'custom' ? 'Custom' : key === 'duration' ? 'Duration' : t.name),
            'add-criterion',
            'chip',
            `data-template="${key}" ${p.criteria.length >= 10 ? 'disabled' : ''}`,
          ),
        )
        .join('')}</div>
  <div class="criterion-list">${p.criteria.map((c, i) => `<div class="criterion-card"><div class="card-title"><span class="index">${String(i + 1).padStart(2, '0')}</span><span class="template-label">${esc(c.template === 'custom' ? 'Custom criterion' : c.template + ' template')}</span><div class="spacer"></div>${btn('↑', 'move-criterion', 'icon-button', `data-id="${c.id}" data-delta="-1" aria-label="Move ${esc(c.name)} up" ${i === 0 ? 'disabled' : ''}`)}${btn('↓', 'move-criterion', 'icon-button', `data-id="${c.id}" data-delta="1" aria-label="Move ${esc(c.name)} down" ${i === p.criteria.length - 1 ? 'disabled' : ''}`)}${btn(svg('trash'), 'remove-criterion', 'icon-button', `data-id="${c.id}" aria-label="Delete ${esc(c.name)}" ${p.criteria.length <= 2 ? 'disabled' : ''}`)}</div><div class="criterion-fields">${field(`criterion-${c.id}-name`, 'Criterion', c.name, `data-field="criterion-name" data-id="${c.id}" maxlength="200" placeholder="Name your criterion"`)}${field(`criterion-${c.id}-unit`, 'Unit', c.unit, `data-field="criterion-unit" data-id="${c.id}" maxlength="100" placeholder="e.g. hours"`, 'One shared unit for all alternatives.')}</div><div class="direction"><span class="small">Better performance means</span><div class="segmented">${btn('↓ Lower values', 'direction', c.direction === 'cost' ? 'selected' : '', `data-id="${c.id}" data-direction="cost" aria-pressed="${c.direction === 'cost'}"`)}${btn('↑ Higher values', 'direction', c.direction === 'benefit' ? 'selected' : '', `data-id="${c.id}" data-direction="benefit" aria-pressed="${c.direction === 'benefit'}"`)}</div></div>${c.template === 'custom' ? `<label class="checkbox"><input type="checkbox" data-field="negative" data-id="${c.id}" ${c.allowNegative ? 'checked' : ''}> Allow negative numbers <span class="muted">(e.g. net cost after credits)</span></label>` : ''}</div>`).join('')}</div><div class="hint">${svg('info')}<p>Price is usually lower-is-better. Battery life is higher-is-better. Choose the direction that fits your decision; units are labels, not automatic conversions.</p></div></div>
  <div class="panel"><div class="block-heading"><h3>Compare priorities</h3><span class="subtle">${pairs.length} comparison${pairs.length === 1 ? '' : 's'}</span></div><p class="small muted">Move toward the criterion that matters more. The center means equal importance.</p><div class="comparisons">${pairs
    .map(([a, b]) => {
      const v = comparison(p, a.id, b.id),
        pos = SCALE.findIndex((x) => Math.abs(x - v) < 1e-10),
        touched = p.touched.includes(JSON.stringify([a.id, b.id].sort()));
      return `<div class="pair"><div class="pair-labels"><b>${esc(a.name || 'Unnamed')}</b><span>vs</span><b>${esc(b.name || 'Unnamed')}</b></div><input id="pair-${a.id}-${b.id}" class="slider" type="range" min="0" max="16" step="1" value="${16 - pos}" data-field="pair" data-a="${a.id}" data-b="${b.id}" aria-label="Importance: ${esc(a.name)} versus ${esc(b.name)}" aria-valuetext="${esc(preference(v, a, b))}"><div class="range-labels"><span>More important</span><span>Equal</span><span>More important</span></div><p id="caption-${a.id}-${b.id}" class="pair-caption">${esc(preference(v, a, b))}${!touched ? ' <span class="default-label">Default: equal</span>' : ''}</p></div>`;
    })
    .join(
      '',
    )}</div></div><div class="page-actions"><span class="small muted">Priorities update as you compare.</span>${btn('Continue to alternatives ' + svg('arrow'), 'next', 'primary')}</div>`
    );
  }
  function dataField(a: Alternative, c: Criterion, compact = false) {
    const id = `value-${a.id}-${c.id}`,
      error = err(id);
    return `<label class="field numeric-field" for="${id}">${compact ? '' : `<span>${esc(c.name)} <span class="direction-label">${c.direction === 'cost' ? '↓ lower' : '↑ higher'}</span></span>`}<span class="input-unit"><input id="${id}" type="text" inputmode="decimal" data-field="value" data-a="${a.id}" data-c="${c.id}" value="${esc(a.values[c.id] ?? '')}" placeholder="0" ${error ? 'aria-invalid="true"' : ''} aria-label="${esc(a.name)}: ${esc(c.name)} (${esc(c.unit || 'unitless')})" aria-describedby="${id}-help"><span>${esc(c.unit)}</span></span><small id="${id}-help" class="${error ? 'field-error' : 'muted'}">${esc(error || (!compact && String(a.values[c.id] ?? '').trim() && !parseNumber(a.values[c.id]).error ? 'Interpreted as ' + num(parseNumber(a.values[c.id]).value) + ' ' + c.unit : ''))}</small></label>`;
  }
  function alternativesPage() {
    return (
      heading(
        '02 / ENTER THE FACTS',
        'Meet your alternatives.',
        'Add the options you are considering. Enter their real values against the same criteria.',
      ) +
      `<div class="hint blue">${svg('info')}<p>Use <b>100100</b> for one hundred thousand one hundred, and <b>1.5</b> for a decimal. No commas, currency symbols, or “jt” in fields. Zero is valid; blank means missing. Units are shared across all alternatives.</p></div><div class="toolbar"><span><b>${p.alternatives.length}</b> alternatives <span class="muted">/ 100</span></span><div class="segmented">${btn('Cards', 'view', ui.tab === 'cards' ? 'selected' : '', `data-view="cards" aria-pressed="${ui.tab === 'cards'}"`)}${btn('Table', 'view', ui.tab === 'table' ? 'selected' : '', `data-view="table" aria-pressed="${ui.tab === 'table'}"`)}</div></div>` +
      (ui.tab === 'cards'
        ? `<div class="alternatives-grid">${p.alternatives.map((a, i) => `<div class="panel alternative-card"><div class="card-title"><span class="index">${String(i + 1).padStart(2, '0')}</span><div class="spacer"></div>${btn(svg('copy'), 'duplicate', 'icon-button', `data-id="${a.id}" aria-label="Duplicate ${esc(a.name)}" ${p.alternatives.length >= 100 ? 'disabled' : ''}`)}${btn(svg('trash'), 'remove-alternative', 'icon-button', `data-id="${a.id}" aria-label="Delete ${esc(a.name)}" ${p.alternatives.length <= 2 ? 'disabled' : ''}`)}</div>${field(`alternative-${a.id}-name`, 'Alternative name', a.name, `data-field="alternative-name" data-id="${a.id}" maxlength="200"`)}${p.criteria.map((c) => dataField(a, c)).join('')}</div>`).join('')}</div>`
        : `<div class="panel table-scroll"><table class="data-table"><thead><tr><th>Alternative</th>${p.criteria.map((c) => `<th>${esc(c.name)}<small>${c.direction === 'cost' ? '↓ Lower' : '↑ Higher'} · ${esc(c.unit || 'unitless')}</small></th>`).join('')}<th>Actions</th></tr></thead><tbody>${p.alternatives.map((a) => `<tr><td>${field(`alternative-${a.id}-name`, '', a.name, `data-field="alternative-name" data-id="${a.id}" maxlength="200" aria-label="Alternative name"`)}</td>${p.criteria.map((c) => `<td>${dataField(a, c, true)}</td>`).join('')}<td>${btn(svg('copy'), 'duplicate', 'icon-button', `data-id="${a.id}" aria-label="Duplicate ${esc(a.name)}" ${p.alternatives.length >= 100 ? 'disabled' : ''}`)}${btn(svg('trash'), 'remove-alternative', 'icon-button', `data-id="${a.id}" aria-label="Delete ${esc(a.name)}" ${p.alternatives.length <= 2 ? 'disabled' : ''}`)}</td></tr>`).join('')}</tbody></table></div>`) +
      btn(
        svg('plus') + ' Add alternative',
        'add-alternative',
        'add-block',
        p.alternatives.length >= 100 ? 'disabled' : '',
      ) +
      `<div class="page-actions">${btn(svg('back') + ' Back to criteria', 'back', 'ghost')}${btn('Review decision ' + svg('arrow'), 'next', 'primary')}</div>`
    );
  }
  function rawTable(project = p) {
    return `<div class="table-scroll"><table><thead><tr><th>Alternative</th>${project.criteria.map((c) => `<th>${esc(c.name)}<small>${c.direction === 'cost' ? '↓ Lower' : '↑ Higher'} · ${esc(c.unit || 'unitless')}</small></th>`).join('')}</tr></thead><tbody>${project.alternatives.map((a) => `<tr><th>${esc(a.name)}</th>${project.criteria.map((c) => `<td>${num(parseNumber(a.values[c.id]).value)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function reviewPage() {
    const a = priorities();
    return (
      heading(
        '03 / REVIEW & CALCULATE',
        'Ready for a clearer comparison?',
        'Check the facts and priorities before evaluating all alternatives together.',
      ) +
      `<div class="panel"><div class="block-heading"><h3>${esc(p.title || 'Your decision')}</h3><span class="tag neutral">AHP + TOPSIS</span></div>${statusHTML(a)}<div class="review-weights">${p.criteria.map((c, j) => `<div><span>${esc(c.name)}</span><b>${a ? pct(a.weights[j]) : '—'}</b><small>${c.direction === 'cost' ? 'Lower' : 'Higher'} is better · ${esc(c.unit || 'unitless')}</small></div>`).join('')}</div>${rawTable()}<div class="divider"></div><h4>Check your data ranges</h4><div class="range-summary">${p.criteria
        .map((c) => {
          const values = p.alternatives.map((a) => numericValue(a.values[c.id]));
          return `<div><b>${esc(c.name)}</b><span>${num(Math.min(...values))} – ${num(Math.max(...values))} ${esc(c.unit)}</span></div>`;
        })
        .join(
          '',
        )}</div><p class="small muted">All figures in a column must use the same units and time basis. A rating is still your judgment, even when entered as a number.</p></div><div class="panel method-note"><h3>How your ranking is calculated</h3><p>Your comparisons set the priorities. TOPSIS puts different units on comparable scales, applies those priorities, and measures each option against the best and worst combinations in this set.</p><p class="small muted">This ranking does not enforce mandatory requirements such as a strict budget or permit. Similar or duplicated criteria can count the same factor twice.</p></div><div class="page-actions">${btn(svg('back') + ' Edit alternatives', 'back', 'ghost')}${btn(svg('chart') + ' Calculate ranking', 'calculate', 'primary', !a?.converged ? 'disabled' : '')}</div>`
    );
  }
  function matrixTable(title: string, m: Matrix, rows: string[], cols: string[]) {
    return `<h4>${title}</h4><div class="table-scroll"><table class="matrix"><thead><tr><th></th>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${m.map((row, i) => `<tr><th>${esc(rows[i])}</th>${row.map((v) => `<td>${num(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function resultsPage() {
    if (!result)
      return (
        heading(
          '04 / RESULTS',
          'Your comparison will appear here.',
          'Complete the inputs and calculate to see a ranking.',
        ) + btn('Review and calculate', 'to-review', 'primary')
      );
    const { project: q, topsis: t, ahp: a } = result,
      top = t.ranking.filter((row) => row.rank === 1),
      winner = top.map((row) => q.alternatives[row.index].name).join(' & ');
    const named = t.ranking.map((row) => ({ ...row, name: q.alternatives[row.index].name }));
    ui.compare = ui.compare.map((i) => Math.min(i, q.alternatives.length - 1));
    const [left, right] = ui.compare;
    return (
      heading(
        '04 / YOUR DECISION, EXPLAINED',
        'A comparison you can trace.',
        'This ranking follows your stated priorities and the data you entered.',
      ) +
      (dirty
        ? `<div class="hint amber" role="status">${svg('info')}<p><b>Your inputs changed.</b> These results belong to the previous calculation. Recalculate before exporting a report.</p>${btn('Recalculate', 'calculate', 'primary small-button')}</div>`
        : '') +
      `<div class="winner"><div class="eyebrow">${t.indistinguishable ? 'NO DIFFERENCE IN THE DATA' : top.length > 1 ? 'JOINT TOP ALTERNATIVES' : 'TOP-RANKED ALTERNATIVE'}</div><div class="winner-main"><div><h2>${t.indistinguishable ? 'All alternatives are equal' : esc(winner)}</h2><p>${t.indistinguishable ? 'The data does not distinguish these options. No recommendation can be made.' : top.length > 1 ? 'These alternatives share first place within the numerical tolerance.' : 'Closest to the ideal combination in this analysis.'}</p></div><div class="winner-score"><b>${score(top[0].score)}</b><span>closeness score / 1</span></div></div><p class="small">This is a relative position, not a probability or confidence level.</p></div>
  <div class="panel"><div class="block-heading"><h3>All alternatives</h3><span class="subtle">${q.alternatives.length} evaluated</span></div><div class="rankings">${named.map((row) => `<div class="ranking-row"><span class="rank ${row.rank === 1 ? 'top' : ''}">${row.rank}</span><div class="ranking-name"><b>${esc(row.name)}</b><div class="track"><span style="width:${row.score === null ? 0 : row.score * 100}%"></span></div></div><b class="mono">${score(row.score)}</b></div>`).join('')}</div><div class="divider"></div>${statusHTML(a)}${a.cr !== null && a.cr >= 0.1 ? '<p class="small caution">Your criterion judgments need review. Ranking remains available, but revise conflicting comparisons before relying on it.</p>' : ''}${t.constants.length ? `<p class="small caution">No differences on ${t.constants.map((j) => esc(q.criteria[j].name)).join(', ')}. These criteria do not distinguish the alternatives; their weights have not been reassigned.</p>` : ''}</div>
  <div class="panel"><div class="block-heading"><h3>Compare the facts</h3><span class="subtle">Original values</span></div><div class="compare-selects"><label class="field">First alternative<select data-field="compare" data-slot="0">${q.alternatives.map((alt, i) => `<option value="${i}" ${i === left ? 'selected' : ''}>${esc(alt.name)}</option>`).join('')}</select></label><label class="field">Second alternative<select data-field="compare" data-slot="1">${q.alternatives.map((alt, i) => `<option value="${i}" ${i === right ? 'selected' : ''}>${esc(alt.name)}</option>`).join('')}</select></label></div><div class="table-scroll"><table><thead><tr><th>Criterion / priority</th><th>${esc(q.alternatives[left].name)}</th><th>${esc(q.alternatives[right].name)}</th><th>Better value</th></tr></thead><tbody>${q.criteria
    .map((c, j) => {
      const l = t.x[left][j],
        r = t.x[right][j],
        better =
          l === r
            ? 'Equal'
            : (c.direction === 'cost' ? l < r : l > r)
              ? q.alternatives[left].name
              : q.alternatives[right].name;
      return `<tr><th>${esc(c.name)}<small>${pct(a.weights[j])} · ${c.direction === 'cost' ? 'lower' : 'higher'} is better</small></th><td>${num(l)} ${esc(c.unit)}</td><td>${num(r)} ${esc(c.unit)}</td><td>${esc(better)}</td></tr>`;
    })
    .join(
      '',
    )}</tbody></table></div><p class="small muted">A better value on one criterion does not guarantee a higher overall rank. Closeness combines distances across all criteria.</p></div>
  <div class="panel"><div class="block-heading"><h3>What if your priorities change?</h3>${btn(ui.sensitivity ? 'Hide scenarios' : 'Test ±10% weights', 'sensitivity', 'secondary')}</div><p class="small muted">Try a small relative change to each weight, one at a time. All weights are then rescaled to total 100%.</p>${ui.sensitivity ? `<div class="sensitivity-summary ${result.sensitivity.some((s) => s.changed) ? 'caution' : ''}">${result.sensitivity.some((s) => s.changed) ? 'The top-ranked set changes in some tested scenarios.' : 'The top-ranked set stays the same in the tested ±10% weight scenarios.'}</div><div class="table-scroll"><table><thead><tr><th>Criterion</th><th>Change</th><th>Top alternatives</th><th>Outcome</th></tr></thead><tbody>${result.sensitivity.map((s) => `<tr><th>${esc(q.criteria[s.criterion].name)}</th><td>${s.factor < 1 ? '−10%' : '+10%'}</td><td>${s.winners.map((i) => esc(q.alternatives[i].name)).join(', ')}</td><td><span class="tag ${s.changed ? 'amber' : 'green'}">${s.changed ? 'Changed' : 'Same top set'}</span></td></tr>`).join('')}</tbody></table></div><p class="small muted">These scenarios do not change your original AHP judgments. They have no separate consistency ratio and do not establish certainty.</p>` : ''}</div>
  <details class="panel" data-details="details" ${ui.details ? 'open' : ''}><summary>Inspect the calculation <span class="muted">Matrices, ideals, and distances</span></summary>${matrixTable(
    'Criterion comparison matrix',
    result.matrix,
    q.criteria.map((c) => c.name),
    q.criteria.map((c) => c.name),
  )}${matrixTable(
    'Raw decision matrix · X',
    t.x,
    q.alternatives.map((alt) => alt.name),
    q.criteria.map((c) => c.name),
  )}${matrixTable(
    'Vector-normalized matrix · R',
    t.r,
    q.alternatives.map((alt) => alt.name),
    q.criteria.map((c) => c.name),
  )}${matrixTable(
    'Weighted matrix · V',
    t.v,
    q.alternatives.map((alt) => alt.name),
    q.criteria.map((c) => c.name),
  )}${matrixTable(
    'Ideal combinations',
    [t.best, t.worst],
    ['Best', 'Worst'],
    q.criteria.map((c) => c.name),
  )}<p class="small muted">These ideal combinations may draw values from different alternatives. They do not have to be actual options.</p>${matrixTable(
    'Euclidean distances',
    t.distances.map((d) => [d.plus, d.minus]),
    q.alternatives.map((alt) => alt.name),
    ['To best', 'To worst'],
  )}<p class="small muted">AHP converged after ${a.iterations} iterations. RI table: original-calculator-ri-v1. Calculation uses full precision; displayed numbers are rounded.</p></details>
  <div class="hint">${svg('info')}<p>Results depend on the alternatives included, your priorities, and the normalization method. Adding an alternative or an extreme value can change the ranking. The tested weight scenarios cover only a small part of that uncertainty.</p></div><div class="page-actions">${btn(svg('back') + ' Edit inputs', 'edit-inputs', 'ghost')}<div class="action-group">${btn(svg('download') + ' Project JSON', 'export-project', 'secondary')}${btn(svg('download') + ' Download report', 'export-report', 'primary', dirty ? 'disabled' : '')}</div></div>`
    );
  }

  return { criteriaPage, alternativesPage, reviewPage, resultsPage, sidebar };
}
