---
name: growth-ops
description: "Post-launch growth — analytics instrumentation, event taxonomy, funnel tracking, A/B testing, session replay, feedback loops, retention analysis, cost optimization, email lifecycle campaigns, referral programs, content strategy, and paid acquisition."
triggers:
  - "analytics"
  - "growth"
  - "retention"
  - "churn"
  - "funnel"
  - "A/B test"
  - "experiment"
  - "NPS"
  - "feedback"
  - "referral"
  - "email campaign"
  - "content strategy"
  - "acquisition"
  - "activation"
  - "onboarding metrics"
  - "cohort"
  - "DAU"
  - "MAU"
  - "MRR"
  - "CAC"
  - "LTV"
  - "cost optimization"
  - "event tracking"
  - "Amplitude"
  - "Mixpanel"
  - "PostHog"
  - "GrowthBook"
  - "Statsig"
  - "session replay"
  - "web vitals"
  - "privacy analytics"
  - "cookie-free analytics"
  - "Umami"
  - "Plausible"
  - "revenue analytics"
  - "NRR"
  - "net revenue retention"
  - "unit economics"
  - "payback period"
  - "ARPU"
  - "referral program"
  - "lifecycle email"
  - "re-engagement"
  - "win-back"
  - "viral coefficient"
  - "SEO content"
  - "funnel audit"
  - "conversion audit"
  - "friction audit"
  - "where are users dropping off"
  - "conversion analysis"
  - "paywall strategy"
---

# Growth Ops

You handle everything needed to grow a launched product: analytics instrumentation, experimentation, user feedback, retention optimization, cost management, lifecycle email campaigns, referral programs, and content-driven acquisition. This skill consolidates analytics, post-launch operations, and growth marketing into a single workflow (G12 consolidation).

## When this skill triggers

This skill activates when a developer is setting up analytics or event tracking, building funnels, running A/B tests, implementing feedback collection, analyzing retention cohorts, optimizing cloud costs, creating email campaigns, designing referral programs, or planning content strategy for organic growth.

---

## Analytics Platform Selection

Reference: `references/event-taxonomy-template.md` | `references/privacy-first-analytics-setup.md`

Choose one analytics platform and commit to it. For privacy-first, cookie-free options (no consent banner needed), see the privacy-first analytics setup guide. Splitting events across multiple tools creates data silos and inconsistent numbers.

### Platform comparison

| Platform | Best for | Pricing | Self-host |
|----------|----------|---------|-----------|
| PostHog | Full-stack (analytics + replay + flags + experiments) | Free to 1M events/mo | Yes |
| Amplitude | Product analytics at scale, behavioral cohorts | Free to 10M events/mo | No |
| Mixpanel | Funnel analysis, event-driven products | Free to 20M events/mo | No |
| Umami | Privacy-first web analytics (GDPR, no cookies) | Free (self-hosted) | Yes |

### Decision framework

```
Which analytics platform?
├── Need session replay + feature flags + analytics in one tool?
│   → PostHog (best all-in-one, generous free tier)
├── Need deep behavioral analytics at scale?
│   → Amplitude (strongest cohort analysis)
├── Need simple funnel + event tracking?
│   → Mixpanel (easiest setup)
├── Need privacy-first, cookie-free analytics?
│   → Umami (GDPR-safe, self-hosted)
└── Not sure / early-stage?
    → PostHog (covers the most ground, switch later if needed)
```

<!-- beginner -->
**Choose an analytics platform** — You need to understand how people use your app. Without analytics, every product decision is a guess. Pick ONE platform: PostHog is the best starting point because it is free up to 1M events per month and includes analytics, session replay, feature flags, and A/B testing in one tool. Install it, track your key events (signup, activation, payment), and check the dashboard weekly. You can always switch later.
> Time: ~30 min to set up
> Reference: See `references/event-taxonomy-template.md`

<!-- intermediate -->
**Analytics platform** — PostHog (all-in-one: analytics + replay + flags + experiments), Amplitude (deep behavioral cohorts), Mixpanel (funnel-focused), or Umami (privacy-first). Pick one as source of truth. Instrument with noun_verb event taxonomy. Configure funnels, retention tables, and web vitals tracking.
> ~30 min | `references/event-taxonomy-template.md`

<!-- senior -->
**Analytics** — Single platform (PostHog/Amplitude/Mixpanel). noun_verb taxonomy, funnel + retention + vitals instrumented. Self-host if data residency required.
> `references/event-taxonomy-template.md`

---

## Event Taxonomy

Reference: `references/event-taxonomy-template.md`

Every event follows the `noun_verb` naming convention with a consistent property schema. A messy event taxonomy becomes unusable within weeks.

### Naming rules

```
Format: <object>_<action> (snake_case)

Good:                       Bad:
user_signed_up              signUp
item_purchased              purchase completed
page_viewed                 PageView
subscription_upgraded       upgraded-sub
experiment_assigned         ab_test_variant
```

### Property schema

Every event carries a standard set of properties plus event-specific properties:

```
Standard properties (auto-attached by SDK):
├── user_id         — authenticated user identifier
├── anonymous_id    — pre-auth identifier (linked on signup)
├── session_id      — current session
├── timestamp       — ISO 8601
├── platform        — web | ios | android
├── app_version     — current release version
└── environment     — production | staging

Event-specific properties (defined per event):
├── page_viewed     → { url, referrer, title }
├── user_signed_up  → { method: "email"|"google"|"github", referral_code? }
├── item_purchased  → { item_id, price_cents, currency, quantity }
└── experiment_assigned → { experiment_id, variant, source }
```

