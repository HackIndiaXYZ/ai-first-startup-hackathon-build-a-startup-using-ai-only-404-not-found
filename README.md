# Chhat · छत

**Solar, without the sales pitch.** The independent AI solar advisor for Indian homes.

Chhat reads your electricity bill, models your roof on 20 years of NASA sunlight, stacks every PM Surya Ghar subsidy, compares cash and loan, audits the installer's quote before you sign, and audits your DISCOM bills after you go solar.

> HackIndia · AI-First Startup Hackathon (Build a Startup Using AI Only), 2026 · Team **404 not found** · Track: AI in any startup (climate) + FinTech

---

## Submission checklist

| Deliverable | Where |
|---|---|
| Working product | `app/` (React + Three.js + GSAP + Lenis, Claude agent + on-device engine) |
| Design rationale | [`docs/05-design.md`](docs/05-design.md): direction, palette, type, motion system, 3D pipeline, CC0 asset credits |
| Test report | [`docs/test-report.md`](docs/test-report.md): unit, end-to-end, accessibility, responsive, fallbacks, budgets |
| Live deployment | See [Deploy](#deploy). One click on Vercel; GitHub Pages workflow included |
| Demo video (4:48) | [`pitch/chhat-demo.mp4`](pitch/chhat-demo.mp4) · script: [`docs/demo-script.md`](docs/demo-script.md) |
| Pitch deck (15 slides) | [`pitch/Chhat-pitch-deck.pdf`](pitch/Chhat-pitch-deck.pdf) · live at `/#/deck` |
| AI usage report | [`docs/ai-usage-report.md`](docs/ai-usage-report.md) · live at `/#/built-with-ai` |
| Business plan | [`business/business-plan.md`](business/business-plan.md) |
| Financial model | [`business/Chhat-financial-model.xlsx`](business/Chhat-financial-model.xlsx) (235 formulas, 0 errors) |
| Research → idea → plan | [`docs/01-research.md`](docs/01-research.md) · [`02-ideation.md`](docs/02-ideation.md) (25 ideas) · [`03-selection.md`](docs/03-selection.md) · [`04-plan.md`](docs/04-plan.md) |

---

## Why this idea

- **The rubric rewards AI-first execution (25%) and AI workflow (10%).** Chhat was built end to end by Claude Code from two written briefs, and the product publishes its own build log.
- **The problem is big, current and verifiable.** ~51 lakh PM Surya Ghar installs by Sep 2026, half the target; CEEW finds only 5% of households willing; MNRE acknowledged wrong post-solar DISCOM bills in Jul 2026; ALMM List-II rules since Jun 2026 make bad quotes forfeit the ₹78,000 subsidy.
- **It works for a stranger in ten seconds.** No login, no key, real NASA data, sample documents.
- **Someone pays.** Installers (₹1,500 per verified lead + 2%), lenders (1%), installer SaaS (₹2,999/month), states (₹40 lakh/year). EBITDA positive in FY29 in the base case.

## What's in the product

| Route | What it does |
|---|---|
| `/` | A preloader that tracks real loading, then one day on a 3D Indian rooftop: the real sun path, a HUD with live roof output and a sun dial, panels dropping at noon, the quote getting stamped, the bill counting down, the city lighting up at night. Then a manifesto, a velocity marquee of 72 cities, stacking tool cards, sourced facts that count up, and the build log |
| `/report` | Roof Report: bill intake (sample, upload, paste or type), live NASA climatology, 3D roof with sun scrubber and live kW meter, NPV-optimal panel count, month-by-month chart, subsidy, loan, 25-year cash flow, CO₂, next steps, share card, print |
| `/quote` | Quote Check: 14-rule audit with grade, fair-price band, findings with sources, negotiation message in English or Hindi |
| `/bill` | Bill Audit: meter arithmetic, findings, DISCOM correction letter, escalation path |
| `/ask` | Ask Chhat: agent in Hindi, Hinglish or English with a visible tool trace and voice input |
| `/built-with-ai` | The AI build log: lifecycle, prompts, architecture, commits from git |
| `/deck` | The pitch deck (arrow keys) |

## How the AI works

```
Browser ─┬─ live mode ──> /api/agent ──> Claude (claude-opus-5-5) ─┐
         └─ on-device ──> intent router + BM25 knowledge base ─────┤
                                                                   ▼
                     7 typed tools: get_irradiance · size_system · compute_subsidy
                     finance_options · audit_quote · audit_bill · search_knowledge
                                                                   ▼
                     Deterministic engine (34 tests): NASA POWER · PV model ·
                     MNRE subsidy rules · net metering · finance · audits
```

- The model never computes a rupee figure itself; both agents call the same tools.
- Documents: Claude structured output (live) or on-device OCR (Tesseract.js) / PDF text (pdf.js) + parsing rules. Every extracted field lands in an editable form.
- The page shows which mode is active. Without `ANTHROPIC_API_KEY` everything still works on-device.

## The engine

- **Sunlight:** NASA POWER 2001-2020 climatology, bundled for 72 cities and fetched live for any lat/lon.
- **PV:** Klein representative days, Erbs monthly diffuse fraction, Liu-Jordan isotropic transposition, temperature derate −0.35%/°C, 14% system losses, 0.5%/yr degradation. Delhi lands at ~1,500 kWh/kWp/yr.
- **Sun position:** NOAA equations, drives the 3D light and the live output meter.
- **Subsidy:** ₹30,000/kW to 2 kW + ₹18,000 for the 3rd kW (cap ₹78,000); special-category ₹33,000/₹19,800 (cap ₹85,800); Delhi, UP and J&K top-ups.
- **Money:** net metering with banked credits (Apr-Mar), 25-year cash flow with O&M and an inverter swap, NPV, IRR, PM Surya Ghar loan with subsidy prepayment.

## Run it

```bash
cd app
npm install
npm run dev          # http://localhost:5173 (on-device mode)
npm test             # 57 unit tests (engine, parsers, agent, design system, asset budget)
npm run build        # static build in app/dist
npm run test:e2e     # Playwright end-to-end suite against the production build
npm run test:all     # typecheck + unit + build + end-to-end
```

Live AI mode locally: `ANTHROPIC_API_KEY=... npm run dev` (the dev server serves `/api/*`).

## Deploy

**Vercel (recommended, enables live AI):**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FHackIndiaXYZ%2Fai-first-startup-hackathon-build-a-startup-using-ai-only-404-not-found&root-directory=app&env=ANTHROPIC_API_KEY&envDescription=Optional.%20Enables%20live%20Claude%20mode%3B%20without%20it%20Chhat%20runs%20on-device.)

