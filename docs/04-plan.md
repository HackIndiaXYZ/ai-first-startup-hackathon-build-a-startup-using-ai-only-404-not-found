# 04 · Plan: Chhat, the independent AI solar advisor

Two passes. Pass 1 is the full engineering and product plan. Pass 2 re-reads Pass 1 from five fresh perspectives and adds what Pass 1 missed.

---

# Pass 1: the full plan

## 1. Product in one paragraph

Chhat (छत, "roof") is an independent AI advisor for Indian homes going solar. It reads your electricity bill, models your roof in 3D with 20 years of NASA sunlight data, sizes the system, stacks central and state subsidies, compares cash vs. loan, then audits the installer's quote before you sign. After installation it audits your DISCOM bills, because MNRE confirmed in July 2026 that wrong post-solar bills are a real problem. Homeowners use it free. Installers, lenders and later DISCOMs pay.

**Positioning line:** Solar, without the sales pitch.

## 2. Users and jobs

| User | Job to be done | Where Chhat helps |
|---|---|---|
| Homeowner, pre-purchase (primary) | "Is solar worth it for my house, and how much should it cost?" | Roof Report, Ask Chhat |
| Homeowner with a quote in hand | "Is this quote fair and will I actually get the subsidy?" | Quote Check |
| Homeowner, post-install | "Why is my bill still high?" | Bill Audit |
| Installer (payer) | "Send me buyers who already trust the numbers" | Verified leads, quote builder (roadmap) |
| Lender (payer) | "Originate safe, small-ticket green loans" | Pre-qualified loan leads |
| Judge (3 minutes) | "Does it work, is the AI real, would anyone pay?" | Landing story → Roof Report → Quote Check → Built-with-AI page |

## 3. Feature scope

### Must ship (the judged path)
1. **Landing page** with a scroll-driven day cycle over a 3D Indian rooftop.
2. **Roof Report**: city (60 bundled cities + geolocation + live NASA POWER), bill (sample / typed / upload with AI read), roof (area, type, shading), money (cash or loan) → results with 3D roof showing the exact panel count, live size slider, monthly generation vs. consumption chart, 25-year cash-flow chart, subsidy breakdown, finance comparison, CO₂, next-steps checklist, shareable link, print-to-PDF.
3. **Quote Check**: sample quotes / paste text / upload → editable parsed fields → graded audit with ₹ overcharge, subsidy-risk flags, negotiation message (English + Hindi), WhatsApp share.
4. **Bill Audit**: sample / typed / upload post-solar bill → findings with ₹ impact → complaint letter + escalation path.
5. **Ask Chhat**: agent chat with visible tool-call trace, Hindi/English, voice input where the browser supports it.
6. **Built with AI** page: lifecycle timeline generated from git history, prompts, agent architecture, AI-share stats.
7. **Pitch deck** at `/deck`, exported to PDF.
8. **Installers & lenders** section with pricing.

### Won't ship (and why)
- User accounts and a database: they add friction for judges and nothing to the rubric.
- Real installer marketplace: needs supply-side partners. Shown as the business model, not faked as live inventory.
- Satellite roof detection: needs paid imagery APIs.

## 4. The engine (deterministic, tested, shared by UI and agent)

All numbers come from this engine. The LLM never computes a rupee figure itself; it calls these functions as tools. That is the core trust design.

| Module | Responsibility | Method / source |
|---|---|---|
| `irradiance` | Monthly GHI and temperature for any lat/lon | NASA POWER climatology API (2001-2020), live with 5 s timeout; fallback to 60 bundled cities fetched from the same API on 9 Oct 2026 |
| `solar-geometry` | Sun position for any city, date, time (3D scene) | NOAA solar position equations |
| `pv` | Monthly plane-of-array irradiance and AC energy | Klein monthly-average day, Erbs monthly diffuse correlation, Liu-Jordan isotropic transposition (Duffie & Beckman), tilt = latitude capped at 30°, ground albedo 0.2; temperature derate −0.35%/°C with cell temp = ambient + 25 °C; system losses 14%; shading factor; 0.5%/yr degradation |
| `sizing` | Recommended kW and panel count | min(consumption-matched kW, roof capacity at ~100 sq ft/kW of shadow-free area × 0.7 usable, sanctioned load); 545 Wp DCR modules (MNRE minimum is 500 Wp) |
| `subsidy` | Central + state + special-category | ₹30,000/kW up to 2 kW, ₹18,000 for the 3rd kW, cap ₹78,000; special-category states ₹33,000 / ₹19,800, cap ₹85,800; state top-ups (Delhi ₹10,000/kW to ₹30,000; UP ₹15,000/kW to ₹30,000; J&K ₹3,000/kW to ₹9,000) |
| `tariff` | Effective energy rate | Read from the user's bill (energy charges ÷ units); state defaults as editable fallbacks |
| `savings` | Month-by-month bill impact under net metering | Seasonal consumption profile by climate zone, scaled to the bill month; monthly netting with banked credits; year-end surplus at state feed-in rate |
| `finance` | Cash vs. loan, payback, NPV, IRR | EMI formula; repo-linked 5.75% default (editable); 10% margin money; ₹2 lakh concessional cap ≤3 kW; tariff escalation 3%/yr; inverter replacement in year 12; O&M after year 5 |
| `carbon` | CO₂ avoided | CEA weighted-average grid factor 0.727 tCO₂/MWh |
| `quoteAudit` | Grade a vendor quote | 14 rules: price band per kW by size, DCR + ALMM List-II cells (since 1 Jun 2026), panel count × wattage vs. claimed kW, DC:AC ratio 0.9 to 1.3, module ≥500 Wp and ≥10-yr product warranty, 5-yr system warranty + O&M (REC vendor framework), IS 4759 galvanized / approved structure materials, earthing + lightning arrester, net-meter fees, advance payment ≤30%, GST at ~8.9% effective since 22 Sep 2025 (70:30 rule), monitoring, grievance officer named |
| `billAudit` | Check a post-solar DISCOM bill | Export = 0 with a live system (net meter not active), net units ≠ import − export − credit, billed on import, unexplained "other charges", generation far below expected, missing banked credit; complaint letter + escalation (DISCOM → CGRF → Ombudsman → PM Surya Ghar grievance) |

