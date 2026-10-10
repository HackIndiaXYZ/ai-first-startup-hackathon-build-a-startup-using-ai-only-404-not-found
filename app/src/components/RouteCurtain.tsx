import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { prefersReducedMotion } from "../lib/env";
import { EASE, gsap } from "../lib/motion";

const NAMES: Record<string, [string, string]> = {
  "/": ["Chhat", "छत"],
  "/report": ["Roof Report", "छत रिपोर्ट"],
  "/quote": ["Quote Check", "कोटेशन जाँच"],
  "/bill": ["Bill Audit", "बिल जाँच"],
  "/ask": ["Ask Chhat", "छत से पूछें"],
  "/built-with-ai": ["Built with AI", "एआई से बना"],
  "/deck": ["Pitch deck", "पिच डेक"],
};

/**
 * Page transitions. A click on any in-app link draws an ink curtain up
 * over the page with the destination's name, the route changes under it,
 * then the curtain lifts away. Programmatic navigations only get the lift.
 */
export function RouteCurtain() {
  const el = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLSpanElement>(null);
  const deva = useRef<HTMLSpanElement>(null);
  const navigate = useNavigate();
  const loc = useLocation();
  const navType = useNavigationType();
  const busy = useRef(false);
  // The cover half in flight, and where it will navigate when it finishes.
  const cover = useRef<gsap.core.Timeline | null>(null);
  const target = useRef("");
  const first = useRef(true);
  const prevPath = useRef(loc.pathname);

  const setLabel = (path: string) => {
    const [en, hi] = NAMES[path] ?? ["Chhat", "छत"];
    if (title.current) title.current.textContent = en;
    if (deva.current) deva.current.textContent = hi;
  };

  // Intercept in-app link clicks to play the cover half first.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      // Links inside dialogs (Ask Chhat) run their own close handlers.
      if (a.closest("[role='dialog'], [data-no-curtain]")) return;
      const href = a.getAttribute("href") ?? "";
      if (!href.startsWith("#/")) return;
      const to = href.slice(1);
      const [path] = to.split("?");
      if (path === "/deck") return; // the deck is fullscreen; no curtain
      // A second click while the curtain is still covering: the latest click wins.
      if (cover.current) {
        e.preventDefault();
        e.stopPropagation();
        target.current = to;
        setLabel(path);
        return;
      }
      if (to === `${loc.pathname}${loc.search}` || busy.current || !el.current) return;
      // Capture phase: stop React Router's own handler, navigate after the cover.
      e.preventDefault();
      e.stopPropagation();
      busy.current = true;
      target.current = to;
      setLabel(path);
      const c = el.current;
      cover.current = gsap
        .timeline({
          onComplete: () => {
            cover.current = null;
            navigate(target.current);
          },
        })
        .set(c, { display: "grid", clipPath: "inset(100% 0% 0% 0%)" })
        .to(c, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: EASE.inOut })
        .fromTo(c.querySelectorAll(".curtain__line > span"), { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: EASE.out, stagger: 0.05 }, "-=0.25");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [loc.pathname, loc.search, navigate]);

  // After any route change: lift the curtain (covering first if needed).
  useEffect(() => {
    const samePage = prevPath.current === loc.pathname;
    prevPath.current = loc.pathname;
    if (first.current) {
      first.current = false;
      return;
    }
    if (cover.current) {
      // The page under the cover rewrote its own URL: keep covering.
      if (navType === "REPLACE") return;
      // The user went somewhere else first (back button, address bar, a
      // programmatic navigation): drop the pending one and reveal theirs.
      cover.current.kill();
      cover.current = null;
    } else if (!busy.current && (samePage || navType === "REPLACE")) {
      // A page rewriting its own URL (loading a sample, replace navigations)
      // is not a page change; only lift a curtain this component drew.
      return;
    }
    const c = el.current;
    if (!c || prefersReducedMotion() || loc.pathname === "/deck") {
      busy.current = false;
      if (c) gsap.set(c, { display: "none" });
      return;
    }
    if (!busy.current) {
      setLabel(loc.pathname);
      gsap.set(c, { display: "grid", clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(c.querySelectorAll(".curtain__line > span"), { yPercent: 0 });
    }
    const tl = gsap
      .timeline({
        delay: 0.12,
        onComplete: () => {
          busy.current = false;
          gsap.set(c, { display: "none" });
        },
      })
      .to(c.querySelectorAll(".curtain__line > span"), { yPercent: -110, duration: 0.45, ease: EASE.inOut, stagger: 0.04 })
      .to(c, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.75, ease: EASE.inOut }, "-=0.2");
    return () => {
      tl.kill();
    };
    // navType is read with the location it belongs to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.pathname, loc.search]);

  return (
    <div ref={el} className="curtain" aria-hidden="true" style={{ display: "none" }}>
      <div className="curtain__inner">
        <span className="curtain__line curtain__line--en">
          <span ref={title}>Chhat</span>
        </span>
        <span className="curtain__line curtain__line--hi deva">
          <span ref={deva}>छत</span>
        </span>
      </div>
      <span className="curtain__sun" />
    </div>
  );
}
