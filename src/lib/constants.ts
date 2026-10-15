import type { Criterion, Template } from './types';

export const METHOD = 'ahp-topsis-vector-euclidean-v1';
export const RI_VERSION = 'original-calculator-ri-v1';
export const RI: Readonly<Record<number, number>> = Object.freeze({
  3: 0.52,
  4: 0.89,
  5: 1.11,
  6: 1.25,
  7: 1.35,
  8: 1.4,
  9: 1.45,
  10: 1.49,
});
export const SCALE: readonly number[] = [
  1 / 9,
  1 / 8,
  1 / 7,
  1 / 6,
  1 / 5,
  1 / 4,
  1 / 3,
  1 / 2,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
];
export const TEMPLATES: Record<Template, Omit<Criterion, 'id' | 'template'>> = {
  price: { name: 'Price', direction: 'cost', unit: 'Rp', allowNegative: false },
  duration: { name: 'Delivery time', direction: 'cost', unit: 'days', allowNegative: false },
  distance: { name: 'Distance', direction: 'cost', unit: 'km', allowNegative: false },
  capacity: { name: 'Capacity', direction: 'benefit', unit: 'units', allowNegative: false },
  custom: { name: '', direction: 'benefit', unit: '', allowNegative: false },
};
export function isTemplate(value: unknown): value is Template {
  return typeof value === 'string' && Object.hasOwn(TEMPLATES, value);
}
export function isDirection(value: unknown): value is Criterion['direction'] {
  return value === 'cost' || value === 'benefit';
}
