import { Footprints, GridFour, FileText, Tree } from "@phosphor-icons/react";
import { useState } from "react";
import { num } from "../engine/format";
import { PV_DEFAULTS } from "../engine/pv";
import { areaForPanels, MIN_PANELS, panelsThatFit, SQFT_PER_M2, sqftPerPanel, USABLE_ROOF } from "../engine/sizing";
import { Field, NumberInput, Segmented } from "./ui";

export const AREA_MIN = 50;
export const AREA_MAX = 20000;
const DEFAULT_ASPECT = 1.25;

type Unit = "sqft" | "m2";
type Entry = "area" | "dims";

const PRESETS = [
  { sqft: 300, label: "Small", note: "1 BHK top floor" },
  { sqft: 800, label: "Typical", note: "Independent house" },
  { sqft: 1500, label: "Large", note: "Bungalow or villa" },
];

const toUnit = (sqft: number, u: Unit) => (u === "sqft" ? Math.round(sqft) : Math.round((sqft / SQFT_PER_M2) * 10) / 10);
const toSqft = (v: number, u: Unit) => (u === "sqft" ? v : v * SQFT_PER_M2);
const lenUnit = (u: Unit) => (u === "sqft" ? "ft" : "m");
const fmtArea = (sqft: number, u: Unit) => (u === "sqft" ? `${num(sqft)} sq ft` : `${num(Math.round(sqft / SQFT_PER_M2))} m²`);

/**
 * Asks how much roof can take panels, by area or by length × width, and draws
 * a top-down plan of every panel that fits.
 */
