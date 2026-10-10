# AI usage report

**Team:** 404 not found · **Product:** Chhat, the independent AI solar advisor for Indian homes
**Hackathon:** HackIndia AI-First Startup Hackathon, Build a Startup Using AI Only (Sep to Nov 2026)

This report covers two things the rules ask for: how AI built the startup, and how AI works inside the product. A live version with the commit timeline sits at `/#/built-with-ai` in the deployed app.

---

## 1. Summary

| | |
|---|---|
| Primary builder | **Claude Code** (Anthropic), running autonomously in a cloud session |
| Human input | Two written briefs (below), a folder of design skills and the shadcn/ui source added to the repo as reference, and review |
| Code written by a human | **0 lines** |
| Share of execution done by AI | Research, ideation, selection, planning, design, all code, tests, copy, 3D, financial model, business plan, deck, demo recording: **~100%** |
| Model inside the product | Claude (`claude-opus-5-5`) via the Anthropic SDK, with an on-device fallback |

---

## 2. The lifecycle

| # | Stage | What the AI did | Output | Human role |
|---|---|---|---|---|
| 1 | Research | Read the live event page and found the weighted rubric. Profiled judges, priced the SHARP prize, mapped saturated ideas, ran ~30 web searches for 2026 India data, logged conflicts between sources and which value it chose | `docs/01-research.md` | Brief |
| 2 | Ideation | 25 ideas across all tracks, each mapped on 13 dimensions, scored on an 8-factor rubric derived from the official weights | `docs/02-ideation.md` | None |
| 3 | Selection | Pairwise debates, a fusion test, judge-by-judge red team, and a stress-test loop until the ranking held twice | `docs/03-selection.md` | None |
| 4 | Planning | Full plan, then a second pass from five perspectives (judge, homeowner, installer, VC, designer) that added nine features | `docs/04-plan.md` | None |
| 5 | Data | Fetched NASA POWER climatology for 72 Indian cities | `app/src/data/cities.json`, `app/scripts/fetch-nasa.mjs` | None |
| 6 | Engine | PV model, sun position, subsidy, net metering, finance, quote audit, bill audit | `app/src/engine/*` | None |
| 7 | Tests | 34 unit tests on the engine, parsers and agent; ran them, fixed failures | `app/tests/*` | None |
| 8 | AI layer | Seven typed tools, a Claude agent loop, an on-device agent, document extraction, a bilingual knowledge base | `app/src/ai/*`, `app/server/*`, `app/api/*` | None |
| 9 | Design | Read the design skills in `skills/`, chose the visual world, palette, type and motion, built every page | `app/src/styles/*`, `app/src/routes/*` | Supplied skills |
| 10 | 3D | Procedural Indian rooftop, neighbourhood, kites, sky shader, scroll-driven day cycle | `app/src/three/*` | None |
| 11 | QA | Rendered pages in headless Chromium, read the screenshots, and fixed what it saw (contrast, scale, overflow, labels) | screenshots in session | None |
| 12 | Business | Formula-driven model (235 formulas, recalculated with zero errors) and business plan | `business/*` | None |
| 13 | Pitch | 15-slide deck built as a route in the app, exported to PDF | `pitch/*`, `app/src/routes/Deck.tsx` | None |
| 14 | Demo | Wrote the script and recorded the walkthrough with a scripted browser; in the second pass re-recorded it on a virtual clock so the 3D scene plays smoothly at full quality without a GPU | `pitch/chhat-demo.mp4`, `docs/demo-script.md` | Optional voice-over |
| 15 | Deploy | Static build plus serverless functions; configs for Vercel, Netlify and GitHub Pages | `vercel.json`, `netlify.toml`, `.github/workflows/` | Adds the API key and clicks deploy |
| 16 | Design overhaul | Second brief: re-read the Awwwards, taste, GSAP and motion skills; wrote a design brief; sourced CC0 models through the Poly Haven API and built an optimising pipeline; rebuilt the 3D renderer and the landing; added a motion system, preloader, route curtain and cursor | `docs/05-design.md`, `app/scripts/fetch-assets.mjs`, `app/src/three/*`, `app/src/lib/motion.ts` | Second brief |
| 17 | Test phase | Wrote 23 new unit tests and a Playwright suite (smoke, flows, accessibility with axe-core, keyboard, reduced motion, no-WebGL, mobile, 4-width viewport sweep); fixed every failure it found | `app/tests/design.test.ts`, `app/e2e/*`, `docs/test-report.md` | None |

