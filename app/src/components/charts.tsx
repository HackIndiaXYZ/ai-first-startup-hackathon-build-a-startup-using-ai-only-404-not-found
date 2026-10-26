// Hand-built SVG charts. Specs follow the dataviz method: one axis, thin marks,
// 4px rounded data-ends, 2px surface gaps, legend for 2+ series, hover tooltips,
// and a table view (the haldi series is under 3:1 contrast, so the table is required).

import { useEffect, useMemo, useRef, useState } from "react";
import { num, rupees, rupeesShort } from "../engine/format";
import { MONTHS } from "../engine/types";
import type { YearRow } from "../engine/finance";

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * p;
}

function niceTicks(min: number, max: number, count = 4) {
  const span = max - min || 1;
  const raw = span / count;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? raw;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Math.round(t));
  return ticks;
}

/** Column path with a 4px rounded top and a square base. */
function colPath(x: number, y: number, w: number, h: number, r = 4) {
  if (h <= 0) return "";
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${y + h}Z`;
}

export function MonthlyChart({ consumption, generation, billed }: { consumption: number[]; generation: number[]; billed: number[] }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const [table, setTable] = useState(false);
  const H = 260;
  const m = { t: 12, r: 8, b: 26, l: 44 };
  const iw = width - m.l - m.r;
  const ih = H - m.t - m.b;
  const max = niceMax(Math.max(...consumption, ...generation) * 1.05);
  const ticks = niceTicks(0, max, 4);
  const top = ticks[ticks.length - 1];
  const band = iw / 12;
  const bw = Math.min(24, (band - 10) / 2);
  const y = (v: number) => m.t + ih - (v / top) * ih;

  return (
    <figure className="chart">
      <div className="chart__legend">
        <span>
          <i className="key key--neel" /> Your use
        </span>
        <span>
          <i className="key key--haldi" /> Solar generation
        </span>
        <button type="button" className="chart__toggle" onClick={() => setTable((t) => !t)}>
          {table ? "Show chart" : "Show table"}
        </button>
      </div>
      {table ? (
        <div className="chart__table" data-lenis-prevent tabIndex={0} aria-label="Monthly data table">
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Use (kWh)</th>
                <th>Solar (kWh)</th>
                <th>Billed (kWh)</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((mo, i) => (
                <tr key={mo}>
                  <td>{mo}</td>
                  <td>{num(consumption[i])}</td>
                  <td>{num(generation[i])}</td>
                  <td>{num(billed[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={ref} className="chart__plot" onMouseLeave={() => setHover(null)}>
          <svg width={width} height={H} role="img" aria-label="Monthly electricity use versus solar generation">
            {ticks.map((t) => (
              <g key={t}>
                <line x1={m.l} x2={width - m.r} y1={y(t)} y2={y(t)} className="grid" />
                <text x={m.l - 8} y={y(t)} className="axis" textAnchor="end" dominantBaseline="middle">
                  {num(t)}
                </text>
              </g>
            ))}
            {MONTHS.map((mo, i) => {
              const cx = m.l + band * i + band / 2;
              return (
                <g key={mo} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${mo}: use ${Math.round(consumption[i])} kWh, solar ${Math.round(generation[i])} kWh`}>
                  <rect x={m.l + band * i} y={m.t} width={band} height={ih} className={`hit${hover === i ? " hit--on" : ""}`} />
                  <path d={colPath(cx - bw - 1, y(consumption[i]), bw, y(0) - y(consumption[i]))} className="bar bar--neel" />
                  <path d={colPath(cx + 1, y(generation[i]), bw, y(0) - y(generation[i]))} className="bar bar--haldi" />
                  <text x={cx} y={H - 8} className="axis" textAnchor="middle">
                    {width < 520 ? mo[0] : mo}
                  </text>
                </g>
              );
            })}
            <line x1={m.l} x2={width - m.r} y1={y(0)} y2={y(0)} className="baseline" />
          </svg>
          {hover !== null && (
            <div className="chart__tip" style={{ left: Math.min(width - 190, Math.max(0, m.l + band * hover + band / 2 - 95)) }}>
              <strong>{MONTHS[hover]}</strong>
              <span>
                <i className="key key--neel" /> Use {num(consumption[hover])} kWh
              </span>
              <span>
                <i className="key key--haldi" /> Solar {num(generation[hover])} kWh
              </span>
              <span className="chart__tip-muted">{billed[hover] > 0.5 ? `Billed ${num(billed[hover])} kWh` : "Bill covered by solar + credit"}</span>
            </div>
          )}
        </div>
      )}
    </figure>
  );
}

function lakhTick(v: number) {
  if (Math.abs(v) < 1e5) return rupees(v);
  const l = v / 1e5;
  return `${l < 0 ? "−" : ""}₹${Math.abs(l).toFixed(Math.abs(l) % 1 === 0 ? 0 : 1)}L`;
}

