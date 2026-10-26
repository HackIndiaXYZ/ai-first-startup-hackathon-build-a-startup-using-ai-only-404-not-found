import { PV_DEFAULTS } from "./pv";

export const SQFT_PER_KW = 100; // shadow-free area per kW on an elevated structure (MNRE: ~10 m²/kW)
export const USABLE_ROOF = 0.7; // after setbacks, stair room, water tank

export interface SizingInput {
  annualConsumption: number;
  /** kWh per kWp in year one */
  specificYield: number;
  roofAreaSqft: number;
  sanctionedLoadKw?: number;
  moduleWatt?: number;
}

export interface SizingResult {
  kwp: number;
  panels: number;
  moduleWatt: number;
  consumptionKw: number;
  roofMaxKw: number;
  limitedBy: "consumption" | "roof" | "load";
}

export function roofCapacityKw(roofAreaSqft: number): number {
  return (roofAreaSqft * USABLE_ROOF) / SQFT_PER_KW;
}

export function panelsFor(kw: number, moduleWatt = PV_DEFAULTS.moduleWatt): number {
  return Math.max(2, Math.round((kw * 1000) / moduleWatt));
}

export function recommendSize(inp: SizingInput): SizingResult {
  const watt = inp.moduleWatt ?? PV_DEFAULTS.moduleWatt;
  const consumptionKw = inp.annualConsumption / Math.max(inp.specificYield, 1);
  const roofMaxKw = roofCapacityKw(inp.roofAreaSqft);
  let target = consumptionKw;
  let limitedBy: SizingResult["limitedBy"] = "consumption";
  if (roofMaxKw < target) {
    target = roofMaxKw;
    limitedBy = "roof";
  }
  if (inp.sanctionedLoadKw && inp.sanctionedLoadKw < target) {
    target = inp.sanctionedLoadKw;
    limitedBy = "load";
  }
  // Round to whole modules; never exceed the binding limit by more than half a module.
  let panels = panelsFor(target, watt);
  const limitKw = limitedBy === "consumption" ? Infinity : target;
  while (panels > 2 && (panels * watt) / 1000 > limitKw + watt / 2000) panels--;
  return {
    kwp: (panels * watt) / 1000,
    panels,
    moduleWatt: watt,
    consumptionKw,
    roofMaxKw,
    limitedBy,
  };
}
