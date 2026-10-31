# Chhat business plan

*Prepared by Claude (AI) acting as financial advisor. Refreshed 31 Oct 2026 against current API prices, exchange rate, tax law, pay data and scheme figures. Every number traces to `Chhat-financial-model.xlsx`, a monthly, three-scenario model with 9,453 formulas. It recalculates with zero errors, and `python business/build_model.py --verify` checks 123 key figures against an independent Python implementation. Every external fact is dated and linked on the model's Sources sheet.*

---

## 1. Summary

**Chhat (छत, "roof") is the independent AI solar advisor for Indian homes.** It reads a household's electricity bill, models the roof on 20 years of NASA sunlight, stacks central and state subsidies, compares cash and loan, audits the installer's quote before the homeowner signs, and audits DISCOM bills after installation.

Homeowners use it free. **Installers pay for verified leads (₹1,500) and 2% on completed installs. Lenders pay 1% on loans originated. Installers subscribe to a quote and CRM tool (₹2,999/month). States and DISCOMs buy analytics (₹40 lakh a year).**

| ₹ crore, base case | FY27* | FY28 | FY29 | FY30 | FY31 |
|---|---|---|---|---|---|
| Revenue | 0.59 | 7.84 | 24.13 | 49.35 | 79.76 |
| EBITDA | (0.82) | (2.13) | 2.64 | 13.58 | 28.00 |
| EBITDA margin | n/m | (27%) | 11% | 28% | 35% |
| Profit after tax | (0.83) | (2.22) | 2.47 | 10.11 | 20.68 |
| Year-end cash | 5.20 | 2.32 | 3.66 | 12.00 | 30.77 |

\*FY27 runs from launch in Nov 2026 to Mar 2027 (5 months).

**Ask: ₹6 crore seed for 15% (₹40 crore post-money).** In the base case it carries the company to EBITDA break-even in **April 2028**, after which EBITDA is positive every month. Cash bottoms at **₹1.9 crore in May 2028**, about 8 months of FY28's average burn. The base plan needs no Series A.

## 2. The problem

India is in the middle of the largest residential solar push in its history, and the household making the decision has no one on their side.

- **Scale.** By 9 Oct 2026, PM Surya Ghar had **51.7 lakh rooftop installations serving 61.4 lakh households** (national portal counter). The target is 1 crore households, and the scheme is due to close on **31 Mar 2027**. July 2026 set the record: 5.06 lakh homes in one month, 16,328 a day. The FY27 budget is ₹22,000 crore.
- **Distrust is the bottleneck, not sunlight.** CEEW found 637 GW of technical residential rooftop potential and 32 GW of economic potential with subsidy, but in its 2026 survey of 17,094 households **26% would consider rooftop solar, 5% have started and only 1.4% have finished**; 59% of those who start stall at early steps such as choosing a vendor. That stall is where Quote Check sits.
- **Bad quotes cost real money.** Since 1 June 2026, subsidy requires DCR panels with ALMM List-II cells, and a non-DCR panel forfeits up to ₹78,000. Quotes still charge old GST rates (12-13.8% instead of ~8.9%) and under-deliver capacity.
- **Bad bills after install.** In July 2026 MNRE acknowledged multiple complaints of incorrect DISCOM billing after rooftop installs. Consumer forums are striking down unexplained charges, and net meters go un-activated for months.
- **Every existing calculator belongs to someone selling panels.** SolarSquare (a $53M Series C installer), Freyr and Loom all run calculators whose job is to close their sale.

## 3. The product

| Tool | What it does | AI's job |
|---|---|---|
| **Roof Report** | Sizes the system, models monthly generation, net metering, subsidy, loan, 25-year cash flow and CO₂ | Reads the bill (Claude vision or on-device OCR); picks the panel count with the best 25-year NPV |
| **Quote Check** | 14 checks: fair price, DCR/ALMM, capacity arithmetic, inverter sizing, warranties, structure, GST, payment terms | Reads free-form quotes; writes the negotiation message in English or Hindi |
| **Bill Audit** | Checks import − export − credit against billed units, flags zero export and unexplained charges | Reads the bill; drafts the DISCOM correction letter with escalation path |
| **Ask Chhat** | Agent that answers in Hindi, Hinglish or English | Claude calls seven typed tools; every number comes from the tested engine |

