// Rule-based field extraction for bills and quotes. Runs on-device on OCR or
// PDF text when no model is available. Every result is shown to the user as an
// editable form, so a miss costs a keystroke, not a wrong answer.

import { EMPTY_BILL, type SolarBill } from "../engine/billAudit";
import { CITIES } from "../engine/climate";
import { EMPTY_QUOTE, type Quote } from "../engine/quoteAudit";
import { STATES } from "../engine/states";
import { findCities } from "./localAgent";

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const AMT = String.raw`(?:rs\.?|₹|inr)?\s*([\d,]+(?:\.\d+)?)`;

function toNum(s: string | undefined): number | null {
  if (!s) return null;
  const v = Number(s.replace(/,/g, ""));
  return Number.isFinite(v) ? v : null;
}

/** First number after any of the labels on the same line. */
function after(text: string, labels: string[]): number | null {
  for (const l of labels) {
    const re = new RegExp(`${l}[^\\n\\d₹]{0,25}${AMT}`, "i");
    const m = text.match(re);
    if (m) return toNum(m[1]);
  }
  return null;
}

function stringAfter(text: string, labels: string[]): string | null {
  for (const l of labels) {
    const m = text.match(new RegExp(`${l}\\s*[:.\\-]?\\s*([^\\n]{2,60}?)(?:\\s{2,}|\\n|$)`, "i"));
    if (m) return m[1].trim();
  }
  return null;
}

export function detectState(text: string): string | null {
  const t = text.toLowerCase();
  for (const s of Object.values(STATES)) if (t.includes(s.name.toLowerCase())) return s.code;
  const city = findCities(text)[0];
  return city ? (CITIES.find((c) => c.name === city)?.state ?? null) : null;
}

export function detectMonth(text: string): { month: number | null; periodMonths: 1 | 2 } {
  const t = text.toLowerCase();
  const two = /bimonthly|bi-monthly|2 months|two months/.test(t);
  const range = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*[-–]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/);
  if (range) return { month: MONTHS.indexOf(range[1]), periodMonths: 2 };
  const labelled = t.match(/(?:bill month|billing month|month)\s*[:\-]?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);
  if (labelled) return { month: MONTHS.indexOf(labelled[1]), periodMonths: two ? 2 : 1 };
  const any = t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-']*20\d\d/);
  if (any) return { month: MONTHS.indexOf(any[1]), periodMonths: two ? 2 : 1 };
  const date = t.match(/(?:period|from)[^\n]*?\d{2}[-/](\d{2})[-/]20\d\d/);
  if (date) return { month: Number(date[1]) - 1, periodMonths: two ? 2 : 1 };
  return { month: null, periodMonths: two ? 2 : 1 };
}

export interface ParsedBill {
  units: number | null;
  billMonth: number | null;
  periodMonths: 1 | 2;
  billAmount: number | null;
  energyCharges: number | null;
  fixedCharges: number | null;
  sanctionedLoadKw: number | null;
  consumerName: string | null;
  consumerNumber: string | null;
  stateCode: string | null;
  city: string | null;
  tariff: number | null;
}

export function parseBill(text: string): ParsedBill {
  const { month, periodMonths } = detectMonth(text);
  const units = after(text, ["units consumed", "total units", "consumption", "units billed", "kwh consumed", "units"]);
  const energy = after(text, ["energy charges?", "energy charge"]);
  const amount = after(text, ["amount payable", "net bill amount", "total amount", "bill amount", "amount due", "total"]);
  const load = text.match(/sanctioned load\s*[:\-]?\s*([\d.]+)\s*kw/i);
  const cities = findCities(text);
  return {
    units,
    billMonth: month,
    periodMonths,
    billAmount: amount,
    energyCharges: energy,
    fixedCharges: after(text, ["fixed charges?"]),
    sanctionedLoadKw: load ? Number(load[1]) : null,
    consumerName: stringAfter(text, ["consumer name", "name"]),
    consumerNumber: stringAfter(text, ["ca number", "consumer no\\.?", "account no\\.?", "service no", "k no\\.?"]),
    stateCode: detectState(text),
    city: cities[0] ?? null,
    tariff: units && energy ? Math.round((energy / units) * 100) / 100 : null,
  };
}

export interface ParsedSolarBill extends SolarBill {
  systemKwp: number | null;
  stateCode: string | null;
  city: string | null;
}

export function parseSolarBill(text: string): ParsedSolarBill {
  const { month } = detectMonth(text);
  const kwp = text.match(/(\d+(?:\.\d+)?)\s*kwp/i);
  const other = text.match(new RegExp(`other charges?\\s*(?:\\(([^)]*)\\))?\\s*[:\\-]?\\s*${AMT}`, "i"));
  return {
    ...EMPTY_BILL,
    consumerName: stringAfter(text, ["consumer name", "name"]),
    consumerNumber: stringAfter(text, ["account no\\.?", "ca number", "consumer no\\.?", "k no\\.?"]),
    discom: text.split("\n")[0]?.replace(/\(fictional\)|·.*$/gi, "").trim() || null,
    billMonth: month,
    importUnits: after(text, ["import units", "import", "units imported"]),
    exportUnits: after(text, ["export units", "export", "units exported"]),
    previousCredit: after(text, ["previous credit units", "previous credit", "credit b/f", "banked units", "carried forward"]),
    netUnitsBilled: after(text, ["net units billed", "net units", "billed units"]),
    energyCharges: after(text, ["energy charges?"]),
    fixedCharges: after(text, ["fixed charges?"]),
    otherCharges: other ? toNum(other[2]) : null,
    otherChargesLabel: other ? (other[1] ?? "Other charges") : null,
    total: after(text, ["total amount payable", "total amount", "amount payable", "total"]),
    systemKwp: kwp ? Number(kwp[1]) : null,
    stateCode: detectState(text),
    city: findCities(text)[0] ?? null,
  };
}

