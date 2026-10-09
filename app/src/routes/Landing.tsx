import { ArrowRight, ArrowUpRight, CheckCircle, FileMagnifyingGlass, Lightning, Receipt, SealWarning, SunHorizon } from "@phosphor-icons/react";
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import buildlog from "../data/buildlog.json";
import { CITIES, cityByName, climateFromCity } from "../engine/climate";
import { rupees, num } from "../engine/format";
import { specificYield } from "../engine/pv";
import { buildReport } from "../engine/report";
import { formatClock } from "../engine/solar";
import { hasWebGL, isLowPower, prefersReducedMotion } from "../lib/env";
import { gsap, ScrollTrigger } from "../lib/smooth";
import { makeSceneState } from "../three/RoofScene";
import { LinkButton, Select, Stat } from "../components/ui";
import { useAsk } from "../components/AskChhat";
import "../styles/landing.css";

const RoofScene = lazy(() => import("../three/RoofScene"));
const HERO_ROOF = { w: 11.5, d: 10, floors: 3 };

/* ---------------- story timeline ---------------- */

const HOUR_KEYS: [number, number][] = [
  [0, 6.7],
  [0.14, 8.6],
  [0.3, 11.1],
  [0.46, 12.7],
  [0.62, 15.3],
  [0.78, 17.85],
  [0.9, 19.5],
  [1, 21],
];
// Almanac background through the day. Text colour flips by luminance so it
// never passes through a low-contrast midpoint.
const COLOR_KEYS: [number, string][] = [
  [0, "#f6e3da"],
  [0.14, "#f4ece6"],
  [0.32, "#f1f4f7"],
  [0.5, "#f6f6f1"],
  [0.66, "#f8e7cc"],
  [0.8, "#f4c79a"],
  [0.86, "#f0b585"],
  [0.89, "#2a2747"],
  [1, "#111833"],
];
const STEPS = [0, 0.14, 0.3, 0.46, 0.62, 0.78, 0.9];

function interp(keys: [number, number][], p: number) {
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) {
      const [p0, v0] = keys[i - 1];
      const [p1, v1] = keys[i];
      return v0 + ((v1 - v0) * (p - p0)) / (p1 - p0);
    }
  }
  return keys[keys.length - 1][1];
}
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function mix(a: string, b: string, t: number) {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
}
function colorsAt(p: number) {
  let bg = COLOR_KEYS[COLOR_KEYS.length - 1][1];
  for (let i = 1; i < COLOR_KEYS.length; i++) {
    if (p <= COLOR_KEYS[i][0]) {
      const [p0, b0] = COLOR_KEYS[i - 1];
      const [p1, b1] = COLOR_KEYS[i];
      bg = mix(b0, b1, (p - p0) / (p1 - p0));
      break;
    }
  }
  const [r, g, b] = bg.slice(4, -1).split(",").map(Number);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const dark = lum < 0.45;
  return { bg, fg: dark ? "#f1eee7" : "#161c36", dark };
}
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------------- story section ---------------- */

