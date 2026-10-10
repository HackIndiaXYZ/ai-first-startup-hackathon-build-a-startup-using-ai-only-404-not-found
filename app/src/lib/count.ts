// Pure helpers for the count-up figures on the landing page.

/** A figure like "₹78,000" or "8.9%", split so it can be counted up. */
export interface CountSpec {
  pre: string;
  target: number;
  decimals: number;
  grouped: boolean;
  post: string;
}

export function parseCount(text: string): CountSpec | null {
  const m = text.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const [, pre, digits, post] = m;
  return { pre, target: Number(digits.replace(/,/g, "")), decimals: (digits.split(".")[1] ?? "").length, grouped: digits.includes(","), post };
}

/** Format an in-between value the way the final figure is written (Indian grouping). */
export function formatCount(spec: CountSpec, v: number): string {
  const s = v.toFixed(spec.decimals);
  if (!spec.grouped) return `${spec.pre}${s}${spec.post}`;
  const [int, dec] = s.split(".");
  const g = Number(int).toLocaleString("en-IN");
  return `${spec.pre}${dec ? `${g}.${dec}` : g}${spec.post}`;
}
