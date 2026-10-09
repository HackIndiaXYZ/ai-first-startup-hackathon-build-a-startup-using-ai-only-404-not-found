---
name: launch-execution
description: "Launch day execution — staging regression, production readiness, rollback plans, war room setup, launch-day coordination sequence, monitoring protocol, hotfix process, and support channel setup."
triggers:
  - "launch"
  - "deploy"
  - "go live"
  - "production"
  - "release"
  - "staging"
  - "rollback"
  - "war room"
  - "launch day"
  - "ship"
  - "production readiness"
  - "regression"
  - "hotfix"
  - "production deploy"
  - "launch checklist"
  - "staging test"
  - "production ready"
  - "Product Hunt"
  - "launch sequence"
  - "feature flag"
  - "go/no-go"
  - "pre-ship check"
  - "state verification"
  - "state checklist"
  - "did I test everything"
  - "ready to ship checklist"
---

# Launch Execution

You handle everything needed to safely ship a product to production and survive launch day. This skill covers staging regression, production readiness verification, rollback plans, war room coordination, launch-day sequencing, monitoring protocol, hotfix procedures, and support channel setup.

## When this skill triggers

This skill activates when a developer is preparing for a production deployment, planning a launch day, setting up rollback procedures, configuring monitoring for launch, or coordinating engineering and marketing teams for a public launch (Product Hunt, Hacker News, etc.).

---

## Staging Full Regression

Reference: `references/staging-regression-checklist.md`

Before any production deployment, run a full regression against staging. This is your last safety net before real users see your code.

### Regression categories

| Category | Tests | Priority |
|----------|-------|----------|
| Auth flows | Login, signup, password reset, OAuth, session expiry | P0 |
| Core features | Primary user journey end-to-end | P0 |
| Payment flows | Checkout, subscription, webhook handling | P0 |
| Email flows | Transactional emails render and deliver | P1 |
| Edge cases | Empty states, long inputs, concurrent actions | P1 |
| Mobile/responsive | Breakpoints at 375px, 768px, 1024px, 1440px | P1 |
| Performance | Core Web Vitals, API response times < 200ms | P2 |
| Security | Auth bypass, XSS payloads, CSRF tokens | P0 |

### Regression test protocol

1. Deploy the exact release candidate to staging
2. Run automated test suite (`npm test && npx playwright test`)
3. Manual walkthrough of critical paths (auth, core action, payment)
4. Test on at least 2 browsers (Chrome + Safari/Firefox)
5. Test on at least 1 mobile device or emulator
6. Verify transactional emails with real inbox (not just logs)
7. Check error tracking (Sentry) for zero new errors on staging

<!-- beginner -->
**Run a staging regression** — Before you push to production, test every important user flow on your staging environment. Staging is a copy of production where mistakes are safe. Go through each category in the checklist: can a new user sign up, log in, do the core action, pay, and receive emails? If anything fails, fix it before deploying. This is the highest-leverage hour you will spend.
> Time: ~1-2 hours
> Template: See `references/staging-regression-checklist.md`

<!-- intermediate -->
**Staging regression** — Deploy exact release candidate to staging. Run automated suite. Manual walkthrough of auth, core flow, payment, and email. Cross-browser (Chrome + Safari). Mobile check. Verify Sentry shows zero new errors. Use the staging checklist to track completion.
> ~1 hour

<!-- senior -->
**Staging regression** — RC on staging. Automated suite green. Manual critical-path sweep. Cross-browser + mobile. Sentry clean. Sign off on staging checklist before proceeding.

---

## Pre-Ship State Verification

Reference: `references/pre-ship-state-verification.md`

<!-- beginner -->
**Test every state your users will see** — Before shipping, open your app in an incognito window and check: what happens when there's no data? What happens when the network is slow? What happens when something breaks? If you haven't seen a state, your users will see it first. The pre-ship checklist walks you through every state page-by-page, then checks global things like navigation, modals, themes, and accessibility.
> Time: ~30 min for a small app, ~1-2 hours for a larger one
> Reference: See `references/pre-ship-state-verification.md`

