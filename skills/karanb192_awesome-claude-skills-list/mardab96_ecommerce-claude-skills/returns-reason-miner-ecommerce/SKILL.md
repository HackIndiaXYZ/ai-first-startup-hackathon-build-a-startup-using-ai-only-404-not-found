---
name: returns-reason-miner-ecommerce
description: Mines e-commerce returns exports, refund reasons, support notes, and product page data to find preventable return patterns and fixes for product pages, sizing, expectations, fulfillment, packaging, and quality. Use when the return rate rises, a specific SKU returns far above the store average, or returns are being treated as a cost line instead of as feedback.
---

# Returns Reason Miner - E-commerce

## Use this skill when

The user wants to understand why products are returned and what can be fixed.

Common requests:

- "Analyze our return reasons."
- "Which products create preventable returns?"
- "What should we change on the product page?"
- "Find return patterns by SKU."

## Required input

Minimum useful input:

- Returns export with SKU/product, date, quantity, and reason.
- Sales volume by SKU for the same period if available.
- Product page URLs or screenshots for affected products.

Optional:

- Refund cost.
- Margin impact.
- Support notes.
- Photos or QC notes.
- Size guide or product specs.

## Before analysis

1. Confirm the return window and policy.
2. Ask whether reasons are customer-selected, agent-selected, or free text.
3. Normalize reason labels before drawing conclusions.
4. Separate preventable returns from normal category behavior.

## Analysis workflow

1. Group returns by SKU, category, variant, reason, and time period.
2. Calculate return concentration where sales volume exists.
3. Classify themes:
   - sizing/fit
   - product expectation mismatch
   - quality issue
   - shipping damage
   - wrong item
   - late delivery
   - buyer remorse
   - unclear compatibility
4. Map each theme to possible fixes:
   - PDP copy
   - images/video
   - sizing guide
   - FAQ
   - packaging/fulfillment
   - product/QC
5. Prioritize preventable high-impact patterns.

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

### Returns verdict

Top return drivers and whether they look preventable.

### Return pattern table

| Product/SKU | Return theme | Evidence | Likely root cause | Recommended fix |
|---|---|---|---|---|

### Preventable return fixes

Action list grouped by PDP, policy, fulfillment, and product.

### Missing data

Data needed before changing policy or operations.

## Example input and output

Input:

- returns export
- sales by SKU for same period
- return reason tags
- affected product page URLs

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Sizing-related returns concentrate in one product line | `return_reason`, `export` | high | high | margin/returns | M | do_now |
| Product images may overstate size | `url`, `hypothesis` | medium | low | returns/conversion | S | investigate |

What not to do yet: tighten return policy before checking sizing, PDP clarity, fulfillment, and quality signals.

## Guardrails

- Do not recommend stricter return policy as the default fix.
- Do not blame customers without evidence.
- Do not call product quality issues without enough signal.
- Do not use return rate without sales volume when ranking severity.
- Do not publish customer quotes without permission.
