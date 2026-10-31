import { ArrowRight, ClipboardText, FileArrowUp, SpinnerGap, Trash, Trophy, WarningCircle } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { extractFile, extractText } from "../ai/client";
import { LeadForm } from "../components/LeadForm";
import { Field, NumberInput } from "../components/ui";
import { SAMPLE_QUOTES } from "../data/samples";
import { rupees } from "../engine/format";
import { EMPTY_QUOTE, type Quote } from "../engine/quoteAudit";
import { compareQuotes, loadSlots, saveSlots, SLOTS, type Compared } from "../lib/compare";
import { usePageIntro } from "../lib/motion";
import "../styles/tools.css";
import "../styles/compare.css";

type Parsed = Quote & { city?: string | null };
const strip = ({ city: _c, ...q }: Parsed): Quote => (void _c, { ...EMPTY_QUOTE, ...q });

const yesNo = (v: boolean | null) => (v === null ? "Not stated" : v ? "Yes" : "No");
const yrs = (v: number | null) => (v ? `${v} yrs` : "Not stated");

/** The rows of the side-by-side table. Every value comes from the audit. */
const ROWS: { label: string; cell: (c: Compared) => string; bad?: (c: Compared) => boolean }[] = [
  { label: "Grade", cell: (c) => (c.audit.incomplete ? "Not graded" : `${c.audit.grade} · ${c.audit.score}/100`) },
  { label: "Panels add up to", cell: (c) => (c.kwp ? `${c.kwp.toFixed(2)} kWp` : "Not stated"), bad: (c) => c.audit.findings.some((f) => f.id === "capacity" && f.severity === "critical") },
  { label: "Total price", cell: (c) => (c.quote.totalPrice ? rupees(c.quote.totalPrice) : "Not stated") },
  { label: "Price per kW", cell: (c) => (c.audit.pricePerKw ? rupees(c.audit.pricePerKw) : "–"), bad: (c) => c.audit.overcharge > 0 },
  { label: "Above fair band", cell: (c) => (c.audit.overcharge > 0 ? rupees(c.audit.overcharge) : c.audit.band ? "No" : "–"), bad: (c) => c.audit.overcharge > 0 },
  { label: "Subsidy at risk", cell: (c) => (c.audit.subsidyAtRisk > 0 ? rupees(c.audit.subsidyAtRisk) : "No"), bad: (c) => c.audit.subsidyAtRisk > 0 },
  { label: "Money at risk", cell: (c) => (c.audit.moneyAtRisk > 0 ? rupees(c.audit.moneyAtRisk) : "None found"), bad: (c) => c.audit.moneyAtRisk > 0 },
  { label: "Made-in-India (DCR) panels", cell: (c) => yesNo(c.quote.dcr), bad: (c) => c.quote.dcr === false },
  { label: "System warranty", cell: (c) => yrs(c.quote.systemWarrantyYears), bad: (c) => (c.quote.systemWarrantyYears ?? 0) < 5 },
  { label: "Inverter warranty", cell: (c) => yrs(c.quote.inverterWarrantyYears) },
  { label: "Advance asked", cell: (c) => (c.quote.advancePercent !== null ? `${c.quote.advancePercent}%` : "Not stated"), bad: (c) => (c.quote.advancePercent ?? 0) > 40 },
  { label: "Critical problems", cell: (c) => String(c.criticals), bad: (c) => c.criticals > 0 },
];

