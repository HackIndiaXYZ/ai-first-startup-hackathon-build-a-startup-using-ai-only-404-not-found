---
name: monday-morning-brief
description: |
  Produce the weekly operating brief: what moved, what is at risk, and the three things that need a decision. Use when someone wants a Monday update, a weekly business summary, or a recurring brief across their tools.
license: MIT
metadata:
  category: small-business-ops
  tags: [small_business_operations, small_business_ops]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Monday Morning Brief

## What this does

A weekly brief is only read if it is short and if it is honest about what it could not see. This skill pulls from whatever is connected, reports movement rather than levels, names the decisions that are waiting, and states plainly which sources were unavailable rather than quietly leaving them out.

## When to use it

- Monday morning brief
- weekly business summary
- what happened last week
- weekly update across my tools
- recurring operating brief

## Inputs

- **sources**: which systems are connected: calendar, mail, CRM, finance, project tracker
- **period**: the week being covered
- **focus**: what the reader is accountable for

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Read every connected source for the period and record which ones answered and which did not, before writing anything.
2. Report movement, not levels. Revenue is a level; revenue up on two new customers and down on one churn is movement, and only movement tells you what to do.
3. Separate what happened from what is at risk. The risk section is the reason the brief exists.
4. Name the decisions waiting on the reader, with what each one is blocked on and how long it has been waiting.
5. Cap the brief at one screen. A brief that scrolls is a report and it will not be read on a Monday.
6. State the coverage gaps explicitly at the end. A source that did not answer is not the same as a source with nothing to report, and conflating them is how a brief becomes misleading.
7. Carry forward last week's decisions and say whether each one was made.

## Output

One screen: movement, risks, decisions waiting, last week's decisions and their status, and a coverage line naming any source that did not answer.

## Quality bar

- Sources that did not answer are named, never silently omitted
- Movement is reported rather than levels
- Decisions carry what they are blocked on and how long they have waited
- The brief fits one screen
- Last week's decisions are carried forward with a status

## Related skills

- `weekly-pipeline-review`
- `month-end-narrative`
- `cash-runway-snapshot`

Ships in the **small-business-operations** pack.
