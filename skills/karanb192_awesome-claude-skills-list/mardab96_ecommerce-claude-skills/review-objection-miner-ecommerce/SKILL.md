---
name: review-objection-miner-ecommerce
description: Mines product reviews, competitor reviews, support objections, and customer comments to extract buying triggers, objections, proof points, customer language, product improvement themes, and PDP or ad angle ideas. Use when writing or rewriting a product page, preparing ad angles, or trying to understand in the customer's own words why people hesitate before buying.
---

# Review and Objection Miner - E-commerce

## Use this skill when

The user wants to turn reviews into product, page, and messaging insight.

Common requests:

- "Analyze these reviews."
- "Find objections we should answer on the product page."
- "Extract ad angles from customer language."
- "What do customers praise or complain about?"

## Required input

Minimum useful input:

- Review export or pasted reviews.
- Product names/SKUs.
- Rating, review date, and review text where available.
- Product page URL or product facts.

Optional:

- Competitor reviews.
- Support objections.
- Return reasons.
- Current product page copy.
- Current ad copy.

## Before analysis

1. Confirm whether the goal is PDP improvement, ad angles, FAQ, product improvement, or positioning.
2. Separate owned reviews from competitor reviews.
3. Preserve exact customer language only in short excerpts.
4. Do not turn reviews into testimonials unless permission and display rules are clear.

## Analysis workflow

1. Cluster reviews by theme:
   - buying trigger
   - main benefit
   - objection
   - confusion
   - quality concern
   - shipping/packaging
   - sizing/fit
   - usage context
2. Compare positive and negative themes.
3. Extract usable customer language.
4. Map insights to:
   - product page FAQ
   - proof blocks
   - image/video needs
   - ad angles
   - support/help center
   - product improvement
5. Prioritize repeated themes over isolated anecdotes.

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

### Review verdict

Short summary of what customers are really buying and what blocks them.

### Theme table

| Theme | Evidence | Customer language | Business implication | Recommended use |
|---|---|---|---|---|

### Objection map

List objections and where to answer them.

### Angle ideas

3-7 messaging angles tied to review evidence.

## Example input and output

Input:

- review export
- product facts
- current product page URL
- support objections

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Buyers repeatedly mention setup speed as the main value | `review_cluster` | medium | high | conversion | S | test |
| Negative reviews cluster around compatibility confusion | `review_cluster`, `support_ticket` | high | high | conversion/support_load | M | do_now |

What not to do yet: publish customer quotes unless review display rights and attribution rules are clear.

## Guardrails

- Do not fabricate testimonials.
- Do not publish customer quotes without permission.
- Do not over-weight one emotional review.
- Do not make claims unsupported by product facts.
- Do not use competitor review quotes as if they are owned proof.
