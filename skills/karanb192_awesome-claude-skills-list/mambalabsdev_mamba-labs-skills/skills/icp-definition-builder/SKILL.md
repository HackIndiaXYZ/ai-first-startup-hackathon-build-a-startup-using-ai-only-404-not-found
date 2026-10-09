---
name: icp-definition-builder
description: |
  Turn a description of a business into a structured ideal customer profile with firmographic criteria, signals, pain indicators and exclusion rules. Use when someone asks who to sell to, wants to define their ICP, build targeting criteria, or segment a market.
license: MIT
metadata:
  category: identity-enrichment
  tags: [clay_operator, identity_enrichment, signal_based_selling]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# ICP Definition Builder

## What this does

Most ICP documents are a list of adjectives that no filter can apply. This skill produces a profile whose every line is either a filter you can run or a signal you can detect, plus the exclusion rules that matter more than the inclusion rules, because exclusions are what keep a list clean.

## When to use it

- who is my ideal customer
- define my ICP
- build targeting criteria
- help me segment my market
- set up account filters

## Inputs

- **business**: what is sold, to whom, and what it replaces
- **wins**: the best customers you have, and why they were good
- **losses**: deals that closed and churned, or never closed

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Start from the wins, not from the aspiration. The ICP is a description of who already buys well, and it is usually narrower and less flattering than the aspiration.
2. Derive firmographics as ranges and lists, never as adjectives. Mid market becomes a headcount band with a number on each end.
3. Derive the signals: what is observably true about a company at the moment it becomes a good time to reach them.
4. Derive the pain indicators, which are the things a company does when it has the problem you solve, and which are usually visible in hiring, stack or public statements.
5. Write the exclusions explicitly, including the ones that feel obvious. Competitors, existing customers, companies below a size floor, regulated segments you cannot serve, and geographies you cannot support.
6. Write the tier rule: what makes an account tier A rather than tier B, expressed so two people would sort the same list the same way.
7. Finish with the disqualifying question, the one thing a rep can ask on a first call that reliably ends a bad fit early.

## Output

The ICP as a structured block: firmographic filters, signals, pain indicators, exclusions, tier rule, and the disqualifying question. Written so it can be pasted into `ICP.md` at the project root.

## Quality bar

- Every firmographic criterion is a range or a list, never an adjective
- Exclusions are present and include existing customers and competitors
- The tier rule is deterministic enough that two people sort the same list identically
- The profile is derived from stated wins rather than from ambition

## Related skills

- `icp-fit-scoring`
- `company-discovery-list-builder`
- `clay-people-search-workbook`

Ships in the **signal-based-selling**, **clay-operator** packs.
