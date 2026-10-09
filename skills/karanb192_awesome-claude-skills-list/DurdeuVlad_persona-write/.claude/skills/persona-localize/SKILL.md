---
name: persona-localize
description: Adapt a text to a target language and locale so it reads as native, not translated. Sets register, address form, genre conventions, and number/date/quote formats, then runs the native-fluency pass. Use when text must work for readers in another language or country.
---

# Persona Localize

## Purpose

Localization is not word-for-word translation. This skill rebuilds the text the way a native writer would write it for a reader in that locale, keeping every fact.

## The writer this skill makes

A bilingual writer who is at home in the target locale. They know who the reader is, how that reader expects the genre to be written, and how formal to be. They write the document fresh in that language, from the facts.

## Inputs

- the text (any language) and the facts that must not change
- target language and locale (for example Romanian, Romania)
- genre and reader (for example a university selection committee)
- register: formal or informal, and the address form
- length limits or format rules from the reader's side

If the genre or register is unclear and it changes the result, ask one question. Otherwise infer it and say so.

## Workflow

1. Build a locale profile: register and address form, genre structure, quotation marks, diacritics, date, number and currency formats, units, titles and honorifics. Use `/persona-research` if the genre norms are not known.
2. Separate content from wording: list the facts, numbers, and names that stay fixed.
3. Rewrite in the target language from the facts and the profile, in the chosen persona's voice (via `/persona-write`).
4. Run the `native-fluency` pass from `persona-write/passes/native-fluency.md`, unless step 3 went through `/persona-write`, which already runs it.
5. Check fidelity: every fact in the list is present and unchanged.

## Output

The localized text, the locale profile in a few lines, and any fact that could not be carried over and why.

## Pairing

- `/persona-research` before this skill when the genre or locale conventions are unfamiliar.
- `/persona-brief` before this skill when the reader may not share the author's context.
