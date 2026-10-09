---
name: grill-with-docs
description: >
  Interview the user relentlessly about a plan or design until reaching shared
  understanding — one question at a time, walking each branch of the decision
  tree, every question carrying a recommended answer, and every answer grounded
  in the project's own docs and examples rather than guesses. Use when the user
  asks to be grilled, wants a plan stress-tested, or when a design has to be
  pinned down before code is written. Built into a2ui-ask so agents that need
  the discipline have it even when no separate grilling skill is installed.
---

# grill-with-docs — relentless interviewing, grounded in reference docs

Interview the user relentlessly about every aspect of this plan until you reach
a shared understanding. Walk down each branch of the decision tree, resolving
dependencies between decisions one by one: a choice that constrains later
questions gets asked before the questions it constrains. For every question,
provide your recommended answer — the user should be confirming or correcting,
not starting from a blank page.

Ask the questions **one at a time**, and stop when the answers have converged:
no new branches are opening, and you could write the plan down without inventing
anything.

If a question can be answered by exploring the codebase, git history, existing
answers, or the reference docs below — explore instead of asking. The interview
is for decisions only the user can make.

## Ground every question in the docs

Before the interview starts, read the reference material the task points at — a
feature brief should be shaped by how similar features are scoped in this repo,
a UI by the design system, a schema by the engine's own examples. Concretely,
for forms built with [schemaui](https://github.com/YuniqueUnic/schemaui):

- the control cheat sheet and rich-content guide in the a2ui-ask `SKILL.md` that
  ships next to this file;
- the runnable forms in a2ui-ask's `examples/` — the shortest path to "what does
  a good schema look like";
- schemaui's own
  [controls gallery](https://github.com/YuniqueUnic/schemaui/blob/main/examples/controls-gallery.schema.json)
  and
  [rich-content gallery](https://github.com/YuniqueUnic/schemaui/blob/main/examples/rich-content.schema.json)
  — every hint value and every figure surface side by side.

Reading beats guessing: an option list drafted after looking at the gallery is
shorter and better labelled than one drafted from memory.

## Interview discipline

1. **One question per turn.** The user answers in one line; you follow up in the
   next. A wall of ten questions gets ten lazy answers.
2. **Recommend, then ask.** "I'd go with X because Y — ok?" beats "what should
   we do about Z?".
3. **Resolve dependencies in order.** Ask the question that narrows the space
   before the questions it narrows.
4. **Explore instead of asking** whenever the answer is discoverable.
5. **Record what you heard.** Restate the decision in one line before moving to
   the next branch, so a misunderstanding costs one message, not a whole plan.
6. **Stop when converged.** Ending the interview is part of the discipline.

## When the interview becomes a form

If the interviewer's questions are structured choices and config, stop asking in
chat: generate a draft-07 JSON Schema with your recommended answers as
`default`s and hand it to a2ui-ask's ask script, so the user gets a real form
(see the a2ui-ask `SKILL.md` for the control cheat sheet). Use the form for the
cluster of decisions; keep the chat interview for the open-ended ones.
