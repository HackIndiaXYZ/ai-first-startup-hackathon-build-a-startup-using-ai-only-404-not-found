---
name: ai-adoption-signal-reader
description: |
  Detect whether a company has shipped AI features or adopted AI vendors, and read that as a budget and priority signal. Use when someone targets companies adopting AI, wants to know if a prospect is building AI features, or needs an AI readiness read on an account list.
license: MIT
metadata:
  category: signal-research
  tags: [signal_based_selling, signal_research]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# AI Adoption Signal Reader

## What this does

AI adoption splits companies into three groups that need different messages: shipped it, announced it, and neither. This skill detects vendor presence and product surface on the live site, places the company in one of the three, and reads the pricing page for whether the AI is a feature or a line item, which is the part that indicates real budget.

## When to use it

- are they using AI
- find companies adopting AI
- AI readiness of this account list
- did they ship AI features
- AI vendor detection

## Inputs

- **domain**: the company domain
- **vendors**: which AI vendors or surfaces to check for

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Vendor detection and the pricing page read run against the live site.

- **ai-tooling-detector**: AI vendor presence, product surface and pricing signals from the live site
  Store page: https://apify.com/mambalabs/ai-tooling-detector

Runnable example input:

```json
{
  "domain": "example.com",
  "vendors": [
    "openai",
    "anthropic"
  ],
  "check_pricing": true
}
```

## Method

1. Detect vendor presence on the live site and in the product surface.
2. Read the pricing page. An AI capability that appears as a priced tier or an add on is a budget signal; one that appears only in marketing copy is an announcement.
3. Place the company: shipped, announced, or neither, and say which evidence put it there.
4. For shipped, the angle is operational, about what happens after launch. For announced, the angle is about the gap between announcement and delivery. For neither, do not invent an AI angle at all.
5. Cross check against hiring. A company with no AI on the site and three AI roles open is in the announced group, not the neither group.
6. State what would change the classification, so the read can be refreshed rather than repeated.

## Output

The classification with its evidence, the pricing read, the cross check against hiring, the angle for that group, and the refresh trigger.

## Quality bar

- The classification names the evidence that produced it
- No AI angle is written for the neither group
- Pricing evidence is distinguished from marketing copy
- The hiring cross check is run before the classification is final

## Related skills

- `tech-stack-signal-reader`
- `hiring-signal-spotter`
- `gtm-signal-aggregator`

Ships in the **signal-based-selling** pack.
