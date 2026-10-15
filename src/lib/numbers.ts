import type { ParsedNumber } from './types';

export function parseNumber(raw: unknown): ParsedNumber {
  const text = String(raw ?? '').trim();
  if (!text) return { error: 'Enter a value. Zero is allowed.' };
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text)) {
    return { error: 'Use numbers such as 100100 or 1.5. No commas or suffixes.' };
  }
  const value = Number(text);
  return Number.isFinite(value) ? { value } : { error: 'Enter a finite number.' };
}

/** Call after validation, or handle the error at the UI/import seam. */
export function numericValue(raw: unknown): number {
  const parsed = parseNumber(raw);
  if (parsed.error !== undefined) throw new Error(parsed.error);
  return parsed.value;
}