export function CashflowChart({ flows, payback }: { flows: YearRow[]; payback: number | null }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const H = 240;
  const m = { t: 18, r: 64, b: 26, l: 56 };
  const iw = width - m.l - m.r;
  const ih = H - m.t - m.b;
  const vals = flows.map((f) => f.cumulative);
  const ticks = useMemo(() => niceTicks(Math.min(0, ...vals), Math.max(...vals), 4), [vals]);
  const lo = ticks[0];
  const hi = ticks[ticks.length - 1];
  const x = (yr: number) => m.l + (yr / 25) * iw;
  const y = (v: number) => m.t + ih - ((v - lo) / (hi - lo)) * ih;
  const line = flows.map((f, i) => `${i ? "L" : "M"}${x(f.year).toFixed(1)},${y(f.cumulative).toFixed(1)}`).join("");
  const area = `${line}L${x(25)},${y(0)}L${x(0)},${y(0)}Z`;
  const last = flows[flows.length - 1];
  return (
    <figure className="chart">
      <div ref={ref} className="chart__plot" onMouseLeave={() => setHover(null)}>
        <svg
          width={width}
          height={H}
          role="img"
          aria-label={`Cumulative savings over 25 years, ending at ${rupees(last.cumulative)}`}
          onMouseMove={(e) => {
            const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const yr = Math.round(((e.clientX - r.left - m.l) / iw) * 25);
            setHover(Math.max(0, Math.min(25, yr)));
          }}
        >
          <defs>
            <clipPath id="above0">
              <rect x={0} y={0} width={width} height={y(0)} />
            </clipPath>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={width - m.r} y1={y(t)} y2={y(t)} className={t === 0 ? "baseline" : "grid"} />
              <text x={m.l - 8} y={y(t)} className="axis" textAnchor="end" dominantBaseline="middle">
                {lakhTick(t)}
              </text>
            </g>
          ))}
          {[0, 5, 10, 15, 20, 25].map((yr) => (
            <text key={yr} x={x(yr)} y={H - 8} className="axis" textAnchor="middle">
              {yr === 0 ? "Year 0" : yr}
            </text>
          ))}
          <path d={area} className="area" clipPath="url(#above0)" />
          <path d={line} className="line" />
          {payback !== null && payback <= 25 && (
            <g>
              <line x1={x(payback)} x2={x(payback)} y1={m.t} y2={y(0)} className="marker-line" />
              <circle cx={x(payback)} cy={y(0)} r={5} className="dot" />
              <text x={x(payback) + 8} y={m.t + 10} className="label">
                Pays back · {payback.toFixed(1)} yrs
              </text>
            </g>
          )}
          <circle cx={x(25)} cy={y(last.cumulative)} r={5} className="dot" />
          <text x={x(25) + 8} y={y(last.cumulative)} className="label" dominantBaseline="middle">
            {lakhTick(last.cumulative)}
          </text>
          {hover !== null && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={m.t + ih} className="crosshair" />
              <circle cx={x(hover)} cy={y(flows[hover].cumulative)} r={5} className="dot" />
            </g>
          )}
        </svg>
        {hover !== null && (
          <div className="chart__tip" style={{ left: Math.min(width - 190, Math.max(0, x(hover) - 95)) }}>
            <strong>Year {hover}</strong>
            <span>Cumulative {rupees(flows[hover].cumulative)}</span>
            {hover > 0 && <span className="chart__tip-muted">Saved {rupees(flows[hover].savings)} · costs {rupees(flows[hover].costs)}</span>}
          </div>
        )}
      </div>
    </figure>
  );
}

/** Horizontal fair-price band with a marker for the quoted price. */
export function PriceBand({ low, high, value }: { low: number; high: number; value: number }) {
  const min = Math.min(low * 0.8, value * 0.95);
  const max = Math.max(high * 1.25, value * 1.05);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const over = value > high;
  return (
    <div className="pband" role="img" aria-label={`Fair range ${rupees(low)} to ${rupees(high)}; quote ${rupees(value)}`}>
      <div className="pband__track">
        <div className="pband__fair" style={{ left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%` }}>
          <span>fair</span>
        </div>
        <div className={`pband__marker${over ? " is-over" : ""}`} style={{ left: `${pct(value)}%` }}>
          <span className="mono">{rupeesShort(value)}</span>
        </div>
      </div>
      <div className="pband__scale mono">
        <span style={{ left: `${pct(low)}%` }}>{rupeesShort(low)}</span>
        <span style={{ left: `${pct(high)}%` }}>{rupeesShort(high)}</span>
      </div>
    </div>
  );
}