Or by hand: import the repo, set **Root Directory = `app`**, add the environment variable `ANTHROPIC_API_KEY`, deploy. `app/vercel.json` runs `npm run build:vercel`, which packages the site and three bundled serverless functions in Vercel's Build Output format. Without the key the deploy still works, fully on-device.

**GitHub Pages (static, on-device mode):** Settings → Pages → Source: GitHub Actions. `.github/workflows/pages.yml` tests, builds and deploys on every push to `main`.

**Netlify (static):** `netlify.toml` is included.

The app uses hash routing, so any static host works without rewrite rules.

**Push to the HackIndia submission repo:**

```bash
git remote add hackindia https://github.com/HackIndiaXYZ/ai-first-startup-hackathon-build-a-startup-using-ai-only-404-not-found.git
git push hackindia HEAD:main
```

Links on the Built-with-AI page point at that repo (`app/src/config.ts`).

## Repository layout

```
app/                 the product (Vite + React + TypeScript)
  src/engine/        PV, solar geometry, subsidy, finance, audits (pure, tested)
  src/ai/            tools, on-device agent, parsers, client
  src/three/         rooftop scene (React Three Fiber): CC0 props, PBR, post-processing, quality tiers
  src/lib/           Lenis + GSAP motion system, story timeline, count-ups
  src/routes/        pages, including the deck
  server/, api/      Claude agent and document extraction (serverless)
  scripts/           NASA fetch, CC0 asset pipeline, build log, deck export, demo recording, Vercel packaging
  public/models/     six CC0 Poly Haven models as meshopt GLBs (+ credits.json)
  tests/             Vitest unit tests
  e2e/               Playwright end-to-end, accessibility, fallback and viewport tests
docs/                research, 25 ideas, selection, plan, design, test report, AI usage report, demo script
business/            business plan, financial model (+ its generator)
pitch/               deck PDF, slide PNGs, demo video
skills/, react-components/   reference material supplied for the build (not part of the product)
```

## Data sources

3D assets: six models and three texture sets from [Poly Haven](https://polyhaven.com), all CC0; list in [`app/public/models/credits.json`](app/public/models/credits.json).

NASA POWER · MNRE / PM Surya Ghar · CEEW (2023) · CEA CO₂ baseline database · DD India, Mercom, Energetica, Down To Earth, TaiyangNews, SolarQuarter and others. Full list with dates in [`docs/01-research.md`](docs/01-research.md).

*Estimates, not financial advice. Sample bills and quotes are fictional.*
