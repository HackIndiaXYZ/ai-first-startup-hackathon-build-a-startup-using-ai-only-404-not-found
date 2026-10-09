import type { Zone } from "./types";

// Household electricity use by month, relative to the yearly mean. Shapes follow
// the cooling and heating seasons of each climate zone (summer AC peaks in the
// north, flatter profiles in the south, winter heating in the hills).
const RAW: Record<Zone, number[]> = {
  north: [0.8, 0.72, 0.82, 1.05, 1.3, 1.38, 1.25, 1.15, 1.1, 0.95, 0.75, 0.78],
  west: [0.88, 0.86, 0.98, 1.12, 1.2, 1.08, 0.98, 0.95, 0.98, 1.04, 0.98, 0.92],
  south: [0.92, 0.95, 1.08, 1.18, 1.15, 1.0, 0.94, 0.93, 0.95, 0.97, 0.95, 0.94],
  east: [0.8, 0.82, 0.98, 1.15, 1.25, 1.22, 1.12, 1.1, 1.08, 1.0, 0.8, 0.75],
  hill: [1.2, 1.12, 1.0, 0.92, 0.88, 0.88, 0.88, 0.88, 0.9, 0.95, 1.1, 1.25],
};

export const PROFILES: Record<Zone, number[]> = Object.fromEntries(
  Object.entries(RAW).map(([z, arr]) => {
    const mean = arr.reduce((a, b) => a + b, 0) / 12;
    return [z, arr.map((v) => v / mean)];
  }),
) as Record<Zone, number[]>;

/**
 * Build a 12-month consumption series from one bill.
 * @param units units printed on the bill
 * @param billMonth month the bill covers (0 = Jan). For a two-month bill, the first month.
 * @param periodMonths 1 for monthly billing, 2 for bimonthly (TN, KL and others)
 */
export function monthlyConsumption(units: number, billMonth: number, zone: Zone, periodMonths: 1 | 2 = 1): number[] {
  const p = PROFILES[zone];
  const factor = periodMonths === 2 ? p[billMonth] + p[(billMonth + 1) % 12] : p[billMonth];
  const mean = units / factor;
  return p.map((v) => v * mean);
}
