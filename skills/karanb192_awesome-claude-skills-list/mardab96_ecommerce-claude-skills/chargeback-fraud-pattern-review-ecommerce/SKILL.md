---
name: chargeback-fraud-pattern-review-ecommerce
description: Reviews chargebacks, disputes, and fraud declines to separate genuine fraud from service failures and friendly fraud, and to find the store-side causes behind them. Use when dispute rates are rising, a payment provider has raised a warning, or legitimate orders are being declined.
---

# Chargeback and Fraud Pattern Review - E-commerce

## Use this skill when

Disputes are growing, or fraud controls are costing more in lost good orders than they save.

Common requests:

- "Our chargeback rate is climbing."
- "The processor sent us a warning."
- "Are we declining real customers?"
- "How much of this is friendly fraud?"

## Required input

Minimum useful input:

- Dispute export: date, amount, reason code, product, outcome.
- Order volume for the same period so a rate can be computed.
- Current fraud rules or risk tool settings.

Recommended additional input:

- Declined order export.
- Delivery performance and tracking evidence practice.
- Descriptor shown on the customer's bank statement.
- Support tickets preceding disputes.
- Subscription billing setup if recurring.
- Representment win rate and evidence currently submitted.

## Before analysis

1. Compute the dispute rate against the correct denominator: transactions in the period the dispute relates to, not the period it was filed in.
2. Split disputes by reason code family before interpreting anything: true fraud, product not received, product not as described, subscription or recurring, duplicate or processing error.
3. Confirm the store's exposure threshold with its provider, since programme thresholds are provider-specific and change.
4. Ask what the bank statement descriptor says. Unrecognised descriptors generate disputes that look exactly like fraud.

## Analysis workflow

0. **Get the denominator right before anything else, with `../scripts/dispute_rate.py`.** A dispute filed in March belongs to the sale that happened in January, so dividing this month's disputes by this month's orders understates a rising problem. The script dates disputes by transaction where the export allows it, says so loudly when it cannot, clusters reason codes into families, and leaves anything it cannot classify visible instead of forcing it. Pass order volume with `--orders-per-month`; without it you get counts, and a count is not a rate.
1. Trend the dispute rate over time and against order volume, and mark any policy, product, or campaign change that lines up with an inflection.
2. Cluster disputes by product, channel, geography, order value band, and payment method.
3. Separate the three real causes and size each: genuine fraud, service failure dressed as fraud, and friendly fraud.
4. For service failures, trace back to the operational cause: delivery delays, missing tracking, unclear delivery promise, or a returns process so slow that customers dispute instead.
5. For recurring billing, check notice before charge, descriptor clarity, and cancellation friction. Hard-to-cancel subscriptions convert into disputes.
6. Review the fraud rules for over-blocking: what share of declines look like good customers, and what that costs against the fraud actually prevented.
7. Review representment evidence quality and win rate by reason code, and identify which evidence is missing at the point of capture rather than at the point of dispute.

## Decision and evidence standard

Tag every finding with evidence: `chargeback_export`, `export`, `payout_report`, `support_ticket`, `policy`, `screenshot`, `hypothesis`, or `needs_data`. Full vocabulary: `../references/output-standard.md`.

Rank findings by disputed value plus the fee exposure behind it, not by dispute count.

Reason codes describe what the customer claimed, not what happened. Treat them as classification, not as truth, and say so.

## Output format

### Dispute verdict

Dominant cause, current rate, direction, and confidence.

### Dispute breakdown

| Reason family | Count | Share | Value | Likely real cause | Evidence |
|---|---|---|---|---|---|

### Store-side causes

Operational and policy issues generating disputes, ranked by volume.

### Over-blocking check

What good traffic the current rules likely reject, and the cost basis for that estimate.

### Prevention queue

| Fix | Cause addressed | Effort | Measurement | Owner decision |
|---|---|---|---|---|

### Missing data

The declined-order export is the missing half of this picture. Disputes show what got through and went wrong; declines show what the rules rejected. Sizing over-blocking without them is guesswork, and it is the finding owners most want.

## Example input and output

Input:

- dispute export, 12 months
- order volume by month
- fraud rule settings
- support tickets tagged delivery and billing

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Product-not-received disputes cluster on one shipping method with no tracking evidence captured | `chargeback_export`, `export` | high | medium | risk/margin | S | do_now |
| Statement descriptor shows the legal entity name, not the brand, across all recurring charges | `payout_report`, `policy` | medium | high | risk/support_load | XS | do_now |

What not to do yet: tighten fraud rules across the board when most disputes are service failures, since that removes good orders without touching the cause.

## Guardrails

- Do not treat reason codes as proof of what happened.
- Do not recommend tightening fraud rules without estimating the cost of rejected good orders.
- Do not give legal, compliance, or card-scheme advice. Route those questions to the provider or counsel.
- Do not tighten a live risk rule. Rejected orders leave no trace an owner will ever review, so this is the one change in the pack whose damage is invisible after the fact.
- Do not name or profile individual customers as fraudulent in the output.
