import { planeOfArray } from "./solar";
import { DAYS_IN_MONTH, type Climate } from "./types";

export const PV_DEFAULTS = {
  /** Wiring, inverter, soiling, mismatch, availability */
  systemLosses: 0.14,
  /** Power temperature coefficient of a mono PERC / TOPCon module, per °C */
  tempCoeff: -0.0035,
  /** Cell runs this many °C above 24-hour mean air temperature during production hours */
  cellOverAmbient: 25,
  /** Annual output degradation after year 1 */
  degradation: 0.005,
  albedo: 0.2,
  moduleWatt: 545,
};

export type Shading = "none" | "some" | "heavy";
export const SHADING_FACTOR: Record<Shading, number> = { none: 1, some: 0.93, heavy: 0.82 };

/** Fixed tilt used by Indian installers on elevated structures: latitude, kept within 10° to 30°. */
export function defaultTilt(lat: number): number {
  return Math.round(Math.max(10, Math.min(30, Math.abs(lat))));
}

export function monthlyPOA(climate: Climate, tiltDeg = defaultTilt(climate.lat)): number[] {
  return climate.ghi.map((g, m) => planeOfArray(g, climate.lat, tiltDeg, m, PV_DEFAULTS.albedo));
}

export function temperatureDerate(t2m: number): number {
  const cell = t2m + PV_DEFAULTS.cellOverAmbient;
  return 1 + PV_DEFAULTS.tempCoeff * (cell - 25);
}

/** Year-one AC energy per month, kWh, for a system of `kwp`. */
export function monthlyEnergy(climate: Climate, kwp: number, shading: Shading = "none", tiltDeg?: number): number[] {
  const poa = monthlyPOA(climate, tiltDeg);
  const shade = SHADING_FACTOR[shading];
  return poa.map((h, m) =>
    kwp * h * DAYS_IN_MONTH[m] * (1 - PV_DEFAULTS.systemLosses) * temperatureDerate(climate.t2m[m]) * shade,
  );
}

/** kWh produced per kWp in year one. */
export function specificYield(climate: Climate, shading: Shading = "none"): number {
  return monthlyEnergy(climate, 1, shading).reduce((a, b) => a + b, 0);
}

export function annualGHI(climate: Climate): number {
  return climate.ghi.reduce((a, g, m) => a + g * DAYS_IN_MONTH[m], 0);
}

/**
 * Approximate instantaneous AC output (kW) for the 3D scene's live meter.
 * Uses a clear-sky-shaped day scaled so the day's integral matches the month's mean.
 */
export function instantOutput(climate: Climate, kwp: number, month: number, sunElevationDeg: number, dayLengthHours: number): number {
  if (sunElevationDeg <= 0) return 0;
  const daily = monthlyEnergy(climate, kwp)[month] / DAYS_IN_MONTH[month];
  // Integral of sin over the day equals 2/π × peak × day length.
  const peak = (daily * Math.PI) / (2 * Math.max(dayLengthHours, 1));
  return Math.max(0, peak * Math.sin((sunElevationDeg * Math.PI) / 180) / Math.sin(Math.PI / 2.4));
}
