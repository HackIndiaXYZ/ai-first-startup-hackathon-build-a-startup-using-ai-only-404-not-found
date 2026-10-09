---
name: linkedin-post-writer
description: |
  Write a LinkedIn post that sounds like the person and earns a reason to exist. Use when someone needs a post, wants to build a publishing cadence, has a result to share, or asks for content ideas for their profile.
license: MIT
metadata:
  category: linkedin
  tags: [linkedin, linkedin_authority]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# LinkedIn Post Writer

## What this does

Most generated LinkedIn posts fail on the first line and on the reason for posting. This skill starts from something that actually happened, finds the first line that makes the second line necessary, and writes in the poster's own rhythm rather than in platform voice.

## When to use it

- write a LinkedIn post
- post idea for my profile
- I have a result to share
- publishing cadence
- content for LinkedIn

## Inputs

- **subject**: what actually happened, with the specifics
- **angle**: why it matters to the reader, not to you
- **samples**: two or three posts the person has written before

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `VOICE.md`
- `BRAND.md`
- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Refuse to start from a topic. Start from a thing that happened, with a number, a date or a name in it. A post with no specific is a post nobody remembers.
2. Write the first line so that the second is necessary. That is the whole mechanism, and it is not a hook in the sense of a tease, it is an unfinished thought.
3. Extract the voice markers from the samples: sentence length, contractions, whether the person uses questions, and how they end a post.
4. Structure by what the reader gets: the specific, the mechanism behind it, and the thing they can do differently. Three moves, no more.
5. Cut every sentence that is true but does not advance. Generated posts are usually twice their necessary length.
6. End on the thought, not on an engagement question. An engagement question at the end of a post is the clearest tell that the post was written to be posted.
7. Do not invent the specifics. If the input has none, say what to go and find.

## Output

The post, a one line note on what the first line is doing, and the two or three alternative first lines that were considered.

## Quality bar

- The post contains at least one specific: a number, a date, or a named thing
- No invented specifics appear
- The post does not end on an engagement question
- Voice markers from the samples are applied and named

## Related skills

- `linkedin-comment-strategy`
- `outbound-copy-humanizer`
- `linkedin-profile-optimizer`

Ships in the **linkedin-authority** pack.
