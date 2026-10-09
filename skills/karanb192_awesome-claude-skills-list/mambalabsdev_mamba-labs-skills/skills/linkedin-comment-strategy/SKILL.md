---
name: linkedin-comment-strategy
description: |
  Decide which posts to comment on and write comments that do something other than agree. Use when someone wants to build presence through commenting, wants to be visible to a target account, or asks what to say on someone's post.
license: MIT
metadata:
  category: linkedin
  tags: [linkedin, linkedin_authority]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# LinkedIn Comment Strategy

## What this does

Commenting is the cheapest visible surface on the platform and almost all of it is wasted on agreement. This skill picks posts by whose audience matters rather than by whose post is popular, and writes comments that add a fact, a counter case, or a specific the post left out.

## When to use it

- what should I comment on
- build presence through commenting
- be visible to this account
- comment strategy
- reply to this post

## Inputs

- **targets**: the accounts or people whose attention matters
- **post**: the post to comment on, where there is one
- **expertise**: what you actually know that is worth saying

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`
- `VOICE.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Select posts by audience, not by engagement. A post with two hundred views from exactly the right people is worth more than one with twenty thousand.
2. Comment early enough to be read. Late comments on a large post are invisible regardless of quality.
3. Write one of three shapes: add a fact the post lacked, name the case where the post's claim does not hold, or give the specific number from your own experience. Nothing else is worth posting.
4. Never open by praising the post. It costs a line and signals nothing.
5. Keep it to two or three sentences. A comment that reads as a post is read as self promotion.
6. Do not pitch, ever. The comment earns the profile visit; the profile does the selling.
7. Track which comments led to a profile visit or a connection, because the ones that work are usually not the ones that felt best to write.

## Output

The comment, its shape, and why this post was chosen over the others. Plus, when a set is requested, a prioritized post list with the audience reason for each.

## Quality bar

- Posts are selected by audience, not by engagement count
- The comment is one of the three named shapes
- No praise opener and no pitch appears
- Length stays within three sentences

## Related skills

- `linkedin-post-writer`
- `linkedin-engager-mining`
- `linkedin-connection-campaign`

Ships in the **linkedin-authority** pack.
