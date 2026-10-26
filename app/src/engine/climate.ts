import citiesData from "../data/cities.json";
import type { City, Climate } from "./types";

export const CITIES: City[] = (citiesData as { cities: City[] }).cities;
export const CLIMATE_SOURCE = {
  label: "NASA POWER climatology 2001-2020 (ALLSKY_SFC_SW_DWN, T2M)",
  url: "https://power.larc.nasa.gov/",
};

export function cityByName(name: string): City | undefined {
  const n = name.trim().toLowerCase();
  return CITIES.find((c) => c.name.toLowerCase() === n);
}

export function searchCities(query: string, limit = 8): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return CITIES.slice(0, limit);
  const starts = CITIES.filter((c) => c.name.toLowerCase().startsWith(q));
  const contains = CITIES.filter((c) => !c.name.toLowerCase().startsWith(q) && c.name.toLowerCase().includes(q));
  return [...starts, ...contains].slice(0, limit);
}

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function nearestCity(lat: number, lon: number): City {
  let best = CITIES[0];
  let bestD = Infinity;
  for (const c of CITIES) {
    const d = haversineKm(lat, lon, c.lat, c.lon);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

export function climateFromCity(c: City): Climate {
  return { label: c.name, state: c.state, lat: c.lat, lon: c.lon, ghi: c.ghi, t2m: c.t2m, source: "nasa-bundled" };
}

const MONTH_KEYS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/**
 * Fetch climatology for any point from NASA POWER, live. Falls back to the
 * nearest bundled city on timeout, network error, or a CSP block.
 */
export async function fetchClimate(lat: number, lon: number, label?: string, timeoutMs = 5000): Promise<Climate> {
  const near = nearestCity(lat, lon);
  const url = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,T2M&community=RE&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&format=JSON`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`NASA POWER HTTP ${res.status}`);
    const json = await res.json();
    const p = json.properties.parameter;
    const ghi = MONTH_KEYS.map((k) => Number(p.ALLSKY_SFC_SW_DWN[k]));
    const t2m = MONTH_KEYS.map((k) => Number(p.T2M[k]));
    if (ghi.some((v) => !(v > 0))) throw new Error("NASA POWER returned fill values");
    return { label: label ?? near.name, state: near.state, lat, lon, ghi, t2m, source: "nasa-live" };
  } catch {
    return climateFromCity(near);
  } finally {
    clearTimeout(timer);
  }
}
