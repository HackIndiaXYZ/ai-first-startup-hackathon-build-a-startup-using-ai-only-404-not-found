---
name: linkedin-profile-optimizer
description: |
  Rewrite a profile so it converts the visits that outbound and commenting send to it. Use when someone's profile is not converting, before starting outbound, or when someone asks how to improve their LinkedIn profile.
license: MIT
metadata:
  category: linkedin
  tags: [linkedin, linkedin_authority]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# LinkedIn Profile Optimizer

## What this does

For anyone doing outbound, the profile is a landing page with one job: confirm within four seconds that the person who just messaged is worth replying to. Most profiles are written as a resume instead. This skill rewrites the three elements a visitor actually reads and ignores the rest.

## When to use it

- improve my LinkedIn profile
- my profile is not converting
- profile before I start outbound
- rewrite my headline
- optimize my about section

## Inputs

- **profile**: the current headline, about section and featured items
- **audience**: who lands here and what they were doing beforehand
- **proof**: the specific results you can point at

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`
- `VOICE.md`
- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Establish the visitor's context. Someone arriving from a cold message is checking legitimacy; someone arriving from a comment is checking expertise. These need different first lines.
2. Rewrite the headline as what you do for whom, with the specific in it. A job title is not a headline and a slogan is worse.
3. Rewrite the first two lines of the about section, because the rest is behind a click that most visitors do not make.
4. Put the proof above the fold: a number, a named result, or a recognizable reference.
5. Fix the featured section to carry the one thing you want a visitor to do, and remove everything else from it.
6. Leave the experience history alone unless it contradicts the positioning. Rewriting it is effort spent below the fold.
7. Check the profile against a phone viewport, since that is where most visits from a message happen.

## Output

The rewritten headline with two alternatives, the rewritten first two lines, the proof placement, the featured recommendation, and the phone viewport check.

## Quality bar

- The headline names an audience and a specific outcome
- Only the first two lines of the about section are rewritten and this is explained
- Proof appears above the fold
- The result is checked on a phone viewport

## Related skills

- `linkedin-post-writer`
- `linkedin-comment-strategy`
- `brand-context-builder`

Ships in the **linkedin-authority** pack.
