// On-device agent. No network, no model: an intent router with entity
// extraction that calls the same tools as the Claude agent and writes the
// answer from tool output. It is honest about being rules-based.

import { CITIES } from "../engine/climate";
import { rupees } from "../engine/format";
import { fairPriceBand } from "../engine/pricing";
import { STATES } from "../engine/states";
import { searchKnowledge, runTool, type ToolName } from "./tools";

export interface TraceStep {
  tool: ToolName;
  args: Record<string, unknown>;
  summary: string;
  ok: boolean;
}

export interface AgentTurn {
  role: "user" | "assistant";
  text: string;
}

export interface AgentReply {
  text: string;
  trace: TraceStep[];
  lang: "en" | "hi";
  links?: { label: string; to: string }[];
}

const ALIASES: Record<string, string> = {
  bangalore: "Bengaluru",
  bombay: "Mumbai",
  calcutta: "Kolkata",
  madras: "Chennai",
  gurgaon: "Gurugram",
  trivandrum: "Thiruvananthapuram",
  cochin: "Kochi",
  mysore: "Mysuru",
  mangalore: "Mangaluru",
  hubli: "Hubballi",
  vizag: "Visakhapatnam",
  baroda: "Vadodara",
  allahabad: "Prayagraj",
  banaras: "Varanasi",
  benares: "Varanasi",
  pondicherry: "Puducherry",
  aurangabad: "Chhatrapati Sambhajinagar",
  "new delhi": "Delhi",
  ncr: "Delhi",
  calicut: "Kozhikode",
  goa: "Panaji",
  "दिल्ली": "Delhi",
  "मुंबई": "Mumbai",
  "लखनऊ": "Lucknow",
  "पुणे": "Pune",
  "जयपुर": "Jaipur",
  "कोलकाता": "Kolkata",
  "चेन्नई": "Chennai",
  "बेंगलुरु": "Bengaluru",
  "हैदराबाद": "Hyderabad",
  "पटना": "Patna",
  "भोपाल": "Bhopal",
  "इंदौर": "Indore",
  "अहमदाबाद": "Ahmedabad",
  "वाराणसी": "Varanasi",
  "कानपुर": "Kanpur",
  "नागपुर": "Nagpur",
  "जोधपुर": "Jodhpur",
  "चंडीगढ़": "Chandigarh",
  "देहरादून": "Dehradun",
  "गुवाहाटी": "Guwahati",
};

const MONTH_WORDS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export function findCities(text: string): string[] {
  const t = ` ${text.toLowerCase()} `;
  const found: { name: string; at: number }[] = [];
  for (const c of CITIES) {
    const at = t.indexOf(c.name.toLowerCase());
    if (at >= 0) found.push({ name: c.name, at });
  }
  for (const [alias, name] of Object.entries(ALIASES)) {
    const at = t.indexOf(alias);
    if (at >= 0 && !found.some((f) => f.name === name)) found.push({ name, at });
  }
  return found.sort((a, b) => a.at - b.at).map((f) => f.name);
}

const parseNum = (s: string) => Number(s.replace(/,/g, ""));

export function extractEntities(text: string) {
  const t = text.toLowerCase();
  const kw = t.match(/(?<![\d.])(\d{1,3}(?:\.\d{1,3})?)\s*(?:kw|kwp|kilowatt|किलोवाट)/);
  const units = t.match(/(?<![\d,])(\d[\d,]{1,6})\s*(?:units?|kwh|यूनिट)/);
  const lakh = t.match(/(?<![\d.])(\d{1,3}(?:\.\d{1,2})?)\s*(?:lakhs?|lacs?|l\b|लाख)/);
  const rupee = t.match(/(?:₹|rs\.?\s?|inr\s?|rupees?\s)([\d,]{3,12})/) ?? t.match(/(?<![\d,])([\d,]{3,12})\s*(?:rs|rupees|रुपये|रुपए)/);
  // A bare amount like "210000" or "2,10,000" with no unit after it.
  const bare = [...t.matchAll(/(?<![\d.])(\d{1,3}(?:,\d{2,3})+|\d{5,7})(?![\d,.]*\s*(?:units?|kwh|kw|sq|w\b|watt|%|यूनिट))/g)]
    .map((m) => parseNum(m[1]))
    .find((n) => n >= 20000 && n <= 5000000);
  const area = t.match(/(?<![\d,])(\d[\d,]{1,5})\s*(?:sq\.?\s?ft|sqft|square\s?feet|sq feet|वर्ग)/);
  const month = MONTH_WORDS.findIndex((m) => new RegExp(`\\b${m}`).test(t));
  let stateCode: string | null = null;
  for (const s of Object.values(STATES)) if (t.includes(s.name.toLowerCase())) stateCode = s.code;
  return {
    kw: kw ? Number(kw[1]) : null,
    units: units ? parseNum(units[1]) : null,
    price: lakh ? Number(lakh[1]) * 100000 : rupee ? parseNum(rupee[1]) : null,
    bareAmount: bare ?? null,
    area: area ? parseNum(area[1]) : null,
    month: month >= 0 ? month + 1 : null,
    stateCode,
    cities: findCities(text),
  };
}

