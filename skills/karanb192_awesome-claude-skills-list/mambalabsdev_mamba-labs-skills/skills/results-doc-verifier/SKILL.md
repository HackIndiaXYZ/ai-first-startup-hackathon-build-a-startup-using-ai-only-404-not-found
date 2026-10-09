---
name: results-doc-verifier
description: |
  Check a results write up for claims that were asserted rather than verified, before anyone acts on it. Use when reviewing a report, before sending results to a client, or when a document says something worked.
license: MIT
metadata:
  category: knowledge-ops
  tags: [agency_delivery, knowledge_ops, knowledge_ops_pack]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Results Document Verifier

## What this does

The failure in results documents is not lying, it is asserting. A claim that a fix worked, backed by a test that could not have failed, reads exactly like a verified claim. This skill checks each claim against its evidence and asks the one question that separates them: could this check have come out the other way.

## When to use it

- review this report
- check these results before I send them
- did this actually work
- verify this write up
- results review

## Inputs

- **document**: the results write up
- **evidence**: what was actually run or measured

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:


If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Extract every claim as a separate line. A paragraph containing four claims will be reviewed as one, which is how three of them get through.
2. For each claim, find the evidence. Not the reasoning, the evidence: a count, an output, a measurement, a run.
3. Ask the discriminating question per claim: could the check have failed. A test that passes on both the fixed and the unfixed system proves nothing and is the most common defect in results documents.
4. Check that numbers were read after the last write, not before, since a count taken mid run is a different number.
5. Flag every claim that rests on an absence: nothing broke, no errors appeared, nobody complained. An absence is only evidence if something was watching.
6. Flag comparisons against a baseline that was not measured, which is where percentage improvements usually come from.
7. Return the claims in three buckets: verified, asserted, and unverifiable as written, and say for the second bucket what evidence would move it to the first.

## Output

The claim by claim table with evidence, the discriminating question result, and the three bucket classification with the missing evidence named per asserted claim.

## Quality bar

- Every claim is extracted separately
- Each claim is tested with could this check have failed
- Claims resting on an absence are flagged
- Unmeasured baselines are flagged
- Asserted claims name the evidence that would verify them

## Related skills

- `knowledge-write-discipline`
- `work-order-writer`
- `friction-log-to-rules`

Ships in the **knowledge-ops-pack**, **agency-delivery** packs.