Design principle: **the model never computes a rupee figure itself.** It decides which tool to call. That keeps answers auditable, and it lets the product work without a model at all (on-device mode), which matters for cost and for trust.

## 4. Market

| Layer | Definition | Size |
|---|---|---|
| TAM (stock) | 32 GW economic residential potential (CEEW) ≈ 1 crore homes at 3.2 kW × ₹1.82 lakh | **₹1,82,400 crore** of installations |
| The scheme today | 61.4 lakh households covered by 9 Oct 2026; ~38.6 lakh to go before 31 Mar 2027; peak pace ~61 lakh homes a year | Subsidy-driven; **not assumed to last** |
| Annual market (planning base) | 20 lakh homes a year from FY28: one-third of the 2026 peak | **₹36,480 crore** of installations a year |
| SAM (annual) | Chhat's fees on that flow (₹10,786 per installed home), installer SaaS for 29,469 active vendors, analytics for 36 states and UTs | **₹2,278 crore** a year |
| SOM (FY31) | Base-case revenue | **₹79.8 crore**: 3.5% of SAM. Its 60,500 installs are 3.0% of national installs |

The TAM is a stock: every economic roof, counted once. SAM and SOM are annual, so FY31 revenue is compared with an annual pool, not with the stock. The base case needs 3% of a market one-third the size of today's.

Beyond the scheme, the 51.7 lakh systems already installed need bill audits for 25 years. Commercial and industrial rooftops, home batteries and EV charging reuse the same engine.

## 5. Business model

| Stream | Payer | Price | FY31 revenue |
|---|---|---|---|
| Verified leads | Installers | ₹1,500 per lead, prepaid; 5% credited back for disputed leads | ₹45.6 crore |
| Success fee | Installers | 2% of system value; model collects 85% | ₹17.8 crore |
| Installer SaaS | Installers | ₹2,999/month | ₹9.0 crore |
| Analytics | States / DISCOMs | ₹40 lakh per state-year | ₹4.0 crore |
| Loan origination | Banks / NBFCs | 1% of loan | ₹3.4 crore |

Prices exclude GST.

**Why installers pay a referee.** Leads arrive pre-qualified with a bill, a roof model and a buyer who already trusts the numbers. Installers whose quotes pass the audit can show a "Chhat Verified" badge. The badge comes from the audit, never from payment, and results are never ordered by who pays. Cancellations fall because the buyer saw the numbers before the site visit.

**What it costs the installer.** Five leads plus the full success fee come to ₹10,773 per closed sale: **5.9% of a ₹1.82 lakh system**. US installers aim to keep cost per closed sale under $1,500, roughly 5-7% of a typical home system. Indian solar leads sell at ₹1,200-3,500 for medium-to-high quality, so ₹1,500 for a verified, sized, exclusive lead sits in that band.

## 6. Unit economics (FY28, base case)

| Metric | Value |
|---|---|
| Revenue per report | ₹196 |
| Variable cost per report | ₹96: acquisition ₹85, payments ₹5.9, lead verification ₹3.8, AI ₹1.7 |
| Contribution per report | ₹99 |
| Revenue / variable cost | 2.0x |
| Reports per installed home (8% → lead, 20% → install) | 62.5 |
| Marketplace revenue per installed home | ₹10,786 (leads ₹7,125, success fee ₹3,101, loan ₹560) |
| Contribution per installed home | ₹4,803 (45%) |
| Chhat's take as share of that home's 25-year savings | 1.5% |
| AI + infrastructure as share of revenue | 0.9% |

Payback on acquisition spend is short. The lead fee is prepaid when the lead is delivered, and the success fee follows at commissioning, about two months later.

## 7. AI economics

The AI cost line is computed from tokens rather than guessed. The model's AI cost sheet shows the working.

- **Today's code** sends everything to Claude Opus 5.5 ($4/$20 per million tokens). Reading one bill costs about ₹2.13: ~3,600 input tokens, including a phone photo downscaled to 1,800 px (≈3,185 visual tokens), plus 400 output tokens. One Ask Chhat session costs about ₹6.75.
- **Per report** we assume 0.8 extractions and 0.25 chat sessions, plus ₹0.50 of hosting, then add 25% contingency. That gives **₹4.86 per report**.
- **From FY28** the plan routes document reading to Claude Haiku 5.5 ($0.10/$0.50, about ₹0.05 per bill) and chat to Claude Sonnet 5.5 ($2/$10). The switch happens only after an accuracy eval on real bills. Cost falls to **₹1.73 per report (-64%)**.
- **Currency risk is small.** At ₹94.93/$ (30 Oct 2026), a 10% fall in the rupee adds under ₹5 lakh to FY31 costs. On-device mode costs nothing and keeps the product working through an outage.

