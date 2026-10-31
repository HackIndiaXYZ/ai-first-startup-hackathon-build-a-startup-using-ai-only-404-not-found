import { SealCheck, SpinnerGap, Wrench } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { extractText } from "../ai/client";
import { SAMPLE_QUOTES } from "../data/samples";
import { rupees } from "../engine/format";
import { EMPTY_QUOTE, type Quote } from "../engine/quoteAudit";
import { precheckQuote } from "../lib/precheck";
import { Findings } from "./Findings";

/**
 * Chhat Pro's quote pre-check: the installer pastes a quote before sending it
 * and sees what the home will see. Same 14 rules; the badge can't be bought.
 */
export function ProCheck() {
  const [text, setText] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const p = useMemo(() => (quote ? precheckQuote(quote) : null), [quote]);
  const toFix = p ? p.fixes.filter((f) => f.severity === "critical" || f.severity === "warn").length || p.fixes.length : 0;

  const check = async (t: string) => {
    setBusy(true);
    setError(null);
    try {
      const r = await extractText("quote", t);
      const { city: _c, ...q } = r.fields as Quote & { city?: string | null };
      void _c;
      setQuote({ ...EMPTY_QUOTE, ...q });
    } catch (e) {
      setError((e as Error).message || "Couldn't read that quote.");
    } finally {
      setBusy(false);
    }
  };

  const pickSample = (id: string) => {
    const s = SAMPLE_QUOTES.find((x) => x.id === id)!;
    setText(s.text);
    void check(s.text);
  };

  return (
    <section className="card procheck" aria-labelledby="procheck-title" data-testid="procheck">
      <h2 className="card__title" id="procheck-title">
        <span>
          <Wrench weight="bold" /> Pre-check a quote before you send it
        </span>
        <span className="chip">Chhat Pro</span>
      </h2>
      <p className="procheck__lede">
        Paste your quotation. Chhat runs the same 14-rule audit the home will run, so you fix it before they see it. Quotes that pass with an A or B, with no critical problem, show the home a "Chhat Verified" badge. Paying for Pro does not change the grade.
      </p>
      <div className="procheck__grid">
        <div className="procheck__in">
          <textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your quote text here." aria-label="Your quote text" data-lenis-prevent />
          <div className="procheck__btns">
            <button type="button" className="btn btn--sm btn--accent" disabled={!text.trim() || busy} onClick={() => check(text)}>
              {busy && <SpinnerGap size={16} className="spin" />} Check my quote
            </button>
            <span className="small muted">Try:</span>
            <button type="button" className="chip procheck__sample" onClick={() => pickSample("fair")}>
              A clean quote
            </button>
            <button type="button" className="chip procheck__sample" onClick={() => pickSample("overcharger")}>
              One that fails
            </button>
          </div>
          {error && (
            <p className="lead__err" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="procheck__out" aria-live="polite">
          {p ? (
            <>
              <div className="procheck__head">
                {p.audit.incomplete && !p.fixes.some((f) => f.severity === "critical") ? (
                  <div className="grade" data-g="none" aria-label="Not graded yet">
                    ?
                  </div>
                ) : (
                  <div className="grade" data-g={p.audit.grade} aria-label={`Grade ${p.audit.grade}`}>
                    {p.audit.grade}
                  </div>
                )}
                <div>
                  {p.verified ? (
                    <p className="procheck__badge" data-testid="verified">
                      <SealCheck weight="fill" /> Chhat Verified
                    </p>
                  ) : (
                    <p className="procheck__fail" data-testid="not-verified">
                      Not verified yet: fix {toFix} thing{toFix === 1 ? "" : "s"}
                    </p>
                  )}
                  <p className="small muted">
                    {p.audit.incomplete ? "Add the system size and total price so the price check can run." : `Score ${p.audit.score}/100.`}
                    {p.audit.moneyAtRisk > 0 && ` The home would see ${rupees(p.audit.moneyAtRisk)} at risk.`}
                  </p>
                </div>
              </div>
              {p.fixes.length > 0 ? <Findings items={p.fixes.slice(0, 5)} showOk={false} /> : <p className="small">Nothing to fix. Send it.</p>}
            </>
          ) : (
            <p className="small muted procheck__empty">The grade, the badge and the list of fixes appear here.</p>
          )}
        </div>
      </div>
    </section>
  );
}