Unit tests (Vitest) cover every module with hand-checked values.

## 5. The AI layer

| Capability | Live mode (server + Claude) | On-device mode (always available) |
|---|---|---|
| Read a bill photo/PDF | Claude vision → strict JSON schema | Tesseract.js OCR in the browser → field extraction rules |
| Read a quote | Claude → strict JSON schema | Same OCR + rules; or paste text |
| Ask Chhat | Claude with 7 tools, agent loop server-side, trace returned | Intent router + entity extraction + BM25 over a ~20-entry knowledge base, same tools, same trace UI |
| Language | Replies in the user's language (Hindi / Hinglish / English) | Hindi templates for top intents |

The UI shows which mode is active. The product never presents a rules-based answer as model output.

Server functions (`/api/health`, `/api/extract`, `/api/agent`) are Vercel-format serverless handlers that import the same engine code. The API key lives only in server env vars.

## 6. Architecture

```
chhat/
├─ app/                      Vite + React + TypeScript
│  ├─ src/
│  │  ├─ engine/             pure TS, no DOM, unit-tested
│  │  ├─ ai/                 client: mode detection, extract, agent (live + local)
│  │  ├─ three/              R3F scene: rooftop, panels, sun, sky, city, kites
│  │  ├─ routes/             Landing, Report, Quote, Bill, Ask, BuiltWithAI, Deck
│  │  ├─ components/         UI kit adapted from shadcn/ui (Radix) to our tokens
│  │  ├─ data/               cities.json (NASA), states, samples, KB, buildlog.json
│  │  └─ styles/             tokens.css, base.css
│  ├─ api/                   serverless: health, extract, agent
│  ├─ scripts/               fetch-nasa.mjs, build-log.mjs, export-deck.mjs, record-demo.mjs
│  └─ tests/                 vitest + playwright smoke
├─ docs/                     research → ideation → selection → plan → AI report → demo script
├─ business/                 business plan, financial model (.xlsx)
└─ pitch/                    deck PDF
```

Routing: HashRouter, so the build runs on any static host (GitHub Pages, Vercel, Netlify, artifact preview) without rewrite rules.

## 7. Design direction

**Design read:** consumer climate-fintech product for Indian homeowners and four hackathon judges, with a warm, precise, instrument-like language, leaning toward custom CSS tokens + R3F + GSAP ScrollTrigger + Lenis.

| Decision | Choice | Why |
|---|---|---|
| Concept | A day on an Indian chhat, dawn to night, told by scroll | The product is the roof; the sun is the money |
| Unforgettable element | Scroll scrubs real sun position over a 3D rooftop; panels assemble at noon; the bill counts down at dusk | Concept and product are the same object |
| Palette | Night ink `oklch(0.18 0.03 258)`, limewash `oklch(0.965 0.01 235)`, neel (Jodhpur blue) `oklch(0.56 0.13 255)`, haldi (marigold) accent `oklch(0.83 0.165 78)`, sindoor for warnings `oklch(0.62 0.2 30)` | Indian rooftop colors without kitsch; avoids AI-purple and the banned cream/brass palette |
| Type | Archivo variable (width axis: expanded for numbers, normal for text), Geist Mono for data, Tiro Devanagari Hindi for Hindi moments | Distinctive, engineered, has Devanagari partner; avoids Inter / Space Grotesk / Fraunces |
| Motion lens | Polish on the landing (choreographed scrub), restraint in tools (≤200 ms state changes) | Persuade vs. Operate modes |
| Layout | Asymmetric 12-col grid, left-weighted hero, varied section rhythm, one horizontal scroll moment | Avoids template rhythm |
| Icons | Phosphor, 1.5 stroke | One family |
| 3D | Procedural geometry only (no multi-MB downloads): RCC roof, parapet, mumty (stair room), black ribbed water tank, clothesline, tulsi pot, elevated GI panel structure, instanced neighbouring roofs in limewash tones, kites | Fast, licence-free, culturally specific |
| Accessibility | WCAG AA contrast, focus rings, keyboard flows, `prefers-reduced-motion` disables Lenis and scrubbing, WebGL fallback poster | Judges may test on anything |

