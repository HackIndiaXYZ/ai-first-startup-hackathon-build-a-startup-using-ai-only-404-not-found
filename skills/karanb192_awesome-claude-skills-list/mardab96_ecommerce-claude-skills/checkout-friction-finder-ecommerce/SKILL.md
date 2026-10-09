---
name: checkout-friction-finder-ecommerce
description: Audits e-commerce cart and checkout flows from screenshots, funnel exports, policies, and support notes to find likely friction points. Use when cart abandonment is high, checkout conversion is weak, customers complain about checkout, or the user wants a pre-scale checkout review.
---

# Checkout Friction Finder - E-commerce

## Use this skill when

The user wants to find likely reasons shoppers add to cart but do not complete purchase.

Common requests:

- "Audit this checkout before we scale traffic."
- "Why are people abandoning checkout?"
- "Review our cart and checkout friction."
- "Find the biggest checkout fixes from these screenshots."

## Required input

Minimum useful input:

- Store type and category.
- Cart screenshots.
- Checkout screenshots across mobile and desktop if available.
- Shipping, tax, payment, return, and account-creation rules.
- Checkout funnel metrics if available.

Optional:

- Support questions about shipping, payment, discount codes, delivery, and returns.
- Session recording notes.
- Competitor checkout examples.

## Before analysis

1. Confirm whether the goal is conversion rate, AOV, lower support load, or checkout trust.
2. Ask whether the checkout can be edited or is locked by the platform.
3. Treat screenshots as evidence of friction, not proof of conversion loss.
4. Separate checkout friction from upstream product page or offer issues.

## Analysis workflow

1. Map the checkout path step by step.
2. Check for:
   - unexpected total cost
   - late shipping/tax disclosure
   - unclear delivery timing
   - forced account creation
   - weak trust signals
   - missing payment methods
   - discount-code confusion
   - mobile form friction
   - returns uncertainty
   - unclear error states
3. Rank issues by buyer impact and implementation difficulty.
4. Identify which issues need analytics validation.
5. Recommend the smallest testable fix first.

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

### Checkout verdict

Short summary with confidence: high / medium / low.

### Ranked friction table

| Rank | Friction point | Evidence | Buyer risk | Fix | Effort | Measurement |
|---|---|---|---|---|---|---|

### Quick fixes

3-5 fixes that can be reviewed or shipped quickly.

### Missing data

List the data needed to improve confidence.

## Example input and output

Input:

- mobile cart screenshot
- checkout step screenshots
- shipping policy
- support questions about delivery cost and delivery time

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Shipping cost appears only after contact details | `screenshot`, `policy` | high | high | conversion/support_load | S | do_now |
| Delivery timing is unclear before payment step | `screenshot`, `support_ticket` | medium | medium | conversion | S | test |

What not to do yet: promise conversion lift or redesign checkout without checking whether the platform allows the change.

## Guardrails

- Do not promise conversion lift.
- Do not recommend discounts unless price or shipping cost friction is evidenced.
- Do not tell the user to change live checkout settings without approval.
- Do not ignore mobile checkout.
- Do not treat best practices as stronger than the store's actual data.