---

## 3. Tools used

| Tool | Used for |
|---|---|
| Claude Code | Everything above: planning, coding, testing, browsing, file generation |
| Web search + fetch (inside Claude Code) | Hackathon page, market data, regulations, prices |
| Skills from the repo's `skills/` folder | `impeccable`, `awwwards` (three variants incl. `awwwards-designer`), `design-taste-frontend`, `stop-slop`, `emil-design-eng`, `gsap-web` |
| Built-in skills | `claude-api` (SDK usage), `dataviz` (chart method and palette validation), `xlsx` (financial model and LibreOffice recalc) |
| Playwright + headless Chromium | Screenshots for self-review, deck PDF export, demo video recording, the end-to-end test suite |
| Poly Haven API (CC0) | Six 3D models and three PBR texture sets for the rooftop |
| glTF-Transform, meshoptimizer, sharp | Simplifying, compressing and re-texturing the models for the web (738 KB total) |
| GSAP (ScrollTrigger, SplitText, CustomEase), Lenis | Scroll story, text reveals, the motion vocabulary |
| postprocessing + N8AO | Ambient occlusion, bloom, SMAA, tone mapping |
| axe-core | Automated WCAG 2.1 AA checks on every route |
| LibreOffice | Recalculating and error-checking the financial model |
| NASA POWER API | Irradiance and temperature data |

---

## 4. Prompts

### 4.1 The brief (verbatim from the team's document, typos kept)

> Hack India startup with AI hackathon.
>
> First, you need to research everything about it, charging right here, every factor you can ever think of. This is going to be a long task, and you are supposed to do it in long, exhaustive detail, not skipping a step.
> 1. You have to plan your deep research.
> 2. You have to map out every factor, do the research, and check it.
> 3. You have to verify it, fact-check, and see what's important and what's not.
> 4. You have to find out what's good for winning.
> 5. You have to debate it.
> 6. Once you have all the information with you, you need to start an ideaotron.
> 7. You need to find the best idea.
> 8. You need to map one.
> 9. You need to make 25 fully functional ideas. Fully functional means you make 25 ideas, and for every one of the 25 ideas, all the aspects involved in this hackathon are fully mapped out, and the ideas are fully complete.
> 10. You will debate all of them, making sure the 25 ideas are the best of the best.
>
> This should be the absolute finest quality, making sure what judges will like, what the hackathon is aimed for, what is to me, and how I like it, and how I will win this. The primary motive is winning.
> 1. All of them.
> 2. You will choose one idea after comparing them absolutely rigorously in a repetitive loop until you get one perfect idea.
> 3. You will plan that idea in exhaustive detail, map out every roadblock, every possible thing, and everything to be done.
> 4. You will plan it again from a new, fresh perspective and see if there is any creative stuff to be added.
> 5. After planning, you will implement that plan.
>
> After planning, you will implement that plan in absolute entirety, doing absolutely everything perfectly. Also, do not make it look like AI. Make it look very good, make it fully functional, make it fully ready, and make everything ready. After doing that, making it isn't the only thing. There are other aspects to this hackathon, such as financials and a business plan that you have to To research thoroughly in the shoes of a financial advisor while making the website in the shoes of a web designer, the absolute best of the best: you have to act as your best agency in the world, and you have to map out every aspect needed. You not only map out, but you have to create a fully functioning, ship-ready, perfect multimillion-dollar idea, perfect finance, everything done. … You have to behave completely autonomously. If there is a roadblock or contradiction in the prompt, or something you can't get done, find out 10 different ways to get it done. If you still can't, find viable alternatives, all autonomously working, never asking for human input.