export function AreaPlanner({
  areaSqft,
  onArea,
  clearOnly,
  onClearOnly,
  planned,
}: {
  areaSqft: number;
  onArea: (sqft: number) => void;
  clearOnly: boolean;
  onClearOnly: (v: boolean) => void;
  /** Panels in the current plan */
  planned: number;
}) {
  const [unit, setUnit] = useState<Unit>("sqft");
  const [entry, setEntry] = useState<Entry>("area");
  const [areaDraft, setAreaDraft] = useState<number | null>(toUnit(areaSqft, "sqft"));
  const side0 = Math.sqrt(areaSqft * DEFAULT_ASPECT);
  const [len, setLen] = useState<number | null>(Math.round(side0));
  const [wid, setWid] = useState<number | null>(Math.round(areaSqft / side0));
  const [aspect, setAspect] = useState(DEFAULT_ASPECT);

  const share = clearOnly ? 1 : USABLE_ROOF;
  const fit = panelsThatFit(areaSqft, share);
  const draftSqft = entry === "area" ? (areaDraft ? toSqft(areaDraft, unit) : 0) : len && wid ? toSqft(len * wid, unit) : 0;
  const outOfRange = draftSqft > 0 && (draftSqft < AREA_MIN || draftSqft > AREA_MAX);

  const push = (sqft: number) => {
    if (sqft >= AREA_MIN && sqft <= AREA_MAX) onArea(Math.round(sqft));
  };

  const switchUnit = (u: Unit) => {
    if (u === unit) return;
    const f = u === "m2" ? 1 / Math.sqrt(SQFT_PER_M2) : Math.sqrt(SQFT_PER_M2);
    setAreaDraft(toUnit(areaSqft, u));
    if (len) setLen(Math.round(len * f * 10) / 10);
    if (wid) setWid(Math.round(wid * f * 10) / 10);
    setUnit(u);
  };

  const pickPreset = (sqft: number) => {
    setAreaDraft(toUnit(sqft, unit));
    const side = Math.sqrt(toUnit(sqft, unit) * DEFAULT_ASPECT);
    setLen(Math.round(side * 10) / 10);
    setWid(Math.round((toUnit(sqft, unit) / side) * 10) / 10);
    setAspect(DEFAULT_ASPECT);
    onArea(sqft);
  };

  const setDims = (l: number | null, w: number | null) => {
    setLen(l);
    setWid(w);
    if (l && w && l > 0 && w > 0) {
      setAspect(l / w);
      setAreaDraft(toUnit(toSqft(l * w, unit), unit));
      push(toSqft(l * w, unit));
    }
  };

  return (
    <div className="area">
      <p className="area__ask">
        How much open roof can take panels? This decides how many panels fit, and so what you can make and save.
      </p>

      <div className="area__presets" role="group" aria-label="Quick roof sizes">
        {PRESETS.map((p) => (
          <button
            key={p.sqft}
            type="button"
            className={`area__preset${Math.round(areaSqft) === p.sqft ? " is-on" : ""}`}
            aria-pressed={Math.round(areaSqft) === p.sqft}
            aria-label={`${p.label} roof, ${fmtArea(p.sqft, unit)}, ${p.note}`}
            onClick={() => pickPreset(p.sqft)}
          >
            <RoofPlan areaSqft={p.sqft} aspect={DEFAULT_ASPECT} clearOnly={clearOnly} planned={0} thumb />
            <span className="area__preset-t">{p.label}</span>
            <span className="area__preset-d mono">{fmtArea(p.sqft, unit)}</span>
            <span className="area__preset-n">{p.note}</span>
          </button>
        ))}
      </div>

      <div className="area__modes">
        <Segmented
          ariaLabel="How to enter the roof size"
          value={entry}
          onChange={setEntry}
          options={[
            { value: "area", label: "Total area" },
            { value: "dims", label: "Length × width" },
          ]}
        />
        <Segmented
          ariaLabel="Unit"
          value={unit}
          onChange={switchUnit}
          options={[
            { value: "sqft", label: "sq ft" },
            { value: "m2", label: "m²" },
          ]}
        />
      </div>

      {entry === "area" ? (
        <Field label="Available area" htmlFor="roof-area" hint={outOfRange ? `enter ${fmtArea(AREA_MIN, unit)} to ${fmtArea(AREA_MAX, unit)}` : undefined}>
          <NumberInput
            id="roof-area"
            value={areaDraft}
            onChange={(v) => {
              setAreaDraft(v);
              setAspect(DEFAULT_ASPECT);
              if (v && v > 0) push(toSqft(v, unit));
            }}
            suffix={unit === "sqft" ? "sq ft" : "m²"}
            step={unit === "sqft" ? 10 : 1}
            min={0}
          />
        </Field>
      ) : (
        <div className="fields2">
          <Field label="Length" htmlFor="roof-len">
            <NumberInput id="roof-len" value={len} onChange={(v) => setDims(v, wid)} suffix={lenUnit(unit)} step={unit === "sqft" ? 1 : 0.5} min={0} />
          </Field>
          <Field label="Width" htmlFor="roof-wid" hint={outOfRange ? "out of range" : len && wid ? `= ${fmtArea(toSqft(len * wid, unit), unit)}` : undefined}>
            <NumberInput id="roof-wid" value={wid} onChange={(v) => setDims(len, v)} suffix={lenUnit(unit)} step={unit === "sqft" ? 1 : 0.5} min={0} />
          </Field>
        </div>
      )}

      <Field label="What did you measure?">
        <Segmented
          value={clearOnly ? "clear" : "whole"}
          onChange={(v) => onClearOnly(v === "clear")}
          options={[
            { value: "whole", label: "The whole terrace" },
            { value: "clear", label: "Only the clear, sunny part" },
          ]}
        />
      </Field>
      <p className="muted small">
        {clearOnly
          ? "Chhat uses all of it. Leave out anything shaded between 9 am and 4 pm."
          : `Chhat keeps ${Math.round(USABLE_ROOF * 100)}% for panels: the rest goes to the stair room, water tank and edges.`}
      </p>

      <figure className="area__plan">
        <RoofPlan areaSqft={areaSqft} aspect={aspect} clearOnly={clearOnly} planned={planned} unit={unit} />
        <figcaption className="area__legend">
          <span>
            <i className="sw sw--on" /> In your plan ({Math.min(planned, fit)})
          </span>
          {fit > planned && (
            <span>
              <i className="sw sw--free" /> Room for {fit - planned} more
            </span>
          )}
          {planned > fit && (
            <span>
              <i className="sw sw--over" /> {planned - fit} won't fit
            </span>
          )}
        </figcaption>
      </figure>

      <p className="area__fit">
        {fit >= MIN_PANELS ? (
          <>
            <strong>Fits up to {fit} panels</strong>
            <span className="mono">
              {" "}
              · {((fit * PV_DEFAULTS.moduleWatt) / 1000).toFixed(2)} kW · about {fmtArea(sqftPerPanel(), unit)} each
            </span>
          </>
        ) : (
          <strong>Too small for a home system. Two panels need about {fmtArea(areaForPanels(MIN_PANELS) / share, unit)} here.</strong>
        )}
      </p>

      <details className="area__how">
        <summary>Don't know your roof size? How to measure</summary>
        <ul className="area__tips">
          <li>
            <Footprints size={22} weight="duotone" />
            <div>
              <p className="area__tip-t">Pace it out</p>
              <p className="muted small">Walk the length and width. One normal step is about 2.5 ft (0.75 m). Multiply the two.</p>
            </div>
          </li>
          <li>
            <GridFour size={22} weight="duotone" />
            <div>
              <p className="area__tip-t">Count the tiles</p>
              <p className="muted small">Most terrace tiles are 2 × 2 ft, so each one is 4 sq ft. Count along both sides and multiply.</p>
            </div>
          </li>
          <li>
            <FileText size={22} weight="duotone" />
            <div>
              <p className="area__tip-t">Check the house papers</p>
              <p className="muted small">The top floor's built-up area on the sale deed or building plan is close to the terrace size.</p>
            </div>
          </li>
          <li>
            <Tree size={22} weight="duotone" />
            <div>
              <p className="area__tip-t">Leave out the shade</p>
              <p className="muted small">Skip spots shaded by trees, a taller neighbour, the tank or the stair room for most of the day.</p>
            </div>
          </li>
        </ul>
      </details>
    </div>
  );
}

