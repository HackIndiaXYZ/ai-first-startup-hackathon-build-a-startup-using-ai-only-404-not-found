// Fair installed price per kW for an on-grid residential system with DCR modules
// (ALMM List-II cells), elevated GI/ZAM structure, net-meter paperwork and GST,
// as of Oct 2026. Built from installer price lists that put a 3 kW system at
// ₹1.35 to 2.1 lakh before subsidy, plus the ₹20,000 to ₹30,000 DCR premium
// reported after June 2026.
export const PRICE_SOURCES = [
  { label: "Avaada: 3 kW system price in India", url: "https://www.avaada.com/blog/3kw-solar-system-price-in-india/" },
  { label: "VoltFlow: solar panel cost India 2026", url: "https://www.voltflow.net/blog/solar-panel-cost-india-2026" },
  { label: "Heaven Green Energy: Pune prices after subsidy", url: "https://www.heavengreenenergy.com/blog/solar-cost-pune-3kw-5kw-10kw" },
];

const CURVE: [number, number][] = [
  [1, 78000],
  [2, 66000],
  [3, 60000],
  [5, 56000],
  [10, 52000],
];

/** Mid-market price per kW for a system of `kw`. */
export function fairPricePerKw(kw: number): number {
  if (kw <= CURVE[0][0]) return CURVE[0][1];
  for (let i = 1; i < CURVE.length; i++) {
    const [k1, p1] = CURVE[i - 1];
    const [k2, p2] = CURVE[i];
    if (kw <= k2) return p1 + ((p2 - p1) * (kw - k1)) / (k2 - k1);
  }
  return CURVE[CURVE.length - 1][1];
}

export interface PriceBand {
  low: number;
  mid: number;
  high: number;
}

/** Fair total price band (±10% around mid) for a system of `kw`. */
export function fairPriceBand(kw: number): PriceBand {
  const mid = fairPricePerKw(kw) * kw;
  return { low: Math.round(mid * 0.9), mid: Math.round(mid), high: Math.round(mid * 1.1) };
}
