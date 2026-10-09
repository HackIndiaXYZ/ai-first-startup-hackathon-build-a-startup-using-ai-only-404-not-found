---
name: product-page-conversion-review-ecommerce
description: Reviews e-commerce product pages from URLs, screenshots, reviews, product facts, and competitor references to find clarity, trust, proof, objection, and buying-friction issues. Use when product page conversion is weak or before sending more traffic to a product.
---

# Product Page Conversion Review - E-commerce

## Use this skill when

The user wants to improve or audit a product detail page.

Common requests:

- "Audit this product page."
- "Why is this PDP not converting?"
- "Review this page before we scale ads."
- "Find what buyers need before purchasing."

## Required input

Minimum useful input:

- Product page URL or screenshots.
- Product category and price point.
- Target customer.
- Product facts, specs, variants, sizing, or compatibility details.
- Current conversion issue or business goal.

Optional:

- Top reviews.
- Support questions.
- Return reasons.
- Competitor pages.
- Traffic source and device mix.

## Before analysis

1. Confirm the target buyer and purchase intent.
2. Confirm whether the page is for cold traffic, warm traffic, search traffic, or returning customers.
3. Separate missing product information from weak copy.
4. Avoid rewriting claims without product evidence.

## Analysis workflow

1. Review above-the-fold clarity:
   - what the product is
   - who it is for
   - why it is different
   - price and offer clarity
   - primary CTA visibility
2. Check decision support:
   - images and video
   - specs
   - sizing or compatibility
   - delivery and returns
   - FAQs
   - reviews and proof
3. Mine objections from reviews, tickets, and returns.
4. Compare the page against buyer questions, not generic page-length advice.
5. Prioritize edits by likely buyer uncertainty reduced.

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

### PDP verdict

Short verdict with the top 3 blockers.

### Review table

| Area | Issue | Evidence | Recommended fix | Priority |
|---|---|---|---|---|

### Buyer questions not answered

List unanswered questions that likely affect purchase confidence.

### Page edit brief

A concise brief for the person editing the page.

## Example input and output

Input:

- product page URL
- product facts and specs
- top 20 reviews
- target customer
- traffic source

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Above-the-fold copy does not explain who the product is for | `url`, `screenshot` | high | medium | conversion | S | test |
| Compatibility questions appear in reviews but not on the page | `review_cluster`, `url` | high | high | conversion/support_load | M | do_now |

What not to do yet: invent product claims, testimonials, or urgency that is not supported by source material.

## Guardrails

- Do not fabricate product claims.
- Do not invent reviews or testimonials.
- Do not recommend aggressive urgency unless the offer truly supports it.
- Do not make legal, medical, nutritional, financial, or safety claims without source material.
- Do not edit live pages without approval.
