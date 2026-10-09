---
name: onsite-search-merchandising-review-ecommerce
description: Turns internal site search queries, zero-result searches, and collection performance into merchandising, naming, and assortment decisions. Use when visitors search but do not buy, when collection pages convert poorly, or when the owner wants demand signal from their own traffic instead of keyword tools. Requires site search logging to be switched on; without a query export there is nothing to analyse, and turning logging on is the first recommendation instead.
---

# Onsite Search and Merchandising Review - E-commerce

## Use this skill when

The store has traffic that is already looking for something, and the store is not answering it.

Common requests:

- "What are people searching for on our site?"
- "Our collection pages don't convert."
- "Should we stock this? People keep asking."
- "Why do searchers bounce?"

## Required input

Minimum useful input:

- Site search query export with query, search count, and result count or click-through.
- Collection or category page list.

Recommended additional input:

- Zero-result queries specifically.
- Conversion rate for searchers versus non-searchers.
- Collection page performance: sessions, add-to-cart, revenue.
- Product naming and tagging conventions.
- Filter and facet configuration.
- Support tickets or chat logs containing product questions.

## Before analysis

1. Confirm whether the search tool logs everything, or only queries that returned results. Missing zero-result logging hides the most valuable data in this analysis.
2. Confirm whether searchers convert better than non-searchers in this store. In most stores they do, which is what makes search failures expensive.
3. Distinguish three different failures: the store does not stock it, the store stocks it under another name, and the store stocks it but search cannot find it. Only the first is an assortment decision.
4. Set a volume floor so the output is not a list of one-off typos.

## Analysis workflow

1. Rank queries by volume and by revenue where it can be attributed.
2. Isolate zero-result queries and classify each: no such product, naming mismatch, synonym gap, misspelling, wrong category, or genuinely out of range.
3. For naming and synonym gaps, propose the specific synonym or tag rule that fixes the cluster, not the individual query.
4. Find high-volume queries that return results but convert poorly, and check whether the result set is actually relevant.
5. Look for demand the catalog does not serve at all, size it by query volume, and mark it as an assortment question for the owner rather than a merchandising fix.
6. Review collection pages against the top query themes: does the store have a landing surface for what people actually search for.
7. Check filters and facets against the attributes people search by, such as size, compatibility, occasion, material, or price range.
8. Compare onsite query language with the customer language found in reviews and tickets, and flag where the store's own naming is the outlier.

## Decision and evidence standard

Tag every finding with evidence: `site_search_export`, `export`, `url`, `review_cluster`, `support_ticket`, `screenshot`, `hypothesis`, or `needs_data`. Full vocabulary: `../references/output-standard.md`.

Rank findings by query volume covered per unit of work. One synonym rule that fixes a cluster outranks nine individual fixes.

Query volume is a demand signal, not a revenue forecast. Do not turn search counts into projected sales.

## Output format

### Search verdict

What the store's own visitors are asking for that it is not answering. Confidence and coverage of the data.

### Query table

| Query | Volume | Results | Outcome | Failure type | Fix |
|---|---|---|---|---|---|

### Zero-result clusters

| Cluster | Volume | Classification | Action | Effort |
|---|---|---|---|---|

### Assortment questions

Demand with no product behind it, sized and handed to the owner as a decision, not a recommendation.

### Merchandising fixes

Synonyms, tags, collection pages, and facets, ordered by volume covered per unit of work.

### Missing data

Say whether the search tool logs zero-result queries at all. If it does not, the most valuable half of this analysis does not exist yet, and switching logging on is the finding rather than a footnote.

## Example input and output

Input:

- 90 days of site search queries
- zero-result export
- collection page performance
- review export

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| The third highest query returns nothing because the catalog uses the technical name and customers use the common one | `site_search_export`, `review_cluster` | high | high | revenue/conversion | XS | do_now |
| A cluster of size-and-fit queries has no facet, and those sessions convert at a third of the search average | `site_search_export`, `export` | medium | medium | conversion | M | test |

What not to do yet: order stock against a zero-result cluster before checking whether the same demand already exists under a different product name.

## Guardrails

- Do not turn query volume into a sales forecast.
- Do not recommend stocking new products on search volume alone. Hand it to the owner as a decision with the evidence attached.
- Do not act on queries below the volume floor.
- Do not edit synonyms or collection rules directly. A bad synonym rule quietly poisons results for queries nobody is watching, and it will not show up in the search report that suggested it.
- Do not assume search converts better in this store. Check it.
