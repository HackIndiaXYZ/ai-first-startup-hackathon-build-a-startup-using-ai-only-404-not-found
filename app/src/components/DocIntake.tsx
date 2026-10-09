import * as Tabs from "@radix-ui/react-tabs";
import { CheckCircle, ClipboardText, FileArrowUp, Files, SpinnerGap, WarningCircle } from "@phosphor-icons/react";
import { useRef, useState, type ReactNode } from "react";
import { extractFile, extractText, type ExtractKind, type ExtractResult, type Mode } from "../ai/client";
import type { SampleDoc } from "../data/samples";

const METHOD_LABEL: Record<ExtractResult<unknown>["method"], string> = {
  "claude-vision": "Read by Claude (vision)",
  "claude-text": "Read by Claude",
  ocr: "Read on your device (OCR)",
  "pdf-text": "Read on your device (PDF text)",
  "text-rules": "Read on your device (text rules)",
};

export interface IntakeMeta {
  mode: Mode;
  method: ExtractResult<unknown>["method"];
  sampleId?: string;
  city?: string;
}

/**
 * Upload / paste / sample intake shared by the three tools. Whatever comes in
 * is turned into fields and handed to the page, which shows them as an
 * editable form before anything is computed.
 */
export function DocIntake<K extends ExtractKind>({
  kind,
  samples,
  onFields,
  manual,
  defaultTab = "sample",
  activeSample,
}: {
  kind: K;
  samples: SampleDoc[];
  onFields: (fields: Awaited<ReturnType<typeof extractText<K>>>["fields"], meta: IntakeMeta) => void;
  manual?: ReactNode;
  defaultTab?: "sample" | "upload" | "paste" | "manual";
  activeSample?: string;
}) {
  const [tab, setTab] = useState(defaultTab);
  const [status, setStatus] = useState<{ state: "idle" | "busy" | "done" | "error"; text?: string }>({ state: "idle" });
  const [picked, setPicked] = useState<string | undefined>(activeSample);
  const [paste, setPaste] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (p: Promise<ExtractResult<unknown>>, extra: Partial<IntakeMeta> = {}) => {
    setStatus({ state: "busy", text: "Reading…" });
    try {
      const r = await p;
      onFields(r.fields as never, { mode: r.mode, method: r.method, ...extra });
      setStatus({ state: "done", text: METHOD_LABEL[r.method] });
    } catch (e) {
      setStatus({ state: "error", text: (e as Error).message || "Couldn't read that file. Try a clearer photo, or type the numbers." });
    }
  };

  const pickSample = (s: SampleDoc) => {
    setPicked(s.id);
    run(extractText(kind, s.text), { sampleId: s.id, city: s.city });
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 12 * 1024 * 1024) {
      setStatus({ state: "error", text: "That file is over 12 MB. Try a photo or a single-page PDF." });
      return;
    }
    run(
      extractFile(kind, f, (pr) => setStatus({ state: "busy", text: `${pr.stage}${pr.pct ? ` ${Math.round(pr.pct * 100)}%` : ""}` })),
    );
  };

  const sample = samples.find((s) => s.id === picked);
  const noun = kind === "quote" ? "quote" : "bill";

  return (
    <div className="intake">
      <Tabs.Root value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <Tabs.List className="tabs__list" aria-label={`How to add your ${noun}`}>
          <Tabs.Trigger value="sample" className="tabs__trigger">
            <Files size={16} /> Sample {noun}s
          </Tabs.Trigger>
          <Tabs.Trigger value="upload" className="tabs__trigger">
            <FileArrowUp size={16} /> Upload
          </Tabs.Trigger>
          <Tabs.Trigger value="paste" className="tabs__trigger">
            <ClipboardText size={16} /> Paste text
          </Tabs.Trigger>
          {manual && (
            <Tabs.Trigger value="manual" className="tabs__trigger">
              Type it in
            </Tabs.Trigger>
          )}
        </Tabs.List>

        <Tabs.Content value="sample" className="intake__pane">
          <div className="samples">
            {samples.map((s) => (
              <button key={s.id} type="button" className={`sample${picked === s.id ? " is-on" : ""}`} onClick={() => pickSample(s)} aria-pressed={picked === s.id}>
                <span className="sample__label">{s.label}</span>
                <span className="sample__blurb">{s.blurb}</span>
              </button>
            ))}
          </div>
          {sample && <pre className="paper-doc" data-lenis-prevent tabIndex={0} aria-label={`Sample ${noun} text`}>{sample.text}</pre>}
        </Tabs.Content>

        <Tabs.Content value="upload" className="intake__pane">
          <label
            className={`drop${drag ? " is-drag" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              onFile(e.dataTransfer.files[0]);
            }}
          >
            <FileArrowUp size={30} weight="duotone" />
            <span className="drop__title">Drop a photo or PDF of your {noun}</span>
            <span className="drop__hint">JPG, PNG or PDF. With live AI, Claude reads it. Without, Chhat reads it on your device: nothing leaves your browser.</span>
            <span className="btn btn--sm btn--ghost">Choose file</span>
            <input ref={fileRef} type="file" accept="image/*,application/pdf,text/plain" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </Tabs.Content>

        <Tabs.Content value="paste" className="intake__pane">
          <textarea
            className="textarea"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder={`Paste the text of your ${noun} here (from an email or PDF).`}
            aria-label={`${noun} text`}
            data-lenis-prevent
          />
          <button type="button" className="btn btn--sm" disabled={!paste.trim()} onClick={() => run(extractText(kind, paste))}>
            Read this {noun}
          </button>
        </Tabs.Content>

        {manual && (
          <Tabs.Content value="manual" className="intake__pane">
            {manual}
          </Tabs.Content>
        )}
      </Tabs.Root>

      {status.state !== "idle" && (
        <p className={`intake__status is-${status.state}`} role="status">
          {status.state === "busy" && <SpinnerGap size={16} className="spin" />}
          {status.state === "done" && <CheckCircle size={16} weight="fill" />}
          {status.state === "error" && <WarningCircle size={16} weight="fill" />}
          {status.text}
          {status.state === "done" && <span className="intake__check"> · check the fields below</span>}
        </p>
      )}
    </div>
  );
}