<!-- intermediate -->
**Pre-ship state verification** — Binary pass/fail checklist for every UI state. Per-page: empty, loading (3G throttle), populated, error (kill API), mobile (375px), tablet (768px). Global: navigation, modals (focus trap, escape, scroll lock), auth boundaries (redirect + return), themes (parity, persistence, no flash), accessibility (reduced motion, tab order, skip link, labels), performance (first paint, layout shift, lazy loading).
> ~30 min – 2 hours | `references/pre-ship-state-verification.md`

<!-- senior -->
**Pre-ship state verification** — Per-page state matrix (empty/loading/populated/error/mobile/tablet) + global checks (nav, modals, auth boundaries, theme parity, a11y, performance). Binary pass/fail. Different from design audit (analytical) — this is "did you TEST this?"
> `references/pre-ship-state-verification.md`

---

## Production Readiness Verification

Before flipping the switch, verify every operational concern is handled.

### Production readiness checklist

```
Environment & Config
├── Environment variables set in production (not hardcoded)
├── Production database connection string verified
├── Third-party API keys are production keys (not test/sandbox)
├── Feature flags set to intended launch state
├── Rate limiting configured and tested
└── CORS origins restricted to production domains

Data & Persistence
├── Database migrations applied and verified
├── Seed data removed / test data cleaned
├── Backup strategy confirmed (automated daily minimum)
└── Redis/cache connection verified

Monitoring & Alerting
├── Error tracking active (Sentry/Bugsnag)
├── Uptime monitoring configured (Betteruptime/Checkly)
├── Log aggregation working (structured JSON logs)
├── Key metric alerts set (error rate > 1%, p95 > 2s)
└── On-call rotation established (even if it is just you)

Security
├── HTTPS enforced (HSTS header present)
├── Security headers configured (CSP, X-Frame-Options)
├── Secrets not in source code (gitleaks clean)
├── Auth rate limiting active
└── Admin endpoints protected

DNS & Networking
├── DNS records pointed to production
├── SSL certificate valid (not expiring within 30 days)
├── CDN configured for static assets
└── Custom domain verified
```

<!-- beginner -->
**Verify production readiness** — Go through every item in the production readiness checklist above. The most common launch-day failures are: wrong API keys (still using test keys), missing environment variables, database not migrated, and monitoring not turned on. Check each one manually. When in doubt, open a production shell and verify the value directly.
> Time: ~30-45 min

<!-- intermediate -->
**Production readiness** — Env vars, production API keys, DB migrations, monitoring active, security headers, SSL, DNS, backups confirmed. Feature flags at intended state. Run a smoke test against production after deploy (health check endpoint + one critical path).
> ~20 min

<!-- senior -->
**Production readiness** — Env/keys/migrations/monitoring/security/DNS verified. Feature flags staged. Post-deploy smoke test automated. Runbook link in deploy notes.

---

## Rollback Plan

Reference: `references/rollback-plan-template.md`

Every production deploy needs a rollback plan written BEFORE you deploy. This is not optional.

### Rollback decision tree

```
Something is wrong after deploy
├── Errors spiking but feature-flaggable?
│   → Kill the feature flag. Monitor for 5 min. Done.
├── Errors spiking, no feature flag?
│   → Revert deploy (git revert + redeploy or platform rollback)
├── Database migration broke something?
│   → Run reverse migration if reversible
│   → Point-in-time restore if not reversible (restore to pre-deploy snapshot)
├── Third-party service down?
│   → Not your deploy. Enable fallback/graceful degradation.
└── Not sure what is wrong?
    → Roll back anyway. Investigate after stable.
```

### Rollback speed targets

| Method | Target time | When to use |
|--------|-------------|-------------|
| Feature flag kill | < 1 min | Feature-flagged changes |
| Platform rollback (Vercel/Railway) | < 2 min | Stateless app changes |
| Git revert + redeploy | < 10 min | Code-only changes |
| DB migration reversal | < 15 min | Reversible schema changes |
| Point-in-time DB restore | < 30 min | Irreversible data changes |

