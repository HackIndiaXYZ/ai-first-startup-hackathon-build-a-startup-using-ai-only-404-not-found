---
name: persona-write
description: Draft, rewrite, audit, and refine text through a specific writing persona using a multi-pass workflow. For long documents, process section by section instead of rewriting everything in one shot.
---

# Persona Write

## Purpose

Use this skill to write through a **specific kind of persona**, not generic assistant voice.

This skill is for:
- drafting text
- rewriting existing text
- auditing weak or AI-ish text
- refining already revised text
- processing long documents section by section

The goal is writing shaped by a specific attention model, compression level, and stance.

## Core rules

- **Positive shape over negative shape.** Voice work means executing the persona's positive signature, not avoiding a global ban-list. See `docs/philosophy.md`.
- Persona comes first.
- Preserve meaning before style.
- Default to concise, clear writing.
- Do not flatten all writing into one neutral assistant voice.
- Do not one-shot long-form rewrites.
- For long text, process one major section or chapter at a time.
- Use Markdown as the working format when writing to files.
- Do not optimize for detector evasion.
- Do not add fake human quirks like random typos or forced slang.

## Scratch folder & Pipeline traceability

Scratch files are **durable memory**, not virtuous traceability. The mode is decided by length and task type, not by user request.

### Two modes

| Target output | Mode | Why |
|---|---|---|
| **≤ 600 words** (roughly 1–2 pages) | **In-memory** | The whole pipeline state fits in working memory. Serialization adds friction and loses cohesion. |
| **> 600 words** | **Scratch** | The state exceeds one working window. Materializing each pass keeps the persona stable across the longer arc. |
| **Long-form** (multi-section, > 2000 words) | **Scratch + chapter workflow** | Chapter memory and revision tickets do durable work. See `longform/`. |
| **`/persona-copy` analysis** | **Scratch** | Extracted persona files and verification reports are saved artifacts by definition. |

Estimate target length from the user's brief. If the user explicitly asks for the analysis to be saved on a short task, switch to scratch on request.

### In-memory mode

Run all passes in-context. Return the result inline with a one or two sentence note on the main adjustments. No folder is created.

`sentence-build` still applies in this mode: keep the skeleton, the sentence log, and the style sheet in context, build one sentence at a time, and show all three as compact lists under the result so the build can be checked.

### Scratch mode

1. **Create a task folder:** `scratch/YYYY-MM-DD-[task-slug]/`
2. **Record each pass to its own numbered `.md` file:** `01-intent.md`, `02-audit.md`, `03-mapping.md`, `04a-skeleton.md`, `04b-sentences.md`, `04-draft.md`, `05-coherence.md`, `06-refine.md`, `06b-native.md`, `06c-wordcheck.md`, `07-fidelity.md`, `07b-cold-reader.md`, `08-proofread.md`, `final.md` (and `00-style-sheet.md`, plus `00-research.md` when `/persona-research` ran).
3. The scratch folder is gitignored.

The reasoning, with cross-model experimental evidence, is in `docs/voice-guide.md`. The underlying principle is in `docs/philosophy.md`.

## When to use this skill

Use this skill when the user wants to:
- remove generic assistant patterns from existing text
- rewrite text in a stronger voice
- sound more direct, technical, practical, or clear
- improve text that is over-hedged, padded, or voiceless
- write something from scratch in a defined voice
- revise a large document while keeping voice and structure consistent

## When not to use this skill

Do not use this skill when the user only wants:
- grammar correction with minimal rewriting
- exact preservation of wording
- detector evasion
- a full large-document rewrite in one pass

## Multi-persona chain mode

When the user provides more than one persona, interpret them as an ordered chain.

Accepted formats:
- `sharp-technical -> problem-first-marketer`
- `sharp-technical, problem-first-marketer`
- natural language: "write as a sharp technical person, then review as a problem-first marketer"

### Chain semantics

- **First persona owns the text.** It writes or rewrites the draft.
- **Every following persona is a reviewer.** It does not become a co-author.
- **Reviewers run a two-step process** — no user permission required:
  1. Identify problems from their perspective (what is off, unclear, misframed, wrong for the audience)
  2. Apply surgical fixes — sentence-level, paragraph-level, local framing, targeted cuts or additions
- **Reviewers must not** rewrite the whole piece in their own voice, replace the owner persona, or flatten the text into generic prose.
- **After all reviewers finish, the owner persona runs a mandatory final reconciliation pass.** This pass smooths seams, restores the owner's voice where it was displaced, preserves useful reviewer improvements, and ensures the final text reads as one coherent piece.
- **Final output should still primarily sound like the first persona.**

