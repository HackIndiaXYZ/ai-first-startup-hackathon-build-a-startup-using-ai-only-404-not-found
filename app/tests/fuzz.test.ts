// Property and fuzz tests: every city, wide input ranges, random documents
// and junk tool arguments. Nothing may throw, and no number may be NaN or
// Infinity, and no user-facing text may leak "NaN", "undefined" or "null".

import { describe, expect, it } from "vitest";
import { localAgent } from "../src/ai/localAgent";
import { parseBill, parseQuote, parseSolarBill } from "../src/ai/parsers";
import { runTool, TOOL_SCHEMAS } from "../src/ai/tools";
import { SAMPLE_BILLS, SAMPLE_QUOTES, SAMPLE_SOLAR_BILLS } from "../src/data/samples";
import { auditBill, complaintLetter, EMPTY_BILL, type SolarBill } from "../src/engine/billAudit";
import { CITIES, climateFromCity, nearestCity } from "../src/engine/climate";
import { irr } from "../src/engine/finance";
import { rupees, rupeesShort, years } from "../src/engine/format";
import { specificYield } from "../src/engine/pv";
import { auditQuote, EMPTY_QUOTE, negotiationMessage, type Quote } from "../src/engine/quoteAudit";
import { buildReport } from "../src/engine/report";
import { formatClock, sunPosition, sunTimes } from "../src/engine/solar";
import { STATES, stateInfo } from "../src/engine/states";
import { subsidyFor } from "../src/engine/subsidy";
import { numParam, oneOf } from "../src/lib/params";
import { layoutArray, MAX_PANELS, MAX_POSTS, MAX_RAILS, roofFromArea } from "../src/three/layout";

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Paths to every non-finite number in a value. */
function badNumbers(v: unknown, path = "$", out: string[] = [], seen = new Set<unknown>()): string[] {
  if (typeof v === "number" && !Number.isFinite(v)) out.push(path);
  else if (v && typeof v === "object" && !seen.has(v)) {
    seen.add(v);
    for (const [k, x] of Object.entries(v)) badNumbers(x, `${path}.${k}`, out, seen);
  }
  return out;
}