<!-- beginner -->
**Write a rollback plan** — Before launch, write down exactly how to undo the deploy if things go wrong. Include: (1) how to revert the code — on Vercel, click "Redeploy" on the previous deployment; on other platforms, `git revert HEAD && git push`, (2) how to revert database changes — do you have a backup? Can you reverse the migration?, (3) who to notify — your team, your users, (4) what to tell users — prepare a status page message or tweet draft. Having this written down BEFORE you need it prevents panic decisions.
> Time: ~15 min to write, saves hours when you need it
> Template: See `references/rollback-plan-template.md`

<!-- intermediate -->
**Rollback plan** — Document: code revert procedure (platform rollback or git revert), DB migration reversal (or point-in-time restore), feature flag kill switches, communication templates (internal Slack + external status page). Test rollback on staging if possible.
> ~15 min

<!-- senior -->
**Rollback plan** — Code/DB/feature-flag/DNS revert procedures documented. Rollback tested on staging. Comms templates pre-written. RTO target: < 5 min for code, < 15 min for DB.

---

## Support Channels

Set up support channels before launch so users can reach you and you can respond fast.

### Minimum support stack

```
Support Channel Setup
├── In-app: Crisp / Intercom / plain mailto: link
├── Email: support@yourdomain.com (forwarded to founder inbox)
├── Status page: Betteruptime status page or statuspage.io free tier
└── Escalation: personal phone number in team Slack for P0 incidents
```

<!-- beginner -->
**Set up support channels** — At minimum, add a way for users to contact you (a support email or chat widget) and a place to post if your app is down (a status page). Crisp.chat has a generous free tier for in-app chat. For a status page, Betteruptime has a free tier. Set these up before launch day, not during.
> Time: ~30 min

<!-- intermediate -->
**Support channels** — In-app chat (Crisp/Intercom), support@ email, status page, escalation path. Auto-responder for off-hours. Canned responses for common issues.
> ~20 min

<!-- senior -->
**Support channels** — Chat widget, support@ email, status page, escalation matrix. Auto-triage via labels/tags. SLA targets defined (P0: 1h, P1: 4h, P2: 24h).

---

## Transactional Email Testing

Transactional emails are the ones your app sends automatically: welcome emails, password resets, receipts, notifications. These must work on launch day.

### Email verification checklist

```
Email Testing
├── Send each transactional email type to a real inbox (Gmail + Outlook)
├── Check: subject line renders (no {{variable}} leaks)
├── Check: body renders in Gmail, Outlook, Apple Mail
├── Check: links in email point to production URLs (not localhost)
├── Check: unsubscribe link works
├── Check: emails land in inbox, not spam (check SPF/DKIM/DMARC)
├── Check: rate limiting on email sends (prevent accidental spam)
└── Check: reply-to address is monitored
```

<!-- beginner -->
**Test every transactional email** — Sign up with a real email (Gmail and Outlook), trigger every automated email your app sends, and verify each one arrives in the inbox (not spam), looks correct, and has working links. The most common issue is emails containing `{{name}}` instead of the actual user name, or links pointing to localhost. Fix these before users see them.
> Time: ~30 min

<!-- intermediate -->
**Transactional email testing** — Trigger all email types to real inboxes (Gmail + Outlook). Verify rendering, variable interpolation, production URLs, spam score, SPF/DKIM/DMARC. Test unsubscribe flow.
> ~20 min

<!-- senior -->
**Email testing** — All transactional types verified in real inboxes. SPF/DKIM/DMARC passing. Spam score clean. Unsubscribe functional. Reply-to monitored.

---

## Launch-Day Sequence (G14)

Reference: `references/launch-day-sequence.md`

This is the engineering-marketing coordination timeline for launch day. Every team member should have a printed copy (or pinned message) of this sequence.

### Timeline overview

