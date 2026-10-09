import { rupees } from "./format";
import { fairPriceBand, type PriceBand } from "./pricing";
import { stateInfo } from "./states";
import { centralSubsidy } from "./subsidy";
import type { Finding } from "./types";

export type StructureType = "hdg" | "zam" | "aluminium" | "ms-painted" | "unknown";

/** Everything Chhat reads out of a vendor quotation. Unknown fields stay null. */
export interface Quote {
  vendorName: string | null;
  stateCode: string | null;
  systemKw: number | null;
  totalPrice: number | null;
  gstPercent: number | null;
  panelBrand: string | null;
  panelWatt: number | null;
  panelCount: number | null;
  dcr: boolean | null;
  almmCells: boolean | null;
  inverterBrand: string | null;
  inverterKw: number | null;
  inverterWarrantyYears: number | null;
  structure: StructureType;
  panelProductWarrantyYears: number | null;
  panelPerformanceYears: number | null;
  systemWarrantyYears: number | null;
  earthing: boolean | null;
  lightningArrester: boolean | null;
  netMeterIncluded: boolean | null;
  monitoring: boolean | null;
  advancePercent: number | null;
  grievanceOfficer: boolean | null;
}

export const EMPTY_QUOTE: Quote = {
  vendorName: null,
  stateCode: null,
  systemKw: null,
  totalPrice: null,
  gstPercent: null,
  panelBrand: null,
  panelWatt: null,
  panelCount: null,
  dcr: null,
  almmCells: null,
  inverterBrand: null,
  inverterKw: null,
  inverterWarrantyYears: null,
  structure: "unknown",
  panelProductWarrantyYears: null,
  panelPerformanceYears: null,
  systemWarrantyYears: null,
  earthing: null,
  lightningArrester: null,
  netMeterIncluded: null,
  monitoring: null,
  advancePercent: null,
  grievanceOfficer: null,
};

export const EFFECTIVE_GST = 8.9;

const SRC = {
  dcr: { label: "MNRE: no relaxation of DCR for PM Surya Ghar; ALMM List-II cells from 1 Jun 2026", url: "https://taiyangnews.info/markets/mnre-clarifies-almm-list-ii-exemption-pm-surya-ghar-users" },
  module: { label: "MNRE module guidelines: ≥500 Wp, ≥10-yr product warranty", url: "https://indianinfrastructure.com/?p=185267" },
  vendor: { label: "REC vendor framework: 5-yr system warranty, helpline, de-registration", url: "https://www.mercomindia.com/rec-issues-guidance-framework-for-vendor-operations-under-pm-surya-ghar" },
  om: { label: "Delhi solar portal: 5-yr all-inclusive O&M by vendor", url: "https://solar.delhi.gov.in/page/operation-and-maintenance-procedure" },
  structure: { label: "MNRE MMS amendment, 19 May 2026 (IS 2062, IS 4759, ZAM approved)", url: "https://solarquarter.com/2026/05/25/mnre-approves-zam-alloy-for-rooftop-solar-structures-under-pm-surya-ghar-scheme/" },
  gst: { label: "GST on solar systems cut to 5% from 22 Sep 2025; 70:30 rule ≈ 8.9%", url: "https://www.eqmagpro.com/gst-on-renewable-energy-devices-rationalised-to-5-to-accelerate-indias-clean-energy-transition-eq/" },
  portal: { label: "PM Surya Ghar national portal: registered vendors", url: "https://www.pmsuryaghar.gov.in/" },
  price: { label: "Chhat fair-price band (installer price lists, Oct 2026)", url: "https://www.voltflow.net/blog/solar-panel-cost-india-2026" },
};

export interface QuoteAudit {
  findings: Finding[];
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  actualKwp: number | null;
  band: PriceBand | null;
  pricePerKw: number | null;
  overcharge: number;
  moneyAtRisk: number;
  subsidyAtRisk: number;
  verdict: string;
  /** Size or price missing: the price check could not run. */
  incomplete: boolean;
}

