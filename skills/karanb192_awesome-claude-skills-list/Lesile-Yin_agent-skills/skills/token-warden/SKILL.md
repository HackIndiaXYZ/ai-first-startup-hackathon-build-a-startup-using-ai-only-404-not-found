---
name: token-warden
description: >-
  Token budget guardian for agent sessions. Models token consumption in four
  independent layers (context reading, tool/command output, conversation
  output, code generation), routes each layer to its most efficient tool or
  behavior, and enforces anti-pattern rules. Use in long coding sessions,
  large-repo work, or whenever the user asks to save tokens/cost, or a session
  starts hitting context limits.
---

# Token Warden

Tokens are spent in four independent layers. Optimizing one layer does
nothing for the other three — and most "save tokens" advice only touches one.
This skill audits all four and applies the cheapest adequate tool per layer.

## The four-layer model

| Layer | What burns tokens | Symptom of waste |
|---|---|---|
| R — Reading | Files, search results, docs pulled into context | Full-file reads to find one symbol |
| T — Tool output | Command stdout, test logs, build output | Raw 5k-line logs pasted into context |
| C — Conversation | The agent's prose, explanations, summaries | Preamble, restating, apology loops |
| G — Generation | Code written/rewritten | Whole-file rewrites for 3-line fixes |

When invoked, first state which layer(s) dominate the current task, then apply
the routing table to those layers. Do not ceremony for a task that is small.

## Routing table

Full rules and fallbacks: `references/routing-rules.md`.

| Layer | First choice | Fallback if unavailable |
|---|---|---|
| R | Symbol/semantic lookup (LSP-style) for "where is X defined/used" | Targeted read with line range; grep only for text patterns |
| R | Grep with `-n` and tight pattern for occurrences | Glob to narrow files first, then read ranges |
| T | Pipe to filters *inside* the command (`head`, `grep`, `jq`, `tail -n`) | Run, then read only the saved output range |
| T | `--quiet`/`--silent` flags; machine-readable output parsed, not quoted | Summarize output; never paste > 50 lines verbatim |
| C | Terse mode: no preamble, no restating, no apology | Structured bullets over prose; tables over lists of pairs |
| G | Minimal-diff edits (change only touched lines) | Full rewrite only when > 50% of the file changes |

## Anti-patterns (hard rules)

1. **Never two readers at once** — one lookup mechanism per question.
   Running grep *and* full-file read for the same symbol doubles layer R.
2. **Never read to summarize** — if the goal is a one-line answer, read only
   enough to produce that line.
3. **Never paste, filter** — command output enters context only after a
   filter or an explicit "I need the raw log" from the user.
4. **Never rewrite to fix** — a localized bug gets a localized edit.
5. **Never re-read what context already holds** — check the conversation
   before re-fetching a file.

## Budget protocol (long sessions)

- At session start or on request, estimate the task's layer profile with
  `scripts/estimate_tokens.py` (heuristic, zero deps; uses tiktoken if
  installed).
- When context feels heavy (~70% of window), announce a **checkpoint**:
  compress the working state into ≤ 20 bullets (decisions, paths, next step),
  then continue from the checkpoint instead of carrying raw history.
- Report savings only when measured: before/after estimates on the same
  task slice. Never invent percentages.

## Output contract

Announce routing in one line when non-obvious, e.g.
`token-warden: R→grep+range-read, T→jq filter, G→minimal-diff`.
Then do the work. The skill itself must never add more tokens than it saves —
if applying it would cost more than the waste it prevents, skip it and say so.
