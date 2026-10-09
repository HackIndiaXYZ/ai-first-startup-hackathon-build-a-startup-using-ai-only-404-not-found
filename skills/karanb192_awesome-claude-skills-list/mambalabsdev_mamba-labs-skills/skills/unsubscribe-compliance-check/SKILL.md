---
name: unsubscribe-compliance-check
description: |
  Check that outbound campaigns carry a working unsubscribe path and that opt outs land somewhere that actually stops the next send. Use before launching, during a compliance review, or when someone asks what an outbound email legally needs.
license: MIT
metadata:
  category: deliverability
  tags: [cold_email_system, deliverability]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Unsubscribe Compliance Check

## What this does

An unsubscribe link that renders is not an unsubscribe path. The path has three parts, and the one that breaks is always the third: the link, the confirmation, and the write that reaches the suppression layer before the next scheduled send. This skill tests all three end to end rather than checking that the footer exists.

## When to use it

- do my emails need an unsubscribe
- compliance review of outbound
- test my opt out
- unsubscribe handling
- what does an outbound email legally need

## Inputs

- **campaign**: the sequence and its footer
- **path**: where an unsubscribe click goes and what it writes
- **suppression**: the suppression layer it should reach

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Check the footer: a physical postal address, a clear identification of the sender, and an opt out that does not require a reply.
2. Check that the opt out works without a login and without a reply, because a link that asks for either is not an opt out.
3. Click it end to end on a seed address and confirm the write reaches the suppression layer, not just a confirmation page.
4. Check timing: the write must take effect before the next scheduled step for that contact, which for a fast sequence can be under a day.
5. Check every channel. An email opt out that does not stop a social touch is not honored, whatever the letter of the rule says.
6. Check the reply path: somebody who replies asking to stop must be treated as an opt out even though no link was clicked, so a human or a classifier has to be catching that.
7. Report each of the six as pass or fail with the evidence.

## Output

A six row check table with evidence per row, then a single compliant or not compliant verdict, then the fixes.

## Quality bar

- The opt out is tested end to end on a seed, not inspected in the template
- The write is confirmed at the suppression layer
- Timing against the next scheduled step is checked
- The reply based opt out path is checked, not only the link

## Related skills

- `suppression-architect`
- `reply-classifier-router`
- `wave-launch-precheck`

Ships in the **deliverability**, **cold-email-system** packs.