const has = (t: string, re: RegExp) => re.test(t.toLowerCase());

function stateOfCity(name: string | undefined): string {
  return CITIES.find((c) => c.name === name)?.state ?? "DL";
}

export function localAgent(message: string, history: AgentTurn[]): AgentReply {
  const hi = /[ऀ-ॿ]/.test(message) || /\bhindi\b|हिंदी/i.test(message);
  const lang: "en" | "hi" = hi ? "hi" : "en";
  const trace: TraceStep[] = [];
  const call = (tool: ToolName, args: Record<string, unknown>) => {
    const r = runTool(tool, args);
    trace.push({ tool, args, summary: r.summary, ok: r.ok });
    return r;
  };

  const e = extractEntities(message);
  // Carry context from earlier user turns when this message omits it.
  const past = history.filter((h) => h.role === "user").map((h) => extractEntities(h.text)).reverse();
  const city = e.cities[0] ?? past.find((p) => p.cities.length)?.cities[0];
  const units = e.units ?? past.find((p) => p.units)?.units ?? null;
  const t = message.toLowerCase();

  // Greeting / identity
  if (/^(hi|hello|hey|namaste|नमस्ते|hii+)\b/.test(t.trim()) && t.length < 25) {
    return {
      lang,
      trace,
      text:
        lang === "hi"
          ? "नमस्ते! यह छत है। अपना शहर और महीने की यूनिट बताइए (जैसे “लखनऊ, 420 यूनिट”), फिर पूरा हिसाब सामने होगा: कितने kW, कितनी सब्सिडी, कितनी बचत। सब्सिडी, लोन, DCR पैनल या ग़लत बिल के बारे में भी पूछ सकते हैं।"
          : "Hi, I'm Chhat. Tell me your city and monthly units (e.g. “Pune, 420 units”) and I'll size your system, stack the subsidy and work out the savings. You can also ask about loans, DCR panels, net metering or a bill that looks wrong.",
    };
  }

  // 1. Quote audit
  if (has(t, /quote|quotation|quoted|asking for|charging|कोटेशन|vendor (?:says|wants)/) && (e.price || e.kw || e.bareAmount)) {
    const price = e.price ?? e.bareAmount;
    if (!price) {
      const band = fairPriceBand(e.kw!);
      return {
        lang,
        trace,
        text:
          lang === "hi"
            ? `${e.kw} kW (DCR पैनल) का उचित दाम ${rupees(band.low)} से ${rupees(band.high)} है। कोटेशन में कुल कितनी कीमत लिखी है? बताइए, मैं जाँच दूँगा।`
            : `A fair installed price for ${e.kw} kW with DCR panels is ${rupees(band.low)} to ${rupees(band.high)}. What total price does the quote give? Tell me and I'll check it.`,
        links: [{ label: "Open Quote Check", to: "/quote" }],
      };
    }
    const kw = e.kw ?? 3;
    const assumed = e.kw === null;
    const st = e.stateCode ?? stateOfCity(city);
    const nonDcr = has(t, /non[-\s]?dcr|imported|chinese panel/);
    const gstM = t.match(/(?<![\d.])(\d{1,2}(?:\.\d{1,2})?)\s*%\s*gst/);
    const r = call("audit_quote", {
      vendor_name: null,
      state_code: st,
      system_kw: kw,
      total_price: price,
      gst_percent: gstM ? Number(gstM[1]) : null,
      panel_brand: null,
      panel_watt: null,
      panel_count: null,
      dcr: nonDcr ? false : has(t, /\bdcr\b/) ? true : null,
      almm_cells: null,
      inverter_brand: null,
      inverter_kw: null,
      inverter_warranty_years: null,
      structure: "unknown",
      panel_product_warranty_years: null,
      panel_performance_years: null,
      system_warranty_years: null,
      earthing: null,
      lightning_arrester: null,
      net_meter_included: null,
      monitoring: null,
      advance_percent: null,
      grievance_officer: null,
    });
    const a = r.data as ReturnType<typeof import("../engine/quoteAudit").auditQuote>;
    const band = fairPriceBand(kw);
    const top = a.findings.filter((f) => f.severity === "critical" || f.severity === "warn").slice(0, 3);
    const text =
      lang === "hi"
        ? `${assumed ? "साइज़ नहीं बताया, इसलिए 3 kW मानकर: " : ""}${kw} kW के लिए उचित दाम ${rupees(band.low)} से ${rupees(band.high)} है।${a.overcharge > 0 ? ` यह कोटेशन लगभग ${rupees(a.overcharge)} ज़्यादा है।` : price < band.low ? " यह कोटेशन इस दायरे से कम है: पैनल ब्रांड और DCR सर्टिफिकेट लिखित में माँगें।" : " यह कोटेशन उचित दायरे में है।"}${top.length ? `\n\nध्यान दें: ${top.map((f) => f.title).join("; ")}।` : ""}\n\nपूरी जाँच के लिए कोटेशन “Quote Check” में अपलोड करें।`
        : `${assumed ? "You didn't give the size, so I've assumed 3 kW. " : ""}For ${kw} kW with DCR panels, a fair installed price is ${rupees(band.low)} to ${rupees(band.high)}.${a.overcharge > 0 ? ` This quote is about ${rupees(a.overcharge)} above that.` : price < band.low ? " This quote is below that range: ask for the panel brand and DCR certificate in writing." : " This quote sits inside the fair range."}${top.length ? `\n\nWatch for: ${top.map((f) => f.title).join("; ")}.` : ""}\n\nFor a line-by-line audit (DCR, warranties, structure, GST), upload the full quote to Quote Check.`;
    return { lang, trace, text, links: [{ label: "Open Quote Check", to: "/quote" }] };
  }

  // 2. Bill audit with numbers
  const imp = t.match(/import(?:ed)?\D{0,6}(\d{1,5})/);
  const exp = t.match(/export(?:ed)?\D{0,6}(\d{1,5})/);
  const billed = t.match(/(?:billed|charged|net units?)\D{0,6}(\d{1,5})/);
  if (imp && exp) {
    const r = call("audit_bill", {
      city: city ?? "Delhi",
      system_kwp: e.kw ?? 3.27,
      bill_month: e.month ?? new Date().getMonth() + 1,
      import_units: Number(imp[1]),
      export_units: Number(exp[1]),
      previous_credit: null,
      net_units_billed: billed ? Number(billed[1]) : null,
      energy_charges: null,
      other_charges: null,
      other_charges_label: null,
    });
    return {
      lang,
      trace,
      text: `${r.summary.replace(/\s*Findings:.*$/, "")}\n\n${(r.data as { findings: { title: string; severity: string }[] }).findings
        .filter((f) => f.severity !== "ok")
        .map((f) => `• ${f.title}`)
        .join("\n")}\n\nBill Audit can draft the correction letter to your DISCOM.`,
      links: [{ label: "Open Bill Audit", to: "/bill" }],
    };
  }

  // 3. Subsidy with a size
  if (has(t, /subsid|सब्सिडी|sabsid|cfa/) && e.kw) {
    const st = e.stateCode ?? stateOfCity(city);
    const r = call("compute_subsidy", { kw: e.kw, state_code: st });
    const d = r.data as { central: number; state: number; total: number; stateRule?: string };
    return {
      lang,
      trace,
      text:
        lang === "hi"
          ? `${e.kw} kW पर ${STATES[st]?.name ?? st} में केंद्र की सब्सिडी ${rupees(d.central)}${d.state ? ` और राज्य की ${rupees(d.state)}` : ""}, कुल ${rupees(d.total)}। यह सिर्फ़ DCR पैनल और रजिस्टर्ड वेंडर पर मिलती है।`
          : `${e.kw} kW in ${STATES[st]?.name ?? st}: central subsidy ${rupees(d.central)}${d.state ? ` plus ${rupees(d.state)} state top-up (${d.stateRule})` : ""}, total ${rupees(d.total)}. It's paid only for DCR panels installed by a vendor registered for your DISCOM.`,
    };
  }

  // 4. Loan / EMI
  if (has(t, /\bloan|\bemi\b|finance|लोन|ईएमआई|interest rate/)) {
    const kw = e.kw ?? 3.27;
    const gross = e.price ?? fairPriceBand(kw).mid;
    const st = e.stateCode ?? stateOfCity(city);
    const r = call("finance_options", { gross_cost: gross, kw, state_code: st });
    const kb = call("search_knowledge", { query: "loan emi bank" });
    void kb;
    const l = r.data as { upfront: number; principal: number; rate: number; emiBefore: number; emiAfter: number; tenureYears: number; concessional: boolean };
    return {
      lang,
      trace,
      text:
        lang === "hi"
          ? `${kw.toFixed(2)} kW (${rupees(gross)}) पर: ${rupees(l.upfront)} पहले, बाकी ${rupees(l.principal)} लोन ${(l.rate * 100).toFixed(2)}% पर ${l.tenureYears} साल के लिए। सब्सिडी आने तक EMI ${rupees(l.emiBefore)}, और सब्सिडी लोन में जमा करने के बाद ${rupees(l.emiAfter)}।`
          : `For ${kw.toFixed(2)} kW at ${rupees(gross)}: pay ${rupees(l.upfront)} upfront and borrow ${rupees(l.principal)} at ${(l.rate * 100).toFixed(2)}%${l.concessional ? " (PM Surya Ghar concessional rate)" : ""} over ${l.tenureYears} years. EMI is ${rupees(l.emiBefore)} until the subsidy lands, then ${rupees(l.emiAfter)} once you prepay the subsidy into the loan. Collateral-free up to ₹2 lakh for systems up to 3 kW.`,
    };
  }

  // 5. Compare two cities' sunlight
  if (e.cities.length >= 2) {
    const [a, b] = e.cities;
    const ra = call("get_irradiance", { city: a });
    const rb = call("get_irradiance", { city: b });
    const ya = (ra.data as { specificYield: number }).specificYield;
    const yb = (rb.data as { specificYield: number }).specificYield;
    const better = ya >= yb ? a : b;
    return {
      lang,
      trace,
      text:
        lang === "hi"
          ? `${a} में 1 kW सालाना लगभग ${Math.round(ya)} यूनिट और ${b} में ${Math.round(yb)} यूनिट बनाता है। ${better} में ${Math.abs(Math.round(((ya - yb) / Math.min(ya, yb)) * 100))}% ज़्यादा धूप का फ़ायदा है।`
          : `A 1 kW system makes about ${Math.round(ya)} units a year in ${a} and ${Math.round(yb)} in ${b}. ${better} gets ${Math.abs(Math.round(((ya - yb) / Math.min(ya, yb)) * 100))}% more out of the same panels. Source: NASA POWER 2001-2020.`,
    };
  }

  // 6. Size / worth it
  const sizing = has(t, /worth|payback|save|saving|size|how many|kitne|install|लगा|बचत|फ़ायदा|fayda|should i|recommend|kw|units?|bill/);
  if (city && (units || e.price) && sizing) {
    const st = STATES[stateOfCity(city)];
    const u = units ?? Math.round((e.price ?? 0) / (st?.tariff ?? 7));
    const r = call("size_system", {
      city,
      monthly_units: u,
      bill_month: e.month ?? new Date().getMonth() + 1,
      roof_area_sqft: e.area,
      shading: has(t, /shade|shadow|छाया/) ? "some" : "none",
      tariff: null,
      panels: e.kw ? Math.max(2, Math.round((e.kw * 1000) / 545)) : null,
    });
    if (!r.ok) {
      return {
        lang,
        trace,
        text:
          lang === "hi"
            ? `${u} यूनिट महीने के लिए सही नहीं लगता। बिल पर लिखी महीने की यूनिट बताइए (आम तौर पर 100 से 2,000 के बीच)।`
            : `${u} units a month doesn't look right. Tell me the monthly units printed on your bill (usually somewhere between 100 and 2,000).`,
      };
    }
    const d = r.data as { kwp: number; panels: number; annualGeneration: number; savings: number; subsidy: number; netCost: number; payback: number | null; emi: number };
    const assumed = !units ? (lang === "hi" ? ` (आपके ₹ बिल से लगभग ${u} यूनिट मानकर)` : ` (assuming ~${u} units from your ₹ bill)`) : "";
    return {
      lang,
      trace,
      text:
        lang === "hi"
          ? `${city} में${assumed} ${d.kwp.toFixed(2)} kW (${d.panels} पैनल) सही रहेगा। यह साल में लगभग ${Math.round(d.annualGeneration)} यूनिट बनाएगा और ${rupees(d.savings)} सालाना बचाएगा। सब्सिडी ${rupees(d.subsidy)}, सब्सिडी के बाद लागत ${rupees(d.netCost)}, और लागत ${d.payback ? d.payback.toFixed(1) + " साल" : "25 साल से ज़्यादा"} में वसूल।`
          : `In ${city}${assumed}, go for ${d.kwp.toFixed(2)} kWp (${d.panels} panels). It should make about ${Math.round(d.annualGeneration)} units a year and save ${rupees(d.savings)} a year. Subsidy ${rupees(d.subsidy)}, so you pay about ${rupees(d.netCost)} net, and it pays back in ${d.payback ? d.payback.toFixed(1) + " years" : "over 25 years"}. On a PM Surya Ghar loan the EMI after subsidy is about ${rupees(d.emi)}/month.`,
      links: [{ label: "See the full Roof Report", to: `/report?city=${encodeURIComponent(city)}&units=${u}` }],
    };
  }

  // 7. Sunlight question for one city
  if (city && has(t, /sun|sunny|irradiance|sunlight|dhoop|धूप|generation|produce|units? (?:per|a) (?:kw|year)/)) {
    const r = call("get_irradiance", { city });
    return { lang, trace, text: r.summary };
  }

  // 8. Sizing intent without enough info
  if (sizing && !has(t, /subsid|loan|dcr|net meter|clean|monsoon|battery|gst|vendor|process|apply/)) {
    if (!city || !units) {
      const missing = [!city && (lang === "hi" ? "शहर" : "your city"), !units && (lang === "hi" ? "महीने की यूनिट (बिल पर)" : "monthly units from your bill")].filter(Boolean).join(lang === "hi" ? " और " : " and ");
      return {
        lang,
        trace,
        text: lang === "hi" ? `सही हिसाब के लिए ${missing} बताइए। जैसे: “जयपुर, 380 यूनिट”।` : `Tell me ${missing} and I'll work it out. For example: “Jaipur, 380 units”.`,
      };
    }
  }

  // 9. Knowledge base
  const kb = call("search_knowledge", { query: message });
  const hits = searchKnowledge(message, 2);
  if (hits.length) {
    const top = hits[0];
    const body = lang === "hi" && top.hi ? top.hi : top.en;
    const related = hits[1] ? (lang === "hi" ? `\n\nयह भी देखें: ${hits[1].title}` : `\n\nRelated: ${hits[1].title}`) : "";
    void kb;
    return { lang, trace, text: `${body}${top.source ? `\n\nSource: ${top.source.label}` : ""}${related}` };
  }

  return {
    lang,
    trace,
    text:
      lang === "hi"
        ? "माफ़ कीजिए, इसका अच्छा जवाब यहाँ नहीं है। रूफ़टॉप सोलर, सब्सिडी, लोन, वेंडर कोटेशन या बिजली बिल के बारे में पूछिए।"
        : "I don't have a good answer for that. I can help with rooftop solar sizing, subsidy, loans, vendor quotes, net metering and post-solar bills.",
  };
}
