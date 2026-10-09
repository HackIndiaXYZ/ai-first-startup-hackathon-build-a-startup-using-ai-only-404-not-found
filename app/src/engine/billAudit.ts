import { rupees } from "./format";
import type { Finding } from "./types";

/** Fields Chhat reads from a post-solar (net-metered) DISCOM bill. */
export interface SolarBill {
  consumerName: string | null;
  consumerNumber: string | null;
  discom: string | null;
  billMonth: number | null;
  importUnits: number | null;
  exportUnits: number | null;
  /** Credit units brought forward from the previous bill */
  previousCredit: number | null;
  netUnitsBilled: number | null;
  energyCharges: number | null;
  fixedCharges: number | null;
  otherCharges: number | null;
  otherChargesLabel: string | null;
  total: number | null;
}

export const EMPTY_BILL: SolarBill = {
  consumerName: null,
  consumerNumber: null,
  discom: null,
  billMonth: null,
  importUnits: null,
  exportUnits: null,
  previousCredit: null,
  netUnitsBilled: null,
  energyCharges: null,
  fixedCharges: null,
  otherCharges: null,
  otherChargesLabel: null,
  total: null,
};

export interface BillContext {
  systemKwp: number;
  /** Expected generation in the bill month from Chhat's model, kWh */
  expectedGeneration: number;
  /** Fallback tariff if the bill's own rate can't be derived */
  tariff: number;
}

export interface BillAudit {
  findings: Finding[];
  overbilled: number;
  expectedNetUnits: number | null;
  effectiveRate: number;
  verdict: string;
  /** Import or export reading missing: the meter arithmetic could not run. */
  incomplete: boolean;
}

const SRC = {
  mnre: { label: "MNRE flags incorrect rooftop-solar billing by DISCOMs (Jul 2026)", url: "https://www.energetica-india.net/news/mnre-flags-incorrect-rooftop-solar-billing-by-discoms-refers-complaints-for-resolution" },
  forum: { label: "Consumer forum strikes unbacked 'Other Charges' on a solar bill (Nagpur, 2026)", url: "https://www.downtoearth.org.in/renewable-energy/msedcl-cannot-levy-charges-without-legal-backing-rules-consumer-forum-in-rooftop-solar-billing-case" },
  jk: { label: "Net metering not activated after install (J&K)", url: "https://kashmirdespatch.com/loopholes-in-muft-bijli-scheme-leave-jk-consumers-powerless/" },
  vendor: { label: "REC vendor framework: 5-yr system warranty", url: "https://www.mercomindia.com/rec-issues-guidance-framework-for-vendor-operations-under-pm-surya-ghar" },
};

