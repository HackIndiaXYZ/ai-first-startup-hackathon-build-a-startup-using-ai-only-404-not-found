---
name: firmographic-enrichment
description: |
  Fill headcount, industry, headquarters and revenue band on a company list, and report honestly which fields actually filled. Use when a list needs firmographics, when qualification needs company size, or when someone asks how complete their company data is.
license: MIT
metadata:
  category: identity-enrichment
  tags: [clay_operator, identity_enrichment]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Firmographic Enrichment

## What this does

Firmographic enrichment always looks like it worked, because the rows that filled are visible and the rows that did not are blank rather than flagged. This skill enriches, then measures coverage per field, so a qualification rule built on a field that is only forty percent populated is caught before it silently disqualifies half the list.

## When to use it

- enrich these companies
- add headcount and industry
- how complete is my company data
- company size for qualification
- firmographics

## Inputs

- **domains**: the company list
- **fields**: which fields the downstream qualification actually needs

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Enrichment runs in batch across the domain list and returns per field values so coverage can be measured rather than assumed.

- **company-firmographic-enricher**: headcount, industry, headquarters and revenue band by domain
  Store page: https://apify.com/mambalabs/company-firmographic-enricher

Runnable example input:

```json
{
  "domains": [
    "example.com",
    "example.net"
  ],
  "batchSize": 5
}
```

## Method

1. Name the fields the downstream rule needs before enriching, so coverage is measured against a requirement rather than reported in general.
2. Enrich in batch and keep the raw response, because a field can be present in the response and lost in extraction.
3. Measure coverage per field as a share of rows, and report it next to the requirement.
4. For any required field below the coverage the rule needs, either find a second source or change the rule. Running a rule on a sparse field is the failure mode.
5. Check the shape of what filled. Headcount as a band and headcount as a number are different fields and a rule written for one breaks on the other.
6. Spot check ten rows against the companies' own sites. Enrichment sources disagree with reality often enough that a sample is not optional.

## Output

The enriched table, a coverage table per field against the requirement, the fields that fell short with the recommendation, and the spot check result.

## Quality bar

- Coverage is reported per field as a share of rows
- Required fields below the needed coverage are flagged with a recommendation
- Band and numeric shapes are distinguished
- A ten row hand check against source sites is included

## Related skills

- `company-identity-resolution`
- `icp-fit-scoring`
- `clay-build-gate`

Ships in the **clay-operator** pack.
