---
name: paid-traffic-waste-triage-ecommerce
description: Reviews paid traffic exports and store-side data to identify whether performance issues come from ads, product pages, offers, feed quality, tracking, margins, or inventory. Use when Meta Ads, Google Ads, TikTok Ads, or other paid traffic gets expensive or stops converting.
---

# Paid Traffic Waste Triage - E-commerce

## Use this skill when

The user wants to diagnose paid traffic waste without assuming the ad account is the only problem.

Common requests:

- "CPA is rising. Find the leak."
- "Which products should not get more paid traffic?"
- "Review these ad exports and store data."
- "Is this an ad problem or a store problem?"

## Required input

Minimum useful input:

- Ad platform export for 7, 14, 30, and ideally 60 days.
- Campaign, ad set/ad group, ad, product, or landing page fields.
- Spend, clicks, purchases, revenue, CPA, ROAS, CTR, CPC, CPM where available.
- Landing page URLs.
- Product price, margin, or contribution margin if available.

Optional:

- Product feed diagnostics.
- Inventory status.
- PDP conversion rate.
- Returns or refund rate.
- Recent offer, price, landing page, or tracking changes.

## Before analysis

1. Confirm the business goal: profit, ROAS, CAC, revenue, new customers, or sell-through.
2. Confirm attribution window and conversion lag.
3. Confirm whether the same product is promoted across multiple channels.
4. Mark missing margin data clearly.

## Analysis workflow

1. Normalize ad data by product, campaign, ad, landing page, and time window.
2. Identify weak segments:
   - high spend with low purchases
   - high clicks with weak PDP conversion
   - strong CTR but weak conversion
   - good ROAS but poor margin
   - products with inventory or return issues
3. Diagnose likely layer:
   - ad/creative
   - audience/query
   - product page
   - offer/pricing
   - feed/catalog
   - tracking
   - margin/inventory
4. Recommend conservative next actions.
5. State which layers the current data cannot rule out. A triage that names one culprit while three layers remain unmeasured is a guess wearing a diagnosis, so list the unexcluded layers and the one input that would close each.

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

### Triage verdict

State which layer most likely needs attention.

### Waste table

| Segment | Evidence | Likely layer | Risk | Recommended action | Confidence |
|---|---|---|---|---|---|

### Action queue

Group actions by ads, PDP, offer, feed, tracking, inventory, and margin.

### Missing data

Fields needed before budget decisions.

## Example input and output

Input:

- Meta Ads export
- Google Ads export
- landing page URLs
- product margin CSV
- inventory notes

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Campaign is scaling a low-margin SKU | `export`, `margin_csv` | high | medium | margin | S | investigate |
| Paid traffic sends clicks to a product page with unresolved sizing objections | `export`, `review_cluster`, `url` | medium | medium | conversion/returns | M | test |

What not to do yet: increase spend or pause campaigns solely from ROAS without margin, stock, and tracking context.

## Guardrails

- Do not recommend budget changes without approval.
- Do not present ROAS as profit when margin data is missing.
- Do not pause products only because short-term ROAS is weak.
- Do not ignore inventory, returns, or product page conversion.
- Do not call tracking broken without evidence.