For multiple reviewers, apply them in order. Each reviewer reads what the previous one produced.

Example — three-persona chain:
1. `sharp-technical` writes
2. `clear-teacher` reviews and applies surgical fixes
3. `problem-first-marketer` reviews and applies surgical fixes
4. `sharp-technical` runs the final reconciliation pass

→ Full details: `docs/persona-chain-mode.md`

## Main user flow

### If the user already gave a persona
Proceed directly.

### If the user did not give a persona
Ask for one before writing.

List the preset options in plain English:

- **sharp-technical**: direct, concise, technical
- **pragmatic-builder**: practical, clear, useful
- **clear-teacher**: easy to follow, explanatory without fluff
- **skeptical-analyst**: careful, critical, evidence-aware
- **blunt-operator**: very direct, minimal ceremony
- **problem-first-marketer**: problem-first, design-aware, earns attention before asking for action
- **quiet-witness**: close-third, present-tense scenes; friction shown through action, never exposition

Also allow a plain-language custom persona, for example:

- "like a senior engineer who is concise and hates fluff"
- "like a clear teacher who explains things simply but not dumbed down"
- "like a skeptical analyst who cares about evidence and weak assumptions"

## Mode handling

Infer the mode whenever possible.

### Draft
Use when the user gives a topic or asks to write something from scratch.

### Rewrite
Use when the user provides text and asks to improve it, rewrite it, or change its voice.

### Audit
Use when the user provides text and asks what is wrong with it, why it sounds bad, or why it feels AI-ish.

### Refine
Use when the user provides text that is already revised and wants another pass.

### Longform
Use when the input is a large or structured document, or when the text clearly needs section-by-section treatment.

Only ask for mode if it is genuinely unclear.

## Persona resolution

### Preset persona
If the user names a preset, load it from the `personas/` folder.

### Custom persona
If the user describes a persona in plain language, derive a lightweight working persona from the description.

When building a custom persona, infer:
- directness
- technicality
- compression level
- explanatory depth
- stance
- rhythm tendencies
- taboo patterns if obvious

Do not make the custom persona theatrical or exaggerated.

## Short-text workflow

Default to **in-memory** for short text. Run the passes in-context unless the user has asked for the analysis to be saved.

The pass sequence (whether materialized to scratch or held in memory):

