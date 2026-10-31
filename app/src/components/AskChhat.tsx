import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUp, Microphone, Sparkle, Wrench, X } from "@phosphor-icons/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ask, detectMode, liveLabel, liveModel, type AskResult, type Mode } from "../ai/client";
import type { AgentTurn } from "../ai/localAgent";

interface Msg {
  role: "user" | "assistant";
  text: string;
  result?: AskResult;
}

const SUGGESTIONS = [
  "Pune, 420 units a month. Worth it?",
  "दिल्ली में 3 kW पर कितनी सब्सिडी?",
  "Vendor quoted 2.4 lakh for 3 kW in Lucknow",
  "Do I need a battery?",
  "Import 410 export 236 billed 410, Lucknow",
  "Jaipur vs Kolkata sunlight",
];

const AskCtx = createContext<{ open: (q?: string) => void }>({ open: () => {} });
export const useAsk = () => useContext(AskCtx);

export function ModeBadge({ mode, model }: { mode: Mode | null; model?: string }) {
  if (!mode) return <span className="chip">Checking AI…</span>;
  return mode === "live" ? (
    <span className="chip chip--live" title={`${model ?? liveModel() ?? liveLabel()} picks the tools and writes the reply; every rupee comes from the tested engine.`}>
      <span className="dot" /> Live AI · {liveLabel()}
    </span>
  ) : (
    <span
      className="chip chip--local"
      title="Rules, search and a tested engine run in your browser. No language model is called, and your documents stay on this device. Live mode needs a server key."
    >
      <span className="dot" /> On-device mode · rules engine
    </span>
  );
}

function Trace({ r }: { r: AskResult }) {
  if (!r.trace.length) return null;
  return (
    <details className="trace">
      <summary>
        <Wrench size={13} weight="bold" /> {r.trace.length} tool call{r.trace.length > 1 ? "s" : ""}
      </summary>
      <ol>
        {r.trace.map((t, i) => (
          <li key={i}>
            <code>{t.tool}</code>
            <span className="trace__args">
              ({Object.entries(t.args)
                .filter(([, v]) => v !== null && v !== undefined && v !== "unknown")
                .map(([k, v]) => `${k}: ${typeof v === "string" ? `"${v}"` : v}`)
                .join(", ")})
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}

export function ChatPanel({ onNavigate, compact }: { onNavigate?: () => void; compact?: boolean }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode | null>(null);
  const [listening, setListening] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const pending = useContext(PendingCtx);

  useEffect(() => {
    detectMode().then(setMode);
  }, []);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setInput("");
      const history: AgentTurn[] = msgs.map((m) => ({ role: m.role, text: m.text }));
      setMsgs((m) => [...m, { role: "user", text: q }]);
      setBusy(true);
      try {
        const r = await ask(q, history);
        setMode(r.mode);
        setMsgs((m) => [...m, { role: "assistant", text: r.text, result: r }]);
      } finally {
        setBusy(false);
      }
    },
    [busy, msgs],
  );

  useEffect(() => {
    if (pending.current) {
      const q = pending.current;
      pending.current = null;
      send(q);
    }
  }, [pending, send]);

  const SR = typeof window !== "undefined" ? ((window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition) : undefined;
  const listen = () => {
    if (!SR) return;
    const rec = new (SR as new () => {
      lang: string;
      interimResults: boolean;
      onresult: (e: { results: { 0: { transcript: string } }[] }) => void;
      onend: () => void;
      start: () => void;
    })();
    rec.lang = /hi/i.test(navigator.language) ? "hi-IN" : "en-IN";
    rec.interimResults = false;
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  };

  return (
    <div className={`chat${compact ? " chat--compact" : ""}`}>
      <div className="chat__scroll" ref={scroller} data-lenis-prevent>
        {!msgs.length && (
          <div className="chat__empty">
            <p className="chat__hello">
              Ask in English, Hindi or Hinglish. Every number comes from Chhat's tools, and you can open the trace to see which.
            </p>
            <div className="chat__sugs">
              {SUGGESTIONS.map((s) => (
                <button key={s} type="button" className="chat__sug" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`msg msg--${m.role}`}>
            <div className={`msg__bubble${m.result?.lang === "hi" ? " msg__bubble--hi" : ""}`}>{m.text}</div>
            {m.result && (
              <div className="msg__meta">
                <Trace r={m.result} />
                {m.result.links?.map((l) => (
                  <Link key={l.to} to={l.to} className="msg__link" onClick={onNavigate}>
                    {l.label} →
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="msg msg--assistant">
            <div className="msg__bubble msg__typing" aria-label="Thinking">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
      </div>
      <form
        className="chat__form"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="chat__mode">
          <ModeBadge mode={mode} />
        </div>
        <div className="chat__input">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. Lucknow, 380 units. What size?" aria-label="Ask Chhat" />
          {SR ? (
            <button type="button" className={`icon-btn${listening ? " is-on" : ""}`} onClick={listen} aria-label="Speak your question">
              <Microphone size={18} weight={listening ? "fill" : "regular"} />
            </button>
          ) : null}
          <button type="submit" className="icon-btn icon-btn--send" disabled={!input.trim() || busy} aria-label="Send">
            <ArrowUp size={18} weight="bold" />
          </button>
        </div>
      </form>
    </div>
  );
}

const PendingCtx = createContext<{ current: string | null }>({ current: null });

export function AskProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pending = useRef<string | null>(null);
  const openWith = useCallback((q?: string) => {
    pending.current = q ?? null;
    setOpen(true);
  }, []);
  return (
    <AskCtx.Provider value={{ open: openWith }}>
      <PendingCtx.Provider value={pending}>
        {children}
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="sheet__overlay" />
            <Dialog.Content className="sheet__content" aria-describedby={undefined}>
              <div className="sheet__head">
                <Dialog.Title className="sheet__title">
                  <Sparkle size={18} weight="fill" color="var(--haldi-2)" /> Ask Chhat
                </Dialog.Title>
                <Dialog.Close className="icon-btn" aria-label="Close">
                  <X size={18} />
                </Dialog.Close>
              </div>
              <ChatPanel onNavigate={() => setOpen(false)} compact />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </PendingCtx.Provider>
    </AskCtx.Provider>
  );
}
