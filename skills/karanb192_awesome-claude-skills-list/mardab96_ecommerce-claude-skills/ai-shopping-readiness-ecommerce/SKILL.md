---
name: ai-shopping-readiness-ecommerce
description: Checks whether a store's product data, policies, and structured markup can be read and represented correctly by AI shopping assistants and agentic checkout flows. Use when preparing for AI shopping surfaces, when assistants describe products or policies wrongly, or before deciding whether agentic commerce standards are worth adopting. Requires the rendered HTML or structured data of a product page, not just its URL, unless the environment can fetch pages.
---

# AI Shopping Readiness - E-commerce

## Use this skill when

The user wants to know whether a machine reading their store would get the product right.

Common requests:

- "Are we ready for AI shopping agents?"
- "ChatGPT describes our product wrongly. Why?"
- "What do we need for agentic checkout?"
- "Is our product data machine-readable or just human-readable?"

## Required input

Minimum useful input:

- Product page URLs or their rendered HTML.
- Product feed sample if one exists.
- Shipping, returns, and warranty policy pages.

Recommended additional input:

- Structured data output for a sample of pages.
- Availability and price update frequency.
- Platform and checkout stack.
- Existing marketplace or Merchant Center setup.
- Examples of an assistant describing the store incorrectly.

## Before analysis

1. Establish what the owner actually wants: being findable and correctly described, or completing transactions initiated by an agent. These are different projects with different costs.
2. Name the current landscape honestly. As of 2026 there are competing standards at different layers: UCP from Google and Shopify around discovery and cart, ACP from OpenAI and Stripe around agent checkout, and AP2 governed by the FIDO Alliance around payment authorisation. None of them is settled, and support depends on the store's platform and payment provider.
3. Do not promise placement, inclusion, or traffic from any AI surface. Nobody controls that.
4. Check what the platform already does natively before recommending any custom build. Most of the readiness work is data hygiene, not integration.

## Analysis workflow

1. Check structured data on product pages: product markup, offers, price, currency, availability, condition, identifiers, review markup where reviews exist.
2. Verify that the price and availability a machine reads match what the page shows a human, including variant-level differences.
3. Check whether critical commercial facts exist as text a machine can parse, rather than only inside images, PDFs, or scripts: dimensions, materials, compatibility, sizing, and what is in the box.
4. Check policy legibility: is the return window, who pays return shipping, delivery timeframe, and warranty stated as unambiguous text on a crawlable page.
5. Check identifiers and feed completeness: GTIN, brand, MPN, category mapping, variant relationships.
6. Check crawl and access rules. Confirm what the store's robots rules, bot protection, and CDN settings currently allow, and make sure the owner has made that choice deliberately rather than inherited it.
7. Assess agentic checkout exposure only after the above: what the platform and payment provider support today, what it would cost, and what the store would be committing to on returns and disputes.
8. Separate the work into: fix now regardless of standards, do when the platform supports it, and wait.

## Decision and evidence standard

Tag every finding with evidence: `url`, `structured_data`, `feed_diagnostics`, `policy`, `export`, `screenshot`, `hypothesis`, or `needs_data`. Full vocabulary: `../references/output-standard.md`.

Rank findings by whether they misrepresent the product to a buyer, not by how modern the fix sounds.

Anything about how a specific assistant ranks, selects, or displays products is a hypothesis. Say so. Vendor documentation changes faster than any checklist, so cite what was checked and when.

## Output format

### Readiness verdict

Can a machine currently represent this store correctly. State confidence and what was checked.

### Data legibility table

| Element | Present | Correct | Evidence | Severity | Fix |
|---|---|---|---|---|---|

### Policy legibility

Return window, return shipping payer, delivery promise, warranty: findable as text, ambiguous, or missing.

### Standards exposure

| Layer | Standard | Platform support today | Owner decision |
|---|---|---|---|

### Work split

Fix now, wait for platform, and not worth it yet, each with a reason.

### Missing data

Record the date every check was run and the platform version behind it. This is the one skill in the pack whose subject moves month to month, so an undated readiness verdict is worth less than no verdict.

## Example input and output

Input:

- five product page URLs
- feed sample
- returns and shipping policy pages
- screenshot of an assistant describing a product incorrectly

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Variant prices are rendered client-side and the markup exposes only the lowest price | `url`, `structured_data` | high | high | revenue/risk | M | do_now |
| Return window appears only inside a policy image, so no machine can read it | `policy`, `screenshot` | medium | high | conversion/support_load | S | do_now |

What not to do yet: commit to an agentic checkout integration while variant pricing is wrong in the markup.

## Guardrails

- Do not promise visibility, ranking, or inclusion on any AI surface.
- Do not present a fast-moving standard as settled. State the date of what was checked.
- Do not recommend a custom integration before platform-native support is checked.
- Do not change robots, bot protection, or crawl rules without approval, and never as a silent default.
- Do not let structured data claim anything the page does not actually offer.
