// Shared motion vocabulary. One set of eases and one reveal pattern for the
// whole product, so every page moves the same way.
//
//   out   – entrances (expo-ish settle)
//   inOut – things travelling between two on-screen states
//   drawer – the route curtain

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { formatCount, parseCount } from "./count";
import { prefersReducedMotion } from "./env";

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

export const EASE = {
  out: CustomEase.create("chhat-out", "M0,0 C0.16,1 0.3,1 1,1"),
  inOut: CustomEase.create("chhat-inout", "M0,0 C0.76,0 0.24,1 1,1"),
  drawer: CustomEase.create("chhat-drawer", "M0,0 C0.32,0.72 0,1 1,1"),
};

export { gsap, ScrollTrigger, SplitText };

const fine = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/**
 * Line-by-line masked reveal for display type. Splits after fonts load,
 * re-splits on resize (autoSplit) and restores the DOM on cleanup.
 */
export function revealLines(
  el: HTMLElement,
  opts: { delay?: number; stagger?: number; duration?: number; scroll?: boolean; start?: string } = {},
): () => void {
  if (prefersReducedMotion()) return () => {};
  const { delay = 0, stagger = 0.09, duration = 1.05, scroll = true, start = "top 88%" } = opts;
  let split: SplitText | null = null;
  let cancelled = false;
  // Hide until the split is ready so there is no flash of unsplit text.
  gsap.set(el, { autoAlpha: 0 });
  document.fonts.ready.then(() => {
    if (cancelled) return;
    gsap.set(el, { autoAlpha: 1 });
    split = SplitText.create(el, {
      type: "lines",
      mask: "lines",
      linesClass: "split-line",
      autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration,
          ease: EASE.out,
          stagger,
          delay,
          scrollTrigger: scroll ? { trigger: el, start, once: true } : undefined,
        });
      },
    });
  });
  return () => {
    cancelled = true;
    split?.revert();
  };
}

/** Reveal every `[data-reveal]` inside a container as it scrolls into view. */
export function useReveals(root: RefObject<HTMLElement>, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const host = root.current;
    if (!host || prefersReducedMotion()) return;
    const undo: (() => void)[] = [];
    const ctx = gsap.context(() => {
      host.querySelectorAll<HTMLElement>("[data-reveal='lines']").forEach((el) => undo.push(revealLines(el)));
      const fades = host.querySelectorAll<HTMLElement>("[data-reveal='up']");
      if (fades.length) {
        gsap.set(fades, { autoAlpha: 0, y: 28 });
        ScrollTrigger.batch(fades, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE.out, stagger: 0.07, overwrite: true }),
        });
      }
    }, host);
    return () => {
      undo.forEach((f) => f());
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Buttons that lean toward the pointer, then spring back. Fine pointers only. */
export function useMagnetic<T extends HTMLElement>(strength = 0.32) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !fine() || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.45)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.45)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength]);
  return ref;
}

/**
 * Count a number up when it scrolls into view. The element's text is the
 * final value; prefix, suffix and Indian digit grouping are preserved.
 */
export function countUp(el: HTMLElement): () => void {
  const final = el.textContent ?? "";
  const spec = parseCount(final);
  if (!spec || prefersReducedMotion()) return () => {};
  const obj = { v: 0 };
  el.textContent = formatCount(spec, 0);
  const tween = gsap.to(obj, {
    v: spec.target,
    duration: 1.6,
    ease: "power3.out",
    scrollTrigger: { trigger: el, start: "top 92%", once: true },
    onUpdate: () => {
      el.textContent = formatCount(spec, obj.v);
    },
    onComplete: () => {
      el.textContent = final;
    },
  });
  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    el.textContent = final;
  };
}

/**
 * Entrance for a tool page: the title rises line by line once the route
 * curtain has lifted, the rest of the header follows, and top-level
 * sections fade up the first time they scroll into view.
 */
export function usePageIntro<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    const undo: (() => void)[] = [];
    const ctx = gsap.context(() => {
      const title = root.querySelector<HTMLElement>(".page__title");
      if (title) undo.push(revealLines(title, { scroll: false, delay: 0.32, stagger: 0.08 }));
      const rest = root.querySelectorAll<HTMLElement>(".page__head > :not(.page__title)");
      if (rest.length) gsap.from(rest, { autoAlpha: 0, y: 16, duration: 0.8, ease: EASE.out, stagger: 0.06, delay: 0.42 });
      const sections = root.querySelectorAll<HTMLElement>(":scope > section");
      if (sections.length) {
        gsap.set(sections, { autoAlpha: 0, y: 24 });
        ScrollTrigger.batch(sections, {
          start: "top 94%",
          once: true,
          onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE.out, stagger: 0.08, delay: 0.5, overwrite: true, clearProps: "transform" }),
        });
      }
    }, root);
    return () => {
      undo.forEach((f) => f());
      ctx.revert();
    };
  }, []);
  return ref;
}
