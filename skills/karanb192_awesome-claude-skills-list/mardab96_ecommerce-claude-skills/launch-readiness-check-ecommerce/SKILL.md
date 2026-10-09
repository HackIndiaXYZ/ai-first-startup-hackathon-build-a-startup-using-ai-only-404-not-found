---
name: launch-readiness-check-ecommerce
description: Runs a go/no-go readiness check before a product launch, restock, promo, or spend increase, covering stock, page, feed, tracking, lifecycle flows, support, policy, and margin. Use when a launch, drop, restock or spend increase is about to go live and the cost of finding a gap afterwards is high. Works from a brief plus screenshots, so it needs no exports.
---

# Launch Readiness Check - E-commerce

## Use this skill when

Something is about to go live and the cost of finding a gap afterwards is high.

Common requests:

- "We launch Thursday. What's not ready?"
- "Restock drops Monday, check everything."
- "We're tripling spend next week. Are we safe?"
- "Give me a go/no-go."

## Required input

Minimum useful input:

- What is launching, when, and the expected traffic or spend.
- Product page URLs or screenshots for the launch items.
- Stock position for the launch SKUs.

Recommended additional input:

- Feed or catalog status for the launch items.
- Tracking and conversion event status.
- Email and SMS flows scheduled around the launch.
- Support coverage and canned responses.
- Shipping and returns policy for launch items, including pre-order rules.
- Margin position at the planned discount or price.
- Rollback plan and who can execute it.

## Before analysis

1. Establish the launch date, the traffic peak expectation, and who owns the go decision.
2. Establish the single failure that would hurt most in this specific launch, and check it first.
3. Confirm what can still be changed before launch and what is already locked. A finding on something locked is a contingency plan, not a fix.
4. Confirm whether this is a hard launch or a staged one, since staging changes the risk profile of every item below.

## Analysis workflow

1. Walk the eight readiness layers in order and mark each ready, at risk, or blocked:
   - stock and fulfilment capacity, including the oversell scenario
   - product page: clarity, proof, objections, delivery promise, mobile
   - checkout: payment methods, discount mechanic tested, promo code live and scoped
   - feed and catalog: availability, price, images, identifiers accurate for the launch items
   - tracking: purchase event fires, values correct, no duplicate counting
   - lifecycle: launch email and SMS scheduled, back-in-stock and abandoned flows not conflicting
   - support: expected question themes have answers, coverage matches the peak
   - margin: the planned price and discount survive fees, shipping, and expected returns
2. For each layer, name what has actually been verified and what is only assumed. Assumed is not ready.
3. Test the discount or promo mechanic end to end before launch, including the edge cases: stacking, minimum thresholds, excluded SKUs, and expiry.
4. Model the oversell case explicitly: what happens if demand is three times the plan and stock runs out mid-campaign.
5. Produce a go, go-with-conditions, or hold verdict with the conditions named and owned.
6. Define the first-hour and first-day watch list, and the rollback trigger for each.

## Decision and evidence standard

Tag every finding with evidence: `url`, `screenshot`, `export`, `inventory_export`, `feed_diagnostics`, `policy`, `margin_csv`, `promo_calendar`, `hypothesis`, or `needs_data`. Full vocabulary: `../references/output-standard.md`.

Rank findings by what they would cost on launch day, not by how hard they are to fix.

A layer nobody verified is `needs_data` and cannot be marked ready. Silence is not a pass.

## Output format

### Go / no-go verdict

Go, go with conditions, or hold. Name the conditions and their owners.

### Readiness board

| Layer | Status | Evidence | Blocker | Owner | Due before launch |
|---|---|---|---|---|---|

### Blockers

Everything that must be closed before go, ordered by launch-day cost.

### Oversell and failure scenarios

What happens if demand overshoots, stock runs out, or tracking breaks, and what the response is.

### Watch list and rollback

| Signal | Where to look | Threshold | Action |
|---|---|---|---|

### Missing data

List every layer nobody could confirm before the deadline, with the person who would have known. That list is the real risk register for launch day, and it is more useful than the layers that passed.

## Example input and output

Input:

- launch brief with date and planned spend
- launch product URLs
- stock position
- flow schedule and promo code details

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Launch promo code stacks with the existing welcome code, taking two SKUs below cost | `screenshot`, `margin_csv` | critical | high | margin | XS | do_now |
| Back-in-stock flow will fire against the same list as the launch email on the same morning | `export` | medium | high | retention/support_load | S | do_now |

What not to do yet: mark tracking ready because it worked last month. Verify a test purchase on the launch items.

## Guardrails

- Do not mark a layer ready on assumption. Unverified is `needs_data`.
- Do not give a go verdict while a critical blocker is open, even under time pressure.
- Do not fix anything yourself during the check. The point is a list the owner can act on before the deadline, and an unannounced fix on launch morning is how two people change the same thing twice.
- Do not promise launch performance.
- Do not skip the oversell scenario because it feels optimistic. It is the most common launch failure.
