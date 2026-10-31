// Chhat's agent tools. One definition serves both agents:
//  - the server-side Claude agent receives TOOL_SCHEMAS and calls runTool()
//  - the on-device agent routes intents to the same runTool()
// The model never computes a rupee figure itself; every number comes from here.

import { KNOWLEDGE, type KBEntry } from "../data/knowledge";
import { auditBill, EMPTY_BILL, type SolarBill } from "../engine/billAudit";
import { CITIES, climateFromCity, searchCities } from "../engine/climate";
import { loanPlan } from "../engine/finance";
import { rupees } from "../engine/format";
import { fairPriceBand } from "../engine/pricing";
import { monthlyEnergy, specificYield, type Shading } from "../engine/pv";
import { auditQuote, EMPTY_QUOTE, type Quote } from "../engine/quoteAudit";
import { buildReport } from "../engine/report";
import { stateInfo, STATES } from "../engine/states";
import { subsidyFor } from "../engine/subsidy";
import { MONTHS, type City } from "../engine/types";
import { bm25 } from "./search";

export type ToolName =
  | "get_irradiance"
  | "size_system"
  | "compute_subsidy"
  | "finance_options"
  | "audit_quote"
  | "audit_bill"
  | "search_knowledge";

export interface ToolResult {
  ok: boolean;
  /** Compact text the model reads */
  summary: string;
  /** Structured data for the UI trace */
  data?: unknown;
}

const num = { type: "number" } as const;
const nNum = { anyOf: [{ type: "number" }, { type: "null" }] } as const;
const nInt = { anyOf: [{ type: "integer" }, { type: "null" }] } as const;
const nStr = { anyOf: [{ type: "string" }, { type: "null" }] } as const;
const nBool = { anyOf: [{ type: "boolean" }, { type: "null" }] } as const;

function obj(properties: Record<string, unknown>) {
  return { type: "object", properties, required: Object.keys(properties), additionalProperties: false };
}

export const TOOL_SCHEMAS = [
  {
    name: "get_irradiance",
    description:
      "Look up 20-year NASA POWER solar climatology for an Indian city: monthly sunlight (kWh/m²/day), temperature, and the kWh a 1 kWp system makes there per year. Use when the user asks how sunny a place is or before comparing cities.",
    input_schema: obj({ city: { type: "string", description: "City name, e.g. 'Pune'" } }),
  },
  {
    name: "size_system",
    description:
      "Build a full rooftop-solar report for a home: recommended kWp and panel count, monthly generation, bill savings under net metering, central + state subsidy, fair price, payback, 25-year savings and CO₂. Use whenever the user asks whether solar is worth it, what size to install, or how much they'd save. Ask for monthly units if you don't have them; if they only give a bill amount, divide by the state tariff. Also ask how much open, shade-free roof they have, because the roof caps how many panels fit; if they don't know, run it at 800 sq ft and say that you assumed it.",
    input_schema: obj({
      city: { type: "string" },
      monthly_units: { ...num, description: "Units (kWh) on one monthly bill" },
      bill_month: { type: "integer", description: "Month the bill covers, 1-12. If the user didn't say, use the current month; don't ask for it." },
      roof_area_sqft: { ...nNum, description: "Open roof area in sq ft (whole terrace; 70% is treated as usable), null if unknown (assumes 800)" },
      shading: { type: "string", enum: ["none", "some", "heavy"] },
      tariff: { ...nNum, description: "₹ per unit from the user's bill, null to use the state default" },
      panels: { ...nInt, description: "Force a panel count (545 Wp each), null for Chhat's recommendation" },
    }),
  },
  {
    name: "compute_subsidy",
    description: "Compute PM Surya Ghar central subsidy plus any state top-up for a system size in a state.",
    input_schema: obj({ kw: num, state_code: { type: "string", description: "Two-letter state code, e.g. MH, DL, UP" } }),
  },
  {
    name: "finance_options",
    description:
      "Compare paying cash vs. a PM Surya Ghar concessional loan: upfront margin, EMI before and after the subsidy is prepaid into the loan, interest.",
    input_schema: obj({ gross_cost: num, kw: num, state_code: { type: "string" } }),
  },
  {
    name: "audit_quote",
    description:
      "Audit an installer's quotation against the fair price band, DCR / ALMM List-II subsidy rules, capacity arithmetic, inverter sizing, warranties, structure, GST and payment terms. Pass null for anything the quote doesn't state.",
    input_schema: obj({
      vendor_name: nStr,
      state_code: nStr,
      system_kw: nNum,
      total_price: nNum,
      gst_percent: nNum,
      panel_brand: nStr,
      panel_watt: nNum,
      panel_count: nInt,
      dcr: nBool,
      almm_cells: nBool,
      inverter_brand: nStr,
      inverter_kw: nNum,
      inverter_warranty_years: nNum,
      structure: { type: "string", enum: ["hdg", "zam", "aluminium", "ms-painted", "unknown"] },
      panel_product_warranty_years: nNum,
      panel_performance_years: nNum,
      system_warranty_years: nNum,
      earthing: nBool,
      lightning_arrester: nBool,
      net_meter_included: nBool,
      monitoring: nBool,
      advance_percent: nNum,
      grievance_officer: nBool,
    }),
  },
  {
    name: "audit_bill",
    description:
      "Audit a post-solar (net-metered) DISCOM bill: zero export, billing on import, net-unit arithmetic, unexplained charges, underperformance. Needs the system size and city to estimate expected generation.",
    input_schema: obj({
      city: { type: "string" },
      system_kwp: num,
      bill_month: { type: "integer", description: "1-12" },
      import_units: nNum,
      export_units: nNum,
      previous_credit: nNum,
      net_units_billed: nNum,
      energy_charges: nNum,
      other_charges: nNum,
      other_charges_label: nStr,
    }),
  },
  {
    name: "search_knowledge",
    description:
      "Search Chhat's sourced knowledge base on PM Surya Ghar rules, DCR, net metering, loans, vendors, maintenance, GST, timelines and bill errors. Use for any rules or process question before answering from memory.",
    input_schema: obj({ query: { type: "string" } }),
  },
] as const;

