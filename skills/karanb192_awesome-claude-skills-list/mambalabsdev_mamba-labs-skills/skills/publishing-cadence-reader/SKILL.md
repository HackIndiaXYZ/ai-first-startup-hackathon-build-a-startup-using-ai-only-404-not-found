---
name: publishing-cadence-reader
description: |
  Measure how often a company actually publishes and read that as a content investment signal. Use when someone wants to know if a company invests in content, is benchmarking against competitors, or is qualifying a content marketing buyer.
license: MIT
metadata:
  category: seo-content
  tags: [seo_content, seo_content_engine, signal_based_selling]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Publishing Cadence Reader

## What this does

Publishing frequency is a public, dated, hard to fake statement about whether a company is investing in content, and it is one of the cleanest qualifiers for anyone selling content services or tooling. This skill measures the real cadence from the site, spots the gap where a program stopped, and reads acceleration and decline as separate signals.

## When to use it

- how often do they publish
- content investment signal
- benchmark competitor publishing
- qualify a content buyer
- did their blog stop

## Inputs

- **domains**: the companies to measure
- **window**: the period to measure over

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Cadence is measured from the site's own dated pages rather than from a feed, which catches sites whose feed is truncated or stale.

- **blog-publishing-frequency**: publishing volume and cadence by domain over a window
  Store page: https://apify.com/mambalabs/blog-publishing-frequency

Runnable example input:

```json
{
  "domains": [
    "example.com"
  ],
  "max_pages_to_date": 400
}
```

## Method

1. Measure over at least twelve months. A three month window cannot distinguish a seasonal gap from a program that stopped.
2. Report cadence as posts per month over time, not as a total. The shape is the signal and the total hides it.
3. Identify the inflection: the month the rate changed, up or down, and check it against public events such as a funding round or a leadership change.
4. Treat a stopped program and a never started program as different signals with different messages.
5. Check whether output is coming from one author or many, where the data allows, since a single author program is fragile and a multiple author program is a budget.
6. Do not read undated pages as absence. A site with no visible dates is unmeasured, not inactive.

## Output

The posts per month series, the inflection point with a date, the classification as accelerating, steady, declining or stopped, the author concentration where available, and the angle for that classification.

## Quality bar

- The window is at least twelve months
- Cadence is reported as a series, not a total
- Undated pages are reported as unmeasured, not as absence
- Stopped and never started are distinguished

## Related skills

- `first-party-data-post`
- `tech-stack-signal-reader`
- `gtm-signal-aggregator`

Ships in the **seo-content-engine**, **signal-based-selling** packs.
