---
name: job-board-keyword-scanner
description: |
  Scan a company's job postings for the specific words that indicate a problem your product solves. Use when someone wants to find companies mentioning a tool, a process, or a pain in their job ads, or wants keyword based intent rather than role based intent.
license: MIT
metadata:
  category: signal-research
  tags: [signal_based_selling, signal_research]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Job Board Keyword Scanner

## What this does

Role titles are a coarse signal. The precise one lives in the body of the posting, where a company names the tool it is migrating off, the process it is trying to build, or the metric it is being measured on. This skill scans postings for a keyword set you define and reports which company said what, with the sentence around it.

## When to use it

- which companies mention this tool in job ads
- keyword intent from job postings
- find companies building this function
- scan job descriptions for a phrase
- job ad intent

## Inputs

- **domain**: the company domain, or a list
- **keywords**: the phrases that matter, and what each one implies
- **categories**: which role categories to scan

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

The scan reads full posting bodies from the company job board rather than titles from an index.

- **job-board-keyword-signal-scanner**: keyword hits inside job posting bodies, by role category
  Store page: https://apify.com/mambalabs/job-board-keyword-signal-scanner

Runnable example input:

```json
{
  "company_domain": "example.com",
  "role_categories": [
    "GTM"
  ],
  "custom_keywords": [
    "migrating",
    "outbound",
    "attribution"
  ],
  "enable_fallback": true
}
```

## Method

1. Define the keyword set with an implication per keyword. A keyword with no stated implication produces a hit nobody can act on.
2. Separate keywords that indicate a problem from keywords that indicate a competitor. They lead to different messages.
3. Scan and capture the sentence containing each hit, not just the count. The count is not the signal; the context is.
4. Discard hits inside boilerplate. Benefits sections and equal opportunity statements produce false positives on many common words.
5. Rank companies by the strength of the implication, not by hit count. One mention of the exact problem beats six mentions of a generic word.
6. Write the angle from the quoted sentence, so the outreach can reference something the company itself wrote.

## Output

A company by keyword table with the quoted sentence per hit, the implication, and a ranked shortlist with the angle per company.

## Quality bar

- Every keyword carries a stated implication
- Hits are reported with the surrounding sentence
- Boilerplate sections are excluded and this is stated
- Ranking is by implication strength, not hit count

## Related skills

- `hiring-signal-spotter`
- `tech-stack-signal-reader`
- `gtm-signal-aggregator`

Ships in the **signal-based-selling** pack.
