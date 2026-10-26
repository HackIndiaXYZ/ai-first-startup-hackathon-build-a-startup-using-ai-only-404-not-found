import { describe, expect, it } from "vitest";
import { parseBill, parseQuote, parseSolarBill } from "../src/ai/parsers";
import { SAMPLE_BILLS, SAMPLE_QUOTES, SAMPLE_SOLAR_BILLS } from "../src/data/samples";
import { auditQuote } from "../src/engine/quoteAudit";
import { auditBill } from "../src/engine/billAudit";
import { localAgent } from "../src/ai/localAgent";

const byId = <T extends { id: string }>(arr: T[], id: string) => arr.find((x) => x.id === id)!;

describe("bill parser", () => {
  it("reads the Delhi sample", () => {
    const b = parseBill(byId(SAMPLE_BILLS, "delhi-may").text);
    expect(b.units).toBe(476);
    expect(b.billMonth).toBe(4);
    expect(b.energyCharges).toBe(2620.5);
    expect(b.sanctionedLoadKw).toBe(5);
    expect(b.stateCode).toBe("DL");
    expect(b.tariff).toBeCloseTo(5.51, 1);
    expect(b.billAmount).toBe(3304.7);
  });
  it("reads the Pune sample", () => {
    const b = parseBill(byId(SAMPLE_BILLS, "pune-apr").text);
    expect(b.units).toBe(382);
    expect(b.billMonth).toBe(3);
    expect(b.stateCode).toBe("MH");
    expect(b.billAmount).toBe(4520.24);
  });
  it("detects a bimonthly bill", () => {
    const b = parseBill(byId(SAMPLE_BILLS, "chennai-bimonthly").text);
    expect(b.units).toBe(742);
    expect(b.periodMonths).toBe(2);
    expect(b.billMonth).toBe(5);
    expect(b.stateCode).toBe("TN");
  });
});

describe("quote parser + audit", () => {
  it("catches everything in the overcharger", () => {
    const q = parseQuote(byId(SAMPLE_QUOTES, "overcharger").text);
    expect(q.systemKw).toBe(3);
    expect(q.panelWatt).toBe(540);
    expect(q.panelCount).toBe(5);
    expect(q.dcr).toBe(false);
    expect(q.totalPrice).toBe(241256);
    expect(q.gstPercent).toBe(13.8);
    expect(q.structure).toBe("ms-painted");
    expect(q.inverterKw).toBe(3);
    expect(q.inverterWarrantyYears).toBe(3);
    expect(q.advancePercent).toBe(70);
    expect(q.lightningArrester).toBe(false);
    expect(q.netMeterIncluded).toBe(false);
    expect(q.systemWarrantyYears).toBe(1);
    expect(q.panelProductWarrantyYears).toBe(5);
    expect(q.stateCode).toBe("DL");
    const a = auditQuote(q);
    expect(a.grade).toBe("F");
    expect(a.moneyAtRisk).toBeGreaterThan(100000);
  });
  it("passes the fair deal", () => {
    const q = parseQuote(byId(SAMPLE_QUOTES, "fair").text);
    expect(q.systemKw).toBe(3.27);
    expect(q.panelCount).toBe(6);
    expect(q.panelWatt).toBe(545);
    expect(q.dcr).toBe(true);
    expect(q.almmCells).toBe(true);
    expect(q.structure).toBe("hdg");
    expect(q.totalPrice).toBe(192000);
    expect(q.systemWarrantyYears).toBe(5);
    expect(q.inverterWarrantyYears).toBe(8);
    expect(q.netMeterIncluded).toBe(true);
    const a = auditQuote(q);
    expect(["A", "B"]).toContain(a.grade);
  });
  it("finds the missing panels", () => {
    const q = parseQuote(byId(SAMPLE_QUOTES, "short").text);
    expect(q.systemKw).toBe(4);
    expect(q.panelCount).toBe(6);
    expect(q.stateCode).toBe("UP");
    const a = auditQuote(q);
    expect(a.findings.find((f) => f.id === "capacity")?.severity).toBe("critical");
  });
});

describe("solar bill parser + audit", () => {
  const ctx = { systemKwp: 3.27, expectedGeneration: 480, tariff: 6.5 };
  it("flags billing on import", () => {
    const b = parseSolarBill(byId(SAMPLE_SOLAR_BILLS, "import-billed").text);
    expect(b.importUnits).toBe(410);
    expect(b.exportUnits).toBe(236);
    expect(b.netUnitsBilled).toBe(410);
    expect(b.otherCharges).toBe(1180);
    expect(b.systemKwp).toBe(3.27);
    const a = auditBill(b, ctx);
    expect(a.findings[0].id).toBe("billed-on-import");
    expect(a.overbilled).toBeGreaterThan(2000);
  });
  it("flags zero export", () => {
    const b = parseSolarBill(byId(SAMPLE_SOLAR_BILLS, "zero-export").text);
    expect(b.exportUnits).toBe(0);
    expect(auditBill(b, ctx).findings.some((f) => f.id === "no-export")).toBe(true);
  });
  it("passes the correct bill", () => {
    const b = parseSolarBill(byId(SAMPLE_SOLAR_BILLS, "correct").text);
    expect(b.previousCredit).toBe(22);
    expect(b.netUnitsBilled).toBe(22);
    expect(auditBill(b, ctx).findings.some((f) => f.severity === "critical")).toBe(false);
  });
});

describe("on-device agent", () => {
  it("sizes a system from city and units", () => {
    const r = localAgent("Is solar worth it in Pune? We use 420 units a month", []);
    expect(r.trace.map((t) => t.tool)).toContain("size_system");
    expect(r.text).toMatch(/kWp/);
  });
  it("answers subsidy in Hindi", () => {
    const r = localAgent("दिल्ली में 3 kW पर कितनी सब्सिडी मिलेगी?", []);
    expect(r.lang).toBe("hi");
    expect(r.trace[0].tool).toBe("compute_subsidy");
    expect(r.text).toContain("₹1,08,000");
  });
  it("audits a quoted price", () => {
    const r = localAgent("Vendor quoted 2.4 lakh for 3 kW in Lucknow, fair?", []);
    expect(r.trace[0].tool).toBe("audit_quote");
  });
  it("falls back to the knowledge base", () => {
    const r = localAgent("Do I need a battery for power cuts?", []);
    expect(r.trace[0].tool).toBe("search_knowledge");
    expect(r.text).toMatch(/battery|Batter/i);
  });
  it("remembers the city across turns", () => {
    const r = localAgent("we use 380 units", [{ role: "user", text: "I live in Jaipur" }]);
    expect(r.trace.some((t) => t.tool === "size_system")).toBe(true);
  });
});
