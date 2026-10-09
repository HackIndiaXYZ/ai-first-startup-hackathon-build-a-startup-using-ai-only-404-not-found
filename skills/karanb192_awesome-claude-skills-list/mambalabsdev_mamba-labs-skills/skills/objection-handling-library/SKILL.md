---
name: objection-handling-library
description: |
  Build an objection library from the replies you actually received, with a tested response per objection. Use when the same objections keep coming back, when onboarding a new rep, or when someone asks how to handle a specific pushback.
license: MIT
metadata:
  category: sales-enablement
  tags: [agency_delivery, cold_email_system, sales_enablement]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Objection Handling Library

## What this does

A generic objection list is a list of objections other companies get. The useful library is built from your own replies, ranked by how often each objection appears and how often it kills the deal, because those two are different and the second is what decides where to spend the effort.

## When to use it

- handle this objection
- we keep hearing the same pushback
- onboard a new rep
- objection library
- what do I say when they say

## Inputs

- **replies**: the negative and hesitant replies you have received
- **outcomes**: what happened after each one
- **offer**: what you sell and its real limits

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`
- `VOICE.md`
- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Cluster the replies by underlying objection, not by wording. No budget and not a priority are the same objection said two ways, and no time usually means neither.
2. Rank by frequency and by kill rate separately. A common objection that rarely kills a deal needs a short answer; a rare one that always kills it needs a real one.
3. Separate the objections that are real constraints from the ones that are polite exits. A real constraint can be answered; a polite exit is answered by leaving well.
4. Write one response per objection that concedes the true part first. A response that argues with the true part loses the reader in the first sentence.
5. Attach the proof each response needs, and mark the ones where no proof exists yet, because those are product or marketing gaps rather than script gaps.
6. Test against the outcomes you have. If a response has never been used, label it untested rather than shipping it as a best practice.
7. Keep the library short enough to be remembered. Five objections held in a rep's head beat twenty in a document.

## Output

The clustered objection list with frequency and kill rate, the response per objection with its concession, the proof needed, the untested flags, and the short list a rep should memorize.

## Quality bar

- Objections are clustered by cause, not by wording
- Frequency and kill rate are reported separately
- Every response concedes the true part before answering
- Responses with no supporting proof are flagged as gaps rather than shipped
- Untested responses are labeled untested

## Related skills

- `reply-classifier-router`
- `competitor-battlecard`
- `win-loss-analysis`

Ships in the **cold-email-system**, **agency-delivery** packs.
