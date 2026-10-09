---
name: validate-idea
description: "Idea validation methodology — problem definition, persona creation, user interviews, competitive analysis, TAM/SAM/SOM sizing, landing page tests, MVP validation, and go/no-go decision frameworks."
triggers:
  - "validate my idea"
  - "idea validation"
  - "market research"
  - "competitive analysis"
  - "competitor analysis"
  - "TAM SAM SOM"
  - "market size"
  - "user interview"
  - "user interviews"
  - "persona"
  - "user persona"
  - "landing page test"
  - "MVP validation"
  - "problem statement"
  - "go-to-market"
  - "customer discovery"
  - "product-market fit"
  - "is this a good idea"
  - "problem worth solving"
  - "target market"
  - "willingness to pay"
  - "concierge MVP"
  - "wizard of oz"
  - "jobs to be done"
  - "JTBD"
---

# Validate Idea

> Phase 1: DESIGN | Sprint 5

Guides founders through rigorous idea validation before writing a single line of code. Every section here is designed to reduce the risk of building something nobody wants. The goal is evidence, not opinions.

## Coverage

- Problem definition framework (single-sentence format with severity scoring)
- Persona template (demographics, JTBD, pain points, budget, channels)
- User interview script (20 questions focused on current workflow, not feature validation)
- Competitive analysis framework (direct/indirect, feature gaps, pricing, review sentiment)
- TAM/SAM/SOM bottom-up calculator with worked example
- Landing page test design (CTA, traffic, conversion thresholds)
- Concierge/Wizard-of-Oz MVP methodology
- Go/no-go success metrics (define before experimenting)

---

## Jobs-to-be-Done (JTBD)

Before defining your problem statement, frame your users' needs through the Jobs-to-be-Done lens. JTBD focuses on what people are trying to accomplish — not what product they want.

### The JTBD interview format

Ask users to complete this sentence about their current workflow:

> "When [situation], I want to [motivation], so I can [outcome]."

This reveals the **job** they're hiring a solution to do. Products don't compete with other products — they compete with every way the customer could get the job done.

### 5 example JTBD statements for a SaaS product

1. **Project management SaaS:** "When I'm juggling multiple client projects, I want to see all deadlines in one view, so I can avoid missing deliverables and losing clients."
2. **Invoice SaaS:** "When a client's payment is overdue, I want to send an automatic reminder without being awkward, so I can get paid without damaging the relationship."
3. **Analytics SaaS:** "When my CEO asks how last month's campaign performed, I want to pull a clear report in under 2 minutes, so I can look competent and keep my budget."
4. **Scheduling SaaS:** "When a prospect wants to book a demo, I want to share my availability without 5 back-and-forth emails, so I can close deals faster."
5. **Support SaaS:** "When a customer reports a bug, I want to see their account context immediately, so I can resolve their issue in one reply instead of three."

### How to use JTBD in validation

- **In interviews:** Ask "Tell me about the last time you [tried to accomplish X]. Walk me through what happened." The story reveals the real job.
- **For positioning:** Your landing page headline should address the job, not the feature. "Get paid faster" (job) beats "Automated invoice reminders" (feature).
- **For prioritization:** Features that serve the core job are must-haves. Features that serve peripheral jobs are should-haves or could-haves.

---

## Lean Canvas

A Lean Canvas is a one-page business model that captures your nine key assumptions on a single page. Fill it in before user interviews with your best guesses, then update it as you gather evidence. The goal is to make every assumption explicit so you can systematically test each one.

### The 9 blocks

<!-- beginner -->
1. **Problem** — The top 3 problems your users face. Be specific enough to test.
2. **Customer Segments** — Your early adopter (most desperate segment, not broadest market).
3. **Unique Value Proposition** — One sentence: why you, why now, why different.
4. **Solution** — The simplest 3 features that solve your top 3 problems.
5. **Channels** — Specific paths to reach your early adopters (subreddits, communities, keywords).
6. **Revenue Streams** — How you charge and what you charge.
7. **Cost Structure** — What it costs to build and run this.
8. **Key Metrics** — The 3-5 numbers that tell you if it's working.
9. **Unfair Advantage** — What you have that can't be easily copied.

