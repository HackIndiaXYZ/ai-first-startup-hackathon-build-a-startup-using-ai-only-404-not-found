import { Copy, WhatsappLogo } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { detectMode, type Mode } from "../ai/client";
import { parseQuote } from "../ai/parsers";
import { ModeBadge } from "../components/AskChhat";
import { PriceBand } from "../components/charts";
import { DocIntake } from "../components/DocIntake";
import { Findings } from "../components/Findings";
import { Field, NumberInput, Segmented, Select, TextInput, TriState } from "../components/ui";
import { SAMPLE_QUOTES } from "../data/samples";
import { CITIES } from "../engine/climate";
import { rupees } from "../engine/format";
import { auditQuote, EMPTY_QUOTE, negotiationMessage, type Quote as Q, type StructureType } from "../engine/quoteAudit";
import { STATES } from "../engine/states";
import { numParam } from "../lib/params";
import "../styles/tools.css";

const STATE_OPTS = Object.values(STATES)
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((s) => ({ value: s.code, label: s.name }));

export default function Quote() {
  const [params] = useSearchParams();
  const initial = useMemo<{ q: Q; sample?: string }>(() => {
    const sid = params.get("sample") ?? (params.get("kw") ? null : "overcharger");
    const s = SAMPLE_QUOTES.find((x) => x.id === sid);
    if (s) {
      const { city: _c, ...q } = parseQuote(s.text);
      void _c;
      return { q, sample: s.id };
    }
    const state = params.get("state")?.toUpperCase() ?? null;
    return { q: { ...EMPTY_QUOTE, systemKw: numParam(params, "kw", 0.5, 100), stateCode: state && STATES[state] ? state : null } };
  }, [params]);
  const [q, setQ] = useState<Q>(initial.q);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [mode, setMode] = useState<Mode | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Quote Check · Chhat";
    detectMode().then(setMode);
  }, []);

  const a = useMemo(() => auditQuote(q), [q]);
  const msg = useMemo(() => negotiationMessage(q, a, lang), [q, a, lang]);
  const set = <K extends keyof Q>(k: K) => (v: Q[K]) => setQ((p) => ({ ...p, [k]: v }));
  const kwp = a.actualKwp ?? q.systemKw;

  return (
    <div className="page">
      <header className="wrap page__head">
        <p className="eyebrow">Quote Check</p>
        <h1 className="page__title">Is this quote fair?</h1>
        <p className="page__lede">Upload the installer's quotation. Chhat reads it, checks 14 things that cost people money, and writes the reply for you.</p>
        <div className="page__meta">
          <ModeBadge mode={mode} />
        </div>
      </header>

      <div className="wrap audit__grid">
        <div className="audit__form">
          <section className="inbox">
            <h2 className="inbox__title">
              <span className="inbox__n mono">1</span> The quote
            </h2>
            <DocIntake
              kind="quote"
              samples={SAMPLE_QUOTES}
              activeSample={initial.sample}
              onFields={(f) => {
                const { city: _c, ...rest } = f as Q & { city: string | null };
                void _c;
                setQ({ ...EMPTY_QUOTE, ...rest });
              }}
            />
          </section>

          <section className="inbox">
            <h2 className="inbox__title">
              <span className="inbox__n mono">2</span> Check what Chhat read
            </h2>
            <fieldset className="fieldset">
              <legend>System and price</legend>
              <div className="fields2">
                <Field label="Vendor">
                  <TextInput value={q.vendorName} onChange={set("vendorName")} />
                </Field>
                <Field label="State">
                  <Select value={q.stateCode ?? "DL"} onChange={set("stateCode")} options={STATE_OPTS} />
                </Field>
                <Field label="Quoted size">
                  <NumberInput value={q.systemKw} onChange={set("systemKw")} suffix="kW" step={0.01} />
                </Field>
                <Field label="Total price" hint="incl. GST">
                  <NumberInput value={q.totalPrice} onChange={set("totalPrice")} prefix="₹" step={1000} />
                </Field>
                <Field label="GST rate charged">
                  <NumberInput value={q.gstPercent} onChange={set("gstPercent")} suffix="%" step={0.1} placeholder="not stated" />
                </Field>
                <Field label="Advance asked">
                  <NumberInput value={q.advancePercent} onChange={set("advancePercent")} suffix="%" placeholder="not stated" />
                </Field>
              </div>
            </fieldset>
            <fieldset className="fieldset">
              <legend>Panels</legend>
              <div className="fields2">
                <Field label="Panel wattage">
                  <NumberInput value={q.panelWatt} onChange={set("panelWatt")} suffix="Wp" />
                </Field>
                <Field label="Number of panels">
                  <NumberInput value={q.panelCount} onChange={set("panelCount")} suffix="nos" />
                </Field>
              </div>
              <Field label="DCR (made-in-India) panels?">
                <TriState value={q.dcr} onChange={set("dcr")} />
              </Field>
              <Field label="Cells from an ALMM List-II maker?">
                <TriState value={q.almmCells} onChange={set("almmCells")} />
              </Field>
              <div className="fields2">
                <Field label="Product warranty">
                  <NumberInput value={q.panelProductWarrantyYears} onChange={set("panelProductWarrantyYears")} suffix="yrs" />
                </Field>
                <Field label="Performance warranty">
                  <NumberInput value={q.panelPerformanceYears} onChange={set("panelPerformanceYears")} suffix="yrs" />
                </Field>
              </div>
            </fieldset>
            <fieldset className="fieldset">
              <legend>Inverter</legend>
              <div className="fields2">
                <Field label="Inverter size">
                  <NumberInput value={q.inverterKw} onChange={set("inverterKw")} suffix="kW" step={0.1} />
                </Field>
                <Field label="Inverter warranty">
                  <NumberInput value={q.inverterWarrantyYears} onChange={set("inverterWarrantyYears")} suffix="yrs" />
                </Field>
              </div>
              <Field label="Online monitoring?">
                <TriState value={q.monitoring} onChange={set("monitoring")} />
              </Field>
            </fieldset>
            <fieldset className="fieldset">
              <legend>Structure, safety, service</legend>
              <Field label="Mounting structure">
                <Segmented<StructureType>
                  value={q.structure}
                  onChange={set("structure")}
                  options={[
                    { value: "hdg", label: "Hot-dip GI" },
                    { value: "zam", label: "ZAM" },
                    { value: "aluminium", label: "Aluminium" },
                    { value: "ms-painted", label: "Painted MS" },
                    { value: "unknown", label: "Not stated" },
                  ]}
                />
              </Field>
              <Field label="Earthing included?">
                <TriState value={q.earthing} onChange={set("earthing")} />
              </Field>
              <Field label="Lightning arrester included?">
                <TriState value={q.lightningArrester} onChange={set("lightningArrester")} />
              </Field>
              <Field label="Net meter and DISCOM fees included?">
                <TriState value={q.netMeterIncluded} onChange={set("netMeterIncluded")} />
              </Field>
              <Field label="System warranty + maintenance">
                <NumberInput value={q.systemWarrantyYears} onChange={set("systemWarrantyYears")} suffix="yrs" placeholder="not stated" />
              </Field>
              <Field label="Grievance contact named?">
                <TriState value={q.grievanceOfficer} onChange={set("grievanceOfficer")} />
              </Field>
            </fieldset>
          </section>
        </div>

        <div className="audit__results" aria-live="polite">
          <section className="verdict">
            {a.incomplete && a.findings.every((x) => x.severity !== "critical") ? (
              <div className="grade" data-g="none" aria-label="Not graded yet">
                ?
              </div>
            ) : (
              <div className="grade" data-g={a.grade} aria-label={`Grade ${a.grade}`}>
                {a.grade}
              </div>
            )}
            <div>
              <h2 className="verdict__title">{a.verdict}</h2>
              <p className="verdict__sub">
                {a.incomplete ? "Chhat needs the system size and total price to grade the deal. " : `Score ${a.score}/100. `}
                {a.incomplete && a.moneyAtRisk === 0 ? null : a.moneyAtRisk > 0 ? (
                  <>
                    Money at risk: <span className="verdict__risk">{rupees(a.moneyAtRisk)}</span>
                  </>
                ) : (
                  "No money at risk found."
                )}
              </p>
            </div>
          </section>

          {a.band && q.totalPrice && kwp ? (
            <section className="card">
              <h2 className="card__title">
                Price for {kwp.toFixed(2)} kWp
                <span className="muted small">{a.pricePerKw ? `${rupees(a.pricePerKw)}/kW` : ""}</span>
              </h2>
              <PriceBand low={a.band.low} high={a.band.high} value={q.totalPrice} />
            </section>
          ) : null}

          <section className="card">
            <h2 className="card__title">What Chhat found</h2>
            <Findings items={a.findings} />
          </section>

          <section className="card">
            <h2 className="card__title">
              Send this to the vendor
              <Segmented
                value={lang}
                onChange={setLang}
                options={[
                  { value: "en", label: "English" },
                  { value: "hi", label: "हिंदी" },
                ]}
              />
            </h2>
            <div className={`msgbox${lang === "hi" ? " msgbox--hi" : ""}`} data-lenis-prevent tabIndex={0} aria-label="Message to the vendor">
              {msg}
            </div>
            <div className="actions" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="btn btn--sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(msg);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    /* clipboard blocked */
                  }
                }}
              >
                <Copy size={16} /> {copied ? "Copied" : "Copy message"}
              </button>
              <a className="btn btn--sm btn--ghost" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer">
                <WhatsappLogo size={16} /> WhatsApp
              </a>
              {kwp ? (
                <Link className="btn btn--sm btn--ghost" to={`/report?city=${encodeURIComponent(CITIES.find((c) => c.state === (q.stateCode ?? "DL"))?.name ?? "Delhi")}&panels=${Math.max(2, Math.round((kwp * 1000) / 545))}${q.totalPrice ? `&price=${q.totalPrice}` : ""}`}>
                  See payback at this price
                </Link>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
