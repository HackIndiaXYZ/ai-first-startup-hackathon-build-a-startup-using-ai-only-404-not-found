# 03 · Selection: debating 25 ideas down to one

Method: three elimination rounds, then a repeated stress-test loop that stops only when the winner holds its lead through two consecutive iterations with no score change.

---

## Round 2: pairwise debates among the top 9

Each debate names the strongest case for the idea, the strongest case against it, and a verdict.

### KavachPay (fraud shield), 69
- **For:** The biggest verified loss number (₹22,000 cr/yr reported). Every judge has received a scam SMS.
- **Against:** The most crowded "serious" idea in 2025-26 Indian hackathons. Truecaller and banks already ship warnings. Consumer willingness to pay is near zero.
- **Verdict: out.** A judge who sees five scam detectors will score the fifth on originality alone.

### UdhaarScore (cash-flow credit), 69
- **For:** ₹30 lakh cr credit gap; NBFCs pay real money per report.
- **Against:** Account Aggregator access needs FIU registration; the demo would run on synthetic statements that look staged.
- **Verdict: out.** Fails the "real data in 10 seconds" bar.

### NyayMitra (consumer complaints), 69
- **For:** 5.15 lakh pending consumer cases; strong drafting use of AI.
- **Against:** Output is a document; judges can't verify quality live. LLM-dependent with no robust offline path.
- **Verdict: merge candidate** with ClaimBack (both are "AI fights for your money" stories).

### AQI Twin, 69
- **For:** Gorgeous 3D potential; free live data (Open-Meteo).
- **Against:** Shallow AI (exposure math is arithmetic); weak payer.
- **Verdict: out.** Pretty but thin on 45% of the rubric (AI depth + market).

### TenderGenie, 69
- **For:** Real B2B money; deep document AI.
- **Against:** GeM data access is restricted; demo would rely on synthetic tenders; zero visual story.
- **Verdict: out.**

### SugamWeb (accessibility), 72
- **For:** Compliance-driven B2B payer; fits the "accessibility" example in the track list; open-source rule engine (axe-core) makes the demo reliable.
- **Against:** Fetching third-party URLs needs a server proxy; the story ("your site fails WCAG 1.4.3") doesn't move a pitch audience; accessiBe-type tools exist.
- **Verdict: out**, narrowly. Kept as a feature idea: our own site must pass an accessibility audit.

### Fusion test: ClaimBack + NyayMitra + PolicyX-ray = "Haq" (your right, recovered)
Merging three money-recovery ideas gives one product: an AI that fights for money you're owed (rejected claims, refunds, consumer disputes) with a success fee.
- **New score:** P 15 · O 12 · A 15 · D 8 · M 14 · V 4 · B 7 · J 5 = **80**
- Stronger story, still LLM-dependent and visually flat.

**Round 2 result:** Chhat (93), Haq (80), BuildCheck (76) advance.

---

## Round 3: red-team the final three

We simulated each judge's toughest question and estimated official-rubric scores (out of 100, using the published weights).

### Chhat
| Judge | Toughest question | Our answer |
|---|---|---|
| Mahesh Chand | "SolarSquare already has a calculator. Why you?" | SolarSquare sells the panels; its calculator has a conflict of interest. Chhat is independent and audits their quote. Nobody audits the bill after installation, and MNRE confirmed in July 2026 that wrong bills are a real problem. |
| Avneesh Aryan | "Does it work right now?" | Open the link: pick a city, the 3D roof fills, the numbers come from NASA's live API. No login, no key. |
| Deepak Tewatia | "Who pays you?" | Installers pay per verified lead and on conversion; banks pay per originated loan. A converted home is worth ₹6,000 to 8,000 to us. |
| Bharat Dixit | "Is the AI essential or decorative?" | The agent reads bills from dozens of DISCOM formats, parses free-form vendor quotes, and decides which tools to call. A form can't read a crumpled MSEDCL bill photo. The deterministic engine underneath means the AI never invents a number. |

Predicted official score: AI-First 23/25 · Product 18/20 · Functionality 19/20 · Market 14/15 · AI Workflow 9/10 · Demo 9/10 = **92**

### Haq
| Judge | Toughest question | Our answer |
|---|---|---|
| Mahesh Chand | "How do you know your drafts win?" | Ombudsman awards are public, but we have no outcome data yet. Weak answer. |
| Avneesh Aryan | "Does it work right now?" | Only with a live LLM key and a real policy PDF. Fragile. |
| Deepak Tewatia | "Who pays?" | Success fee. Strong. |
| Bharat Dixit | "Liability?" | Legal-advice disclaimers; still a real concern. |

