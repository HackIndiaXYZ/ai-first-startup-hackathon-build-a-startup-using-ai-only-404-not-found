---
name: billing-payments
description: "Payment processor selection, subscription architecture, billing portal, webhooks, tax compliance, dunning, and free trial design."
triggers:
  - "billing"
  - "payment"
  - "payments"
  - "Stripe"
  - "Paddle"
  - "Lemon Squeezy"
  - "subscription"
  - "checkout"
  - "invoice"
  - "pricing"
  - "pricing plan"
  - "subscription plan"
  - "billing plan"
  - "trial"
  - "free trial"
  - "dunning"
  - "webhook"
  - "recurring"
  - "revenue"
  - "MRR"
  - "churn"
  - "proration"
  - "payment processor"
  - "billing portal"
  - "tax compliance"
  - "VAT"
  - "sales tax"
---

# Billing & Payments

> Phase 3: SHIP | Sprint 4

## Coverage

- Processor comparison (Stripe vs Paddle vs Lemon Squeezy — transaction fees, tax handling, MoR, payouts, international coverage)
- Subscription architecture (plans, upgrades, downgrades, proration, cancellation flows, plan versioning)
- Billing portal requirements (invoices, payment method management, plan changes, usage history)
- Webhook architecture (idempotent processing, HMAC verification, retry handling, event ordering)
- Tax compliance strategy (Stripe Tax, Paddle MoR, EU VAT, US sales tax nexus, automation services)
- Dunning/retry logic (retry schedules, grace periods, notification emails, account suspension)
- Free trial design (card-upfront vs no-card, usage limits, conversion nudges, trial expiry flows)

---

## Checklist Items

### Payment Processor Selection

<!-- beginner -->
**Choose a payment processor** — A payment processor handles credit card charges, subscriptions, and payouts to your bank account. The three main options for SaaS are: (1) **Stripe** — most flexible, best API and docs, you handle tax and compliance yourself. (2) **Paddle** — acts as your "Merchant of Record" (MoR), meaning Paddle sells your product on your behalf and handles all global tax filing, invoicing, and compliance. You get a simpler setup but less control. (3) **Lemon Squeezy** — similar MoR model to Paddle, even simpler to set up, great for solo founders. Start with Paddle or Lemon Squeezy if you want minimal tax headaches. Choose Stripe if you want full control and plan to invest in billing infrastructure.
> Time: ~30 min to decide
> Reference: See `references/processor-comparison-matrix.md`

<!-- intermediate -->
**Payment processor selection** — Stripe (direct processor, best API/docs, you own tax compliance), Paddle (MoR handles tax/invoicing globally, higher fees, less flexibility), or Lemon Squeezy (MoR, simplest DX, newer ecosystem). Evaluate: transaction fees (2.9%+30c vs 5-8% MoR), international coverage, tax handling (self-manage vs MoR), payout schedule, billing portal, API quality, webhook reliability. For most SaaS: Stripe if you want control, Paddle/LS if you want simplicity.
> ~30 min | `references/processor-comparison-matrix.md`

<!-- senior -->
**Processor selection** — Stripe (direct, 2.9%+30c, full control, self-manage tax) vs Paddle/Lemon Squeezy (MoR, 5-8%, tax/compliance handled). Evaluate fees, MoR trade-offs, API flexibility, payout timing, international coverage.
> `references/processor-comparison-matrix.md`

---

### Subscription Architecture

<!-- beginner -->
**Design your subscription plans** — Subscriptions are how SaaS apps charge recurring fees. You need to decide: (1) **Plan tiers** — most apps have 2-4 tiers (e.g., Free, Pro, Business). Keep it simple. (2) **Billing periods** — monthly and annual (offer a discount for annual, typically 15-20%). (3) **Upgrades/downgrades** — what happens when someone changes plans mid-cycle? Usually you prorate (charge the difference for the remaining days). (4) **Cancellation** — let users cancel anytime but keep access until the end of the billing period. Never make cancellation hard to find — it erodes trust and may violate regulations. Store your plan definitions in your payment processor (Stripe Products/Prices, Paddle Catalog) and reference them by ID in your code.
> Time: ~1-2 hours
> Reference: See `references/pricing-model-frameworks.md`

