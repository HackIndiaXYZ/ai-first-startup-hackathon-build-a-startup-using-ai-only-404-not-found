# Chhat finance review

*What the hackathon asks for on money, what Chhat submits, and why each number holds. Prepared by Claude (AI) with the research-finance skill on 31 Oct 2026. Every figure is in `Chhat-financial-model.xlsx`. Run `python business/build_model.py --verify` to rebuild the model and confirm that all 9,453 formulas calculate with zero errors and that 123 key figures match an independent Python implementation.*

---

## 1. What HackIndia requires

The event page lists five deliverables (read 30 Oct 2026): a public GitHub repo, a live deployed app, a 3-5 minute demo video, a pitch deck, and an AI usage report (tools and prompts). **There is no separate financial deliverable.** No business plan, financial model or projections are required.

Money is judged in three places:

| Where | Weight | What the judges score |
|---|---|---|
| Market Potential | 15% | "User need, market opportunity, scalability, and potential to become a viable startup" |
| Demo & Pitch | 10% | Clarity and storytelling of the pitch |
| Special award | n/a | "Most Scalable Idea" |

The finance story lives in the pitch deck (slides 7-10, 13 and 15). The business plan and this model are the evidence behind it. Code freeze is **1 Nov 2026, 08:03 IST**.

## 2. The numbers judges see (base case)

| What a judge looks for | Chhat's number | Slide |
|---|---|---|
| Who pays, and how much | Installers ₹1,500 per verified lead + 2% of system value; lenders 1%; installer SaaS ₹2,999/month; states ₹40 lakh a year | 8 |
| Market | TAM ₹1,82,400 crore (stock) · SAM ₹2,278 crore a year · FY31 SOM ₹80 crore (3.5% of SAM) | 7 |
| Unit economics (FY28) | ₹196 revenue vs ₹96 variable cost per report (2.0x) · ₹4,803 contribution per installed home | 9 |
| Five-year plan | Revenue ₹0.6 crore → ₹79.8 crore; EBITDA positive in FY29; 35% margin in FY31 | 10 |
| The ask | ₹6 crore seed for 15% (₹40 crore post-money) | 15 |
| Runway | EBITDA positive every month from Apr 2028; cash low point ₹1.9 crore in May 2028 | 15 |
| Risk | Downside: break-even Jan 2030; ~₹6.1 crore more needed, starting May 2028 | 10 |
| AI economics | ₹4.86 per report on today's code → ₹1.73 with model routing; under 1% of revenue | 9 |

## 3. What changed in this refresh, and why

The previous model's arithmetic was right. Its inputs and structure had drifted from reality.

| Item | Before | After | Why |
|---|---|---|---|
| FY31 revenue | ₹86.7 crore | ₹79.8 crore | Added 5% lead credits, 15% success-fee leakage, and a 2-month lag from lead to install |
| EBITDA FY29 / FY31 | ₹3.44 / ₹31.0 crore | ₹2.64 / ₹28.0 crore | Pay now rises 9% a year (it was flat for five years). Hiring is planned by function, callers scale with lead volume, and a support team is added. |
| Cash low point | ₹3.8 crore (year-end view) | ₹1.94 crore in May 2028 (monthly view) | Year-end balances hid the trough. Working capital is now modelled: states pay in 120 days, and TDS is refunded a year later. |
| Tax | 25.17% of EBITDA, losses not carried forward | 25.17% of profit before tax, after loss set-off | Matches the Income-tax Act, 2025 (s.200 rate, s.112 eight-year carry-forward). First tax is paid in FY30. |
| Series A | ₹40 crore raised in FY29 and never spent, so cash piled up to ₹77 crore | Optional; in no scenario | A raise with no use of funds invites the obvious question |
| SAM | TAM × take rate = ₹11,708 crore, a stock | ₹2,278 crore a year, an annual flow | FY31 revenue (annual) was being compared with a one-time pool |
| Scheme progress | "51 lakh, half the target" | 51.7 lakh installations serving 61.4 lakh households; 1 crore-home target by 31 Mar 2027 | The target counts households, not installations, and the scheme closes in five months |
| AI cost per report | ₹6 → ₹3 (estimate) | ₹4.86 (Opus 5.5) → ₹1.73 (Haiku 5.5 reads documents, Sonnet 5.5 chats) | Built from token counts in the actual server code, at ₹94.93/$ |
| Use of funds | 45 / 30 / 15 / 10 | 38 growth / 34 product / 18 G&A / 10 network | Taken from the model's spend mix over the seed period |
| Capex | ₹1.2 lakh per head, every year | ₹0.9 lakh per new hire + 3-year refresh, depreciated | The old line bought every laptop again every year |
| FY31 headcount | 150 | ~124 on average | Callers now scale with leads; operations are AI-first |
| Scenarios | One FY29 sensitivity grid | Base, downside and upside, each with monthly cash | The first thing an investor asks is "what if it's slower?" |

The two claims in the recorded demo video still hold: "₹6 crore for 15%" and "EBITDA positive in FY29 in the base case".

## 4. Scenarios

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
- Management holds non-caller hiring at 80% of plan.

**Upside:**
- 20% more traffic.
- About 25% more revenue per report.
- Hiring 15% above plan, to serve the extra volume.

**Sensitivity:** FY29 EBITDA stays positive down to about ₹1,200 a lead (at 20% conversion), or about 11% conversion (at ₹1,500 a lead). A ₹900 lead fee would need about 29% conversion. The grid is linear in both inputs, so these break-even points are read straight from it.

## 5. research-finance packet

