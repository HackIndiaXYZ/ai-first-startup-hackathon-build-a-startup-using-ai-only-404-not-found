---
name: tech-stack-signal-reader
description: |
  Detect which tools a company runs from its own website and turn the stack into a qualification and an angle. Use when someone wants to know what CRM or sequencer or analytics a company uses, wants to find companies on a competitor, or wants tech stack based targeting.
license: MIT
metadata:
  category: signal-research
  tags: [signal_based_selling, signal_research]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Tech Stack Signal Reader

## What this does

A detected tool is a fact; a useful signal is what the tool implies. This skill detects the stack from the live site, then reads it three ways: what it qualifies, what it disqualifies, and what it says about the company's maturity, which is usually the most useful of the three.

## When to use it

- what CRM do they use
- find companies using this tool
- detect their tech stack
- competitor displacement targeting
- what analytics are they running

## Inputs

- **domain**: the company domain
- **technologies**: the tools you care about detecting
- **meaning**: what each detection implies for your offer

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Detection reads the live site and its additional pages rather than a historical index, which is the difference between a current stack and one from two years ago.

- **gtm-tech-stack-signal-scraper**: tool detection from the live site, with additional page crawling
  Store page: https://apify.com/mambalabs/gtm-tech-stack-signal-scraper

Runnable example input:

```json
{
  "domain": "example.com",
  "technologies": [
    "hubspot",
    "segment",
    "intercom"
  ],
  "crawl_additional_pages": true
}
```

## Method

1. Detect on the live site, and crawl beyond the homepage. Many tools only load on a pricing, signup or documentation page.
2. Split the results into qualifiers, disqualifiers and maturity markers before writing anything.
3. Treat a missing detection as unknown rather than as absence. A tool loaded behind a login will never be detected from outside.
4. Read the combination, not the items. A modern analytics stack next to a legacy CRM is a specific and actionable situation; either one alone is not.
5. Write the angle from the gap the combination implies, not from the tool name. Naming their CRM back to them proves you ran a scanner.
6. State detection confidence per tool, because a script tag is stronger evidence than a favicon.

## Output

The detected stack with confidence per tool, the qualifier and disqualifier split, the maturity read, and one angle built from the combination.

## Quality bar

- A missing detection is reported as unknown, not as absence
- Pages beyond the homepage are crawled
- The angle comes from the combination rather than a single tool name
- Confidence is stated per detection

## Related skills

- `ai-adoption-signal-reader`
- `outbound-stack-fingerprint`
- `gtm-signal-aggregator`

Ships in the **signal-based-selling** pack.
