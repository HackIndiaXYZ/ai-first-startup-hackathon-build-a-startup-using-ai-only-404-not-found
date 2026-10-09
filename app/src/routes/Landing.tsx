import { ArrowRight, ArrowUpRight, CheckCircle, FileMagnifyingGlass, Lightning, Receipt, SunHorizon } from "@phosphor-icons/react";
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAsk } from "../components/AskChhat";
import { Preloader } from "../components/Preloader";
import { LinkButton, Select, Stat } from "../components/ui";
import buildlog from "../data/buildlog.json";
import { CITIES, cityByName, climateFromCity } from "../engine/climate";
import { num, rupees } from "../engine/format";
import { instantOutput, specificYield } from "../engine/pv";
import { buildReport } from "../engine/report";
import { formatClock, sunPosition, sunTimes } from "../engine/solar";
import { hasWebGL, isLowPower, prefersReducedMotion } from "../lib/env";
import { countUp, EASE, gsap, ScrollTrigger, SplitText, useMagnetic, useReveals } from "../lib/motion";
import { CHAPTERS, chapterAt, colorsAt, dialPoint, HOUR_KEYS, interp, smoothstep, STEPS } from "../lib/story";
import { useLenis } from "../lib/smooth";
import { MODEL_NAMES, TEXTURE_NAMES } from "../three/manifest";
import type { SceneState } from "../three/RoofScene";
import "../styles/landing.css";

const sceneModule = () => import("../three/RoofScene");
const RoofScene = lazy(sceneModule);
const HERO_ROOF = { w: 11.5, d: 10, floors: 3 };
const HERO_KWP = 3.27;
const DOY = 105; // 15 April

function layoutView() {
  const w = window.innerWidth;
  if (w >= 1100) return { x: 0.2, y: 0 };
  if (w >= 760) return { x: 0.14, y: 0 };
  return { x: 0, y: 0.16 };
}

/* ---------------- sun dial ---------------- */

