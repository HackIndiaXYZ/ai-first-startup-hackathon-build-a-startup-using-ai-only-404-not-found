---
name: orchestrating-subagents
description: Use when about to spawn one or more subagents, agent teams, or a workflow — a single delegated search, a parallel fan-out, or a repeated batch — and whenever choosing which model a delegated task runs on instead of letting it inherit yours. Also use when writing or editing a .claude/agents definition, when a delegated run hit a rate limit or cost more than expected, or when a subagent came back after far more or far fewer turns than the work warranted.
---

# Orchestrating Subagents

## Overview

Delegation has two dials — **which model**, **how much reasoning effort** — and both inherit the orchestrator's by default. Inheriting is a decision, not a neutral default: it puts the most expensive model on the cheapest work. The orchestrator stays strong; the workers rarely need to be.

## The Dispatch Contract

A one-off `Agent` call takes exactly these four. All four filled, every time:

```
subagent_type:  general-purpose | Explore | Plan | <custom>
model:          haiku | sonnet | opus | fable
description:    3-5 words
prompt:         self-contained; states output format and where to write it
```

**`effort` is not a parameter of the `Agent` tool.** Writing it there does nothing. Effort is set where it exists:

| Where | How |
|---|---|
| `.claude/agents/*.md` | `effort:` in the frontmatter, alongside `model:` |
| Workflow stage | `opts.effort` next to `opts.model` |
| One-off `Agent` call | no field — it inherits the session. Shape the work in the prompt instead: "single pass, do not second-guess" for cheap work, "work section by section" for thorough work. |

Recurring role → give it a definition file and set both dials there.

## Model × Effort

| The delegated work is… | model | effort |
|---|---|---|
| Filling a fixed schema, classifying, labeling, renaming, summarizing one file | `haiku` | `low` |
| Locating code, web research, reading with bounded judgment | `sonnet` | `medium` |
| Multi-file implementation, debugging, correctness review | `sonnet` | `high` |
| Architecture, design, synthesis, adversarial verification | `opus`/`fable` | `high`/`xhigh` |

**The prompt sets the tier, not the topic.** A closed spec — schema pasted in, output path given, success criterion stated — is what makes `haiku` sufficient. Prose-described work takes `sonnet` as the floor: a model that needs 3 turns where another needs 1 costs more, not less.

**Checkable output is answered by validation, not by tier.** Schema, enum, path, count — validate after and let the cheap tier run. Spend on a bigger model when the output is a judgment you cannot check mechanically. Size is its own risk: a huge input can thin out attention even when the schema is closed, and a sparse-but-valid result passes validation — that is a reason to raise the tier for that item alone.

## Reading the Result

Each agent returns `tool_uses`, `subagent_tokens`, `duration_ms`.

| Signal | Means | Do |
|---|---|---|
| Many turns on simple work | under-tiered | raise tier for the rest |
| ~2 calls on work you thought was hard | over-tiered | lower tier for the rest |
| Died on a rate limit | tier too high for the volume | lower tier; **check the artifact on disk before relaunching** |
| High tokens, thin result | mis-scoped prompt | tighten the spec, then re-dispatch |

Correct what you have **not yet launched**. Never kill agents in flight — a dying agent often wrote its artifact first, and killing it discards paid work.

Above ~8 agents in one batch, state the count, each model, and rough spend, then proceed.

## Common Mistakes

**❌ Omitting `model` because the work "deserves quality"** → the omission buys the orchestrator's model at the orchestrator's price, not quality. Set the tier and validate the output.
**❌ One tier for the whole batch** → a fan-out mixes mechanical and judgment work. Tier per role.
**❌ Cheapest tier on a prose-described task** → it re-reads and re-asks. Close the spec first, then go cheap.
**❌ Passing `effort` to the `Agent` tool** → silently ignored. Use a definition file, a workflow stage, or shape it in the prompt.
**❌ Relaunching a dead agent blind** → check whether its output file already exists and is valid.

## References

`references/agent-definition.md` — frontmatter fields, scopes, what a subagent loads.
`references/platform-limits.md` — concurrency caps, nesting, allowlist fallback, agent-team cost.
`references/workflows.md` — escalating to a Workflow, per-stage model and effort.
`references/prompt-templates.md` — reusable dispatch prompts by role.
`references/learning-log.md` — recording outcomes and reusing them next batch.

Executing a written plan task-by-task → `superpowers:subagent-driven-development`.
Splitting independent work across agents → `superpowers:dispatching-parallel-agents`.
Choosing `subagent_type` for tool access → `team-composition-patterns`.
