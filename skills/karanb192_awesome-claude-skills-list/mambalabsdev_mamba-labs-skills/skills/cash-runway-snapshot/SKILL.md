---
name: cash-runway-snapshot
description: |
  Work out how many months of cash are left and what actually changes it. Use when someone asks about runway, cash position, whether they can afford a hire, or what happens if a payment is late.
license: MIT
metadata:
  category: small-business-ops
  tags: [small_business_operations, small_business_ops]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Cash Runway Snapshot

## What this does

Runway calculated as cash divided by average burn is wrong in the one direction that matters, because it treats expected income as certain. This skill separates committed inflows from expected ones, models the late payment case, and gives a range with the assumption behind each end of it.

## When to use it

- how much runway do we have
- cash position
- can we afford a hire
- what if a client pays late
- runway calculation

## Inputs

- **cash**: current balance across accounts
- **outflows**: recurring costs and any known one offs
- **inflows**: invoices raised, contracts committed, and pipeline

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:


If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Split inflows into three: received, invoiced and unpaid, and expected but not invoiced. Only the first is cash and the third is not runway.
2. Model outflows from the actual recurring commitments, including the annual ones that fall due inside the window and are the usual surprise.
3. Compute the conservative case from received plus invoiced, with a realistic collection delay applied to invoiced.
4. Compute the expected case with the pipeline included at a stated conversion rate.
5. Report the range with the assumption at each end, never a single number, because a single runway number invites a decision the data does not support.
6. Run the late payment case: the largest single receivable arriving thirty days late, which is the failure mode that actually happens.
7. Say what the earliest action date is, meaning the date by which a decision must be made rather than the date cash runs out.

## Output

The inflow split, the outflow schedule including annual items, the conservative and expected runway with assumptions, the late payment case, and the earliest action date.

## Quality bar

- Expected but uninvoiced income is excluded from the conservative case
- Annual costs falling inside the window are included
- Runway is reported as a range with the assumption at each end
- The late payment case is modeled on the largest single receivable
- An action date is given, distinct from the date cash runs out

## Related skills

- `month-end-narrative`
- `invoice-chaser`
- `monday-morning-brief`

Ships in the **small-business-operations** pack.
