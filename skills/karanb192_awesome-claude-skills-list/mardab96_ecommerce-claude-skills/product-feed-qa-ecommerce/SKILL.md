---
name: product-feed-qa-ecommerce
description: Audits e-commerce product feed exports, Google Merchant Center diagnostics, catalog screenshots, and product page samples to find data quality issues that can hurt Shopping ads, catalog ads, product discovery, or approvals. Use when products are disapproved, Shopping performance drops without an obvious campaign cause, or a catalog is about to be pushed to a new channel.
---

# Product Feed QA - E-commerce

## Use this skill when

The user wants to check product feed or catalog quality before or after distribution issues.

Common requests:

- "Audit this product feed."
- "Why are products disapproved?"
- "Check feed issues before we scale Shopping."
- "Review product titles, prices, availability, and images."

## Required input

Minimum useful input:

- Product feed CSV sample or full export.
- Merchant Center diagnostics export or screenshots if available.
- Product page URLs for affected items.
- Product category and market.

Recommended columns:

- item ID / SKU
- title
- description
- price
- sale price
- availability
- image link
- product link
- brand
- GTIN / MPN where relevant
- product category
- condition

## Before analysis

1. Confirm target channel: Google Shopping, Meta catalog, TikTok catalog, marketplace, or internal feed.
2. Confirm whether the problem is approval, performance, match quality, or catalog completeness.
3. Treat platform policy enforcement as outside the model's control.

## Analysis workflow

1. Check feed completeness and consistency.
2. Look for:
   - price mismatch
   - availability mismatch
   - missing identifiers
   - weak titles
   - thin descriptions
   - broken or low-quality images
   - landing page mismatch
   - variant confusion
   - category mismatch
3. Prioritize issues by severity:
   - approval risk
   - performance risk
   - cleanup opportunity
4. Create a fix queue.
5. Separate what blocks approval from what only degrades performance, and mark which items need confirmation in Merchant Center or the channel's own diagnostics before anyone spends time on them.

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

### Feed verdict

Short summary of feed health.

### Issue table

| Item/SKU | Issue | Evidence | Severity | Recommended fix |
|---|---|---|---|---|

### Cleanup patterns

Reusable fixes for titles, descriptions, images, identifiers, and availability.

### Missing data

Any columns or diagnostics needed.

## Example input and output

Input:

- product feed CSV
- Google Merchant Center diagnostics screenshot
- affected product URLs

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Price mismatch between feed and landing page | `feed_diagnostics`, `url` | critical | high | revenue/risk | S | do_now |
| Several products lack identifiers | `export`, `needs_data` | medium | medium | risk | M | investigate |

What not to do yet: invent GTINs, guarantee approval, or recommend policy workarounds.

## Guardrails

- Do not guarantee platform approval.
- Do not invent GTINs, MPNs, brands, or product attributes.
- Do not edit feeds directly.
- Do not ignore landing page consistency.
- Do not recommend policy workarounds.