export function auditQuote(q: Quote): QuoteAudit {
  const f: Finding[] = [];
  const state = stateInfo(q.stateCode ?? "DL");
  const actualKwp = q.panelWatt && q.panelCount ? (q.panelWatt * q.panelCount) / 1000 : null;
  const kwp = actualKwp ?? q.systemKw;
  const subsidy = kwp ? centralSubsidy(kwp, state.specialCategory) : 78000;

  // 1. Capacity: are you getting what you pay for?
  if (actualKwp && q.systemKw && actualKwp < q.systemKw * 0.97) {
    const short = q.systemKw - actualKwp;
    const impact = q.totalPrice ? Math.round((q.totalPrice / q.systemKw) * short) : undefined;
    f.push({
      id: "capacity",
      severity: "critical",
      title: `Quoted as ${q.systemKw} kW, but the panels add up to ${actualKwp.toFixed(2)} kWp`,
      detail: `${q.panelCount} × ${q.panelWatt} W = ${actualKwp.toFixed(2)} kWp. You would pay for ${short.toFixed(2)} kW that isn't on your roof.`,
      impact,
    });
  } else if (actualKwp && q.systemKw) {
    f.push({ id: "capacity", severity: "ok", title: "Panel count matches the quoted size", detail: `${q.panelCount} × ${q.panelWatt} W = ${actualKwp.toFixed(2)} kWp.` });
  }

  // 2. Price against the fair band
  let band: PriceBand | null = null;
  let pricePerKw: number | null = null;
  let overcharge = 0;
  if (q.totalPrice && kwp) {
    band = fairPriceBand(kwp);
    pricePerKw = q.totalPrice / kwp;
    if (q.totalPrice > band.high) {
      overcharge = q.totalPrice - band.high;
      f.push({
        id: "price",
        severity: q.totalPrice > band.high * 1.12 ? "critical" : "warn",
        title: `${rupees(overcharge)} above the fair range`,
        detail: `A ${kwp.toFixed(2)} kWp system with DCR panels should cost ${rupees(band.low)} to ${rupees(band.high)} installed. This quote is ${rupees(q.totalPrice)} (${rupees(pricePerKw)}/kW).`,
        impact: overcharge,
        source: SRC.price,
      });
    } else if (q.totalPrice < band.low * 0.85) {
      f.push({
        id: "price",
        severity: "warn",
        title: "Unusually cheap for DCR panels",
        detail: `${rupees(q.totalPrice)} is well under the fair range (${rupees(band.low)} to ${rupees(band.high)}). Cheap quotes often swap in non-DCR panels or a thin structure. Ask for brand and DCR certificate in writing.`,
        source: SRC.price,
      });
    } else {
      f.push({
        id: "price",
        severity: "ok",
        title: "Price sits inside the fair range",
        detail: `${rupees(q.totalPrice)} for ${kwp.toFixed(2)} kWp (${rupees(pricePerKw)}/kW). Fair range: ${rupees(band.low)} to ${rupees(band.high)}.`,
        source: SRC.price,
      });
    }
  } else if (q.totalPrice) {
    f.push({
      id: "size",
      severity: "warn",
      title: "The quote doesn't say how big the system is",
      detail: "Without the kW size, or the panel count and wattage, nobody can tell whether the price is fair, and the subsidy is paid per kW. Ask for all three in writing.",
      source: SRC.price,
    });
  } else if (kwp) {
    f.push({
      id: "price",
      severity: "warn",
      title: "No total price found",
      detail: "Ask for one all-inclusive price with GST, net meter and DISCOM fees, so you can compare quotes like for like.",
      source: SRC.price,
    });
  }

  // 3. DCR and ALMM List-II cells: the subsidy gate
  let subsidyAtRisk = 0;
  if (q.dcr === false) {
    subsidyAtRisk = subsidy;
    f.push({
      id: "dcr",
      severity: "critical",
      title: `Non-DCR panels: you lose the ${rupees(subsidy)} subsidy`,
      detail: "PM Surya Ghar pays subsidy only for Domestic Content Requirement (DCR) panels. MNRE did not relax this rule.",
      impact: subsidy,
      source: SRC.dcr,
    });
  } else if (q.dcr === null) {
    f.push({
      id: "dcr",
      severity: "warn",
      title: "DCR status not stated",
      detail: `Ask for the DCR certificate with the module serial numbers before you pay. Without DCR panels the ${rupees(subsidy)} subsidy is rejected at inspection.`,
      source: SRC.dcr,
    });
  } else if (q.almmCells === false) {
    subsidyAtRisk = subsidy;
    f.push({
      id: "almm",
      severity: "critical",
      title: "Cells not from ALMM List-II makers",
      detail: "Systems commissioned after 1 June 2026 need modules and cells from ALMM-listed domestic manufacturers to qualify.",
      impact: subsidy,
      source: SRC.dcr,
    });
  } else if (q.almmCells === null) {
    f.push({
      id: "almm",
      severity: "info",
      title: "Confirm the cell maker is on ALMM List-II",
      detail: "Since 1 June 2026 the cells inside a DCR panel must also come from listed domestic makers. Ask the vendor to name the cell manufacturer.",
      source: SRC.dcr,
    });
  } else {
    f.push({ id: "dcr", severity: "ok", title: "DCR panels with ALMM-listed cells", detail: "Eligible for the central subsidy.", source: SRC.dcr });
  }

  // 4. Module specs
  if (q.panelWatt && q.panelWatt < 500) {
    f.push({ id: "watt", severity: "warn", title: `${q.panelWatt} W modules are below the scheme minimum`, detail: "MNRE guidelines for PM Surya Ghar call for modules of at least 500 Wp.", source: SRC.module });
  }
  if (q.panelProductWarrantyYears !== null && q.panelProductWarrantyYears < 10) {
    f.push({ id: "pwarranty", severity: "warn", title: `${q.panelProductWarrantyYears}-year panel product warranty`, detail: "The scheme expects at least 10 years against manufacturing defects.", source: SRC.module });
  }
  if (q.panelPerformanceYears !== null && q.panelPerformanceYears < 25) {
    f.push({ id: "perf", severity: "warn", title: `${q.panelPerformanceYears}-year performance warranty`, detail: "Standard is 25 years (typically ≥80% of rated output at year 25)." });
  }

  // 5. Inverter sizing
  if (kwp && q.inverterKw) {
    const ratio = kwp / q.inverterKw;
    if (ratio > 1.35) {
      f.push({ id: "inverter", severity: "warn", title: `Inverter undersized (DC:AC ${ratio.toFixed(2)})`, detail: `${kwp.toFixed(2)} kWp of panels on a ${q.inverterKw} kW inverter clips midday output. Aim for 0.9 to 1.3.` });
    } else if (ratio < 0.85) {
      f.push({ id: "inverter", severity: "info", title: `Inverter oversized (DC:AC ${ratio.toFixed(2)})`, detail: "Works, but you pay for inverter capacity you won't use unless you plan to add panels." });
    } else {
      f.push({ id: "inverter", severity: "ok", title: "Inverter matched to the array", detail: `DC:AC ratio ${ratio.toFixed(2)}.` });
    }
  }
  if (q.inverterWarrantyYears !== null && q.inverterWarrantyYears < 5) {
    f.push({ id: "iwarranty", severity: "warn", title: `${q.inverterWarrantyYears}-year inverter warranty`, detail: "Good string inverters ship with 5 to 10 years. Ask for at least 5." });
  }

  // 6. Vendor obligations under the scheme
  if (q.systemWarrantyYears !== null && q.systemWarrantyYears < 5) {
    f.push({
      id: "system",
      severity: "critical",
      title: `Only ${q.systemWarrantyYears} year(s) of system warranty and O&M`,
      detail: "Registered vendors must give a 5-year warranty on the whole system and 5 years of all-inclusive maintenance, including cleaning and fault repair.",
      source: SRC.vendor,
    });
  } else if (q.systemWarrantyYears === null) {
    f.push({ id: "system", severity: "warn", title: "No system warranty or O&M term stated", detail: "Get the 5-year comprehensive warranty and maintenance written into the contract.", source: SRC.om });
  }

  // 7. Structure
  if (q.structure === "ms-painted") {
    f.push({ id: "structure", severity: "warn", title: "Painted mild-steel structure", detail: "Paint flakes and the frame rusts in 3 to 5 monsoons. MNRE's spec calls for hot-dip galvanized steel (IS 4759), ZAM, or aluminium.", source: SRC.structure });
  } else if (q.structure === "unknown") {
    f.push({ id: "structure", severity: "info", title: "Structure material not stated", detail: "Ask for hot-dip galvanized (IS 4759) or ZAM steel. 80-micron zinc coating is a common benchmark for inland cities.", source: SRC.structure });
  }

  // 8. Safety
  if (q.earthing === false || q.lightningArrester === false) {
    f.push({ id: "safety", severity: "warn", title: "Earthing or lightning arrester missing", detail: "Both are standard safety items. Don't let them become a separate bill after installation." });
  }

  // 9. Hidden extras
  if (q.netMeterIncluded === false) {
    f.push({ id: "netmeter", severity: "info", title: "Net-meter and DISCOM fees are extra", detail: "Budget ₹1,000 to ₹5,000 depending on your DISCOM, or ask the vendor to include it." });
  }
  if (q.monitoring === false) {
    f.push({ id: "monitoring", severity: "info", title: "No online monitoring", detail: "A Wi-Fi inverter app lets you catch a fault the same day instead of at the next bill." });
  }

  // 10. Payment terms
  if (q.advancePercent !== null && q.advancePercent > 30) {
    f.push({ id: "advance", severity: "warn", title: `${q.advancePercent}% advance`, detail: "Pay in milestones: booking, material delivery, commissioning. Keep at least 30% until net metering is live." });
  }

  // 11. GST
  if (q.gstPercent !== null && q.totalPrice && q.gstPercent >= 12) {
    const preTax = q.totalPrice / (1 + q.gstPercent / 100);
    const extra = Math.round(q.totalPrice - preTax * (1 + EFFECTIVE_GST / 100));
    f.push({
      id: "gst",
      severity: "warn",
      title: `GST charged at ${q.gstPercent}%`,
      detail: `Since 22 Sep 2025 solar systems carry about ${EFFECTIVE_GST}% effective GST (5% on 70% goods, 18% on 30% services). That's about ${rupees(extra)} too much tax on this quote.`,
      impact: extra,
      source: SRC.gst,
    });
  }

  // 12. Accountability
  if (q.grievanceOfficer === false) {
    f.push({ id: "grievance", severity: "info", title: "No grievance contact named", detail: "Vendors under the scheme must run a complaint helpline. Ask for a named person, phone and email in the contract.", source: SRC.vendor });
  }
  f.push({ id: "portal", severity: "info", title: "Check the vendor on the national portal", detail: "Only vendors registered for your DISCOM on pmsuryaghar.gov.in can install a subsidised system.", source: SRC.portal });

  let score = 100;
  for (const x of f) score -= x.severity === "critical" ? 25 : x.severity === "warn" ? 8 : x.severity === "info" ? 1 : 0;
  score = Math.max(0, Math.min(100, score));
  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";
  const moneyAtRisk = f.reduce((a, x) => a + (x.severity !== "ok" && x.impact ? x.impact : 0), 0);
  const order = { critical: 0, warn: 1, info: 2, ok: 3 } as const;
  f.sort((a, b) => order[a.severity] - order[b.severity]);

  const criticals = f.filter((x) => x.severity === "critical").length;
  const incomplete = !kwp || !q.totalPrice;
  const verdict =
    criticals > 0
      ? "Don't sign this yet."
      : incomplete
        ? "Add the size and price to finish the check."
        : grade === "A" || grade === "B"
          ? "This looks like a fair deal."
          : "Negotiate before you sign.";

  return { findings: f, score, grade, actualKwp, band, pricePerKw, overcharge, moneyAtRisk, subsidyAtRisk, verdict, incomplete };
}

