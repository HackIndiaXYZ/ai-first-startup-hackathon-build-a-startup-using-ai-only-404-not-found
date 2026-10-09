import { ArrowRight, Crosshair, DownloadSimple, LinkSimple, Printer, ShareNetwork, Sun } from "@phosphor-icons/react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { detectMode, type Mode } from "../ai/client";
import { parseBill, type ParsedBill } from "../ai/parsers";
import { ModeBadge } from "../components/AskChhat";
import { CashflowChart, MonthlyChart } from "../components/charts";
import { DocIntake, type IntakeMeta } from "../components/DocIntake";
import { Field, NumberInput, Segmented, Select, Slider, SourceTip, Stat } from "../components/ui";
import { SAMPLE_BILLS } from "../data/samples";
import { CITIES, CLIMATE_SOURCE, cityByName, climateFromCity, fetchClimate, nearestCity } from "../engine/climate";
import { FINANCE_DEFAULTS } from "../engine/finance";
import { kw, num, rupees, rupeesShort, years } from "../engine/format";
import { instantOutput, PV_DEFAULTS, defaultTilt, type Shading } from "../engine/pv";
import { buildReport, GRID_EMISSION_T_PER_MWH, KG_CO2_PER_TREE_YEAR } from "../engine/report";
import { formatClock, REP_DAY, sunPosition, sunTimes } from "../engine/solar";
import { SUBSIDY_SOURCE } from "../engine/subsidy";
import { MONTHS, type Climate } from "../engine/types";
import { hasWebGL, isLowPower } from "../lib/env";
import { roofFromArea } from "../three/layout";
import { makeSceneState } from "../three/RoofScene";
import "../styles/tools.css";

const RoofScene = lazy(() => import("../three/RoofScene"));

const STEPS = [
  { t: "Register on pmsuryaghar.gov.in", d: "State, DISCOM, consumer number and mobile. Takes five minutes." },
  { t: "Apply for rooftop solar", d: "Your DISCOM checks technical feasibility, usually within a few days to weeks." },
  { t: "Pick a registered vendor", d: "Only vendors registered for your DISCOM qualify. Run their quote through Quote Check first." },
  { t: "Install and apply for the net meter", d: "Installation takes 1 to 3 days. Upload plant details on the portal." },
  { t: "Inspection and commissioning", d: "The DISCOM installs the net meter and inspects. The portal issues a commissioning certificate." },
  { t: "Claim the subsidy", d: "Add bank details and a cancelled cheque. Central subsidy usually arrives within ~30 days." },
  { t: "Audit your first bills", d: "Check that export is counted. Wrong bills after solar are common, and Bill Audit drafts the fix." },
];

