import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "../components/ui";
import buildlog from "../data/buildlog.json";
import { num } from "../engine/format";
import "../styles/deck.css";

// Figures come from business/Chhat-financial-model.xlsx (base case) and the
// research log. Keep them in sync when the model changes:
// `python business/build_model.py --verify` prints every number used here.
const FIN = [
  { y: "FY27*", rev: 0.59, ebitda: -0.82 },
  { y: "FY28", rev: 7.84, ebitda: -2.13 },
  { y: "FY29", rev: 24.13, ebitda: 2.64 },
  { y: "FY30", rev: 49.35, ebitda: 13.58 },
  { y: "FY31", rev: 79.76, ebitda: 28.0 },
];

function Slide({ children, tone = "paper", n }: { children: ReactNode; tone?: "paper" | "ink" | "haldi" | "neel"; n: number }) {
  return (
    <section className={`slide slide--${tone}`} data-n={n}>
      <div className="slide__inner">{children}</div>
      <footer className="slide__foot mono">
        <span>Chhat · छत</span>
        <span>{String(n).padStart(2, "0")}</span>
      </footer>
    </section>
  );
}

function FinChart() {
  const W = 760;
  const H = 360;
  const m = { t: 20, r: 10, b: 36, l: 50 };
  const max = 100;
  const min = -10;
  const iw = W - m.l - m.r;
  const ih = H - m.t - m.b;
  const y = (v: number) => m.t + ((max - v) / (max - min)) * ih;
  const band = iw / FIN.length;
  const bw = 34;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="finchart" role="img" aria-label="Revenue and EBITDA by year, ₹ crore">
      {[0, 25, 50, 75, 100].map((t) => (
        <g key={t}>
          <line x1={m.l} x2={W - m.r} y1={y(t)} y2={y(t)} className={t === 0 ? "fc-base" : "fc-grid"} />
          <text x={m.l - 8} y={y(t)} className="fc-axis" textAnchor="end" dominantBaseline="middle">
            {t}
          </text>
        </g>
      ))}
      {FIN.map((f, i) => {
        const cx = m.l + band * i + band / 2;
        const rv = f.rev;
        const eb = f.ebitda;
        return (
          <g key={f.y}>
            <rect x={cx - bw - 1} y={y(rv)} width={bw} height={y(0) - y(rv)} rx={4} className="fc-rev" />
            <rect x={cx + 1} y={eb >= 0 ? y(eb) : y(0)} width={bw} height={Math.abs(y(eb) - y(0))} rx={4} className={eb >= 0 ? "fc-eb" : "fc-neg"} />
            <text x={cx - bw / 2 - 1} y={y(rv) - 8} className="fc-val" textAnchor="middle">
              {rv.toFixed(rv < 10 ? 1 : 0)}
            </text>
            <text x={cx + bw / 2 + 1} y={eb >= 0 ? y(eb) - 8 : y(eb) + 16} className="fc-val" textAnchor="middle">
              {eb < 0 ? `(${Math.abs(eb).toFixed(1)})` : eb.toFixed(eb < 10 ? 1 : 0)}
            </text>
            <text x={cx} y={H - 10} className="fc-axis" textAnchor="middle">
              {f.y}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Deck() {
  const [i, setI] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const log = buildlog as { stats: { commits: number; loc: number; tests: number; e2e?: number; docWords: number } };

  const slides: ReactNode[] = [
    <Slide n={1} tone="ink" key="title">
      <div className="s-title">
        <Logo inverse />
        <h1 className="s-h1">Solar, without the sales pitch.</h1>
        <p className="s-lede">The independent AI solar advisor for every Indian roof.</p>
        <div className="s-meta mono">
          <span>Team 404 not found</span>
          <span>HackIndia · AI-First Startup Hackathon 2026</span>
          <span>Track: AI in any startup (climate) + FinTech</span>
        </div>
      </div>
      <span className="s-bigdeva deva" aria-hidden="true">
        छत
      </span>
    </Slide>,

    <Slide n={2} key="problem">
      <p className="eyebrow">The problem</p>
      <h2 className="s-h2">India installs 16,000 rooftops a day. Nobody is on the homeowner's side.</h2>
      <div className="s-stats">
        <div>
          <b>51 lakh</b>
          <span>PM Surya Ghar installations by Sep 2026; 1 crore homes targeted by Mar 2027</span>
        </div>
        <div>
          <b>5%</b>
          <span>of households willing to install, though the economics work (CEEW)</span>
        </div>
        <div>
          <b>Jul 2026</b>
          <span>MNRE acknowledges wrong DISCOM bills after rooftop installs</span>
        </div>
      </div>
      <p className="s-note">Every calculator a homeowner finds belongs to someone selling panels.</p>
    </Slide>,

    <Slide n={3} key="cost">
      <p className="eyebrow">What that costs one family</p>
      <h2 className="s-h2">One quote. Three problems. ₹1.6 lakh at risk.</h2>
      <div className="s-split">
        <div className="s-quote">
          <div className="s-quote__line">
            <span>“3 kW” on-grid system</span>
            <span className="mono">₹2,41,256</span>
          </div>
          <div className="s-quote__line">
            <span>5 × 540 Wp, imported</span>
            <span className="mono">2.70 kWp</span>
          </div>
          <div className="s-quote__line">
            <span>GST @ 13.8%</span>
            <span className="mono">₹29,256</span>
          </div>
        </div>
        <ul className="s-list">
          <li>
            <b>₹57,710</b> above the fair price band
          </li>
          <li>
            <b>₹72,600</b> subsidy lost to non-DCR panels
          </li>
          <li>
            <b>0.3 kW</b> paid for and never installed
          </li>
          <li>
            Then after install: <b>₹2,714</b> overbilled in one cycle when the DISCOM ignores export
          </li>
        </ul>
      </div>
    </Slide>,

    <Slide n={4} tone="haldi" key="solution">
      <p className="eyebrow">The product</p>
      <h2 className="s-h2">Four checks between a family and a bad deal.</h2>
      <div className="s-grid4">
        <div>
          <h3>Roof Report</h3>
          <p>Bill + 20 years of NASA sunlight → size, generation, subsidy, loan, 25-year payback.</p>
        </div>
        <div>
          <h3>Quote Check</h3>
          <p>14 checks: fair price, DCR and ALMM, capacity, inverter, warranties, GST, payment terms.</p>
        </div>
        <div>
          <h3>Bill Audit</h3>
          <p>Import − export − credit vs. billed units. Drafts the DISCOM letter.</p>
        </div>
        <div>
          <h3>Ask Chhat</h3>
          <p>Agent in Hindi, Hinglish and English. Every number comes from a tool.</p>
        </div>
      </div>
    </Slide>,

    <Slide n={5} key="demo">
      <p className="eyebrow">Live, no login, no key</p>
      <h2 className="s-h2">Works for a stranger in ten seconds.</h2>
      <div className="s-shots">
        <img src="./deck/report.jpg" alt="Roof Report with 3D roof and results" />
        <img src="./deck/quote.jpg" alt="Quote Check grading a sample quote F" />
      </div>
    </Slide>,

    <Slide n={6} tone="ink" key="ai">
      <p className="eyebrow">How the AI works</p>
      <h2 className="s-h2">Claude decides. The engine computes. Nothing is invented.</h2>
      <div className="s-split">
        <ul className="s-list s-list--inv">
          <li>
            <b>7 typed tools</b>: irradiance, sizing, subsidy, finance, quote audit, bill audit, sourced knowledge base
          </li>
          <li>
            <b>Two agents, one toolset</b>: Claude Opus 5.5 on the server; an on-device router when there's no key or no network
          </li>
          <li>
            <b>Document reading</b>: Claude structured output, or on-device OCR and PDF text, always into an editable form
          </li>
          <li>
            <b>Real data</b>: NASA POWER (72 cities bundled, live for any lat/lon), MNRE rules, CEA emission factor
          </li>
        </ul>
        <div className="s-trace mono">
          <p className="s-trace__q">“Vendor quoted 2.4 lakh for 3 kW in Lucknow, fair?”</p>
          <p>→ audit_quote(system_kw: 3, total_price: 240000, state_code: "UP")</p>
          <p>← Grade C · ₹42,000 above fair range · DCR not stated · no 5-yr warranty</p>
          <p className="s-trace__a">“For 3 kW with DCR panels, a fair installed price is ₹1,62,000 to ₹1,98,000. This quote is about ₹42,000 above that.”</p>
        </div>
      </div>
    </Slide>,

    <Slide n={7} key="market">
      <p className="eyebrow">Market</p>
      <h2 className="s-h2">A ₹1.8 lakh crore installation market, refereed by no one.</h2>
      <div className="s-funnel">
        {[
          { w: 100, b: "₹1,82,400 cr", t: "TAM · installation value of India's 32 GW economic residential rooftop potential (CEEW)" },
          { w: 20, b: "₹36,480 cr / yr", t: "Planning base · 20 lakh homes a year after the scheme, a third of the 2026 peak" },
          { w: 1.25, b: "₹2,278 cr / yr", t: "SAM · Chhat's fees on that flow, plus installer SaaS and state analytics" },
          { w: 0.05, b: "₹80 cr", t: "SOM · FY31 revenue: 3.5% of SAM, 3% of national installs" },
        ].map((r) => (
          <div key={r.b} className="s-funnel__row">
            <div className="s-funnel__track">
              <div className="s-funnel__bar" style={{ width: `${r.w}%` }} />
            </div>
            <div className="s-funnel__txt">
              <b>{r.b}</b>
              <span>{r.t}</span>
            </div>
          </div>
        ))}
      </div>
    </Slide>,

    <Slide n={8} key="model">
      <p className="eyebrow">Business model</p>
      <h2 className="s-h2">Free for homes. Paid by the people who want to sell to them.</h2>
      <table className="s-table">
        <thead>
          <tr>
            <th>Stream</th>
            <th>Payer</th>
            <th>Price</th>
            <th>FY31 (₹ cr)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Verified leads</td>
            <td>Installers</td>
            <td>₹1,500 / lead</td>
            <td>45.6</td>
          </tr>
          <tr>
            <td>Success fee</td>
            <td>Installers</td>
            <td>2% of system value</td>
            <td>17.8</td>
          </tr>
          <tr>
            <td>Installer SaaS</td>
            <td>Installers</td>
            <td>₹2,999 / month</td>
            <td>9.0</td>
          </tr>
          <tr>
            <td>State / DISCOM analytics</td>
            <td>Governments</td>
            <td>₹40 L / state-year</td>
            <td>4.0</td>
          </tr>
          <tr>
            <td>Loan origination</td>
            <td>Banks, NBFCs</td>
            <td>1% of loan</td>
            <td>3.4</td>
          </tr>
        </tbody>
      </table>
    </Slide>,

    <Slide n={9} key="unit">
      <p className="eyebrow">Unit economics, FY28</p>
      <h2 className="s-h2">₹4,803 contribution on every installed home.</h2>
      <div className="s-stats s-stats--4">
        <div>
          <b>₹196</b>
          <span>revenue per report</span>
        </div>
        <div>
          <b>₹96</b>
          <span>variable cost per report (₹85 acquisition, ₹10 calls &amp; payments, ₹2 AI)</span>
        </div>
        <div>
          <b>2.0x</b>
          <span>revenue to variable cost</span>
        </div>
        <div>
          <b>1.5%</b>
          <span>of the home's 25-year savings is Chhat's take</span>
        </div>
      </div>
      <p className="s-note">Funnel: 8% of reports become verified leads; 20% of leads install. 62.5 reports per installed home. AI is under 1% of revenue.</p>
    </Slide>,

    <Slide n={10} key="fin">
      <p className="eyebrow">Five-year plan · ₹ crore</p>
      <h2 className="s-h2">EBITDA positive in year three.</h2>
      <div className="s-split s-split--chart">
        <FinChart />
        <div className="s-legend">
          <span>
            <i className="k k--rev" /> Revenue
          </span>
          <span>
            <i className="k k--eb" /> EBITDA
          </span>
          <p className="s-note">FY31: ₹79.8 cr revenue, 35% EBITDA margin, ~124 people. Downside (30% less traffic): break-even Jan 2030, ~₹6 cr more needed. *FY27 is Nov to Mar.</p>
        </div>
      </div>
    </Slide>,

    <Slide n={11} tone="neel" key="moat">
      <p className="eyebrow">The moat</p>
      <h2 className="s-h2">A calculator is easy to copy. Our dataset isn't.</h2>
      <div className="s-grid3">
        <div>
          <b>City price index</b>
          <p>Every audited quote adds a dated price per kW, per city, per panel type.</p>
        </div>
        <div>
          <b>DISCOM error map</b>
          <p>Every audited bill shows which sub-divisions bill wrong. Regulators will pay for that.</p>
        </div>
        <div>
          <b>Calibrated yield</b>
          <p>Post-install exports tune the PV model city by city, beyond NASA averages.</p>
        </div>
      </div>
    </Slide>,

    <Slide n={12} key="comp">
      <p className="eyebrow">Competition</p>
      <h2 className="s-h2">Installers sell panels. Chhat referees them.</h2>
      <table className="s-table s-table--check">
        <thead>
          <tr>
            <th></th>
            <th>Independent</th>
            <th>Audits quotes</th>
            <th>Audits bills</th>
            <th>Hindi agent</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>SolarSquare, Freyr, Loom</td>
            <td>✕</td>
            <td>✕</td>
            <td>✕</td>
            <td>✕</td>
          </tr>
          <tr>
            <td>PM Surya Ghar portal</td>
            <td>✓</td>
            <td>✕</td>
            <td>✕</td>
            <td>✕</td>
          </tr>
          <tr>
            <td>Lead aggregators</td>
            <td>✕</td>
            <td>✕</td>
            <td>✕</td>
            <td>✕</td>
          </tr>
          <tr className="s-us">
            <td>Chhat</td>
            <td>✓</td>
            <td>✓</td>
            <td>✓</td>
            <td>✓</td>
          </tr>
        </tbody>
      </table>
    </Slide>,

    <Slide n={13} key="gtm">
      <p className="eyebrow">Go-to-market</p>
      <h2 className="s-h2">Start where the subsidy stacks highest.</h2>
      <ol className="s-timeline">
        <li>
          <b>Nov 2026</b> Live in Delhi NCR, UP, Maharashtra · first 20 installers
        </li>
        <li>
          <b>Mar 2027</b> 40,000 reports · 3,200 verified leads · first lender
        </li>
        <li>
          <b>Sep 2027</b> 10 states · “Chhat Verified” badge · first DISCOM pilot
        </li>
        <li>
          <b>FY28</b> ₹7.8 crore revenue · 4,900 installs
        </li>
        <li>
          <b>FY29</b> EBITDA positive from Apr 2028 · optional Series A for C&amp;I and batteries
        </li>
      </ol>
      <p className="s-note">Growth loop: every report makes a shareable roof card for WhatsApp.</p>
    </Slide>,

    <Slide n={14} tone="ink" key="built">
      <p className="eyebrow">AI-first execution</p>
      <h2 className="s-h2">Two briefs in. A startup out.</h2>
      <div className="s-stats s-stats--4 s-stats--inv">
        <div>
          <b>{num(log.stats.loc)}</b>
          <span>lines of source, all written by Claude Code</span>
        </div>
        <div>
          <b>{num(log.stats.tests + (log.stats.e2e ?? 0))}</b>
          <span>automated tests: unit, plus end-to-end in a real browser</span>
        </div>
        <div>
          <b>25</b>
          <span>ideas generated, debated and scored before writing code</span>
        </div>
        <div>
          <b>0</b>
          <span>lines of code written by a human</span>
        </div>
      </div>
      <p className="s-note">Research, idea tournament, plan, PV model, 3D world, copy, financial model, this deck: AI. The two briefs and the review: human. Receipts at /built-with-ai.</p>
    </Slide>,

    <Slide n={15} tone="haldi" key="ask">
      <p className="eyebrow">The ask</p>
      <h2 className="s-h1 s-h1--ask">₹6 crore seed for 15%.</h2>
      <div className="s-split">
        <ul className="s-list">
          <li>
            <b>38%</b> growth
          </li>
          <li>
            <b>34%</b> product & engineering
          </li>
          <li>
            <b>18%</b> G&amp;A, compliance & state sales
          </li>
          <li>
            <b>10%</b> installer network & lead verification
          </li>
        </ul>
        <div>
          <p className="s-lede s-lede--ink">Gets us to EBITDA break-even in April 2028 with ₹1.9 crore of cash at the low point.</p>
          <p className="s-note">Try it: read your roof at the live link. Every number cites its source.</p>
        </div>
      </div>
    </Slide>,
  ];

  const go = useCallback((d: number) => setI((x) => Math.max(0, Math.min(slides.length - 1, x + d))), [slides.length]);

  useEffect(() => {
    document.title = "Chhat · Pitch deck";
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(1);
      }
      if (["ArrowLeft", "PageUp"].includes(e.key)) go(-1);
      if (e.key === "Home") setI(0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Scale the 1600x900 canvas to fit the viewport.
  useEffect(() => {
    const fit = () => {
      const s = Math.min(window.innerWidth / 1600, (window.innerHeight - 56) / 900);
      root.current?.style.setProperty("--deck-scale", String(s));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const print = new URLSearchParams(window.location.hash.split("?")[1] ?? "").has("print");

  if (print) {
    return <div className="deck-print">{slides}</div>;
  }

  return (
    <div className="deck" ref={root}>
      <div className="deck__stage">
        <div className="deck__canvas">{slides[i]}</div>
      </div>
      <nav className="deck__bar" aria-label="Slides">
        <Link to="/" className="deck__home">
          ← chhat
        </Link>
        <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Previous slide" disabled={i === 0}>
          <ArrowLeft size={18} />
        </button>
        <span className="mono">
          {i + 1} / {slides.length}
        </span>
        <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Next slide" disabled={i === slides.length - 1}>
          <ArrowRight size={18} />
        </button>
        <a className="deck__pdf mono" href="#/deck?print=1" target="_blank" rel="noreferrer">
          print view
        </a>
      </nav>
    </div>
  );
}
