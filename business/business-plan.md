# Chhat business plan

*Prepared by Claude (AI) acting as financial advisor, October 2026. Every figure traces to `Chhat-financial-model.xlsx` (formula-driven, 235 formulas, zero errors) or to a sourced line in `docs/01-research.md`.*

---

## 1. Summary

**Chhat (छत, "roof") is the independent AI solar advisor for Indian homes.** It reads a household's electricity bill, models the roof on 20 years of NASA sunlight, stacks central and state subsidies, compares cash and loan, audits the installer's quote before the homeowner signs, and audits DISCOM bills after installation.

Homeowners use it free. **Installers pay for verified leads (₹1,500) and 2% on completed installs; lenders pay 1% on loans originated; installers subscribe to a quote and CRM tool (₹2,999/month); states and DISCOMs buy analytics (₹40 lakh a year).**

| ₹ crore | FY27* | FY28 | FY29 | FY30 | FY31 |
|---|---|---|---|---|---|
| Revenue | 0.79 | 8.97 | 26.80 | 54.48 | 86.70 |
| EBITDA | (0.48) | (1.43) | 3.44 | 15.24 | 31.02 |
| EBITDA margin | n/m | (16%) | 13% | 28% | 36% |

\*FY27 runs from launch in Nov 2026 to Mar 2027.

**Ask: ₹6 crore seed for 15% (₹40 crore post-money).** It funds the company to EBITDA break-even in FY29 with ₹3.8 crore of cash at the low point.

---

## 2. The problem

India is in the middle of the largest residential solar push in its history, and the household making the decision has no one on their side.

- **Scale.** PM Surya Ghar reached ~51 lakh installations by late September 2026, against a target of 1 crore. Installations peaked at 16,328 a day in July 2026. The FY27 budget is ₹22,000 crore.
- **Distrust is the bottleneck, not sunlight.** CEEW found 637 GW of technical residential rooftop potential, 32 GW of economic potential with subsidy, and **only 5% of households willing to install**.
- **Bad quotes cost real money.** Since 1 June 2026, subsidy requires DCR panels with ALMM List-II cells. A non-DCR panel forfeits up to ₹78,000. Quotes still charge old GST rates (12-13.8% instead of ~8.9%) and under-deliver capacity.
- **Bad bills after install.** In July 2026 MNRE acknowledged multiple complaints of incorrect DISCOM billing after rooftop installs. Consumer forums are striking down unexplained charges. Net meters go un-activated for months.
- **Every existing calculator belongs to someone selling panels.** SolarSquare (a $53M Series C installer), Freyr and Loom all run calculators whose job is to close their sale.

## 3. The product

| Tool | What it does | AI's job |
|---|---|---|
| **Roof Report** | Sizes the system, models monthly generation, net metering, subsidy, loan, 25-year cash flow and CO₂ | Reads the bill (Claude vision or on-device OCR); picks the panel count with the best 25-year NPV |
| **Quote Check** | 14 checks: fair price, DCR/ALMM, capacity arithmetic, inverter sizing, warranties, structure, GST, payment terms | Reads free-form quotes; writes the negotiation message in English or Hindi |
| **Bill Audit** | Checks import − export − credit against billed units, flags zero export and unexplained charges | Reads the bill; drafts the DISCOM correction letter with escalation path |
| **Ask Chhat** | Agent that answers in Hindi, Hinglish or English | Claude calls seven typed tools; every number comes from the tested engine |

Design principle: **the model never computes a rupee figure itself.** It decides which tool to call. That keeps answers auditable and makes the product work without a model at all (on-device mode), which matters for cost and for trust.

## 4. Market

| Layer | Definition | Size |
|---|---|---|
| Scheme window | 49 lakh homes still to reach 1 crore × ₹1.82 lakh average system | **₹89,376 crore** of installations |
| TAM | 32 GW economic residential potential (CEEW) ≈ 1 crore homes at 3.2 kW × ₹1.82 lakh | **₹1.82 lakh crore** |
| SAM | Chhat's take on that TAM (6.4% of system value via leads, success fee, loan fee) | **₹11,708 crore** |
| SOM (FY31) | Model revenue | **₹86.7 crore** (0.74% of SAM) |

Beyond the scheme: 51 lakh+ homes already installed need bill audits for 25 years. Commercial and industrial rooftops, home batteries and EV charging reuse the same engine.

## 5. Business model

| Stream | Payer | Price | FY31 revenue |
|---|---|---|---|
| Verified leads | Installers | ₹1,500 per lead | ₹48.0 crore |
| Success fee | Installers | 2% of system value | ₹22.1 crore |
| Loan origination | Banks / NBFCs | 1% of loan | ₹3.6 crore |
| Installer SaaS | Installers | ₹2,999/month | ₹9.0 crore |
| Analytics | States / DISCOMs | ₹40 lakh per state-year | ₹4.0 crore |

**Why installers pay a referee.** Leads arrive pre-qualified with a bill, a roof model and a buyer who already trusts the numbers. Installers whose quotes pass the audit get a "Chhat Verified" badge and rank higher. Cancellations fall because the buyer saw the numbers before the site visit.