Fill this in before your first interview. After every 5 interviews, revisit and update. Assumptions that survive testing become your strategy. Assumptions that fail become pivots.

> Reference: See `references/lean-canvas-template.md` for a copy-paste markdown template with all 9 blocks explained.

<!-- intermediate -->
Fill a Lean Canvas before starting interviews. The canvas forces explicit hypotheses for each block — problem/solution fit, channel assumptions, revenue model, cost structure, key metrics, and unfair advantage. Update the canvas after each validation step (interviews, landing page test, concierge MVP). Blocks where your assumption was wrong become pivot opportunities. Use the template in `references/lean-canvas-template.md`.

<!-- senior -->
Lean Canvas: pre-interview hypothesis capture across 9 blocks. Update iteratively through validation. Template: `references/lean-canvas-template.md`.

---

## Checklist Items

### Problem Definition

<!-- beginner -->
**Define the problem you are solving** — Before you can validate an idea, you need to write the problem down in one clear sentence. Use this format:

> "[Target user] struggles with [specific problem] because [root cause], which costs them [measurable consequence]."

Then score the severity from 1 to 10:
- **8-10**: Hair-on-fire problem — people are actively spending money or significant time trying to solve it today.
- **5-7**: Real annoyance — people complain about it but have workarounds.
- **1-4**: Nice-to-have — most people shrug it off.

If your score is below 7, seriously consider pivoting to a more painful problem. The best businesses solve problems people are desperate to fix.

**How to score honestly**: Ask yourself three questions: (1) Are people already paying for a solution? (2) How often does this problem occur — daily, weekly, monthly? (3) What happens if they do nothing? If the answer to #3 is "nothing much," your severity is probably below 5.
> Time: ~30 min
> P0 — Everything else depends on this

<!-- intermediate -->
**Problem statement** — Single sentence: "[Target user] struggles with [problem] because [root cause], costing them [consequence]." Score severity 1-10. Below 7 = weak signal — look for adjacent problems with higher severity. Validate the score by checking: (1) existing spend on solutions, (2) frequency of occurrence, (3) cost of inaction.
> ~30 min | P0

<!-- senior -->
**Problem statement** — Severity-scored single sentence. Below 7 = pivot signal. Cross-reference against existing market spend and frequency of occurrence.
> P0

---

### Persona Creation

<!-- beginner -->
**Create your target persona** — A persona is a detailed profile of your ideal customer. Not a vague "small business owner" — a specific, named person you can picture. You need one persona to start (you can add more later, but starting with too many means you are not focused enough).

Your persona should include:
- **Demographics**: Age range, job title, company size, income level, location
- **Jobs to Be Done (JTBD)**: What is this person trying to accomplish? (Not "use your product" — the real underlying goal, like "close deals faster" or "stop losing receipts")
- **Current workflow**: How do they solve the problem today? (Spreadsheets? Manual process? Competitor product?)
- **Pain points**: What specifically frustrates them about the current workflow? (Rank each 1-5)
- **Budget**: How much do they currently spend on this problem? What would they pay for a better solution?
- **Channels**: Where do they hang out? (Specific subreddits, Slack communities, Twitter/X accounts they follow, conferences they attend, newsletters they read)

The channels section is critical — this is how you will find people to interview and later how you will market to them.
> Time: ~1 hour
> P0 — You need this before interviews

<!-- intermediate -->
**Target persona** — Build one primary persona with: demographics, JTBD (underlying goal, not product usage), current workflow, pain points (ranked 1-5), budget/willingness-to-pay signal, and discovery channels (specific communities, publications, events). Channels feed directly into your interview recruitment and go-to-market strategy.
> ~1 hour | P0

<!-- senior -->
**Persona** — Demographics, JTBD, current workflow, ranked pain points, budget signal, channels. One primary persona to start — expand after initial interviews confirm or challenge assumptions.
> P0

---

### User Interviews

<!-- beginner -->
**Talk to 5+ potential users** — This is the most important step in validation. Before building anything, have real conversations with people who have the problem. The golden rule: **ask about their life, not your idea** (this is called The Mom Test).

Why? Because if you describe your idea and ask "would you use this?", everyone says yes to be polite. Instead, ask about their current workflow, what frustrates them, what they have already tried, and what they spend money on. Their past behavior is the best predictor of future behavior.

