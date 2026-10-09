---
name: persona-copy
description: Reproduce another writer's style. Ingest one or more samples, extract a stylometric and rhetorical fingerprint, draft new text in that voice at matched quality, and verify the match against a research-backed rubric.
---

# Persona Copy

## Purpose

Use this skill when the user wants writing in **someone else's specific style** — given a few samples of that writer's work — and at the same quality level.

This skill is for:
- writing a new piece in the style of an existing author, blog, internal document set, or thought leader, given samples
- continuing a series consistently when the original author is unavailable
- reproducing a house style that is not yet codified as a preset persona
- producing the missing N+1 piece in a body of work

It is **not** for:
- impersonation in any context where attribution matters (legal filings, academic submission, personation as the original author). The skill writes *in the style of*; it does not pretend to be the source author.
- detector evasion.
- copying surface phrases. The skill extracts structural and stylistic patterns, not text fragments.

## Core rules

- Style is extracted as a **measurable fingerprint**, not a vibe. See `docs/writing-quality-rubric.md` and `docs/persona-theory.md` in the `persona-write` skill.
- The reproduction is judged against the rubric, not against subjective "feel."
- Source text is never copied. The output passes verbatim-overlap checks.
- If the user provides too few samples (one short text, < ~500 words total), say so before proceeding. Style extraction is unreliable below that.
- Preserve meaning before style on the new piece.
- Do not fabricate biographical details about the source author. Stay with the implied author the text constructs.

## Scratch folder & Pipeline traceability

Every task uses a scratch folder, exactly as `persona-write` does.

1. **Create a task folder:** `scratch/YYYY-MM-DD-copy-[source-slug]/`
2. **Record every pass** to its own numbered `.md` file.
3. **Final output:** Write the final draft to `final.md` and the extracted persona to `persona.md` in the same folder.

This applies to all tasks. The scratch folder is gitignored.

## Inputs

The user provides:

1. **Sample texts** (one or more). The more samples, the more reliable the fingerprint. Recommended: 3+ samples totalling 1500+ words.
2. **The brief** for the new piece — topic, audience, length, must-keep facts. Without this, ask.
3. *(Optional)* a name for the resulting persona, if they want it saved as a preset.

## Pipeline

### Pass 1 — Sample audit (`01-sample-audit.md`)
For each sample, record:
- word count
- topic
- audience signal
- genre / register
- whether it is representative of the source author's range

Flag any sample that looks atypical. If only one short sample is provided, warn the user that the fingerprint will be approximate.

### Pass 2 — Stylometric extraction (`02-fingerprint.md`)
Compute / estimate from the samples:

- **Mean sentence length** and **standard deviation** (count by sentence-final punctuation).
- **Lexical density** estimate (content words / total words). Target a band: low (< 0.4), mid (0.4–0.55), high (> 0.55).
- **Type-token ratio** band over a fixed window (per 500 tokens).
- **Function-word tilt** — which top-50 function words are over- or under-represented relative to neutral English. Note specifics: heavy `that`-use, em-dash preference, semicolon habit, comma density.
- **Sentence-opener inventory** — list the 5 most common openers across samples (e.g. `When …`, `It is …`, `The …`, fragment, gerund).
- **Punctuation profile** — em-dashes, semicolons, parentheticals, ellipses; count per 1000 words.
- **Biber-style register placement** on the six dimensions in `persona-theory.md` (Involved/Informational, Narrative/Non-narrative, etc.).
- **LIWC-style markers** — first-person singular vs plural rate; hedge/booster ratio; positive/negative emotion words; concrete vs abstract noun bias.

If you cannot compute a feature precisely, give a calibrated range and note it as an estimate.