export default function Report() {
  const [params, setParams] = useSearchParams();
  const initialCity = cityByName(params.get("city") ?? "") ?? cityByName("Delhi")!;
  const [cityName, setCityName] = useState(initialCity.name);
  const [cityClimate, setCityClimate] = useState<Climate>(climateFromCity(initialCity));
  const [exact, setExact] = useState<Climate | null>(null);
  const climate = exact ?? cityClimate;
  const [units, setUnits] = useState<number>(Number(params.get("units")) || 450);
  const [billMonth, setBillMonth] = useState<number>(params.get("month") ? Number(params.get("month")) - 1 : new Date().getMonth());
  const [periodMonths, setPeriodMonths] = useState<1 | 2>(params.get("period") === "2" ? 2 : 1);
  const [tariff, setTariff] = useState<number | null>(params.get("tariff") ? Number(params.get("tariff")) : null);
  const [load, setLoad] = useState<number | null>(params.get("load") ? Number(params.get("load")) : null);
  const [roofArea, setRoofArea] = useState<number>(Number(params.get("roof")) || 900);
  const [shading, setShading] = useState<Shading>((params.get("shade") as Shading) || "none");
  const [panels, setPanels] = useState<number | null>(params.get("panels") ? Number(params.get("panels")) : null);
  const [price, setPrice] = useState<number | null>(params.get("price") ? Number(params.get("price")) : null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [intakeNote, setIntakeNote] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [hour, setHour] = useState(12.5);
  const [simMonth, setSimMonth] = useState(3);
  const [copied, setCopied] = useState(false);
  const gl = useMemo(hasWebGL, []);
  const low = useMemo(isLowPower, []);
  const sceneWrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Roof Report · Chhat";
    detectMode().then(setMode);
  }, []);

  // Refresh climate live from NASA for the chosen city (falls back silently).
  useEffect(() => {
    const c = cityByName(cityName);
    if (!c) return;
    setCityClimate((prev) => (prev.label === c.name ? prev : climateFromCity(c)));
    let live = true;
    fetchClimate(c.lat, c.lon, c.name).then((cl) => live && setCityClimate(cl));
    return () => {
      live = false;
    };
  }, [cityName]);

  const applyBill = useCallback((b: ParsedBill, meta?: IntakeMeta) => {
    if (b.units) setUnits(Math.round(b.units));
    if (b.billMonth !== null) setBillMonth(b.billMonth);
    setPeriodMonths(b.periodMonths);
    setTariff(b.tariff);
    if (b.sanctionedLoadKw) setLoad(b.sanctionedLoadKw);
    const city = meta?.city ?? b.city;
    if (city && cityByName(city)) {
      setExact(null);
      setCityName(city);
    }
    else if (b.stateCode) {
      const c = CITIES.find((x) => x.state === b.stateCode);
      if (c) setCityName(c.name);
    }
    setPanels(null);
    setIntakeNote(
      `${b.units ?? "?"} units${b.billMonth !== null ? ` in ${MONTHS[b.billMonth]}` : ""}${b.periodMonths === 2 ? " (2-month bill)" : ""}${b.tariff ? ` at ₹${b.tariff.toFixed(2)}/unit` : ""}${b.sanctionedLoadKw ? `, ${b.sanctionedLoadKw} kW load` : ""}`,
    );
  }, []);

  // ?sample= from the landing page: read the sample on-device immediately.
  useEffect(() => {
    const id = params.get("sample");
    const s = SAMPLE_BILLS.find((x) => x.id === id);
    if (s) applyBill(parseBill(s.text), { mode: "local", method: "text-rules", sampleId: s.id, city: s.city });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const report = useMemo(
    () =>
      buildReport({
        climate,
        units: Math.max(10, units || 0),
        billMonth,
        periodMonths,
        tariff: tariff ?? undefined,
        roofAreaSqft: roofArea,
        shading,
        sanctionedLoadKw: load ?? undefined,
        overridePanels: panels ?? undefined,
        grossCost: price ?? undefined,
      }),
    [climate, units, billMonth, periodMonths, tariff, roofArea, shading, load, panels, price],
  );

  // Chhat's own recommendation, independent of the slider.
  const recommended = useMemo(
    () =>
      buildReport({
        climate,
        units: Math.max(10, units || 0),
        billMonth,
        periodMonths,
        tariff: tariff ?? undefined,
        roofAreaSqft: roofArea,
        shading,
        sanctionedLoadKw: load ?? undefined,
      }).panels,
    [climate, units, billMonth, periodMonths, tariff, roofArea, shading, load],
  );

  // Keep the URL shareable.
  useEffect(() => {
    const t = setTimeout(() => {
      const p: Record<string, string> = { city: cityName, units: String(units), month: String(billMonth + 1), roof: String(roofArea) };
      if (periodMonths === 2) p.period = "2";
      if (tariff) p.tariff = String(tariff);
      if (load) p.load = String(load);
      if (shading !== "none") p.shade = shading;
      if (panels) p.panels = String(panels);
      if (price) p.price = String(price);
      setParams(p, { replace: true });
    }, 400);
    return () => clearTimeout(t);
  }, [cityName, units, billMonth, periodMonths, tariff, load, roofArea, shading, panels, price, setParams]);

  // 3D scene state
  const scene = useRef(makeSceneState({ lat: climate.lat, lon: climate.lon, panels: report.panels, drop: 1, hour, doy: REP_DAY[simMonth] }));
  useEffect(() => {
    Object.assign(scene.current, { lat: climate.lat, lon: climate.lon, panels: report.panels, hour, doy: REP_DAY[simMonth] });
  }, [climate, report.panels, hour, simMonth]);
  const roof = useMemo(() => roofFromArea(roofArea, 2), [roofArea]);
  const sunNow = sunPosition(climate.lat, climate.lon, REP_DAY[simMonth], hour);
  const times = sunTimes(climate.lat, climate.lon, REP_DAY[simMonth]);
  const liveKw = instantOutput(climate, report.kwp, simMonth, sunNow.elevation, times.sunset - times.sunrise);

  const maxPanels = Math.max(report.sizing.panels + 4, Math.min(36, Math.floor((report.sizing.roofMaxKw * 1000) / 545) + 1));
  const s = report;
  const st = s.state;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  const roofCard = async () => {
    const W = 1200;
    const H = 630;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d")!;
    g.fillStyle = "#121a33";
    g.fillRect(0, 0, W, H);
    const gl3 = sceneWrap.current?.querySelector("canvas");
    if (gl3) {
      try {
        g.drawImage(gl3, 0, 0, gl3.width, gl3.height, 0, 0, 640, 630);
      } catch {
        /* tainted canvas: skip */
      }
    }
    g.fillStyle = "#f2b632";
    g.beginPath();
    g.arc(700, 92, 22, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#eef1f7";
    g.font = "700 30px Archivo Variable, Archivo, sans-serif";
    g.fillText("chhat", 734, 102);
    g.font = "600 22px Archivo Variable, sans-serif";
    g.fillStyle = "rgba(238,241,247,0.7)";
    g.fillText(`My roof in ${climate.label}`, 680, 190);
    g.fillStyle = "#eef1f7";
    g.font = "700 64px Archivo Variable, sans-serif";
    g.fillText(`${num(s.annualGeneration)} units`, 680, 262);
    g.font = "500 24px Archivo Variable, sans-serif";
    g.fillStyle = "rgba(238,241,247,0.75)";
    g.fillText(`a year from ${s.kwp.toFixed(2)} kWp (${s.panels} panels)`, 680, 300);
    g.fillStyle = "#f2b632";
    g.font = "700 46px Archivo Variable, sans-serif";
    g.fillText(`${rupees(s.net.savings)} / year`, 680, 390);
    g.fillStyle = "rgba(238,241,247,0.75)";
    g.font = "500 24px Archivo Variable, sans-serif";
    g.fillText(`Pays back in ${years(s.payback)} · subsidy ${rupees(s.subsidy.total)}`, 680, 430);
    g.fillText(`${s.co2TonnesYear.toFixed(1)} t CO₂ avoided every year`, 680, 466);
    g.font = "400 18px Geist Mono, monospace";
    g.fillStyle = "rgba(238,241,247,0.5)";
    g.fillText("Estimates from NASA POWER + PM Surya Ghar rules", 680, 580);
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/png"));
    if (!blob) return;
    const file = new File([blob], "my-roof-chhat.png", { type: "image/png" });
    const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({ files: [file], text: `My roof can make ${num(s.annualGeneration)} units a year. Check yours: ${shareUrl}` });
        return;
      } catch {
        /* fall back to download */
      }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-roof-chhat.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <div className="page report">
      <header className="wrap page__head">
        <p className="eyebrow">Roof Report · छत रिपोर्ट</p>
        <h1 className="page__title">What your roof is worth.</h1>
        <p className="page__lede">Change anything on the left and every number updates. Drag the roof to look around, and scrub the sun across your sky.</p>
        <div className="page__meta">
          <ModeBadge mode={mode} />
          <span className={`chip ${climate.source === "nasa-live" ? "chip--live" : ""}`}>
            <span className="dot" /> NASA POWER · {climate.source === "nasa-live" ? "live" : "bundled"} · {climate.label}
          </span>
        </div>
      </header>

      {/* 3D stage */}
      <section className="wrap">
        <div className="stage" ref={sceneWrap}>
          {gl ? (
            <Suspense fallback={<div className="stage__poster" />}>
              <RoofScene state={scene} roof={roof} interactive panelsKey={s.panels} lowPower={low} cameraPosition={[15, 17, 19]} />
            </Suspense>
          ) : (
            <div className="stage__poster stage__poster--msg">3D view needs WebGL. Every number below still works.</div>
          )}
          <div className="stage__meter">
            <span className="eyebrow">Output now</span>
            <span className="stage__kw mono">{liveKw.toFixed(2)} kW</span>
            <span className="stage__sub mono">
              {formatClock(hour)} · {MONTHS[simMonth]} · sun {Math.max(0, sunNow.elevation).toFixed(0)}°
            </span>
          </div>
          <div className="stage__controls">
            <label className="stage__ctl">
              <span className="mono">
                <Sun size={14} weight="bold" /> {formatClock(hour)} IST
              </span>
              <Slider dark value={hour} min={5} max={20} step={0.05} onChange={setHour} ariaLabel="Time of day" />
            </label>
            <label className="stage__ctl">
              <span className="mono">{MONTHS[simMonth]}</span>
              <Slider dark value={simMonth} min={0} max={11} step={1} onChange={setSimMonth} ariaLabel="Month" />
            </label>
          </div>
          <span className="stage__tag mono">
            {s.panels} × 545 W · tilt {defaultTilt(climate.lat)}° south
          </span>
        </div>
      </section>

      <div className="wrap report__grid">
        {/* ------------------------------ inputs */}
        <aside className="report__inputs" aria-label="Your details">
          <section className="inbox">
            <h2 className="inbox__title">
              <span className="inbox__n mono">1</span> Where's the roof?
            </h2>
            <Field label="City" htmlFor="city">
              <Select id="city" value={cityName} onChange={(v) => { setExact(null); setCityName(v); }} options={CITIES.map((c) => ({ value: c.name, label: `${c.name}` }))} />
            </Field>
            <button
              type="button"
              className="btn btn--sm btn--ghost"
              disabled={locating}
              onClick={() => {
                if (!navigator.geolocation) return;
                setLocating(true);
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    const near = nearestCity(pos.coords.latitude, pos.coords.longitude);
                    const cl = await fetchClimate(pos.coords.latitude, pos.coords.longitude, `Your location (near ${near.name})`);
                    setCityName(near.name);
                    setExact(cl);
                    setLocating(false);
                  },
                  () => setLocating(false),
                  { timeout: 8000 },
                );
              }}
            >
              <Crosshair size={16} /> {locating ? "Locating…" : "Use my exact location"}
            </button>
          </section>

          <section className="inbox">
            <h2 className="inbox__title">
              <span className="inbox__n mono">2</span> Your electricity bill
            </h2>
            <DocIntake
              kind="bill"
              samples={SAMPLE_BILLS}
              defaultTab={params.get("sample") ? "sample" : "manual"}
              activeSample={params.get("sample") ?? undefined}
              onFields={(f, meta) => applyBill(f as ParsedBill, meta)}
              manual={<p className="muted">Edit the fields below directly.</p>}
            />
            {intakeNote && <p className="intake__note mono">Read: {intakeNote}</p>}
            <div className="fields2">
              <Field label="Units on the bill" htmlFor="units" hint={periodMonths === 2 ? "2 months" : "1 month"}>
                <NumberInput id="units" value={units} onChange={(v) => setUnits(v ?? 0)} suffix="kWh" min={0} />
              </Field>
              <Field label="Bill month" htmlFor="bm">
                <Select id="bm" value={String(billMonth)} onChange={(v) => setBillMonth(Number(v))} options={MONTHS.map((m, i) => ({ value: String(i), label: m }))} />
              </Field>
              <Field label="Rate per unit" htmlFor="tariff" hint={tariff ? "from bill" : `${st.name} default`}>
                <NumberInput id="tariff" value={tariff ?? st.tariff} onChange={(v) => setTariff(v)} prefix="₹" suffix="/kWh" step={0.1} />
              </Field>
              <Field label="Sanctioned load" htmlFor="load" hint="optional">
                <NumberInput id="load" value={load} onChange={setLoad} suffix="kW" step={0.5} placeholder="—" />
              </Field>
            </div>
            <Segmented
              ariaLabel="Billing period"
              value={String(periodMonths)}
              onChange={(v) => setPeriodMonths(v === "2" ? 2 : 1)}
              options={[
                { value: "1", label: "Monthly bill" },
                { value: "2", label: "Two-month bill" },
              ]}
            />
            {st.note && <p className="muted small">{st.note}</p>}
          </section>

          <section className="inbox">
            <h2 className="inbox__title">
              <span className="inbox__n mono">3</span> The roof
            </h2>
            <Field label="Open roof area" hint={`${num(roofArea)} sq ft · fits ~${s.sizing.roofMaxKw.toFixed(1)} kW`}>
              <Slider value={roofArea} min={200} max={3000} step={50} onChange={(v) => setRoofArea(v)} ariaLabel="Roof area in square feet" />
            </Field>
            <Field label="Shade in the middle of the day">
              <Segmented
                value={shading}
                onChange={(v) => setShading(v)}
                options={[
                  { value: "none", label: "None" },
                  { value: "some", label: "Some" },
                  { value: "heavy", label: "Heavy" },
                ]}
              />
            </Field>
          </section>

          <section className="inbox">
            <h2 className="inbox__title">
              <span className="inbox__n mono">4</span> Price
            </h2>
            <Field label="Quoted price, if you have one" hint={`fair: ${rupeesShort(s.price.low)}–${rupeesShort(s.price.high)}`}>
              <NumberInput value={price} onChange={setPrice} prefix="₹" placeholder={num(s.price.mid)} step={1000} />
            </Field>
            <p className="muted small">Leave blank to use Chhat's fair mid-market price for {s.kwp.toFixed(2)} kWp with DCR panels.</p>
          </section>
        </aside>

        {/* ------------------------------ results */}
        <div className="report__results" aria-live="polite">
          <section className="kpis">
            <Stat label="System" value={kw(s.kwp)} hint={`${s.panels} panels · ${s.sizing.limitedBy === "consumption" ? "sized to your use" : s.sizing.limitedBy === "roof" ? "limited by roof" : "limited by load"}`} />
            <Stat label="Makes a year" value={`${num(s.annualGeneration)}`} hint={`units · covers ${Math.round(s.net.coverage * 100)}% of use`} />
            <Stat label="Saves a year" hi="बचत" value={rupees(s.net.savings)} hint={`≈ ${rupees(s.monthlySavingAvg)} a month`} />
            <Stat label="Pays back" value={years(s.payback)} hint={`IRR ${s.irr ? (s.irr * 100).toFixed(0) : "—"}%`} />
          </section>

          <section className="card">
            <h2 className="card__title">
              Panels
              <span className="muted small">Chhat recommends {recommended}</span>
            </h2>
            <div className="sizer">
              <Slider value={s.panels} min={2} max={maxPanels} step={1} onChange={(v) => setPanels(v)} ariaLabel="Number of panels" />
              <div className="sizer__row mono">
                <span>{s.panels} × 545 W = {s.kwp.toFixed(2)} kWp</span>
                {panels !== null && (
                  <button type="button" className="link-btn" onClick={() => setPanels(null)}>
                    reset to recommended
                  </button>
                )}
              </div>
              {panels === null && recommended > s.sizing.panels && (
                <p className="tip-inline">Your use alone needs {s.sizing.panels} panels. Chhat adds {recommended - s.sizing.panels} because the extra subsidy and banked units pay for {recommended - s.sizing.panels > 1 ? "them" : "it"} over 25 years.</p>
              )}
              {s.kwp < 3 && s.kwp + 0.545 >= 3 && <p className="tip-inline">One more panel crosses 3 kW and unlocks the full central subsidy ({rupees(78000)} cap).</p>}
            </div>
          </section>

          <section className="card">
            <h2 className="card__title">
              Month by month
              <SourceTip label={CLIMATE_SOURCE.label} url={CLIMATE_SOURCE.url} />
            </h2>
            <MonthlyChart consumption={s.consumption} generation={s.generation} billed={s.net.billedUnits} />
            <p className="muted small">
              Surplus from sunny months is banked as credit and used up in the dim ones. {s.net.yearEndSurplus > 1 ? `About ${num(s.net.yearEndSurplus)} units are left at year end, paid at ₹${st.feedIn}/unit.` : "Nothing is left over at year end, so nothing is sold back cheap."}
            </p>
          </section>

          <section className="money">
            <div className="card">
              <h2 className="card__title">
                Cost and subsidy
                <SourceTip label={SUBSIDY_SOURCE.label} url={SUBSIDY_SOURCE.url} />
              </h2>
              <dl className="ledger">
                <div>
                  <dt>Installed price</dt>
                  <dd className="mono">{rupees(s.grossCost)}</dd>
                </div>
                <div>
                  <dt>Central subsidy</dt>
                  <dd className="mono good">− {rupees(s.subsidy.central)}</dd>
                </div>
                {s.subsidy.state > 0 && (
                  <div>
                    <dt>{st.name} top-up</dt>
                    <dd className="mono good">− {rupees(s.subsidy.state)}</dd>
                  </div>
                )}
                <div className="ledger__total">
                  <dt>You pay, net</dt>
                  <dd className="mono">{rupees(s.netCost)}</dd>
                </div>
              </dl>
              <p className="muted small">{s.subsidy.centralRule}. Paid only for DCR panels with ALMM List-II cells.</p>
            </div>
            <div className="card card--ink">
              <h2 className="card__title">On a PM Surya Ghar loan</h2>
              <dl className="ledger ledger--ink">
                <div>
                  <dt>Upfront (margin)</dt>
                  <dd className="mono">{rupees(s.loan.upfront)}</dd>
                </div>
                <div>
                  <dt>Borrow at {(s.loan.rate * 100).toFixed(2)}%</dt>
                  <dd className="mono">{rupees(s.loan.principal)}</dd>
                </div>
                <div>
                  <dt>EMI after subsidy prepaid</dt>
                  <dd className="mono">{rupees(s.loan.emiAfter)}</dd>
                </div>
                <div className="ledger__total">
                  <dt>Average saving a month</dt>
                  <dd className="mono haldi">{rupees(s.monthlySavingAvg)}</dd>
                </div>
              </dl>
              <p className="small" style={{ opacity: 0.75 }}>
                {s.monthlySavingAvg > s.loan.emiAfter
                  ? `The panels out-earn the EMI by ${rupees(s.monthlySavingAvg - s.loan.emiAfter)} a month from the start.`
                  : "The EMI is higher than the saving until the loan is repaid."}{" "}
                {s.loan.concessional ? "Collateral-free, up to ₹2 lakh for systems up to 3 kW." : "Above 3 kW or ₹2 lakh the bank's regular rate applies."}
              </p>
            </div>
          </section>

          <section className="card">
            <h2 className="card__title">
              25 years, cumulative
              <span className="muted small">after O&amp;M and one inverter swap</span>
            </h2>
            <CashflowChart flows={s.flows} payback={s.payback} />
          </section>

          <section className="impact">
            <Stat label="CO₂ avoided a year" value={`${s.co2TonnesYear.toFixed(1)} t`} hint={`${num(s.co2Tonnes25)} t over 25 years`} />
            <Stat label="Like planting" value={`${num(s.treesEquivalent)} trees`} hint={`at ${KG_CO2_PER_TREE_YEAR} kg CO₂ per tree-year`} />
            <Stat label="25-year net savings" value={rupeesShort(s.lifetimeSavings)} hint={`NPV ${rupeesShort(s.npv25)} at 8%`} />
          </section>

          <section className="card">
            <h2 className="card__title">What to do next</h2>
            <ol className="steps">
              {STEPS.map((x, i) => (
                <li key={x.t}>
                  <span className="steps__n mono">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="steps__t">{x.t}</p>
                    <p className="steps__d">{x.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="actions">
              <a className="btn btn--sm" href="https://www.pmsuryaghar.gov.in/" target="_blank" rel="noreferrer">
                Open the national portal ↗
              </a>
              <Link className="btn btn--sm btn--accent" to={`/quote?kw=${s.kwp.toFixed(2)}&state=${st.code}`}>
                Check a quote for this roof <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </section>

          <section className="share no-print">
            <button type="button" className="btn btn--ghost btn--sm" onClick={copyLink}>
              <LinkSimple size={16} /> {copied ? "Link copied" : "Copy share link"}
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={roofCard}>
              <ShareNetwork size={16} /> Share my roof card
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => window.print()}>
              <Printer size={16} /> Save as PDF
            </button>
            <a className="btn btn--ghost btn--sm" href={`https://wa.me/?text=${encodeURIComponent(`My roof in ${climate.label} can make ${num(s.annualGeneration)} units a year and save ${rupees(s.net.savings)}. ${shareUrl}`)}`} target="_blank" rel="noreferrer">
              <DownloadSimple size={16} /> Send on WhatsApp
            </a>
          </section>

          <details className="assume">
            <summary>Assumptions and sources</summary>
            <ul>
              <li>Sunlight: NASA POWER all-sky irradiance and temperature, 2001-2020 monthly climatology, {climate.source === "nasa-live" ? "fetched live" : "bundled for 72 cities"} for {climate.lat.toFixed(2)}°, {climate.lon.toFixed(2)}°.</li>
              <li>Plane-of-array: Klein representative days, Erbs monthly diffuse fraction, Liu-Jordan isotropic sky, tilt {defaultTilt(climate.lat)}° facing south, ground albedo 0.2.</li>
              <li>Losses {Math.round(PV_DEFAULTS.systemLosses * 100)}% (wiring, inverter, soiling, mismatch); temperature {PV_DEFAULTS.tempCoeff * 100}%/°C with cells {PV_DEFAULTS.cellOverAmbient} °C above mean air temperature; {PV_DEFAULTS.degradation * 100}%/yr degradation.</li>
              <li>Consumption shape: {st.zone} India seasonal profile, scaled so {MONTHS[billMonth]} matches your bill.</li>
              <li>Net metering with monthly banking, settled April to March; leftover at ₹{st.feedIn}/unit.</li>
              <li>Finance: tariff +{FINANCE_DEFAULTS.tariffEscalation * 100}%/yr, O&amp;M ₹{FINANCE_DEFAULTS.omPerKw}/kW/yr after the vendor's 5-year obligation, inverter replacement in year {FINANCE_DEFAULTS.inverterYear}, discount rate {FINANCE_DEFAULTS.discountRate * 100}%.</li>
              <li>Loan: repo + 0.5% (≈{(FINANCE_DEFAULTS.concessionalRate * 100).toFixed(2)}%, Jul 2026), 10% margin, {FINANCE_DEFAULTS.tenureYears} years. Confirm the rate in your sanction letter.</li>
              <li>CO₂: CEA weighted-average grid factor {GRID_EMISSION_T_PER_MWH} t/MWh (FY 2023-24).</li>
            </ul>
            <p className="muted small">Estimates, not financial advice.</p>
          </details>
        </div>
      </div>
    </div>
  );
}