const CELL_W = 7.6; // ft across one module, gap included
const CELL_D = 7.2; // ft per row: tilted module plus the gap that keeps the next row out of its shadow
const MAX_DRAWN = 120;

/** Top-down roof plan, north up, with the panel grid drawn to fit. */
export function RoofPlan({
  areaSqft,
  aspect,
  clearOnly,
  planned,
  unit = "sqft",
  thumb,
}: {
  areaSqft: number;
  aspect: number;
  clearOnly: boolean;
  planned: number;
  unit?: Unit;
  thumb?: boolean;
}) {
  const share = clearOnly ? 1 : USABLE_ROOF;
  const fit = panelsThatFit(areaSqft, share);
  const a = Math.max(0.4, Math.min(2.5, aspect || DEFAULT_ASPECT));
  const wFt = Math.sqrt(areaSqft * a);
  const dFt = areaSqft / wFt;
  const VW = thumb ? 120 : 300;
  const VH = thumb ? 84 : 220;
  const pad = thumb ? 6 : 28;
  const s = Math.min((VW - pad * 2) / wFt, (VH - pad * 2) / dFt);
  const rw = wFt * s;
  const rd = dFt * s;
  const rx = (VW - rw) / 2;
  const ry = (VH - rd) / 2;
  const edge = Math.max(thumb ? 2 : 4, 1.5 * s);

  // Inner slab inside the parapet; in whole-terrace mode a strip holds the stair room and tank.
  const ix = rx + edge;
  const iy = ry + edge;
  const iw = rw - edge * 2;
  const id = rd - edge * 2;
  const strip = clearOnly ? 0 : iw * 0.22;
  const zx = ix + strip + (strip ? edge : 0);
  const zw = iw - strip - (strip ? edge : 0);
  const zy = iy;
  const zd = id;

  const total = Math.min(MAX_DRAWN, Math.max(fit, planned));
  const cells: { x: number; y: number; w: number; d: number; kind: "on" | "free" | "over" }[] = [];
  if (total > 0) {
    const ratio = CELL_W / CELL_D;
    let cols = Math.max(1, Math.min(total, Math.round(Math.sqrt((total * (zw / zd)) / ratio))));
    let rows = Math.ceil(total / cols);
    // Prefer the layout that leaves the panels largest.
    const size = (c: number) => Math.min(zw / (c * ratio), zd / Math.ceil(total / c));
    for (const c of [cols - 1, cols + 1]) if (c >= 1 && c <= total && size(c) > size(cols)) cols = c;
    rows = Math.ceil(total / cols);
    const k = size(cols);
    const cw = k * ratio;
    const gx = zx + (zw - cols * cw) / 2;
    const gy = zy + (zd - rows * k) / 2;
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const kind = i < Math.min(planned, fit) ? "on" : i < fit ? "free" : "over";
      // The module sits on the south (lower) part of its cell; the gap behind it takes the shadow.
      cells.push({ x: gx + c * cw + cw * 0.04, y: gy + r * k + k * 0.42, w: cw * 0.92, d: k * 0.52, kind });
    }
  }

  const label = `Top-down roof plan: ${num(areaSqft)} sq ft, ${fit} panels fit${planned ? `, ${Math.min(planned, fit)} in your plan` : ""}.`;
  const barFt = unit === "sqft" ? 10 : 3 * 3.28084;
  return (
    <svg className={`roofplan${thumb ? " roofplan--thumb" : ""}`} viewBox={`0 0 ${VW} ${VH}`} role={thumb ? undefined : "img"} aria-label={thumb ? undefined : label} aria-hidden={thumb || undefined}>
      <rect x={rx} y={ry} width={rw} height={rd} rx={thumb ? 2 : 3} className="rp-parapet" />
      <rect x={ix} y={iy} width={iw} height={id} className="rp-slab" />
      {strip > 0 && (
        <g className="rp-obst">
          <rect x={ix} y={iy} width={strip} height={id * 0.55} />
          <circle cx={ix + strip / 2} cy={iy + id * 0.78} r={Math.min(strip, id * 0.4) * 0.36} />
          {!thumb && strip > 34 && (
            <>
              <text x={ix + strip / 2} y={iy + id * 0.28} className="rp-txt">
                Stairs
              </text>
              <text x={ix + strip / 2} y={iy + id * 0.78 + 3} className="rp-txt">
                Tank
              </text>
            </>
          )}
        </g>
      )}
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.d} rx={0.6} className={`rp-panel rp-panel--${c.kind}`} />
      ))}
      {!thumb && (
        <>
          <g className="rp-compass" transform={`translate(${VW - 14} 14)`}>
            <path d="M0 -9 L4 3 L0 0 L-4 3 Z" />
            <text y={12} className="rp-txt">
              N
            </text>
          </g>
          <g className="rp-scale" transform={`translate(${rx} ${VH - 8})`}>
            <line x1={0} x2={barFt * s} y1={0} y2={0} />
            <line x1={0} x2={0} y1={-3} y2={3} />
            <line x1={barFt * s} x2={barFt * s} y1={-3} y2={3} />
            <text x={barFt * s + 5} y={3} className="rp-txt rp-txt--start">
              {unit === "sqft" ? "10 ft" : "3 m"}
            </text>
          </g>
          <text x={VW / 2} y={ry - 8} className="rp-txt">
            {fmtArea(areaSqft, unit)} · panels face south
            {Math.max(fit, planned) > MAX_DRAWN ? ` · showing ${MAX_DRAWN} of ${Math.max(fit, planned)}` : ""}
          </text>
        </>
      )}
    </svg>
  );
}
