import { Bank, ChartBar, CheckCircle, LockSimple, LockSimpleOpen, Prohibit, Trash, Wrench } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ProCheck } from "../components/ProCheck";
import { Field, Slider } from "../components/ui";
import { rupees } from "../engine/format";
import { costPerSale, deleteLead, leadPreview, loadLeads, markBought, maskPhone, paymentLink, PRICING, type Lead } from "../lib/leads";
import { usePageIntro } from "../lib/motion";
import "../styles/tools.css";
import "../styles/money.css";

/** A fictional lead so the inbox is never empty on a first visit. */
const SAMPLE: Lead = {
  id: "CH-SAMPLE01",
  createdAt: "2026-10-30T18:20:00.000Z",
  source: "quote",
  name: "Sample homeowner",
  phone: "9000000000",
  pincode: "411038",
  city: "Pune",
  stateCode: "MH",
  kw: 3.27,
  grade: "F",
  moneyAtRisk: 164824,
  time: "evening",
};

function useLeads(): Lead[] {
  const [leads, setLeads] = useState<Lead[]>(() => loadLeads());
  useEffect(() => {
    const on = () => setLeads(loadLeads());
    window.addEventListener("chhat:leads", on);
    window.addEventListener("storage", on);
    return () => {
      window.removeEventListener("chhat:leads", on);
      window.removeEventListener("storage", on);
    };
  }, []);
  return leads;
}

function Buy({ product, label, onDemo }: { product: "lead" | "pro"; label: string; onDemo: () => void }) {
  const link = paymentLink(product);
  return link ? (
    <a className="btn btn--sm btn--accent" href={link} target="_blank" rel="noreferrer">
      {label}
    </a>
  ) : (
    <button type="button" className="btn btn--sm btn--accent" onClick={onDemo}>
      {label}
    </button>
  );
}

function LeadRow({ lead, sample }: { lead: Lead; sample?: boolean }) {
  const [sampleBought, setSampleBought] = useState(false);
  const bought = sample ? sampleBought : Boolean(lead.boughtAt);
  const p = leadPreview(lead);
  return (
    <li className="inbox-lead" data-bought={bought}>
      <div className="inbox-lead__main">
        <p className="inbox-lead__where">
          {p.title}
          {sample && <span className="chip chip--sample">Sample</span>}
        </p>
        <p className="small muted">{p.facts.join(" · ")}</p>
        {bought ? (
          <p className="inbox-lead__contact">
            <LockSimpleOpen weight="bold" /> {lead.name} · +91 {lead.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}
          </p>
        ) : (
          <p className="inbox-lead__contact muted">
            <LockSimple weight="bold" /> Name hidden · +91 {maskPhone(lead.phone)}
          </p>
        )}
      </div>
      <div className="inbox-lead__act">
        {bought ? (
          <span className="chip chip--live">
            <span className="dot" /> Bought
          </span>
        ) : (
          <Buy product="lead" label={`Buy · ${rupees(PRICING.leadFee)}`} onDemo={() => (sample ? setSampleBought(true) : markBought(lead.id))} />
        )}
        {!sample && (
          <button type="button" className="icon-btn" aria-label={`Delete request ${lead.id}`} onClick={() => deleteLead(lead.id)}>
            <Trash size={16} />
          </button>
        )}
      </div>
    </li>
  );
}

