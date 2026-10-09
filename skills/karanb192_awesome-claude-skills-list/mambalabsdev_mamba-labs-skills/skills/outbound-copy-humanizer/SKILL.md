---
name: outbound-copy-humanizer
description: |
  Rewrite outbound copy so it reads like a person wrote it, removing the tells that mark a message as generated. Use when copy sounds robotic, when a draft is full of hedges and stock phrases, or when someone wants their outreach to sound like them.
license: MIT
metadata:
  category: outbound-email
  tags: [cold_email_system, outbound_email]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Outbound Copy Humanizer

## What this does

Generated outbound has a recognizable surface: tripled adjectives, a hedge before every claim, transitions nobody says out loud, and a closing sentence that restates the email. This skill strips those patterns and rebuilds the sentence rhythm against the sender's own writing, without flattening the message into slang.

## When to use it

- this sounds robotic
- make this sound human
- too much AI voice
- rewrite in my voice
- humanize this copy

## Inputs

- **draft**: the copy to rewrite
- **samples**: two or three things the sender actually wrote, if available

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `VOICE.md`
- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Read the voice file or the samples first and extract three concrete markers: average sentence length, whether contractions are used, and how the sender opens a message.
2. Remove the tells: adjective triples, hedges stacked in front of a claim, transitional phrases nobody speaks, and the summary sentence at the end.
3. Vary the sentence length deliberately. Uniform sentence length is the strongest tell and the easiest to fix.
4. Replace abstract nouns with the concrete thing they stand for. Solutions becomes the actual thing being sold.
5. Keep every fact. Humanizing is a rewrite of the surface, not a license to soften a claim into vagueness or to invent warmth that is not earned.
6. Read the result out loud in your head, sentence by sentence, and cut whatever you would not say.

## Output

The rewrite, plus a short list of what was removed and why, so the sender learns the pattern rather than depending on the skill.

## Quality bar

- Every factual claim in the original survives in the rewrite
- Sentence lengths vary across the rewrite
- No adjective triples remain
- The removal list names the pattern, not just the words

## Related skills

- `cold-email-structure-checker`
- `subject-line-lab`
- `linkedin-post-writer`

Ships in the **cold-email-system** pack.