export function auditBill(b: SolarBill, ctx: BillContext): BillAudit {
  const f: Finding[] = [];
  const rate = b.energyCharges && b.netUnitsBilled && b.netUnitsBilled > 0 ? b.energyCharges / b.netUnitsBilled : ctx.tariff;
  let overbilled = 0;
  let expectedNet: number | null = null;

  if (b.importUnits !== null && b.exportUnits !== null) {
    expectedNet = Math.max(0, b.importUnits - b.exportUnits - (b.previousCredit ?? 0));
  }

  // 1. Net meter not reading exports
  if (b.exportUnits === 0 && ctx.systemKwp > 0) {
    const lost = Math.round(ctx.expectedGeneration * 0.45 * ctx.tariff);
    overbilled += lost;
    f.push({
      id: "no-export",
      severity: "critical",
      title: "Your bill shows zero export",
      detail: `A ${ctx.systemKwp.toFixed(2)} kWp system should make about ${Math.round(ctx.expectedGeneration)} units this month, and most homes export 30 to 60% of that. Zero export usually means the net meter isn't installed, isn't configured, or wasn't read.`,
      impact: lost,
      source: SRC.jk,
    });
  }

  // 2. Billed units don't match the meter arithmetic
  if (expectedNet !== null && b.netUnitsBilled !== null) {
    const excess = b.netUnitsBilled - expectedNet;
    if (b.exportUnits && b.exportUnits > 0 && b.importUnits !== null && Math.abs(b.netUnitsBilled - b.importUnits) <= 2 && excess > 2) {
      const amt = Math.round(excess * rate);
      overbilled += amt;
      f.push({
        id: "billed-on-import",
        severity: "critical",
        title: "You were billed on import, ignoring your export",
        detail: `Import ${b.importUnits} − export ${b.exportUnits}${b.previousCredit ? ` − carried credit ${b.previousCredit}` : ""} = ${expectedNet} units. The bill charges ${b.netUnitsBilled}. That's ${excess} units (${rupees(amt)}) too many.`,
        impact: amt,
        source: SRC.mnre,
      });
    } else if (excess > 2) {
      const amt = Math.round(excess * rate);
      overbilled += amt;
      f.push({
        id: "net-mismatch",
        severity: "critical",
        title: `${excess} units billed above the meter arithmetic`,
        detail: `Import ${b.importUnits} − export ${b.exportUnits}${b.previousCredit ? ` − carried credit ${b.previousCredit}` : ""} = ${expectedNet} units, but the bill charges ${b.netUnitsBilled}.`,
        impact: amt,
        source: SRC.mnre,
      });
    } else {
      f.push({ id: "net-ok", severity: "ok", title: "Net units add up", detail: `Import − export − credit = ${expectedNet} units, matching the bill.` });
    }
  }

  // 3. Credit not carried forward
  if (b.importUnits !== null && b.exportUnits !== null && b.exportUnits + (b.previousCredit ?? 0) > b.importUnits && b.netUnitsBilled === 0) {
    f.push({
      id: "credit",
      severity: "info",
      title: `${b.exportUnits + (b.previousCredit ?? 0) - b.importUnits} units should carry forward as credit`,
      detail: "Check that the next bill shows these as brought-forward credit. Missing credits are a common error.",
      source: SRC.mnre,
    });
  }

  // 4. Unexplained charges
  if (b.otherCharges && b.otherCharges > 0) {
    const label = (b.otherChargesLabel ?? "").toLowerCase();
    const known = /(duty|tax|fuel|fppca|fpppa|fac|surcharge|meter rent|cess|tod)/.test(label);
    f.push({
      id: "other",
      severity: known ? "info" : "warn",
      title: known ? `${b.otherChargesLabel}: ${rupees(b.otherCharges)}` : `Unexplained "${b.otherChargesLabel || "other"}" charge of ${rupees(b.otherCharges)}`,
      detail: known
        ? "A regular regulatory line item. Check the rate against your state's tariff order."
        : "Ask the DISCOM for the regulation or tariff order that allows this charge. A Nagpur consumer forum cancelled a similar 'Other Charges' line on a solar bill in 2026 because the utility couldn't produce one.",
      impact: known ? undefined : b.otherCharges,
      source: known ? undefined : SRC.forum,
    });
    if (!known) overbilled += b.otherCharges;
  }

  // 5. Low export may mean the system is underperforming
  if (b.exportUnits !== null && b.exportUnits > 0 && b.exportUnits < ctx.expectedGeneration * 0.15) {
    f.push({
      id: "underperform",
      severity: "warn",
      title: "Export is far below what your system should make",
      detail: `Only ${b.exportUnits} units exported against ~${Math.round(ctx.expectedGeneration)} expected generation. If your daytime use is low, check the inverter app for faults or dirty panels. Your vendor owes 5 years of free maintenance.`,
      source: SRC.vendor,
    });
  }

  // 6. Energy charge rate sanity
  if (b.energyCharges && b.netUnitsBilled && b.netUnitsBilled > 0) {
    const r = b.energyCharges / b.netUnitsBilled;
    if (r > ctx.tariff * 1.6) {
      f.push({
        id: "rate",
        severity: "warn",
        title: `Energy rate works out to ₹${r.toFixed(2)}/unit`,
        detail: `That's well above the typical ₹${ctx.tariff.toFixed(2)} for your state. Slab misapplication after solar is a known error. Compare with your tariff order.`,
      });
    }
  }

  const incomplete = b.importUnits === null || b.exportUnits === null;
  if (incomplete) {
    f.push({
      id: "readings",
      severity: "info",
      title: "Import or export reading missing",
      detail: "A net-metered bill lists both: units you took from the grid (import) and units your roof sent back (export). Add them from the bill's meter-reading table to check the arithmetic.",
    });
  }

  const order = { critical: 0, warn: 1, info: 2, ok: 3 } as const;
  f.sort((a, b2) => order[a.severity] - order[b2.severity]);
  const crit = f.some((x) => x.severity === "critical");
  const warn = f.some((x) => x.severity === "warn");
  return {
    findings: f,
    overbilled: Math.round(overbilled),
    expectedNetUnits: expectedNet,
    effectiveRate: rate,
    verdict: crit
      ? "This bill looks wrong. File a correction."
      : warn
        ? "Mostly right, with questions to ask."
        : incomplete
          ? "Add the meter readings to check this bill."
          : "This bill checks out.",
    incomplete,
  };
}

export function complaintLetter(b: SolarBill, a: BillAudit, ctx: BillContext): string {
  const issues = a.findings.filter((x) => x.severity === "critical" || x.severity === "warn");
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return `To,
The Assistant Engineer / Sub-Divisional Officer (Commercial)
${b.discom || "[DISCOM name]"}, [Sub-division]

Date: ${today}

Subject: Request to correct net-metering bill, consumer no. ${b.consumerNumber || "[consumer number]"}

Sir/Madam,

I have a ${ctx.systemKwp.toFixed(2)} kWp grid-connected rooftop solar system installed under PM Surya Ghar: Muft Bijli Yojana at my premises. My latest bill contains the following errors:

${issues.map((x, i) => `${i + 1}. ${x.title}. ${x.detail}${x.impact ? ` Amount in question: ${rupees(x.impact)}.` : ""}`).join("\n")}

I request you to:
(a) verify the import and export meter readings,
(b) issue a revised bill under the net-metering regulations of the State Electricity Regulatory Commission,
(c) adjust ${a.overbilled > 0 ? rupees(a.overbilled) : "the excess amount"} against my next bill, and
(d) confirm in writing the regulatory basis for any additional charges.

If this is not resolved within 30 days, I will approach the Consumer Grievance Redressal Forum and register a grievance on the PM Surya Ghar national portal.

Yours faithfully,
${b.consumerName || "[Your name]"}
[Address]
[Phone]

Enclosures: copy of bill, net-meter installation certificate, commissioning report

(Prepared with Chhat. Check every figure against your bill before sending.)`;
}
