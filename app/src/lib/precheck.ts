// Chhat Pro pre-check: an installer runs the home's audit on their own quote
// before sending it. Same rules, same engine; the badge cannot be bought.

import { auditQuote, type Quote, type QuoteAudit } from "../engine/quoteAudit";
import type { Finding } from "../engine/types";

const ORDER = { critical: 0, warn: 1, info: 2, ok: 3 } as const;

export interface Precheck {
  audit: QuoteAudit;
  /** Grade A or B, fully graded, and no critical finding */
  verified: boolean;
  /** What to fix before sending, worst first (no passes) */
  fixes: Finding[];
}

export function precheckQuote(q: Quote): Precheck {
  const audit = auditQuote(q);
  const fixes = audit.findings
    .filter((f) => f.severity !== "ok")
    .sort((a, b) => ORDER[a.severity] - ORDER[b.severity] || (b.impact ?? 0) - (a.impact ?? 0));
  const verified = !audit.incomplete && (audit.grade === "A" || audit.grade === "B") && !fixes.some((f) => f.severity === "critical");
  return { audit, verified, fixes };
}