<!-- beginner -->
**Define your event taxonomy** — Before you track anything, decide on naming conventions. Use `noun_verb` format: `user_signed_up`, `item_purchased`, `page_viewed`. Never mix formats (no `signUp` alongside `user_signed_up`). Every event should carry standard properties (user_id, timestamp, platform) plus event-specific properties. Start with the 20 essential events listed in `references/event-taxonomy-template.md` and add more as your product grows.
> Time: ~1 hour to define, saves weeks of cleanup later
> Template: See `references/event-taxonomy-template.md`

<!-- intermediate -->
**Event taxonomy** — noun_verb naming (snake_case), standard property schema (user_id, anonymous_id, session_id, timestamp, platform, app_version, environment), event-specific properties documented per event. Start with the 20 essential SaaS events. Track event catalog in a shared spreadsheet or Notion page.
> ~1 hour | `references/event-taxonomy-template.md`

<!-- senior -->
**Event taxonomy** — noun_verb convention, standard + event-specific properties, 20 essential events instrumented. Catalog in version-controlled schema file.
> `references/event-taxonomy-template.md`

---

## Funnel Instrumentation

Reference: `references/funnel-instrumentation.md`

The standard SaaS funnel tracks the journey from first visit to paying, referring customer. Instrument every stage so you can identify where users drop off.

### Standard SaaS funnel

```
Visit → Signup → Activate → Engage → Pay → Refer
  │        │         │          │       │       │
  │        │         │          │       │       └─ referral_sent
  │        │         │          │       └─ subscription_started
  │        │         │          └─ feature_used (core action repeated)
  │        │         └─ activation_completed (first core action)
  │        └─ user_signed_up
  └─ page_viewed (landing page)
```

### Conversion benchmarks (SaaS median)

| Stage | Metric | Median | Good | Great |
|-------|--------|--------|------|-------|
| Visit → Signup | Landing page conversion | 2-5% | 5-8% | 8%+ |
| Signup → Activate | Activation rate | 20-40% | 40-60% | 60%+ |
| Activate → Engage | Week-1 retention | 15-25% | 25-40% | 40%+ |
| Engage → Pay | Free-to-paid conversion | 2-5% | 5-10% | 10%+ |
| Pay → Refer | Referral rate | 2-5% | 5-15% | 15%+ |

<!-- beginner -->
**Instrument your funnel** — A funnel tracks how users move through your product: visit your site, sign up, do the core action (activation), keep using it (engagement), pay, and refer others. You need to track each step so you can see where people drop off. If 1000 people visit but only 10 sign up, your landing page needs work. If 100 sign up but only 5 activate, your onboarding needs work. Install the tracking code from `references/funnel-instrumentation.md` and check your funnel weekly.
> Time: ~1-2 hours
> Template: See `references/funnel-instrumentation.md`

<!-- intermediate -->
**Funnel instrumentation** — Track visit → signup → activate → engage → pay → refer. Define activation event (first meaningful action). Instrument each stage with timestamped events. Build funnel visualization in your analytics tool. Compare against SaaS benchmarks. Review weekly, optimize the biggest drop-off first.
> ~1-2 hours | `references/funnel-instrumentation.md`

<!-- senior -->
**Funnel** — Standard 6-stage funnel instrumented. Activation event defined. Conversion rates benchmarked. Weekly review cadence. Focus optimization on largest drop-off.
> `references/funnel-instrumentation.md`

---

## Web Vitals Tracking

Core Web Vitals directly affect SEO ranking and user experience. Track them in production, not just in Lighthouse audits.

### Performance budgets