1. **Resolve persona** — load the persona file. Hold its Identity, Rhythm, and Stylometric Signature as the brief.
2. **Infer mode** — draft / rewrite / audit / refine / longform.
3. **Extract intent and open the style sheet** — what the text is trying to do, who it is for, what must be preserved; record the decisions on terms, names, numbers, and register in `00-style-sheet.md`. The editing and checking passes read it. See `passes/style-sheet.md`.
4. **Run a diagnostic audit** (persona-fit only) — identify drift from the persona's positive shape. **Do not enumerate generic AI patterns**; see `docs/voice-guide.md`.
5. **Persona immersion mapping** — stance, word-pool (the persona's Lexical Shunts), structural intent.
6. **Build sentence by sentence** — plan the claims first, then write, check, and fix one sentence at a time through the immersion brief. The text grows one sentence at a time from the skeleton. See `passes/sentence-build.md`.
7. **Voice coherence** — check fit to the persona's positive shape (Identity, Rhythm, Stylometric Signature, Taboo patterns). Apply targeted fixes toward the persona's target. See `passes/voice-coherence.md`.
8. **Refine** — locally tighten and improve flow without global smoothing.
9. **Native fluency** — when the target is not English, make the text read as native writing. See `passes/native-fluency.md`.
10. **Word check** — ask of every word and sentence whether it fits the context and is used correctly in the target language. See `/persona-wordcheck`.
11. **Fidelity check** — preserve meaning and nuance.
12. **Cold reader** — when the reader decides something about the author or the purpose (an application, a bid, an appeal), or the user asks: a fresh reader with only the text reports what it understood, the impression of the author, and where it stumbled. See `passes/cold-reader.md`.
13. **Proofread** — read the finished text as it will appear in the reader's form: length, format, spacing, characters. See `passes/proofread.md`.
14. **Final output** — return inline (or write to `final.md` if scratch is in use).

If scratch is in use, write each step to a numbered `.md` file (`01-intent.md` ... `04a-skeleton.md`, `04b-sentences.md` ... `06b-native.md`, `06c-wordcheck.md`, `07-fidelity.md`, `07b-cold-reader.md`, `08-proofread.md`, `final.md`; plus `00-style-sheet.md`).

## Long-form workflow

If the input is a large document, do not rewrite it in one shot. Use the scratch folder for all artifacts.

### Stage 0: Create a global brief (`brief.md`)
Create or infer:
- persona
- audience
- purpose
- format
- core thesis
- must-keep facts
- tone constraints
- locked terminology

### Stage 1: Create a document map (`map.md`)
Identify:
- major sections or chapters
- the role of each section
- dependencies between sections
- repeated concepts
- likely drift risks

### Stage 2: Process one section at a time
For each section or chapter, write to the task folder:

1. local intent extraction (`[section]-01-intent.md`)
2. local diagnostic audit (`[section]-02-audit.md`)
3. local persona immersion (`[section]-03-mapping.md`)
4. section build, sentence by sentence (`[section]-04a-skeleton.md`, `[section]-04b-sentences.md`, `[section]-04-draft.md`)
5. voice coherence (`[section]-05-coherence.md`)
6. local refinement, native fluency, and word check (`[section]-06-refine.md`, `[section]-06b-native.md`, `[section]-06c-wordcheck.md`)
7. fidelity check (`[section]-07-fidelity.md`)
8. chapter memory artifact (`[section]-memory.md`)

### Stage 3: Maintain rolling memory
After each section, keep track of:
...
### Stage 4: Create revision tickets when needed (`tickets.md`)
If a later section changes framing, terminology, or argument shape:
...
### Stage 5: Run a whole-document consistency pass (`consistency.md`)
At the end, check:
...
### Stage 6: Assemble final output (`final.md`)
Create the final Markdown document from the revised sections, then run the cold-reader pass (when the stakes call for it) and the proofread pass on it.

## Output handling

### Short tasks
Return the result inline by default unless the user clearly wants it saved.

### Long or iterative tasks
Use Markdown files for:
- global brief
- document map
- chapter drafts
- chapter memory
- revision tickets
- final assembled output

Markdown is the canonical working format.

## Output style by default

Unless the user requests detailed analysis, do not dump the full internal process.

### For normal rewrite requests
Return:
- a short note about what changed
- the rewritten text

### For audit requests
Return:
- concise diagnosis
- optional rewrite if requested or obviously useful

### For long-form requests
Return:
- short note that the text was handled section by section
- the resulting output or the location of the generated Markdown artifacts

## Preset personas

Preset persona definitions are in:

- `personas/sharp-technical.md`
- `personas/pragmatic-builder.md`
- `personas/clear-teacher.md`
- `personas/skeptical-analyst.md`
- `personas/blunt-operator.md`
- `personas/problem-first-marketer.md`
- `personas/quiet-witness.md`

## Supporting modules

### Docs
- `docs/voice-guide.md` — active guidance on voice coherence (positive-shape framing). Why the pipeline does not enumerate anti-AI patterns.
- `docs/persona-theory.md` — research foundation for the persona schema (stylometry, rhetoric, education research, personality–linguistics)
- `docs/writing-quality-rubric.md` — research-backed analytic rubric used by `persona-copy` and the diagnostic-audit pass
- `docs/persona-chain-mode.md`
- `docs/pipeline.md`
- `docs/longform-mode.md`
- `docs/simple-usage.md`
- `docs/philosophy.md`
- `docs/contributor-guide.md`
- `docs/anti-ai-guidelines.md` — *reference only*; background on common AI patterns. Not a pipeline input.

### Passes
- `passes/intent-extraction.md`
- `passes/style-sheet.md`
- `passes/diagnostic-audit.md`
- `passes/persona-mapping.md`
- `passes/sentence-build.md`
- `passes/rewrite.md`
- `passes/voice-coherence.md`
- `passes/refine.md`
- `passes/native-fluency.md`
- `passes/fidelity-check.md`
- `passes/cold-reader.md`
- `passes/proofread.md`

### Scripts
- `scripts/proofread.py` — mechanical checks used by the proofread pass; `scripts/test_proofread.py` is its self-check

### Long-form
- `longform/global-brief.md`
- `longform/document-map.md`
- `longform/chapter-workflow.md`
- `longform/chapter-memory.md`
- `longform/revision-tickets.md`
- `longform/consistency-pass.md`

### Companion skills
- `/persona-wordcheck` — runs as pipeline step 10; install it alongside persona-write
- `/persona-brief`, `/persona-research`, `/persona-localize` — optional steps before the pipeline

### Dictionaries
- `dictionaries/banned-phrases.md`
- `dictionaries/manager-speak.md`
- `dictionaries/ai-patterns.md`

## Final reminder

This skill is not trying to produce "generic human-like writing."

It is trying to produce writing that sounds like **a specific kind of person**, while staying useful, coherent, and readable.
