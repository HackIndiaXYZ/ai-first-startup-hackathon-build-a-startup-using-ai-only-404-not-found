export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

let webgl: boolean | null = null;
export function hasWebGL(): boolean {
  if (webgl !== null) return webgl;
  try {
    const c = document.createElement("canvas");
    webgl = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  return webgl;
}

export function isLowPower(): boolean {
  if (typeof navigator === "undefined") return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const small = window.matchMedia("(max-width: 760px)").matches;
  return cores <= 2 || small;
}

export function safeStorage() {
  return {
    get(key: string): string | null {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key: string, value: string) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* storage unavailable: fine */
      }
    },
  };
}
