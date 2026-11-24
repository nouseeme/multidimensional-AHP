const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '\"': '&quot;',
  "'": '&#39;',
};
export const esc = (v: unknown): string =>
  String(v ?? '').replace(/[&<>"']/g, (c) => entities[c] ?? c);
export const num = (v: number | null | undefined): string =>
  v == null ? '—' : new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8 }).format(v);
export const pct = (v: number): string => (v * 100).toFixed(1) + '%';
export const score = (v: number | null): string =>
  v == null ? '—' : v.toFixed(8).replace(/0+$/, '').replace(/\.$/, '');
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
    info: 'M12 11v6M12 7v.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  };
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.info}"/></svg>`;
};
export const btn = (label: string, action: string, classes = '', extra = ''): string =>
  `<button class="button ${classes}" data-action="${action}" ${extra}>${label}</button>`;
