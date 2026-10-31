import { CheckCircle, HandCoins, ShieldCheck } from "@phosphor-icons/react";
import { useId, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createLead, type ContactTime, type Lead, type LeadContext, type LeadErrors, type LeadSource } from "../lib/leads";
import { Segmented } from "./ui";
import "../styles/money.css";

const SOURCE_COPY: Record<LeadSource, { title: string; lede: string }> = {
  quote: {
    title: "Get verified quotes to compare",
    lede: "Up to three installers whose own quotes pass this audit will call you with a written quote. Chhat checks each one with the same rules before you sign.",
  },
  bill: {
    title: "Talk to a verified installer",
    lede: "If your bill shows a problem with the meter or the net-metering setup, a verified installer can inspect it. Chhat checks their quote before you sign.",
  },
  report: {
    title: "Get verified quotes for this roof",
    lede: "Up to three installers whose quotes pass Chhat's audit will call you, already knowing your roof, your units and the fair price.",
  },
};

/**
 * "Get verified installer quotes": the step where a free report becomes a
 * lead an installer pays for. In this build the lead stays in this browser.
 */
export function LeadForm({ source, context }: { source: LeadSource; context?: LeadContext }) {
  const uid = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [time, setTime] = useState<ContactTime>("evening");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [lead, setLead] = useState<Lead | null>(null);
  const copy = SOURCE_COPY[source];
  /** Editing a field clears its error, so stale messages don't linger. */
  const edit = <T,>(k: keyof LeadErrors, set: (v: T) => void) => (v: T) => {
    set(v);
    if (errors[k]) setErrors(({ [k]: _gone, ...rest }) => rest);
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    const r = createLead(source, { name, phone, pincode, time, consent }, context);
    if ("errors" in r) {
      setErrors(r.errors);
      const first = Object.keys(r.errors)[0];
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    setErrors({});
    setLead(r.lead);
  }

  if (lead) {
    return (
      <section className="card lead lead--done" aria-live="polite" data-testid="lead-done">
        <h2 className="card__title">
          <span>
            <CheckCircle weight="fill" className="lead__ok" /> Request saved
          </span>
          <span className="mono small muted">{lead.id}</span>
        </h2>
        <ol className="lead__next">
          <li>A Chhat caller confirms your number and roof (about 2 minutes).</li>
          <li>Up to three verified installers get your sized request, never your bill.</li>
          <li>
            Each written quote comes back to Chhat for the same audit, free. <Link to="/compare">Compare them side by side</Link>
          </li>
        </ol>
        <p className="lead__demo small">
          Demo build: this request is stored only in this browser. No installer has been contacted and nothing left your device.{" "}
          <Link to="/installers#inbox">See what an installer sees</Link>
        </p>
      </section>
    );
  }

  const err = (k: keyof LeadErrors) =>
    errors[k] ? (
      <span className="lead__err" id={`${uid}-${k}-err`} role="alert">
        {errors[k]}
      </span>
    ) : null;

  return (
    <section className="card lead" aria-labelledby={`${uid}-title`} data-testid="lead-form">
      <h2 className="card__title" id={`${uid}-title`}>
        <span>
          <HandCoins weight="bold" className="lead__icon" /> {copy.title}
        </span>
        <span className="chip chip--free">Free for homes</span>
      </h2>
      <p className="lead__lede">{copy.lede}</p>
      <form className="lead__form" onSubmit={submit} noValidate>
        <div className="lead__row">
          <div className="field">
            <label className="field__label" htmlFor={`${uid}-name`}>
              <span>Name</span>
            </label>
            <div className="input-wrap">
              <input id={`${uid}-name`} autoComplete="name" value={name} onChange={(e) => edit("name", setName)(e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${uid}-name-err` : undefined} />
            </div>
            {err("name")}
          </div>
          <div className="field">
            <label className="field__label" htmlFor={`${uid}-phone`}>
              <span>Mobile</span>
            </label>
            <div className="input-wrap">
              <span className="affix affix--pre">+91</span>
              <input
                id={`${uid}-phone`}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => edit("phone", setPhone)(e.target.value)}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? `${uid}-phone-err` : undefined}
              />
            </div>
            {err("phone")}
          </div>
          <div className="field">
            <label className="field__label" htmlFor={`${uid}-pincode`}>
              <span>PIN code</span>
            </label>
            <div className="input-wrap">
              <input
                id={`${uid}-pincode`}
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                placeholder="411001"
                value={pincode}
                onChange={(e) => edit("pincode", setPincode)(e.target.value.replace(/\D/g, ""))}
                aria-invalid={Boolean(errors.pincode)}
                aria-describedby={errors.pincode ? `${uid}-pincode-err` : undefined}
              />
            </div>
            {err("pincode")}
          </div>
        </div>
        <div className="field">
          <span className="field__label">
            <span>Best time to call</span>
          </span>
          <Segmented
            value={time}
            onChange={setTime}
            options={[
              { value: "morning", label: "Morning" },
              { value: "afternoon", label: "Afternoon" },
              { value: "evening", label: "Evening" },
            ]}
          />
        </div>
        <label className="lead__consent">
          <input id={`${uid}-consent`} type="checkbox" checked={consent} onChange={(e) => edit("consent", setConsent)(e.target.checked)} aria-invalid={Boolean(errors.consent)} />
          <span>I agree that Chhat may share my name, number, PIN code and system size with up to three verified installers, who may call me about this request. I can withdraw this any time.</span>
        </label>
        {err("consent")}
        <div className="lead__foot">
          <button type="submit" className="btn btn--accent">
            Get verified quotes
          </button>
          <span className="lead__promise small">
            <ShieldCheck weight="fill" /> Installers pay Chhat for the request, never for a better grade. <Link to="/installers">How Chhat is paid</Link>
          </span>
        </div>
      </form>
    </section>
  );
}
