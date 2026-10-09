---
name: people-finder-recipe
description: |
  Find the right people at a list of companies without pulling a hundred irrelevant contacts per account. Use when someone needs contacts at target accounts, wants to cap contacts per company, or is building a people list from a company list.
license: MIT
metadata:
  category: identity-enrichment
  tags: [clay_operator, identity_enrichment]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# People Finder Recipe

## What this does

An uncapped people search returns whoever the source has most of, which is rarely the buyer. This skill sets the per company cap and the title filter before the search runs, uses the company's own team page as a second source where the database is thin, and reports contacts per company so a skewed distribution is visible.

## When to use it

- find contacts at these companies
- who works at this company
- build a people list from company list
- cap contacts per account
- find the buyer

## Inputs

- **companies**: the company list with domains
- **titles**: target titles and titles to exclude
- **cap**: maximum contacts per company

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Two complementary sources: a database backed people search, and a direct extraction from the company's own team page, which often carries the people a database is missing at smaller companies.

- **people-finder**: people search by company with title and seniority filters
  Store page: https://apify.com/mambalabs/people-finder
- **team-page-people-extractor**: people extracted directly from a company team or leadership page
  Store page: https://apify.com/mambalabs/team-page-people-extractor

Runnable example input:

```json
{
  "domain": "example.com",
  "targetCount": 3,
  "jobTitles": [
    "Head of Revenue Operations",
    "VP Sales"
  ],
  "excludeJobTitles": [
    "intern",
    "assistant"
  ]
}
```

## Method

1. Set the cap first. Contacts per company is a budget decision and an uncapped search will spend it on the largest company in the list.
2. Write the exclusion list before the inclusion list. Interns, assistants, advisors and alumni are the bulk of the noise and they are cheap to exclude.
3. Run the database search, then fall back to the team page extraction for companies that returned fewer than the cap. Smaller companies are systematically under represented in databases and well represented on their own site.
4. Report contacts per company as a distribution, not an average. An average of three hides a list where one company contributed forty.
5. Deduplicate people across companies before enrichment, because the same person appears at two companies during a job change.
6. Verify the position before enriching an email, so the waterfall is not spent on people who left.

## Output

The people list with company, title, source and confidence; the per company distribution; the companies that returned nothing; and the dedupe count.

## Quality bar

- The per company cap is set before the search
- Exclusions are written before inclusions
- Team page fallback is used for under filled companies
- Contacts per company is reported as a distribution
- People are deduplicated before any paid enrichment

## Related skills

- `contact-classification`
- `clay-waterfall-designer`
- `clay-people-search-workbook`

Ships in the **clay-operator** pack.
