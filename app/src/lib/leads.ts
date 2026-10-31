// Leads and pricing: how Chhat is paid.
//
// Homes use Chhat free. When a home asks for installer quotes, Chhat makes a
// verified lead. Installers pay for those leads and a fee on completed
// installs; they never pay for rank or grade. Prices come from
// business/business-plan.md, so the site and the plan say the same thing.
//
// In this build a lead is stored only in the visitor's browser: no installer
// is contacted and nothing leaves the device. Payment buttons open a payment
// link when one is configured (VITE_*_PAYMENT_LINK); otherwise they run a demo.

import { safeStorage } from "./env";

export const PRICING = {
  /** Installer pays per verified, consented lead, prepaid from a wallet */
  leadFee: 1500,
  /** Share of the lead fee credited back for disputed leads, on average */
  disputeCredit: 0.05,
  /** Installer pays on commissioning, as a share of system value */
  successFee: 0.02,
  /** Installer quote builder + CRM, per month */
  proMonthly: 2999,
  /** Banks and NBFCs, share of each loan originated */
  loanFee: 0.01,
  /** States and DISCOMs, per state per year */
  analyticsYearly: 40_00_000,
  /** Typical installed home system in the business plan, ₹ (3.2 kW × ₹57,000) */
  typicalSystem: 1_82_400,
  /** Leads an installer buys per closed sale in the base case */
  leadsPerSale: 5,
} as const;

/** What an installer pays Chhat per closed sale. */
export function costPerSale(leadsPerSale: number = PRICING.leadsPerSale, systemValue: number = PRICING.typicalSystem) {
  const leads = Math.max(0, leadsPerSale) * PRICING.leadFee * (1 - PRICING.disputeCredit);
  const fee = Math.max(0, systemValue) * PRICING.successFee;
  const total = Math.round(leads + fee);
  return { leads: Math.round(leads), fee: Math.round(fee), total, share: systemValue > 0 ? total / systemValue : 0 };
}

/* -------------------------------------------------------------------------- */
/* Payment links                                                              */
/* -------------------------------------------------------------------------- */

export type Product = "lead" | "pro";

/**
 * A hosted payment page (Razorpay, Stripe or Cashfree payment link) for each
 * product, set at build time. Returns null when none is set, and the UI then
 * runs its demo checkout. Only http(s) links are accepted.
 */
export function paymentLink(product: Product, env: Record<string, string | undefined> = import.meta.env): string | null {
  const raw = (product === "lead" ? env.VITE_LEAD_PAYMENT_LINK : env.VITE_PRO_PAYMENT_LINK)?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/* Leads                                                                      */
/* -------------------------------------------------------------------------- */

export type LeadSource = "quote" | "bill" | "report";
export type ContactTime = "morning" | "afternoon" | "evening";

export interface LeadContext {
  city?: string | null;
  stateCode?: string | null;
  kw?: number | null;
  /** Quote Check grade, if the lead came from a graded quote */
  grade?: string | null;
  /** ₹ the audit found at risk */
  moneyAtRisk?: number | null;
  /** One-line summary of what the home already knows */
  summary?: string | null;
}

export interface LeadInput {
  name: string;
  phone: string;
  pincode: string;
  time: ContactTime;
  consent: boolean;
}

export interface Lead extends LeadContext {
  id: string;
  createdAt: string;
  source: LeadSource;
  name: string;
  /** Ten digits, no prefix */
  phone: string;
  pincode: string;
  time: ContactTime;
  /** Set when an installer has bought this lead in this browser */
  boughtAt?: string;
}

/** An Indian mobile number: ten digits starting 6-9, with an optional +91 or 0. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[\s\-().]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export function maskPhone(phone: string): string {
  return phone.length === 10 ? `${phone.slice(0, 2)}••••••${phone.slice(8)}` : "••••••••••";
}

export type LeadErrors = Partial<Record<keyof LeadInput, string>>;

export function validateLead(input: LeadInput): LeadErrors {
  const e: LeadErrors = {};
  if (input.name.trim().length < 2) e.name = "Enter your name.";
  if (!normalizePhone(input.phone)) e.phone = "Enter a 10-digit Indian mobile number.";
  if (!/^[1-9]\d{5}$/.test(input.pincode.trim())) e.pincode = "Enter a 6-digit PIN code.";
  if (!input.consent) e.consent = "Tick the box so installers may call you.";
  return e;
}

const KEY = "chhat:leads";
const MAX_LEADS = 50;

export function loadLeads(): Lead[] {
  const raw = safeStorage().get(KEY);
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? (v.filter((x) => x && typeof x === "object" && typeof x.id === "string") as Lead[]) : [];
  } catch {
    return [];
  }
}

function store(leads: Lead[]) {
  safeStorage().set(KEY, JSON.stringify(leads.slice(0, MAX_LEADS)));
  if (typeof window !== "undefined") window.dispatchEvent(new Event("chhat:leads"));
}

function newId(now: Date): string {
  const rand = Math.floor(Math.random() * 36 ** 4).toString(36).toUpperCase().padStart(4, "0");
  return `CH-${now.getTime().toString(36).slice(-4).toUpperCase()}${rand}`;
}

/** Validate, then save a lead in this browser. Returns the lead, or the errors. */
export function createLead(source: LeadSource, input: LeadInput, context: LeadContext = {}, now = new Date()): { lead: Lead } | { errors: LeadErrors } {
  const errors = validateLead(input);
  if (Object.keys(errors).length) return { errors };
  const lead: Lead = {
    ...context,
    id: newId(now),
    createdAt: now.toISOString(),
    source,
    name: input.name.trim().replace(/\s+/g, " ").slice(0, 60),
    phone: normalizePhone(input.phone)!,
    pincode: input.pincode.trim(),
    time: input.time,
  };
  store([lead, ...loadLeads()]);
  return { lead };
}

export function markBought(id: string, now = new Date()): void {
  store(loadLeads().map((l) => (l.id === id ? { ...l, boughtAt: now.toISOString() } : l)));
}

export function deleteLead(id: string): void {
  store(loadLeads().filter((l) => l.id !== id));
}

/** What an installer sees before buying: no name, masked number. */
export function leadPreview(l: Lead): { title: string; facts: string[] } {
  const where = [l.city, l.stateCode, l.pincode].filter(Boolean).join(" · ");
  const facts: string[] = [];
  if (l.kw) facts.push(`${l.kw.toFixed(1)} kW sized by Chhat`);
  if (l.grade) facts.push(`has a quote graded ${l.grade}`);
  if (l.moneyAtRisk) facts.push(`₹${Math.round(l.moneyAtRisk).toLocaleString("en-IN")} at risk in that quote`);
  if (l.summary) facts.push(l.summary);
  facts.push(`call in the ${l.time}`);
  return { title: where || "Location on purchase", facts };
}