function Story() {
  const section = useRef<HTMLElement>(null);
  const almanac = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const billNum = useRef<HTMLSpanElement>(null);
  const state = useRef(makeSceneState({ hour: 6.7, doy: 105, drop: 0, panels: 6, camT: 0 }));
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const reduced = useMemo(prefersReducedMotion, []);
  const gl = useMemo(hasWebGL, []);
  const low = useMemo(isLowPower, []);
  const delhi = useMemo(() => climateFromCity(cityByName("Delhi")!), []);
  const sy = useMemo(() => specificYield(delhi), [delhi]);

  useLayoutEffect(() => {
    if (reduced) {
      Object.assign(state.current, { hour: 12.9, drop: 1, camT: 0.5 });
      return;
    }
    const el = section.current!;
    const apply = (p: number) => {
      const s = state.current;
      s.hour = interp(HOUR_KEYS, p);
      s.drop = smoothstep(0.44, 0.58, p);
      s.camT = p;
      const c = colorsAt(p);
      if (almanac.current) {
        almanac.current.style.setProperty("--alm-bg", c.bg);
        almanac.current.style.setProperty("--alm-fg", c.fg);
        almanac.current.dataset.dark = String(c.dark);
      }
      if (clock.current) clock.current.textContent = formatClock(s.hour);
      if (billNum.current) {
        const t = smoothstep(0.8, 0.88, p);
        billNum.current.textContent = rupees(3840 - t * (3840 - 412));
      }
      let i = 0;
      while (i < STEPS.length - 1 && p >= STEPS[i + 1] - 0.015) i++;
      setStep(i);
    };
    apply(0);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => apply(self.progress),
    });
    return () => st.kill();
  }, [reduced]);

  const sample = () => navigate("/report?city=Delhi&units=476&month=5&roof=1100&sample=delhi-may");

  return (
    <section ref={section} className={`story${reduced ? " story--static" : ""}`} aria-label="How Chhat works, from dawn to night">
      <div className="story__stage">
        <div className="story__canvas" aria-hidden="true">
          {gl ? (
            <Suspense fallback={<div className="story__poster" />}>
              <RoofScene state={state} roof={HERO_ROOF} lowPower={low} onReady={() => setReady(true)} />
            </Suspense>
          ) : (
            <div className="story__poster story__poster--img" />
          )}
          <div className={`story__veil${ready || !gl ? " is-gone" : ""}`} />
          <div className="story__hud mono">
            <span>28.61°N 77.21°E</span>
            <span>15 Apr</span>
            <span>
              <SunHorizon size={14} weight="bold" /> real sun path
            </span>
          </div>
        </div>

        <div ref={almanac} className="almanac" data-dark="false">
          <div className="almanac__top mono">
            <span className="almanac__clock">
              <span ref={clock}>06:42</span> IST
            </span>
            <span>Delhi · {num(sy)} kWh/kWp·yr</span>
          </div>

          <div className="almanac__steps">
            {/* 0. Dawn: hero */}
            <article className="step step--hero" data-active={step === 0}>
              <p className="eyebrow">Independent AI solar advisor · India</p>
              <h1 className="hero__title">Every Indian roof has a number.</h1>
              <p className="hero__lede">
                Chhat reads your electricity bill, models your roof on 20 years of NASA sunlight, stacks every subsidy, and checks the installer's quote before you sign.
              </p>
              <div className="hero__ctas">
                <LinkButton to="/report" variant="accent" size="lg">
                  Read my roof <ArrowRight size={18} weight="bold" />
                </LinkButton>
                <button type="button" className="btn btn--ghost btn--lg" onClick={sample}>
                  Try a sample house
                </button>
              </div>
              <p className="hero__fact mono">
                <Lightning size={14} weight="fill" /> 3.27 kWp in Delhi ≈ {num(sy * 3.27)} units a year · NASA POWER 2001-2020
              </p>
              <p className="hero__scroll mono" aria-hidden="true">
                Scroll through a day on this roof ↓
              </p>
            </article>

            <article className="step" data-active={step === 1}>
              <p className="eyebrow">The gap</p>
              <h2 className="step__title">637 GW of roofs. 5% willing.</h2>
              <p className="step__body">
                CEEW counted 637 GW of solar potential on Indian homes. Only one household in twenty says it would install. The sunlight is there. Trust in the numbers isn't.
              </p>
              <p className="step__src mono">CEEW, 2023 · 51 lakh PM Surya Ghar homes by Sep 2026</p>
            </article>

            <article className="step" data-active={step === 2}>
              <p className="eyebrow">The sun</p>
              <h2 className="step__title">Your roof already gets the energy.</h2>
              <p className="step__body">
                Delhi averages 4.89 kWh of sunlight per square metre a day. Chhat tilts that onto your panels month by month, takes off heat and wiring losses, and checks it against your bill.
              </p>
              <div className="step__chips">
                <span className="chip">Klein + Erbs + Liu-Jordan</span>
                <span className="chip">−0.35%/°C</span>
                <span className="chip">72 cities, live for any lat/lon</span>
              </div>
            </article>

            <article className="step" data-active={step === 3}>
              <p className="eyebrow">The system</p>
              <h2 className="step__title">Six panels. ₹1,08,000 back.</h2>
              <p className="step__body">
                PM Surya Ghar pays ₹78,000 for 3 kW. Delhi adds ₹30,000. Chhat stacks both, picks the panel count with the best 25-year return, and tells you if the subsidy sweet spot is one panel away.
              </p>
              <div className="step__grid">
                <Stat label="System" value="3.27 kWp" />
                <Stat label="Subsidy" hi="सब्सिडी" value="₹1.08 L" />
              </div>
            </article>

            <article className="step" data-active={step === 4}>
              <p className="eyebrow">The quote</p>
              <h2 className="step__title">Then it reads the quote.</h2>
              <div className="quote-card">
                <div className="quote-card__line">
                  <span>3 kW On-Grid System</span>
                  <span className="mono">₹2,41,256</span>
                </div>
                <div className="quote-card__line">
                  <span>5 × 540 Wp, imported</span>
                  <span className="mono">5 nos</span>
                </div>
                <div className="quote-card__line">
                  <span>GST @ 13.8%</span>
                  <span className="mono">₹29,256</span>
                </div>
                <span className="stamp stamp--a">+₹57,710 above fair</span>
                <span className="stamp stamp--b">Non-DCR: ₹72,600 subsidy lost</span>
                <span className="stamp stamp--c">Only 2.7 kWp</span>
              </div>
            </article>

            <article className="step" data-active={step === 5}>
              <p className="eyebrow">The bill</p>
              <h2 className="step__title">And every bill after.</h2>
              <p className="step__bill">
                <span ref={billNum} className="mono">₹3,840</span>
                <span className="step__bill-label">this month</span>
              </p>
              <p className="step__body">
                In July 2026 MNRE admitted DISCOMs were sending wrong bills to new solar homes: exports ignored, net meters never switched on. Chhat checks the arithmetic and drafts the letter.
              </p>
            </article>

            <article className="step step--cta" data-active={step === 6}>
              <p className="eyebrow">Your turn</p>
              <h2 className="step__title step__title--big">Read your roof.</h2>
              <p className="step__body">Two minutes, one bill, no login. Nobody calls you afterwards.</p>
              <div className="hero__ctas">
                <LinkButton to="/report" variant="accent" size="lg">
                  Start the Roof Report <ArrowRight size={18} weight="bold" />
                </LinkButton>
                <LinkButton to="/quote" variant="ghost" size="lg">
                  Check a quote
                </LinkButton>
              </div>
            </article>
          </div>

          <div className="almanac__progress" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span key={i} data-on={i <= step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- city marquee ---------------- */

function CityMarquee() {
  const items = useMemo(
    () =>
      CITIES.filter((_, i) => i % 2 === 0)
        .map((c) => ({ name: c.name, y: specificYield(climateFromCity(c)) }))
        .slice(0, 28),
    [],
  );
  const row = (
    <div className="marquee__row">
      {items.map((it) => (
        <span key={it.name} className="marquee__item">
          {it.name} <b className="mono">{num(it.y)}</b>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" aria-label="Annual kWh per kWp by city, from NASA POWER">
      <div className="marquee__track">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ---------------- three tools ---------------- */

function QuickReport() {
  const [city, setCity] = useState("Pune");
  const [units, setUnits] = useState(380);
  const r = useMemo(() => {
    const c = cityByName(city)!;
    return buildReport({ climate: climateFromCity(c), units, billMonth: new Date().getMonth(), periodMonths: 1, roofAreaSqft: 900, shading: "none" });
  }, [city, units]);
  return (
    <div className="quick">
      <div className="quick__inputs">
        <label className="quick__label">
          City
          <Select value={city} onChange={setCity} options={CITIES.map((c) => ({ value: c.name, label: c.name }))} />
        </label>
        <label className="quick__label">
          Units this month
          <div className="input-wrap">
            <input type="number" inputMode="numeric" value={units} min={50} onChange={(e) => setUnits(Math.max(30, Number(e.target.value) || 0))} />
            <span className="affix">kWh</span>
          </div>
        </label>
      </div>
      <div className="quick__out">
        <Stat label="Size" value={`${r.kwp.toFixed(2)} kWp`} />
        <Stat label="Saves a year" hi="बचत" value={rupees(r.net.savings)} />
        <Stat label="Pays back in" value={r.payback ? `${r.payback.toFixed(1)} yrs` : "25+ yrs"} />
      </div>
      <Link className="link-arrow" to={`/report?city=${encodeURIComponent(city)}&units=${units}`}>
        Open the full report <ArrowRight size={14} weight="bold" />
      </Link>
    </div>
  );
}

function Tools() {
  const { open } = useAsk();
  return (
    <section className="tools wrap" aria-labelledby="tools-title">
      <div className="section-head">
        <p className="eyebrow">What you get</p>
        <h2 id="tools-title" className="section-title">
          Four checks between you
          <br /> and a bad deal.
        </h2>
      </div>
      <div className="tools__grid">
        <article className="tool tool--report">
          <header className="tool__head">
            <SunHorizon size={26} weight="duotone" />
            <h3>Roof Report</h3>
            <span className="tool__hi deva">छत रिपोर्ट</span>
          </header>
          <p className="tool__body">Size, generation, subsidy, loan and 25-year payback from one bill. Try it right here:</p>
          <QuickReport />
        </article>

        <Link to="/quote?sample=overcharger" className="tool tool--quote">
          <header className="tool__head">
            <FileMagnifyingGlass size={26} weight="duotone" />
            <h3>Quote Check</h3>
          </header>
          <p className="tool__body">14 checks against the fair price, DCR and ALMM rules, warranties, structure, GST and payment terms. With a message to send the vendor, in English or Hindi.</p>
          <div className="grade-stamp" aria-hidden="true">
            F
          </div>
          <span className="tool__go">
            Audit a sample quote <ArrowUpRight size={16} weight="bold" />
          </span>
        </Link>

        <Link to="/bill?sample=import-billed" className="tool tool--bill">
          <header className="tool__head">
            <Receipt size={26} weight="duotone" />
            <h3>Bill Audit</h3>
          </header>
          <div className="meter-math mono" aria-hidden="true">
            <span>410 import</span>
            <span>− 236 export</span>
            <span className="meter-math__eq">= 174 units</span>
            <span className="meter-math__bad">billed 410</span>
          </div>
          <p className="tool__body">For homes that already went solar. Checks the meter arithmetic on every DISCOM bill and drafts the correction letter.</p>
          <span className="tool__go">
            Audit a sample bill <ArrowUpRight size={16} weight="bold" />
          </span>
        </Link>

        <button type="button" className="tool tool--ask" onClick={() => open("Lucknow, 380 units a month. What size should I install?")}>
          <header className="tool__head">
            <Lightning size={26} weight="duotone" />
            <h3>Ask Chhat</h3>
          </header>
          <div className="mini-chat" aria-hidden="true">
            <span className="mini-chat__q">लखनऊ में 3 kW पर कितनी सब्सिडी?</span>
            <span className="mini-chat__a">केंद्र ₹78,000 + राज्य ₹30,000 = ₹1,08,000</span>
            <span className="mini-chat__t mono">compute_subsidy(kw: 3, state_code: "UP")</span>
          </div>
          <p className="tool__body">An agent that answers in Hindi, Hinglish or English, and only quotes numbers its tools computed. Open the trace on any answer to see which.</p>
          <span className="tool__go">
            Ask a question <ArrowUpRight size={16} weight="bold" />
          </span>
        </button>
      </div>
    </section>
  );
}

/* ---------------- what chhat learns (horizontal) ---------------- */

const LEARNS = [
  {
    k: "01",
    title: "Every audited quote sharpens a city price index.",
    body: "Homeowners upload quotes to check them. Each one adds a real, dated price point per kW, per city, per panel type. Installers can't see each other's quotes. Chhat can.",
  },
  {
    k: "02",
    title: "Every audited bill adds to a DISCOM error map.",
    body: "Which sub-divisions bill on import, which net meters never get switched on, which 'other charges' keep appearing. That map is worth more to a regulator than any single complaint.",
  },
  {
    k: "03",
    title: "Every installed roof tests NASA against reality.",
    body: "Post-install bills show what a roof actually exported. Chhat compares that with its model and corrects its losses, city by city. The more homes it watches, the better its next forecast.",
  },
];

function Learns() {
  const wrap = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(max-width: 900px)").matches) return;
    const ctx = gsap.context(() => {
      const t = track.current!;
      gsap.to(t, {
        x: () => -(t.scrollWidth - window.innerWidth + 48),
        ease: "none",
        scrollTrigger: { trigger: wrap.current, start: "top top", end: () => `+=${t.scrollWidth}`, scrub: 0.6, pin: true, invalidateOnRefresh: true },
      });
    }, wrap);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={wrap} className="learns" aria-labelledby="learns-title">
      <div ref={track} className="learns__track">
        <div className="learns__intro">
          <p className="eyebrow">The moat</p>
          <h2 id="learns-title" className="section-title">
            What Chhat learns
            <br /> while it helps.
          </h2>
          <p className="learns__lede">A calculator is easy to copy. A dataset of real quotes and real bills from real roofs is not.</p>
        </div>
        {LEARNS.map((l) => (
          <article key={l.k} className="learn">
            <span className="learn__k mono">{l.k}</span>
            <h3 className="learn__title">{l.title}</h3>
            <p className="learn__body">{l.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ---------------- who pays ---------------- */

function Payers() {
  return (
    <section id="installers" className="payers wrap" aria-labelledby="payers-title">
      <div className="section-head">
        <p className="eyebrow">Business model</p>
        <h2 id="payers-title" className="section-title">
          Free for homes. Paid for by
          <br /> the people who want to sell to them.
        </h2>
      </div>
      <div className="payers__grid">
        <article className="payer payer--main">
          <p className="eyebrow">Installers</p>
          <h3 className="payer__price">
            ₹1,500 <span>per verified lead</span>
          </h3>
          <p>+ 2% of system value when the install completes. Leads arrive with a bill, a roof model and a buyer who already trusts the numbers.</p>
          <ul className="ticks">
            <li>
              <CheckCircle weight="fill" /> “Chhat Verified” badge for quotes that pass the audit
            </li>
            <li>
              <CheckCircle weight="fill" /> Ranked by audit score, not ad spend
            </li>
            <li>
              <CheckCircle weight="fill" /> Quote builder + CRM, ₹2,999/month
            </li>
          </ul>
        </article>
        <article className="payer">
          <p className="eyebrow">Banks & NBFCs</p>
          <h3 className="payer__price">
            1% <span>of loan originated</span>
          </h3>
          <p>PM Surya Ghar loans are small and collateral-free. Chhat hands lenders a sized system, a verified bill and a cash-flow case before the first call.</p>
        </article>
        <article className="payer">
          <p className="eyebrow">DISCOMs & state agencies</p>
          <h3 className="payer__price">
            ₹40 L <span>per state, per year</span>
          </h3>
          <p>Billing-error heatmaps, net-meter backlog and subsidy funnel analytics, from the bill audits citizens already run.</p>
        </article>
      </div>
      <p className="payers__note mono">
        Unit economics, 5-year P&amp;L and the funding ask are in the <Link to="/deck">pitch deck</Link> and the financial model in the repo.
      </p>
    </section>
  );
}

/* ---------------- proof ---------------- */

const FACTS = [
  { big: "51 lakh", label: "PM Surya Ghar installations by late Sep 2026, half the 1 crore target", src: "DD India / MNRE", url: "https://ddindia.co.in/2026/08/pm-surya-ghar-scheme-crosses-50-lakh-rooftop-solar-installations/" },
  { big: "5%", label: "of households willing to install rooftop solar (13% in Gujarat)", src: "CEEW 2023", url: "https://pv-magazine-india.com/2023/11/16/indias-residential-rooftop-solar-potential-estimated-at-637-gw" },
  { big: "₹78,000", label: "central subsidy for 3 kW; ₹85,800 in special-category states", src: "MNRE", url: "https://www.cag.org.in/sites/default/files/database/2.%20PM%20Surya%20Ghar%20Scheme-%20A%20consumer%20manual%20%281%29.pdf" },
  { big: "Jul 2026", label: "MNRE acknowledges wrong DISCOM bills after rooftop installs", src: "Energetica India", url: "https://www.energetica-india.net/news/mnre-flags-incorrect-rooftop-solar-billing-by-discoms-refers-complaints-for-resolution" },
  { big: "1 Jun 2026", label: "ALMM List-II: subsidised panels need listed domestic cells", src: "TaiyangNews", url: "https://taiyangnews.info/markets/mnre-clarifies-almm-list-ii-exemption-pm-surya-ghar-users" },
  { big: "8.9%", label: "effective GST on installed solar since 22 Sep 2025 (was ~13.8%)", src: "EQ Mag", url: "https://www.eqmagpro.com/gst-on-renewable-energy-devices-rationalised-to-5-to-accelerate-indias-clean-energy-transition-eq/" },
  { big: "$53M", label: "SolarSquare's Series C, Jun 2026: the market is real and funded", src: "Mercom", url: "https://mercomindia.com/solarsquare-raises-53-million-in-series-c-funding-round" },
  { big: "0.727", label: "tCO₂ per MWh, India's grid emission factor (FY24)", src: "CEA", url: "https://solarquarter.com/2025/01/06/co2-baseline-database-highlights-indias-progress-in-renewable-energy-and-emission-reduction-cea/" },
];

function Proof() {
  return (
    <section className="proof wrap" aria-labelledby="proof-title">
      <div className="section-head section-head--split">
        <h2 id="proof-title" className="section-title">
          Numbers we
          <br /> didn't make up.
        </h2>
        <p className="section-lede">Every figure on this site links to where it came from. When sources disagreed, the research log in the repo says which one we picked and why.</p>
      </div>
      <div className="proof__grid">
        {FACTS.map((f) => (
          <a key={f.big} className="fact" href={f.url} target="_blank" rel="noreferrer">
            <span className="fact__big">{f.big}</span>
            <span className="fact__label">{f.label}</span>
            <span className="fact__src mono">
              {f.src} <ArrowUpRight size={12} weight="bold" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/* ---------------- built with AI teaser ---------------- */

function BuiltTeaser() {
  const log = buildlog as { stats: { commits: number; files: number; linesAdded: number; tests: number } };
  return (
    <section className="built wrap" aria-labelledby="built-title">
      <div className="built__card">
        <div>
          <p className="eyebrow">AI-first, with receipts</p>
          <h2 id="built-title" className="section-title">
            Claude did the research, the code
            <br /> and this sentence.
          </h2>
          <p className="section-lede">
            Research, a 25-idea tournament, the PV model, the 3D roof, the tests, the deck and the financial model were all produced by Claude Code from one brief. A person set the goal and reviewed the result.
          </p>
          <LinkButton to="/built-with-ai" variant="accent">
            See the build log <ArrowRight size={16} weight="bold" />
          </LinkButton>
        </div>
        <div className="built__stats">
          <Stat label="Commits" value={num(log.stats.commits)} />
          <Stat label="Files" value={num(log.stats.files)} />
          <Stat label="Lines written" value={num(log.stats.linesAdded)} />
          <Stat label="Unit tests" value={num(log.stats.tests)} />
        </div>
      </div>
    </section>
  );
}

function Final() {
  return (
    <section className="final wrap">
      <SealWarning size={34} weight="duotone" color="var(--haldi-2)" />
      <h2 className="final__title">Before you sign anything, read your roof.</h2>
      <div className="hero__ctas">
        <LinkButton to="/report" variant="primary" size="lg">
          Start the Roof Report <ArrowRight size={18} weight="bold" />
        </LinkButton>
        <LinkButton to="/quote" variant="ghost" size="lg">
          I already have a quote
        </LinkButton>
      </div>
    </section>
  );
}

export default function Landing() {
  useEffect(() => {
    document.title = "Chhat: solar, without the sales pitch";
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <>
      <Story />
      <CityMarquee />
      <Tools />
      <Learns />
      <Payers />
      <Proof />
      <BuiltTeaser />
      <Final />
    </>
  );
}
