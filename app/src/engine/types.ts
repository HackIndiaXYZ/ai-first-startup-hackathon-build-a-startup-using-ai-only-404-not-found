export type Zone = "north" | "west" | "south" | "east" | "hill";

export interface City {
  name: string;
  state: string;
  lat: number;
  lon: number;
  /** Monthly mean all-sky GHI, kWh/m²/day, Jan..Dec */
  ghi: number[];
  /** Monthly mean 2 m air temperature, °C, Jan..Dec */
  t2m: number[];
}

export interface Climate {
  label: string;
  state: string;
  lat: number;
  lon: number;
  ghi: number[];
  t2m: number[];
  source: "nasa-live" | "nasa-bundled";
}

export interface StateInfo {
  code: string;
  name: string;
  zone: Zone;
  specialCategory: boolean;
  /** Indicative effective energy rate, ₹/kWh, for a ~300 unit/month household */
  tariff: number;
  /** Indicative year-end surplus payout, ₹/kWh */
  feedIn: number;
  topUp?: { perKw: number; cap: number; note: string; source: string };
  note?: string;
}

export type Severity = "critical" | "warn" | "info" | "ok";

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  /** Rupee impact, positive = money at risk */
  impact?: number;
  source?: { label: string; url: string };
}

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
export const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
