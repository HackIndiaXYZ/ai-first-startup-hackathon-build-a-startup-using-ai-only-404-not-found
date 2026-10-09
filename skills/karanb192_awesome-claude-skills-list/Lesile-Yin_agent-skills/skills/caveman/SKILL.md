---
name: caveman
description: >-
  Compress verbose agent/human communication into dense "caveman" mode — strip
  hedging, restatement, politeness, and meta-commentary while preserving 100%
  of the technical meaning. Use when a message, transcript, or tool output is
  token-heavy, repeats itself, or will be re-fed to an agent; typically saves
  65–75% of output tokens with zero information loss.
---

# Caveman

Turn padded text into its load-bearing skeleton. Caveman mode is not rudeness —
it is *lossless compression of intent*. The goal: every surviving token changes
what the reader/agent does next; every removed token was noise.

## When to use

- A chat transcript or status update restates the same point three ways.
- A tool output or log dump is about to be pasted back into an agent context.
- A PR description, commit message, or design doc is 80% framing and 20% content.
- You are about to pay token cost to re-read something you already said.

## Workflow

### Step 1 — Identify load-bearing tokens
Mark, privately, every token an executor would need to act correctly:
identifiers (paths, names, IDs, versions), numbers/units, constraints,
negations, error strings, and deadlines. **These are immutable.**

### Step 2 — Delete the noise classes
Remove, in order:
1. **Hedging** — "perhaps", "maybe", "I think", "it seems", "just to clarify".
2. **Restatement** — the second and third paraphrase of one idea.
3. **Politeness/scaffolding** — "thank you", "I hope this helps", "as mentioned".
4. **Meta-commentary** — "let me explain", "here is what I did", "to summarize".

### Step 3 — Collapse to Subject–Verb–Object
Rewrite survivors as short declarative clauses. Prefer lists over prose. Drop
articles where meaning survives ("the" before known entities). One clause per
line re-tokenizes cheapest and reads fastest.

### Step 4 — Verify losslessness
Re-read the compressed text against Step 1's list. If any load-bearing token is
missing or its meaning changed, restore it. Then estimate the token delta and
report it.

## Anti-patterns (never do these)

- Removing a qualifier that flips meaning ("not", "except", "only", "must").
- Merging two distinct points into one clause — ambiguity is worse than length.
- Dropping error messages or stack traces — they are load-bearing.
- Inventing brevity by changing a number, path, or name.
- Compressing a reply to a human who *asked* for tone — caveman is for context,
  not for how you talk to people.

## Output contract

Return:
1. The compressed text (dense, line-per-clause).
2. A one-line token delta estimate (e.g. "≈ 720 → 190 tokens, −74%").
3. A short list of the critical tokens you preserved (paths/IDs/numbers), so the
   user can confirm nothing load-bearing was dropped.

Do not also execute the task the text describes unless asked. See
`references/compression-rules.md` for the noise-class table and worked examples.
