---
name: token-saviour
description: >-
  Route each sub-task to the cheapest adequate tool across a 4-layer routing
  table (serena / rtk / caveman / Ponytail), cutting overall token spend by
  ~70%. Use when an agent loop's context is ballooning, when choosing between
  heavy and light tooling for a sub-task, or when budgeting a long-running job.
---

# Token Saviour

Token discipline is a routing problem, not a willpower problem. token-saviour
picks the lightest tool that can still do the job, then compresses what must be
sent. It is the operational layer beneath token-warden's budget accounting.

## When to use

- Before spinning up an expensive coding agent for a small, well-scoped edit.
- When a conversation history exceeds a token threshold and must be trimmed.
- When deciding which model/agent should own a sub-task.
- When a task can be done by a formatter, a linter, or a grep instead of a chat.

## Workflow

### Step 1 — Classify the sub-task
Tag it on two axes: **token-cost sensitivity** (how much context it drags) and
**adequacy floor** (minimum capability needed). A rename is high-sensitivity,
low-floor; an architecture decision is high-sensitivity, high-floor.

### Step 2 — Consult the 4-layer routing table
See `references/routing-table.md` for the full matrix. In short:
- **Layer 1 — serena**: structural/semantic code ops (symbol rename,
  find-usages) that a language server does cheaper than an LLM.
- **Layer 2 — rtk** (regex/toolkit): deterministic text transforms, search,
  bulk edits a script handles without a model.
- **Layer 3 — caveman**: compress any context *before* it reaches a model.
- **Layer 4 — Ponytail** (heavy agent): only when lower layers cannot meet the
  adequacy floor.

### Step 3 — Compress inputs, cap history
Run Layer 3 on everything that crosses into Layer 4. Cap rolled-up history to
the last N meaningful turns; archive the rest to a retrievable note, not the
live context.

### Step 4 — Measure and report
After the sub-task, report the delta vs. the naive "send everything to the heavy
agent" baseline. A good call shows savings; a bad call shows where the floor was
missed.

## Anti-patterns (never do these)

- Routing everything to Layer 4 "just to be safe" — that is the bug it fixes.
- Compressing load-bearing context to hit a number — adequacy first, thrift
  second.
- Skipping the measurement — unseen savings aren't savings.
- Treating the table as fixed — re-tune thresholds per project.

## Output contract

Return a routing decision: chosen layer(s), the estimated token delta vs.
baseline, and one line of rationale. If no layer meets the adequacy floor, say
so explicitly and escalate rather than guessing.
