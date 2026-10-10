// An init script that replaces the page's clock. performance.now, Date.now,
// requestAnimationFrame and timers only move when the caller runs
// window.__vt.step(ms), so a slow (software) GPU still produces evenly timed
// frames: GSAP, Lenis and React Three Fiber all read this clock.
export const VIRTUAL_TIME = `(() => {
  let now = 0;
  const epoch = Date.now();
  const timers = new Map();
  let tid = 1;
  const rafs = new Map();
  let rid = 1;
  performance.now = () => now;
  Date.now = () => epoch + now;
  window.setTimeout = (fn, ms = 0, ...args) => { const id = tid++; timers.set(id, { at: now + Math.max(0, +ms || 0), fn, args }); return id; };
  window.setInterval = (fn, ms = 0, ...args) => { const id = tid++; const every = Math.max(1, +ms || 0); timers.set(id, { at: now + every, fn, args, every }); return id; };
  window.clearTimeout = window.clearInterval = (id) => { timers.delete(id); };
  window.requestAnimationFrame = (cb) => { const id = rid++; rafs.set(id, cb); return id; };
  window.cancelAnimationFrame = (id) => { rafs.delete(id); };
  window.__vt = {
    step(ms) {
      const target = now + ms;
      for (let guard = 0; guard < 10000; guard++) {
        let next = null;
        for (const [id, t] of timers) if (t.at <= target && (!next || t.at < next[1].at)) next = [id, t];
        if (!next) break;
        const [id, t] = next;
        now = Math.max(now, t.at);
        if (t.every) t.at += t.every; else timers.delete(id);
        try { typeof t.fn === "function" ? t.fn(...t.args) : (0, eval)(t.fn); } catch (e) { console.error(e); }
      }
      now = target;
      const cbs = [...rafs.values()];
      rafs.clear();
      for (const cb of cbs) { try { cb(now); } catch (e) { console.error(e); } }
    },
  };
})();`;