/** A message the homeowner can send the vendor, in English or Hindi. */
export function negotiationMessage(q: Quote, a: QuoteAudit, lang: "en" | "hi"): string {
  const asks: string[] = [];
  const has = (id: string) => a.findings.some((x) => x.id === id && x.severity !== "ok");
  const sev = (id: string) => a.findings.find((x) => x.id === id)?.severity;
  if (lang === "en") {
    if (a.overcharge > 0 && a.band) asks.push(`Your price works out to ${rupees(a.pricePerKw ?? 0)}/kW. Comparable DCR systems are ${rupees(a.band.low)} to ${rupees(a.band.high)}. Can you match ${rupees(a.band.mid)}?`);
    if (has("size")) asks.push("Please state the system size in kW, with the panel count and wattage.");
    if (has("price")) asks.push("Please share one all-inclusive price, with GST, net meter and DISCOM fees.");
    if (has("capacity")) asks.push(`The quote says ${q.systemKw} kW but ${q.panelCount} × ${q.panelWatt} W is ${a.actualKwp?.toFixed(2)} kWp. Please add panels or reduce the price.`);
    if (has("dcr")) asks.push("Please confirm in writing that the panels are DCR, and share the DCR certificate with module serial numbers.");
    if (has("almm")) asks.push("Please name the cell manufacturer and confirm it is on ALMM List-II.");
    if (sev("system") === "critical" || sev("system") === "warn") asks.push("Please include the 5-year comprehensive warranty and maintenance required under PM Surya Ghar.");
    if (has("structure")) asks.push("Please use a hot-dip galvanized (IS 4759) or ZAM structure.");
    if (has("gst")) asks.push(`GST on solar systems is about ${EFFECTIVE_GST}% effective since 22 Sep 2025. Please revise the tax line.`);
    if (has("advance")) asks.push("I'd like to pay in milestones, with 30% held until net metering is active.");
    if (has("safety")) asks.push("Please include earthing and a lightning arrester in the price.");
    if (!asks.length) return "Thanks for the quote. The numbers look fair. Please share the DCR certificate and the vendor registration ID for my DISCOM, and we can proceed.";
    return `Hi${q.vendorName ? ` ${q.vendorName}` : ""}, thanks for the quote. Before I sign:\n\n${asks.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nHappy to go ahead once these are sorted.`;
  }
  if (a.overcharge > 0 && a.band) asks.push(`आपका रेट ${rupees(a.pricePerKw ?? 0)}/kW आ रहा है। इसी तरह के DCR सिस्टम ${rupees(a.band.low)} से ${rupees(a.band.high)} में लग रहे हैं। क्या आप ${rupees(a.band.mid)} कर सकते हैं?`);
  if (has("size")) asks.push("सिस्टम का साइज़ kW में लिखिए, पैनल की संख्या और वॉट के साथ।");
  if (has("price")) asks.push("GST, नेट मीटर और DISCOM फीस समेत एक कुल कीमत बताइए।");
  if (has("capacity")) asks.push(`कोटेशन में ${q.systemKw} kW लिखा है, पर ${q.panelCount} × ${q.panelWatt} W = ${a.actualKwp?.toFixed(2)} kWp ही बनता है। पैनल बढ़ाइए या दाम कम कीजिए।`);
  if (has("dcr")) asks.push("लिखकर दीजिए कि पैनल DCR हैं, और मॉड्यूल सीरियल नंबर के साथ DCR सर्टिफिकेट भेजिए।");
  if (has("almm")) asks.push("सेल बनाने वाली कंपनी का नाम बताइए और पुष्टि कीजिए कि वह ALMM List-II में है।");
  if (sev("system") === "critical" || sev("system") === "warn") asks.push("PM सूर्य घर के तहत 5 साल की पूरी वारंटी और मेंटेनेंस कॉन्ट्रैक्ट में जोड़िए।");
  if (has("structure")) asks.push("हॉट-डिप गैल्वनाइज़्ड (IS 4759) या ZAM स्ट्रक्चर लगाइए।");
  if (has("gst")) asks.push(`22 सितंबर 2025 से सोलर सिस्टम पर लगभग ${EFFECTIVE_GST}% GST लगता है। टैक्स ठीक कीजिए।`);
  if (has("advance")) asks.push("भुगतान किश्तों में होगा, और नेट मीटर चालू होने तक 30% रोका जाएगा।");
  if (has("safety")) asks.push("अर्थिंग और लाइटनिंग अरेस्टर कीमत में शामिल कीजिए।");
  if (!asks.length) return "कोटेशन के लिए धन्यवाद। दाम ठीक लग रहे हैं। DCR सर्टिफिकेट और मेरे DISCOM के लिए वेंडर रजिस्ट्रेशन ID भेज दीजिए, फिर आगे बढ़ते हैं।";
  return `नमस्ते${q.vendorName ? ` ${q.vendorName}` : ""}, कोटेशन के लिए धन्यवाद। साइन करने से पहले:\n\n${asks.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nये ठीक हो जाएँ तो मैं आगे बढ़ने को तैयार हूँ।`;
}
