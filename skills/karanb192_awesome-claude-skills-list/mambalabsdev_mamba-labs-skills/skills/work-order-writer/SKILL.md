---
name: work-order-writer
description: |
  Write a work order an agent or a contractor can execute end to end without asking a question. Use when delegating a task, briefing an agent, writing a spec, or when work keeps coming back wrong.
license: MIT
metadata:
  category: agency-operations
  tags: [agency_delivery, agency_operations, knowledge_ops_pack]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Work Order Writer

## What this does

Work comes back wrong when the brief specified the output but not the done state, the constraints, or what to do at a fork. This skill writes the four sections that remove the ambiguity, and the one that most briefs omit entirely: the halt conditions, which say when to stop and ask rather than guess.

## When to use it

- write a work order
- brief this task
- delegate this properly
- the work keeps coming back wrong
- write a spec for an agent

## Inputs

- **goal**: what must be true when this is finished
- **context**: where the work happens and what already exists
- **limits**: budget, time, and what must not be touched

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Write the done state as a condition that can be checked by someone who was not involved. Not improve the thing, but the thing measures above a number, verified this way.
2. Write the steps in order, with each one producing something the next one consumes. A step that produces nothing is a hope.
3. Write the constraints as prohibitions, not preferences. What must not be changed, what must not be published, what must not be deleted.
4. Write the halt conditions: the situations where the executor should stop and ask rather than choose. This is the section that separates a brief that works from one that produces confident wrong work.
5. Name where the output goes and in what form, because output that lands in the wrong place is close to output that does not exist.
6. Include the verification: how the executor proves it worked, and make it a check that could fail. A verification that cannot fail proves nothing.
7. Say what supersedes what, if this replaces an earlier brief, so nobody executes the old one.

## Output

A work order with goal, done state, ordered steps, constraints, halt conditions, output location, and a verification that could fail.

## Quality bar

- The done state is checkable by an uninvolved person
- Halt conditions are present and specific
- Constraints are written as prohibitions
- The verification is a check capable of failing
- Superseded briefs are named

## Related skills

- `results-doc-verifier`
- `knowledge-write-discipline`
- `friction-log-to-rules`

Ships in the **agency-delivery**, **knowledge-ops-pack** packs.
