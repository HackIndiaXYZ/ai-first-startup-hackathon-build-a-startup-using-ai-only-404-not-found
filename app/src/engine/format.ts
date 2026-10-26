const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** ₹1,23,456 */
export function rupees(n: number): string {
  const sign = n < 0 ? "−" : "";
  return `${sign}₹${inr.format(Math.abs(Math.round(n)))}`;
}

/** ₹1.23 lakh / ₹45,600 */
export function rupeesShort(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(2)} cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(2)} lakh`;
  return `${sign}₹${inr.format(Math.round(a))}`;
}

export function num(n: number, digits = 0): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n);
}

export function kw(n: number): string {
  return `${n.toFixed(2)} kWp`;
}

export function years(n: number | null): string {
  if (n === null) return "beyond 25 yrs";
  return `${n.toFixed(1)} yrs`;
}
