---
name: shipping-economics-review-ecommerce
description: Reviews the gap between what a store charges for shipping and what shipping actually costs, including free-shipping thresholds, zone pricing, packaging, oversize surcharges, and delivery promises. Use when fulfilment cost is rising, the free-shipping threshold has never been recalculated, or delivery complaints are growing.
---

# Shipping Economics Review - E-commerce

## Use this skill when

The user suspects that shipping is quietly eating margin, or wants to set a threshold and a delivery promise they can defend.

Common requests:

- "Is our free shipping threshold still right?"
- "Shipping costs are up. What do we change?"
- "Should we charge for returns?"
- "Why is our margin worse on small orders?"

## Required input

Minimum useful input:

- Carrier invoice or shipping cost export for a recent period.
- Current shipping rules: thresholds, flat rates, zones, express options.
- Order export with order value, destination, and shipping charged.

Recommended additional input:

- Product weights and dimensions.
- Packaging cost per order type.
- Return shipping policy and who pays.
- Delivery time promise shown at checkout.
- Support tickets about delivery, cost, or delays.

## Before analysis

1. Confirm whether shipping revenue is recorded separately from product revenue.
2. Check whether the carrier invoice includes surcharges: fuel, residential, oversize, remote area, address correction. These are usually where the gap lives.
3. Confirm which markets and zones matter commercially, and do not optimise a zone with four orders.
4. Establish whether the threshold was ever calculated, or inherited from a competitor.

## Analysis workflow

0. **Banding is the whole trick, and `../scripts/shipping_recovery.py` does it.** With an order CSV, run `../scripts/shipping_recovery.py <file> --threshold <current>`. It computes recovery by zone and by order value band, and tests the threshold against the real order distribution rather than against a rule of thumb. The gap is invisible in aggregate and obvious once banded, which is the whole reason this skill exists.
1. Compute shipping recovery rate: shipping charged divided by shipping paid, overall and by zone.
2. Find the order value bands where the store loses money on delivery, and size each band by order count.
3. Test the free-shipping threshold against actual AOV distribution. A threshold below the current AOV mode subsidises orders that would have converted anyway.
4. Check whether the threshold moves basket size at all, or just discounts existing behaviour.
5. Review surcharge exposure: oversize items, remote destinations, address corrections, failed deliveries.
6. Compare the delivery promise at checkout with delivered performance, and connect gaps to support load and returns.
7. Model two or three threshold and rate scenarios, each with the assumption stated and the risk named.

## Decision and evidence standard

Tag every finding with evidence: `shipping_invoice`, `export`, `policy`, `margin_csv`, `support_ticket`, `return_reason`, `screenshot`, `hypothesis`, or `needs_data`. Full vocabulary: `../references/output-standard.md`.

Rank findings by the annualised gap they represent, not by how wrong the rate looks.

Any scenario is a model, not a forecast. Label projected savings as projected, with the assumptions visible.

## Output format

### Shipping verdict

Where the gap is, how large it is, and how confident the number is.

### Recovery table

| Zone or band | Orders | Shipping charged | Shipping cost | Recovery % | Note |
|---|---|---|---|---|---|

### Threshold analysis

Current threshold, AOV distribution, and what the data supports.

### Scenarios

| Scenario | Change | Assumption | Expected effect | Risk |
|---|---|---|---|---|

### Delivery promise check

Promise versus performance, and the support and return cost of the gap.

### Missing data

Name which surcharge lines were legible on the invoice and which were bundled. Fuel, residential and address correction are the three that usually hide inside a single total, and a recovery rate built without them reads better than reality.

## Example input and output

Input:

- carrier invoice, one month
- order export with destination and shipping charged
- current shipping rules
- support tickets tagged delivery

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Free shipping threshold sits below the AOV mode, so most free deliveries are subsidised orders that would convert anyway | `export`, `shipping_invoice` | high | medium | margin | S | test |
| Oversize surcharges appear on 11% of shipments and are not priced into any product | `shipping_invoice` | high | high | margin | S | do_now |

What not to do yet: raise the threshold sitewide before checking which SKUs depend on threshold-driven basket building.

## Guardrails

- Do not touch a live rate table. A threshold change is felt by every customer in the next hour and is the hardest change in this pack to walk back cleanly.
- Do not model savings without stating the assumptions.
- Do not ignore the conversion risk of raising a threshold or adding a fee.
- Do not treat a single month of carrier invoices as seasonal truth.
- Do not recommend charging for returns without checking category norms and the return reason mix.
