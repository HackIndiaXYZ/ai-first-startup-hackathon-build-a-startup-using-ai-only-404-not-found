// Solar geometry.
// Monthly-average formulas follow Duffie & Beckman, "Solar Engineering of Thermal
// Processes" (Klein 1977 representative days, Erbs 1982 monthly diffuse fraction,
// Liu & Jordan isotropic sky). Instantaneous sun position follows the NOAA
// General Solar Position equations.

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Klein's representative day of year for each month. */
export const REP_DAY = [17, 47, 75, 105, 135, 162, 198, 228, 258, 288, 318, 344];

export function declination(dayOfYear: number): number {
  return 23.45 * Math.sin(RAD * (360 * (284 + dayOfYear)) / 365);
}

/** Sunset hour angle, degrees. */
export function sunsetHourAngle(latDeg: number, declDeg: number): number {
  const x = -Math.tan(latDeg * RAD) * Math.tan(declDeg * RAD);
  return Math.acos(Math.max(-1, Math.min(1, x))) * DEG;
}

/** Daily extraterrestrial irradiation on a horizontal surface, kWh/m²/day. */
export function extraterrestrialDaily(latDeg: number, dayOfYear: number): number {
  const GSC = 1.367; // kW/m²
  const d = declination(dayOfYear);
  const ws = sunsetHourAngle(latDeg, d) * RAD;
  const phi = latDeg * RAD;
  const dr = d * RAD;
  const ecc = 1 + 0.033 * Math.cos((2 * Math.PI * dayOfYear) / 365);
  return ((24 / Math.PI) * GSC * ecc *
    (Math.cos(phi) * Math.cos(dr) * Math.sin(ws) + ws * Math.sin(phi) * Math.sin(dr)));
}

/** Monthly diffuse fraction Hd/H from clearness index (Erbs et al.). */
export function diffuseFraction(kt: number, wsDeg: number): number {
  const k = Math.max(0.3, Math.min(0.8, kt));
  if (wsDeg <= 81.4) return 1.391 - 3.56 * k + 4.189 * k * k - 2.137 * k * k * k;
  return 1.311 - 3.022 * k + 3.427 * k * k - 1.821 * k * k * k;
}

/**
 * Ratio of beam radiation on a tilted, equator-facing surface to that on a
 * horizontal surface, monthly average (Klein). Valid for the northern hemisphere.
 */
export function beamTiltFactor(latDeg: number, tiltDeg: number, declDeg: number): number {
  const phi = latDeg * RAD;
  const beta = tiltDeg * RAD;
  const d = declDeg * RAD;
  const ws = sunsetHourAngle(latDeg, declDeg) * RAD;
  const wsTiltRaw = Math.acos(Math.max(-1, Math.min(1, -Math.tan(phi - beta) * Math.tan(d))));
  const wsT = Math.min(ws, wsTiltRaw);
  const num = Math.cos(phi - beta) * Math.cos(d) * Math.sin(wsT) + wsT * Math.sin(phi - beta) * Math.sin(d);
  const den = Math.cos(phi) * Math.cos(d) * Math.sin(ws) + ws * Math.sin(phi) * Math.sin(d);
  return den > 0 ? num / den : 1;
}

/** Monthly mean daily irradiation on the tilted plane, kWh/m²/day. */
export function planeOfArray(ghi: number, latDeg: number, tiltDeg: number, month: number, albedo = 0.2): number {
  const n = REP_DAY[month];
  const d = declination(n);
  const h0 = extraterrestrialDaily(latDeg, n);
  const kt = h0 > 0 ? ghi / h0 : 0.5;
  const ws = sunsetHourAngle(latDeg, d);
  const fd = diffuseFraction(kt, ws);
  const rb = beamTiltFactor(latDeg, tiltDeg, d);
  const beta = tiltDeg * RAD;
  return ghi * ((1 - fd) * rb + fd * (1 + Math.cos(beta)) / 2 + albedo * (1 - Math.cos(beta)) / 2);
}

export interface SunPosition {
  /** Elevation above horizon, degrees */
  elevation: number;
  /** Azimuth clockwise from north, degrees */
  azimuth: number;
}

function dayOfYearOf(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / 86400000);
}

function noaaTerms(doy: number, hourLocal: number) {
  const g = (2 * Math.PI / 365) * (doy - 1 + (hourLocal - 12) / 24);
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  return { eqtime, decl };
}

/** Sun position for a day of year and local clock hour (IST by default). */
export function sunPosition(latDeg: number, lonDeg: number, doy: number, hourLocal: number, tzHours = 5.5): SunPosition {
  const { eqtime, decl } = noaaTerms(doy, hourLocal);
  const timeOffset = eqtime + 4 * lonDeg - 60 * tzHours;
  const tst = hourLocal * 60 + timeOffset;
  const ha = (tst / 4 - 180) * RAD;
  const phi = latDeg * RAD;
  const cosZ = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(ha);
  const zenith = Math.acos(Math.max(-1, Math.min(1, cosZ)));
  const azSouth = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi));
  return { elevation: 90 - zenith * DEG, azimuth: ((azSouth * DEG + 180) % 360 + 360) % 360 };
}

export function sunPositionAt(latDeg: number, lonDeg: number, date: Date, tzHours = 5.5): SunPosition {
  const local = new Date(date.getTime() + tzHours * 3600000);
  const hour = local.getUTCHours() + local.getUTCMinutes() / 60;
  return sunPosition(latDeg, lonDeg, dayOfYearOf(local), hour, tzHours);
}

/** Sunrise, solar noon and sunset as local clock hours (decimal). */
export function sunTimes(latDeg: number, lonDeg: number, doy: number, tzHours = 5.5) {
  const { eqtime, decl } = noaaTerms(doy, 12);
  const phi = latDeg * RAD;
  const cosHa = Math.cos(90.833 * RAD) / (Math.cos(phi) * Math.cos(decl)) - Math.tan(phi) * Math.tan(decl);
  const ha = Math.acos(Math.max(-1, Math.min(1, cosHa))) * DEG;
  const noon = (720 - 4 * lonDeg - eqtime + tzHours * 60) / 60;
  return { sunrise: noon - (4 * ha) / 60, noon, sunset: noon + (4 * ha) / 60 };
}

export function formatClock(hours: number): string {
  const h = Math.floor(((hours % 24) + 24) % 24);
  const m = Math.floor((hours - Math.floor(hours)) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
