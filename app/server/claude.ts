// Server-side Claude integration for Chhat.
//  - runAgent: an agent loop where Claude decides which Chhat tools to call.
//  - extractDocument: reads a bill or quote (image / PDF / text) into strict JSON.
// The API key is read from the server environment only.

import Anthropic from "@anthropic-ai/sdk";
import { runTool, TOOL_SCHEMAS } from "../src/ai/tools";

export const MODEL = "claude-opus-5-5";
// Server-side refusal fallback: if a safety classifier declines, the API re-runs
// the request on Anthropic's recommended fallback model inside the same call.
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

let client: Anthropic | null = null;
export function hasKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

const SYSTEM = `You are Chhat, an independent rooftop-solar advisor for Indian homes. You don't sell panels.

How you work:
- Every rupee figure, kW size, unit count, subsidy or payback you state must come from a tool result in this conversation. Call size_system, compute_subsidy, finance_options, audit_quote, audit_bill or get_irradiance instead of estimating.
- For rules and process questions (subsidy rules, DCR, ALMM, net metering, loans, vendors, GST, timelines, maintenance, wrong bills), call search_knowledge first and cite the source it returns.
- If you need a number the user hasn't given (city, monthly units), ask one short question. If they give a bill amount instead of units, you may estimate units by dividing by the state tariff and say you did.
- Reply in the user's language and script. Hindi in Devanagari if they write Hindi; Hinglish if they write Hinglish; English otherwise. Use gender-neutral Hindi phrasing for yourself.
- Be brief and concrete: 2 to 6 sentences, or a short list. Indian number formatting (₹1,23,456; lakh).
- Mention that figures are estimates when giving money projections, once, briefly.
- When a quote or bill needs a full audit, suggest the Quote Check or Bill Audit page in the app.`;

export interface TraceStep {
  tool: string;
  args: Record<string, unknown>;
  summary: string;
  ok: boolean;
}

export interface AgentResult {
  text: string;
  trace: TraceStep[];
  model: string;
  refused?: boolean;
}

const tools = TOOL_SCHEMAS.map((t) => ({ ...t, strict: true })) as unknown as Anthropic.Beta.BetaTool[];

export async function runAgent(history: { role: "user" | "assistant"; text: string }[]): Promise<AgentResult> {
  const messages: Anthropic.Beta.BetaMessageParam[] = history
    .filter((h) => h.text.trim())
    .slice(-12)
    .map((h) => ({ role: h.role, content: h.text }));
  if (!messages.length || messages[0].role !== "user") messages.shift();

  const trace: TraceStep[] = [];
  let model = MODEL;

  for (let step = 0; step < 8; step++) {
    const response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: [FALLBACK_BETA],
      fallbacks: "default",
      output_config: { effort: "medium" },
      cache_control: { type: "ephemeral" },
      system: SYSTEM,
      tools,
      tool_choice: { type: "auto" },
      messages,
    });
    model = response.model;

    if (response.stop_reason === "refusal") {
      return { text: "I can't help with that one. Ask me about rooftop solar, subsidies, loans, quotes or bills.", trace, model, refused: true };
    }

    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    const toolUses = response.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (response.stop_reason !== "tool_use" || !toolUses.length) {
      const text = response.content
        .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
        .map((b) => b.text)
        .join("\n")
        .trim();
      return { text: text || "Done.", trace, model };
    }

    messages.push({ role: "assistant", content: response.content });
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((tu) => {
      const args = (tu.input ?? {}) as Record<string, unknown>;
      const r = runTool(tu.name, args);
      trace.push({ tool: tu.name, args, summary: r.summary, ok: r.ok });
      return { type: "tool_result", tool_use_id: tu.id, content: r.summary, is_error: !r.ok };
    });
    messages.push({ role: "user", content: results });
  }
  return { text: "That took too many steps. Try asking one thing at a time.", trace, model };
}

// ---------------------------------------------------------------------------
// Document extraction

const nNum = { anyOf: [{ type: "number" }, { type: "null" }] };
const nStr = { anyOf: [{ type: "string" }, { type: "null" }] };
const nBool = { anyOf: [{ type: "boolean" }, { type: "null" }] };
const nInt = { anyOf: [{ type: "integer" }, { type: "null" }] };
const schema = (props: Record<string, unknown>) => ({
  type: "object",
  properties: props,
  required: Object.keys(props),
  additionalProperties: false,
});

