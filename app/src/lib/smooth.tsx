import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion } from "./env";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/** One Lenis instance for the app, driving GSAP's ticker and ScrollTrigger. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const loc = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const l = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    l.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
    };
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [loc.pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

export { gsap, ScrollTrigger };
