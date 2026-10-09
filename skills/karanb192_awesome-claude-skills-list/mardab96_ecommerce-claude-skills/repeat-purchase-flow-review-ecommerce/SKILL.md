---
name: repeat-purchase-flow-review-ecommerce
description: Reviews e-commerce lifecycle flows from email/SMS exports, screenshots, product cycle data, and purchase timing to find second-purchase and retention opportunities. Use when repeat purchase is weak, email revenue is low, or post-purchase flows need review.
---

# Repeat Purchase Flow Review - E-commerce

## Use this skill when

The user wants to improve retention, repeat purchase, or lifecycle marketing.

Common requests:

- "Review our Klaviyo flows."
- "How do we get more second purchases?"
- "Audit post-purchase email/SMS."
- "Find missing lifecycle flows."

## Required input

Minimum useful input:

- Email/SMS flow screenshots or exports.
- Flow names, triggers, timing, and message summaries.
- Revenue, open rate, click rate, conversion rate where available.
- Product category and typical replenishment or repurchase cycle.
- Customer segments if available.

Optional:

- Cohort repeat-purchase data.
- First-order products and second-order products.
- Review, support, or return themes.
- Promo calendar.

## Before analysis

1. Confirm whether products are replenishable, seasonal, gifting, fashion, durable, or one-time purchases.
2. Confirm the target outcome: second purchase, cross-sell, replenishment, loyalty, review generation, or win-back.
3. Avoid generic flow advice when purchase cycle is unknown.

## Analysis workflow

1. Map existing flows:
   - welcome
   - browse abandonment
   - cart abandonment
   - post-purchase
   - education/use
   - replenishment
   - cross-sell
   - win-back
2. Compare timing to product usage and buying cycle.
3. Check message fit:
   - reason to buy again
   - product education
   - next-best product
   - proof
   - objection handling
   - customer care
4. Find missing segments and over-message risks.
5. Recommend the next 3 retention tests.

## Decision and evidence standard

Every finding should include:

- Evidence tag: `export`, `screenshot`, `url`, `review_cluster`, `support_ticket`, `return_reason`, `policy`, `feed_diagnostics`, `margin_csv`, `inventory_export`, `hypothesis`, or `needs_data`.
- Severity: low, medium, high, or critical.
- Confidence: low, medium, or high.
- Business impact: revenue, margin, cashflow, retention, conversion, support_load, or risk.
- Effort: XS, S, M, or L.
- Owner decision: do_now, test, investigate, monitor, ignore, or approval_needed.

If the evidence is weak, mark the finding as `hypothesis` or `needs_data` and lower confidence.

## Output format

### Retention verdict

Short summary of the biggest lifecycle gap.

### Flow table

| Flow | Status | Evidence | Gap | Recommended change |
|---|---|---|---|---|

### Second-purchase opportunities

List product and timing hypotheses.

### Measurement plan

Metrics to monitor for each proposed change.

## Example input and output

Input:

- flow screenshots
- flow performance export
- product replenishment cycle
- first and second order product mix

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| No post-purchase education before likely second-use moment | `screenshot`, `hypothesis` | medium | low | retention/support_load | S | test |
| Replenishment flow timing is later than the product usage cycle | `export`, `policy` | high | medium | retention | M | investigate |

What not to do yet: default to discounts before checking product cycle, customer education, and cross-sell fit.

## Guardrails

- Do not write final customer emails unless brand voice and offer rules are provided.
- Do not recommend heavy discounting as the default retention tactic.
- Do not assume one purchase cycle fits all products.
- Do not send or schedule messages.
- Do not invent segmentation data.