const LEAK = /\bNaN\b|undefined|\bnull\b|Infinity|\[object/;

describe("report engine across every city and input range", () => {
  it("has 72 cities with 12 months of sane climate each", () => {
    expect(CITIES.length).toBe(72);
    for (const c of CITIES) {
      expect(c.ghi).toHaveLength(12);
      expect(c.t2m).toHaveLength(12);
      for (const g of c.ghi) {
        expect(g).toBeGreaterThan(1.5);
        expect(g).toBeLessThan(8.5);
      }
      for (const t of c.t2m) {
        expect(t).toBeGreaterThan(-25);
        expect(t).toBeLessThan(40);
      }
      expect(STATES[c.state], `${c.name} state ${c.state}`).toBeDefined();
      expect(c.lat).toBeGreaterThan(6);
      expect(c.lat).toBeLessThan(37);
      expect(c.lon).toBeGreaterThan(68);
      expect(c.lon).toBeLessThan(98);
    }
    expect(new Set(CITIES.map((c) => c.name)).size).toBe(CITIES.length);
  });

  it("gives every city a specific yield inside India's plausible band", () => {
    for (const c of CITIES) {
      const sy = specificYield(climateFromCity(c));
      expect(sy, c.name).toBeGreaterThan(1050);
      expect(sy, c.name).toBeLessThan(1900);
    }
  });

  it("never produces NaN or Infinity, for any city, usage, month, shade, roof or period", () => {
    const units = [10, 60, 150, 320, 640, 1200, 4000, 20000];
    const roofs = [200, 450, 900, 3000];
    let n = 0;
    for (const c of CITIES) {
      const climate = climateFromCity(c);
      for (const u of units) {
        const m = (u + c.name.length) % 12;
        const roof = roofs[(u + m) % roofs.length];
        const shading = (["none", "some", "heavy"] as const)[(u + roof) % 3];
        const period = (u % 2 ? 1 : 2) as 1 | 2;
        const r = buildReport({ climate, units: u, billMonth: m, periodMonths: period, roofAreaSqft: roof, shading });
        const bad = badNumbers({ ...r, input: undefined });
        expect(bad, `${c.name} ${u}u m${m} ${roof}sqft ${shading}`).toEqual([]);
        expect(r.panels).toBeGreaterThanOrEqual(2);
        expect(r.panels).toBeLessThanOrEqual(MAX_PANELS);
        expect(r.subsidy.central).toBeLessThanOrEqual(85800);
        expect(r.annualGeneration).toBeGreaterThan(0);
        expect(r.net.savings).toBeGreaterThanOrEqual(0);
        expect(r.net.coverage).toBeGreaterThanOrEqual(0);
        expect(r.net.coverage).toBeLessThanOrEqual(1.0001);
        n++;
      }
    }
    expect(n).toBe(CITIES.length * units.length);
  });

  it("handles overrides at the edges: 2 to 40 panels, tiny and huge prices, odd tariffs", () => {
    const climate = climateFromCity(CITIES[0]);
    for (const panels of [2, 3, 6, 11, 20, 40])
      for (const grossCost of [10000, 150000, 5000000])
        for (const tariff of [1, 6.5, 30]) {
          const r = buildReport({ climate, units: 400, billMonth: 5, periodMonths: 1, roofAreaSqft: 900, shading: "none", overridePanels: panels, grossCost, tariff, sanctionedLoadKw: 0.5 });
          expect(badNumbers({ ...r, input: undefined }), `${panels} ${grossCost} ${tariff}`).toEqual([]);
          if (r.payback !== null) expect(r.payback).toBeGreaterThanOrEqual(0);
        }
  });

  it("subsidy is monotonic in size and capped, with state top-ups never negative", () => {
    for (const st of Object.values(STATES)) {
      let prev = 0;
      for (let kw = 0; kw <= 12; kw += 0.25) {
        const s = subsidyFor(kw, st);
        expect(s.total).toBeGreaterThanOrEqual(prev);
        expect(s.state).toBeGreaterThanOrEqual(0);
        expect(s.central).toBeLessThanOrEqual(st.specialCategory ? 85800 : 78000);
        prev = s.total;
      }
    }
  });

  it("irr is null when cash never turns positive, and finite otherwise", () => {
    expect(irr([{ year: 0, net: -100000 } as never, ...Array.from({ length: 25 }, (_, i) => ({ year: i + 1, net: -10 }) as never)])).toBeNull();
    const v = irr([{ year: 0, net: -100000 } as never, ...Array.from({ length: 25 }, (_, i) => ({ year: i + 1, net: 20000 }) as never)]);
    expect(v).not.toBeNull();
    expect(Number.isFinite(v!)).toBe(true);
  });
});

describe("solar geometry over a whole year", () => {
  it("keeps elevation and azimuth in range for every city, day and hour", () => {
    for (const c of CITIES.filter((_, i) => i % 6 === 0))
      for (let doy = 1; doy <= 365; doy += 11)
        for (let h = 0; h < 24; h += 0.5) {
          const p = sunPosition(c.lat, c.lon, doy, h);
          expect(p.elevation).toBeGreaterThanOrEqual(-90);
          expect(p.elevation).toBeLessThanOrEqual(90);
          expect(p.azimuth).toBeGreaterThanOrEqual(0);
          expect(p.azimuth).toBeLessThan(360.0001);
        }
  });
  it("sunrise precedes noon precedes sunset, and the clock formats cleanly", () => {
    for (const c of CITIES)
      for (const doy of [1, 80, 172, 266, 355]) {
        const t = sunTimes(c.lat, c.lon, doy);
        expect(t.sunrise).toBeLessThan(t.noon);
        expect(t.noon).toBeLessThan(t.sunset);
        expect(t.sunset - t.sunrise).toBeGreaterThan(9.5);
        expect(t.sunset - t.sunrise).toBeLessThan(14.5);
      }
    for (let h = 0; h <= 24; h += 0.05) expect(formatClock(h)).toMatch(/^\d{1,2}:\d{2}( (AM|PM))?$/);
  });
  it("finds a nearest city for any point in India", () => {
    for (let lat = 8; lat <= 34; lat += 2) for (let lon = 69; lon <= 96; lon += 3) expect(nearestCity(lat, lon)).toBeDefined();
  });
});

describe("3D layout capacity", () => {
  it("never needs more posts or rails than the instance buffers hold", () => {
    for (let sqft = 200; sqft <= 3000; sqft += 100) {
      const roof = roofFromArea(sqft, 2);
      for (let n = 1; n <= MAX_PANELS; n++) {
        for (const tilt of [10, 20, 30]) {
          const l = layoutArray(n, roof, tilt);
          expect(l.slots).toHaveLength(n);
          let posts = 0;
          l.rowSpanX.forEach(([a, b]) => (posts += (b - a > 5 ? 3 : 2) * 2));
          expect(posts).toBeLessThanOrEqual(MAX_POSTS);
          expect(l.rowZ.length * 2).toBeLessThanOrEqual(MAX_RAILS);
          for (const s of l.slots) expect(Math.abs(s.x)).toBeLessThanOrEqual(roof.w / 2 + 0.01);
        }
      }
    }
  });
});

describe("quote audit fuzz", () => {
  const r = rng(42);
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];
  const maybe = <T,>(v: T) => (r() < 0.3 ? null : v);
  const tri = () => pick([true, false, null]);
  const states = Object.keys(STATES);

  it("grades 3,000 random quotes without NaN or leaked placeholders", () => {
    for (let i = 0; i < 3000; i++) {
      const q: Quote = {
        ...EMPTY_QUOTE,
        vendorName: maybe(pick(["Surya Power", "राधे सोलर", "", "A&B <Solar>"])),
        stateCode: maybe(pick(states)),
        systemKw: maybe(pick([0.5, 1, 2, 2.18, 3, 3.27, 5, 10, 25])),
        totalPrice: maybe(Math.round(r() * 900000)),
        gstPercent: maybe(pick([0, 5, 8.9, 12, 13.8, 18])),
        panelWatt: maybe(pick([330, 440, 540, 545, 580, 600])),
        panelCount: maybe(pick([1, 4, 6, 12, 40])),
        dcr: tri(),
        almmCells: tri(),
        inverterKw: maybe(pick([1, 3, 5, 10])),
        inverterWarrantyYears: maybe(pick([1, 5, 10])),
        structure: pick(["hdg", "zam", "aluminium", "ms-painted", "unknown"] as const),
        panelProductWarrantyYears: maybe(pick([5, 10, 12, 25])),
        panelPerformanceYears: maybe(pick([10, 25, 30])),
        systemWarrantyYears: maybe(pick([0, 1, 5])),
        earthing: tri(),
        lightningArrester: tri(),
        netMeterIncluded: tri(),
        monitoring: tri(),
        advancePercent: maybe(pick([0, 10, 30, 50, 100])),
        grievanceOfficer: tri(),
      };
      const a = auditQuote(q);
      expect(badNumbers(a), JSON.stringify(q)).toEqual([]);
      expect(a.score).toBeGreaterThanOrEqual(0);
      expect(a.score).toBeLessThanOrEqual(100);
      expect(new Set(a.findings.map((f) => f.id)).size, JSON.stringify(a.findings.map((f) => f.id))).toBe(a.findings.length);
      for (const f of a.findings) expect(`${f.title} ${f.detail}`, JSON.stringify(q)).not.toMatch(LEAK);
      if (a.incomplete) expect(a.verdict).not.toMatch(/fair deal/);
      for (const lang of ["en", "hi"] as const) {
        const msg = negotiationMessage(q, a, lang);
        expect(msg.length).toBeGreaterThan(20);
        expect(msg, JSON.stringify(q)).not.toMatch(LEAK);
      }
    }
  });

  it("never calls an empty quote a fair deal", () => {
    const a = auditQuote(EMPTY_QUOTE);
    expect(a.incomplete).toBe(true);
    expect(a.verdict).not.toMatch(/fair/);
    expect(negotiationMessage(EMPTY_QUOTE, a, "en")).not.toMatch(/look fair/);
  });

  it("asks for the size when only a price is given, and for the price when only a size is", () => {
    expect(auditQuote({ ...EMPTY_QUOTE, totalPrice: 200000 }).findings.some((f) => f.id === "size")).toBe(true);
    expect(auditQuote({ ...EMPTY_QUOTE, systemKw: 3 }).findings.some((f) => f.id === "price")).toBe(true);
  });
});