## 8. Go-to-market

1. **Months 0-3: Delhi NCR, UP, Maharashtra.** These have the highest subsidy stacks (Delhi +₹30,000, UP +₹30,000) and the highest tariffs (MSEDCL). We publish content for every "PM Surya Ghar subsidy [city]" query, Hindi first.
2. **Growth loop: the roof card.** Every report produces a shareable image ("My roof in Pune makes 4,520 units a year"). WhatsApp is the channel. Paid search costs ₹15-45 a click on solar keywords; organic shares bring the blended cost down from ₹100 a report at launch to ₹60 by FY31.
3. **Supply side: 50 installers per city**, recruited from the national vendor list and onboarded on audit scores, not ad spend. Installers top up a prepaid lead wallet.
4. **Lenders: two PSU banks and one NBFC** as loan partners, using the PM Surya Ghar concessional product. By Aug 2026 the scheme had sanctioned 21.87 lakh concessional loans, about 44% of homes; the model assumes 35%.
5. **B2G from FY28.** We offer one DISCOM a free billing-error dashboard, then convert it to a paid state contract.

## 9. Competition

| Player | What they do | Why Chhat is different |
|---|---|---|
| SolarSquare, Freyr, Loom, Fenice | Install and finance | They sell panels; Chhat audits them. They become Chhat customers through leads. |
| PM Surya Ghar portal | Application and subsidy process | Process, not advice. Chhat prepares people for it. |
| Lead aggregators (IndiaMART, JustDial) | Sell unverified leads | No sizing, no audit, no trust. |
| Generic AI chatbots | Answer questions | Invent numbers; no tools, no rules engine, no Indian data. |

## 10. Moat

1. **City price index** from every audited quote (dated, per kW, per panel type).
2. **DISCOM error map** from every audited bill, valuable to regulators and states.
3. **Calibrated yield model**: post-install bills show real exports per city, which tune the PV model beyond NASA averages.
4. **Trust brand**: independence is a position only one company can credibly hold per market.

## 11. Team and hiring

| | FY27* | FY28 | FY29 | FY30 | FY31 |
|---|---|---|---|---|---|
| Average headcount | 12 | 31 | 59 | 91 | 124 |
| …of which lead-verification callers | 1 | 4 | 13 | 28 | 44 |

The first ten are 4 engineers (one ML/PV), 1 designer, 2 growth, 2 installer-network ops and the founder-CEO. Support starts with one person. Callers scale with leads, at 600 verified leads per caller a month, so they are a variable cost.

Pay assumptions:
- Engineers: ₹22 lakh blended CTC (Bengaluru SDE-2 ₹20-40 lakh, ESOPs on top).
- Callers: ₹3 lakh (voice-process median ₹2.3 lakh).
- Founder-CEO: below-market salary.
- Rises: 9% every April (Aon 9.1% and Mercer 9% for 2026), plus 5% for benefits.
- FY31 revenue per average head: ₹64 lakh.

## 12. Funding, use of funds and runway

**Seed: ₹6 crore for 15%** (₹40 crore post-money). The split below follows the model's spend mix over the seed period, FY27* to FY28.

| Use | Share | ₹ lakh |
|---|---|---|
| Growth (acquisition + growth team) | 38% | 228 |
| Product & engineering (team, AI, devices) | 34% | 202 |
| G&A, compliance, office & state sales | 18% | 110 |
| Installer network, lead verification & support | 10% | 61 |

- **Base case.** EBITDA turns positive in April 2028 and stays positive; FY29 is the first full positive year. Cash bottoms at ₹1.94 crore in May 2028.
- **Downside case.** Cash would run out in May 2028, 18 months after the seed. Break-even slips to January 2030, and ₹6.1 crore more is needed.
- **Decision point: Sep 2027.** By then, reports against plan will show which case we are in. That leaves eight months to raise a bridge or Series A, or to cut paid acquisition, which is the largest cost line.
- **Series A (optional, FY29).** It would accelerate C&I and home batteries. No scenario depends on it.

## 13. Scenarios

