---
name: persona-brief
description: Build a short reader brief before drafting — who the reader is, what they already know, what they need defined, what order the content must come in, and what they should do afterward. Use before /persona-write when the reader may not share the author's context, or on its own to check a draft against its reader.
---

# Persona Brief

## Purpose

A persona decides how the writer sounds. A reader brief decides what the reader needs in order to follow and act. This skill produces that brief, then hands it to `/persona-write` (or checks an existing draft against it).

Use it for documentation, requirements, reports, PR descriptions, explanations, handoffs, and any text where the reader does not share the author's context.

## The writer this skill makes

The writer is someone who sits in the reader's seat before drafting. They know what they know, and they can tell which parts of it the reader does not have. They put context ahead of the detail that depends on it, define a term where it first earns its place, and finish with the reader able to act without asking the author a question.

## Inputs

- source material (notes, code, data, a draft)
- the reader, even if only "a new teammate" or "the approver"
- the purpose and the action wanted from the reader
- stakes: what happens if the reader misunderstands

If the reader or the wanted action is unclear and changes the result, ask one question. Otherwise infer and say what was inferred.

## The brief

Write these seven fields, one to three lines each.

1. **Reader** — role, and how much attention they will give it.
2. **Already knows** — context the reader brings. This is what can be left out.
3. **Does not know** — context only the author has: terms, history, decisions, constraints. This is what must be supplied.
4. **Order** — the sequence in which the reader needs things, each item placed after what it depends on.
5. **Action** — what the reader should do, decide, or believe afterward.
6. **Stakes and register** — how careful, how long, how formal.
7. **Impression** — what the reader should think of the author or the text after reading (for example: credible, modest, direct). The cold-reader pass compares the reader's report with this.

## Workflow

1. Read the source and the stated reader.
2. Fill the brief. Mark each line as *given* or *inferred*.
3. Hand the brief to `/persona-write` as its audience and purpose input, alongside the chosen persona. The persona sets the voice; the brief sets the content and its order.
4. After drafting, run the reader check below on the result.

## Reader check

Read the draft as the reader from field 1, with only field 2 in hand.

- Does every term appear after its definition, or with it?
- Does each detail come after the context it depends on?
- Can the reader state the action in field 5 without contacting the author?
- Is the length right for the stakes in field 6?
- Which claims are facts from the source, and which are the author's interpretation? Is that visible?

Fix gaps by adding the missing context at the point it is needed, not in a preface.

## Output

Return the brief, then the draft or the fixes. Keep the brief short enough to read in under a minute.

## Pairing

- Run before `/persona-write` for new drafts and rewrites.
- Run after `/persona-review` when the text is correct and in voice but the reader still has to guess.
- Not a substitute for fact-checking; it works from the source material supplied.