<!-- intermediate -->
**Subscription architecture** — Define plans in processor (Stripe Products + Prices, Paddle Catalog): plan name, features, monthly/annual pricing, trial period. Implement upgrade/downgrade with proration (Stripe: `proration_behavior: 'create_prorations'`). Cancellation: set `cancel_at_period_end: true` to maintain access until cycle ends. Store `stripe_customer_id` and `stripe_subscription_id` on user record. Sync subscription status via webhooks (`customer.subscription.updated`, `customer.subscription.deleted`). Version plans: never modify existing prices, create new price objects and migrate.
> ~1-2 hours | `references/pricing-model-frameworks.md`

<!-- senior -->
**Subscriptions** — Plans in processor (Products + Prices), proration on up/downgrade, `cancel_at_period_end`, webhook-synced status, plan versioning (new prices, migrate existing). Feature entitlements table keyed by plan ID.
> `references/pricing-model-frameworks.md`

---

### Billing Portal

<!-- beginner -->
**Set up a billing portal for your users** — Users need a self-serve place to manage their subscription: update their credit card, view past invoices, change their plan, and cancel. Stripe provides a hosted Billing Portal (called Customer Portal) that handles all of this with a single redirect — no UI to build. Paddle and Lemon Squeezy also provide hosted management pages. Using the hosted portal saves you weeks of development and ensures PCI compliance since you never touch card numbers.
> Time: ~30 min with hosted portal
> Key: Stripe Customer Portal, Paddle Checkout overlay, Lemon Squeezy customer portal

<!-- intermediate -->
**Billing portal** — Use Stripe Customer Portal (configure via dashboard: allow plan changes, cancellation, payment method update, invoice history). Redirect users: `stripe.billingPortal.sessions.create({ customer: stripeCustomerId, return_url })`. For custom billing pages, use Stripe Elements for payment method updates (never handle raw card data). Display: current plan, next billing date, usage (if applicable), invoice history with PDF download links. For Paddle: use `Paddle.Checkout.open()` overlay and subscription management URLs.
> ~30 min (hosted) or ~1 week (custom)

<!-- senior -->
**Billing portal** — Stripe Customer Portal (hosted, configurable) or custom UI with Elements. Plan management, payment method CRUD, invoice history (PDF via API), usage display. PCI SAQ-A with hosted, SAQ-A-EP with Elements.

---

### Webhook Architecture

<!-- beginner -->
**Set up payment webhooks** — Webhooks are messages your payment processor sends to your server when something happens: a payment succeeds, a subscription renews, a card is declined. You need to handle these reliably because they are the source of truth for billing state — your database should reflect what your processor tells you, not what your frontend hopes happened. Three critical rules: (1) **Verify the signature** — every webhook comes with an HMAC signature to prove it is really from Stripe/Paddle, not an attacker. Always verify it. (2) **Be idempotent** — you might receive the same event twice (retries). Use the event ID to skip duplicates. (3) **Return 200 quickly** — process the webhook asynchronously if it takes time. If you return an error, the processor will keep retrying.
> Time: ~1-2 hours
> Reference: See `references/dunning-strategy.md` (includes webhook handler template)

