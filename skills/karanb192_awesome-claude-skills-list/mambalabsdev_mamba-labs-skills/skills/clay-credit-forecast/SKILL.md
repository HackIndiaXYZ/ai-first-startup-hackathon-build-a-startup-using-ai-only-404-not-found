---
name: clay-credit-forecast
description: |
  Forecast how far a Clay credit balance goes across a month of planned builds, and say which build to cut when it does not reach. Use when someone asks whether they have enough credits, how to plan a month of Clay work, or which campaign to drop on a fixed budget.
license: MIT
metadata:
  category: clay-builds
  tags: [agency_delivery, clay_builds, clay_operator]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Clay Credit Forecast

## What this does

Credit balances are consumed by builds nobody priced. This skill takes the planned work for a period, prices each build at realistic pass rates, and produces a burn forecast with the date the balance runs out. When the plan exceeds the balance it names the build to cut and what that costs in pipeline, rather than trimming every build a little.

## When to use it

- do I have enough Clay credits
- plan a month of Clay work
- which campaign should I drop
- credit burn forecast
- Clay capacity planning

## Inputs

- **balance**: current credit balance and renewal date
- **plan**: the builds planned for the period with row counts
- **history**: actual credits per row from past builds if available

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Price each planned build per row using history where it exists and a stated assumption where it does not. Mark which is which.
2. Multiply by planned volume, apply gate pass rates, and sum.
3. Compare against the balance and produce the exhaustion date at the planned pace.
4. If the plan exceeds the balance, rank the builds by contacts per credit, not by credits. The cheapest build is not the most efficient one.
5. Recommend a whole build to cut or defer rather than shrinking every build, because a half sized campaign has the same fixed setup cost and less output.
6. State what the cut costs in expected contacts so the decision is priced.

## Output

A build by build forecast table, the exhaustion date, and a ranked cut list with the pipeline cost of each cut.

## Quality bar

- Every per row cost is labeled as measured or assumed
- The exhaustion date is derived, not estimated in words
- Cut recommendations are whole builds
- The cost of each cut is expressed in expected contacts

## Related skills

- `clay-cost-audit`
- `clay-conditional-gates`
- `clay-people-search-workbook`

Ships in the **clay-operator**, **agency-delivery** packs.
