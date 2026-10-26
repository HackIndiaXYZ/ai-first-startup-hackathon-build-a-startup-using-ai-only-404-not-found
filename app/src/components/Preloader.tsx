import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion, safeStorage } from "../lib/env";
import { EASE, gsap } from "../lib/motion";

/** Loading steps, in the order they really happen. */
const LINES = ["Fonts", "Rooftop scene", "6 CC0 models · Poly Haven", "NASA POWER sunlight, 2001-2020", "First frame"];

/**
 * The landing intro. A sun rises behind छत as the scene really loads, the
 * counter follows real progress, then the panel lifts off the rooftop.
 * Returning visitors in the same session get a short version.
 */
export function Preloader({ progress, done, onExit }: { progress: number; done: boolean; onExit: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const sun = useRef<HTMLDivElement>(null);
  const shown = useRef(0);
  const target = useRef(0);
  const [gone, setGone] = useState(false);
  const [quick] = useState(() => prefersReducedMotion() || safeStorage().get("chhat:intro") === "1");
  const started = useRef(performance.now());
  const exiting = useRef(false);
  target.current = progress;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      // Ease the visible number toward real progress; never jump backwards.
      const goal = Math.max(shown.current, target.current * 100);
      shown.current += (goal - shown.current) * 0.08 + (goal > shown.current ? 0.15 : 0);
      shown.current = Math.min(shown.current, goal);
      if (num.current) num.current.textContent = String(Math.floor(shown.current)).padStart(3, "0");
      if (sun.current) sun.current.style.setProperty("--p", String(shown.current / 100));
      raf = requestAnimationFrame(tick);
    };
    if (!quick) raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [quick]);

  useEffect(() => {
    if (!done || exiting.current) return;
    const el = root.current;
    if (!el) return;
    const minShow = quick ? 0 : 1500;
    const wait = Math.max(0, minShow - (performance.now() - started.current));
    const t = window.setTimeout(() => {
      exiting.current = true;
      safeStorage().set("chhat:intro", "1");
      if (num.current) num.current.textContent = "100";
      if (sun.current) sun.current.style.setProperty("--p", "1");
      let handed = false;
      const handOver = () => {
        if (handed) return;
        handed = true;
        onExit();
      };
      const finish = () => {
        handOver();
        setGone(true);
      };
      if (prefersReducedMotion()) {
        gsap.to(el, { autoAlpha: 0, duration: 0.25, onComplete: finish });
        return;
      }
      const tl = gsap.timeline({ onComplete: finish });
      if (quick) {
        tl.to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7, ease: EASE.inOut });
      } else {
        tl.to(el.querySelectorAll(".pre__mark, .pre__meta"), { yPercent: -30, autoAlpha: 0, duration: 0.7, ease: EASE.inOut, stagger: 0.05 })
          .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.05, ease: EASE.inOut }, "-=0.45");
      }
      // Hand over to the hero a beat before the panel clears.
      tl.call(handOver, [], `-=${quick ? 0.35 : 0.55}`);
    }, wait);
    return () => window.clearTimeout(t);
  }, [done, quick, onExit]);

  if (gone) return null;
  const step = Math.min(LINES.length - 1, Math.floor(progress * LINES.length));
  return (
    <div ref={root} className={`pre${quick ? " pre--quick" : ""}`} role="status" aria-live="polite" aria-label="Loading the rooftop">
      {!quick && (
        <>
          <div className="pre__mark" aria-hidden="true">
            <div ref={sun} className="pre__sun" />
            <span className="pre__deva deva">छत</span>
          </div>
          <div className="pre__meta mono">
            <span className="pre__count">
              <span ref={num}>000</span>
            </span>
            <ul className="pre__steps">
              {LINES.map((l, i) => (
                <li key={l} data-on={i <= step}>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