Predicted official score: 22 · 17 · 14 · 14 · 9 · 7 = **83**

### BuildCheck
| Judge | Toughest question | Our answer |
|---|---|---|
| Mahesh Chand | "Where does your rate data come from?" | CPWD schedule of rates, adjusted by city index; real market rates vary ±30%. Medium answer. |
| Avneesh Aryan | "Does it work right now?" | Yes, with sample estimates. |
| Deepak Tewatia | "Who pays?" | Per report; unclear repeat usage (people build one house). |
| Bharat Dixit | "Is the AI essential?" | BOQ parsing is useful; benchmarking is lookup. Medium. |

Predicted official score: 21 · 16 · 16 · 11 · 8 · 8 = **80**

---

## The stress-test loop

Each iteration attacks the current leader with a new adversarial scenario, re-scores all three, and checks whether the ranking changes.

### Iteration 1: "The subsidy scheme ends in March 2027."
- **Chhat:** Economics survive without subsidy (3 kW at ~₹55k/kW pays back in ~6 to 7 years at ₹8/unit). Post-scheme, the advisor and bill-audit roles grow: 51 lakh+ installed homes need billing audits forever. Commercial & industrial rooftops and home batteries are the next markets. Score change: −1 on Market (→13). **Chhat 91.**
- Haq, BuildCheck: unaffected. **Ranking unchanged.**

### Iteration 2: "A judge opens the site on a 2019 laptop with WebGL disabled."
- **Chhat:** Static fallback image of the roof plus all calculators still work (the 3D scene is an enhancement, not the product). No change. **91.**
- **Haq:** Unaffected by WebGL, but fails if the LLM endpoint is unreachable. −1 Functionality. **82.**
- **BuildCheck:** 3D cost map is central to its demo. −2. **78.**
- **Ranking unchanged.**

### Iteration 3: "A competing team also builds a solar calculator."
- A plain calculator covers 1 of our 4 flows. Quote audit and post-install bill audit are the differentiators; the 3D sun-path roof and live NASA data are hard to match in the same window. −1 Originality. **Chhat 90.** Ranking unchanged.

### Iteration 4: "The AI usage judge asks to see the agent loop."
- **Chhat:** The agent has 7 typed tools (`get_irradiance`, `size_system`, `compute_subsidy`, `finance_options`, `audit_quote`, `audit_bill`, `search_knowledge`), with bill and quote reading as a separate extraction step; the UI shows a live trace of tool calls. +1 AI Workflow. **Chhat 91.**
- **Haq:** Comparable agent depth. **82.**
- Ranking unchanged.

### Iteration 5: "Is this what the user wants?"
The brief asks for Three.js, WebGL, GSAP, Lenis, 3D models and awwwards-grade design, plus a multimillion-dollar business with real financials.
- **Chhat:** 3D is native to the product (the roof is the interface), and the business has three named payers. Full fit.
- **Haq:** 3D would be decoration on a document product. Weak fit.
- **BuildCheck:** Good 3D fit, weaker business.
- Ranking unchanged.

### Iteration 6: repeat of iteration 2's check with updated scores
No score moved. Two consecutive iterations (5 and 6) with no change. **Loop ends.**

---

## Final ranking

| Rank | Idea | Final predicted official score |
|---|---|---|
| 1 | **Chhat**, the independent AI solar advisor | **91** |
| 2 | Haq, the AI that recovers money you're owed | 82 |
| 3 | BuildCheck, the cost auditor for self-built homes | 78 |

## Decision

**We build Chhat.**

It wins on the four things that matter most here:
1. **It works for a stranger in ten seconds**, on live NASA data, with no key and no login.
2. **The AI does real work.** It reads bills and quotes no form could parse, and it calls typed tools so it never invents a number.
3. **Someone pays.** Installers, lenders, and later DISCOMs, with unit economics anchored in a market where SolarSquare just raised $53M on ~₹1,000 cr run rate.
4. **It is the most visual idea on the list**, which matches the user's brief for 3D and motion.

Name check: "Dhoop" (sunlight) was the first name; a small Indore installer already trades as Dhoop Solar, so we dropped it. **Chhat** (छत, Hindi for roof) had no conflict in a search on 9 Oct 2026, and the product starts at the roof.