### Pass 3 — Rhetorical & structural extraction (`03-structure.md`)
- **Opening moves**: how does the source author open a piece? (Cold claim? Anecdote? Question? Fragment?)
- **Closing moves**: how do they end?
- **Argumentative scaffolding**: mechanism-first, example-first, tradeoff-first, narrative, problem-solution.
- **Paragraph shape**: short paragraphs (1–3 sentences), long paragraphs, mixed?
- **Use of headings, lists, code blocks** if relevant to the genre.
- **Stance profile** (Hyland 2005): hedges, boosters, attitude markers, self-mention rate.
- **Engagement profile**: reader pronouns, directives, rhetorical questions, asides.

### Pass 4 — Implied author construction (`04-implied-author.md`)
Synthesise passes 1–3 into a Booth-style implied author:
- who does the reader think is talking?
- what do they care about?
- what is their relationship to the reader?
- what do they refuse to do?

Be specific. Anchor in the evidence already collected. Do not invent biography.

### Pass 5 — Persona file (`persona.md`)
Write the extracted persona using the full schema in `../persona-create/template.md`. Every section grounded in evidence from passes 1–4. This file is reusable as a preset if the user wants to save it.

### Pass 6 — Quality target profile (`06-quality-target.md`)
Score the source samples on the rubric in `../persona-write/docs/writing-quality-rubric.md`. The result is the **target profile** the new piece will be judged against. A persona that scored 3 on Reader Engagement in the source samples should score around 3 in the reproduction — not 5.

### Pass 7 — Brief reconciliation (`07-brief.md`)
Map the user's brief onto the extracted persona. Identify any genre or audience mismatch (e.g. the source samples are essays but the user wants a tweet thread). Resolve explicitly: either adapt the persona's register to the new genre, or flag the mismatch and ask.

### Pass 8 — Draft (`08-draft.md`)
Write the new piece in the persona, hitting the rhetorical scaffolding and stylometric fingerprint identified in passes 2–3.

### Pass 9 — Voice coherence against the extracted persona (`09-coherence.md`)
Apply `../persona-write/passes/voice-coherence.md`, calibrated against the **extracted** persona's Identity, Rhythm model, and Stylometric Signature from `persona.md` (pass 5). The check is fit to the source author's positive shape, not removal of generic AI patterns. If the draft drifts from the extracted Stylometric Signature on any feature, fix toward the target.

### Pass 10 — Verification (`10-verification.md`)
Check the draft against the **target profile** from pass 6:
- Score it on the same rubric.
- Compare each dimension against the target. A reproduction is acceptable when every dimension is within ±1 band of the target and at least Voice and Word Choice match the target exactly.
- Run the stylometric fingerprint check: mean sentence length, SD, opener inventory, punctuation profile, lexical density. Each within ±20% of the source.
- Run a verbatim-overlap check against the samples. Any 5-word span shared with a sample is a failure — paraphrase.
- If the draft fails any check, list the specific fixes and apply them.

### Pass 11 — Final (`final.md`)
Produce the final piece with a short report:
- the persona summary (one paragraph)
- the rubric scores vs target
- the stylometric fingerprint match table
- the final piece itself

## When to ask the user

Ask before drafting when:
- only one short sample is available;
- the samples are stylistically inconsistent (suggests multiple sources);
- the brief implies a genre the source author is not represented in within the samples;
- the user wants attribution-sensitive output (legal, academic, personation).

## Output style

Default output to the user is the final piece plus the rubric/fingerprint table. The full pass artifacts stay in the scratch folder. If the user asks for the analysis, surface `persona.md` and `10-verification.md`.

## Saving the extracted persona as a preset

If the user wants to keep the extracted style as a reusable preset:
1. Copy `persona.md` from the scratch folder to `.claude/skills/persona-write/personas/[chosen-name].md`.
2. Confirm the file location and remind the user it is now usable with `/persona-write [chosen-name]`.

## Supporting files

- `pipeline.md` — pass-by-pass detail
- `template.md` — extracted-persona file template (mirrors `persona-create/template.md` plus a Source-Evidence section)
- `examples.md` — worked examples

## References

This skill is built on the four research traditions documented in `../persona-write/docs/persona-theory.md`. The verification rubric is `../persona-write/docs/writing-quality-rubric.md`.