/** The day as an arc: sunrise on the left, sunset on the right, the sun on it. */
function SunDial({ dialRef }: { dialRef: React.RefObject<SVGSVGElement> }) {
  const ticks = Array.from({ length: 13 }, (_, i) => i);
  return (
    <svg ref={dialRef} className="dial" viewBox="0 0 220 120" aria-hidden="true">
      <path className="dial__arc" d="M14 106 A96 96 0 0 1 206 106" />
      <line className="dial__horizon" x1="4" y1="106" x2="216" y2="106" />
      {ticks.map((i) => {
        const a = Math.PI - (i / 12) * Math.PI;
        const x1 = 110 + Math.cos(a) * 90;
        const y1 = 106 - Math.sin(a) * 90;
        const x2 = 110 + Math.cos(a) * (i % 3 ? 86 : 82);
        const y2 = 106 - Math.sin(a) * (i % 3 ? 86 : 82);
        return <line key={i} className="dial__tick" x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
      <circle className="dial__sun" cx="14" cy="106" r="7" />
      <circle className="dial__halo" cx="14" cy="106" r="14" />
    </svg>
  );
}

/* ---------------- story section ---------------- */

function Story({ state, intro, onReady, quality }: { state: React.MutableRefObject<SceneState>; intro: boolean; onReady: () => void; quality?: "high" | "medium" | "low" }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const sunAlt = useRef<HTMLSpanElement>(null);
  const kw = useRef<HTMLSpanElement>(null);
  const billNum = useRef<HTMLSpanElement>(null);
  const dial = useRef<SVGSVGElement>(null);
  const chapterLabel = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const reduced = useMemo(prefersReducedMotion, []);
  const gl = useMemo(hasWebGL, []);
  const low = useMemo(isLowPower, []);
  const delhi = useMemo(() => climateFromCity(cityByName("Delhi")!), []);
  const sy = useMemo(() => specificYield(delhi), [delhi]);
  const times = useMemo(() => sunTimes(delhi.lat, delhi.lon, DOY), [delhi]);
  const ctaPrimary = useMagnetic<HTMLAnchorElement>();
  const [visible, setVisible] = useState(true);

  // Only draw the rooftop while it is on screen.
  useEffect(() => {
    const el = section.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = section.current!;
    const root = document.documentElement;
    const view = layoutView();
    state.current.viewX = view.x;
    const apply = (p: number) => {
      const s = state.current;
      s.hour = interp(HOUR_KEYS, p);
      s.drop = smoothstep(0.44, 0.58, p);
      s.camT = p;
      const v = layoutView();
      s.viewX = v.x;
      const c = colorsAt(p);
      stage.current?.style.setProperty("--alm-bg", c.bg);
      stage.current?.style.setProperty("--alm-fg", c.fg);
      if (stage.current) stage.current.dataset.dark = String(c.dark);
      root.dataset.hero = c.dark ? "dark" : "light";
      const sun = sunPosition(delhi.lat, delhi.lon, DOY, s.hour);
      if (clock.current) clock.current.textContent = formatClock(s.hour);
      if (sunAlt.current) sunAlt.current.textContent = `${sun.elevation >= 0 ? "" : "−"}${Math.abs(sun.elevation).toFixed(1)}°`;
      if (kw.current) {
        const out = s.drop > 0.95 ? instantOutput(delhi, HERO_KWP, 3, sun.elevation, times.sunset - times.sunrise) : 0;
        kw.current.textContent = out.toFixed(2);
      }
      if (dial.current) {
        const { x, y, below } = dialPoint(s.hour, times.sunrise, times.sunset);
        dial.current.querySelectorAll("circle").forEach((cEl) => {
          cEl.setAttribute("cx", x.toFixed(1));
          cEl.setAttribute("cy", y.toFixed(1));
        });
        dial.current.dataset.below = String(below);
      }
      if (billNum.current) {
        const t = smoothstep(0.8, 0.88, p);
        billNum.current.textContent = rupees(3840 - t * (3840 - 412));
      }
      const i = chapterAt(p);
      if (chapterLabel.current) chapterLabel.current.textContent = `${String(i + 1).padStart(2, "0")} / ${String(STEPS.length).padStart(2, "0")} · ${CHAPTERS[i]}`;
      setStep(i);
    };
    if (reduced) {
      // A still frame: noon, panels installed, every chapter stacked below.
      apply(0);
      Object.assign(state.current, { hour: 12.9, drop: 1, camT: 0.5 });
      return () => {
        delete root.dataset.hero;
      };
    }
    apply(0);
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => apply(self.progress),
      onLeave: () => delete root.dataset.hero,
      onEnterBack: (self) => apply(self.progress),
    });
    const onResize = () => apply(st.progress);
    window.addEventListener("resize", onResize);
    return () => {
      st.kill();
      window.removeEventListener("resize", onResize);
      delete root.dataset.hero;
    };
  }, [reduced, state, delhi, times]);

  // Chapter changes: the outgoing title lines leave upward, the new ones rise.
  const splits = useRef<Map<number, SplitText>>(new Map());
  const prev = useRef(-1);
  useLayoutEffect(() => {
    const host = stage.current;
    if (!host) return;
    const steps = Array.from(host.querySelectorAll<HTMLElement>(".step"));
    if (reduced) return;
    steps.forEach((s, i) => {
      const on = i === step;
      s.toggleAttribute("inert", !on);
      s.setAttribute("aria-hidden", String(!on));
    });
    if (!intro) return;
    const getSplit = (i: number) => {
      let sp = splits.current.get(i);
      const title = steps[i]?.querySelector<HTMLElement>(".step__title, .hero__title");
      if (!sp && title) {
        sp = SplitText.create(title, { type: "lines", mask: "lines", linesClass: "split-line" });
        splits.current.set(i, sp);
      }
      return sp;
    };
    const from = prev.current;
    prev.current = step;
    const incoming = steps[step];
    if (!incoming) return;
    const tl = gsap.timeline();
    if (from >= 0 && from !== step && steps[from]) {
      const out = steps[from];
      const sp = getSplit(from);
      tl.to(sp?.lines ?? [], { yPercent: -105, duration: 0.45, ease: EASE.inOut, stagger: 0.03 }, 0).to(out.querySelectorAll(".step__rest > *"), { autoAlpha: 0, y: -14, duration: 0.3, ease: "power2.in" }, 0);
      tl.set(out, { autoAlpha: 0 });
    }
    const sp = getSplit(step);
    tl.set(incoming, { autoAlpha: 1 }, from >= 0 ? 0.28 : 0)
      .fromTo(sp?.lines ?? [], { yPercent: 108 }, { yPercent: 0, duration: 1, ease: EASE.out, stagger: 0.08 }, "<")
      .fromTo(incoming.querySelectorAll(".step__rest > *"), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: EASE.out, stagger: 0.06 }, "<0.15");
    return () => {
      tl.progress(1).kill();
    };
  }, [step, intro, reduced]);

  useEffect(
    () => () => {
      splits.current.forEach((s) => s.revert());
      splits.current.clear();
    },
    [],
  );

  const sample = () => navigate("/report?city=Delhi&units=476&month=5&roof=1100&sample=delhi-may");

  return (
    <section ref={section} className={`story${reduced ? " story--static" : ""}`} aria-label="How Chhat works, from dawn to night">
      <a className="story__skip" href="#tools-title" onClick={(e) => { e.preventDefault(); document.getElementById("tools")?.scrollIntoView(); }}>
        Skip the story
      </a>
      <div ref={stage} className="story__stage" data-dark="false" data-intro={intro}>
        <div className="story__canvas" aria-hidden="true">
          {gl ? (
            <Suspense fallback={<div className="story__poster" />}>
              <RoofScene state={state} roof={HERO_ROOF} lowPower={low} quality={quality} onReady={onReady} paused={!visible} />
            </Suspense>
          ) : (
            <div className="story__poster story__poster--img" style={{ backgroundImage: "url(./poster.jpg)" }} />
          )}
        </div>
        <div className="story__scrim" aria-hidden="true" />

        <div className="hud mono" aria-hidden="true">
          <div className="hud__cell hud__cell--clock">
            <span className="hud__k">IST</span>
            <span className="hud__v hud__v--big">
              <span ref={clock}>06:42</span>
            </span>
          </div>
          <div className="hud__cell">
            <span className="hud__k">Sun altitude</span>
            <span className="hud__v">
              <span ref={sunAlt}>0.0°</span>
            </span>
          </div>
          <div className="hud__cell">
            <span className="hud__k">Roof output</span>
            <span className="hud__v">
              <span ref={kw}>0.00</span> kW
            </span>
          </div>
          <div className="hud__cell hud__cell--wide">
            <span className="hud__k">Delhi · 28.61°N 77.21°E · 15 Apr</span>
            <span className="hud__v">{num(sy)} kWh/kWp·yr</span>
          </div>
        </div>

        <div className="chapters">
          {/* 0. Dawn: hero */}
          <article className="step step--hero" data-active={step === 0}>
            <p className="eyebrow step__eyebrow">Independent AI solar advisor · India</p>
            <h1 className="hero__title">
              Every Indian roof <span className="hero__title-em">has a number.</span>
            </h1>
            <div className="step__rest">
              <p className="hero__lede">
                Chhat reads your electricity bill, models your roof on 20 years of NASA sunlight, stacks every subsidy, and checks the installer's quote before you sign.
              </p>
              <div className="hero__ctas">
                <Link ref={ctaPrimary} to="/report" className="btn btn--accent btn--lg btn--magnet">
                  Read my roof <ArrowRight size={18} weight="bold" />
                </Link>
                <button type="button" className="btn btn--ghost btn--lg" onClick={sample}>
                  Try a sample house
                </button>
              </div>
              <p className="hero__fact mono">
                <Lightning size={14} weight="fill" /> {HERO_KWP} kWp in Delhi ≈ {num(sy * HERO_KWP)} units a year · NASA POWER 2001-2020
              </p>
            </div>
          </article>

          <article className="step" data-active={step === 1}>
            <p className="eyebrow step__eyebrow">The gap</p>
            <h2 className="step__title">637 GW of roofs. 5% willing.</h2>
            <div className="step__rest">
              <p className="step__body">
                CEEW counted 637 GW of solar potential on Indian homes. Only one household in twenty says it would install. The sunlight is there. Trust in the numbers isn't.
              </p>
              <p className="step__src mono">CEEW, 2023 · 51 lakh PM Surya Ghar homes by Sep 2026</p>
            </div>
          </article>

          <article className="step" data-active={step === 2}>
            <p className="eyebrow step__eyebrow">The sun</p>
            <h2 className="step__title">Your roof already gets the energy.</h2>
            <div className="step__rest">
              <p className="step__body">
                Delhi averages 4.89 kWh of sunlight per square metre a day. Chhat tilts that onto your panels month by month, takes off heat and wiring losses, and checks it against your bill.
              </p>
              <div className="step__chips">
                <span className="chip">Klein + Erbs + Liu-Jordan</span>
                <span className="chip">−0.35%/°C</span>
                <span className="chip">72 cities, live for any lat/lon</span>
              </div>
            </div>
          </article>

          <article className="step" data-active={step === 3}>
            <p className="eyebrow step__eyebrow">The system</p>
            <h2 className="step__title">Six panels. ₹1,08,000 back.</h2>
            <div className="step__rest">
              <p className="step__body">
                PM Surya Ghar pays ₹78,000 for 3 kW. Delhi adds ₹30,000. Chhat stacks both, picks the panel count with the best 25-year return, and tells you if the subsidy sweet spot is one panel away.
              </p>
              <div className="step__grid">
                <Stat label="System" value={`${HERO_KWP} kWp`} />
                <Stat label="Subsidy" hi="सब्सिडी" value="₹1.08 L" />
              </div>
            </div>
          </article>

          <article className="step" data-active={step === 4}>
            <p className="eyebrow step__eyebrow">The quote</p>
            <h2 className="step__title">Then it reads the quote.</h2>
            <div className="step__rest">
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
            </div>
          </article>

          <article className="step" data-active={step === 5}>
            <p className="eyebrow step__eyebrow">The bill</p>
            <h2 className="step__title">And every bill after.</h2>
            <div className="step__rest">
              <p className="step__bill">
                <span ref={billNum} className="mono">
                  ₹3,840
                </span>
                <span className="step__bill-label">this month</span>
              </p>
              <p className="step__body">
                In July 2026 MNRE admitted DISCOMs were sending wrong bills to new solar homes: exports ignored, net meters never switched on. Chhat checks the arithmetic and drafts the letter.
              </p>
            </div>
          </article>

          <article className="step step--cta" data-active={step === 6}>
            <p className="eyebrow step__eyebrow">Your turn</p>
            <h2 className="step__title step__title--big">Read your roof.</h2>
            <div className="step__rest">
              <p className="step__body">Two minutes, one bill, no login. Nobody calls you afterwards.</p>
              <div className="hero__ctas">
                <LinkButton to="/report" variant="accent" size="lg">
                  Start the Roof Report <ArrowRight size={18} weight="bold" />
                </LinkButton>
                <LinkButton to="/quote" variant="ghost" size="lg">
                  Check a quote
                </LinkButton>
              </div>
            </div>
          </article>
        </div>

        <div className="story__foot mono" aria-hidden="true">
          <div className="story__ticks">
            {STEPS.map((_, i) => (
              <span key={i} data-on={i <= step} />
            ))}
          </div>
          <span ref={chapterLabel} className="story__chapter">
            01 / 07 · Dawn
          </span>
          <span className="story__scroll">Scroll through a day on this roof</span>
        </div>
        <div className="story__dial" aria-hidden="true">
          <SunDial dialRef={dial} />
          <span className="story__dial-cap mono">
            <SunHorizon size={13} weight="bold" /> NOAA sun path
          </span>
        </div>
      </div>
    </section>
  );
}

