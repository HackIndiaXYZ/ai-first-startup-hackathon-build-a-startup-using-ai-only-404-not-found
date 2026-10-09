---
name: subject-line-lab
description: |
  Generate and screen cold email subject lines against truncation, spam triggers and the preview text they create. Use when someone needs subject lines, has low open rates, or wants to test subject variants.
license: MIT
metadata:
  category: outbound-email
  tags: [cold_email_system, outbound_email]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Subject Line Lab

## What this does

Subject lines are judged on a phone, truncated, next to preview text pulled from the first line of the body. Most subject line advice ignores all three. This skill generates variants, then screens each against character truncation on the common clients, against filter triggers, and against the preview text it will actually appear beside.

## When to use it

- write subject lines
- my open rates are low
- test subject variants
- improve this subject line
- subject line ideas

## Inputs

- **email**: the body the subject sits on
- **audience**: who receives it
- **history**: past subject lines with their open rates, if any

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`
- `VOICE.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Generate variants across four distinct shapes: the specific observation, the direct question, the two word fragment, and the plain statement of the thing. Not four wordings of one shape.
2. Screen for truncation. Show each variant cut at 30 characters and at 45, which is roughly where mobile and desktop clients stop, and reject any variant whose meaning dies at 30.
3. Screen for filter triggers: currency symbols, exclamation marks, all caps words, and the specific phrases that read as promotional.
4. Render the preview text each variant will produce, which is the first line of the body. If the subject and the preview say the same thing, one of them is wasted.
5. Reject anything that promises what the body does not deliver. An open earned by a mismatch costs a reply.
6. Rank by expected performance and say what each variant is testing, so a test result means something.

## Output

A variant table with the 30 and 45 character truncations, the filter flags, the preview text pairing, and what each variant tests.

## Quality bar

- Variants span four distinct shapes, not four wordings
- Every variant is shown truncated at 30 and 45 characters
- Preview text is rendered beside each subject
- Each variant states what it is testing

## Related skills

- `cold-email-structure-checker`
- `outbound-copy-humanizer`
- `cold-email-sequence-system`

Ships in the **cold-email-system** pack.