function Slot({ index, quote, onChange }: { index: number; quote: Quote | null; onChange: (q: Quote | null) => void }) {
  const letter = SLOTS[index];
  const [status, setStatus] = useState<{ state: "idle" | "busy" | "error"; text?: string }>({ state: "idle" });
  const [paste, setPaste] = useState("");
  const [pasting, setPasting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const run = async (p: Promise<{ fields: Parsed }>) => {
    setStatus({ state: "busy", text: "Reading…" });
    try {
      const r = await p;
      onChange(strip(r.fields));
      setStatus({ state: "idle" });
      setPasting(false);
      setPaste("");
    } catch (e) {
      setStatus({ state: "error", text: (e as Error).message || "Couldn't read that. Try pasting the text." });
    }
  };

  const set = <K extends keyof Quote>(k: K) => (v: Quote[K]) => quote && onChange({ ...quote, [k]: v });

  return (
    <section className="card cslot" aria-label={`Quote ${letter}`} data-testid={`slot-${letter}`}>
      <h2 className="card__title">
        <span>
          <span className="cslot__letter mono">{letter}</span> {quote?.vendorName || `Quote ${letter}`}
        </span>
        {quote && (
          <button type="button" className="icon-btn" aria-label={`Remove quote ${letter}`} onClick={() => onChange(null)}>
            <Trash size={16} />
          </button>
        )}
      </h2>

      {quote ? (
        <div className="cslot__fields">
          <Field label="Quoted size">
            <NumberInput value={quote.systemKw} onChange={set("systemKw")} suffix="kW" step={0.01} />
          </Field>
          <Field label="Total price" hint="incl. GST">
            <NumberInput value={quote.totalPrice} onChange={set("totalPrice")} prefix="₹" step={1000} />
          </Field>
          <p className="small muted">Check the two numbers Chhat read. Everything else is graded as written in the quote.</p>
        </div>
      ) : (
        <div className="cslot__add">
          <button type="button" className="btn btn--sm" onClick={() => fileRef.current?.click()}>
            <FileArrowUp size={16} /> Upload photo or PDF
          </button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf,text/plain" className="sr-only" aria-label={`Upload quote ${letter}`} onChange={(e) => e.target.files?.[0] && run(extractFile("quote", e.target.files[0]))} />
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => setPasting((v) => !v)} aria-expanded={pasting}>
            <ClipboardText size={16} /> Paste text
          </button>
          {pasting && (
            <>
              <textarea className="textarea" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste the quote text here." aria-label={`Quote ${letter} text`} data-lenis-prevent />
              <button type="button" className="btn btn--sm btn--accent" disabled={!paste.trim()} onClick={() => run(extractText("quote", paste))}>
                Read quote {letter}
              </button>
            </>
          )}
          <div className="cslot__samples">
            <span className="small muted">Or a sample:</span>
            {SAMPLE_QUOTES.map((s) => (
              <button key={s.id} type="button" className="chip cslot__sample" onClick={() => run(extractText("quote", s.text))}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {status.state !== "idle" && (
        <p className={`intake__status is-${status.state}`} role="status">
          {status.state === "busy" ? <SpinnerGap size={16} className="spin" /> : <WarningCircle size={16} weight="fill" />} {status.text}
        </p>
      )}
    </section>
  );
}

export default function Compare() {
  const intro = usePageIntro<HTMLDivElement>();
  const [slots, setSlots] = useState<(Quote | null)[]>(() => loadSlots());
  const [loadingSamples, setLoadingSamples] = useState(false);

  useEffect(() => {
    document.title = "Compare quotes · Chhat";
  }, []);
  useEffect(() => saveSlots(slots), [slots]);

  const c = useMemo(() => compareQuotes(slots), [slots]);
  const filled = c.items.length;
  const setSlot = (i: number) => (q: Quote | null) => setSlots((s) => s.map((x, j) => (j === i ? q : x)));

  const loadSamples = async () => {
    setLoadingSamples(true);
    try {
      const read = await Promise.all(SAMPLE_QUOTES.slice(0, SLOTS.length).map((s) => extractText("quote", s.text)));
      setSlots(read.map((r) => strip(r.fields as Parsed)));
    } finally {
      setLoadingSamples(false);
    }
  };

  const best = c.best;
  const leadContext = best ? { stateCode: best.quote.stateCode, kw: best.kwp, grade: best.audit.grade, moneyAtRisk: best.audit.moneyAtRisk || null } : undefined;

  return (
    <div className="page" ref={intro}>
      <header className="wrap page__head">
        <p className="eyebrow">Compare quotes</p>
        <h1 className="page__title">Which quote should you sign?</h1>
        <p className="page__lede">Add up to three installer quotes. Chhat runs the same 14-rule audit on each and lines them up: real size, price against the fair band, subsidy risk, warranties. Saved in this browser, so quotes that arrive on different days still line up.</p>
        <div className="page__meta compare__tools">
          <button type="button" className="btn btn--sm btn--accent" onClick={loadSamples} disabled={loadingSamples}>
            {loadingSamples ? <SpinnerGap size={16} className="spin" /> : null} Try three sample quotes
          </button>
          {filled > 0 && (
            <button type="button" className="btn btn--sm btn--ghost" onClick={() => setSlots(SLOTS.map(() => null))}>
              Clear all
            </button>
          )}
        </div>
      </header>

      <div className="wrap compare">
        <div className="compare__slots">
          {SLOTS.map((_, i) => (
            <Slot key={i} index={i} quote={slots[i]} onChange={setSlot(i)} />
          ))}
        </div>

        {filled >= 2 && (
          <section className={`card pick${c.noneSafe || !best ? " pick--warn" : ""}`} aria-live="polite" data-testid="pick">
            {best && !c.noneSafe ? (
              <>
                <h2 className="pick__title">
                  <Trophy weight="fill" /> Sign with {best.name}
                </h2>
                <ul className="pick__why">
                  {c.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                {c.ask && <p className="pick__ask">{c.ask}</p>}
              </>
            ) : (
              <>
                <h2 className="pick__title">
                  <WarningCircle weight="fill" /> Don't sign any of these yet
                </h2>
                <p>{best ? `The best of them, ${best.name}, is graded ${best.audit.grade}. Ask for a verified quote below, or send each vendor its Quote Check message.` : "Chhat needs the size and total price of at least one quote to grade it."}</p>
              </>
            )}
            {c.whyNot.length > 0 && (
              <div className="pick__not">
                <p className="small muted">Why not the others</p>
                <ul>
                  {c.whyNot.map((w) => (
                    <li key={w.name}>
                      <b>{w.name}:</b> {w.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {filled >= 1 && (
          <section className="card" aria-labelledby="ctable-title">
            <h2 className="card__title" id="ctable-title">
              Side by side
            </h2>
            <div className="ctable__scroll" data-lenis-prevent tabIndex={0} aria-label="Quote comparison table, scrolls sideways on small screens">
              <table className="ctable">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="sr-only">Check</span>
                    </th>
                    {c.items.map((x) => (
                      <th key={x.slot} scope="col" className={x === best && !c.noneSafe ? "is-best" : undefined}>
                        <span className="mono">{SLOTS[x.slot]}</span> {x.name}
                        {x === best && !c.noneSafe && <span className="chip chip--live ctable__badge">Pick</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      {c.items.map((x) => (
                        <td key={x.slot} className={`${x === best && !c.noneSafe ? "is-best" : ""}${r.bad?.(x) ? " is-bad" : ""}`.trim() || undefined}>
                          {r.cell(x)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="small muted ctable__foot">
              Red cells are problems the audit flags. For the full findings and a message to send the vendor, open each quote in <Link to="/quote">Quote Check</Link>.
            </p>
          </section>
        )}

        {(filled < 3 || c.noneSafe || !best) && (
          <LeadForm source="quote" context={leadContext} />
        )}

        {filled === 0 && (
          <p className="small muted compare__empty">
            No quote yet? Size your roof first in the <Link to="/report">Roof Report <ArrowRight size={12} weight="bold" /></Link>
          </p>
        )}
      </div>
    </div>
  );
}