| Time | Action | Owner |
|------|--------|-------|
| T-2h | Staging final check, regression sign-off | @engineering-lead |
| T-1h | Deploy to production, verify health checks | @engineering-lead |
| T-30m | Confirm production stable, feature flags live | @engineering-lead |
| T-0 | PH post goes live, HN post, Reddit post, first social post | @marketing-lead |
| T+30m | Send email to waitlist | @marketing-lead |
| T+1h | Check error rates, response times, signup funnel | @engineering-lead |
| T+2h | Second social post, respond to PH/HN comments | @marketing-lead |
| T+4h | Daily summary, address any issues, retrospective notes | @incident-commander |

### Coordination rules

1. Engineering deploys BEFORE marketing posts. Never the reverse.
2. Confirm production health before giving marketing the "go" signal.
3. If anything is wrong at T-30m, DELAY the launch. Do not launch broken.
4. Engineering stays heads-down monitoring for the first 2 hours post-launch.
5. Marketing handles all external communication; engineering handles all internal.

<!-- beginner -->
**Follow the launch-day sequence** — Launch day has a specific order of operations. Engineering deploys first (T-1h), confirms everything is working, then gives marketing the green light to post (T-0). Never reverse this order. Print the timeline from `references/launch-day-sequence.md`, assign each item to a person, and check them off as you go. If something breaks before T-0, delay the launch. Launching broken is worse than launching late.
> Template: See `references/launch-day-sequence.md`

<!-- intermediate -->
**Launch-day sequence (G14)** — T-2h staging regression, T-1h production deploy, T-0 marketing posts go live, T+30m waitlist email, T+1h metrics review, T+2h engagement, T+4h summary. Engineering confirms health before marketing goes. Dedicated Slack channel for coordination.
> Template: See `references/launch-day-sequence.md`

<!-- senior -->
**Launch sequence (G14)** — Eng deploys T-1h, confirms health, signals marketing at T-0. Parallel tracks: eng monitors metrics while marketing manages channels. T+4h retro. All coordinated in war room channel with @role pings.

---

## War Room Setup (G7)

Reference: `references/war-room-setup.md`

A war room is a dedicated communication space where the launch team coordinates in real time. Even a 2-person team benefits from having a single channel with clear roles.

### Role assignments

| Role | Responsibility | Who |
|------|---------------|-----|
| @incident-commander | Final go/no-go decisions, coordinates all roles, owns timeline | Founder / Tech Lead |
| @engineering-lead | Deploy, monitor, hotfix, rollback decisions | Senior Engineer / CTO |
| @comms-lead | External messaging (status page, social, PH comments) | Marketing Lead / Founder |
| @support-lead | Triage user reports, escalate bugs to engineering | Support / Community Manager |

### War room rules

1. All launch communication happens in the war room channel (not DMs)
2. Status updates every 30 minutes from @engineering-lead
3. No deploys without @incident-commander approval after T-0
4. User-reported issues go through @support-lead who triages severity
5. @comms-lead drafts all external messages, @incident-commander approves

<!-- beginner -->
**Set up a war room** — Create a dedicated Slack/Discord channel (e.g., `#launch-war-room`) for launch day. Assign roles: someone makes decisions (Incident Commander), someone handles the code (Engineering Lead), someone talks to users (Comms Lead), and someone handles support tickets (Support Lead). Even if you are all four roles, write this down so you know which hat you are wearing. Post the launch timeline in the channel so everyone can see it.
> Time: ~15 min to set up
> Template: See `references/war-room-setup.md`

<!-- intermediate -->
**War room (G7)** — Dedicated `#launch-war-room` channel. Assign: @incident-commander (go/no-go), @engineering-lead (deploy/monitor/fix), @comms-lead (external messaging), @support-lead (user triage). Pin launch timeline. Status updates every 30 min. All decisions in channel, not DMs.
> ~10 min setup

<!-- senior -->
**War room (G7)** — `#launch-war-room` with @role assignments. IC owns go/no-go. 30-min status cadence. All comms in channel. Escalation: support → engineering → IC. Post-launch handoff documented.

---

## Monitoring Protocol

Reference: `references/launch-day-protocol.md`

### Key metrics to watch during launch