**How to find interviewees**: Use the channels from your persona. Post in relevant communities ("I am researching how [target users] handle [problem] — would anyone be open to a 20-minute call?"). Offer a small incentive ($20 gift card) if needed. LinkedIn cold outreach works for B2B.

**How many**: Start with 5. If you are hearing the same things repeated, you have enough. If every conversation is wildly different, do 5 more — your persona might be too broad.

**What to listen for**:
- Emotional language ("I hate...", "It drives me crazy...", "I wish...")
- Money already spent on the problem
- Frequency — daily pain is worth 10x weekly pain
- Failed attempts to solve it (they tried and gave up = strong signal)
> Time: ~1-2 hours per interview + scheduling
> Reference: See `references/interview-script-template.md`
> P0 — Non-negotiable

<!-- intermediate -->
**User interviews (5+ minimum)** — Focus on current workflow and pain points, not solution validation (The Mom Test). Recruit via persona channels. Listen for: emotional language, existing spend, frequency of pain, failed solution attempts. If responses converge after 5, you have signal. If they diverge, broaden to 10 — your persona may need refinement. Use the structured script with post-interview synthesis.
> ~1-2 hr per interview | `references/interview-script-template.md` | P0

<!-- senior -->
**User interviews** — 5+ conversations, current-workflow focused (Mom Test). Track convergence — divergent responses signal persona issues. Post-interview synthesis with pain severity scoring and willingness-to-pay signals.
> `references/interview-script-template.md` | P0

---

### Competitive Analysis

<!-- beginner -->
**Map out your competition** — "I don't have competitors" is almost never true, and investors will see it as a red flag. Competitors come in three categories:

1. **Direct competitors**: Products that solve the same problem for the same audience (e.g., if you are building a CRM for realtors, other realtor CRMs are direct competitors).
2. **Indirect competitors**: Products that solve a related problem or serve a different audience (e.g., general-purpose CRMs like HubSpot or Salesforce).
3. **Alternative solutions**: Non-product ways people currently solve the problem (e.g., spreadsheets, pen-and-paper, hiring someone, doing nothing).

For each competitor, document: what they do well, what users complain about (read reviews on G2, Capterra, Product Hunt, Reddit, and app store reviews), their pricing, and where the gaps are. The gaps are your opportunity.

Create a 2x2 positioning map to visualize where you fit. Pick two dimensions that matter to your target user (e.g., price vs. ease of use, or features vs. simplicity).
> Time: ~3-4 hours
> Reference: See `references/competitive-analysis-framework.md`
> P1 — Critical for positioning

<!-- intermediate -->
**Competitive analysis** — Map direct, indirect, and alternative competitors. For each: feature comparison (score 0-3), pricing tiers, review sentiment (extract top complaints from G2/Capterra/ProductHunt/Reddit), and identified gaps. Build a 2x2 positioning map on the two dimensions your target user cares about most. Assess competitive moats (network effects, switching costs, data advantages, brand, regulatory).
> ~3-4 hours | `references/competitive-analysis-framework.md` | P1

<!-- senior -->
**Competitive analysis** — Direct/indirect/alternative mapping, feature matrix (0-3), pricing comparison, review sentiment extraction, 2x2 positioning map, moat assessment.
> `references/competitive-analysis-framework.md` | P1

---

### Market Sizing (TAM/SAM/SOM)

<!-- beginner -->
**Calculate your market size** — Investors and partners will ask "how big is this market?" There are three numbers to know:

- **TAM** (Total Addressable Market): If every possible customer on Earth bought your product, how much revenue is that? This is the theoretical maximum — it is never realistic, but it shows the ceiling.
- **SAM** (Serviceable Addressable Market): The portion of TAM you can actually reach with your product, business model, and geography. For example, if your TAM is "all dentists globally" but you only serve US dentists with a SaaS product, your SAM is smaller.
- **SOM** (Serviceable Obtainable Market): The realistic slice you can capture in the first 1-2 years given your resources, team, and competition. This is the number your actual business plan should be built on.

**Always use bottom-up math** — Start from the number of potential customers you can identify, multiply by what they would pay per year. Top-down ("the market is $50 billion and we just need 1%") is a red flag to investors because it has no grounding in reality.

