# 01 · Research: what this hackathon rewards

Prepared by Claude (AI) on 9 Oct 2026, 23 days before code freeze. Every number below carries a source. Where sources disagreed, the table shows the value we chose and why.

---

## 1. Research plan

The prompt asked for exhaustive research before any idea. We split the work into seven questions and answered them in order:

| # | Question | Method | Status |
|---|----------|--------|--------|
| R1 | What exactly does the event require and reward? | Read the live event page, the HackIndia homepage, sister-event pages | Done |
| R2 | Who judges, and what do they care about? | Event page judges list, C# Corner / HackIndia background | Done |
| R3 | What does the prize really pay? | SHARP token market data | Done |
| R4 | What will the other ~1,000 teams build? | Pattern scan of recent Indian AI hackathons + HackIndia's own idea/validator pages | Done |
| R5 | Which Indian problems have hard, citable numbers in 2026? | Targeted searches across health, fintech, climate, justice, MSME | Done |
| R6 | What makes a demo survive a judge's laptop? | Technical checks: free APIs with CORS, offline fallbacks | Done |
| R7 | What did we get wrong? | Fact-check log (section 9) | Done |

---

## 2. The event, in facts

| Item | Fact | Source |
|---|---|---|
| Name | AI-First Startup Hackathon, Build a Startup Using AI Only | [hackindia.org event page](https://hackindia.org/2026/ai-first-startup-hackathon-build-a-startup-using-ai-only) |
| Organizer | HackIndia, run by CSharp Inc. / C# Corner | [hackindia.org](https://hackindia.org/) |
| Window | 2 Sep to 1 Nov 2026 | Event page |
| Code freeze | **1 Nov 2026, 08:03 IST** | Event page |
| Mode | Virtual, open worldwide, remote allowed | Event page FAQ |
| Team size | 1 to 6 | Event page |
| Registered (9 Oct) | 1,042 teams, 1,656 builders | Event page |
| Hard rule | At least 80% of the product built with AI tools; manual coding minimal; AI usage documented | Event page |
| Submission | Public GitHub repo (code + docs), live URL judges can open, 3 to 5 min demo video, pitch deck, AI usage report (tools + prompts) | Event page |
| Prizes | $10,000 / $5,000 / $2,000 in SHARP tokens; winner also gets an incubation opportunity | Event page |
| Special awards | Best AI Usage, Fastest Execution, Most Scalable Idea | Event page |
| Leaderboard | Live board tracking progress, AI usage and **deployment speed** | Event page |
| Tracks | AI SaaS, Healthcare, FinTech, Education, "AI in any startup" (climate, productivity, accessibility) | Event page |

### 2.1 The rubric (the single most important fact in this document)

The event page publishes weights. We built every later decision on them.

| Criterion | Weight | What judges look for | What it means for us |
|---|---|---|---|
| AI-First Execution | **25%** | AI as primary builder across the whole lifecycle | Show AI doing research, ideation, design, code, tests, deploy and pitch. Keep receipts. |
| Product & Innovation | 20% | Originality, product quality, real problem | Avoid the crowded ideas. Pick a problem with hard numbers. |
| Functionality & Execution | 20% | Working product, implementation, deployment | Every button must work on a judge's laptop with zero setup. |
| Market Potential | 15% | Need, opportunity, scalability, viability | Name who pays, how much, and why now. |
| AI Usage & Workflow | 10% | Tools, agents, prompts, AI-first workflows | Publish the prompts and the agent workflow, inside the product. |
| Demo & Pitch | 10% | Clarity, demo quality, storytelling | One story, one number, one wow moment. |

**35% of the score (AI-First Execution + AI Usage & Workflow) rewards how we built, not what we built.** Most teams will treat the AI usage report as paperwork. We will treat it as a feature: a public "How AI built this" page inside the live site, with the lifecycle timeline, prompts and commit history.

---

## 3. The judges

| Judge | Role | Times judged | What they likely value (inference) |
|---|---|---|---|
| Mahesh Chand | Founder & CEO, C# Corner; founder of CSharp Inc.; ex-Microsoft Regional Director, 14x MVP | 15 | Developer craft, scale (C# Corner has 3.1M+ developers), real startups over toys. C# Corner sells a "Certified Vibe Coder" program, so he knows what AI-built code looks like. |
| Avneesh Aryan | Director, HackIndia | 16 | Execution speed and completeness across hundreds of submissions. Will skim fast. The first 30 seconds of the demo matter. |
| Deepak Tewatia | CSharp Inc. | 14 | Same house as Mahesh; business viability. |
| Bharat Dixit | Engineering & AI Leader, IBM (UK) | 3 | Enterprise-grade engineering, AI architecture, robustness. Not India-resident, so India-specific context must be explained, not assumed. |

Sources: [event page](https://hackindia.org/2026/ai-first-startup-hackathon-build-a-startup-using-ai-only), [hackindia.org](https://hackindia.org/), C# Corner profile pages.

**Implication:** four seasoned judges reviewing 1,000+ entries will open the live link first. If it loads slowly, errors, or asks for an API key, we lose. If the first screen says something specific and true about India, we get attention.

---

## 4. What the prize is worth

| Fact | Value | Source |
|---|---|---|
| SHARP token | Polygon token of the Sharp Economy (C# Corner / HackIndia ecosystem) | [letsdatascience.com](https://letsdatascience.com/news/sharp-economy-reaches-100000-active-sharp-token-users-05eae226) |
| Recent price | ~$0.00075 to $0.0015 per SHARP during 2026 | [MEXC](https://www.mexc.com/price/sharp-token), [CoinCodex](https://coincodex.com/crypto/sharp-token/historical-data) |

The cash value depends on token liquidity. **The incubation opportunity and the portfolio value of a real, deployed startup are worth more than the token amount.** That pushes us toward an idea we would want to keep building after 1 Nov.

---

## 5. The competitive field

HackIndia's own site runs an "AI Startup Validator" and an "Ideas" forum, and its recent events (OpenClaw Hackathon, Spark series, AI & Web3 Builders) skew student-heavy. From those pages and recent Indian AI hackathons ([Build India](https://buildindia2026.devfolio.co/), [Build for India](https://buildforindia.startupmission.in/), [The Better Hack](https://lu.ma/ppk4824g)), these ideas are saturated:

| Saturated idea | Why it's crowded |
|---|---|
| AI resume builder / interview coach | Every student hackathon since 2023 |
| PDF / notes summarizer, AI tutor chatbot | Thin wrapper over a chat model |
| "AI co-founder that builds your startup" | The obvious meta-answer to this event's title |
| Crop disease detection from a leaf photo | Kaggle dataset, built hundreds of times |
| Scam / phishing message detector | Very popular in 2025-26 after "digital arrest" news |
| Mental health chatbot | Popular, high liability, low differentiation |
| Generic AI customer-support agent for SMBs | No moat, crowded SaaS |

**Opportunity:** domains where India has fresh 2026 numbers, a government push, and almost no student teams: rooftop solar, insurance-claim disputes, consumer-court backlog, construction cost, web accessibility compliance.

---

## 6. Market data bank (verified, used in ideation)

### 6.1 Climate / energy
| Fact | Value | Source |
|---|---|---|
| PM Surya Ghar installations (late Sep 2026) | ~51 lakh installations, 17,855 MW, ₹33,642 cr subsidy released | [sarkariyojana](https://sarkariyojana.com/shorts/pm-surya-ghar-muft-bijli-yojana-reaches-14953-mw-installed-capacity-by-july-2026/), [DD India](https://ddindia.co.in/2026/08/pm-surya-ghar-scheme-crosses-50-lakh-rooftop-solar-installations/) |
| Target | 1 crore homes; MNRE Secretary expects 85 to 90 lakh by Mar 2027 | Same |
| Pace | 5,038/day (Oct 2025) to 16,328/day (Jul 2026); 5.06 lakh in Jul 2026 alone | [DD India](https://ddindia.co.in/2026/08/pm-surya-ghar-scheme-crosses-50-lakh-rooftop-solar-installations/) |
| Budget FY27 | ₹22,000 cr | [IBEF](https://www.ibef.org/government-schemes/pm-surya-ghar-yojana) |
| Central subsidy | ₹30,000/kW for first 2 kW, ₹18,000 for 3rd kW, cap ₹78,000 | [Bluebird Solar](https://bluebirdsolar.com/blogs/all/solar-rooftop-yojana), [sarkariyojana](https://sarkariyojana.com/pm-surya-ghar-muft-bijli-yojana/) |
| State top-ups | Delhi +₹30,000 (3 kW); UP ₹15,000/kW up to ₹30,000; others vary | [Tribune](https://www.tribuneindia.com/news/delhi/delhi-cabinet-okays-30000-subsidy-for-installation-of-rooftop-solar-panels/amp), [Freyr](https://freyrenergy.com/?p=28413) |
| Loan | Collateral-free up to ₹2 lakh (≤3 kW), repo + 0.5% (≈5.75% in Jul 2026), up to 10 yrs | [SBI](https://sbi.bank.in/web/personal-banking/loans/pm-surya-ghar-loan-for-solar-roof-top), [Freyr](https://freyrenergy.com/?p=28444) |
| Price | ₹45,000 to ₹85,000 per kW before subsidy; 3 kW ≈ ₹1.35 to 2.1 lakh | [Avaada](https://www.avaada.com/blog/3kw-solar-system-price-in-india/), [VoltFlow](https://www.voltflow.net/blog/solar-panel-cost-india-2026) |
| Rule change | ALMM List-II (domestic cells) mandatory from 1 Jun 2026; DCR not relaxed for PM Surya Ghar | [TaiyangNews](https://taiyangnews.info/markets/mnre-clarifies-almm-list-ii-exemption-pm-surya-ghar-users), [SolarQuarter](https://solarquarter.com/2025/07/29/mnre-issues-amendment-mandating-almm-compliance-for-solar-pv-cells-from-june-2026) |
| Consumer pain 1 | MNRE (Jul 2026) acknowledged multiple complaints of incorrect DISCOM billing after rooftop installs | [Energetica](https://www.energetica-india.net/news/mnre-flags-incorrect-rooftop-solar-billing-by-discoms-refers-complaints-for-resolution) |
| Consumer pain 2 | Consumer forum struck down an unbacked ₹4,394 "Other Charges" line on an MSEDCL solar bill | [Down To Earth](https://www.downtoearth.org.in/renewable-energy/msedcl-cannot-levy-charges-without-legal-backing-rules-consumer-forum-in-rooftop-solar-billing-case) |
| Consumer pain 3 | Court ordered a solar firm to compensate a buyer whose system missed promised savings | [Business Today](https://www.businesstoday.in/latest/trends/story/rooftop-solar-failed-to-deliver-promised-savings-court-orders-renewable-energy-firm-to-pay-rs25265-541205-2026-07-06) |
| Consumer pain 4 | Net metering not activated after install (J&K); state subsidy arrears >₹150 cr (Assam) | [Kashmir Despatch](https://kashmirdespatch.com/loopholes-in-muft-bijli-scheme-leave-jk-consumers-powerless/), [Sentinel Assam](https://www.sentinelassam.com/north-east-india-news/assam-news/assam-yet-to-release-state-subsidy-to-pm-surya-ghar-beneficiaries-dues-cross-rs-150-crore) |
| Potential | 637 GW technical; 118 GW after consumption; 32 GW economic with subsidy; **willingness to install only 5% nationally** (13% in Gujarat) | [CEEW via pv magazine](https://pv-magazine-india.com/2023/11/16/indias-residential-rooftop-solar-potential-estimated-at-637-gw) |
| Market proof | SolarSquare (installer) raised $53M Series C (Jun 2026), ~₹1,000 cr run rate, talks at up to $500M valuation | [Mercom](https://mercomindia.com/solarsquare-raises-53-million-in-series-c-funding-round) |
| Grid emission factor | 0.727 tCO2/MWh (FY 2023-24, CEA) | [SolarQuarter](https://solarquarter.com/2025/01/06/co2-baseline-database-highlights-indias-progress-in-renewable-energy-and-emission-reduction-cea/) |
| Free irradiance data | NASA POWER climatology API, JSON, CORS-enabled, any lat/lon | Tested live on 9 Oct 2026 (`access-control-allow-origin: *`) |

### 6.2 Health
| Fact | Value | Source |
|---|---|---|
| Health claims rejected FY24 | ₹26,037 cr (₹15,100 cr disallowed + ₹10,937 cr repudiated); 11.2% of claims | [Moneylife](https://moneylife.in/article/health-insurance-claims-worth-rs2603765-crore-rejected-by-insurers-in-fy2324-govt/76282.html) |
| FY25 | 3.26 cr claims; 8% repudiated; Bima Bharosa complaints 2.58 lakh (+20%) | [IRDAI AR summary](https://algatesinsurance.in/irdai-annual-report-2024-25-highlights/) |
| Ombudsman outcomes | ~71% of 53,184 complaints resolved in policyholder's favour (FY25) | Same |
| Jan Aushadhi | 20,149 kendras (Jun 2026); ₹45,000 cr+ cumulative savings claimed | [Organiser](https://organiser.org/2026/07/27/371959/bharat/from-300-to-20149-jan-aushadhi-kendras-how-pmbjp-is-transforming-affordable-healthcare-across-india/) |
| Out-of-pocket | ~39.4% of total health expenditure (2021-22); medicines the largest share | [Frontiers](https://public-pages-files-2025.frontiersin.org/journals/public-health/articles/10.3389/fpubh.2025.1629835/pdf) |

### 6.3 FinTech / MSME
| Fact | Value | Source |
|---|---|---|
| Cyber fraud losses 2025 | ₹19,813 to ₹22,495 cr reported; I4C projects true loss ~₹1.2 lakh cr | [ThePrint](https://theprint.in/india/cybercrime-saw-24-spike-in-2025-indians-lost-rs-22495-crore-mainly-in-investment-scams/2859930/), [Moneylife](https://moneylife.in/article/fraud-alert-india-is-losing-over-22000-crore-a-year-in-cyber-scams-and-the-worst-is-yet-to-come/80612.html) |
| MSME credit gap | ~₹30 lakh cr (24%); 35% for women-owned | [SIDBI](https://www.sidbi.in/annualreport/AnnualReport202425/msme-outlook.php) |
| Udyam registrations | 6.2 cr (Mar 2025); ~8.7 cr (Jun 2026, unverified) | Same, [CivilsDaily](https://www.civilsdaily.com/news/msmes-and-viksit-bharat-2047-formalisation-credit-access-and-the-inclusion-gap/) |

### 6.4 Justice
| Fact | Value | Source |
|---|---|---|
| Court pendency | 5.64 cr cases (Jul 2026) | [Telangana Today](https://telanganatoday.com/more-than-5-64-crore-cases-pending-across-indian-courts-rs) |
| Consumer commissions | 5.15 lakh pending (end-2024); 35% older than 3 years | [India Justice Report 2026](https://indiajusticereport.org/files/National%20Consumer%20Report%20Press%20Release_IJR%202026.pdf) |

---

## 7. What wins here (synthesis)

Ranked by rubric weight, then by how cheap it is for us to secure:

1. **Proof of AI-first build (35%)**. A visible, honest AI build log beats any claim. Ship it as a page in the product, plus `docs/ai-usage-report.md` with the exact prompts.
2. **A product that works for a stranger in 10 seconds (20%)**. No login. No API key. Real data. Sample inputs pre-loaded. Deterministic fallbacks when the LLM is unreachable.
3. **A problem judges can feel and verify (20%)**. One true, specific number on the first screen.
4. **A business with a named payer (15%)**. Unit economics, not "freemium + ads".
5. **Deploy early (Fastest Execution award, leaderboard tracks deployment speed)**.
6. **Design that does not look AI-generated**. Judges have seen 1,000 purple-gradient landing pages. A distinct visual world reads as craft.
7. **A demo story with a villain**. The overpriced quote, the wrong bill, the unpaid claim. Stories need conflict.

---

## 8. Debates we held before ideation

**D1. Integrate SHARP tokens / Web3 to please the organizers?**
For: HackIndia and Sharp Economy are Web3-native; a token hook could charm. Against: the rubric has zero weight on Web3; it adds wallet friction that breaks "works in 10 seconds"; judges include an IBM AI leader. **Verdict: no token in the core flow.** Mention a possible SHARP-rewards referral program in the business plan only.

**D2. Agent framework (LangGraph, n8n, OpenClaw) vs. direct model tool-use?**
For frameworks: "AI Usage & Workflow" mentions agents explicitly. Against: frameworks add servers, keys and failure points to the live demo. **Verdict:** use direct tool-use with Claude in a serverless function (agentic: the model decides which tools to call), with a deterministic in-browser engine as fallback. Document the agent loop clearly.

**D3. Breadth (many features) vs. depth (one flawless flow)?**
Judges skim. **Verdict:** one hero flow that is flawless, plus two supporting flows that reuse the same engine. No dead buttons.

**D4. India-only vs. global problem?**
For global: one judge is UK-based. For India: HackIndia, Indian judges, fresh Indian data. **Verdict:** India-first problem, explained so a non-Indian judge gets it in one line.

**D5. Live LLM vs. offline demo?**
A live LLM call can fail, rate-limit, or need a key the judges don't have. **Verdict:** both. The product calls a server-side model when a key is configured and falls back to a transparent, rules-based engine otherwise, labeled honestly in the UI. Never fake an AI answer.

**D6. Heavy 3D vs. performance?**
The user wants Three.js, WebGL, GSAP, Lenis and awwwards-level design. Judges may open the link on a mid-range laptop. **Verdict:** one procedural 3D scene (no multi-MB model downloads), capped pixel ratio, lazy-loaded below the fold, reduced-motion path, and a static fallback if WebGL fails.

---

## 9. Fact-check log

| Claim | Conflict found | Resolution |
|---|---|---|
| PM Surya Ghar progress | Sources mix "households" (60 lakh) and "installations" (51 lakh) | Use **51 lakh installations**, cite date |
| Loan rate | 7% (Mar 2025), 6.75%, 5.75% repo-linked (Jul 2026), SBI slabs 7 to 7.9% | Default **5.75%** in calculators, user-editable, label "repo-linked, confirm with bank" |
| Delhi top-up | Older ₹2,000/kW scheme vs new ₹30,000 top-up | Use **₹30,000** (Delhi Cabinet, Tribune), mark "verify on state portal" |
| Residential tariffs | Aggregator sites disagree widely | Read the user's **own bill** for the effective rate; state values only as editable defaults |
| Health claim rejection | 8% vs "1 in 8" (The Ken) | Different definitions; use IRDAI's 8% repudiated |
| Cyber fraud 2025 | ₹19,813 cr (I4C) vs ₹22,495 cr (MHA) | Cite range |
| CEA emission factor | Version 22.0 exists but unread | Use **0.727 tCO2/MWh** (FY 2023-24), cite |
| Hackathon judging | Overview vs submission section list slightly different deliverables | Submit **all five** items |

---

## 10. Risks to any idea

| Risk | Mitigation |
|---|---|
| Live demo fails on judge's machine | Static build, no backend required for core flow, WebGL fallback, tested in headless Chromium |
| API key leakage | Server-side only, never in the client bundle |
| Claims judges can disprove | Every number in the product cites a source in-app |
| Looks AI-made | Custom visual world, no stock gradients, edited copy (stop-slop rules) |
| Rule breach (80% AI) | Claude Code wrote the code, docs, research, deck and financials; human role limited to the brief and review, logged |
