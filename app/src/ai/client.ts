// Browser-side AI client. Picks live mode (server + Groq, Grok or Claude) when
// the deployment has a key, otherwise runs everything on-device. Each result
// carries the mode that produced it so the UI can say so.

import { localAgent, type AgentReply, type AgentTurn, type TraceStep } from "./localAgent";
import { parseBill, parseQuote, parseSolarBill } from "./parsers";

export type Mode = "live" | "local";
export type ExtractKind = "bill" | "solar-bill" | "quote";

let modePromise: Promise<Mode> | null = null;

export type Provider = "groq" | "xai" | "anthropic";
const PROVIDER_LABEL: Record<Provider, string> = { groq: "Groq", xai: "Grok", anthropic: "Claude" };
let live: { provider: Provider | null; model: string | null } = { provider: null, model: null };

/** Who answers in live mode, for labels: "Groq", "Grok" or "Claude". */
export function liveLabel(): string {
  return live.provider ? PROVIDER_LABEL[live.provider] : "AI";
}
export function liveModel(): string | null {
  return live.model;
}

/** fetch with a deadline, so a slow model falls back to on-device instead of spinning. */
async function fetchWithin(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export function detectMode(): Promise<Mode> {
  modePromise ??= (async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch("./api/health", { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) return "local";
      const j = (await res.json()) as { live?: boolean; provider?: Provider | null; model?: string | null };
      live = { provider: j.provider ?? (j.live ? "anthropic" : null), model: j.model ?? null };
      return j.live ? "live" : "local";
    } catch {
      return "local";
    }
  })();
  return modePromise;
}

export interface AskResult extends AgentReply {
  mode: Mode;
  model?: string;
}

export async function ask(message: string, history: AgentTurn[]): Promise<AskResult> {
  const mode = await detectMode();
  if (mode === "live") {
    try {
      const res = await fetchWithin(
        "./api/agent",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: [...history, { role: "user", text: message }] }),
        },
        30_000,
      );
      if (res.ok) {
        const j = (await res.json()) as { text: string; trace: TraceStep[]; model: string };
        const local = localAgent(message, history); // only for link suggestions
        return { text: j.text, trace: j.trace as TraceStep[], lang: /[ऀ-ॿ]/.test(message) ? "hi" : "en", links: local.links, mode, model: j.model };
      }
    } catch {
      /* fall through to on-device */
    }
  }
  await new Promise((r) => setTimeout(r, 280));
  return { ...localAgent(message, history), mode: "local" };
}

/* -------------------------------------------------------------------------- */
/* Document reading                                                           */
/* -------------------------------------------------------------------------- */

export interface ExtractProgress {
  stage: string;
  pct?: number;
}

export interface ExtractResult<T> {
  fields: T;
  mode: Mode;
  method: "ai-vision" | "ai-text" | "ocr" | "pdf-text" | "text-rules";
  rawText?: string;
}

async function fileToBase64(file: Blob): Promise<string> {
  const buf = await file.arrayBuffer();
  let bin = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

/** Downscale photos so uploads stay under serverless body limits. */
async function shrinkImage(file: File, max = 1800): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((r) => c.toBlob((b) => r(b ?? file), "image/jpeg", 0.86));
}

async function pdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= Math.min(doc.numPages, 4); i++) {
    const page = await doc.getPage(i);
    const tc = await page.getTextContent();
    // Rebuild lines from y positions.
    const rows = new Map<number, string[]>();
    for (const it of tc.items as { str: string; transform: number[] }[]) {
      const y = Math.round(it.transform[5]);
      rows.set(y, [...(rows.get(y) ?? []), it.str]);
    }
    pages.push([...rows.entries()].sort((a, b) => b[0] - a[0]).map(([, s]) => s.join(" ")).join("\n"));
  }
  return pages.join("\n");
}

