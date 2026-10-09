---
name: contribution-margin-check-ecommerce
description: Turns COGS, fee, shipping, refund, and ad spend exports into per-SKU contribution margin so the store can see which products actually make money after all variable costs. Use when ROAS looks fine but profit does not, before scaling spend on a product, or when the owner asks which SKUs are worth promoting.
---

# Contribution Margin Check - E-commerce

## Use this skill when

The user needs to know which products earn money after every variable cost, not just after product cost.

Common requests:

- "ROAS is 3 and we still made nothing. Where does it go?"
- "Which SKUs can I afford to advertise?"
- "Work out our real margin per product."
- "Is this bestseller actually profitable?"

## Required input

Minimum useful input:

- Product-level sales export: units, revenue, discounts.
- COGS per SKU, landed if available.
- Payment processing and platform fee rates.
- Shipping cost basis: real cost per order or per zone.

Recommended additional input:

- Refund and return rate per SKU.
- Ad spend attributed to product or collection.
- Pick, pack, and packaging cost assumptions.
- Payout or settlement report from the payment provider.
- Marketplace or channel commission rates.

## Before analysis

1. Confirm the period and whether revenue is gross, net of discounts, or net of refunds.
2. Confirm whether COGS is unit cost only or landed cost including duty and freight.
3. State every assumption you have to make, and mark it as an assumption inside the output.
4. Confirm whether the owner wants contribution margin per unit, per order, or per SKU for the period.
5. Do not blend fixed overhead into contribution margin. Name it separately if the owner asks about breakeven.

## Analysis workflow

0. **Run `../scripts/margin_stack.py` before forming any view.** If the inputs are a CSV, run `../scripts/margin_stack.py <file> --payment-fee-pct <rate> --payment-fee-fixed <fee>`. It builds the stack per SKU, computes CM2, CM3 and breakeven ROAS exactly, and lists which cost columns were absent so they can be marked as assumptions. Reserve manual calculation for a handful of SKUs pasted into chat, and even then show the working.
1. Build the cost stack per SKU in this order: gross revenue, discounts, returns and refunds, COGS, payment fees, platform or channel fees, shipping and fulfilment, packaging, then attributed ad spend.
2. Produce contribution margin before ad spend (CM2) and after ad spend (CM3). Keep them separate. Most stores only ever see the first one.
3. Rank SKUs by total contribution, not by margin percentage. A 60% margin product selling four units matters less than a 22% margin product carrying the catalog.
4. Flag every SKU where CM3 is negative, and separate "negative because of ad spend" from "negative before a single ad ran".
5. Compute the breakeven ROAS per SKU from its margin, and compare it to the ROAS the store is currently accepting.
6. Identify which cost line has the widest uncertainty, and say what data would close it.

## Decision and evidence standard

Tag every finding with evidence: `export`, `cogs_export`, `margin_csv`, `payout_report`, `shipping_invoice`, `return_reason`, `policy`, `hypothesis`, or `needs_data`. Full vocabulary: `../references/output-standard.md`.

Rank findings by total contribution at stake, not by margin percentage.

Any cost line the user did not supply is an assumption. Assumptions get `hypothesis`, confidence `low`, and appear in the missing data list. Never present an assumed cost as a measured one.

## Output format

### Margin verdict

One paragraph: is the store's profit problem in pricing, product cost, fulfilment, discounting, returns, or acquisition cost. Include a confidence level.

### Cost stack table

| Line | Amount | Basis | Source | Confidence |
|---|---|---|---|---|

### Per-SKU contribution

| SKU | Units | Net revenue | CM2 | CM2 % | CM3 | Breakeven ROAS | Owner decision |
|---|---|---|---|---|---|---|---|

### Money-losing SKUs

Products where CM3 is negative, with the reason and the smallest change that would flip it.

### Missing data

What would move confidence from assumption to measurement.

## Example input and output

Input:

- Shopify product sales export, 90 days
- COGS spreadsheet, unit cost only
- Meta and Google spend by campaign, mapped to collections
- Payment provider fee rate

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Bestselling SKU has 4% CM3 because shipping is charged flat but costs by weight | `export`, `shipping_invoice` | high | medium | margin | S | investigate |
| Freight and duty are not in COGS, so all margins here are overstated | `cogs_export`, `needs_data` | critical | low | margin | M | investigate |

What not to do yet: cut ad spend on a SKU using a margin figure built on assumed landed cost.

## Guardrails

- Do not treat ROAS as profit.
- Do not present assumed costs as measured costs.
- Do not recommend a price increase without checking category, positioning, and repeat purchase impact.
- Do not blend fixed overhead into contribution margin.
- Do not recommend killing a SKU on one period of data if it drives first orders that repeat.