### 5.1 Seed-period budget (`program_budget_planner.py`, software-rd profile)

| ₹ lakh | FY27* (Nov-Mar) | FY28 | Total |
|---|---|---|---|
| Direct spend | 153.2 | 1,020.8 | 1,174.0 |
| Indirect (F&A) at 0% | 0 | 0 | 0 |

- **The F&A rate is deliberately 0%.** A startup has no negotiated indirect-cost rate (NICRA). All overhead is already budgeted as explicit lines: G&A at 15% of payroll, plus office, tools and compliance. Applying a rate on top would count it twice.
- **Devices are excluded from any indirect base.** The ₹35.7 lakh of laptops are capital equipment.
- **Largest lines:** customer acquisition ₹380 lakh and the product & engineering team ₹350 lakh.

### 5.2 Burn and runway (`burn_runway_tracker.py`, 6-month alert threshold)

| Checked at Mar 2027 | Cash | Trailing 3-month burn | Runway at flat burn | Milestone verdicts |
|---|---|---|---|---|
| Base | ₹519.9 lakh | ₹21.2 lakh/month | 24.6 months | Sep 2027 (needs ₹164 lakh): **reachable** · break-even Apr 2028 (needs ₹322 lakh): **reachable** |
| Downside | ₹507.0 lakh | ₹24.7 lakh/month | 20.5 months | Sep 2027 (₹190 lakh): **reachable** · break-even Jan 2030 (₹1,084 lakh): **at risk** (flagged) |

- The tracker assumes flat burn. The monthly model, which ramps, sets the trough.
- **Action: a go/no-go review in Sep 2027.** If reports are tracking the downside, start the bridge or Series A then. That leaves eight months before cash would run out in May 2028.

### 5.3 Capitalise or expense (`capex_vs_opex_router.py`)

The router applies the IAS 38 test, which matches Indian GAAP AS 26 and Ind AS 38.

| Cost item | Routing | Reason |
|---|---|---|
| Hackathon build: research, idea tournament, PV prototype | Expense | Research phase |
| Accuracy eval for Haiku 5.5 extraction | Expense | Research phase |
| Post-launch feature development | Finance-owner review | Future economic benefit not yet evidenced; no per-feature time tracking |
| Data assets: city price index, DISCOM error map | Finance-owner review | Same gaps. AS 26 also bars internally generated customer lists. |

- **The model expenses everything.** That is the conservative choice: capitalising would raise reported EBITDA but not cash.
- **Named owner:** the founder-CEO, as finance owner until a controller is hired, with the statutory auditor (a CA firm appointed under Companies Act 2013 s.139). The tool recommends; it does not book entries.

### 5.4 The five forcing questions, answered

1. **Research or development?** The pre-launch build is research and is expensed. Post-launch features are development, but evidence for two of the six criteria is missing, so they are expensed as well.
2. **Indirect rate?** None. Overheads are explicit lines.
3. **Does runway clear the milestone?** In the base case, yes: break-even in Apr 2028 with ₹1.9 crore to spare. In the downside, no; the response is the Sep 2027 review above.
4. **Is the headline risk-adjusted?** No. It is the base case. The downside shows what the seed does not cover. We do not publish a probability-weighted figure, because we cannot evidence the probabilities.
5. **Who signs the accounting treatment?** The founder-CEO, with the statutory auditor.

## 6. The assumptions that carry the most weight

| Assumption | Value | Evidence | What breaks it |
|---|---|---|---|
| Lead fee | ₹1,500 | Indian solar leads sell at ₹1,200-3,500 for medium-to-high quality. The installer's cost per sale is 5.9% of system value; US installers aim for under $1,500, roughly 5-7% of a home system. | Below ~₹1,200 at 20% conversion, FY29 turns negative |
| Lead → install | 20% | Assumption: exclusive leads that arrive with a bill and roof model | Below ~11% at ₹1,500 |
| Report volume | 40,000 → 40 lakh a year | Plan; the downside cuts it by 30% | Downside needs ₹6.1 crore more |
| Acquisition cost | ₹100 → ₹60 per report | Solar search clicks cost ₹15-45 in India; about 30% of clicks become a report; organic shares bring the average down | +10% is already in the downside |
| National market after the scheme | 20 lakh homes a year | Assumption: one-third of the 2026 peak of ~61 lakh a year | Chhat needs 3% of it in FY31 |
| Engineer pay | ₹22 lakh CTC, +9% a year | Bengaluru SDE-2 ₹20-40 lakh; Aon 9.1% and Mercer 9% for 2026 | Already conservative |

## 7. Sources

Every source is listed with its URL on the model's Sources sheet. The main ones:

- HackIndia event page (rules and weights).
- PM Surya Ghar portal counter for 9 Oct 2026 (via Blues Renewables) and SolarQuarter (Aug 2026).
- CEEW 2023 (rooftop potential).
- Claude API pricing and vision docs (platform.claude.com).
- Rupee close of ₹94.93/$ on 30 Oct 2026.
- Aon and Mercer 2026 salary surveys; AmbitionBox; Hyring.
- Income-tax Act, 2025 s.200 and s.112.
- Mocaup (Indian lead prices); quickestimate.co (solar CPCs); SolarReviews (cost per close).

## 8. Before the freeze

- **Redeploy the live site** so `/#/deck` shows the new numbers. The PDF and slide images in `pitch/` are already re-exported.
- **Demo video.** Its spoken claims still hold. If the video shows the old five-year chart on screen, re-record only if time allows.
- **Portal counter.** Check the live counter at pmsuryaghar.gov.in before presenting. The 9 Oct figures come through a secondary source.