function findCity(name: string): City | undefined {
  const exact = CITIES.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
  return exact ?? searchCities(name, 1)[0];
}

const stateCodeOf = (code: string | null | undefined) => (code && STATES[code.toUpperCase()] ? code.toUpperCase() : "DL");

type Args = Record<string, unknown>;
const n = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
const s = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);
const b = (v: unknown): boolean | null => (typeof v === "boolean" ? v : null);
/** A finite number inside [lo, hi], else null. */
const inRange = (v: unknown, lo: number, hi: number): number | null => {
  const x = n(v);
  return x !== null && x >= lo && x <= hi ? x : null;
};
/** User text echoed in an error, never "[object Object]" or a novel. */
const echo = (v: unknown) => (typeof v === "string" ? v.slice(0, 40) : "");

export function runTool(name: ToolName | string, args: Args): ToolResult {
  try {
    switch (name) {
      case "get_irradiance": {
        const c = findCity(String(args.city ?? ""));
        if (!c) return { ok: false, summary: `No data for "${echo(args.city)}". Known cities include ${CITIES.slice(0, 12).map((x) => x.name).join(", ")}.` };
        const clim = climateFromCity(c);
        const sy = specificYield(clim);
        const ann = c.ghi.reduce((a, g) => a + g, 0) / 12;
        const best = c.ghi.indexOf(Math.max(...c.ghi));
        const worst = c.ghi.indexOf(Math.min(...c.ghi));
        return {
          ok: true,
          summary: `${c.name} (${stateInfo(c.state).name}): average ${ann.toFixed(2)} kWh/m²/day of sunlight, best in ${MONTHS[best]} (${c.ghi[best].toFixed(2)}), lowest in ${MONTHS[worst]} (${c.ghi[worst].toFixed(2)}). A 1 kWp system makes about ${Math.round(sy)} kWh a year. Source: NASA POWER 2001-2020.`,
          data: { city: c.name, state: c.state, ghi: c.ghi, t2m: c.t2m, specificYield: sy },
        };
      }
      case "size_system": {
        const c = findCity(String(args.city ?? ""));
        if (!c) return { ok: false, summary: `Unknown city "${echo(args.city)}".` };
        const units = inRange(args.monthly_units, 1, 100000);
        if (!units) return { ok: false, summary: "Need monthly units (kWh) from a bill, between 1 and 1,00,000." };
        const month = Math.min(12, Math.max(1, Math.round(n(args.bill_month) ?? new Date().getMonth() + 1))) - 1;
        const shading = (["none", "some", "heavy"].includes(String(args.shading)) ? args.shading : "none") as Shading;
        const givenArea = inRange(args.roof_area_sqft, 50, 20000);
        const roofAreaSqft = givenArea ?? 800;
        const r = buildReport({
          climate: climateFromCity(c),
          units,
          billMonth: month,
          periodMonths: 1,
          tariff: inRange(args.tariff, 1, 30) ?? undefined,
          roofAreaSqft,
          shading,
          overridePanels: inRange(args.panels, 2, 200) !== null ? Math.round(n(args.panels)!) : undefined,
        });
        return {
          ok: true,
          summary: [
            `${c.name}: recommend ${r.kwp.toFixed(2)} kWp (${r.panels} × 545 W DCR panels), limited by ${r.sizing.limitedBy}.`,
            `Generation ${Math.round(r.annualGeneration)} units/yr vs. consumption ${Math.round(r.annualConsumption)} units/yr (${Math.round(r.net.coverage * 100)}% covered).`,
            `Bill savings ${rupees(r.net.savings)}/yr at ₹${r.tariff.toFixed(2)}/unit.`,
            `Fair price ${rupees(r.price.low)}–${rupees(r.price.high)}; subsidy ${rupees(r.subsidy.total)} (central ${rupees(r.subsidy.central)}${r.subsidy.state ? `, state ${rupees(r.subsidy.state)}` : ""}); net cost ${rupees(r.netCost)}.`,
            `Payback ${r.payback ? r.payback.toFixed(1) + " years" : "over 25 years"}; 25-year net savings ${rupees(r.lifetimeSavings)}.`,
            `Loan option: ${rupees(r.loan.upfront)} upfront, EMI ${rupees(r.loan.emiAfter)}/month after subsidy prepayment vs. average saving ${rupees(r.monthlySavingAvg)}/month.`,
            `CO₂ avoided ${r.co2TonnesYear.toFixed(1)} t/yr.`,
            givenArea
              ? `Roof: ${Math.round(givenArea)} sq ft fits up to ${r.sizing.roofMaxPanels} panels.`
              : `Roof size not given: assumed 800 sq ft (fits up to ${r.sizing.roofMaxPanels} panels). Ask the user for their open roof area to confirm.`,
          ].join(" "),
          data: {
            city: c.name,
            kwp: r.kwp,
            panels: r.panels,
            annualGeneration: r.annualGeneration,
            savings: r.net.savings,
            subsidy: r.subsidy.total,
            netCost: r.netCost,
            payback: r.payback,
            emi: r.loan.emiAfter,
            roofAreaSqft,
            roofAssumed: !givenArea,
            roofMaxPanels: r.sizing.roofMaxPanels,
          },
        };
      }
      case "compute_subsidy": {
        const kw = inRange(args.kw, 0, 1000) ?? 0;
        const st = stateInfo(stateCodeOf(s(args.state_code)));
        const sb = subsidyFor(kw, st);
        return {
          ok: true,
          summary: `${kw} kW in ${st.name}: central ${rupees(sb.central)} (${sb.centralRule})${sb.state ? ` + state ${rupees(sb.state)} (${sb.stateRule})` : ", no state top-up on record"} = ${rupees(sb.total)}.`,
          data: sb,
        };
      }
      case "finance_options": {
        const kw = inRange(args.kw, 0.5, 1000) ?? 3;
        const gross = inRange(args.gross_cost, 1, 1e8) ?? fairPriceBand(kw).mid;
        const st = stateInfo(stateCodeOf(s(args.state_code)));
        const sb = subsidyFor(kw, st);
        const l = loanPlan(gross, sb.total, kw);
        return {
          ok: true,
          summary: `Cash: pay ${rupees(gross)}, get ${rupees(sb.total)} back as subsidy, net ${rupees(gross - sb.total)}. Loan: ${rupees(l.upfront)} margin upfront, ${rupees(l.principal)} borrowed at ${(l.rate * 100).toFixed(2)}%${l.concessional ? " (PM Surya Ghar concessional)" : ""} for ${l.tenureYears} years; EMI ${rupees(l.emiBefore)} until the subsidy arrives, then ${rupees(l.emiAfter)} after prepaying it. Approx. interest ${rupees(l.totalInterest)}.`,
          data: l,
        };
      }
      case "audit_quote": {
        const q: Quote = {
          ...EMPTY_QUOTE,
          vendorName: s(args.vendor_name),
          stateCode: s(args.state_code),
          systemKw: n(args.system_kw),
          totalPrice: n(args.total_price),
          gstPercent: n(args.gst_percent),
          panelBrand: s(args.panel_brand),
          panelWatt: n(args.panel_watt),
          panelCount: n(args.panel_count),
          dcr: b(args.dcr),
          almmCells: b(args.almm_cells),
          inverterBrand: s(args.inverter_brand),
          inverterKw: n(args.inverter_kw),
          inverterWarrantyYears: n(args.inverter_warranty_years),
          structure: (["hdg", "zam", "aluminium", "ms-painted"].includes(String(args.structure)) ? args.structure : "unknown") as Quote["structure"],
          panelProductWarrantyYears: n(args.panel_product_warranty_years),
          panelPerformanceYears: n(args.panel_performance_years),
          systemWarrantyYears: n(args.system_warranty_years),
          earthing: b(args.earthing),
          lightningArrester: b(args.lightning_arrester),
          netMeterIncluded: b(args.net_meter_included),
          monitoring: b(args.monitoring),
          advancePercent: n(args.advance_percent),
          grievanceOfficer: b(args.grievance_officer),
        };
        const a = auditQuote(q);
        return {
          ok: true,
          summary: `Grade ${a.grade} (${a.score}/100): ${a.verdict} Money at risk ${rupees(a.moneyAtRisk)}. Findings: ${a.findings
            .filter((f) => f.severity !== "ok")
            .map((f) => `[${f.severity}] ${f.title}`)
            .join("; ")}.`,
          data: a,
        };
      }
      case "audit_bill": {
        const c = findCity(String(args.city ?? "")) ?? CITIES[0];
        const kwp = inRange(args.system_kwp, 0.5, 1000) ?? 3;
        const month = Math.min(12, Math.max(1, Math.round(n(args.bill_month) ?? 1))) - 1;
        const gen = monthlyEnergy(climateFromCity(c), kwp)[month];
        const bill: SolarBill = {
          ...EMPTY_BILL,
          billMonth: month,
          importUnits: n(args.import_units),
          exportUnits: n(args.export_units),
          previousCredit: n(args.previous_credit),
          netUnitsBilled: n(args.net_units_billed),
          energyCharges: n(args.energy_charges),
          otherCharges: n(args.other_charges),
          otherChargesLabel: s(args.other_charges_label),
        };
        const a = auditBill(bill, { systemKwp: kwp, expectedGeneration: gen, tariff: stateInfo(c.state).tariff });
        return {
          ok: true,
          summary: `${a.verdict} Expected generation ~${Math.round(gen)} units in ${MONTHS[month]}. Possible overbilling ${rupees(a.overbilled)}. Findings: ${a.findings.map((f) => `[${f.severity}] ${f.title}`).join("; ")}.`,
          data: a,
        };
      }
      case "search_knowledge": {
        const hits = searchKnowledge(String(args.query ?? ""), 3);
        if (!hits.length) return { ok: true, summary: "No matching entry." };
        return {
          ok: true,
          summary: hits.map((h) => `## ${h.title}\n${h.en}${h.source ? `\nSource: ${h.source.label} (${h.source.url})` : ""}`).join("\n\n"),
          data: hits.map((h) => ({ id: h.id, title: h.title, source: h.source })),
        };
      }
      default:
        return { ok: false, summary: `Unknown tool ${name}` };
    }
  } catch (err) {
    return { ok: false, summary: `Tool error: ${(err as Error).message}` };
  }
}

const index = bm25(KNOWLEDGE.map((k) => `${k.title} ${k.keywords} ${k.keywords} ${k.en}`));

export function searchKnowledge(query: string, k = 3): KBEntry[] {
  return index(query, k).map((i) => KNOWLEDGE[i]);
}
