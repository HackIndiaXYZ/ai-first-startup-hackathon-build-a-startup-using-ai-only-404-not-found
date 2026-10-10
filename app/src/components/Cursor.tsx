import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { prefersReducedMotion } from "../lib/env";
import { gsap } from "../lib/motion";

/**
 * A small sun for a cursor: a dot that tracks the pointer exactly and a ring
 * that trails it. Over anything clickable the ring swells; elements with
 * `data-cursor="Label"` show that label inside it. Fine pointers only, never
 * with reduced motion, and the native cursor stays on form fields.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const loc = useLocation();

  useEffect(() => {
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(d, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });
    let shown = false;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        shown = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest) return;
      const field = t.closest("input, textarea, select, [contenteditable='true']");
      const labelled = t.closest<HTMLElement>("[data-cursor]");
      const clickable = t.closest("a, button, [role='button'], [role='tab'], [role='slider'], label");
      r.dataset.state = field ? "hidden" : labelled ? "label" : clickable ? "hover" : "idle";
      d.dataset.state = field ? "hidden" : "idle";
      if (label.current) label.current.textContent = labelled?.dataset.cursor ?? "";
    };
    const leave = () => gsap.to([d, r], { autoAlpha: 0, duration: 0.2, onComplete: () => void (shown = false) });
    const down = () => gsap.to(r, { scale: 0.82, duration: 0.15 });
    const up = () => gsap.to(r, { scale: 1, duration: 0.3, ease: "back.out(2)" });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  // A route change swaps the element under the pointer without a pointerover.
  useEffect(() => {
    if (ring.current) ring.current.dataset.state = "idle";
  }, [loc.pathname]);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor__ring" data-state="idle">
        <span ref={label} className="cursor__label" />
      </div>
      <div ref={dot} className="cursor__dot" data-state="idle" />
    </div>
  );
}
