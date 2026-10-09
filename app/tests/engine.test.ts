import { describe, expect, it } from "vitest";
import { cityByName, climateFromCity } from "../src/engine/climate";
import { emi, loanPlan } from "../src/engine/finance";
import { monthlyConsumption } from "../src/engine/consumption";
import { specificYield, monthlyPOA } from "../src/engine/pv";
import { fairPriceBand } from "../src/engine/pricing";
import { buildReport } from "../src/engine/report";
import { netMetering } from "../src/engine/savings";
import { recommendSize } from "../src/engine/sizing";
import { extraterrestrialDaily, sunPosition, sunTimes } from "../src/engine/solar";
import { centralSubsidy, subsidyFor } from "../src/engine/subsidy";
import { stateInfo } from "../src/engine/states";
import { auditQuote, EMPTY_QUOTE, negotiationMessage } from "../src/engine/quoteAudit";
import { auditBill, EMPTY_BILL } from "../src/engine/billAudit";

const delhi = climateFromCity(cityByName("Delhi")!);
const chennai = climateFromCity(cityByName("Chennai")!);

describe("solar geometry", () => {
  it("extraterrestrial irradiation at the equator on the equinox is ~10.4 kWh/m²/day", () => {
    expect(extraterrestrialDaily(0, 80)).toBeGreaterThan(10.2);
    expect(extraterrestrialDaily(0, 80)).toBeLessThan(10.6);
  });
  it("Delhi solar noon on 21 June is ~12:20 IST and the sun is ~85° high", () => {
    const t = sunTimes(28.61, 77.21, 172);
    expect(t.noon).toBeGreaterThan(12.2);
    expect(t.noon).toBeLessThan(12.5);
    const p = sunPosition(28.61, 77.21, 172, t.noon);
    expect(p.elevation).toBeGreaterThan(83);
    expect(p.elevation).toBeLessThan(86);
  });
  it("morning sun is in the east, evening sun in the west", () => {
    expect(sunPosition(28.61, 77.21, 100, 8).azimuth).toBeGreaterThan(60);
    expect(sunPosition(28.61, 77.21, 100, 8).azimuth).toBeLessThan(120);
    expect(sunPosition(28.61, 77.21, 100, 17).azimuth).toBeGreaterThan(240);
  });
});

describe("pv model", () => {
  it("tilting toward the equator gains in Delhi's winter", () => {
    const poa = monthlyPOA(delhi, 28);
    expect(poa[11]).toBeGreaterThan(delhi.ghi[11] * 1.25);
  });
  it("Delhi specific yield lands in the 1,350 to 1,600 kWh/kWp band", () => {
    const sy = specificYield(delhi);
    expect(sy).toBeGreaterThan(1350);
    expect(sy).toBeLessThan(1600);
  });
  it("shading reduces yield", () => {
    expect(specificYield(chennai, "heavy")).toBeLessThan(specificYield(chennai, "none"));
  });
});

describe("subsidy", () => {
  it("follows PM Surya Ghar slabs", () => {
    expect(centralSubsidy(1, false)).toBe(30000);
    expect(centralSubsidy(2, false)).toBe(60000);
    expect(centralSubsidy(3, false)).toBe(78000);
    expect(centralSubsidy(5, false)).toBe(78000);
    expect(centralSubsidy(2.5, false)).toBe(69000);
  });
  it("pays more in special-category states", () => {
    expect(centralSubsidy(3, true)).toBe(85800);
    expect(centralSubsidy(1, true)).toBe(33000);
  });
  it("stacks the Delhi top-up", () => {
    const s = subsidyFor(3.27, stateInfo("DL"));
    expect(s.central).toBe(78000);
    expect(s.state).toBe(30000);
    expect(s.total).toBe(108000);
  });
});

