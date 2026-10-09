/**
 * Read a number from the URL. Shared links get edited by hand, so anything
 * that isn't a finite number inside [min, max] is treated as absent.
 */
export function numParam(params: URLSearchParams, key: string, min: number, max: number, int = false): number | null {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return null;
  const n = Number(raw.replace(/[,\s₹]/g, ""));
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return int ? Math.round(n) : n;
}

export function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | null {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : null;
}