**Sanity checks**: SAM should typically be 1-10% of TAM. SOM in year 1 should be 1-5% of SAM. If your numbers do not pass these checks, re-examine your assumptions.
> Time: ~2-3 hours
> Reference: See `references/tam-sam-som-calculator.md`
> P1 — Required for fundraising, useful for self-funded too

<!-- intermediate -->
**TAM/SAM/SOM sizing** — Bottom-up methodology: identify countable customer segments, multiply by annual contract value. Top-down as a sanity cross-reference only. SAM = TAM filtered by product scope, geography, and business model. SOM = SAM filtered by realistic year-1 capture rate (1-5%). Document all assumptions with sources.
> ~2-3 hours | `references/tam-sam-som-calculator.md` | P1

<!-- senior -->
**Market sizing** — Bottom-up TAM/SAM/SOM with documented assumptions and sources. Sanity-check ratios (SAM 1-10% of TAM, SOM 1-5% of SAM in Y1). Investor-ready slide format.
> `references/tam-sam-som-calculator.md` | P1

---

### Landing Page Test

<!-- beginner -->
**Test demand with a landing page before building** — A landing page test answers the question: "Will strangers pay attention to this?" You are not building the product — you are building a single page that describes the problem you solve and has one call-to-action (CTA).

**How to set it up**:
1. **Page**: Use Carrd ($19/yr), Framer, or Webflow to create a simple page. Headline = problem you solve. Subheading = how you solve it differently. One CTA button.
2. **CTA options** (pick one): "Join the waitlist" (email capture), "Pre-order for $X" (strongest signal — they are entering payment info), or "Get early access" (email capture, weaker than pre-order but easier).
3. **Traffic**: Spend $100-300 on targeted ads (Google Ads for intent-based, Facebook/Instagram for awareness). Alternatively, post in the communities from your persona's channels.
4. **How long**: Run for 1-2 weeks or until you have 500+ unique visitors.

**What "good" looks like**:
- Email signup rate: 5-10% = moderate interest, 10%+ = strong signal
- Pre-order conversion: 2-5% = moderate, 5%+ = strong
- If below 2% on email signups, your messaging, audience targeting, or the problem itself needs work.

**Important**: Define your success threshold BEFORE you run the test. Deciding after you see the numbers leads to rationalization ("well, 1.5% is basically 2%...").
> Time: ~1 week (setup: 2-4 hours, then wait for data)
> P1 — Strongest pre-code validation signal

<!-- intermediate -->
**Landing page test** — Single page (Carrd/Framer/Webflow), one CTA. Options ranked by signal strength: pre-order with payment info > paid deposit > email signup. Drive 500+ uniques via targeted ads ($100-300 budget) or community posts. Define conversion thresholds before launch: email 5-10% moderate / 10%+ strong; pre-order 2-5% moderate / 5%+ strong. Run 1-2 weeks. Pair with heatmap (Hotjar free tier) to see where visitors drop off.
> ~1 week elapsed | P1

<!-- senior -->
**Landing page test** — One CTA, 500+ uniques, pre-defined conversion thresholds. Pre-order > email signup for signal strength. $100-300 ad spend or community distribution. Heatmap for drop-off analysis.
> P1

---

### Concierge / Wizard-of-Oz MVP

<!-- beginner -->
**Deliver the service manually before automating** — A concierge MVP means you deliver the value of your product by hand, to a small number of early users. A Wizard-of-Oz MVP means the user thinks they are interacting with software, but you are actually doing the work behind the scenes.

**Why this works**: It lets you validate that people will pay for the outcome without spending months building software. You learn exactly what users need by doing the work yourself — this makes the eventual product much better.

**Examples**:
- Food delivery app idea? Take orders via text message and deliver them yourself.
- AI-powered financial analysis? Run the analysis manually in a spreadsheet and email results.
- Scheduling tool? Be the scheduler — take requests via email and coordinate calendars yourself.

**How to run it**:
1. Recruit 3-5 users from your interview pool (people who expressed strong pain).
2. Deliver the service manually for 2-4 weeks.
3. Charge something — even a reduced price. Free users behave differently than paying users.
4. Track: time per customer, willingness to pay, feature requests, complaints, and whether they come back for more.

