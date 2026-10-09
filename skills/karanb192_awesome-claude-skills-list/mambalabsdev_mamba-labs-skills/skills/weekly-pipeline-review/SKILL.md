---
name: weekly-pipeline-review
description: |
  Run a weekly pipeline review that finds the deals that are quietly dying rather than admiring the big ones. Use for a weekly sales review, forecasting, or when someone asks which deals to focus on this week.
license: MIT
metadata:
  category: small-business-ops
  tags: [crm_operations_pack, small_business_operations, small_business_ops]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Weekly Pipeline Review

## What this does

Pipeline reviews spend their time on the largest deals, which are usually the ones already getting attention. The deals that decide the quarter are the ones that stopped moving three weeks ago and nobody noticed. This skill sorts by movement and staleness first, and asks one specific question per deal instead of a general update.

## When to use it

- weekly pipeline review
- which deals should I focus on
- forecast this week
- sales review agenda
- what is stuck

## Inputs

- **deals**: open deals with stage, amount, close date and last activity
- **cycle**: the normal time in each stage
- **capacity**: how many deals can actually get attention this week

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Sort by days since last activity, not by amount. The stale list is the agenda.
2. Flag every deal past the normal time in its stage, and treat that as the default state rather than an exception. Most pipelines have more of these than anyone expects.
3. Flag close dates that have moved more than once. A date that has slipped twice will slip again, and the forecast should reflect that rather than the latest date.
4. For each flagged deal, write the one question that would resolve it. Not an update request, a specific question whose answer changes what happens next.
5. Cut the list to capacity. A review that flags forty deals when five can be worked is a list, not a plan.
6. Separate the forecast from the review. The forecast is what will close; the review is what to do this week, and mixing them makes both worse.
7. Name the deals to close out. Ending a dead deal is a result, and pipelines that never shrink are not forecasts.

## Output

The staleness sorted list, the stage overrun flags, the slipped date flags, one question per flagged deal, the capacity cut, and the close out list.

## Quality bar

- The list is sorted by staleness, not by amount
- Deals with twice slipped close dates are flagged and the forecast reflects the pattern
- Each flagged deal carries one specific question, not an update request
- The working list is cut to stated capacity
- A close out list is produced

## Related skills

- `lead-lifecycle-designer`
- `deal-attribution-audit`
- `monday-morning-brief`

Ships in the **small-business-operations**, **crm-operations-pack** packs.
