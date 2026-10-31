import { PV_DEFAULTS } from "./pv";

export const SQFT_PER_KW = 100; // shadow-free area per kW on an elevated structure (MNRE: ~10 m²/kW)
export const USABLE_ROOF = 0.7; // after setbacks, stair room, water tank
export const SQFT_PER_M2 = 10.7639;
/** Smallest system Chhat sizes: two modules, about 1.1 kW. */
export const MIN_PANELS = 2;

export interface SizingInput {
  annualConsumption: number;
  /** kWh per kWp in year one */
  specificYield: number;
  roofAreaSqft: number;
  /** Share of the entered area that can take panels. 0.7 for a whole terrace, 1 when the user measured only the clear part. */
  usableShare?: number;
  sanctionedLoadKw?: number;
  moduleWatt?: number;
}

export interface SizingResult {
  kwp: number;
  panels: number;
  moduleWatt: number;
  consumptionKw: number;
  roofMaxKw: number;
  /** Whole modules that fit in the usable part of the roof */
  roofMaxPanels: number;
  limitedBy: "consumption" | "roof" | "load";
}

export function roofCapacityKw(roofAreaSqft: number, usableShare = USABLE_ROOF): number {
  return (Math.max(0, roofAreaSqft) * usableShare) / SQFT_PER_KW;
}

/** Clear, shade-free roof one module needs, spacing between rows included. */
export function sqftPerPanel(moduleWatt = PV_DEFAULTS.moduleWatt): number {
  return (SQFT_PER_KW * moduleWatt) / 1000;
}

/** Whole modules that fit on a roof of this size. */
export function panelsThatFit(roofAreaSqft: number, usableShare = USABLE_ROOF, moduleWatt = PV_DEFAULTS.moduleWatt): number {
  return Math.max(0, Math.floor((Math.max(0, roofAreaSqft) * usableShare + 1e-6) / sqftPerPanel(moduleWatt)));
}

/** Clear roof area a given number of modules takes. */
export function areaForPanels(panels: number, moduleWatt = PV_DEFAULTS.moduleWatt): number {
  return panels * sqftPerPanel(moduleWatt);
}

export function panelsFor(kw: number, moduleWatt = PV_DEFAULTS.moduleWatt): number {
  return Math.max(MIN_PANELS, Math.round((kw * 1000) / moduleWatt));
}

export function recommendSize(inp: SizingInput): SizingResult {
  const watt = inp.moduleWatt ?? PV_DEFAULTS.moduleWatt;
  const share = inp.usableShare ?? USABLE_ROOF;
  const consumptionKw = inp.annualConsumption / Math.max(inp.specificYield, 1);
  const roofMaxKw = roofCapacityKw(inp.roofAreaSqft, share);
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
  while (panels > MIN_PANELS && (panels * watt) / 1000 > limitKw + watt / 2000) panels--;
  return {
    kwp: (panels * watt) / 1000,
    panels,
    moduleWatt: watt,
    consumptionKw,
    roofMaxKw,
    roofMaxPanels: panelsThatFit(inp.roofAreaSqft, share, watt),
    limitedBy,
  };
}
