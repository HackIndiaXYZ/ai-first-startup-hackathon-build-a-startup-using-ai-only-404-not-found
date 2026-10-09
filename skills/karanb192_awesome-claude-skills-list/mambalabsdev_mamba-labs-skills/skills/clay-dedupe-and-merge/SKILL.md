---
name: clay-dedupe-and-merge
description: |
  Deduplicate and merge people or company rows across Clay tables without losing enrichment or double counting a person. Use when merging lists, importing a second source into an existing table, deduping a people pool, or deciding which record wins on a conflict.
license: MIT
metadata:
  category: clay-builds
  tags: [agency_delivery, clay_builds, clay_operator]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Clay Dedupe And Merge

## What this does

Merging two lists is easy. Merging them without losing the enrichment already paid for, and without counting the same person twice under two email addresses, is the part that goes wrong. This skill sets the match key, the precedence rule, and the audit that proves the merge did not silently drop rows.

## When to use it

- merge two Clay lists
- dedupe my people pool
- import a second source into this table
- which record wins
- am I double counting people

## Inputs

- **tables**: the tables or lists being merged and their row counts
- **key**: candidate match keys available on both sides
- **precedence**: which source is more trusted, and on which fields

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Pick the match key by uniqueness on your own data, not by intuition. Email is unique per address, not per person. LinkedIn URL is unique per person. Domain is unique per company only after normalization.
2. Normalize before matching: lowercase, strip protocol and trailing slash from URLs, strip the www prefix, strip plus addressing from emails.
3. Count rows before the merge on both sides, and count distinct keys. The gap between them is the internal duplication you are about to inherit.
4. Set field level precedence, not record level. The newer record usually wins on job title and the older one usually wins on verified email.
5. Preserve enrichment. A field that is populated on one side and blank on the other takes the populated value regardless of precedence.
6. After the merge, count again. Rows in, rows out, distinct keys, and rows where a populated field became blank. That last count must be zero.

## Output

The match key with its uniqueness measured, the normalization steps, the precedence table by field, and the before and after audit counts.

## Quality bar

- Match key uniqueness is measured on real rows, not assumed
- Normalization is applied to both sides identically
- Precedence is set per field
- The post merge audit includes a count of fields that went from populated to blank, and that count is zero

## Related skills

- `clay-build-gate`
- `crm-dedupe-plan`
- `people-pool-builder`

Ships in the **clay-operator**, **agency-delivery** packs.
