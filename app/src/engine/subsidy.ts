import type { StateInfo } from "./types";

export const SUBSIDY_SOURCE = {
  label: "PM Surya Ghar: Muft Bijli Yojana, MNRE guidelines",
  url: "https://www.pmsuryaghar.gov.in/",
};

export interface SubsidyBreakdown {
  central: number;
  state: number;
  total: number;
  centralRule: string;
  stateRule?: string;
}

/** Central Financial Assistance under PM Surya Ghar for a residential system. */
export function centralSubsidy(kw: number, specialCategory: boolean): number {
  const first = specialCategory ? 33000 : 30000;
  const third = specialCategory ? 19800 : 18000;
  const cap = 2 * first + third;
  if (kw <= 0) return 0;
  if (kw <= 2) return Math.round(first * kw);
  return Math.round(Math.min(cap, 2 * first + third * Math.min(kw - 2, 1)));
}

export function subsidyFor(kw: number, state: StateInfo, eligible = true): SubsidyBreakdown {
  if (!eligible) {
    return { central: 0, state: 0, total: 0, centralRule: "Not eligible: panels must be DCR with ALMM-listed cells" };
  }
  const central = centralSubsidy(kw, state.specialCategory);
  const stateAmt = state.topUp ? Math.min(state.topUp.cap, Math.round(state.topUp.perKw * Math.min(kw, 3))) : 0;
  return {
    central,
    state: stateAmt,
    total: central + stateAmt,
    centralRule: state.specialCategory
      ? "₹33,000/kW for the first 2 kW, ₹19,800 for the 3rd kW, capped at ₹85,800 (special-category state)"
      : "₹30,000/kW for the first 2 kW, ₹18,000 for the 3rd kW, capped at ₹78,000",
    stateRule: state.topUp?.note,
  };
}