Accompanying chat message (verbatim): *"ALONG WIT THIS USE GITHUB AND EXSTING CODEBASES AND ANIMATION 3js opne gl webgl and 3d moldes form the web and tkae intpration for deing from awwwards site veryiporants to make desing v rey ood form going to github and getting dood desing elments and react componet and gspa smooth scroll and scrrool anumation for github other free 3d modles . lenis soomth scroll and option but highly recomned all the desing skills such as the ones in the skills folder aand u can use react comnets folder too so get to wrk"*

### 4.1b The second brief (verbatim, typos kept)

Sent with the same PDF as the first brief, after the first version shipped:

> Registered ALONG WIT THIS USE GITHUB AND EXSTING CODEBASES AND ANIMATION 3js opne gl webgl and 3d moldes form the web and tkae intpration for deing from awwwards site veryiporants to make desing v rey ood form going to github and getting dood desing elments and react componet and gspa smooth scroll and scrrool anumation for github other free 3d modles . lenis soomth scroll and option but highly recomned all the desing skills such as the ones in the skills folder aand u can use react comnets folder too so get to wrk AND A EXTENSIVE TEST PAHSE AND READ THE DOCUMENT ABOVE

How Claude read it: keep the product and research (they already followed the first brief), raise the design to Awwwards level using open-source code and free 3D assets from the web, and prove it with an extensive test phase. The design brief it wrote for itself is `docs/05-design.md`.

### 4.2 Research queries the AI ran (selection)

- `HackIndia "AI-First Startup Hackathon" build a startup using AI only`
- `HackIndia hackathon judging criteria winners 2025`
- `Mahesh Chand C# Corner Sharp tokens Sharp Economy hackathon`
- `"Sharp token" C# Corner SHARP crypto token value 2026`
- fetch: `hackindia.org/2026/ai-first-startup-hackathon-build-a-startup-using-ai-only` → weighted rubric
- `PM Surya Ghar Muft Bijli Yojana installations progress 2026 households rooftop solar subsidy`
- `India cyber fraud losses 2025 I4C digital arrest UPI fraud crore`
- `India health insurance claim rejection rate 2025 IRDAI claims repudiated crore`
- `India MSME credit gap 2025 Udyam registrations crore SIDBI`
- `India pending court cases 2026 crore National Judicial Data Grid consumer commission pending cases`
- `rooftop solar cost per kW India 2026 residential DCR panels price 3kW system cost after subsidy`
- `PM Surya Ghar collateral free loan interest rate 7% repo rate up to 3 kW SBI rooftop solar loan 2026`
- `SolarSquare funding 2026 residential rooftop solar startup India revenue`
- `rooftop solar consumer complaints India vendors overcharging net metering delay subsidy delay 2026`
- `state additional subsidy rooftop solar 2026 Delhi Uttar Pradesh Assam Uttarakhand Haryana top-up`
- `ALMM List II solar cells June 2026 rooftop DCR requirement PM Surya Ghar`
- `average residential electricity tariff by state India 2025-26`
- `CEEW residential rooftop solar potential India 637 GW`
- `CEA CO2 baseline database grid emission factor India`
- `GST rate solar rooftop system 5% September 2025 70:30 composite supply`
- `PM Surya Ghar special category states subsidy ₹33,000 per kW ₹85,800`
- `PM Surya Ghar vendor 5 year comprehensive maintenance warranty galvanized structure`
- Name checks: `"Dhoop" solar startup India` (conflict found, name dropped), `"Chhat" app solar` (clear)

### 4.3 The scoring rubric the AI wrote for itself

Eight factors mapped to the official weights: problem severity with 2026 data (15), originality vs. the ~1,000-team field (15), AI depth in the product (15), demo-ability without keys (15), market and named payer (15), visual/3D storytelling (10), buildability before 1 Nov (10), judge resonance (5). Full scoring in `docs/02-ideation.md`.

### 4.4 Prompts inside the product

