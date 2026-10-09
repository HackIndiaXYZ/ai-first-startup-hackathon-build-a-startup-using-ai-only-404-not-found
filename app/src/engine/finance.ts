export const FINANCE_DEFAULTS = {
  /** PM Surya Ghar concessional loan, repo + 0.5% (≈5.75% in Jul 2026), ≤3 kW, up to ₹2 lakh */
  concessionalRate: 0.0575,
  concessionalCap: 200000,
  /** Typical bank rate above the concessional slab */
  marketRate: 0.079,
  tenureYears: 10,
  marginMoney: 0.1,
  tariffEscalation: 0.03,
  discountRate: 0.08,
  /** O&M after the vendor's 5-year obligation ends, ₹ per kW per year */
  omPerKw: 600,
  omEscalation: 0.05,
  /** String inverter replacement in year 12, ₹ per kW */
  inverterPerKw: 9000,
  inverterYear: 12,
  lifeYears: 25,
};

export function emi(principal: number, annualRate: number, years: number): number {
  if (principal <= 0) return 0;
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  const f = Math.pow(1 + r, n);
  return (principal * r * f) / (f - 1);
}

export interface YearRow {
  year: number;
  savings: number;
  costs: number;
  net: number;
  cumulative: number;
}

export interface CashFlowInput {
  grossCost: number;
  subsidy: number;
  kwp: number;
  /** Year-one bill savings, ₹ */
  savingsYear1: number;
  degradation: number;
  tariffEscalation?: number;
}

/** 25-year cash flows for an upfront (cash) purchase. Year 0 = net outlay after subsidy. */
export function cashFlows(inp: CashFlowInput): YearRow[] {
  const esc = inp.tariffEscalation ?? FINANCE_DEFAULTS.tariffEscalation;
  const rows: YearRow[] = [];
  let cumulative = -(inp.grossCost - inp.subsidy);
  rows.push({ year: 0, savings: 0, costs: inp.grossCost - inp.subsidy, net: cumulative, cumulative });
  for (let y = 1; y <= FINANCE_DEFAULTS.lifeYears; y++) {
    const savings = inp.savingsYear1 * Math.pow(1 + esc, y - 1) * Math.pow(1 - inp.degradation, y - 1);
    let costs = 0;
    if (y > 5) costs += FINANCE_DEFAULTS.omPerKw * inp.kwp * Math.pow(1 + FINANCE_DEFAULTS.omEscalation, y - 6);
    if (y === FINANCE_DEFAULTS.inverterYear) costs += FINANCE_DEFAULTS.inverterPerKw * inp.kwp;
    const net = savings - costs;
    cumulative += net;
    rows.push({ year: y, savings, costs, net, cumulative });
  }
  return rows;
}

/** Years until cumulative cash flow turns positive, interpolated. */
export function paybackYears(rows: YearRow[]): number | null {
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].cumulative >= 0) {
      const prev = rows[i - 1].cumulative;
      return rows[i - 1].year + -prev / (rows[i].cumulative - prev);
    }
  }
  return null;
}

export function npv(rows: YearRow[], rate = FINANCE_DEFAULTS.discountRate): number {
  return rows.reduce((acc, r) => acc + (r.year === 0 ? r.net : r.net / Math.pow(1 + rate, r.year)), 0);
}

export function irr(rows: YearRow[]): number | null {
  const f = (r: number) => rows.reduce((acc, row) => acc + row.net / Math.pow(1 + r, row.year), 0);
  let lo = -0.5;
  let hi = 2;
  if (f(lo) * f(hi) > 0) return null;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (f(lo) * f(mid) <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

export interface LoanPlan {
  upfront: number;
  principal: number;
  rate: number;
  concessional: boolean;
  tenureYears: number;
  emiBefore: number;
  /** EMI after the subsidy arrives and is used to prepay principal */
  emiAfter: number;
  totalInterest: number;
}

export function loanPlan(grossCost: number, subsidy: number, kwp: number, opts: { rate?: number; tenureYears?: number } = {}): LoanPlan {
  const tenure = opts.tenureYears ?? FINANCE_DEFAULTS.tenureYears;
  const principal = Math.round(grossCost * (1 - FINANCE_DEFAULTS.marginMoney));
  const concessional = kwp <= 3.3 && principal <= FINANCE_DEFAULTS.concessionalCap;
  const rate = opts.rate ?? (concessional ? FINANCE_DEFAULTS.concessionalRate : FINANCE_DEFAULTS.marketRate);
  const emiBefore = emi(principal, rate, tenure);
  const prepaid = Math.max(0, principal - subsidy);
  const emiAfter = emi(prepaid, rate, tenure);
  // Interest paid: roughly two months on the full principal, then the rest on the prepaid balance.
  const totalInterest = Math.max(0, emiAfter * tenure * 12 - prepaid) + (principal * rate * 2) / 12;
  return {
    upfront: grossCost - principal,
    principal,
    rate,
    concessional,
    tenureYears: tenure,
    emiBefore,
    emiAfter,
    totalInterest,
  };
}
