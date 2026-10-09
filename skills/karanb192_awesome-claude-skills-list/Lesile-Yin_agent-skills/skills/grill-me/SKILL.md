---
name: grill-me
description: >-
  Break single-model echo-chamber effects by having one model plan and another
  challenge the plan across up to three rounds. Use when a design is
  self-consistent but untested, when you suspect confirmation bias in a plan, or
  before committing to a large build that only one model has seen.
---

# Grill Me

A plan that survives only its author's scrutiny is untested. grill-me puts the
plan in front of a *different* model whose job is to break it, not bless it.

## When to use

- An architecture or design proposal is internally consistent but unchallenged.
- You have only one model's context on a high-stakes decision.
- A plan keeps "working" in tests but you can't name its failure modes.

## Workflow

### Step 1 — Planner emits the design
Model A (e.g. Claude) produces: the design, the explicit assumptions it rests
on, and the acceptance criteria. No defense yet — just the artifact.

### Step 2 — Challenger attacks
Model B (e.g. Codex) receives the design + assumptions and attacks:
- Assumptions that don't hold under load / edge input / partial failure.
- Failure modes with no mitigation.
- Cheaper alternatives the planner dismissed without evidence.
The challenger may *not* rewrite the design — only test it.

### Step 3 — Planner responds or concedes
Model A addresses each challenge: fix, accept-and-mitigate, or concede the flaw.
Conceded flaws become explicit risks. Repeat ≤ 3 rounds; stop early if the
challenger repeats itself.

### Step 4 — Verdict
Final design + a list of survived vs. refuted challenges + residual risks the
builder must watch. The verdict is the deliverable, not a "looks good".

## Anti-patterns (never do these)

- Letting the challenger become a yes-man — rotate models if it concedes too
  fast.
- Running rounds with no convergence — cap at 3 and summarize the standoff.
- Challenger rewriting the design — that's a second planner, not a grill.
- Grilling a trivial decision — reserve for high-stakes, hard-to-reverse calls.

## Output contract

Return: the final (or standoff) design, a two-column table of challenges
(survived / refuted), and a bulleted residual-risk list. If the two models
cannot converge, say so and hand both views to the human. See
`references/challenge-prompts.md` for the challenger's angle set.