export default function Installers() {
  const intro = usePageIntro<HTMLDivElement>();
  const leads = useLeads();
  const [leadsPerSale, setLeadsPerSale] = useState<number>(PRICING.leadsPerSale);
  const [system, setSystem] = useState<number>(PRICING.typicalSystem);
  const [proDemo, setProDemo] = useState(false);
  const c = useMemo(() => costPerSale(leadsPerSale, system), [leadsPerSale, system]);
  const demo = !paymentLink("lead");

  useEffect(() => {
    document.title = "For installers · Chhat";
    if (window.location.hash.endsWith("#inbox")) document.getElementById("inbox")?.scrollIntoView();
  }, []);

  return (
    <div className="page" ref={intro}>
      <header className="wrap page__head">
        <p className="eyebrow">For installers</p>
        <h1 className="page__title">Buy homes that are ready, not clicks.</h1>
        <p className="page__lede">
          Every Chhat request comes with a sized system, the home's real units and a buyer who already trusts the numbers. Homes use Chhat free. Installers pay for requests and for completed installs, never for a better grade.
        </p>
      </header>

      <div className="wrap inst">
        <section className="price-grid" aria-label="Prices">
          <article className="card price price--main">
            <p className="price__who">Verified request</p>
            <p className="price__amt">
              {rupees(PRICING.leadFee)} <span>per request, prepaid</span>
            </p>
            <ul className="price__list">
              <li><CheckCircle weight="fill" /> Phone confirmed by a Chhat caller, with consent</li>
              <li><CheckCircle weight="fill" /> Shared with at most three installers</li>
              <li><CheckCircle weight="fill" /> Disputed requests credited back from your wallet</li>
            </ul>
          </article>
          <article className="card price">
            <p className="price__who">Success fee</p>
            <p className="price__amt">
              {Math.round(PRICING.successFee * 100)}% <span>of system value, on commissioning</span>
            </p>
            <ul className="price__list">
              <li><CheckCircle weight="fill" /> Paid only when the system is live</li>
              <li><CheckCircle weight="fill" /> Bill audits after install keep reporting honest</li>
            </ul>
          </article>
          <article className="card price">
            <p className="price__who">
              <Wrench weight="bold" /> Chhat Pro
            </p>
            <p className="price__amt">
              {rupees(PRICING.proMonthly)} <span>per month</span>
            </p>
            <ul className="price__list">
              <li><CheckCircle weight="fill" /> Quote builder that runs the audit before you send</li>
              <li><CheckCircle weight="fill" /> Request inbox and follow-up CRM</li>
            </ul>
            {proDemo ? (
              <p className="small good" role="status">Demo: Pro trial started. No payment was taken.</p>
            ) : (
              <Buy product="pro" label="Start Pro" onDemo={() => setProDemo(true)} />
            )}
          </article>
        </section>

        <ProCheck />

        <section className="card never" aria-labelledby="never-title">
          <h2 className="card__title" id="never-title">
            <span>
              <Prohibit weight="bold" /> What Chhat never sells
            </span>
          </h2>
          <ul className="never__list">
            <li><b>A better grade.</b> Every quote is graded by the same public rules, whether or not the installer pays. The rules are in the open-source repo.</li>
            <li><b>A higher place in a list.</b> Results are never ordered by who pays. The "Chhat Verified" badge comes from passing the audit.</li>
            <li><b>The home's documents.</b> Installers get the sized request, not the bill or the quote the home uploaded.</li>
          </ul>
        </section>

        <section className="card calc" aria-labelledby="calc-title">
          <h2 className="card__title" id="calc-title">What a closed sale costs you</h2>
          <div className="calc__grid">
            <div className="calc__inputs">
              <Field label="Requests you buy per closed sale" hint={<span className="mono">{leadsPerSale}</span>}>
                <Slider ariaLabel="Requests you buy per closed sale" value={leadsPerSale} min={1} max={12} step={1} onChange={setLeadsPerSale} />
              </Field>
              <Field label="System value" hint={<span className="mono">{rupees(system)}</span>}>
                <Slider ariaLabel="System value" value={system} min={60_000} max={5_00_000} step={2_000} onChange={setSystem} />
              </Field>
            </div>
            <div className="calc__out" aria-live="polite">
              <p className="calc__big" data-testid="cost-per-sale">{rupees(c.total)}</p>
              <p className="small">
                per closed sale: {rupees(c.leads)} in requests (after the 5% dispute credit) + {rupees(c.fee)} success fee. That is <b>{(c.share * 100).toFixed(1)}%</b> of the system.
              </p>
              <p className="small muted">US installers aim to keep acquisition under about 5-7% of a home system. Source: Chhat business plan.</p>
            </div>
          </div>
        </section>

        <section className="card" id="inbox" aria-labelledby="inbox-title">
          <h2 className="card__title" id="inbox-title">
            <span>Request inbox</span>
            {demo && <span className="chip">Demo checkout · no money moves</span>}
          </h2>
          <p className="small muted inbox-note">
            Requests made with "Get verified quotes" on Quote Check, Bill Audit or the Roof Report appear here, in this browser only. An installer sees where, what size and how urgent before buying; the name and number unlock after.
          </p>
          <ul className="inbox-list">
            {leads.map((l) => (
              <LeadRow key={l.id} lead={l} />
            ))}
            <LeadRow lead={SAMPLE} sample />
          </ul>
          {leads.length === 0 && (
            <p className="small">
              Make a real one: run <Link to="/quote">Quote Check</Link> and use "Get verified quotes" at the end.
            </p>
          )}
        </section>

        <section className="payers-mini" aria-label="Other payers">
          <article className="card">
            <p className="price__who"><Bank weight="bold" /> Banks and NBFCs</p>
            <p className="price__amt price__amt--sm">{Math.round(PRICING.loanFee * 100)}% <span>of each loan originated</span></p>
          </article>
          <article className="card">
            <p className="price__who"><ChartBar weight="bold" /> States and DISCOMs</p>
            <p className="price__amt price__amt--sm">₹40 lakh <span>per state per year, for install-quality and billing-error analytics</span></p>
          </article>
        </section>

        <p className="small muted money__foot">
          Prices from the <Link to="/deck">pitch deck</Link> and business plan. The requests and payments on this page are a working demo: nothing is sent, and no money is taken unless a payment link is configured.
        </p>
      </div>
    </div>
  );
}
