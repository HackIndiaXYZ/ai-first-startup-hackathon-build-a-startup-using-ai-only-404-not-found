---
name: content-brief-builder
description: |
  Write a content brief a writer can execute without inventing the substance, including where the non generic part comes from. Use when briefing a writer, planning an article, or when published content keeps reading like everything else.
license: MIT
metadata:
  category: seo-content
  tags: [seo_content, seo_content_engine]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Content Brief Builder

## What this does

Content reads generic when the brief specified the topic and the structure but not the substance, so the writer fills the gap with what everyone already knows. This skill requires a source for the one section that makes the piece unrepeatable, and refuses to brief a piece where that section does not exist.

## When to use it

- brief a writer
- plan an article
- our content reads generic
- content brief
- what should this post cover

## Inputs

- **topic**: what the piece is about and who it is for
- **angle**: what this piece says that others do not
- **sources**: what you have that a competitor does not

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `BRAND.md`
- `ICP.md`
- `VOICE.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Name the unrepeatable section first: the data, the experience, the example, or the counter position that another company could not write. If it does not exist, say so and either find it or do not brief the piece.
2. Write the searcher's actual question and what a satisfying answer requires. Most briefs specify a keyword and leave the question implicit.
3. Specify the structure as questions the piece must answer in order, not as headings. Headings produce filler under each one; questions produce answers.
4. Specify what to leave out. Briefs almost never do this and it is why pieces drift into background nobody needs.
5. Name the source for every factual claim the piece will make, so the writer is not researching and inventing at the same time.
6. Specify the internal links and where they go, since a link added afterward lands in the wrong sentence.
7. Give the writer the voice markers rather than a description of the voice.

## Output

The unrepeatable section with its source, the searcher question, the ordered questions the piece answers, the exclusions, the claim sources, the internal links, and the voice markers.

## Quality bar

- The unrepeatable section is named and sourced, or the brief is refused
- Structure is specified as ordered questions rather than headings
- The brief states what to leave out
- Every factual claim has a named source
- Internal links are specified with their placement

## Related skills

- `first-party-data-post`
- `comparison-page-builder`
- `programmatic-seo-planner`

Ships in the **seo-content-engine** pack.
