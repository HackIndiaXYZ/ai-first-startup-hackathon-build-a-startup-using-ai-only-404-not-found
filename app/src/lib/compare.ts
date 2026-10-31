// Compare up to three installer quotes with the same audit Quote Check runs.
//
// Every number here comes from auditQuote(): the comparison only ranks and
// explains. Quotes missing a size or a price are shown but never picked.

import { rupees } from "../engine/format";
import { auditQuote, EMPTY_QUOTE, type Quote, type QuoteAudit } from "../engine/quoteAudit";
import { safeStorage } from "./env";

export const SLOTS = ["A", "B", "C"] as const;

export interface Compared {
  slot: number;
  /** Vendor name, or "Quote A" */
  name: string;
  quote: Quote;
  audit: QuoteAudit;
  kwp: number | null;
  criticals: number;
}

export interface Comparison {
  items: Compared[];
  /** The quote to sign, or null when none can be graded */
  best: Compared | null;
  /** True when even the best one is graded D or F */
  noneSafe: boolean;
  /** Why the best one wins, in plain words */
  reasons: string[];
  /** One line per other quote: the main reason it lost */
  whyNot: { name: string; reason: string }[];
  /** A price ask for the winner, when it is above the fair band */
  ask: string | null;
}

const ORDER = { critical: 0, warn: 1, info: 2, ok: 3 } as const;

/** The most serious problem in an audit, for a one-line "why not". */
function topProblem(a: QuoteAudit): string | null {
  const f = [...a.findings].filter((x) => x.severity !== "ok").sort((x, y) => ORDER[x.severity] - ORDER[y.severity] || (y.impact ?? 0) - (x.impact ?? 0))[0];
  return f ? f.title : null;
}

export function compareQuotes(slots: (Quote | null)[]): Comparison {
  const items: Compared[] = [];
  slots.forEach((q, slot) => {
    if (!q) return;
    const audit = auditQuote(q);
    items.push({
      slot,
      name: q.vendorName?.trim() || `Quote ${SLOTS[slot] ?? slot + 1}`,
      quote: q,
      audit,
      kwp: audit.actualKwp ?? q.systemKw,
      criticals: audit.findings.filter((x) => x.severity === "critical").length,
    });
  });

  // Rank graded quotes: higher score first; within 5 points, cheaper per kW.
  const ranked = items
    .filter((c) => !c.audit.incomplete)
    .sort((x, y) => {
      const d = y.audit.score - x.audit.score;
      if (Math.abs(d) > 5) return d;
      return (x.audit.pricePerKw ?? Infinity) - (y.audit.pricePerKw ?? Infinity) || d;
    });
  const best = ranked[0] ?? null;
  const noneSafe = best ? best.audit.grade === "D" || best.audit.grade === "F" : false;

  const reasons: string[] = [];
  const whyNot: { name: string; reason: string }[] = [];
  let ask: string | null = null;

  if (best) {
    const next = ranked[1];
    if (next && Math.abs(best.audit.score - next.audit.score) <= 5 && best.audit.pricePerKw && next.audit.pricePerKw) {
      reasons.push(`As safe as ${next.name} (${best.audit.score} vs ${next.audit.score} out of 100) and cheaper at ${rupees(best.audit.pricePerKw)}/kW.`);
    } else {
      reasons.push(`Highest audit score: ${best.audit.score}/100, grade ${best.audit.grade}.`);
    }
    reasons.push(best.criticals === 0 ? "No critical problems." : `${best.criticals} critical problem${best.criticals > 1 ? "s" : ""} to fix before you sign.`);
    if (best.audit.overcharge > 0) reasons.push(`${rupees(best.audit.overcharge)} above the fair price band.`);
    else if (best.audit.band) reasons.push("Price is inside the fair band for its size.");
    const lose = ranked.filter((c) => c !== best && c.audit.subsidyAtRisk > 0);
    if (best.audit.subsidyAtRisk === 0 && lose.length) reasons.push(`Keeps the central subsidy; ${lose.map((c) => c.name).join(" and ")} could lose it.`);
    if (best.audit.overcharge > 0 && best.audit.band) ask = `Ask ${best.name} to match ${rupees(best.audit.band.mid)}, the middle of the fair band for ${best.kwp?.toFixed(2)} kWp.`;
  }

  for (const c of items) {
    if (c === best) continue;
    if (c.audit.incomplete) whyNot.push({ name: c.name, reason: "Missing the system size or total price, so it can't be graded." });
    else whyNot.push({ name: c.name, reason: topProblem(c.audit) ?? `Lower score (${c.audit.score}/100) at a higher price per kW.` });
  }

  return { items, best, noneSafe, reasons, whyNot, ask };
}

/* -------------------------------------------------------------------------- */
/* Saved in this browser, so quotes that arrive on different days line up    */
/* -------------------------------------------------------------------------- */

const KEY = "chhat:compare";

export function loadSlots(): (Quote | null)[] {
  const raw = safeStorage().get(KEY);
  const empty = SLOTS.map(() => null);
  if (!raw) return empty;
  try {
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return empty;
    return SLOTS.map((_, i) => (v[i] && typeof v[i] === "object" ? { ...EMPTY_QUOTE, ...(v[i] as Partial<Quote>) } : null));
  } catch {
    return empty;
  }
}

export function saveSlots(slots: (Quote | null)[]): void {
  safeStorage().set(KEY, JSON.stringify(slots.slice(0, SLOTS.length)));
}