export function parseQuote(text: string): Quote & { city: string | null } {
  const t = text.toLowerCase();
  const lines = text.split("\n");

  // System size: prefer a kW figure introduced by system/capacity words, never the inverter's.
  let systemKw: number | null = null;
  const kwRe = /(\d+(?:\.\d+)?)\s*kwp?\b/gi;
  for (const line of lines) {
    if (/inverter/i.test(line)) continue;
    const m = [...line.matchAll(kwRe)];
    if (m.length && /capacity|system|plant|estimate|subject|rooftop|grid[-\s]connected|on[-\s]grid/i.test(line)) {
      systemKw = Number(m[0][1]);
      break;
    }
  }

  const wattM = t.match(/(\d{3})\s*wp?\b/);
  const panelWatt = wattM && +wattM[1] >= 250 && +wattM[1] <= 750 ? Number(wattM[1]) : null;
  const panelLine = lines.find((l) => /module|panel/i.test(l) && /\d{3}\s*wp?/i.test(l)) ?? "";
  const count =
    panelLine.match(/(\d{1,2})\s*(?:x|×)\s*\d{3}\s*wp?/i) ??
    panelLine.match(/\d{3}\s*wp?\s*(?:x|×)\s*(\d{1,2})/i) ??
    panelLine.match(/(\d{1,2})\s*nos/i);
  const invLine = lines.find((l) => /inverter/i.test(l)) ?? "";
  const invKw = invLine.match(/(\d+(?:\.\d+)?)\s*kw/i);
  const invWarr = (invLine.match(/(\d{1,2})\s*years?/i) ?? lines.find((l) => /inverter warranty/i.test(l))?.match(/(\d{1,2})\s*years?/i)) ?? null;
  const brand = invLine.match(/brand:?\s*([A-Za-z][\w-]+)/i);

  const structure: Quote["structure"] = /hot[-\s]?dip|galvan|\bgi\b/.test(t)
    ? "hdg"
    : /\bzam\b/.test(t)
      ? "zam"
      : /alumin/.test(t)
        ? "aluminium"
        : /ms painted|mild steel|painted/.test(t)
          ? "ms-painted"
          : "unknown";

  const prod = t.match(/(?:panel|module) product warranty\s*(\d{1,2})/) ?? t.match(/(\d{1,2})\s*years? product/);
  const perf = t.match(/performance warranty\s*(\d{1,2})/) ?? t.match(/(\d{1,2})\s*years? performance/);
  const sys =
    t.match(/(\d{1,2})\s*years? comprehensive/) ??
    t.match(/system warranty\s*[:\-]?\s*(\d{1,2})/) ??
    t.match(/workmanship warranty\s*(\d{1,2})/) ??
    t.match(/(\d{1,2})\s*years? (?:of )?o&m/);

  const totals = [...text.matchAll(new RegExp(`(?:grand total|total project cost|total amount|total)[^\\n]*?(?:rs\\.?|₹)\\s*([\\d,]{5,})`, "gi"))].map((m) => toNum(m[1]) ?? 0);
  const gst = t.match(/gst\s*@?\s*(\d+(?:\.\d+)?)\s*%/);
  const adv = t.match(/(\d{1,3})\s*%\s*(?:advance|booking)/) ?? t.match(/advance\s*[:\-]?\s*(\d{1,3})\s*%/);

  const laLine = lines.find((l) => /lightning arrester/i.test(l) || /\bLA\b/.test(l)) ?? "";
  const nmLine = lines.find((l) => /net meter/i.test(l)) ?? "";

  return {
    ...EMPTY_QUOTE,
    vendorName: lines[0]?.replace(/\((?:sample|fictional)[^)]*\)|·.*$/gi, "").trim() || null,
    stateCode: detectState(text),
    systemKw,
    totalPrice: totals.length ? Math.max(...totals) : null,
    gstPercent: gst ? Number(gst[1]) : null,
    panelWatt,
    panelCount: count ? Number(count[1]) : null,
    dcr: /non[-\s]?dcr|imported/.test(t) ? false : /\bdcr\b/.test(t) ? true : null,
    almmCells: /almm list[-\s]?ii/.test(t) ? true : null,
    inverterBrand: brand ? brand[1] : null,
    inverterKw: invKw ? Number(invKw[1]) : null,
    inverterWarrantyYears: invWarr ? Number(invWarr[1]) : null,
    structure,
    panelProductWarrantyYears: prod ? Number(prod[1]) : null,
    panelPerformanceYears: perf ? Number(perf[1]) : null,
    systemWarrantyYears: sys ? Number(sys[1]) : null,
    earthing: /earthing/.test(t) ? !/earthing[^\n]*not included/.test(t) : null,
    lightningArrester: laLine ? !/not included|extra/i.test(laLine) : null,
    netMeterIncluded: nmLine ? !/extra|not included|as per discom/i.test(nmLine) : null,
    monitoring: /wi-?fi|monitoring|app/.test(t) ? true : null,
    advancePercent: adv ? Number(adv[1]) : null,
    grievanceOfficer: /grievance/.test(t) ? true : null,
    city: findCities(text)[0] ?? null,
  };
}