describe("bill audit fuzz", () => {
  const r = rng(7);
  const maybe = (v: number) => (r() < 0.25 ? null : v);
  it("audits 3,000 random bills and drafts letters without NaN or placeholders leaking", () => {
    for (let i = 0; i < 3000; i++) {
      const imp = Math.round(r() * 900);
      const b: SolarBill = {
        ...EMPTY_BILL,
        billMonth: Math.floor(r() * 12),
        importUnits: maybe(imp),
        exportUnits: maybe(Math.round(r() * 700)),
        previousCredit: maybe(Math.round(r() * 200)),
        netUnitsBilled: maybe(Math.round(r() * 900)),
        energyCharges: maybe(Math.round(r() * 9000)),
        otherCharges: maybe(Math.round(r() * 900)),
        otherChargesLabel: r() < 0.5 ? null : ["Electricity duty", "Misc", "", "FPPCA"][Math.floor(r() * 4)],
      };
      const ctx = { systemKwp: r() < 0.1 ? 0 : 1 + r() * 9, expectedGeneration: r() * 900, tariff: 3 + r() * 7 };
      const a = auditBill(b, ctx);
      expect(badNumbers(a), JSON.stringify(b)).toEqual([]);
      expect(a.overbilled).toBeGreaterThanOrEqual(0);
      for (const f of a.findings) expect(`${f.title} ${f.detail}`, JSON.stringify(b)).not.toMatch(LEAK);
      expect(complaintLetter(b, a, ctx), JSON.stringify(b)).not.toMatch(LEAK);
      if (a.incomplete) expect(a.verdict).not.toMatch(/checks out/);
    }
  });
  it("does not say an empty bill checks out", () => {
    const a = auditBill(EMPTY_BILL, { systemKwp: 3, expectedGeneration: 380, tariff: 7 });
    expect(a.incomplete).toBe(true);
    expect(a.verdict).not.toMatch(/checks out/);
  });
});

