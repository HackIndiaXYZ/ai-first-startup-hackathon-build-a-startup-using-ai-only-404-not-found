import { beforeEach, describe, expect, it } from "vitest";
import { parseQuote } from "../src/ai/parsers";
import { SAMPLE_QUOTES } from "../src/data/samples";
import { EMPTY_QUOTE, type Quote } from "../src/engine/quoteAudit";
import { compareQuotes, loadSlots, saveSlots } from "../src/lib/compare";

const sample = (id: string): Quote => {
  const { city: _c, ...q } = parseQuote(SAMPLE_QUOTES.find((s) => s.id === id)!.text);
  void _c;
  return q;
};

beforeEach(() => {
  const mem = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  };
});

describe("compareQuotes", () => {
  it("picks the fair deal over the overcharger and the short system, in any order", () => {
    for (const order of [["overcharger", "fair", "short"], ["short", "overcharger", "fair"], ["fair", "short", "overcharger"]]) {
      const c = compareQuotes(order.map(sample));
      expect(c.best?.quote.totalPrice).toBe(sample("fair").totalPrice);
      expect(c.noneSafe).toBe(false);
      expect(c.whyNot).toHaveLength(2);
    }
  });

  it("explains every loser with its worst problem", () => {
    const c = compareQuotes([sample("overcharger"), sample("fair"), sample("short")]);
    for (const w of c.whyNot) expect(w.reason.length).toBeGreaterThan(10);
    expect(c.reasons[0]).toMatch(/\/100/);
  });

  it("says none is safe when the best is graded D or F", () => {
    const c = compareQuotes([sample("overcharger"), null, null]);
    expect(c.best).not.toBeNull();
    expect(c.noneSafe).toBe(true);
  });

  it("never picks a quote it can't grade", () => {
    const blank = { ...EMPTY_QUOTE, vendorName: "No price" };
    const c = compareQuotes([blank, null, null]);
    expect(c.best).toBeNull();
    expect(c.whyNot[0]).toMatchObject({ name: "No price", reason: expect.stringMatching(/can't be graded/) });
  });

  it("breaks a near-tie on price per kW, and asks the winner to match the fair band", () => {
    const fair = sample("fair");
    const pricier = { ...fair, vendorName: "Pricier", totalPrice: (fair.totalPrice ?? 0) + 4000 };
    const c = compareQuotes([pricier, fair, null]);
    expect(c.best?.quote.totalPrice).toBe(fair.totalPrice);
    const over = { ...fair, vendorName: "Over", totalPrice: 400000 };
    expect(compareQuotes([over, null, null]).ask).toMatch(/Ask Over to match ₹/);
  });

  it("names unnamed quotes by slot", () => {
    const c = compareQuotes([null, { ...sample("fair"), vendorName: null }, null]);
    expect(c.items[0].name).toBe("Quote B");
  });
});

describe("saved slots", () => {
  it("round-trips and survives junk", () => {
    saveSlots([sample("fair"), null, sample("short")]);
    const s = loadSlots();
    expect(s[0]?.totalPrice).toBe(sample("fair").totalPrice);
    expect(s[1]).toBeNull();
    localStorage.setItem("chhat:compare", "{bad");
    expect(loadSlots()).toEqual([null, null, null]);
  });
});
