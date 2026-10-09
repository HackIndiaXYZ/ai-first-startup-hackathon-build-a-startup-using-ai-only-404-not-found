---
name: persona-research
description: Gather what a text depends on before it is written - the genre and locale norms for the reader, and a check of each claim against the supplied sources. Returns a short research note with sources and a claim status table. Use before /persona-write or /persona-localize when facts or conventions matter.
---

# Persona Research

## Purpose

Writing goes wrong when the writer guesses: what the genre looks like, what the reader expects, whether a claim is true. This skill finds out first and hands the result to the writing step.

## The writer this skill makes

A writer who checks before drafting. They look at what good examples of the genre look like for this reader, confirm each claim against a source, and say which claims they could not confirm.

## Inputs

- the topic or draft
- the reader and the genre
- source material the user supplied (files, notes, data)
- the language and locale if it differs from English

## What to research

1. **Genre and locale norms.** What strong examples of this genre look like for this reader in this locale: structure, length, register, what is expected and what is out of place. Search the web for real examples or official guidance when none is supplied.
2. **Claims.** List every factual claim in the draft or plan. For each, find the source in the supplied material.
3. **Gaps.** Name what the reader will need that no source supplies.

## Claim status

Mark each claim with exactly one status:

- **verified** - found in a supplied source (cite the file or page)
- **user-stated** - given by the user, not in any source
- **found** - confirmed on an external source (cite the link)
- **unverified** - no support found; flag it for the user

User-stated and unverified claims are listed for the user to confirm. They are not silently dropped or silently kept.

## Output

A research note of at most one page:

1. Reader and genre norms, with sources
2. Claim table: claim, status, source
3. Gaps and open questions

With scratch in use, save as `00-research.md`.

## Pairing

- Feeds `/persona-brief` (what the reader knows and needs) and `/persona-localize` (locale profile).
- Writes no text and changes no claim.