describe("parsers never throw and stay fast on hostile text", () => {
  const r = rng(99);
  const alphabet = "0123456789 ,.:-₹/kWhunitsIMPORTEXPORTकिलोवाटयूनिटDCRlakh\n\t%()";
  const parsers = [parseBill, parseSolarBill, parseQuote];
  it("handles 600 random strings", () => {
    for (let i = 0; i < 600; i++) {
      let s = "";
      const len = Math.floor(r() * 400);
      for (let j = 0; j < len; j++) s += alphabet[Math.floor(r() * alphabet.length)];
      for (const p of parsers) expect(badNumbers(p(s)), s).toEqual([]);
    }
  });
  it("handles empty, huge and pathological input within time", () => {
    const nasty = ["", " ", "\u0000", "1".repeat(50000), "1,".repeat(30000), "Units: ".repeat(8000), `${"9".repeat(400)} units`, "₹".repeat(20000) + "1", "a\n".repeat(40000)];
    for (const s of nasty)
      for (const p of parsers) {
        const t0 = performance.now();
        expect(() => p(s)).not.toThrow();
        expect(performance.now() - t0, `${p.name} on ${s.slice(0, 20)}… (${s.length})`).toBeLessThan(400);
      }
  });
  it("reads every bundled sample with the key fields present", () => {
    for (const s of SAMPLE_BILLS) {
      const b = parseBill(s.text);
      expect(b.units, s.id).toBeGreaterThan(0);
      expect(b.billMonth, s.id).not.toBeNull();
    }
    for (const s of SAMPLE_SOLAR_BILLS) {
      const b = parseSolarBill(s.text);
      expect(b.importUnits, s.id).not.toBeNull();
      expect(b.exportUnits, s.id).not.toBeNull();
    }
    for (const s of SAMPLE_QUOTES) {
      const q = parseQuote(s.text);
      expect(q.totalPrice, s.id).toBeGreaterThan(0);
      expect(q.systemKw ?? q.panelCount, s.id).toBeTruthy();
    }
  });
});