export const EXTRACT_SCHEMAS = {
  bill: schema({
    discom: nStr,
    consumer_name: nStr,
    consumer_number: nStr,
    state_code: { ...nStr, description: "Two-letter Indian state code inferred from the DISCOM or address" },
    bill_month: { ...nInt, description: "Month of the billing period end, 1-12" },
    period_months: { ...nInt, description: "1 for monthly billing, 2 for bimonthly" },
    units: { ...nNum, description: "Units consumed (kWh) in this bill" },
    bill_amount: nNum,
    energy_charges: nNum,
    fixed_charges: nNum,
    sanctioned_load_kw: nNum,
    tariff_category: nStr,
  }),
  "solar-bill": schema({
    discom: nStr,
    consumer_name: nStr,
    consumer_number: nStr,
    state_code: nStr,
    bill_month: nInt,
    import_units: nNum,
    export_units: nNum,
    previous_credit: { ...nNum, description: "Banked/carried-forward export units from the previous bill" },
    net_units_billed: nNum,
    energy_charges: nNum,
    fixed_charges: nNum,
    other_charges: { ...nNum, description: "Sum of non-standard charges not explained as duty, tax, fuel adjustment or meter rent" },
    other_charges_label: nStr,
    total: nNum,
  }),
  quote: schema({
    vendor_name: nStr,
    state_code: nStr,
    system_kw: nNum,
    total_price: { ...nNum, description: "Total payable in ₹ including GST" },
    gst_percent: nNum,
    panel_brand: nStr,
    panel_watt: nNum,
    panel_count: nInt,
    dcr: { ...nBool, description: "true if panels are stated as DCR / domestic content, false if stated non-DCR or imported, null if not stated" },
    almm_cells: nBool,
    inverter_brand: nStr,
    inverter_kw: nNum,
    inverter_warranty_years: nNum,
    structure: { type: "string", enum: ["hdg", "zam", "aluminium", "ms-painted", "unknown"] },
    panel_product_warranty_years: nNum,
    panel_performance_years: nNum,
    system_warranty_years: { ...nNum, description: "Whole-system warranty or comprehensive maintenance term, years" },
    earthing: nBool,
    lightning_arrester: nBool,
    net_meter_included: nBool,
    monitoring: nBool,
    advance_percent: nNum,
    grievance_officer: nBool,
  }),
} as const;

export type ExtractKind = keyof typeof EXTRACT_SCHEMAS;

const INSTRUCTIONS: Record<ExtractKind, string> = {
  bill: "This is an Indian electricity (DISCOM) bill. Extract the fields. Use null for anything not printed. Do not guess numbers.",
  "solar-bill":
    "This is an Indian net-metered electricity bill for a home with rooftop solar. Extract import (energy drawn from grid), export (energy injected), any carried-forward credit, and the units actually billed. Use null for anything not printed. Do not guess numbers.",
  quote:
    "This is a rooftop-solar installation quotation from an Indian vendor. Extract the fields. Use null for anything the quote does not state. Map structure: hot-dip galvanized/GI → hdg, ZAM/zinc-aluminium-magnesium → zam, aluminium → aluminium, painted MS/mild steel → ms-painted, otherwise unknown.",
};

export async function extractDocument(
  kind: ExtractKind,
  input: { mediaType: string; data: string } | { text: string },
): Promise<Record<string, unknown>> {
  const content: Anthropic.Beta.BetaContentBlockParam[] = [];
  if ("text" in input) {
    content.push({ type: "text", text: `<document>\n${input.text}\n</document>` });
  } else if (input.mediaType === "application/pdf") {
    content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: input.data } });
  } else {
    content.push({
      type: "image",
      source: { type: "base64", media_type: input.mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data: input.data },
    });
  }
  content.push({ type: "text", text: INSTRUCTIONS[kind] });

  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: [FALLBACK_BETA],
    fallbacks: "default",
    output_config: { effort: "low", format: { type: "json_schema", schema: EXTRACT_SCHEMAS[kind] } },
    messages: [{ role: "user", content }],
  } as Anthropic.Beta.MessageCreateParamsNonStreaming);

  if (response.stop_reason === "refusal") throw new Error("The model declined to read this document.");
  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return JSON.parse(text) as Record<string, unknown>;
}
