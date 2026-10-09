---
name: handoff-writer
description: |
  Write the handoff that lets the next person or the next session continue without re deriving anything. Use when ending a working session, handing a project to someone else, or when context is about to be lost.
license: MIT
metadata:
  category: knowledge-ops
  tags: [knowledge_ops, knowledge_ops_pack]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Handoff Writer

## What this does

A handoff fails when it describes what was done instead of what the next person needs. The reader does not need the history, they need the state, the next action, and the traps. This skill writes those three and refuses to include the narrative, which is the part that makes handoffs too long to read.

## When to use it

- write a handoff
- I am handing this over
- end of session summary
- the next person needs to pick this up
- context is about to be lost

## Inputs

- **state**: what is done, what is half done, and what is untouched
- **next**: the next action and why it is next
- **traps**: what you learned the hard way

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:


If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Open with the current state in three lines: what works now, what is in progress, and what has not been started.
2. Write the next action as something someone could start in ten minutes, with the exact location, command or document it starts from.
3. List the traps: the things that look right and are not, the credentials or access that are needed, and the paths that were tried and failed. The failed paths save the most time and are the most often omitted.
4. Name every file, identifier and location precisely. A handoff that says the config file has cost the reader the whole time saving.
5. State the open questions and who can answer each one.
6. Leave out the narrative entirely. What happened in what order is not useful to the next person and it is what makes handoffs unread.
7. Timestamp it and name what it supersedes, because two handoffs on the same work are worse than one.

## Output

State in three lines, the next action with its starting point, the traps including failed paths, the exact identifiers, the open questions with owners, and a timestamp.

## Quality bar

- The next action is startable in ten minutes and names its starting point
- Failed paths are recorded, not only successes
- Every file and identifier is named exactly
- No narrative section appears
- The document is timestamped and names what it supersedes

## Related skills

- `knowledge-write-discipline`
- `work-order-writer`
- `results-doc-verifier`

Ships in the **knowledge-ops-pack** pack.
