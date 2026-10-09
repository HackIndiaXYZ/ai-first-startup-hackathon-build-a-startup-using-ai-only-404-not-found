---
name: promo-discount-impact-review-ecommerce
description: Reviews whether a discount, sale, or promo actually added profit or simply pulled forward demand and trained customers to wait. Use when a sale has just ended, when a promo calendar is about to repeat, when discount codes are leaking, or when revenue is up and profit is flat. Needs daily orders covering a baseline before and after the promo.
---

# Promo and Discount Impact Review - E-commerce

## Use this skill when

The user wants to know whether a promotion was worth running, or whether the next one should be.

Common requests:

- "Did Black Friday actually make us money?"
- "Should we run the same sale again?"
- "Revenue was up and profit was flat. Why?"
- "Our discount codes are leaking everywhere."

## Required input

Minimum useful input:

- Orders or revenue by day covering the promo window plus a baseline before and after.
- Discount amount and mechanic: percentage, fixed, tiered, free shipping, bundle, or gift.
- Margin or COGS basis for discounted products.

Recommended additional input:

- Discount code usage export, including which codes were used and by whom.
- New vs returning customer split for the promo window.
- Ad spend during the promo.
- Promo calendar for the last 12 months.
- Site-wide traffic during the window.

## Before analysis

1. Define the baseline period explicitly and say why it was chosen.
2. Confirm whether the promo goal was revenue, profit, new customers, clearing stock, or cash.
3. Ask whether ad spend was increased during the promo. Lift from budget is not lift from discount.
4. Check for seasonality overlap before attributing anything to the mechanic.

## Analysis workflow

0. **Fix the three windows first, in code.** With a daily revenue CSV, run `../scripts/promo_impact.py <file> --promo-start <date> --promo-end <date>`. It computes baseline, promo and recovery on the same per-day footing, prices the trough, and refuses to stay quiet when ad spend also rose. Doing this comparison by hand is where the trough gets left out of the story.
1. Compare promo window to baseline on: orders, revenue, AOV, units per order, gross margin, new customer share.
2. Compute the margin actually given away: discount value plus incremental shipping and fee costs.
3. Look at the days after the promo. A deep trough after the peak is pull-forward, not growth.
4. Split the buyers: customers who would likely have bought anyway versus buyers new to the store or new to the category.
5. Check discount leakage: codes used outside their intended audience, stacking, repeat use, codes on public coupon sites, sitewide codes applied to already-thin SKUs.
6. Check whether the promo trained the list to wait. Compare full-price sell-through before and after repeated promo cycles.
7. Give a verdict per mechanic, not per campaign, so the calendar can be rebuilt.

## Decision and evidence standard

Tag every finding with evidence: `export`, `margin_csv`, `cogs_export`, `promo_calendar`, `policy`, `support_ticket`, `hypothesis`, or `needs_data`. Full vocabulary: `../references/output-standard.md`.

Rank findings by margin given away rather than by revenue moved.

Incremental profit claims require a defensible baseline. Without one, the finding is `hypothesis` at `low` confidence.

## Output format

### Promo verdict

Did this promo add profit, move profit around, or destroy it. State confidence and the baseline used.

### Promo economics

| Line | Promo window | Baseline | Delta | Note |
|---|---|---|---|---|

### Pull-forward check

Trough depth after the window, and whether combined window plus recovery beats baseline.

### Leakage findings

| Leak | Evidence | Severity | Fix | Effort |
|---|---|---|---|---|

### Recommended promo rules

Three to five rules for the next calendar: what mechanic, what floor margin, what audience, what exclusions.

### Missing data

The two inputs that most often turn this from a story into a measurement: ad spend by day across the same window, and margin for the discounted SKUs. Without the first, lift cannot be separated from budget. Without the second, the promo can only be judged on revenue.

## Example input and output

Input:

- daily orders export, 90 days
- discount code usage export
- COGS for discounted SKUs
- promo calendar for 12 months

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Sitewide 20% applied to the two thinnest-margin SKUs, both sold below cost after fees | `export`, `cogs_export` | critical | high | margin | XS | do_now |
| Full-price sell-through fell in each of the three weeks before the last two promos | `export`, `promo_calendar` | high | medium | margin/revenue | M | investigate |

What not to do yet: repeat the calendar as-is because the promo week beat an unpromoted baseline week.

## Guardrails

- Do not call revenue lift a profit win without margin data.
- Do not attribute lift to the discount when ad spend also rose.
- Do not ignore the post-promo trough.
- Do not recommend deeper discounts as the fix for a weak offer.
- Do not exclude SKUs from a promo without checking stock and cash goals first.