## 6. Unit economics (FY28)

| Metric | Value |
|---|---|
| Revenue per report | ₹224 |
| Variable cost per report (acquisition ₹85 + AI ₹5) | ₹90 |
| Revenue / variable cost | 2.5x |
| Reports per installed home (8% → lead, 20% → install) | 62.5 |
| Marketplace revenue per installed home | ₹11,708 |
| Contribution per installed home | ₹6,083 (52%) |
| Chhat's take as share of that home's 25-year savings | 1.6% |

The AI cost line is real: Claude Opus 5.5 at $4/$20 per million tokens costs about ₹5 per report (two extraction calls plus a short chat), and falls with prompt caching. The on-device mode costs nothing.

## 7. Go-to-market

1. **Months 0-3: Delhi NCR, UP, Maharashtra.** Highest subsidy stacks (Delhi +₹30,000, UP +₹30,000) and highest tariffs (MSEDCL). Content on every "PM Surya Ghar subsidy [city]" query; Hindi-first.
2. **Growth loop: the roof card.** Every report produces a shareable image ("My roof in Pune makes 4,520 units a year"). WhatsApp is the channel.
3. **Supply side: 50 installers per city**, recruited from the national vendor list, onboarded on audit scores, not ad spend.
4. **Lenders: two PSU banks and one NBFC** as loan partners, using the PM Surya Ghar concessional product.
5. **B2G from FY28:** a free billing-error dashboard for one DISCOM, converted to a paid state contract.

## 8. Competition

| Player | What they do | Why Chhat is different |
|---|---|---|
| SolarSquare, Freyr, Loom, Fenice | Install and finance | They sell panels; Chhat audits them. They become Chhat customers through leads. |
| PM Surya Ghar portal | Application and subsidy process | Process, not advice. Chhat prepares people for it. |
| Lead aggregators (IndiaMART, JustDial) | Sell unverified leads | No sizing, no audit, no trust. |
| Generic AI chatbots | Answer questions | Invent numbers; no tools, no rules engine, no Indian data. |

## 9. Moat

1. **City price index** from every audited quote (dated, per kW, per panel type).
2. **DISCOM error map** from every audited bill, valuable to regulators and states.
3. **Calibrated yield model**: post-install bills show real exports per city, which tune the PV model beyond NASA averages.
4. **Trust brand**: independence is a position only one company can credibly hold per market.

## 10. Team and hiring

| | FY27* | FY28 | FY29 | FY30 | FY31 |
|---|---|---|---|---|---|
| Average headcount | 10 | 35 | 70 | 110 | 150 |

First ten: 4 engineers (one ML/PV), 1 designer, 2 growth, 2 installer-network ops, 1 founder-CEO. Lead-verification callers scale with leads.

## 11. Funding and use of funds

**Seed: ₹6 crore for 15%** (₹40 crore post-money).

| Use | Share | ₹ lakh |
|---|---|---|
| Product & engineering | 45% | 270 |
| Growth | 30% | 180 |
| Installer network & lead verification | 15% | 90 |
| Compliance, legal, G&A | 10% | 60 |

Runway: cash bottoms at ₹3.8 crore at the end of FY28; EBITDA turns positive in FY29. A ₹40 crore Series A in FY29 funds expansion to 15 states and the C&I product.

## 12. Milestones

| By | Milestone |
|---|---|
| Nov 2026 | Live product (this submission); 3 cities; first 20 installers |
| Mar 2027 | 40,000 reports; first lender partner; 640 installed homes influenced |
| Sep 2027 | 10 states; Chhat Verified badge live; first DISCOM pilot |
| Mar 2028 | ₹9 crore revenue run-rate; 6,400 installs influenced |
| FY29 | EBITDA positive; Series A |

## 13. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| PM Surya Ghar ends in March 2027 | Medium | Economics stand without subsidy (payback ~6-7 years at ₹8/unit); bill audits continue for 51 lakh+ installed homes; C&I and battery products |
| Installers refuse to pay a referee | Medium | Lead quality data; "Verified" ranking; start with installers who already compete on quality |
| Data accuracy disputes | Medium | Every figure sourced in-app; all assumptions editable; quote audit shows rule and source per finding |
| LLM cost or outage | Low | On-device mode is complete; model calls only for reading documents and chat |
| Regulatory (advice liability) | Low | Clear "estimates, not financial advice"; no money handled; letters are drafts for the consumer |
| Copycats | High | Moat is the dataset and the installer network, not the calculator |

## 14. KPIs we report monthly

Reports generated · share rate of roof cards · report → lead % · lead → install % · quote audits run · money-at-risk found per audit · bill audits run · overbilling found · installer NPS · revenue per report · contribution per install.

## 15. SHARP and the HackIndia ecosystem

Not part of the core flow (wallet friction would hurt adoption). A future referral programme could reward homeowners who share audited roof cards with SHARP tokens via the Sharp Economy, which already reaches 100,000 active users.
