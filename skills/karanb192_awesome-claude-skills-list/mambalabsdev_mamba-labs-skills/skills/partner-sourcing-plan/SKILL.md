---
name: partner-sourcing-plan
description: |
  Find the partners whose customers are your buyers, and structure the first conversation so it produces something. Use when someone wants referral partners, co marketing, channel relationships, or a warmer route into a market.
license: MIT
metadata:
  category: agency-operations
  tags: [agency_delivery, agency_operations]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Partner Sourcing Plan

## What this does

Partner brainstorms produce a list of well known companies who will not reply. The partners worth approaching are the ones already serving your buyers with something adjacent, and that overlap is detectable rather than guessable. This skill finds them by overlap and structures the first exchange around a small reciprocal test rather than a partnership agreement.

## When to use it

- find referral partners
- co marketing
- channel partnerships
- who should we partner with
- warm route into a market

## Inputs

- **customers**: your customers and what else they buy
- **offer**: what you would give a partner
- **capacity**: how many partner relationships you can actually service

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`
- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Overlap is detected from the tools your customers already run and the vendors present on their sites, so the partner list comes from evidence rather than from a brainstorm.

- **gtm-tech-stack-signal-scraper**: the adjacent tools your customers already run
  Store page: https://apify.com/mambalabs/gtm-tech-stack-signal-scraper
- **company-social-presence-mapper**: the partner's reach and audience
  Store page: https://apify.com/mambalabs/company-social-presence-mapper

Runnable example input:

```json
{
  "domain": "customer.example",
  "technologies": [
    "hubspot",
    "segment"
  ],
  "crawl_additional_pages": true
}
```

## Method

1. Detect the overlap. Look at what your existing customers already use and who already serves them adjacent to your offer. That set is the partner list and it is evidence rather than a guess.
2. Rank by overlap size and by whether the partner has an incentive. A partner with a large overlap and no reason to care will not act.
3. Decide what you give before what you ask. A first approach that leads with an ask is a cold email with extra steps.
4. Structure the first exchange as a small reciprocal test: one introduction each way, or one piece of content each, with a date. Partnership agreements before a test are how these die.
5. Set the measurement: what a successful test looks like in referrals or meetings, and by when.
6. Cap the number of relationships at what can be serviced. An unserviced partner relationship is worse than none because it consumed the introduction.
7. Write down what happens if the test produces nothing, so the relationship ends cleanly rather than lingering.

## Output

The detected partner list ranked by overlap and incentive, what you give per partner, the reciprocal test with a date, the measurement, the capacity cap, and the clean ending condition.

## Quality bar

- Partners are found by detected overlap, not by brainstorm
- Partner incentive is assessed, not assumed
- The first exchange is a small reciprocal test with a date
- The relationship count is capped at serviceable capacity
- An ending condition is written

## Related skills

- `tech-stack-signal-reader`
- `client-onboarding-brief`
- `positioning-statement`

Ships in the **agency-delivery** pack.