/* ---------------- manifesto: words light up as you read ---------------- */

function Manifesto() {
  const p = useRef<HTMLParagraphElement>(null);
  useLayoutEffect(() => {
    const el = p.current;
    if (!el || prefersReducedMotion()) return;
    let split: SplitText | null = null;
    let st: ScrollTrigger | undefined;
    let dead = false;
    document.fonts.ready.then(() => {
      if (dead) return;
      // The words stay plain text in the paragraph, so no ARIA rewrite is needed
      // (aria-label is not allowed on a <p>).
      split = SplitText.create(el, { type: "words", wordsClass: "mf-word", aria: "none" });
      // Unread words are a grey that still passes WCAG AA, so the effect never hides text.
      const tween = gsap.fromTo(split.words, { color: "#5f6676" }, { color: "#161c36", ease: "none", stagger: 0.12, scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 45%", scrub: 0.4 } });
      st = tween.scrollTrigger;
    });
    return () => {
      dead = true;
      st?.kill();
      split?.revert();
    };
  }, []);
  return (
    <section className="manifesto wrap" aria-labelledby="mf-title">
      <h2 id="mf-title" className="eyebrow">
        Why Chhat exists
      </h2>
      <p ref={p} className="manifesto__text">
        Sunlight isn't India's solar problem. Trust is. The same 3 kW system is quoted anywhere from ₹1.35 lakh to ₹2.1 lakh, the panel rules changed in June, and the first bill after going solar is often
        wrong. Chhat is the second opinion that works for the homeowner, <em>not the installer.</em>
      </p>
    </section>
  );
}

/* ---------------- velocity marquee ---------------- */

function CityMarquee() {
  const lenis = useLenis();
  const rows = useRef<(HTMLDivElement | null)[]>([]);
  const items = useMemo(
    () =>
      CITIES.map((c) => ({ name: c.name, y: specificYield(climateFromCity(c)) }))
        .sort((a, b) => b.y - a.y)
        .slice(0, 36),
    [],
  );
  const halves = [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let v = 0;
    const offs = [0, 0];
    const onScroll = (l: { velocity: number }) => {
      v = l.velocity;
    };
    lenis?.on("scroll", onScroll);
    let boost = 0;
    const tick = (_: number, dt: number) => {
      boost += (Math.min(40, Math.abs(v)) - boost) * 0.08;
      v *= 0.92;
      const dir = Math.sign(v) || 1;
      rows.current.forEach((row, i) => {
        if (!row) return;
        const w = row.scrollWidth / 2;
        const speed = (0.035 + boost * 0.012) * dt * (i === 0 ? 1 : -1) * dir;
        offs[i] = (offs[i] - speed + w) % w;
        row.style.transform = `translate3d(${-offs[i]}px,0,0) skewX(${(-boost * 0.25 * (i === 0 ? 1 : -1)).toFixed(2)}deg)`;
      });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.off("scroll", onScroll);
    };
  }, [lenis]);

  return (
    <section className="marquee" aria-label="Annual kWh per kWp by city, from NASA POWER">
      <p className="marquee__cap mono wrap">kWh a year from one kWp of panels · NASA POWER 2001-2020 · {CITIES.length} cities</p>
      {halves.map((h, i) => (
        <div key={i} className={`marquee__track${i ? " marquee__track--alt" : ""}`} aria-hidden={i === 1}>
          <div
            ref={(r) => {
              rows.current[i] = r;
            }}
            className="marquee__row"
          >
            {[...h, ...h].map((it, k) => (
              <span key={`${it.name}-${k}`} className="marquee__item">
                {it.name}
                <b className="mono">{num(it.y)}</b>
                <span className="marquee__dot" aria-hidden="true" />
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ---------------- tools: stacking cards ---------------- */

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
  const root = useRef<HTMLElement>(null);
  useReveals(root);
  useLayoutEffect(() => {
    const host = root.current;
    if (!host || prefersReducedMotion() || window.matchMedia("(max-width: 760px)").matches) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".stack-card");
      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;
        const st = { trigger: cards[i + 1], start: "top bottom", end: "top 18%", scrub: true };
        // The card underneath recedes: a little smaller, a little darker.
        gsap.fromTo(card.querySelector(".stack-card__inner"), { scale: 1 }, { scale: 0.92, ease: "none", scrollTrigger: st });
        gsap.fromTo(card.querySelector(".stack-card__shade"), { opacity: 0 }, { opacity: 0.32, ease: "none", scrollTrigger: { ...st } });
      });
    }, host);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={root} id="tools" className="tools" aria-labelledby="tools-title">
      <div className="wrap section-head">
        <p className="eyebrow" data-reveal="up">
          What you get
        </p>
        <h2 id="tools-title" className="section-title" data-reveal="lines">
          Four checks between you and a bad deal.
        </h2>
      </div>
      <div className="stack wrap">
        <article className="stack-card stack-card--report">
          <div className="stack-card__inner">
            <span className="stack-card__shade" aria-hidden="true" />
            <div className="stack-card__text">
              <span className="stack-card__k mono">01</span>
              <h3 className="stack-card__title">
                Roof Report <span className="deva">छत रिपोर्ट</span>
              </h3>
              <p className="stack-card__body">Size, generation, subsidy, loan and 25-year payback from one bill. Pick a city, type a number, watch it change.</p>
              <span className="stack-card__icon" aria-hidden="true">
                <SunHorizon size={30} weight="duotone" />
              </span>
            </div>
            <div className="stack-card__demo">
              <QuickReport />
            </div>
          </div>
        </article>

        <article className="stack-card stack-card--quote">
          <div className="stack-card__inner">
            <span className="stack-card__shade" aria-hidden="true" />
            <div className="stack-card__text">
              <span className="stack-card__k mono">02</span>
              <h3 className="stack-card__title">Quote Check</h3>
              <span className="stack-card__icon" aria-hidden="true">
                <FileMagnifyingGlass size={30} weight="duotone" />
              </span>
              <p className="stack-card__body">14 checks against the fair price, DCR and ALMM rules, warranties, structure, GST and payment terms. With a message to send the vendor, in English or Hindi.</p>
              <LinkButton to="/quote?sample=overcharger" variant="primary" data-cursor="Audit">
                Audit a sample quote <ArrowUpRight size={16} weight="bold" />
              </LinkButton>
            </div>
            <div className="stack-card__demo" aria-hidden="true">
              <div className="paper">
                <div className="paper__head">
                  <span className="mono">QTN/2026/0419</span>
                  <span>Sunrise Solar Pvt Ltd</span>
                </div>
                {["3 kW On-Grid System|₹2,41,256", "Panels 5 × 540 Wp|imported", "Inverter 3 kW|1 nos", "GST @ 13.8%|₹29,256", "Advance|100%"].map((l) => {
                  const [a, b] = l.split("|");
                  return (
                    <div key={a} className="paper__line">
                      <span>{a}</span>
                      <span className="mono">{b}</span>
                    </div>
                  );
                })}
                <span className="grade-stamp">F</span>
              </div>
            </div>
          </div>
        </article>

        <article className="stack-card stack-card--bill">
          <div className="stack-card__inner">
            <span className="stack-card__shade" aria-hidden="true" />
            <div className="stack-card__text">
              <span className="stack-card__k mono">03</span>
              <h3 className="stack-card__title">Bill Audit</h3>
              <span className="stack-card__icon" aria-hidden="true">
                <Receipt size={30} weight="duotone" />
              </span>
              <p className="stack-card__body">For homes that already went solar. Checks the meter arithmetic on every DISCOM bill and drafts the correction letter.</p>
              <LinkButton to="/bill?sample=import-billed" variant="accent" data-cursor="Audit">
                Audit a sample bill <ArrowUpRight size={16} weight="bold" />
              </LinkButton>
            </div>
            <div className="stack-card__demo" aria-hidden="true">
              <div className="meter-math mono">
                <span>410 import</span>
                <span>− 236 export</span>
                <span className="meter-math__eq">= 174 units</span>
                <span className="meter-math__bad">billed 410</span>
              </div>
            </div>
          </div>
        </article>

        <article className="stack-card stack-card--ask">
          <div className="stack-card__inner">
            <span className="stack-card__shade" aria-hidden="true" />
            <div className="stack-card__text">
              <span className="stack-card__k mono">04</span>
              <h3 className="stack-card__title">Ask Chhat</h3>
              <span className="stack-card__icon" aria-hidden="true">
                <Lightning size={30} weight="duotone" />
              </span>
              <p className="stack-card__body">An agent that answers in Hindi, Hinglish or English, and only quotes numbers its tools computed. Open the trace on any answer to see which.</p>
              <button type="button" className="btn btn--accent" onClick={() => open("Lucknow, 380 units a month. What size should I install?")}>
                Ask a question <ArrowUpRight size={16} weight="bold" />
              </button>
            </div>
            <div className="stack-card__demo" aria-hidden="true">
              <div className="mini-chat">
                <span className="mini-chat__q">लखनऊ में 3 kW पर कितनी सब्सिडी?</span>
                <span className="mini-chat__a">केंद्र ₹78,000 + राज्य ₹30,000 = ₹1,08,000</span>
                <span className="mini-chat__t mono">compute_subsidy(kw: 3, state_code: "UP")</span>
              </div>
            </div>
          </div>
        </article>
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
  const bar = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (prefersReducedMotion() || window.matchMedia("(max-width: 900px)").matches) return;
    const ctx = gsap.context(() => {
      const t = track.current!;
      gsap.to(t, {
        x: () => -(t.scrollWidth - window.innerWidth + 48),
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${t.scrollWidth}`,
          scrub: 0.6,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => bar.current && (bar.current.style.transform = `scaleX(${self.progress})`),
        },
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
            What Chhat learns while it helps.
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
      <div className="learns__bar" aria-hidden="true">
        <div ref={bar} />
      </div>
    </section>
  );
}

/* ---------------- who pays ---------------- */

function Payers() {
  const root = useRef<HTMLElement>(null);
  useReveals(root);
  return (
    <section ref={root} id="installers" className="payers wrap" aria-labelledby="payers-title">
      <div className="section-head section-head--split">
        <div>
          <p className="eyebrow" data-reveal="up">
            Business model
          </p>
          <h2 id="payers-title" className="section-title" data-reveal="lines">
            Free for homes. Paid for by the people who want to sell to them.
          </h2>
        </div>
      </div>
      <div className="payers__rows">
        <article className="payer payer--main" data-reveal="up">
          <p className="payer__who">Installers</p>
          <h3 className="payer__price">
            ₹1,500 <span>per verified lead + 2% on install</span>
          </h3>
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
        <article className="payer" data-reveal="up">
          <p className="payer__who">Banks & NBFCs</p>
          <h3 className="payer__price">
            1% <span>of loan originated</span>
          </h3>
          <p>PM Surya Ghar loans are small and collateral-free. Chhat hands lenders a sized system, a verified bill and a cash-flow case before the first call.</p>
        </article>
        <article className="payer" data-reveal="up">
          <p className="payer__who">DISCOMs & state agencies</p>
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
  { big: "51 lakh", count: true, label: "PM Surya Ghar installations by late Sep 2026, half the 1 crore target", src: "DD India / MNRE", url: "https://ddindia.co.in/2026/08/pm-surya-ghar-scheme-crosses-50-lakh-rooftop-solar-installations/" },
  { big: "5%", count: true, label: "of households willing to install rooftop solar (13% in Gujarat)", src: "CEEW 2023", url: "https://pv-magazine-india.com/2023/11/16/indias-residential-rooftop-solar-potential-estimated-at-637-gw" },
  { big: "₹78,000", count: true, label: "central subsidy for 3 kW; ₹85,800 in special-category states", src: "MNRE", url: "https://www.cag.org.in/sites/default/files/database/2.%20PM%20Surya%20Ghar%20Scheme-%20A%20consumer%20manual%20%281%29.pdf" },
  { big: "Jul 2026", count: false, label: "MNRE acknowledges wrong DISCOM bills after rooftop installs", src: "Energetica India", url: "https://www.energetica-india.net/news/mnre-flags-incorrect-rooftop-solar-billing-by-discoms-refers-complaints-for-resolution" },
  { big: "1 Jun 2026", count: false, label: "ALMM List-II: subsidised panels need listed domestic cells", src: "TaiyangNews", url: "https://taiyangnews.info/markets/mnre-clarifies-almm-list-ii-exemption-pm-surya-ghar-users" },
  { big: "8.9%", count: true, label: "effective GST on installed solar since 22 Sep 2025 (was ~13.8%)", src: "EQ Mag", url: "https://www.eqmagpro.com/gst-on-renewable-energy-devices-rationalised-to-5-to-accelerate-indias-clean-energy-transition-eq/" },
  { big: "$53M", count: true, label: "SolarSquare's Series C, Jun 2026: the market is real and funded", src: "Mercom", url: "https://mercomindia.com/solarsquare-raises-53-million-in-series-c-funding-round" },
  { big: "0.727", count: true, label: "tCO₂ per MWh, India's grid emission factor (FY24)", src: "CEA", url: "https://solarquarter.com/2025/01/06/co2-baseline-database-highlights-indias-progress-in-renewable-energy-and-emission-reduction-cea/" },
];

function Proof() {
  const root = useRef<HTMLElement>(null);
  useReveals(root);
  useLayoutEffect(() => {
    const host = root.current;
    if (!host) return;
    const undo = Array.from(host.querySelectorAll<HTMLElement>("[data-count]")).map(countUp);
    return () => undo.forEach((f) => f());
  }, []);
  return (
    <section ref={root} className="proof wrap" aria-labelledby="proof-title">
      <div className="section-head section-head--split">
        <h2 id="proof-title" className="section-title" data-reveal="lines">
          Numbers we didn't make up.
        </h2>
        <p className="section-lede" data-reveal="up">
          Every figure on this site links to where it came from. When sources disagreed, the research log in the repo says which one we picked and why.
        </p>
      </div>
      <div className="proof__grid">
        {FACTS.map((f) => (
          <a key={f.big} className="fact" href={f.url} target="_blank" rel="noreferrer" data-reveal="up" data-cursor="Source">
            <span className="fact__big" {...(f.count ? { "data-count": "" } : {})}>
              {f.big}
            </span>
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
  const root = useRef<HTMLElement>(null);
  useReveals(root);
  const log = buildlog as { stats: { commits: number; files: number; linesAdded: number; tests: number; e2e?: number }; commits: { hash: string; subject: string; added: number }[] };
  return (
    <section ref={root} className="built wrap" aria-labelledby="built-title">
      <div className="built__card">
        <div className="built__copy">
          <p className="eyebrow">AI-first, with receipts</p>
          <h2 id="built-title" className="section-title" data-reveal="lines">
            Claude did the research, the code and this sentence.
          </h2>
          <p className="section-lede" data-reveal="up">
            Research, a 25-idea tournament, the PV model, the 3D roof, the tests, the deck and the financial model were all produced by Claude Code from two briefs. A person set the goals and reviewed the result.
          </p>
          <LinkButton to="/built-with-ai" variant="accent" data-cursor="Read">
            See the build log <ArrowRight size={16} weight="bold" />
          </LinkButton>
        </div>
        <div className="built__term mono" aria-label="Recent commits">
          <div className="built__term-bar">
            <span />
            <span />
            <span />
            <em>git log --oneline</em>
          </div>
          <ol>
            {log.commits
              .slice(-8)
              .reverse()
              .map((c) => (
                <li key={c.hash} data-reveal="up">
                  <b>{c.hash}</b> {c.subject}
                  <i>+{num(c.added)}</i>
                </li>
              ))}
          </ol>
          <div className="built__stats">
            <Stat label="Commits" value={num(log.stats.commits)} />
            <Stat label="Lines written" value={num(log.stats.linesAdded)} />
            <Stat label="Automated tests" value={num(log.stats.tests + (log.stats.e2e ?? 0))} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Final() {
  const root = useRef<HTMLElement>(null);
  const sun = useRef<HTMLDivElement>(null);
  const btn = useMagnetic<HTMLAnchorElement>(0.4);
  useReveals(root);
  useLayoutEffect(() => {
    if (!sun.current || prefersReducedMotion()) return;
    const tw = gsap.fromTo(sun.current, { yPercent: 60 }, { yPercent: -10, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true } });
    return () => {
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, []);
  return (
    <section ref={root} className="final" aria-labelledby="final-title">
      <div ref={sun} className="final__sun" aria-hidden="true" />
      <span className="final__deva deva" aria-hidden="true">
        छत
      </span>
      <div className="final__inner wrap">
        <h2 id="final-title" className="final__title" data-reveal="lines">
          Before you sign anything, read your roof.
        </h2>
        <div className="hero__ctas" data-reveal="up">
          <Link ref={btn} to="/report" className="btn btn--accent btn--lg btn--magnet">
            Start the Roof Report <ArrowRight size={18} weight="bold" />
          </Link>
          <LinkButton to="/quote" variant="ghost" size="lg">
            I already have a quote
          </LinkButton>
        </div>
      </div>
    </section>
  );
}

/* ---------------- page ---------------- */

export default function Landing() {
  const state = useRef<SceneState>({ lat: 28.61, lon: 77.21, doy: DOY, hour: 6.7, panels: 6, drop: 0, camT: 0, viewX: 0 });
  const gl = useMemo(hasWebGL, []);
  const [parts, setParts] = useState({ fonts: 0, scene: 0, assets: 0, frame: gl ? 0 : 1 });
  const [intro, setIntro] = useState(false);
  const [ready, setReady] = useState(!gl);
  const lenis = useLenis();

  useEffect(() => {
    document.title = "Chhat: solar, without the sales pitch";
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    let live = true;
    document.fonts.ready.then(() => live && setParts((p) => ({ ...p, fonts: 1 })));
    // three.js arrives with these chunks, after the preloader has painted.
    let off = () => {};
    if (gl) {
      sceneModule().then(() => live && setParts((p) => ({ ...p, scene: 1 })));
      import("../three/assets").then((a) => {
        if (!live) return;
        a.preloadSceneAssets([...MODEL_NAMES], [...TEXTURE_NAMES]);
        off = a.onAssetProgress((v) => live && setParts((p) => ({ ...p, assets: v })));
      });
    } else {
      setParts((p) => ({ ...p, scene: 1, assets: 1 }));
    }
    // Never hold anyone hostage to a slow network or GPU.
    const bail = window.setTimeout(() => setReady(true), 12000);
    return () => {
      live = false;
      off();
      cancelAnimationFrame(id);
      window.clearTimeout(bail);
    };
  }, [gl]);

  // Keep the page still while the intro plays.
  useEffect(() => {
    if (!lenis) return;
    if (intro) lenis.start();
    else lenis.stop();
    return () => lenis.start();
  }, [lenis, intro]);

  const onSceneReady = useCallback(() => {
    setParts((p) => ({ ...p, frame: 1 }));
    setReady(true);
  }, []);
  const onExit = useCallback(() => {
    setIntro(true);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  const progress = parts.fonts * 0.1 + parts.scene * 0.2 + parts.assets * 0.5 + parts.frame * 0.2;
  const done = ready && parts.fonts === 1;

  return (
    <>
      <Preloader progress={progress} done={done} onExit={onExit} />
      <Story state={state} intro={intro} onReady={onSceneReady} />
      <Manifesto />
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

