---
name: ltv-cohort-read-ecommerce
description: Reads customer cohorts from order exports to show repeat rate, time to second order, payback window, and which acquisition sources or first products produce customers who come back. Use when deciding how much a first order can cost, whether a channel is worth its CAC, or which product should be the entry point.
---

# LTV and Cohort Read - E-commerce

## Use this skill when

The user needs to know what a customer is worth over time, not just what the first order was worth.

Common requests:

- "How much can we afford to pay for a customer?"
- "Which channel brings customers who come back?"
- "What is our repeat rate really?"
- "Which product should be our entry offer?"

## Required input

Minimum useful input:

- Order export with customer identifier, order date, order value, and first-order flag or enough history to derive it.
- At least two full purchase cycles of history, or twelve months if the cycle is unknown.

Recommended additional input:

- Acquisition source per customer or per first order.
- First product or collection purchased.
- Discount used on first order.
- COGS or margin basis so value can be stated in contribution, not revenue.
- Ad spend by channel and month for CAC.

## Before analysis

1. Confirm how customers are identified, and whether guest checkout fragments the same person across email addresses.
2. Confirm the observation window. A twelve-month LTV claim needs cohorts that have had twelve months.
3. Do not extrapolate an LTV curve from cohorts that are three weeks old. Report what is measured and mark the rest as projection.
4. Decide whether value is stated in revenue or contribution margin, and stay consistent.

## Analysis workflow

0. **The cohort table comes from `../scripts/cohort_read.py`, not from reading the export.** If the input is an order CSV, run `../scripts/cohort_read.py <file>` (add `--by source` or `--by first_product` to segment). It groups customers by first order, computes cumulative value at each horizon, prints the cohort size next to every number, and refuses to report a horizon a cohort has not lived through, printing a dash instead of a zero. That last guard is the one manual analysis gets wrong most often.
1. Build monthly acquisition cohorts and track cumulative value per customer at 30, 60, 90, 180, and 365 days.
2. Compute repeat rate at each horizon, and the median time between first and second order.
3. Identify the second-order window: the period after which a customer who has not reordered rarely does. This is the window every retention flow should target.
4. Segment cohorts by acquisition source, first product, and whether the first order was discounted.
5. Compare cohort value against CAC for the same period to produce a payback window per channel.
6. Flag cohorts that look large on revenue but weak on repeat, and the reverse.
7. State clearly which differences are large enough to act on and which are noise given cohort size.

## Decision and evidence standard

Tag every finding with evidence: `export`, `cohort_export`, `margin_csv`, `cogs_export`, `hypothesis`, or `needs_data`. Full vocabulary: `../references/output-standard.md`.

Rank findings by how much of the customer base they describe. A pattern in a segment of eleven people is a note, not a finding.

Small cohorts get low confidence. Say the cohort size next to any comparison between segments.

## Output format

### Cohort verdict

What the store can actually afford to pay for a customer, and how firm that number is.

### Cohort table

| Cohort | Customers | Day 30 | Day 90 | Day 180 | Day 365 | Repeat rate |
|---|---|---|---|---|---|---|

### Second-order window

Median days to second order, and the point after which reorder probability collapses.

### Segment comparison

| Segment | Customers | Repeat rate | Value at 180d | CAC | Payback | Read |
|---|---|---|---|---|---|---|

### What this changes

Two or three decisions this supports: bid targets, entry product, flow timing, discount policy on first orders.

### Missing data

Say how many months of history the file actually holds, how many cohorts have reached each horizon, and whether guest checkout is fragmenting the same person across several customer records. All three cap what this analysis can honestly claim.

## Example input and output

Input:

- 24 months of orders with customer ids
- acquisition source per first order
- ad spend by channel by month
- COGS per SKU

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Half of all second orders land within 41 days, and reorder probability collapses after 90 | `export`, `cohort_export` | high | high | retention | S | do_now |
| Customers acquired on a first-order discount repeat at roughly half the rate of full-price first orders, on a small cohort | `cohort_export`, `hypothesis` | medium | low | retention/margin | M | investigate |

What not to do yet: raise CAC targets on a 365-day LTV number when only two cohorts have reached 365 days.

## Guardrails

- Do not project an LTV curve beyond the data and present it as measured.
- Do not compare segments without stating cohort sizes.
- Do not state LTV in revenue and compare it to CAC as if it were profit.
- Do not ignore guest checkout and identity fragmentation.
- Do not recommend spend increases on payback windows the store's cash position cannot fund.