<!-- intermediate -->
**Webhook architecture** — Endpoint: `POST /api/webhooks/stripe` (or `/paddle`, `/lemonsqueezy`). Verify HMAC signature using raw body (not parsed JSON). Deduplicate: store processed event IDs in database, skip if already seen. Return 200 immediately, process asynchronously via queue (or at minimum, wrap in try-catch and always return 200). Critical events to handle: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.trial_will_end`. Map events to domain actions: sync subscription status, update entitlements, trigger dunning flow.
> ~1-2 hours | `references/dunning-strategy.md`

<!-- senior -->
**Webhooks** — HMAC verification (raw body), idempotent processing (event ID dedup), async handling (queue), critical event mapping (subscription lifecycle, invoice events, trial ending). Structured logging per event. Dead-letter queue for repeated failures.
> `references/dunning-strategy.md`

---

### Tax Compliance Strategy

<!-- beginner -->
**Handle tax compliance for your SaaS** — If you sell to customers in different states or countries, you may need to collect sales tax (US) or VAT (EU). This is confusing, but here is the simple version: (1) **Easiest path** — Use Paddle or Lemon Squeezy as your processor. As Merchant of Record, they handle all tax calculation, collection, filing, and remittance globally. You do nothing. (2) **Stripe path** — Enable Stripe Tax, which automatically calculates and adds the correct tax to each transaction. You still need to register in jurisdictions where you have tax obligations ("nexus") and file returns (or use a service like TaxJar or Avalara to automate filing). (3) **Do I even need to collect tax?** — If you are US-based selling only to US customers and your revenue is under ~$100K, you may have limited obligations. But once you sell internationally or cross certain revenue thresholds, tax compliance becomes mandatory.
> Time: ~1-2 hours to decide, ongoing to maintain
> Reference: See `references/tax-compliance-guide.md`

<!-- intermediate -->
**Tax compliance** — Three strategies by complexity: (1) **MoR (Paddle/Lemon Squeezy)**: tax fully handled — they are the seller of record, calculate, collect, file, and remit all taxes globally. (2) **Stripe Tax**: enable per-transaction tax calculation, configure product tax codes (`txcd_10103001` for SaaS), collect customer location. You register + file returns (or automate with TaxJar/Avalara). (3) **Manual**: calculate via API (TaxJar/Avalara), add to invoices, file yourself. US: track economic nexus thresholds (~$100K or 200 transactions per state). EU: VAT via OSS (One-Stop Shop) if under EUR 10K threshold, otherwise register in each state. Include tax IDs on invoices (required in EU). Handle tax-exempt customers (B2B reverse charge in EU, exempt orgs in US).
> ~1-2 hours | `references/tax-compliance-guide.md`

<!-- senior -->
**Tax compliance** — MoR (simplest, tax fully handled) vs Stripe Tax (auto-calculate, you file) vs manual (TaxJar/Avalara API). US: economic nexus tracking. EU: VAT OSS, reverse charge for B2B. Tax codes, invoice requirements, exempt customer handling.
> `references/tax-compliance-guide.md`

---

### Dunning & Retry Logic

<!-- beginner -->
**Set up dunning to recover failed payments** — "Dunning" is the process of recovering revenue when a payment fails (usually because a credit card expired or was declined). Without dunning, you silently lose customers. Here is what to set up: (1) **Automatic retries** — your processor retries the charge on a schedule (day 1, 3, 5, 7). Stripe Smart Retries does this automatically and picks optimal retry times using ML. (2) **Email notifications** — send the customer an email when payment fails, with a link to update their card. Send reminders before each retry. (3) **Grace period** — keep the user's access active for 7-14 days while retries happen. Do not cut them off immediately. (4) **Suspension** — if all retries fail, downgrade to a free plan or suspend the account (with a clear reactivation path).
> Time: ~2-3 hours
> Reference: See `references/dunning-strategy.md`

<!-- intermediate -->
**Dunning & retry logic** — Configure Stripe Smart Retries (automatic) or manual retry schedule (day 1, 3, 5, 7, 14). Grace period: mark subscription as `past_due` but maintain access for 7-14 days. Email sequence: payment failed (day 0, include update link), reminder (day 3), urgent (day 7), final warning (day 12), account suspended (day 14). Webhook handlers: `invoice.payment_failed` (start dunning), `invoice.payment_succeeded` (end dunning, clear warnings). Card expiry: send pre-emptive email 30 days before via `customer.subscription.trial_will_end` or scheduled job checking `card.exp_month/exp_year`. Voluntary churn: cancellation survey, offer pause or downgrade before final cancel.
> ~2-3 hours | `references/dunning-strategy.md`

<!-- senior -->
**Dunning** — Smart Retries + manual schedule fallback, grace period (7-14d past_due), email sequence (failed/reminder/urgent/final/suspended), pre-emptive card expiry notifications, cancellation deflection (pause/downgrade offers).
> `references/dunning-strategy.md`

---

### Free Trial Design

<!-- beginner -->
**Design your free trial** — A free trial lets users try your product before paying. Two main approaches: (1) **Card upfront** — collect a credit card at signup but do not charge for 7-14 days. Higher intent users, better conversion rate (~50-60%), but fewer signups. (2) **No card** — let users sign up with just an email. More signups, lower conversion (~5-15%), but bigger top-of-funnel. Pick based on your product: if the value is obvious quickly (e.g., a tool), no-card works. If it needs setup time (e.g., a platform), card-upfront ensures serious users. Set clear expectations: show trial days remaining in the UI, send a "trial ending" email 3 days before expiry, and make the upgrade path obvious. After trial ends, restrict features (do not delete data).
> Time: ~2-4 hours
> Reference: See `references/pricing-model-frameworks.md`

<!-- intermediate -->
**Free trial design** — Card-upfront (Stripe: `subscription_data.trial_period_days` on Checkout, auto-converts to paid) vs no-card (create user without subscription, upgrade flow at trial end). Trial length: 7 days for simple tools, 14 days for platforms, 30 days for enterprise. In-app: show days remaining, feature usage progress bars, upgrade CTAs that intensify near expiry. Emails: welcome (day 0), value nudge (day 3), trial ending (day N-3), trial ended (day N), win-back (day N+7). Post-trial: restrict to free tier features, preserve data, show clear upgrade path. Track: trial-to-paid conversion rate, time-to-first-value, feature adoption during trial.
> ~2-4 hours | `references/pricing-model-frameworks.md`

<!-- senior -->
**Free trial** — Card-upfront (auto-convert, higher conversion) vs no-card (bigger funnel). Trial length by product complexity. In-app countdown + usage nudges. Email sequence (welcome/value/ending/ended/win-back). Post-trial: graceful degradation to free tier. Track conversion rate, time-to-value.
> `references/pricing-model-frameworks.md`

---

## Verification Steps

After completing the checklist above, verify:

1. **Payment flow**: Complete a test purchase end-to-end using Stripe test mode (card `4242 4242 4242 4242`). Confirm: checkout succeeds, webhook fires, database is updated, user gains access to paid features.
2. **Subscription lifecycle**: Test upgrade, downgrade, and cancellation. Verify proration amounts are correct and subscription status syncs via webhooks.
3. **Webhook reliability**: Send a test webhook from the Stripe dashboard (or use `stripe trigger invoice.payment_failed`). Confirm: signature verification passes, event is processed idempotently (send the same event twice, verify no duplicate side effects).
4. **Billing portal**: Access the customer billing portal as a test user. Verify: can update payment method, view invoices, change plan, and cancel.
5. **Dunning flow**: Simulate a failed payment using Stripe test card `4000 0000 0000 0341`. Verify: dunning email is sent, grace period is applied, retries occur, access is maintained during grace period, account is suspended after all retries fail.
6. **Trial expiry**: Create a test subscription with a 1-day trial. Verify: trial-ending email fires, trial converts to paid (card-upfront) or restricts features (no-card).
7. **Tax calculation**: Complete a test purchase with a non-US address. Verify: correct tax rate is applied, tax amount appears on invoice, tax line items are present in Stripe.

---

## Companion tools

- Stripe integration skills — Stripe API patterns, Elements, webhooks
- `wrsmith108/stripe-mcp-skill` — Stripe integration for Claude Code: create products, prices, checkout sessions
- `coreyhaines31/marketingskills` -> `pricing-strategy` — Pricing page design, tier definition, competitive pricing
