---
name: persona-wordcheck
description: Go through a finished text word by word and sentence by sentence and ask two questions of each - is it appropriate for this context (genre, reader, register), and is it used correctly in the target language (meaning, collocation, grammar). Fixes what fails. Runs automatically in the persona-write pipeline after native-fluency, and can be run on any text.
---

# Persona Wordcheck

## Purpose

A text can be in voice and still hold a word that is slightly off: too casual for the reader, too grand for the facts, or used in a sense the language does not give it. This skill checks every word and sentence for those two things.

## The writer this skill makes

A careful native writer and editor of the target language. For every word they ask whether they would choose it here, for this reader, and whether the language really allows it in this sense and form. When they are not sure, they look it up instead of trusting the ear.

## Inputs

- the text
- target language and locale
- context: genre, reader, register, stakes (from the brief or the user; infer and state if missing)

## The two questions

Ask both of every sentence, then of every content word and phrase in it.

**1. Is it appropriate here?**
- Does the register match the genre and the reader? One level of formality throughout.
- Is the word the right size for the fact? No grander or smaller than what happened.
- Is the first-person phrasing at the register of the genre (for example a wish stated plainly and formally, not in a colloquial form)?
- A title, program name, or term the user supplied stays as given; when the dictionary disagrees, flag it for the user.
- Does the sentence carry one claim the reader needs? If it carries none, flag it for the user or `fidelity-check` to decide.
- Is jargon, a foreign term, or an abbreviation understood by this reader?

**2. Is it correct in the target language?**
- Meaning: does the word mean what the sentence needs, in the sense the language actually gives it?
- Collocation: does it combine with its neighbours the way native writers combine it (verb with its noun, adjective with its noun)?
- Government and form: the right preposition or case, agreement, tense, article, spelling, diacritics.
- Coordinated items: does the same verb or preposition fit every item (for example a language and a tool in one phrase)?
- Naturalness: would a native writer reach for this construction first?

## Method

1. Read the style sheet (`00-style-sheet.md`) if there is one, then read one sentence at a time, in order. A term or name settled by a **user** or **source** row needs no second look. **Writer** rows are inferences and go through both questions. A new decision is added to the sheet.
2. For each content word and phrase, answer both questions. Most pass. Do not list those.
3. When unsure about meaning, collocation, or government, check a source (a dictionary for the language, such as DEX for Romanian; a corpus or a search of real usage) before deciding. A source is a dictionary entry, a corpus, or a real-use page that was opened. If no source can be reached, keep the word, mark it **unverified** in the table, and list it for the user. A word missing from the dictionary is not a failure by itself: look for real use (a corpus, news or institutional pages) and, if found, keep it and cite that use; if not found, mark it **unverified**.
4. Flag a word or sentence only when it fails a question. Record the item, the question it failed, and the fix.
5. Apply the fixes. Change the form and keep the content: facts, numbers, and names stay as they are.
6. Re-read each changed sentence against both questions.

## Output

The corrected text, then a short table of flagged items only:

| Original | Failed | Why | Fix | Checked against |
|---|---|---|---|---|

"Checked against" holds a link or a named dictionary entry that was actually opened, or the word **unverified**.

With scratch in use, save as `06c-wordcheck.md`. Anything left unfixed because it needs the user's decision is listed after the table.

## Pairing

- Runs in the `persona-write` pipeline after `native-fluency` and before `fidelity-check`.
- Use alone to check a text someone else wrote.
- `fidelity-check` still has the last word on facts.