describe("tools reject junk arguments gracefully", () => {
  const junk: unknown[] = [null, undefined, "", "abc", -1, 0, 1e12, -1e12, NaN, Infinity, true, [], {}, "3", "Delhi", "<script>"];
  it("runs every tool with every junk value in every argument", () => {
    for (const t of TOOL_SCHEMAS) {
      const keys = Object.keys((t.input_schema as { properties: Record<string, unknown> }).properties);
      for (const v of junk) {
        for (const k of keys) {
          const res = runTool(t.name, { [k]: v });
          expect(typeof res.summary).toBe("string");
          // Unknown-city messages echo the input back, so only check for computed junk.
          if (typeof v !== "number" || Number.isFinite(v)) expect(res.summary, `${t.name}.${k}=${String(v)}`).not.toMatch(/\bNaN\b|Infinity|\[object/);
          if (res.ok) expect(badNumbers(res.data), `${t.name}.${k}=${String(v)}`).toEqual([]);
        }
      }
    }
    expect(runTool("nope", {}).ok).toBe(false);
  });
});

describe("on-device agent", () => {
  const queries = [
    "hi",
    "नमस्ते",
    "Lucknow, 420 units",
    "I'm in Pune and use 380 units a month",
    "मैं दिल्ली में रहता हूँ, बिल 600 यूनिट आता है",
    "mera bill 3500 rs aata hai jaipur me",
    "How much subsidy for 3 kW?",
    "subsidy for 5kw in assam",
    "Vendor quoted 2.4 lakh for 3 kW, is that fair?",
    "quote for 3kw is 210000",
    "my quote is 3 kw",
    "got a quotation of ₹1,95,000",
    "the vendor is charging 1.6L for 3kw non dcr panels",
    "Is 5% GST right on solar?",
    "what is DCR",
    "ALMM list 2 kya hai",
    "My bill shows import 420 export 0 billed 420",
    "import 380 export 260 billed 380 in Chennai",
    "net metering kaise kaam karta hai",
    "loan for 3 kW at 1.8 lakh",
    "EMI kitni hogi 2 lakh pe",
    "how long does installation take",
    "what if it rains, will panels work",
    "Bangalore 900 units, 600 sq ft roof",
    "Kolkata",
    "999999 units",
    "0 units",
    "-5 kW",
    "1e9",
    "",
    "   ",
    "🙂🙂🙂",
    "<script>alert(1)</script>",
    "a".repeat(5000),
    "दिल्ली",
    "Bombay 250 units in May",
    "bill in july was 700 units, gurgaon",
    "solar for a flat in a society",
    "Is it worth it?",
    "maintenance cost?",
    "warranty kitni honi chahiye",
    "what happens to extra units",
    "can I add a battery",
    "who are you",
    "do you sell panels",
  ];
  it("answers every query without throwing, with clean text and successful tool calls", () => {
    let history: { role: "user" | "assistant"; text: string }[] = [];
    for (const q of queries) {
      const r = localAgent(q, history);
      expect(r.text.trim().length, q).toBeGreaterThan(10);
      expect(r.text, q).not.toMatch(LEAK);
      for (const t of r.trace) expect(t.summary, `${q} → ${t.tool}`).not.toMatch(/\bNaN\b|Infinity/);
      history = [...history, { role: "user" as const, text: q }, { role: "assistant" as const, text: r.text }].slice(-10);
    }
  });
  it("asks for the price instead of calling a price-less quote fair", () => {
    const r = localAgent("my installer's quote is for 3 kW", []);
    expect(r.text).not.toMatch(/inside the fair range/);
    expect(r.text).toMatch(/what total price/i);
  });
  it("reads a bare amount as the quoted price", () => {
    const r = localAgent("quote for 3kw is 250000", []);
    expect(r.trace[0]?.tool).toBe("audit_quote");
    expect(r.trace[0]?.args.total_price).toBe(250000);
    expect(r.text).toMatch(/above that/);
  });
  it("does not call a far-too-cheap quote fair", () => {
    const r = localAgent("quote for 3 kW is ₹90,000", []);
    expect(r.text).toMatch(/below that range/);
  });
});

describe("formatting and URL params", () => {
  it("formats money for every magnitude and sign", () => {
    for (const n of [0, 1, 999, 1e5, 1.23e7, -45600, 0.4]) {
      expect(rupees(n)).not.toMatch(LEAK);
      expect(rupeesShort(n)).not.toMatch(LEAK);
    }
    expect(rupees(123456)).toBe("₹1,23,456");
    expect(years(null)).toMatch(/beyond/);
  });
  it("rejects bad URL numbers and enum values", () => {
    const p = new URLSearchParams("units=abc&month=13&roof=1e9&tariff=-2&panels=4.6&price=1,95,000&load=&shade=bogus&ok=7");
    expect(numParam(p, "units", 10, 20000)).toBeNull();
    expect(numParam(p, "month", 1, 12)).toBeNull();
    expect(numParam(p, "roof", 200, 3000)).toBeNull();
    expect(numParam(p, "tariff", 1, 30)).toBeNull();
    expect(numParam(p, "panels", 2, 40, true)).toBe(5);
    expect(numParam(p, "price", 10000, 5e6)).toBe(195000);
    expect(numParam(p, "load", 0.5, 100)).toBeNull();
    expect(numParam(p, "missing", 0, 1)).toBeNull();
    expect(oneOf(p.get("shade"), ["none", "some", "heavy"] as const)).toBeNull();
    expect(oneOf("some", ["none", "some", "heavy"] as const)).toBe("some");
    expect(stateInfo("ZZ").tariff).toBeGreaterThan(0);
  });
});
