---
name: clay-cost-audit
description: |
  Price a Clay table before it runs and find the columns that are burning credits for no return. Use when someone asks what a Clay build will cost, why their credits are gone, how to cut Clay spend, or wants a run before a full table ramp priced out.
license: MIT
metadata:
  category: clay-builds
  tags: [clay_builds, clay_operator]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Clay Cost Audit

## What this does

Most Clay overspend comes from one pattern: an expensive column running on every row when it only needed to run on the rows that passed a cheap filter. This skill prices the table column by column, finds the columns with no run condition, and rewrites the run order so the expensive work sits behind the cheap work.

## When to use it

- what will this Clay table cost
- my Clay credits are gone
- how do I cut Clay spend
- price this Clay build
- credit optimization in Clay

## Inputs

- **columns**: the column list with the provider or action behind each
- **rows**: current row count and the expected full volume
- **prices**: credit cost per column run, from the Clay column preview

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. List every column with a per run cost. Columns with zero cost are still listed because they are the candidates for run conditions.
2. Compute cost per row as the sum of every column that runs unconditionally.
3. Flag every paid column with no run condition. That is the finding, and it is usually most of the spend.
4. For each flagged column, name the cheap column that should gate it and the condition to write.
5. Re price the table with the gates applied, using a realistic pass rate for each gate rather than an optimistic one.
6. Present both numbers side by side, at the 10 row ramp, the 100 row ramp, and full volume.

## Output

A two column table, before and after, priced at three volumes, plus the list of run conditions to add in the order that saves the most first.

## Quality bar

- Every paid column appears in the table with a unit cost
- The pass rate used for each gate is stated, not implied
- Savings are given in credits and in the currency the user asked about
- The recommendation orders fixes by money saved, not by column order

## Related skills

- `clay-build-gate`
- `clay-conditional-gates`
- `clay-waterfall-designer`

Ships in the **clay-operator** pack.