## 8. Roadblocks and mitigations

| # | Roadblock | Mitigation |
|---|---|---|
| 1 | WebGL unavailable or slow GPU | Detect; static poster image; calculators unaffected; dpr cap 1.75; shadows off on low-end |
| 2 | NASA API slow/down/blocked by CSP | 5 s timeout → bundled data for 60 cities; nearest-city fallback for geolocation |
| 3 | No API key on the judge-facing deploy | On-device mode is complete; live mode is a bonus |
| 4 | Bundle weight (three + gsap + tesseract) | Route-level code splitting; tesseract loaded only on upload; 3D scene lazy-mounted |
| 5 | Lenis + ScrollTrigger + route changes | Single Lenis instance driving ScrollTrigger.update; kill triggers on unmount; scroll to top on navigation |
| 6 | OCR accuracy on photos | Always show parsed fields as an editable form (human in the loop) |
| 7 | Data disputes (tariffs, top-ups) | Cite sources in-app; every assumption editable |
| 8 | Impersonation risk in samples | Sample bills/quotes use fictional companies and carry a SAMPLE mark |
| 9 | No direct deploy credentials in this environment | Publish a live preview immediately; ship Vercel/Netlify/GitHub Pages configs for one-click deploy |
| 10 | Legal (advice) | "Estimates, not financial advice" on results and letters |

## 9. Build order

1. Scaffold, tokens, fonts, routing, layout shell.
2. Engine + tests (the product's truth).
3. NASA data fetch script → bundled cities.
4. 3D scene (reused by landing and report).
5. Roof Report.
6. Quote Check, Bill Audit (shared upload/extract UI).
7. Ask Chhat (local agent first, then live).
8. Landing page story.
9. Built-with-AI page + build-log script.
10. Deck + PDF export.
11. Verification pass (desktop + mobile screenshots, a11y, perf), fix batch, one confirm pass.
12. Business plan, financial model, AI usage report, demo video.

---

# Pass 2: fresh perspectives

We re-read Pass 1 as five different people and wrote down what each would change.

### As a judge with three minutes
- **Problem:** the landing story takes six scroll steps before the tool. A judge might never reach it.
- **Change:** put a "Try it on a sample house" button in the first viewport that opens a fully computed Roof Report in one click. Add a persistent "Check a quote" link in the nav.
- **Change:** the first viewport shows one specific, true number (Delhi: a 3 kW system makes ~4,500 units a year), computed live, with its source on hover.

### As a homeowner in Lucknow on a ₹12,000 Android phone
- **Problem:** 3D and long forms on a small screen.
- **Change:** the report flow becomes a single scrolling form with smart defaults (city → everything else pre-filled) so one tap gives a result. Bottom-sheet style results on mobile.
- **Change:** Hindi labels on the key result tiles (बचत, सब्सिडी) as secondary text, and the agent answers in Hindi when asked in Hindi.

### As an installer (the payer)
- **Problem:** "Independent auditor" sounds like it will hurt my sales.
- **Change:** frame installer value as "pre-qualified buyers who already trust the numbers, and fewer cancellations". Add "Chhat Verified" quote badge to the B2B section: installers whose quotes pass the audit get ranked higher.

### As a VC
- **Problem:** what's the moat if anyone can copy a calculator?
- **Change:** make the data flywheel explicit: every audited quote builds a city-level price index; every audited bill builds a DISCOM error map. Show it on the landing as "What Chhat learns" and in the deck.
- **Change:** add the post-subsidy story (C&I rooftops, batteries, EV) in the deck's roadmap slide.

### As an awwwards designer
- **Problem:** a day-cycle scroll is good, but the details make it memorable.
- **Changes:**
  - A small IST clock in the corner that ticks with the scroll (06:10 → 21:00).
  - Kites drifting over the neighbouring roofs (Uttarayan sky).
  - Panels drop onto the elevated structure with a stagger at "noon".
  - A subtle film-grain overlay and a sky shader that moves from dawn pink to noon white to dusk saffron to night blue.
  - The roof report's size slider adds and removes panels in 3D in real time.
  - A shareable "roof card" image (canvas render of your roof + your numbers) for WhatsApp, which is also our growth loop.

### Additions accepted into scope
1. One-click sample house in the first viewport.
2. Live, sourced number in the hero.
3. Single-scroll report form with smart defaults; mobile bottom-sheet results.
4. Hindi secondary labels and Hindi agent replies.
5. "Chhat Verified" installer framing.
6. Data-flywheel section ("What Chhat learns").
7. IST clock, kites, sky shader, panel drop, grain.
8. Shareable roof card (PNG) as growth loop.
9. Voice input (Web Speech API, hi-IN / en-IN) where supported.

### Additions rejected
- Neighbourhood leaderboard: needs a database and real users.
- AR roof view: big effort, small judge payoff.
