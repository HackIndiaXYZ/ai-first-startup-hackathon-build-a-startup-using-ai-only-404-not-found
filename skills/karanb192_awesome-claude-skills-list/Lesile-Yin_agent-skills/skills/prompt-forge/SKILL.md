---
name: prompt-forge
description: >-
  Forge vague natural-language requests into precise, engineering-grade prompts
  using the CRAFT framework (Context, Role, Action, Format, Tests). Use when a
  user's requirement is ambiguous, causes rework, or needs to be handed to
  another AI agent or teammate. Works for coding, writing, and analysis tasks.
---

# Prompt Forge

Turn fuzzy intent into a prompt that an agent (or a human) can execute on the
first try. A forged prompt is not longer for the sake of length — it is dense
with constraints that remove rework.

## When to use

- The request contains vague quantifiers ("better", "clean", "a few", "optimize").
- The request hides assumptions (stack, environment, audience, deadline).
- The output will be consumed by another agent/session with no shared context.
- A previous attempt at the same task produced a wrong-shaped result.

## Workflow

### Step 1 — Intake (extract, don't interrogate)

Read the raw request and write down, privately:

1. The **deliverable** (what noun will exist when we're done?).
2. The **actor** (who executes it, who consumes the result?).
3. Every **implicit assumption** you had to make to understand it.

### Step 2 — Clarify (max 3 questions, batched)

Ask at most three questions, in one batch, and only about things that change
the deliverable's shape. Never ask what you can reasonably default.
Mark each default you choose so the user can veto it.

Good question: "Should the script run on CI (Linux) or your Mac?"
Bad question: "Do you have any other requirements?"

### Step 3 — Forge (apply CRAFT)

Rewrite the request into the CRAFT template. See
`references/craft-framework.md` for the full checklist per element.

```markdown
## Context
<current state, environment, constraints, relevant history — 2-5 bullets>

## Role
<who the executor should be; expertise level and stance>

## Action
<numbered task breakdown; each step independently verifiable>

## Format
<exact output shape: file types, structure, length, language, style>

## Tests
<acceptance criteria as checkable statements; edge cases included>
```

### Step 4 — Verify (the 5-second test)

Before delivering, re-read the forged prompt and answer:

- Could two different engineers produce two different deliverables from it?
  If yes, add the missing constraint.
- Is any bullet unfalsifiable ("high quality", "user-friendly")? Replace it
  with a measurable criterion or delete it.
- Does Tests cover the failure modes that caused previous rework?

Deliver the forged prompt in a fenced block, followed by a one-line summary of
the defaults you assumed.

## Anti-patterns (never do these)

- Padding with politeness or motivation paragraphs — they burn tokens and add
  zero constraint.
- Repeating the user's words back before the template. Start at `## Context`.
- Inventing requirements the user never implied. Defaults must be flagged.
- Forging a 40-line prompt for a task that needs 6 lines. CRAFT scales down:
  a trivial task may have a one-line Context and two Tests.

## Output contract

The forged prompt is the deliverable. Do not also execute it unless the user
explicitly asks ("forge and run"). See `examples/before-after.md` for three
worked transformations.