| Metric | Tool | Alert threshold | Action |
|--------|------|----------------|--------|
| Error rate | Sentry | > 1% of requests | Investigate immediately |
| p95 latency | APM / Checkly | > 2 seconds | Check DB queries, caching |
| Signup rate | Analytics / DB | Flatline for 15+ min | Check signup flow, auth provider |
| Payment success rate | Stripe dashboard | < 95% success | Check webhook handler, Stripe status |
| Uptime | Betteruptime / Checkly | Any downtime | War room escalation |
| Server CPU/memory | Hosting dashboard | > 80% sustained | Scale up or investigate leak |

### Monitoring cadence

```
T-0 to T+1h:  Check dashboard every 5 min
T+1h to T+4h: Check dashboard every 15 min
T+4h to T+24h: Check dashboard every hour
T+24h onward: Normal alerting (automated)
```

<!-- beginner -->
**Set up launch-day monitoring** — During launch, you need to watch specific numbers: how many errors are happening (Sentry), how fast your app responds (latency), whether people can sign up and pay (signup and payment rates), and whether the app is up at all (uptime monitor). Open these dashboards in separate browser tabs before launch. Check them every 5 minutes for the first hour. If errors spike above 1% of requests, something is wrong and you should investigate or rollback.
> Template: See `references/launch-day-protocol.md`

<!-- intermediate -->
**Monitoring protocol** — Error rate (Sentry, < 1%), p95 latency (< 2s), signup rate (non-zero), payment success (> 95%), uptime (100%). Check every 5 min for first hour, every 15 min until T+4h. Alerts configured for all thresholds.
> See `references/launch-day-protocol.md`

<!-- senior -->
**Monitoring** — Error rate / latency / signups / payment success / uptime dashboards. 5-min cadence T+0-1h, 15-min T+1-4h, automated after T+24h. Alert thresholds pre-configured. Runbook linked from each alert.

---

## Rapid Hotfix Process

When something breaks after launch, you need a fast, safe way to push a fix without making things worse.

### Hotfix protocol

```
Issue detected
├── 1. Assess severity (P0: users blocked, P1: degraded, P2: cosmetic)
├── 2. P0? → Consider rollback first, then hotfix
├── 3. Create hotfix branch from production tag/commit
│      git checkout -b hotfix/issue-description production
├── 4. Minimal fix only — do NOT bundle other changes
├── 5. Test fix on staging (abbreviated regression: affected flow + auth + payment)
├── 6. Get one review (or pair-program the fix in war room)
├── 7. Deploy to production
├── 8. Verify fix in production (manual smoke test)
├── 9. Communicate resolution (status page, war room, users if needed)
└── 10. Log the incident for post-mortem
```

### Hotfix rules

- One fix per hotfix deploy. Never bundle.
- Hotfix branch from production, not from main/develop.
- Abbreviated testing is OK, but always test the affected flow + auth + payment.
- If the hotfix does not resolve the issue within 15 minutes, rollback instead.

<!-- beginner -->
**Know the hotfix process** — If something breaks after launch, do not panic. First, decide if it is critical (users cannot sign up or pay) or minor (a typo or visual glitch). For critical issues, consider rolling back to the previous version first, then fix forward. For the fix: create a branch from the production code, make the smallest possible change, test it on staging, get one person to look at it, then deploy. Never combine a hotfix with other changes you have been wanting to make.
> Template: See hotfix section above

<!-- intermediate -->
**Hotfix process** — Assess severity → rollback if P0 → branch from production → minimal fix → staging test (affected flow + auth + payment) → one review → deploy → verify → communicate. 15-min time-box: if not resolved, rollback.

<!-- senior -->
**Hotfix** — Severity triage → rollback-first for P0 → branch from prod tag → minimal fix → abbreviated staging regression → review → deploy → verify → comms. 15-min time-box, then rollback.

---

## Companion tools

- `coreyhaines31/marketingskills` → `launch-strategy` — Marketing playbook for launch campaigns
- `mcpmarket.com` → `PH Launch Planner` — Product Hunt launch scheduling and optimization