**Agent system prompt** (`app/server/claude.ts`):

```
You are Chhat, an independent rooftop-solar advisor for Indian homes. You don't sell panels.

How you work:
- Every rupee figure, kW size, unit count, subsidy or payback you state must come from a tool result in this conversation. Call size_system, compute_subsidy, finance_options, audit_quote, audit_bill or get_irradiance instead of estimating.
- For rules and process questions (subsidy rules, DCR, ALMM, net metering, loans, vendors, GST, timelines, maintenance, wrong bills), call search_knowledge first and cite the source it returns.
- If you need a number the user hasn't given (city, monthly units), ask one short question. If they give a bill amount instead of units, you may estimate units by dividing by the state tariff and say you did.
- Reply in the user's language and script. Hindi in Devanagari if they write Hindi; Hinglish if they write Hinglish; English otherwise. Use gender-neutral Hindi phrasing for yourself.
- Be brief and concrete: 2 to 6 sentences, or a short list. Indian number formatting (₹1,23,456; lakh).
- Mention that figures are estimates when giving money projections, once, briefly.
- When a quote or bill needs a full audit, suggest the Quote Check or Bill Audit page in the app.
```

**Extraction instructions** (structured output with strict JSON schemas):

- Bill: *"This is an Indian electricity (DISCOM) bill. Extract the fields. Use null for anything not printed. Do not guess numbers."*
- Post-solar bill: *"This is an Indian net-metered electricity bill for a home with rooftop solar. Extract import (energy drawn from grid), export (energy injected), any carried-forward credit, and the units actually billed. Use null for anything not printed. Do not guess numbers."*
- Quote: *"This is a rooftop-solar installation quotation from an Indian vendor. Extract the fields. Use null for anything the quote does not state. Map structure: hot-dip galvanized/GI → hdg, ZAM → zam, aluminium → aluminium, painted MS → ms-painted, otherwise unknown."*

**Tool descriptions:** seven strict tool schemas in `app/src/ai/tools.ts` (`get_irradiance`, `size_system`, `compute_subsidy`, `finance_options`, `audit_quote`, `audit_bill`, `search_knowledge`).

---

## 5. How AI works inside the product

| Capability | Live mode (server key set) | On-device mode (no key, offline, or judges' default) |
|---|---|---|
| Ask Chhat | Claude agent loop, up to 8 steps, strict tools, refusal fallback enabled | Intent router + entity extraction + BM25 retrieval over a 22-entry bilingual knowledge base, same tools |
| Read a bill or quote photo / PDF | Claude vision / document input → strict JSON schema | Tesseract.js OCR (LSTM) in the browser, or pdf.js text, then parsing rules |
| Numbers | Always the tested engine, never the model | Same engine |
| Transparency | Tool trace under every answer; mode badge on every page | Same |

Why two modes: judges can open the link with no key and every feature works; homes with poor connectivity still get answers; the model cost per report stays near ₹5.

---

## 6. How we checked the AI's work

- Second pass: 57 unit tests (23 new, including a WCAG contrast check across the whole day and the asset budget), 67 Playwright end-to-end tests on desktop and a Pixel 7 profile, axe-core on every route (0 serious or critical violations), Lighthouse (100 accessibility, best practices and SEO on all four audited routes), and a bundle budget in CI. The tests and the demo recording found eleven real issues, all fixed; the list is in `docs/test-report.md` §3.
- 34 unit tests against hand-checked values (e.g. extraterrestrial irradiance at the equator ≈ 10.4 kWh/m²/day; Delhi solar noon on 21 June ≈ 12:20 IST; subsidy slabs; EMI formula).
- Parser tests on every sample document; agent tests for English, Hindi, Hinglish and multi-turn context.
- The financial model recalculated in LibreOffice: 235 formulas, 0 errors.
- Every page rendered in headless Chromium at desktop and mobile widths; the AI read the screenshots and fixed contrast, overflow, scale and labelling issues.
- Every external number in the product links to its source; conflicts between sources are logged in `docs/01-research.md` §9.