describe("consumption, sizing, net metering", () => {
  it("scales a May bill so May matches the bill", () => {
    const c = monthlyConsumption(500, 4, "north");
    expect(c[4]).toBeCloseTo(500, 5);
    expect(c[0]).toBeLessThan(c[4]);
  });
  it("roof area caps the system", () => {
    const r = recommendSize({ annualConsumption: 9000, specificYield: 1450, roofAreaSqft: 300 });
    expect(r.limitedBy).toBe("roof");
    expect(r.kwp).toBeLessThanOrEqual(2.4);
  });
  it("banks summer surplus against winter deficit", () => {
    const cons = new Array(12).fill(300);
    const gen = [200, 250, 380, 420, 430, 360, 280, 280, 330, 340, 260, 210];
    const r = netMetering(cons, gen, 8, 2.75);
    expect(r.savings).toBeGreaterThan(0);
    expect(r.coverage).toBeGreaterThan(0.9);
  });
});

describe("finance", () => {
  it("EMI matches the standard formula", () => {
    expect(emi(100000, 0.12, 1)).toBeCloseTo(8884.88, 1);
  });
  it("loan for 3 kW uses the concessional rate", () => {
    const l = loanPlan(180000, 78000, 3.27);
    expect(l.concessional).toBe(true);
    expect(l.emiAfter).toBeLessThan(l.emiBefore);
  });
});

describe("full report", () => {
  it("a Delhi home using 450 units in May gets a sensible 3 to 5 kW system with payback under 7 years", () => {
    const r = buildReport({ climate: delhi, units: 450, billMonth: 4, periodMonths: 1, roofAreaSqft: 900, shading: "none" });
    expect(r.kwp).toBeGreaterThan(2.5);
    expect(r.kwp).toBeLessThan(5.5);
    expect(r.payback).not.toBeNull();
    expect(r.payback!).toBeLessThan(7);
    expect(r.subsidy.total).toBeGreaterThanOrEqual(78000);
    expect(r.co2TonnesYear).toBeGreaterThan(2);
  });
});

describe("quote audit", () => {
  const base = { ...EMPTY_QUOTE, stateCode: "DL", systemKw: 3, panelWatt: 545, panelCount: 6, dcr: true, almmCells: true, inverterKw: 3, systemWarrantyYears: 5, structure: "hdg" as const };
  it("passes a fair quote", () => {
    const a = auditQuote({ ...base, totalPrice: fairPriceBand(3.27).mid });
    expect(a.grade === "A" || a.grade === "B").toBe(true);
    expect(a.findings.some((f) => f.severity === "critical")).toBe(false);
  });
  it("catches overpricing, non-DCR panels and missing capacity", () => {
    const a = auditQuote({ ...base, panelCount: 5, totalPrice: 240000, dcr: false, gstPercent: 13.8, advancePercent: 50 });
    expect(a.findings.find((f) => f.id === "capacity")?.severity).toBe("critical");
    expect(a.findings.find((f) => f.id === "dcr")?.severity).toBe("critical");
    expect(a.overcharge).toBeGreaterThan(30000);
    expect(a.subsidyAtRisk).toBe(73050);
    expect(a.grade).toBe("F");
    expect(negotiationMessage(base, a, "hi")).toContain("DCR");
  });
});

describe("bill audit", () => {
  const ctx = { systemKwp: 3.27, expectedGeneration: 420, tariff: 7 };
  it("flags billing on import", () => {
    const a = auditBill({ ...EMPTY_BILL, importUnits: 410, exportUnits: 230, previousCredit: 0, netUnitsBilled: 410, energyCharges: 2870 }, ctx);
    expect(a.findings[0].id).toBe("billed-on-import");
    expect(a.overbilled).toBeGreaterThan(1000);
  });
  it("flags zero export", () => {
    const a = auditBill({ ...EMPTY_BILL, importUnits: 380, exportUnits: 0, netUnitsBilled: 380 }, ctx);
    expect(a.findings.some((f) => f.id === "no-export")).toBe(true);
  });
  it("passes a correct bill", () => {
    const a = auditBill({ ...EMPTY_BILL, importUnits: 380, exportUnits: 250, previousCredit: 20, netUnitsBilled: 110, energyCharges: 770 }, ctx);
    expect(a.findings.some((f) => f.severity === "critical")).toBe(false);
  });
});