| Metric | Good | Needs work | Poor |
|--------|------|------------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5-4s | > 4s |
| INP (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |
| TTFB (Time to First Byte) | < 800ms | 800-1800ms | > 1800ms |

### Implementation

```ts
// Install: npm install web-vitals
import { onLCP, onINP, onCLS, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // [CUSTOMIZE] Replace with your analytics call
  posthog.capture('web_vital_recorded', {
    name: metric.name,       // LCP | INP | CLS | TTFB
    value: metric.value,
    rating: metric.rating,   // good | needs-improvement | poor
    navigationType: metric.navigationType,
  });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onTTFB(sendToAnalytics);
```

<!-- beginner -->
**Track web vitals in production** — Google uses Core Web Vitals (how fast your page loads, how quickly it responds to clicks, and whether the layout jumps around) to rank your site in search results. Install the `web-vitals` npm package and send the numbers to your analytics tool. Check them weekly. If LCP (load time) is over 2.5 seconds, your page is loading too slowly. If CLS (layout shift) is over 0.1, elements are jumping around during load.
> Time: ~15 min to install
> Uses: `web-vitals` npm package

<!-- intermediate -->
**Web vitals** — Install `web-vitals`, send LCP/INP/CLS/TTFB to analytics as events. Set performance budgets (LCP < 2.5s, INP < 200ms, CLS < 0.1). Alert on regressions. Track by page and device type.
> ~15 min

<!-- senior -->
**Web vitals** — `web-vitals` → analytics pipeline. Performance budgets enforced in CI. Production RUM tracked by page/device. Alert on p75 regressions.

---

## Conversion Funnel Audit

Reference: `references/conversion-funnel-audit.md`

This is the analysis counterpart to funnel instrumentation. Instrumentation adds tracking events; this doc teaches you how to look at your existing flows, score friction, and find where users are leaving.

<!-- beginner -->
**Find where users give up** — Open your product in incognito and try to go from landing page to getting real value. Can you do it in under 60 seconds without signing up? If not, that's your biggest conversion problem. The funnel audit framework walks you through 5 standard SaaS paths (visitor→value, value→signup, free→paid, user→sharer, referral→signup) and scores each step.
> Time: ~1 hour for all 5 funnels
> Reference: See `references/conversion-funnel-audit.md`

<!-- intermediate -->
**Conversion funnel audit** — Map 5 standard SaaS funnels, score each step across 4 dimensions (clarity, confidence, effort, reward), identify weakest steps, and prioritize fixes by impact. Includes per-funnel common friction points, missing persuasion checklists, and copy-paste audit template.
> ~1 hour | `references/conversion-funnel-audit.md`

<!-- senior -->
**Funnel audit** — 5-funnel friction scoring (clarity × confidence × effort × reward). Per-funnel audit guides with common friction points. Prioritization: fix lowest-scoring step in highest-traffic funnel first.
> `references/conversion-funnel-audit.md`

---

## A/B Testing & Experimentation

Reference: `references/ab-testing-setup.md`

Never ship a major change without measuring its impact. A/B testing lets you compare variants with statistical confidence.

### Platform selection

| Platform | Best for | Pricing |
|----------|----------|---------|
| GrowthBook | Open-source, self-hosted, Bayesian stats | Free (self-hosted) |
| Statsig | Feature flags + experiments + metrics | Free to 1M events |
| PostHog | Integrated with analytics (if already using) | Included in free tier |

### Experiment design checklist

```
Before running an experiment:
├── 1. Define hypothesis: "Changing X will improve Y by Z%"
├── 2. Choose primary metric (one metric, not five)
├── 3. Calculate sample size (minimum detectable effect + 95% confidence)
├── 4. Estimate run time (daily traffic ÷ sample size needed)
├── 5. Set guardrail metrics (metrics that must NOT degrade)
├── 6. Document in experiment log
└── 7. Ship to ≤ 50% of traffic initially
```

<!-- beginner -->
**Set up A/B testing** — A/B testing shows different versions of your product to different users and measures which version performs better. You need this before making big changes to your signup flow, pricing page, or onboarding. GrowthBook is free and open-source. The process: define what you want to improve (hypothesis), build two versions (control and variant), split traffic 50/50, wait until you have enough data (statistical significance), then ship the winner. See `references/ab-testing-setup.md` for setup code and a sample size calculator.
> Time: ~1-2 hours for first experiment
> Template: See `references/ab-testing-setup.md`

<!-- intermediate -->
**A/B testing (GrowthBook/Statsig/PostHog)** — Define hypothesis, primary metric, sample size (MDE + 95% CI), guardrail metrics. Feature flag wraps variant. Run to statistical significance (typically 2-4 weeks). Document in experiment log. Use Bayesian or frequentist stats depending on platform.
> ~1-2 hours first setup | `references/ab-testing-setup.md`

<!-- senior -->
**Experimentation** — GrowthBook/Statsig/PostHog. Hypothesis-driven, sample-size-calculated, guardrail-gated experiments. Feature-flag delivery. Bayesian evaluation preferred. Experiment log maintained.
> `references/ab-testing-setup.md`

---

## Session Replay

Session replay records real user sessions so you can watch exactly where users get confused, rage-click, or drop off. Critical for diagnosing UX issues that analytics alone cannot explain.

### Platform options

| Platform | Pricing | PII handling |
|----------|---------|--------------|
| PostHog | Included (if using PostHog) | Auto-mask inputs |
| FullStory | Free tier (1K sessions/mo) | PII exclusion rules |
| Hotjar | Free tier (35 sessions/day) | Suppress sensitive data |

### PII redaction requirements

```
MUST redact before recording:
├── Password fields → auto-masked by all tools
├── Credit card numbers → exclude payment forms entirely
├── SSN / government IDs → exclude by CSS selector
├── Health information → exclude by CSS selector
├── Email in plain text → mask with data attribute
└── Any field with sensitive data → add data-ph-no-capture
                                   or data-fs-exclude
                                   or data-hj-suppress
```

<!-- beginner -->
**Set up session replay** — Session replay lets you watch recordings of real users using your app. When someone reports a bug or you see a funnel drop-off, you can watch exactly what happened. PostHog includes this for free. Important: you must redact sensitive data (passwords, credit cards, personal info) before recording. Add `data-ph-no-capture` to any HTML element containing sensitive data.
> Time: ~15 min to enable, ~30 min to configure PII redaction

<!-- intermediate -->
**Session replay** — Enable PostHog/FullStory/Hotjar session recording. Configure PII redaction (mask inputs, exclude payment forms, suppress sensitive selectors). Use recordings to diagnose funnel drop-offs and UX friction. Tag sessions with user properties for filtering.
> ~30 min

<!-- senior -->
**Session replay** — PostHog/FullStory, PII redaction configured (input masking, selector exclusion), sessions tagged with user/experiment properties. Review linked to funnel drop-off analysis.

---

## Feedback Loops

Reference: `references/feedback-loop-design.md`

Structured feedback collection at the right moments gives you qualitative data to complement your quantitative analytics.

### Feedback touchpoints

| Touchpoint | Timing | Method | Goal |
|------------|--------|--------|------|
| In-app widget | Always available | Feedback button / form | Capture bugs and feature requests |
| NPS survey | Day 7, Day 30, Day 90 | In-app modal | Measure satisfaction trend |
| CSAT survey | After support interaction | Email or in-app | Measure support quality |
| Power user interview | Monthly | 30-min video call | Deep qualitative insights |
| Churn survey | On cancellation | Cancel flow modal | Understand why users leave |

### NPS calculation

```
NPS = % Promoters (9-10) - % Detractors (0-6)
Range: -100 to +100
Good: > 30 | Great: > 50 | World-class: > 70
```

<!-- beginner -->
**Set up feedback collection** — Analytics tell you what users do; feedback tells you why. Add three things: (1) an always-visible feedback button in your app (a small widget in the bottom-right corner), (2) an NPS survey on day 7 after signup (ask "How likely are you to recommend us?" on a 0-10 scale), and (3) a churn survey when someone cancels (ask "What made you cancel?" with multiple-choice options). See `references/feedback-loop-design.md` for component code and survey templates.
> Time: ~1-2 hours
> Template: See `references/feedback-loop-design.md`

<!-- intermediate -->
**Feedback loops** — In-app widget (always visible), NPS (day 7/30/90), CSAT (post-support), churn survey (cancel flow), power user interviews (monthly). Route to triage board. Track NPS trend over time. Tag feedback with user segment for pattern detection.
> ~1-2 hours | `references/feedback-loop-design.md`

<!-- senior -->
**Feedback** — Widget + NPS (day 7/30/90) + CSAT + churn survey + monthly power user interviews. Routed to triage. NPS trended. Segmented analysis.
> `references/feedback-loop-design.md`

---

## Activation Rate Analysis

Activation is the moment a user first experiences your product's core value. Improving activation rate is usually the highest-leverage growth lever.

### Defining activation

```
Activation = first time a user completes your core action

Examples:
├── Project management tool → created first project + added a task
├── Email tool → sent first campaign
├── Analytics tool → installed SDK + received first event
├── Social app → followed 5 users
├── E-commerce → added first item to cart
└── Developer tool → completed first API call
```

### Drop-off analysis methodology

```
1. Define activation event
2. Measure time-to-activate for all signups (median, p75, p90)
3. Identify where non-activated users drop off (which step?)
4. Segment: drop-off by signup method, device, referral source
5. Prioritize: fix the step with the largest absolute drop-off
6. Iterate: change one thing, measure for 2 weeks, repeat
```

<!-- beginner -->
**Analyze and improve activation rate** — Activation rate is the percentage of signups who do your core action for the first time. If your activation rate is below 40%, focus all your energy here before spending money on acquisition. Use your funnel data to find which step loses the most users. Then make that step easier: add a tutorial, reduce the number of fields, pre-fill defaults, or send a helpful email. Change one thing at a time and measure for two weeks.
> Time: ~2-4 hours of analysis, then ongoing iteration

<!-- intermediate -->
**Activation analysis** — Define activation event (first core action). Measure time-to-activate (median/p75/p90). Identify drop-off step. Segment by signup method, device, source. Fix largest absolute drop-off first. Iterate: one change per 2-week cycle. Target: 40%+ activation rate.
> ~2-4 hours analysis + ongoing

<!-- senior -->
**Activation** — Defined activation event, time-to-activate measured, drop-off step identified, segmented analysis, iterative optimization on 2-week cycles. Target 40%+.

---

## Bug Triage Cadence

Shipped product means incoming bugs. A clear triage cadence prevents both user frustration and engineering burnout.

### Severity-based response times

| Severity | Definition | Response time | Resolution target |
|----------|-----------|---------------|-------------------|
| P0 | Users cannot use core feature, data loss | Same day | Same day |
| P1 | Major feature broken, workaround exists | 48 hours | 1 week |
| P2 | Minor bug, cosmetic, edge case | Next sprint | 2 weeks |

### Triage process

```
Daily (15 min):
├── Review new bug reports (support inbox, Sentry, in-app feedback)
├── Classify severity (P0/P1/P2)
├── Assign owner for P0/P1
└── Add P2 to backlog

Weekly:
├── Review P2 backlog, batch into sprint
├── Update public changelog with fixes
└── Close stale bugs (no repro after 30 days)
```

<!-- beginner -->
**Set up a bug triage process** — As users find bugs, you need a system to prioritize them. P0 bugs (users blocked or losing data) get fixed the same day. P1 bugs (feature broken but workaround exists) get fixed within 48 hours. P2 bugs (cosmetic or edge case) go into your backlog for the next sprint. Spend 15 minutes each morning reviewing new bug reports from support, Sentry, and feedback. Update your changelog when you ship fixes so users know you are listening.
> Time: ~15 min/day

<!-- intermediate -->
**Bug triage cadence** — Daily 15-min triage (Sentry + support + feedback → classify P0/P1/P2 → assign). P0 same-day fix, P1 48h, P2 next sprint. Weekly backlog review, public changelog. Close stale bugs after 30 days no-repro.
> ~15 min/day

<!-- senior -->
**Bug triage** — Daily triage (P0 same-day, P1 48h, P2 sprint). Weekly backlog prune + changelog. Stale policy: 30 days.

---

## Retention Cohort Tracking

Reference: `references/retention-analysis-guide.md`

Retention is the most important metric for sustainable growth. If users leave faster than you acquire them, no amount of marketing will save you.

### Key retention metrics

| Metric | Definition | SaaS benchmark (B2B) | SaaS benchmark (B2C) |
|--------|-----------|----------------------|----------------------|
| D1 retention | % active day after signup | 40-60% | 25-40% |
| D7 retention | % active 7 days after signup | 25-40% | 15-25% |
| D30 retention | % active 30 days after signup | 15-25% | 8-15% |
| Net revenue retention | Revenue from existing customers (expansion - churn) | 100-120% | 80-100% |
| Logo churn | % of customers lost per month | 2-5% | 5-10% |

### Retention curve analysis

```
Healthy retention curve:
  100% ─┐
        │╲
   80%  │  ╲
        │    ╲
   60%  │      ╲_______________  ← Flattens = you have retention
        │
   40%  │
        │
   20%  │
        │
    0%  └──────────────────────
        D0  D7  D14  D30  D60

Unhealthy retention curve:
  100% ─┐
        │╲
   80%  │  ╲
        │    ╲
   60%  │      ╲
        │        ╲
   40%  │          ╲
        │            ╲
   20%  │              ╲       ← Never flattens = leaky bucket
        │                ╲
    0%  └──────────────────────
        D0  D7  D14  D30  D60
```

<!-- beginner -->
**Track retention cohorts** — A retention cohort groups users by when they signed up and tracks how many come back over time. If you signed up 100 users last Monday and 25 are still active this Monday, your D7 retention is 25%. Compare cohorts week over week. If D7 retention is improving, your product changes are working. If it is declining, something broke. See `references/retention-analysis-guide.md` for SQL queries you can copy-paste to build retention tables from your database.
> Time: ~1-2 hours to set up, then check weekly
> Template: See `references/retention-analysis-guide.md`

<!-- intermediate -->
**Retention cohorts** — Track D1/D7/D30 retention by signup cohort. Compare cohorts week-over-week to detect trends. Segment by acquisition channel, plan, and activation status. Look for the "flattening" point in your retention curve. If it never flattens, focus on activation and onboarding before acquisition.
> ~1-2 hours setup | `references/retention-analysis-guide.md`

<!-- senior -->
**Retention** — D1/D7/D30 cohorts tracked, segmented (channel/plan/activation), curve flattening analyzed. NRR tracked for revenue retention. Cohort comparison automated.
> `references/retention-analysis-guide.md`

---

## Revenue Analytics

Reference: `references/revenue-analytics-setup.md`

<!-- beginner -->
**Track your revenue health** — Once you have paying customers, you need to measure whether your business is actually healthy. The key numbers: MRR (Monthly Recurring Revenue) is your current revenue run rate. LTV (Lifetime Value) is how much a customer is worth over their entire relationship with you. CAC (Customer Acquisition Cost) is how much you spend to get one customer. The rule: LTV should be at least 3× CAC. If it's not, you're spending more to acquire customers than they're worth.
> Reference: See `references/revenue-analytics-setup.md` for Stripe webhook integration and SQL templates.

<!-- intermediate -->
**Revenue analytics (MRR/NRR/LTV)** — Stripe webhook → subscription_events table → MRR movement analysis (new, expansion, contraction, churn). Calculate NRR monthly (target >100%). Cohort-based LTV for accurate unit economics. Revenue dashboard template included.
> `references/revenue-analytics-setup.md`

<!-- senior -->
**Revenue analytics** — MRR movement decomposition, NRR tracking, cohort-based LTV, Stripe webhook pipeline. SQL + TypeScript templates.
> `references/revenue-analytics-setup.md`

---

## Cost Optimization

Reference: `references/cost-optimization-checklist.md`

Cloud costs grow silently. A weekly 15-minute review prevents surprise bills and keeps your burn rate predictable.

### Weekly cost review (15 min)

```
Every Monday:
├── Check cloud dashboard (AWS/GCP/Vercel/Railway)
│   └── Compare this week vs. last week — any >20% increase?
├── Check top 3 cost drivers
│   └── Compute, database, bandwidth — any anomalies?
├── Check for idle resources
│   └── Unused instances, orphaned volumes, old snapshots
├── Review billing alerts
│   └── Any alerts fired this week?
└── Log findings (spreadsheet or Notion)
```

### Right-sizing methodology

```
For each resource:
├── Check average utilization over past 7 days
├── CPU < 20% average? → Downsize instance
├── Memory < 30% average? → Downsize instance
├── Database connections < 10% of max? → Smaller tier
├── Storage growing but unused? → Archive or delete
└── Dev/staging environments running 24/7? → Schedule off-hours shutdown
```

<!-- beginner -->
**Review cloud costs weekly** — Cloud bills can spike without warning. Spend 15 minutes every Monday checking your hosting dashboard (Vercel, Railway, AWS, etc.). Compare this week to last week. If something jumped by more than 20%, investigate. Common culprits: forgotten staging environments running 24/7, oversized database tiers, and unoptimized image storage. Set up billing alerts so you get emailed if costs exceed a threshold. See `references/cost-optimization-checklist.md` for alert setup configs.
> Time: ~15 min/week
> Template: See `references/cost-optimization-checklist.md`

<!-- intermediate -->
**Cost optimization** — Weekly 15-min review (cloud dashboard, top cost drivers, idle resources, billing alerts). Right-size instances (CPU < 20% avg → downsize). Schedule dev/staging shutdowns. Set billing alerts at 80% and 100% of budget. Reserved instances for predictable workloads. Track cost per user.
> ~15 min/week | `references/cost-optimization-checklist.md`

<!-- senior -->
**Cost optimization** — Weekly review, right-sizing (utilization-based), billing alerts, reserved capacity analysis, cost-per-user tracking. Dev/staging scheduled shutdown.
> `references/cost-optimization-checklist.md`

---

## Security Patch Cadence

Unmaintained dependencies are a ticking time bomb. A regular patch cadence keeps you ahead of vulnerabilities.

### Cadence

```
Bi-weekly:
├── Run npm audit (or equivalent)
├── Update non-breaking dependencies (patch + minor versions)
├── Review and test breaking updates (major versions)
└── Commit lockfile changes

Monthly:
├── Review Dependabot / Renovate PRs
├── Check for newly disclosed CVEs affecting your stack
├── Audit third-party scripts (CDN-loaded JS, analytics tags)
└── Review IAM permissions and API key rotations

Quarterly:
├── Penetration test (self-service: OWASP ZAP; professional: HackerOne)
├── Security review of new features added since last quarter
├── Update security documentation
└── Review access controls and remove stale permissions
```

<!-- beginner -->
**Maintain a security patch cadence** — Every two weeks, run `npm audit` to check for known vulnerabilities in your dependencies and update what you can. Once a month, review any automated dependency update PRs (Dependabot or Renovate) and merge them. Once a quarter, do a basic security scan with a tool like OWASP ZAP. This prevents the "we haven't updated anything in 6 months" crisis.
> Time: ~30 min bi-weekly, ~1 hour monthly, ~2 hours quarterly

<!-- intermediate -->
**Security patch cadence** — Bi-weekly: `npm audit` + patch/minor updates + lockfile commit. Monthly: Dependabot/Renovate PR review + CVE check + third-party script audit + API key rotation review. Quarterly: pen test (OWASP ZAP or professional) + security review of new features + access control audit.
> ~30 min bi-weekly

<!-- senior -->
**Security patches** — Bi-weekly dep updates, monthly CVE review + key rotation, quarterly pen test. Automated via Dependabot/Renovate with auto-merge for patch versions.

---

## Post-Incident Reviews

After every P0 or P1 incident, run a blameless retrospective. The goal is systemic improvement, not finding someone to blame.

### Post-incident review template

```markdown
# Incident Review: [Title]
**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** P0 / P1
**Incident Commander:** [name]

## Summary
One paragraph: what happened, who was affected, how long it lasted.

## Timeline
- HH:MM — [Event: alert fired / user reported / deploy completed]
- HH:MM — [Action taken]
- HH:MM — [Resolution]

## Root Cause
What actually caused the incident? (not "human error" — go deeper)

## Contributing Factors
What made it worse or delayed resolution?

## What Went Well
What worked in our response?

## Action Items
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| [Specific preventive measure] | @name | YYYY-MM-DD | Open |

## Lessons Learned
What should we change about our process or systems?
```

<!-- beginner -->
**Run post-incident reviews** — After any major outage or data issue, write up what happened using the template above. The most important part is "action items" — concrete changes that prevent the same thing from happening again. This is NOT about blaming someone. It is about making the system better. Publish the review to your team (and optionally to your users via a blog post) so everyone learns.
> Time: ~1 hour per review

<!-- intermediate -->
**Post-incident reviews** — Blameless retro within 48h of P0/P1 incidents. Document: timeline, root cause, contributing factors, what went well, action items with owners and deadlines. Publish internally. Optionally publish externally (builds trust).
> ~1 hour per review

<!-- senior -->
**Post-incident reviews** — Blameless retro within 48h. Timeline + root cause + action items (owned + deadlined). Published internally, optionally externally.

---

## Email Lifecycle Campaigns

Reference: `references/email-lifecycle-campaigns.md`

Email is the highest-ROI growth channel. Five campaign types cover the full user lifecycle from signup to win-back.

### Campaign overview

| Campaign | Trigger | Goal | Emails |
|----------|---------|------|--------|
| Onboarding | Signup | Drive activation | Day 0, 1, 3, 7 |
| Re-engagement | Inactive 14+ days | Bring back dormant users | Day 14, 30, 60 |
| Upgrade nudge | Active free user hits limit | Convert to paid | On limit hit + 3 days |
| Churn prevention | Cancel initiated | Save the customer | Cancel flow + Day 3, 7 |
| Win-back | Churned 30+ days | Re-acquire lost customers | Day 30, 60, 90 |

### Email delivery setup

```
Provider selection:
├── Resend — developer-friendly, great API, React email templates
├── Postmark — highest deliverability, transactional focus
├── Loops — built for lifecycle email, visual builder
└── Customer.io — advanced segmentation, behavioral triggers

Deliverability checklist:
├── SPF record configured
├── DKIM record configured
├── DMARC policy set (p=quarantine minimum)
├── Custom sending domain (mail.yourdomain.com)
├── Dedicated IP (if sending >50K/month)
└── Warm-up plan if new domain (start with 50/day, double weekly)
```

<!-- beginner -->
**Set up email lifecycle campaigns** — Email drives more conversions than any other channel. Start with the onboarding sequence: send a welcome email immediately after signup, a "getting started" email on day 1, a "did you try X?" email on day 3, and a "here's what you're missing" email on day 7. Use Resend (developer-friendly API with React email templates) or Loops (visual email builder). See `references/email-lifecycle-campaigns.md` for complete email templates with subject lines you can copy-paste.
> Time: ~2-4 hours for onboarding sequence
> Template: See `references/email-lifecycle-campaigns.md`

<!-- intermediate -->
**Email lifecycle campaigns** — 5 sequences: onboarding (day 0/1/3/7), re-engagement (day 14/30/60), upgrade nudge (limit hit), churn prevention (cancel flow), win-back (day 30/60/90 post-churn). Use Resend/Postmark for delivery. SPF/DKIM/DMARC configured. Behavioral triggers via analytics events. Track open rate, click rate, conversion rate per email.
> ~2-4 hours per sequence | `references/email-lifecycle-campaigns.md`

<!-- senior -->
**Lifecycle email** — 5 sequences (onboarding/re-engagement/upgrade/churn-prevention/win-back). Behavioral triggers. Resend/Postmark delivery. SPF/DKIM/DMARC. Per-email conversion tracking. A/B test subject lines.
> `references/email-lifecycle-campaigns.md`

---

## Referral Program Design

Reference: `references/referral-program-design.md`

A referral program turns your best users into your most effective acquisition channel. Double-sided rewards (both referrer and referee get value) consistently outperform single-sided.

### Viral coefficient

```
Viral coefficient (K) = invitations per user x conversion rate

Example: each user invites 5 friends, 20% accept
K = 5 x 0.20 = 1.0

K > 1.0 = viral growth (each user brings >1 new user)
K = 0.5-1.0 = good amplification
K < 0.5 = referral is supplementary, not primary growth
```

### Reward types

| Type | Example | Best for |
|------|---------|----------|
| Account credit | "$10 credit for you and your friend" | SaaS with clear monetary value |
| Feature unlock | "Unlock premium feature for 1 month" | Freemium products |
| Discount | "20% off next month for both" | Subscription products |
| Extended trial | "Extra 14 days free for both" | Trial-based products |

<!-- beginner -->
**Design a referral program** — Referrals are the cheapest way to acquire users because your existing users do the selling for you. A double-sided reward works best: give both the referrer and the new user something valuable (like account credit or a free month). Add a referral page to your app where users can copy a unique link. Track referrals so you can see which users bring the most new signups. See `references/referral-program-design.md` for the tracking schema and API endpoint template.
> Time: ~4-8 hours to build
> Template: See `references/referral-program-design.md`

<!-- intermediate -->
**Referral program** — Double-sided reward (referrer + referee). Unique referral links with tracking codes. Reward types: credit, feature unlock, discount, or extended trial. Track viral coefficient (K = invites x conversion). Anti-abuse: rate limit invites, delay reward until referee activates, flag suspicious patterns.
> ~4-8 hours | `references/referral-program-design.md`

<!-- senior -->
**Referral program** — Double-sided rewards, unique tracking links, viral coefficient measured, anti-abuse controls, reward delayed until activation. K-factor optimized iteratively.
> `references/referral-program-design.md`

---

## Paid Acquisition Testing

Test paid acquisition with a small budget to find scalable channels before committing larger spend.

### Test framework: $500 / 3 channels / 2 weeks

```
Budget allocation:
├── Channel 1: $165 (e.g., Google Ads — search intent)
├── Channel 2: $165 (e.g., Twitter/X Ads — developer audience)
├── Channel 3: $170 (e.g., Reddit Ads — niche communities)
│
├── Duration: 2 weeks per channel
├── Goal: measure CAC (Customer Acquisition Cost) per channel
└── Decision: double down on channel with lowest CAC

CAC calculation:
  CAC = total ad spend / number of paying customers acquired

Example:
  $165 spent on Google Ads → 3 paying customers
  CAC = $165 / 3 = $55

  Rule of thumb: CAC should be < 1/3 of LTV
  If LTV = $300, target CAC < $100
```

<!-- beginner -->
**Test paid acquisition** — Before spending big on ads, run a small test. Allocate $500 across 3 advertising channels (e.g., Google Ads, Twitter Ads, Reddit Ads). Spend $165 per channel over 2 weeks. Track how many paying customers each channel brings. Calculate the cost per customer (CAC). Double down on the channel with the lowest CAC. If no channel produces customers under 1/3 of your lifetime value (LTV), paid acquisition may not be viable yet — focus on organic growth instead.
> Budget: $500 total
> Duration: 2 weeks

<!-- intermediate -->
**Paid acquisition testing** — $500 / 3 channels / 2 weeks. Calculate CAC per channel. Compare CAC to LTV (target: CAC < LTV/3). Use UTM parameters for attribution. Test ad creative variants (2-3 per channel). Double down on winner, kill losers.
> $500 budget, 2-week cycle

<!-- senior -->
**Paid acquisition** — $500/3-channel/2-week test. CAC measured per channel. CAC:LTV ratio evaluated. UTM attribution. Creative variants tested. Scale winner.

---

## Content Strategy

Reference: `references/content-strategy-template.md`

Content is a compounding growth channel. Unlike paid ads, a good blog post generates traffic for years.

### Content types by funnel stage

| Stage | Content type | Example | Goal |
|-------|-------------|---------|------|
| Awareness | Blog post (SEO) | "How to build X" | Organic traffic |
| Consideration | Comparison page | "Tool A vs Tool B vs Us" | Capture evaluators |
| Decision | Case study | "How Company X grew 3x with us" | Social proof |
| Activation | Tutorial | "Getting started in 5 minutes" | Drive activation |
| Retention | Changelog | "New: feature X is live" | Re-engage users |

### Publish cadence (minimum viable)

```
Weekly:  1 blog post (SEO-targeted or tutorial)
Monthly: 1 case study or comparison page
Monthly: 1 changelog update
Quarterly: 1 comprehensive guide or report
```

<!-- beginner -->
**Create a content strategy** — Content (blog posts, tutorials, case studies) brings in free, long-term traffic from search engines. Start small: publish one blog post per week targeting a keyword your audience searches for. Use Google Search Console (free) to find what people search for, write a post that answers their question better than existing results, and link to your product where relevant. See `references/content-strategy-template.md` for an editorial calendar template and SEO checklist.
> Time: ~2-4 hours per post
> Template: See `references/content-strategy-template.md`

<!-- intermediate -->
**Content strategy** — SEO keyword research (Google Search Console + Ahrefs/Ubersuggest). Editorial calendar: 1 blog/week, 1 case study/month, 1 changelog/month. Content types mapped to funnel stages (awareness → consideration → decision → activation → retention). Distribution: social, email newsletter, communities.
> ~2-4 hours/week | `references/content-strategy-template.md`

<!-- senior -->
**Content strategy** — Keyword-driven editorial calendar, content mapped to funnel stages, weekly publish cadence, multi-channel distribution. Track organic traffic + conversion per post.
> `references/content-strategy-template.md`

---

## Community Building

A community creates a moat that competitors cannot easily replicate. Start lightweight and grow with your user base.

### Community channels

```
Scale tier → recommended channels:
├── < 100 users  → Personal email, Twitter/X DMs, one Slack/Discord channel
├── 100-1K       → Discord or Slack community, public changelog, monthly update email
├── 1K-10K       → Community forum (Discord), case studies, contributor program
└── 10K+         → Community platform (Discourse/Circle), ambassador program, events
```

### Community content cadence

```
Weekly:   Product changelog update (even small changes)
Monthly:  Community highlight / user spotlight
Monthly:  "What we're building" roadmap update
Quarterly: Case study from power user
```

<!-- beginner -->
**Start building community** — Community does not mean building a Discord server nobody uses. Start small: respond to every user who emails you. Share what you are building on Twitter/X. When you hit ~50 users, create a simple Discord or Slack channel. Share a weekly changelog (what you fixed and shipped). The goal is to make your first users feel heard and invested in your product's success.
> Time: ~1-2 hours/week ongoing

<!-- intermediate -->
**Community building** — Discord/Slack for direct user communication. Public changelog (weekly). Monthly roadmap update. User spotlight / case studies. Contributor program for power users. Scale community investment with user count.
> ~1-2 hours/week

<!-- senior -->
**Community** — Discord/Slack, weekly changelog, monthly roadmap, quarterly case studies, contributor/ambassador program. Scaled to user count tier.

---

## Verification Steps

After completing the growth ops setup, verify:

1. **Analytics**: Fire a test event from your app. Confirm it appears in your analytics dashboard within 60 seconds with correct event name and properties.
2. **Funnel**: Build the signup → activate → pay funnel in your analytics tool. Confirm each stage shows data. Check that conversion rates between stages are calculated correctly.
3. **Web vitals**: Load your production homepage. Confirm LCP, INP, CLS, and TTFB events appear in analytics. Verify all are in the "good" range.
4. **A/B testing**: Create a test experiment with a 50/50 split. Verify both variants render correctly. Confirm experiment assignment event is tracked.
5. **Session replay**: Record a test session. Verify PII fields are redacted (password inputs, payment forms). Confirm you can replay the session.
6. **Feedback widget**: Click the feedback button. Submit a test response. Verify it appears in your feedback triage system.
7. **NPS survey**: Trigger the day-7 NPS survey for a test user. Submit a score. Verify the NPS calculation is correct.
8. **Retention**: Run the D7 retention SQL query from `references/retention-analysis-guide.md`. Confirm it returns cohort data in the expected format.
9. **Billing alerts**: Verify cloud billing alerts are configured by checking your provider's alert settings (should have 80% and 100% budget thresholds).
10. **Email sequence**: Trigger the onboarding email sequence for a test user. Verify all 4 emails arrive with correct content, links, and timing.

---

## Companion tools

- `coreyhaines31/marketingskills` -- full 26-skill marketing suite
- `alirezarezvani/claude-skills` -- `growth-marketer`, `content-creator`
- `mcpmarket.com` -- PostHog MCP connector for analytics queries from Claude Code