async function ocrImage(file: File, onProgress?: (p: ExtractProgress) => void): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng", 1, {
    logger: (m: { status: string; progress: number }) => onProgress?.({ stage: m.status, pct: m.progress }),
  });
  try {
    const { data } = await worker.recognize(file);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

function parseFor(kind: ExtractKind, text: string) {
  return kind === "quote" ? parseQuote(text) : kind === "bill" ? parseBill(text) : parseSolarBill(text);
}

type Parsed<K extends ExtractKind> = K extends "quote" ? ReturnType<typeof parseQuote> : K extends "bill" ? ReturnType<typeof parseBill> : ReturnType<typeof parseSolarBill>;

/** Map the server's snake_case fields onto the client shapes. */
function fromServer(kind: ExtractKind, f: Record<string, unknown>) {
  const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  const out: Record<string, unknown> = {};
  // Nulls are left out so a field the on-device parser found isn't erased.
  for (const [k, v] of Object.entries(f)) if (v !== null && v !== undefined) out[camel(k)] = v;
  if (kind === "bill") {
    if (f.period_months === 1 || f.period_months === 2) out.periodMonths = f.period_months;
    if (typeof f.energy_charges === "number" && typeof f.units === "number" && f.units > 0) out.tariff = Math.round((f.energy_charges / f.units) * 100) / 100;
  }
  delete out.billMonth;
  if (typeof f.bill_month === "number" && f.bill_month >= 1 && f.bill_month <= 12) out.billMonth = Math.round(f.bill_month) - 1;
  if (typeof out.stateCode === "string") out.stateCode = out.stateCode.toUpperCase();
  return out;
}

export async function extractText<K extends ExtractKind>(kind: K, text: string): Promise<ExtractResult<Parsed<K>>> {
  const mode = await detectMode();
  if (mode === "live") {
    try {
      const res = await fetchWithin("./api/extract", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind, text }) }, 30_000);
      if (res.ok) {
        const j = await res.json();
        const local = parseFor(kind, text) as unknown as Record<string, unknown>;
        return { fields: { ...local, ...fromServer(kind, j.fields) } as unknown as Parsed<K>, mode, method: "ai-text", rawText: text };
      }
    } catch {
      /* on-device below */
    }
  }
  return { fields: parseFor(kind, text) as Parsed<K>, mode: "local", method: "text-rules", rawText: text };
}

export async function extractFile<K extends ExtractKind>(kind: K, file: File, onProgress?: (p: ExtractProgress) => void): Promise<ExtractResult<Parsed<K>>> {
  if (file.type.startsWith("text/") || /\.txt$/i.test(file.name)) return extractText(kind, await file.text());
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (!isPdf && !file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name)) {
    throw new Error("Chhat reads photos (JPG, PNG), PDFs and text files.");
  }
  const mode = await detectMode();
  // Groq and Grok take text and photos, not PDFs: read the PDF's text here,
  // then let the model structure it.
  if (isPdf && mode === "live" && live.provider !== "anthropic") {
    onProgress?.({ stage: "Reading PDF text on your device" });
    const text = await pdfText(file);
    if (text.trim()) {
      onProgress?.({ stage: `Reading with ${liveLabel()}` });
      return extractText(kind, text);
    }
  }
  if (mode === "live") {
    try {
      onProgress?.({ stage: `Reading with ${liveLabel()}` });
      const blob = isPdf ? file : await shrinkImage(file);
      const mediaType = isPdf ? "application/pdf" : blob.type || "image/jpeg";
      const res = await fetchWithin(
        "./api/extract",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ kind, mediaType, data: await fileToBase64(blob) }),
        },
        30_000,
      );
      if (res.ok) {
        const j = await res.json();
        const base = parseFor(kind, "") as unknown as Record<string, unknown>;
        return { fields: { ...base, ...fromServer(kind, j.fields) } as unknown as Parsed<K>, mode, method: "ai-vision" };
      }
    } catch {
      /* on-device below */
    }
  }
  if (isPdf) {
    onProgress?.({ stage: "Reading PDF text on your device" });
    const text = await pdfText(file);
    return { fields: parseFor(kind, text) as Parsed<K>, mode: "local", method: "pdf-text", rawText: text };
  }
  onProgress?.({ stage: "Loading on-device OCR" });
  const text = await ocrImage(file, onProgress);
  return { fields: parseFor(kind, text) as Parsed<K>, mode: "local", method: "ocr", rawText: text };
}
