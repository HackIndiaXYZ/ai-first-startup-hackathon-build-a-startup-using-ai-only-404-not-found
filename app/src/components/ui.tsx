import * as RSlider from "@radix-ui/react-slider";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as Tooltip from "@radix-ui/react-tooltip";
import { CaretDown, Info } from "@phosphor-icons/react";
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from "react";
import { Link } from "react-router-dom";

type BtnVariant = "primary" | "accent" | "ghost" | "neel";
type BtnSize = "sm" | "md" | "lg";

const btnClass = (v: BtnVariant = "primary", s: BtnSize = "md", extra = "") =>
  ["btn", v !== "primary" && `btn--${v}`, s !== "md" && `btn--${s}`, extra].filter(Boolean).join(" ");

export function Button({ variant, size, className, ...rest }: ComponentProps<"button"> & { variant?: BtnVariant; size?: BtnSize }) {
  return <button type="button" className={btnClass(variant, size, className)} {...rest} />;
}

export function LinkButton({ variant, size, className, ...rest }: ComponentProps<typeof Link> & { variant?: BtnVariant; size?: BtnSize }) {
  return <Link className={btnClass(variant, size, className)} {...rest} />;
}

// Field hands its generated ids to the control inside it, so every input is
// labelled without each call site passing ids around.
const FieldCtx = createContext<{ inputId?: string; labelId?: string }>({});

export function Field({ label, hint, children, htmlFor }: { label: ReactNode; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  const auto = useId();
  const inputId = htmlFor ?? `f${auto}`;
  const labelId = `l${auto}`;
  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId} id={labelId}>
        <span>{label}</span>
        {hint && <span className="field__hint">{hint}</span>}
      </label>
      <FieldCtx.Provider value={{ inputId, labelId }}>{children}</FieldCtx.Provider>
    </div>
  );
}

export function NumberInput({
  id,
  value,
  onChange,
  prefix,
  suffix,
  step = 1,
  min,
  placeholder,
  ariaLabel,
}: {
  id?: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const ctx = useContext(FieldCtx);
  return (
    <div className="input-wrap">
      {prefix && <span className="affix affix--pre">{prefix}</span>}
      <input
        id={id ?? ctx.inputId}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={value ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === "" ? null : Number(v));
        }}
      />
      {suffix && <span className="affix">{suffix}</span>}
    </div>
  );
}

export function TextInput({ id, value, onChange, placeholder }: { id?: string; value: string | null; onChange: (v: string | null) => void; placeholder?: string }) {
  const ctx = useContext(FieldCtx);
  return (
    <div className="input-wrap">
      <input id={id ?? ctx.inputId} type="text" value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value || null)} />
    </div>
  );
}

export function Select<T extends string>({
  id,
  value,
  onChange,
  options,
}: {
  id?: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  const ctx = useContext(FieldCtx);
  return (
    <div className="input-wrap">
      <select id={id ?? ctx.inputId} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <CaretDown className="chev" size={14} weight="bold" />
    </div>
  );
}

/** Tri-state yes / no / unknown control for audit fields. */
export function TriState({ value, onChange, labels = ["Yes", "No", "Not stated"] }: { value: boolean | null; onChange: (v: boolean | null) => void; labels?: [string, string, string] }) {
  const v = value === true ? "y" : value === false ? "n" : "u";
  return (
    <Segmented
      value={v}
      onChange={(x) => onChange(x === "y" ? true : x === "n" ? false : null)}
      options={[
        { value: "y", label: labels[0] },
        { value: "n", label: labels[1] },
        { value: "u", label: labels[2] },
      ]}
    />
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  ariaLabel?: string;
}) {
  const ctx = useContext(FieldCtx);
  return (
    <ToggleGroup.Root type="single" className="seg" value={value} aria-label={ariaLabel} aria-labelledby={ariaLabel ? undefined : ctx.labelId} onValueChange={(v) => v && onChange(v as T)}>
      {options.map((o) => (
        <ToggleGroup.Item key={o.value} value={o.value} className="seg__item">
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}

export function Slider({
  value,
  onChange,
  min,
  max,
  step = 1,
  dark,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  dark?: boolean;
  ariaLabel: string;
}) {
  return (
    <RSlider.Root className={`slider${dark ? " slider--dark" : ""}`} value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)}>
      <RSlider.Track className="slider__track">
        <RSlider.Range className="slider__range" />
      </RSlider.Track>
      <RSlider.Thumb className="slider__thumb" aria-label={ariaLabel} />
    </RSlider.Root>
  );
}

export function Stat({ value, label, hi, hint }: { value: ReactNode; label: ReactNode; hi?: string; hint?: ReactNode }) {
  return (
    <div className="stat">
      <span className="stat__label">
        {label}
        {hi && <span className="stat__hi"> · {hi}</span>}
      </span>
      <span className="stat__value">{value}</span>
      {hint && <span className="stat__label" style={{ fontWeight: 400 }}>{hint}</span>}
    </div>
  );
}

export function SourceTip({ label, url, children }: { label: string; url?: string; children?: ReactNode }) {
  return (
    <Tooltip.Provider delayDuration={120}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button type="button" className="src-tip" aria-label={`Source: ${label}`}>
            {children ?? <Info size={14} weight="bold" />}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tip" sideOffset={6}>
            Source:{" "}
            {url ? (
              <a href={url} target="_blank" rel="noreferrer">
                {label}
              </a>
            ) : (
              label
            )}
            <Tooltip.Arrow style={{ fill: "var(--ink)" }} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function Logo({ inverse }: { inverse?: boolean }) {
  return (
    <span className={`logo${inverse ? " logo--inverse" : ""}`}>
      <svg width="30" height="22" viewBox="0 0 30 22" aria-hidden="true">
        <circle cx="19" cy="11" r="7" fill="var(--haldi)" />
        <rect x="0" y="12" width="30" height="3" rx="1" fill="currentColor" />
        <rect x="3" y="15" width="3" height="7" fill="currentColor" />
        <rect x="24" y="15" width="3" height="7" fill="currentColor" />
      </svg>
      <span className="logo__word">chhat</span>
      <span className="logo__deva deva">छत</span>
    </span>
  );
}
