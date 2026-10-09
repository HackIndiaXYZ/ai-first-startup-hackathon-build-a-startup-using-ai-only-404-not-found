---
name: Say it plainly
description: "Use when a draft sounds like an AI wrote it, or someone asks to make it less AI, more human, plain English, or like them. Rewrites it, facts unchanged."
runs_in: anywhere
---

# Say it plainly

You are rewriting a draft so it reads like a person wrote it. Keep what it says. Change how it says it. Never add a fact, name, number, date, quote, or source that was not in the original or given by the user.

## Procedure

1. Read the draft once for what it says. List the claims to yourself.
2. Rewrite from scratch under the rules below. The original structure is not fixed. Merge paragraphs, split sentences, reorder, cut.
3. Check the rewrite against the claim list. Every claim present, nothing added.
4. Search the rewrite for every item in references/ai-vocabulary.md and fix each hit.
5. Read each sentence in your head as if saying it out loud to the reader. Anything you would never say out loud gets rewritten. This one test catches more than the whole banned list, so run it even when the draft looks clean.

## Output

Return the rewritten text and nothing else. When the user asks what changed, add a short list after the text: each change, the rule behind it, and anything you could not fix without a fact you do not have.

For a file with code, data, or frontmatter in it, change only the prose.

## Punctuation

- No em dashes or en dashes anywhere. Use a period, a comma, a colon, or parentheses, or split the sentence.
- No spaced hyphens or double hyphens standing in for a dash. Hyphens inside words (well-known, e-sign) are fine.
- Straight quotes and apostrophes only. Replace curly ones.
- No semicolons. Use a period.
- No emoji.

## Framing

- Lead with the point. The first sentence says what happened or what the reader should do. Reasoning follows it.
- No chatbot openers: no praise for the question, no announcing what you are about to do, no throat-clearing.
- Same for closers: no hoping this helps, no offers to do more, no closing question the reader did not ask for.
- End on the last useful sentence. No generic outlook, no cheer.
- No disclaimers about being an AI or about knowledge dates.

## Vocabulary

The banned words, the suspect words, the filler, and the setup phrases are listed in references/ai-vocabulary.md. Read it before the rewrite. The short version: plain verbs (is, has, use, help), one qualifier per claim at most, no transition word opening a paragraph, no appeal to unnamed experts or studies.

## Structure

Readers and detectors both notice regularity more than word choice. Swapping synonyms does not fix a machine-sounding draft. Structure does.

- No groups of three for their own sake. Use the number of items the meaning needs. A row of three punchy fragments is banned.
- No contrast shapes: "not X but Y", "not just X but Y", "no X, no Y, only Z". Say the Y.
- No "-ing" tails: a comma followed by a participle that claims significance (a clause saying the thing shows, reflects, or makes sure of something). Cut it, or make it a sentence with a fact in it.
- No bold-label bullets in prose (a bold label, a colon, an explanation). No title case headings. No heading restated by its first sentence. No horizontal rules.
- Tables only for things that are tabular.
- No formulaic sayings ("X is the language of Y", "X is a mirror").

## Rhythm

- Vary sentence length. Short next to long. A run of same-length sentences reads machine-made. One short sentence for emphasis is fine.
- Never open consecutive sentences or consecutive paragraphs the same way. A paragraph never opens with a transition formula.
- Vary paragraph length. Some are one sentence.
- Mild repetition beats synonym cycling. Call the customer "the customer" every time.
- Contractions by default, unless the text is legal or a contract.
- Perfectly parallel bullets and same-shaped sections are a tell. Real writing is a little uneven. Do not manufacture sloppiness, but do not sand the draft until it reads machine-cut.

## Substance

- Say who did what. Active voice with a named actor, unless the actor truly does not matter.
- Add mechanism, not adjectives. A claim, then why, then the limit or exception. "We closed the Tuesday evening shift because only three orders came in after 6pm all month" beats "we optimized staffing".
- Specifics over abstractions: real numbers, real dates, real names. If the draft has none and the user gave none, keep the abstraction rather than inventing a number.
- Do not answer objections nobody raised or reject alternatives nobody would pick.
- Any message that asks for something names the person, the action, and what unblocks after it.

## When a writing sample is provided

Match how the sample sounds over the defaults above: its sentence length, its word choice, its punctuation habits, its quirks. If the sample uses dashes, match its rate. That is the only exception to the dash rule.

## Do not over-flag

Correct grammar, a consistent style, one list of three that is truly three things, one bold word that carries meaning, a heading in a long doc: none of these prove a machine wrote it. Fix patterns, not a single word used once and naturally.
