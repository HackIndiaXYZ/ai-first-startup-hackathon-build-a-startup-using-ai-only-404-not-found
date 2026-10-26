import { Copy, DownloadSimple } from "@phosphor-icons/react";
import { usePageIntro } from "../lib/motion";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { detectMode, type Mode } from "../ai/client";
import { parseSolarBill, type ParsedSolarBill } from "../ai/parsers";
import { ModeBadge } from "../components/AskChhat";
import { DocIntake } from "../components/DocIntake";
import { Findings } from "../components/Findings";
import { Field, NumberInput, Select, TextInput } from "../components/ui";
import { SAMPLE_SOLAR_BILLS } from "../data/samples";
import { auditBill, complaintLetter, EMPTY_BILL, type SolarBill } from "../engine/billAudit";
import { CITIES, cityByName, climateFromCity } from "../engine/climate";
import { num, rupees } from "../engine/format";
import { monthlyEnergy } from "../engine/pv";
import { stateInfo } from "../engine/states";
import { MONTHS } from "../engine/types";
import "../styles/tools.css";

export default function Bill() {
  const intro = usePageIntro<HTMLDivElement>();
  const [params] = useSearchParams();
  const init = useMemo(() => {
    const s = SAMPLE_SOLAR_BILLS.find((x) => x.id === (params.get("sample") ?? "import-billed"));
    if (!s) return null;
    return { parsed: parseSolarBill(s.text), sample: s.id, city: s.city };
  }, [params]);
  const [bill, setBill] = useState<SolarBill>(init?.parsed ?? EMPTY_BILL);
  const [city, setCity] = useState(init?.city ?? "Delhi");
  const [kwp, setKwp] = useState<number>(init?.parsed.systemKwp ?? 3.27);
  const [mode, setMode] = useState<Mode | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = "Bill Audit · Chhat";
    detectMode().then(setMode);
  }, []);

  const c = cityByName(city) ?? CITIES[0];
  const month = bill.billMonth ?? new Date().getMonth();
  const expected = useMemo(() => monthlyEnergy(climateFromCity(c), kwp)[month], [c, kwp, month]);
  const ctx = useMemo(() => ({ systemKwp: kwp, expectedGeneration: expected, tariff: stateInfo(c.state).tariff }), [kwp, expected, c.state]);
  const a = useMemo(() => auditBill(bill, ctx), [bill, ctx]);
  const letter = useMemo(() => complaintLetter(bill, a, ctx), [bill, a, ctx]);
  const set = <K extends keyof SolarBill>(k: K) => (v: SolarBill[K]) => setBill((p) => ({ ...p, [k]: v }));
  const billedBad = a.expectedNetUnits !== null && bill.netUnitsBilled !== null && bill.netUnitsBilled > a.expectedNetUnits + 2;

  return (
    <div className="page" ref={intro}>
      <header className="wrap page__head">
        <p className="eyebrow">Bill Audit · after you go solar</p>
        <h1 className="page__title">Is your DISCOM billing you right?</h1>
        <p className="page__lede">
          In July 2026 MNRE said it had received multiple complaints of wrong bills after rooftop installs. Chhat checks the meter arithmetic against what your roof should make, and drafts the correction letter.
        </p>
        <div className="page__meta">
          <ModeBadge mode={mode} />
        </div>
      </header>

      <div className="wrap audit__grid">
        <div className="audit__form">
          <section className="inbox">
            <h2 className="inbox__title">
              <span className="inbox__n mono">1</span> Your post-solar bill
            </h2>
            <DocIntake
              kind="solar-bill"
              samples={SAMPLE_SOLAR_BILLS}
              activeSample={init?.sample}
              onFields={(f, meta) => {
                const p = f as ParsedSolarBill;
                const { systemKwp, stateCode, city: pc, ...rest } = p;
                setBill({ ...EMPTY_BILL, ...rest });
                if (systemKwp) setKwp(systemKwp);
                const name = meta.city ?? pc ?? CITIES.find((x) => x.state === stateCode)?.name;
                if (name && cityByName(name)) setCity(name);
              }}
            />
          </section>

          <section className="inbox">
            <h2 className="inbox__title">
              <span className="inbox__n mono">2</span> Check what Chhat read
            </h2>
            <fieldset className="fieldset">
              <legend>Your system</legend>
              <div className="fields2">
                <Field label="City">
                  <Select value={city} onChange={setCity} options={CITIES.map((x) => ({ value: x.name, label: x.name }))} />
                </Field>
                <Field label="System size">
                  <NumberInput value={kwp} onChange={(v) => setKwp(v ?? 0)} suffix="kWp" step={0.01} />
                </Field>
                <Field label="Bill month">
                  <Select value={String(month)} onChange={(v) => set("billMonth")(Number(v))} options={MONTHS.map((m, i) => ({ value: String(i), label: m }))} />
                </Field>
                <Field label="Expected generation" hint="Chhat's model">
                  <div className="input-wrap">
                    <input readOnly value={num(expected)} aria-label="Expected generation" />
                    <span className="affix">kWh</span>
                  </div>
                </Field>
              </div>
            </fieldset>
            <fieldset className="fieldset">
              <legend>Meter readings on the bill</legend>
              <div className="fields2">
                <Field label="Import (from grid)">
                  <NumberInput value={bill.importUnits} onChange={set("importUnits")} suffix="kWh" />
                </Field>
                <Field label="Export (to grid)">
                  <NumberInput value={bill.exportUnits} onChange={set("exportUnits")} suffix="kWh" />
                </Field>
                <Field label="Credit carried in">
                  <NumberInput value={bill.previousCredit} onChange={set("previousCredit")} suffix="kWh" placeholder="0" />
                </Field>
                <Field label="Units billed">
                  <NumberInput value={bill.netUnitsBilled} onChange={set("netUnitsBilled")} suffix="kWh" />
                </Field>
              </div>
            </fieldset>
            <fieldset className="fieldset">
              <legend>Charges</legend>
              <div className="fields2">
                <Field label="Energy charges">
                  <NumberInput value={bill.energyCharges} onChange={set("energyCharges")} prefix="₹" />
                </Field>
                <Field label="Fixed charges">
                  <NumberInput value={bill.fixedCharges} onChange={set("fixedCharges")} prefix="₹" />
                </Field>
                <Field label="Other charges">
                  <NumberInput value={bill.otherCharges} onChange={set("otherCharges")} prefix="₹" placeholder="0" />
                </Field>
                <Field label="…labelled as">
                  <TextInput value={bill.otherChargesLabel} onChange={set("otherChargesLabel")} placeholder="e.g. Misc. adjustment" />
                </Field>
              </div>
            </fieldset>
            <fieldset className="fieldset">
              <legend>For the letter</legend>
              <div className="fields2">
                <Field label="Your name">
                  <TextInput value={bill.consumerName} onChange={set("consumerName")} />
                </Field>
                <Field label="Consumer / account no.">
                  <TextInput value={bill.consumerNumber} onChange={set("consumerNumber")} />
                </Field>
              </div>
              <Field label="DISCOM">
                <TextInput value={bill.discom} onChange={set("discom")} />
              </Field>
            </fieldset>
          </section>
        </div>

        <div className="audit__results" aria-live="polite">
          <section className="verdict">
            <div className="grade" data-g={a.findings.some((f) => f.severity === "critical") ? "F" : a.findings.some((f) => f.severity === "warn") ? "C" : a.incomplete ? "none" : "A"} aria-hidden="true">
              {a.findings.some((f) => f.severity === "critical") ? "✕" : a.findings.some((f) => f.severity === "warn") || a.incomplete ? "?" : "✓"}
            </div>
            <div>
              <h2 className="verdict__title">{a.verdict}</h2>
              <p className="verdict__sub">
                {a.overbilled > 0 ? (
                  <>
                    Possibly overbilled: <span className="verdict__risk">{rupees(a.overbilled)}</span> this cycle
                  </>
                ) : (
                  "No overbilling found in this cycle."
                )}
              </p>
            </div>
          </section>

          <section className="card">
            <h2 className="card__title">The meter arithmetic</h2>
            <div className="meter-eq">
              <span>
                <span className="meter-eq__v">{bill.importUnits ?? "—"}</span>
                <span className="meter-eq__l">import</span>
              </span>
              <span>
                <span className="meter-eq__v">− {bill.exportUnits ?? "—"}</span>
                <span className="meter-eq__l">export</span>
              </span>
              <span>
                <span className="meter-eq__v">− {bill.previousCredit ?? 0}</span>
                <span className="meter-eq__l">credit</span>
              </span>
              <span>
                <span className="meter-eq__v meter-eq__ok">= {a.expectedNetUnits ?? "—"}</span>
                <span className="meter-eq__l">should be billed</span>
              </span>
              <span>
                <span className={`meter-eq__v ${billedBad ? "meter-eq__bad" : ""}`}>{bill.netUnitsBilled ?? "—"}</span>
                <span className="meter-eq__l">actually billed</span>
              </span>
            </div>
          </section>

          <section className="card">
            <h2 className="card__title">What Chhat found</h2>
            <Findings items={a.findings} />
          </section>

          {a.findings.some((f) => f.severity === "critical" || f.severity === "warn") && (
            <section className="card">
              <h2 className="card__title">Correction letter</h2>
              <pre className="letter" data-lenis-prevent tabIndex={0} aria-label="Correction letter">
                {letter}
              </pre>
              <div className="actions" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="btn btn--sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(letter);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch {
                      /* clipboard blocked */
                    }
                  }}
                >
                  <Copy size={16} /> {copied ? "Copied" : "Copy letter"}
                </button>
                <a className="btn btn--sm btn--ghost" download="discom-correction-letter.txt" href={`data:text/plain;charset=utf-8,${encodeURIComponent(letter)}`}>
                  <DownloadSimple size={16} /> Download .txt
                </a>
              </div>
            </section>
          )}

          <section className="card">
            <h2 className="card__title">If they don't fix it</h2>
            <ol className="escalate">
              <li>
                <div>
                  <b>DISCOM sub-division</b>
                  <span>Send the letter, keep the acknowledgement. Ask for a meter reading check.</span>
                </div>
              </li>
              <li>
                <div>
                  <b>Consumer Grievance Redressal Forum (CGRF)</b>
                  <span>If there's no fix in 30 days. Free, and set up under your State Electricity Regulatory Commission.</span>
                </div>
              </li>
              <li>
                <div>
                  <b>Electricity Ombudsman</b>
                  <span>If the CGRF order doesn't resolve it.</span>
                </div>
              </li>
              <li>
                <div>
                  <b>PM Surya Ghar portal grievance</b>
                  <span>In parallel, so the scheme sees net-metering failures in your district.</span>
                </div>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
