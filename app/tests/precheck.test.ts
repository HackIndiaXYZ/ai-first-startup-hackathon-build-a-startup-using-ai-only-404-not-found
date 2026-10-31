import { describe, expect, it } from "vitest";
import { parseQuote } from "../src/ai/parsers";
import { SAMPLE_QUOTES } from "../src/data/samples";
import { auditQuote, EMPTY_QUOTE, type Quote } from "../src/engine/quoteAudit";
import { precheckQuote } from "../src/lib/precheck";

const sample = (id: string): Quote => {
  const { city: _c, ...q } = parseQuote(SAMPLE_QUOTES.find((s) => s.id === id)!.text);
  void _c;
  return q;
};

describe("Pro pre-check", () => {
  it("verifies the fair deal", () => {
    const p = precheckQuote(sample("fair"));
    expect(p.verified).toBe(true);
    expect(p.fixes.every((f) => f.severity !== "critical")).toBe(true);
  });

  it("refuses the badge to the overcharger and lists critical fixes first", () => {
    const p = precheckQuote(sample("overcharger"));
    expect(p.verified).toBe(false);
    expect(p.fixes[0].severity).toBe("critical");
    expect(p.fixes.some((f) => f.severity === "ok")).toBe(false);
  });

  it("refuses the badge when the size is short, even at a fair price", () => {
    expect(precheckQuote(sample("short")).verified).toBe(false);
  });

  it("never verifies a quote it can't grade", () => {
    expect(precheckQuote({ ...EMPTY_QUOTE, vendorName: "x" }).verified).toBe(false);
  });

  it("uses exactly the home's audit: same grade and score", () => {
    for (const s of SAMPLE_QUOTES) {
      const q = sample(s.id);
      expect(precheckQuote(q).audit).toEqual(auditQuote(q));
    }
  });
});