| ₹ crore | Base | Downside | Upside |
|---|---|---|---|
| FY31 revenue | 79.8 | 43.0 | 114.7 |
| FY31 EBITDA (margin) | 28.0 (35%) | 3.1 (7%) | 56.0 (49%) |
| EBITDA positive every month from | Apr 2028 | Jan 2030 | Nov 2027 |
| Lowest cash | 1.94 (May 2028) | -6.11 (Apr 2030) | 4.01 (Dec 2027) |
| Extra funding needed | none | 6.11, from May 2028 | none |

**Downside:**
- 30% less traffic.
- About 25% less revenue per report: 7% of reports become leads, 17% of leads install, ₹1,300 lead fee.
- Acquisition cost +10%, SaaS -40%, fewer states.
- Non-caller hiring held at 80% of plan from FY28.

**Upside:**
- 20% more traffic.
- About 25% more revenue per report.
- Acquisition cost -10%.
- Hiring 15% above plan, to serve the extra volume.

**Sensitivity:** FY29 stays EBITDA-positive down to about ₹1,200 a lead (at 20% conversion), or about 11% conversion (at ₹1,500).

## 14. Milestones

| By | Milestone |
|---|---|
| Nov 2026 | Live product (this submission); 3 states; first 20 installers |
| Mar 2027 | 40,000 reports; 3,200 verified leads; first lender partner |
| Sep 2027 | 10 states; Chhat Verified badge live; first DISCOM pilot; check reports against plan |
| Mar 2028 | ₹7.8 crore FY28 revenue; 4,900 installs |
| Apr 2028 | EBITDA positive every month from here |
| FY29 | Optional Series A for C&I and batteries |

## 15. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| PM Surya Ghar closes on 31 Mar 2027 as scheduled and no successor follows. An extension of 3-4 months has been reported but not notified. | Medium | The planning base already assumes one-third of the 2026 peak. Economics stand without subsidy (payback ~6-7 years at ₹8/unit). Bill audits continue for 51.7 lakh+ installed systems. C&I and battery products. |
| Installers refuse to pay a referee | Medium | Lead-quality data (verified, consented leads); start with installers who already compete on quality |
| Success fees leak (installs closed off-platform) | Medium | The model collects only 85%. Post-install bill audits reveal installs, and only installers who report them keep the Verified badge. |
| Data accuracy disputes | Medium | Every figure sourced in-app; all assumptions editable; quote audit shows rule and source per finding |
| LLM cost or outage | Low | AI is under 1% of revenue; on-device mode is complete; model calls only for reading documents and chat |
| Regulatory (advice liability) | Low | Clear "estimates, not financial advice"; no money handled; letters are drafts for the consumer |
| Copycats | High | The moat is the dataset and the installer network, not the calculator |

## 16. Accounting and tax notes

- **Revenue is shown net of GST** (18% on Chhat's services).
- **Tax.** The model applies the Income-tax Act, 2025 concessional rate (section 200, the old section 115BAA: 22% plus surcharge and cess, 25.17% effective). FY27-FY28 losses are carried forward under section 112 and set off in FY29, so the first tax is paid in FY30. The startup tax holiday (old section 80-IAC) could lower FY30-FY32 tax further if the company qualifies. It is not modelled.
- **Working capital.**
  - Installers prepay leads, so lead fees carry no receivable.
  - Success fees are collected in 30 days and lender fees in 45. States pay in 120 days, and that is what causes the dip in cash each April.
  - Business customers withhold ~2% TDS, refunded about a year later.
- **Development costs are all expensed.** That is the conservative choice. Under the research-finance routing, the hackathon build is research and is expensed. Post-launch feature work goes to finance-owner review: capitalising it under AS 26 needs evidence of future benefit and per-feature time tracking. That decision belongs to the founder-CEO as finance owner, with the statutory auditor. Capitalising would raise EBITDA but not cash.

## 17. KPIs we report monthly

- Reports generated, and the share rate of roof cards.
- Report → lead %, and lead → install %.
- Quote audits run, and money at risk found per audit.
- Bill audits run, and overbilling found.
- Installer NPS.
- Revenue per report, and contribution per install.
- AI cost per report.
- Months of runway.

## 18. SHARP and the HackIndia ecosystem

SHARP is not part of the core flow, because wallet friction would hurt adoption. A future referral programme could reward homeowners who share audited roof cards with SHARP tokens via the Sharp Economy, which already reaches 100,000 active users.
