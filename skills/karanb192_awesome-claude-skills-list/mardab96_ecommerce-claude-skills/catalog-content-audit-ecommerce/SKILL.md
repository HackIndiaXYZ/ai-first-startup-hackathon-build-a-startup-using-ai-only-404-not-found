---
name: catalog-content-audit-ecommerce
description: Audits product content across a whole catalog rather than one page, finding missing attributes, thin descriptions, duplicate copy, weak imagery coverage, and category gaps at scale. Use when the catalog is too large to review page by page, before a feed or marketplace push, or when only the hero products have real content. Above roughly 150 SKUs the counting is done by ../scripts/catalog_scan.py, not by reading the export, because a sampled read is not an audit.
---

# Catalog Content Audit - E-commerce

## Use this skill when

The store has more products than anyone can review manually, and content quality is uneven.

Common requests:

- "Which of our 800 products have bad content?"
- "Where are the biggest content gaps in the catalog?"
- "Prepare the catalog before we push to a marketplace."
- "Only our top sellers have proper descriptions."

## Required input

Minimum useful input:

- Catalog export with product title, description, attributes, images count, category, and price.
- Revenue or sessions per product so gaps can be ranked commercially.

Recommended additional input:

- Category or collection structure.
- Attribute requirements for the target channel: marketplace, Shopping feed, or catalog ads.
- Sample of the strongest existing product pages as an internal benchmark.
- Search terms or queries the category is meant to serve.
- Brand voice or copy guidelines.

## Before analysis

0. **Count the rows before you decide how to work.** Count the rows in the export. Above roughly 150 SKUs, do not read the catalog and describe what you saw. Run `../scripts/catalog_scan.py` over the file and work from its counts. A model reading a 800-row export summarises the rows it happened to attend to, then reports that as catalog coverage, and the numbers will be confidently wrong. If the script cannot be run in this environment, say so and audit a stated random sample with the sample size printed next to every percentage. Never present a sampled read as a full audit.
1. Confirm the destination. Content good enough for the store may still fail a marketplace or feed requirement.
2. Establish the internal benchmark from the store's own best pages rather than from a generic rule.
3. Confirm whether descriptions are hand-written, supplier-provided, or generated. Supplier copy duplicated across resellers is a specific and common problem.
4. Rank by commercial weight from the start. A gap on a product with no sessions is not urgent.

## Analysis workflow

1. Score every product against a consistent content spec: title structure, description length and substance, required attributes, image count, variant coverage, and specification completeness.
2. Detect duplicate and near-duplicate descriptions across the catalog, and copy shared with the supplier's other resellers where a sample allows it.
3. Find attribute gaps that break downstream channels: size, colour, material, GTIN, brand, condition, age group, and category-specific fields.
4. Map coverage by category so systemic gaps show up as clusters rather than as 400 individual issues.
5. Cross-reference gaps with revenue and sessions to produce a work queue by value, not by alphabet.
6. Identify the smallest repeatable template that would fix a whole cluster at once.
7. Separate what a person must write from what can be filled from structured data.

## Decision and evidence standard

Tag every finding with evidence: `export`, `url`, `screenshot`, `feed_diagnostics`, `structured_data`, `hypothesis`, or `needs_data`. Full vocabulary: `../references/output-standard.md`.

Rank findings by revenue behind the affected products, not by how many products are affected.

Do not invent product specifications, materials, dimensions, certifications, or compliance claims. Missing attributes are `needs_data`, never filled from assumption.

## Output format

### Catalog verdict

Overall content health, the dominant gap type, and confidence.

### Coverage scorecard

| Category | Products | Complete | Thin | Missing attributes | Duplicate copy | Weighted by revenue |
|---|---|---|---|---|---|---|

### Priority work queue

| Cluster | Products | Gap | Commercial weight | Fix approach | Effort |
|---|---|---|---|---|---|

### Template proposals

The one or two templates that close the largest clusters, with the fields each needs.

### Channel blockers

Gaps that will fail a feed, marketplace, or catalog ad requirement.

### Missing data

State which attributes the export actually contains. An attribute absent from the file is not an attribute absent from the catalog, and the two get confused constantly. Also say whether the export is one row per product or one row per variant, because that changes every count.

## Example input and output

Input:

- catalog export, 800 SKUs
- sessions and revenue per product
- marketplace attribute requirements
- three benchmark product pages

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| 61% of the accessories category shares supplier copy word for word | `export` | high | high | conversion/risk | M | do_now |
| GTIN missing on 140 SKUs, which blocks the planned marketplace push | `export`, `feed_diagnostics` | critical | high | revenue | M | do_now |

What not to do yet: bulk-generate descriptions for the whole catalog before the attribute gaps that feed them are closed.

## Guardrails

- Do not invent specifications, materials, certifications, or compliance claims.
- Do not publish bulk content changes without human review of a sample.
- Do not treat description length as quality.
- Do not rewrite pages that already convert without a reason and a measurement plan.
- Do not push catalog changes live without approval.
