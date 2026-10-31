import { beforeEach, describe, expect, it } from "vitest";
import { costPerSale, createLead, deleteLead, leadPreview, loadLeads, markBought, maskPhone, normalizePhone, paymentLink, PRICING, validateLead } from "../src/lib/leads";

// A tiny in-memory localStorage for the node test environment.
beforeEach(() => {
  const mem = new Map<string, string>();
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  };
});

const ok = { name: "Asha Verma", phone: "+91 98765 43210", pincode: "411001", time: "evening" as const, consent: true };

describe("pricing", () => {
  it("matches the business plan's cost per closed sale (₹10,773, 5.9%)", () => {
    const c = costPerSale();
    expect(c.total).toBe(10_773);
    expect(c.share).toBeCloseTo(0.059, 3);
  });
  it("never goes negative", () => {
    expect(costPerSale(-3, -10).total).toBe(0);
  });
  it("homes pay nothing: every price is on the installer, lender or state side", () => {
    expect(PRICING.leadFee).toBe(1500);
    expect(PRICING.proMonthly).toBe(2999);
  });
});

describe("payment links", () => {
  it("uses a configured https link", () => {
    expect(paymentLink("lead", { VITE_LEAD_PAYMENT_LINK: "https://rzp.io/l/chhat-lead" })).toBe("https://rzp.io/l/chhat-lead");
    expect(paymentLink("pro", { VITE_PRO_PAYMENT_LINK: " https://buy.stripe.com/test_123 " })).toBe("https://buy.stripe.com/test_123");
  });
  it("falls back to the demo when unset or unsafe", () => {
    expect(paymentLink("lead", {})).toBeNull();
    expect(paymentLink("lead", { VITE_LEAD_PAYMENT_LINK: "javascript:alert(1)" })).toBeNull();
    expect(paymentLink("pro", { VITE_PRO_PAYMENT_LINK: "not a url" })).toBeNull();
  });
});

describe("phone numbers", () => {
  it.each([
    ["9876543210", "9876543210"],
    ["+91 98765 43210", "9876543210"],
    ["09876543210", "9876543210"],
    ["98765-43210", "9876543210"],
  ])("accepts %s", (raw, want) => expect(normalizePhone(raw)).toBe(want));
  it.each(["12345", "5876543210", "98765432101", "abcdefghij"])("rejects %s", (raw) => expect(normalizePhone(raw)).toBeNull());
  it("masks all but the first and last two digits", () => expect(maskPhone("9876543210")).toBe("98••••••10"));
});

describe("leads", () => {
  it("lists every problem with a bad form", () => {
    const e = validateLead({ name: " ", phone: "123", pincode: "0110", time: "morning", consent: false });
    expect(Object.keys(e).sort()).toEqual(["consent", "name", "phone", "pincode"]);
  });
  it("needs consent before anything is saved", () => {
    const r = createLead("quote", { ...ok, consent: false });
    expect("errors" in r).toBe(true);
    expect(loadLeads()).toHaveLength(0);
  });
  it("saves a consented lead with its context, newest first", () => {
    createLead("bill", ok, { city: "Lucknow" });
    const r = createLead("quote", ok, { city: "Pune", stateCode: "MH", kw: 3.27, grade: "F", moneyAtRisk: 164824 });
    expect("lead" in r).toBe(true);
    const leads = loadLeads();
    expect(leads).toHaveLength(2);
    expect(leads[0]).toMatchObject({ source: "quote", phone: "9876543210", city: "Pune", grade: "F" });
    expect(leads[0].id).toMatch(/^CH-[0-9A-Z]{8}$/);
  });
  it("shows installers no name and no number before purchase", () => {
    const r = createLead("quote", ok, { city: "Pune", kw: 3.27, grade: "F", moneyAtRisk: 164824 });
    if (!("lead" in r)) throw new Error("expected a lead");
    const p = leadPreview(r.lead);
    const all = [p.title, ...p.facts].join(" ");
    expect(all).not.toContain("Asha");
    expect(all).not.toContain("9876543210");
    expect(all).toContain("₹1,64,824");
  });
  it("marks a lead bought and deletes it", () => {
    const r = createLead("report", ok);
    if (!("lead" in r)) throw new Error("expected a lead");
    markBought(r.lead.id);
    expect(loadLeads()[0].boughtAt).toBeTruthy();
    deleteLead(r.lead.id);
    expect(loadLeads()).toHaveLength(0);
  });
  it("survives corrupt storage", () => {
    localStorage.setItem("chhat:leads", "{not json");
    expect(loadLeads()).toEqual([]);
  });
});
