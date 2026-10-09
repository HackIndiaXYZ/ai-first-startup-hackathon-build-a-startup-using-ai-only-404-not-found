---
name: weekly-ecommerce-growth-readout
description: Produces a weekly e-commerce owner readout from exported store, analytics, ads, email/SMS, inventory, support, and returns summaries. Use when the user wants a concise weekly view of what changed, what likely matters, and what to do next.
---

# Weekly E-commerce Growth Readout

## Use this skill when

The user wants one weekly operating update instead of scattered dashboards.

Common requests:

- "Prepare my weekly e-commerce readout."
- "What changed this week?"
- "Summarize Shopify, ads, email, inventory, support, and returns."
- "What are the 3 actions for next week?"

## Required input

Minimum useful input:

- Store summary for this week and previous week.
- Revenue, orders, sessions, conversion rate, AOV, and top products.
- Paid traffic summary if applicable.
- Email/SMS summary if applicable.

Recommended additional input:

- Inventory exceptions.
- Support ticket themes.
- Return/refund highlights.
- Top landing pages or product pages.
- Promo calendar.
- Major changes made this week.

## Before analysis

1. Confirm the reporting week and comparison period.
2. Confirm the owner's goal: revenue, profit, new customers, repeat purchase, sell-through, or operational stability.
3. Separate facts from hypotheses.
4. Mark missing data clearly.

## Analysis workflow

1. Summarize weekly performance:
   - revenue
   - orders
   - sessions
   - conversion rate
   - AOV
   - paid traffic
   - email/SMS
   - product mix
   - inventory
   - support
   - returns
2. Identify material changes, not every movement.
3. Tie changes to possible causes:
   - traffic mix
   - offer/promo
   - product availability
   - page performance
   - lifecycle flow
   - support/returns
   - seasonality
4. Recommend 3 next actions and 3 watch items.
5. Say what did not move and was expected to. A change that failed to happen after last week's action is the most useful line in a weekly readout and the one most often left out.

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

### Weekly verdict

One short paragraph for the owner.

### Scorecard

| Metric | This week | Previous period | Change | Interpretation |
|---|---|---|---|---|

### What changed

Top 3-5 meaningful changes.

### Recommended actions

3 actions with owner, evidence, and measurement.

### Watch list

Issues to monitor, not act on yet.

### Missing data

What would make next week's readout better.

## Example input and output

Input:

- weekly store summary
- ad summary
- email/SMS summary
- inventory exceptions
- support and returns highlights

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Revenue rose but margin confidence is low because SKU mix changed | `export`, `needs_data` | medium | low | margin | S | investigate |
| Support tickets about delivery increased during promo week | `support_ticket`, `policy` | medium | medium | support_load/conversion | S | monitor |

What not to do yet: infer causality from weekly movement without comparison period and change log.

## Guardrails

- Do not infer causality from correlation without caveat.
- Do not overwhelm the user with every metric.
- Do not recommend public, paid, or operational changes without approval.
- Do not hide missing data.
- Do not treat vanity metrics as success if profit, retention, or stock risk worsened.