**When to stop**: You have enough data when you can answer: (1) Will people pay for this? (2) What is the core workflow I need to automate? (3) What did I think was important that turned out not to matter?
> Time: 2-4 weeks of manual delivery
> P1 — Validates willingness to pay

<!-- intermediate -->
**Concierge / Wizard-of-Oz MVP** — Deliver value manually to 3-5 users for 2-4 weeks. Charge a reduced price (free users give misleading signals). Track: time-per-customer, retention (do they come back?), feature requests, complaints, willingness-to-pay progression. Concierge = fully transparent manual delivery. Wizard-of-Oz = user-facing interface backed by manual work. Use whichever fits your product model.
> 2-4 weeks | P1

<!-- senior -->
**Concierge / Wizard-of-Oz MVP** — 3-5 paying users, 2-4 weeks, manual delivery. Track unit economics (time/customer), retention, and feature request patterns. Output: core workflow spec and pricing signal.
> P1

---

### Go/No-Go Decision

<!-- beginner -->
**Define your success criteria BEFORE experimenting** — This is the most important section. Human brains are wired to rationalize sunk effort ("I have spent 3 weeks on this, so it must be working"). The antidote: write down your go/no-go criteria before you run any tests, then hold yourself accountable to the numbers.

**Go/no-go scorecard**:

| Criterion | Go threshold | Your result |
|-----------|-------------|-------------|
| Problem severity score | 7+ out of 10 | ___ |
| Interview pain signal | 4+ of 5 interviewees describe active pain | ___ |
| Willingness to pay | 3+ of 5 interviewees would pay or are paying for alternatives | ___ |
| Landing page conversion | Above your pre-set threshold | ___ |
| Concierge MVP retention | 2+ of 3-5 users return for week 2+ | ___ |
| Market size (SOM year 1) | Enough to sustain the business model | ___ |

**Interpreting results**:
- **5-6 criteria met**: Strong go signal. Proceed to product design.
- **3-4 criteria met**: Mixed signal. Investigate which criteria failed. Can you pivot the audience, pricing, or positioning to fix them?
- **0-2 criteria met**: No-go. This is not a failure — you just saved months of building the wrong thing. Return to problem definition with what you learned.

**What "enough market size" means**: For a bootstrapped solo SaaS, SOM of $500K-$1M ARR in year 1-2 may be plenty. For a VC-backed startup targeting Series A, investors typically want a path to $100M+ ARR (which requires a large SAM). Define what "enough" means for YOUR situation.
> Time: ~1 hour to define criteria, ongoing to fill in results
> P0 — Define this before running experiments

<!-- intermediate -->
**Go/no-go criteria** — Define before experiments: problem severity (7+), interview pain convergence (80%+), willingness-to-pay signal (60%+), landing page conversion (above threshold), concierge retention (40%+), market size (SOM supports business model). Score 5-6 = go, 3-4 = pivot opportunity, 0-2 = no-go. Hold yourself to pre-committed thresholds.
> ~1 hour to define | P0

<!-- senior -->
**Go/no-go scorecard** — Pre-committed thresholds across problem severity, interview convergence, WTP, landing page conversion, concierge retention, and SOM. Binary decision framework — 5-6 go, 3-4 investigate, 0-2 no-go.
> P0

---

## Validation Sequence

The recommended order for working through this checklist:

1. **Problem definition** (30 min) — Get clear on what you are solving
2. **Persona creation** (1 hour) — Get specific about who you are solving it for
3. **User interviews** (1-2 weeks) — Talk to real people
4. **Competitive analysis** (3-4 hours) — Understand the landscape
5. **Market sizing** (2-3 hours) — Confirm the opportunity is big enough
6. **Go/no-go criteria** (1 hour) — Define your thresholds before testing
7. **Landing page test** (1-2 weeks) — Test demand with strangers
8. **Concierge MVP** (2-4 weeks) — Test willingness to pay with real delivery

Total elapsed time: 4-8 weeks. Total active work: ~40-60 hours. This is a fraction of the time most founders spend building a product nobody wants.

---

## Companion tools

None — this is the pre-code phase. All work is done with documents, conversations, and simple no-code pages.
