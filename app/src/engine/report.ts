import { monthlyConsumption } from "./consumption";
import { cashFlows, irr, loanPlan, npv, paybackYears, type LoanPlan, type YearRow } from "./finance";
import { fairPriceBand, type PriceBand } from "./pricing";
import { monthlyEnergy, PV_DEFAULTS, specificYield, type Shading } from "./pv";
import { netMetering, type NetMeterResult } from "./savings";
import { recommendSize, type SizingResult } from "./sizing";
import { stateInfo } from "./states";
import { subsidyFor, type SubsidyBreakdown } from "./subsidy";
import type { Climate, StateInfo } from "./types";

/** CEA CO₂ baseline database, weighted average grid emission factor FY 2023-24. */
export const GRID_EMISSION_T_PER_MWH = 0.727;
export const KG_CO2_PER_TREE_YEAR = 22;

export interface ReportInput {
  climate: Climate;
  /** Units on the bill */
  units: number;
  billMonth: number;
  periodMonths: 1 | 2;
  /** Effective energy rate from the bill, ₹/kWh. Falls back to the state default. */
  tariff?: number;
  roofAreaSqft: number;
  shading: Shading;
  sanctionedLoadKw?: number;
  /** Force a size instead of the recommendation (live slider) */
  overridePanels?: number;
  /** Price the user was quoted; defaults to the fair mid-market price */
  grossCost?: number;
}

export interface Report {
  input: ReportInput;
  state: StateInfo;
  tariff: number;
  consumption: number[];
  annualConsumption: number;
  specificYield: number;
  sizing: SizingResult;
  kwp: number;
  panels: number;
  generation: number[];
  annualGeneration: number;
  net: NetMeterResult;
  subsidy: SubsidyBreakdown;
  price: PriceBand;
  grossCost: number;
  netCost: number;
  flows: YearRow[];
  payback: number | null;
  npv25: number;
  irr: number | null;
  lifetimeSavings: number;
  loan: LoanPlan;
  monthlySavingAvg: number;
  co2TonnesYear: number;
  co2Tonnes25: number;
  treesEquivalent: number;
}

/**
 * Build the full report. Without an override, Chhat compares the recommended
 * panel count with one panel fewer and one more (within roof and load limits)
 * and keeps the size with the best 25-year NPV. This catches the subsidy
 * sweet spot at 3 kW.
 */
export function buildReport(input: ReportInput): Report {
  if (input.overridePanels !== undefined) return computeReport(input, input.overridePanels);
  const base = computeReport(input, undefined);
  const s = base.sizing;
  const maxKw = Math.min(s.roofMaxKw, input.sanctionedLoadKw ?? Infinity) + s.moduleWatt / 2000;
  let best = base;
  for (const n of [s.panels - 1, s.panels + 1]) {
    if (n < 2 || (n * s.moduleWatt) / 1000 > maxKw) continue;
    const r = computeReport(input, n);
    if (r.npv25 > best.npv25 + 500) best = r;
  }
  return best;
}

function computeReport(input: ReportInput, panelsOverride: number | undefined): Report {
  const state = stateInfo(input.climate.state);
  const tariff = input.tariff && input.tariff > 0 ? input.tariff : state.tariff;
  const consumption = monthlyConsumption(input.units, input.billMonth, state.zone, input.periodMonths);
  const annualConsumption = consumption.reduce((a, b) => a + b, 0);
  const sy = specificYield(input.climate, input.shading);
  const sizing = recommendSize({
    annualConsumption,
    specificYield: sy,
    roofAreaSqft: input.roofAreaSqft,
    sanctionedLoadKw: input.sanctionedLoadKw,
  });
  const panels = panelsOverride ?? sizing.panels;
  const kwp = (panels * sizing.moduleWatt) / 1000;
  const generation = monthlyEnergy(input.climate, kwp, input.shading);
  const annualGeneration = generation.reduce((a, b) => a + b, 0);
  const net = netMetering(consumption, generation, tariff, state.feedIn);
  const subsidy = subsidyFor(kwp, state);
  const price = fairPriceBand(kwp);
  const grossCost = input.grossCost ?? price.mid;
  const netCost = grossCost - subsidy.total;
  const flows = cashFlows({
    grossCost,
    subsidy: subsidy.total,
    kwp,
    savingsYear1: net.savings,
    degradation: PV_DEFAULTS.degradation,
  });
  const lifetimeSavings = flows.slice(1).reduce((a, r) => a + r.net, 0);
  const co2TonnesYear = (annualGeneration / 1000) * GRID_EMISSION_T_PER_MWH;
  let co2Tonnes25 = 0;
  for (let y = 0; y < 25; y++) co2Tonnes25 += co2TonnesYear * Math.pow(1 - PV_DEFAULTS.degradation, y);
  return {
    input,
    state,
    tariff,
    consumption,
    annualConsumption,
    specificYield: sy,
    sizing,
    kwp,
    panels,
    generation,
    annualGeneration,
    net,
    subsidy,
    price,
    grossCost,
    netCost,
    flows,
    payback: paybackYears(flows),
    npv25: npv(flows),
    irr: irr(flows),
    lifetimeSavings,
    loan: loanPlan(grossCost, subsidy.total, kwp),
    monthlySavingAvg: net.savings / 12,
    co2TonnesYear,
    co2Tonnes25,
    treesEquivalent: Math.round((co2TonnesYear * 1000) / KG_CO2_PER_TREE_YEAR),
  };
}
