---
name: knowledge-write-discipline
description: |
  Write to a knowledge base so the document is findable later and provably stored. Use when saving a document, writing up a result, or when notes keep getting lost or duplicated.
license: MIT
metadata:
  category: knowledge-ops
  tags: [knowledge_ops, knowledge_ops_pack]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Knowledge Write Discipline

## What this does

Two things go wrong with knowledge bases and both are silent. Documents are written under names nobody will search for, and writes appear to succeed while storing nothing. This skill fixes the naming, and requires a read back that proves the content is there, because a write that returns success is not evidence.

## When to use it

- save this to the knowledge base
- write up this result
- my notes keep getting lost
- document this properly
- where should this go

## Inputs

- **content**: what is being saved
- **kind**: whether it is a rule, a result, a reference or a handoff
- **existing**: whether a document on this subject already exists

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:


If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Search before writing. A near duplicate is worse than no document, because a reader who finds the older one does not know a newer one exists.
2. Name for the search that will find it, which is usually the problem, the subject and the date, not the project code that made sense on the day.
3. Decide update or create. If a document on the subject exists, updating it whole is almost always right; appending produces documents that contradict themselves in the middle.
4. Write the top of the document as the answer. A reader who opens it should get the finding in the first lines, not the method.
5. State what supersedes what, in the document, so an old document being read cannot mislead.
6. Write, then read the document back and compare it against what you sent, by length and by content. A write that reports success and stores nothing is a real failure mode and only a read back catches it.
7. Record the identifier where the next person will look for it, not only in the document itself.

## Output

The document, the read back comparison with both lengths, the supersession note, and the pointer recorded where it will be found.

## Quality bar

- A search for existing documents runs before writing
- The read back compares content and length against what was sent
- Update versus create is a stated decision
- The document opens with the finding, not the method
- Supersession is stated in the document

## Related skills

- `results-doc-verifier`
- `handoff-writer`
- `knowledge-base-classification`

Ships in the **knowledge-ops-pack** pack.
