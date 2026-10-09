import type { StateInfo } from "./types";

// Tariffs are indicative effective energy rates for a household using ~300 units
// a month (FY 2025-26 tariff orders vary by slab, fixed charge and surcharge).
// Chhat always prefers the rate printed on the user's own bill.
const T = (code: string, name: string, zone: StateInfo["zone"], tariff: number, extra: Partial<StateInfo> = {}): StateInfo => ({
  code,
  name,
  zone,
  tariff,
  feedIn: 2.75,
  specialCategory: false,
  ...extra,
});

const SPECIAL = { specialCategory: true } as const;

export const STATES: Record<string, StateInfo> = Object.fromEntries(
  [
    T("DL", "Delhi", "north", 6.5, {
      topUp: {
        perKw: 10000,
        cap: 30000,
        note: "Delhi state top-up, ₹10,000/kW up to ₹30,000",
        source: "https://www.tribuneindia.com/news/delhi/delhi-cabinet-okays-30000-subsidy-for-installation-of-rooftop-solar-panels/amp",
      },
    }),
    T("HR", "Haryana", "north", 6.8),
    T("PB", "Punjab", "north", 6.5, { note: "Punjab gives 300 free units a month, so solar pays back slower for small users." }),
    T("CH", "Chandigarh", "north", 4.75),
    T("UP", "Uttar Pradesh", "north", 6.5, {
      topUp: {
        perKw: 15000,
        cap: 30000,
        note: "UPNEDA top-up, ₹15,000/kW up to ₹30,000",
        source: "https://freyrenergy.com/?p=28413",
      },
    }),
    T("RJ", "Rajasthan", "north", 7.5),
    T("MP", "Madhya Pradesh", "north", 7.0),
    T("BR", "Bihar", "north", 7.5),
    T("JH", "Jharkhand", "east", 6.5),
    T("MH", "Maharashtra", "west", 9.5),
    T("GJ", "Gujarat", "west", 7.0),
    T("GA", "Goa", "west", 4.5),
    T("KA", "Karnataka", "south", 7.0),
    T("TN", "Tamil Nadu", "south", 7.5, { note: "TANGEDCO bills every two months; enter the units printed on one bill." }),
    T("TS", "Telangana", "south", 8.0),
    T("AP", "Andhra Pradesh", "south", 7.5),
    T("KL", "Kerala", "south", 7.5, { note: "KSEB bills every two months; enter the units printed on one bill." }),
    T("PY", "Puducherry", "south", 5.0),
    T("WB", "West Bengal", "east", 8.5),
    T("OD", "Odisha", "east", 5.5),
    T("CG", "Chhattisgarh", "east", 6.0),
    T("AS", "Assam", "east", 7.5, SPECIAL),
    T("ML", "Meghalaya", "hill", 6.0, SPECIAL),
    T("MN", "Manipur", "hill", 6.0, SPECIAL),
    T("TR", "Tripura", "east", 6.0, SPECIAL),
    T("SK", "Sikkim", "hill", 4.5, SPECIAL),
    T("MZ", "Mizoram", "hill", 6.0, SPECIAL),
    T("AR", "Arunachal Pradesh", "hill", 5.0, SPECIAL),
    T("NL", "Nagaland", "hill", 6.0, SPECIAL),
    T("UK", "Uttarakhand", "hill", 5.5, SPECIAL),
    T("HP", "Himachal Pradesh", "hill", 5.5, SPECIAL),
    T("JK", "Jammu & Kashmir", "hill", 4.5, {
      ...SPECIAL,
      topUp: {
        perKw: 3000,
        cap: 9000,
        note: "J&K UT top-up, ₹3,000/kW up to ₹9,000",
        source: "https://kashmirreader.com/2024/07/05/rs-85800-subsidy-on-solar-rooftop-of-rs-1-59-lakh-under-pm-surya-ghar-kpdcl/",
      },
    }),
    T("LA", "Ladakh", "hill", 4.0, SPECIAL),
    T("AN", "Andaman & Nicobar", "south", 6.5, SPECIAL),
  ].map((s) => [s.code, s]),
);

export function stateInfo(code: string): StateInfo {
  return STATES[code] ?? T(code, code, "north", 7);
}
