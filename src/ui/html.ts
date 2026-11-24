import type { Locale } from '../lib/i18n';

const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '\"': '&quot;',
  "'": '&#39;',
};
export const esc = (v: unknown): string =>
  String(v ?? '').replace(/[&<>"']/g, (c) => entities[c] ?? c);
export function numberFormats(locale: Locale) {
  const number = new Intl.NumberFormat(locale, { maximumSignificantDigits: 8 });
  const percent = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const closeness = new Intl.NumberFormat(locale, { maximumFractionDigits: 8 });
  const wholePercent = new Intl.NumberFormat(locale, { style: 'percent' });
  const signedPercent = new Intl.NumberFormat(locale, { style: 'percent', signDisplay: 'always' });
  const ratio = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  return {
    num: (value: number | null | undefined) => (value == null ? '–' : number.format(value)),
    pct: (value: number) => percent.format(value),
    wholePct: (value: number) => wholePercent.format(value),
    signedPct: (value: number) => signedPercent.format(value),
    score: (value: number | null) => (value == null ? '–' : closeness.format(value)),
    ratio: (value: number) => ratio.format(value),
  };
}
export const svg = (name: string): string => {
  const paths: Record<string, string> = {
    arrow: 'M5 12h14m-5-5 5 5-5 5',
    plus: 'M12 5v14M5 12h14',
    check: 'm5 12 4 4L19 6',
    download: 'M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4',
    chart: 'M5 19V12m7 7V5m7 14V9',
    trash: 'M4 6h16M9 6V3h6v3M7 6l1 15h8l1-15',
    copy: 'M9 9h11v11H9zM5 15H3V3h12v2',
    back: 'M19 12H5m5-5-5 5 5 5',
    up: 'M12 19V5m-5 5 5-5 5 5',
    down: 'M12 5v14m-5-5 5 5 5-5',
    chevron: 'm6 9 6 6 6-6',
    close: 'm6 6 12 12M18 6 6 18',
    info: 'M12 11v6M12 7v.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  };
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.info}"/></svg>`;
};
export const btn = (label: string, action: string, classes = '', extra = ''): string =>
  `<button class="button ${classes}" data-action="${action}" ${extra}>${label}</button>`;
