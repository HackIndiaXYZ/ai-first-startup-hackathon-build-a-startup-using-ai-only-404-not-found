---
name: when-not-to-orchestrate
description: Use when about to fan work out to parallel agents, when a user asks to "throw this at a bunch of agents" or parallelize for speed, and before splitting a refactor, rename, migration, or sweep across subagents. Also use when a delegated batch produced inconsistent or conflicting edits, or when deciding whether a task is worth delegating at all rather than doing it in one pass.
---

# When NOT to Orchestrate

## Overview

Fanning out is a bet that the work divides. When it doesn't, parallelism does not just fail to help — it manufactures a class of bug that a single pass cannot produce, because each agent edits a world the others are simultaneously changing.

The instruction to parallelize is not the decision. "Throw this at a bunch of agents so it goes fast" is a request for a *result*, and the fastest route to it is often one pass.

## The Three Gates

Fan out only if **all three** are yes. One "no" means a single pass, or one agent.

| Gate | The question | A "no" looks like |
|---|---|---|
| **Divisible** | Can each piece be finished without seeing another piece's edits? | Rename, signature change, schema migration, dependency bump — the pieces are the *same* change in different files |
| **Closable** | Can each piece's spec be closed — schema, path, success criterion — before dispatch? | "Clean this up", "make it consistent", anything you'd have to answer questions about |
| **Checkable** | Can you verify each result without re-reading everything the others produced? | Correctness only visible in the whole, e.g. "no caller is left on the old name" |

Divisible is the one that gets skipped. Twelve files mentioning one config key look like twelve tasks. They are one task with twelve locations.

## The Overhead That Doesn't Amortize

Every subagent pays a fixed cost before producing anything: its own system prompt, project instructions, and rediscovering context the orchestrator already holds. That cost is per agent and does not shrink with the task.

So the size test is not "how many files" but **how much work per agent after startup**. Twelve one-line edits is twelve startups to save twelve seconds of typing. A `sed` across the repo has one startup and no coordination.

Delegation earns its overhead when a piece involves real reading, real judgment, or real iteration — not when the piece is a substitution you could express as a pattern.

## The Failure You Won't See in the Report

Parallel agents editing coupled files each observe a partially-updated repository. They report success because, locally, they succeeded.

Observed in a control run, verbatim, from an orchestrator that fanned out a 15-file rename:

> "the config.js/services-1–4 agent flagged an 'anomaly' mid-run — it saw other files already renamed that it never touched. That's just the other three parallel agents finishing their edits concurrently, **not an actual issue**."

The coupling surfaced, was recognized, and was dismissed — by the orchestrator that created it. On a rename with a clean grep afterwards, that is harmless. On a change where the halves have to agree — a signature and its callers, a schema and its writers — the same dismissal ships a broken tree with twelve green reports behind it.

Treat "an agent saw a change it didn't make" as evidence the work was not divisible, not as scheduling noise.

## What To Do Instead

- **Mechanical and uniform** → one command. `sed`, codemod, `jscodeshift`, an IDE rename. Then one grep to prove zero occurrences remain.
- **Uniform but needs judgment per site** → one agent, not N. It sees every site and stays consistent with itself.
- **Genuinely independent, closable, checkable** → fan out, and say so.

Then verify globally, once, on the whole tree — never per agent.

## Do Not

**❌ Treat the user's "in parallel" as the specification.** They asked for the outcome. Deliver it the cheapest correct way and say what you did.
**❌ Count files and call it divisibility.** N locations of one change is one task.
**❌ Fan out a rename, signature change, or schema migration.** The pieces must agree, and independent agents cannot agree.
**❌ Dismiss an agent reporting it saw someone else's edit.** That is the coupling reporting itself.
**❌ Accept N green reports as verification.** Each agent verified its slice against a repository that was still moving.

## References

Choosing the model tier once you *have* decided to delegate → `orchestrating-subagents`.
Deciding whether a completed fan-out actually paid off → `measuring-orchestration-cost`.
