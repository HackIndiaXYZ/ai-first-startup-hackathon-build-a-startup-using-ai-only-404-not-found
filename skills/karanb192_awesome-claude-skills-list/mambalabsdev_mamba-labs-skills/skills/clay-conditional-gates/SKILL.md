---
name: clay-conditional-gates
description: |
  Write the run conditions that stop expensive Clay columns from firing on rows that will never qualify. Use when someone wants to skip enrichment for non ICP rows, gate a waterfall, add a run condition, or stop paying to enrich junk.
license: MIT
metadata:
  category: clay-builds
  tags: [clay_builds, clay_operator]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Clay Conditional Gates

## What this does

A run condition is the cheapest performance work in Clay and the most commonly skipped. This skill turns a qualification rule stated in plain language into the exact condition expression, placed on the right column, in the right order, with the pass rate estimated so the saving is known before the run.

## When to use it

- add a run condition
- skip enrichment for non ICP rows
- gate this column
- only enrich rows that
- stop paying to enrich junk

## Inputs

- **rule**: the qualification rule in plain language
- **available**: which columns already exist and are cheap enough to gate on
- **target**: the expensive column that should be gated

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Restate the rule as a boolean over columns that already exist. If it needs a column that does not exist yet, say so and place that column first in the order.
2. Prefer a deterministic cheap column over a model judgment for the gate. A gate that costs as much as the column it guards saves nothing.
3. Write the condition expression, and write the negative case explicitly so blank values do not silently pass.
4. Estimate the pass rate from the user's own data if they have any rows, from a stated assumption if they do not.
5. Order multiple gates so the highest rejection rate runs first.
6. State what happens to rejected rows: left blank, tagged, or moved. Blank is a choice, not a default.

## Output

The condition expression per column, the placement in the run order, the estimated pass rate, and the resulting cost change.

## Quality bar

- Blank and null inputs are handled explicitly in every condition
- No gate costs more per row than the column it guards
- Gates are ordered by rejection rate
- The fate of rejected rows is stated

## Related skills

- `clay-cost-audit`
- `clay-build-gate`
- `clay-waterfall-designer`

Ships in the **clay-operator** pack.
