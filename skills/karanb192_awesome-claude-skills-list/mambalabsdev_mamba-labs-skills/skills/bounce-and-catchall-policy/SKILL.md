---
name: bounce-and-catchall-policy
description: |
  Decide what to do with catch all domains, role addresses and soft bounces before they cost you a domain. Use when verification returns unknown, when someone asks whether to send to catch all addresses, or when bounce rate is creeping up.
license: MIT
metadata:
  category: deliverability
  tags: [cold_email_system, deliverability]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Bounce And Catch All Policy

## What this does

Verification returns three answers and most teams only plan for two. Valid sends, invalid drops, and unknown, which is mostly catch all domains, is where the decision actually lives. Sending to all of them raises bounce rate; dropping all of them can remove a large share of an enterprise list. This skill sets a policy per class with the arithmetic that justifies it.

## When to use it

- should I send to catch all addresses
- verification returned unknown
- my bounce rate is creeping up
- role addresses
- what do I do with unknown emails

## Inputs

- **results**: verification results with counts per class
- **tolerance**: the bounce rate ceiling you will accept
- **value**: roughly what a reply is worth

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Split the list into valid, invalid, catch all, role address, and disposable. Report the share of the list each class holds, because the decision changes entirely at 5 percent versus 40 percent.
2. Drop invalid and disposable without further thought.
3. For catch all, compute the bounce rate the whole send would carry if a stated share of them bounce, and compare against the tolerance. That arithmetic, not a rule of thumb, decides whether they are included.
4. If catch all is a large share and the tolerance is tight, send them on a separate domain rather than dropping them, so a bounce spike is contained.
5. For role addresses, decide by target. A role address is worthless for a founder persona and often correct for a support or procurement persona.
6. Set the soft bounce rule: how many soft bounces before the address is treated as hard, and where that is recorded.
7. Write the policy down as a rule other people can apply without asking.

## Output

The class split with shares, the bounce arithmetic against the tolerance, the decision per class, the separate domain recommendation if it applies, and the written policy.

## Quality bar

- Each class is reported as a share of the list
- The catch all decision shows the bounce arithmetic
- Role addresses are decided by persona, not by a blanket rule
- The soft bounce threshold is a number and its record location is named

## Related skills

- `clay-waterfall-designer`
- `email-deliverability-audit`
- `suppression-architect`

Ships in the **deliverability**, **cold-email-system** packs.
