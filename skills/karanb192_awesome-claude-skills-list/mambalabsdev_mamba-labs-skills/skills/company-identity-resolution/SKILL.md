---
name: company-identity-resolution
description: |
  Resolve a messy company name to the right domain and canonical record, and say how confident the match is. Use when a list has company names but no domains, when names are ambiguous, or when enrichment is matching the wrong company.
license: MIT
metadata:
  category: identity-enrichment
  tags: [clay_operator, identity_enrichment]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Company Identity Resolution

## What this does

Every enrichment downstream is only as good as the identity it was run on, and company names collide constantly across markets, subsidiaries and rebrands. This skill resolves name to domain with a stated confidence, and refuses a low confidence match rather than guessing, because a wrong match silently poisons every column after it.

## When to use it

- I have company names but no domains
- the enrichment matched the wrong company
- resolve these company names
- which domain is this company
- ambiguous company names

## Inputs

- **names**: the company names as they appear
- **hints**: any extra context: country, industry, a person who works there
- **threshold**: the confidence below which you would rather have nothing

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Resolution takes a name, a domain, or a profile URL and returns the canonical record with the others filled in.

- **company-identity-resolver**: name, domain and profile URL reconciled into one canonical company record
  Store page: https://apify.com/mambalabs/company-identity-resolver

Runnable example input:

```json
{
  "company_name": "Example Co",
  "domain": "",
  "skipCache": "false"
}
```

## Method

1. Normalize the input names first: strip legal suffixes, punctuation and trailing descriptors, because those are the main source of false misses.
2. Resolve with whatever identifier is strongest. A profile URL beats a domain, a domain beats a name, and a name alone is the weakest input there is.
3. Return a confidence per match and set a floor. Below the floor, return nothing rather than a guess, and mark the row for human review.
4. Watch for the three collision types: same name different company, parent versus subsidiary, and pre rebrand versus post rebrand. Each needs a different tiebreak.
5. Use the hints as tiebreaks, not as filters, so a wrong hint does not eliminate the right answer.
6. Report the resolution rate for the batch, because that number decides whether the list is usable at all.

## Output

The resolved table with input, resolved domain, canonical name, confidence and method; the unresolved rows flagged for review; and the batch resolution rate.

## Quality bar

- Low confidence matches return nothing rather than a guess
- The confidence floor is stated as a number
- Parent and subsidiary collisions are handled explicitly
- The batch resolution rate is reported

## Related skills

- `linkedin-url-resolution`
- `legal-entity-resolution`
- `clay-dedupe-and-merge`

Ships in the **clay-operator** pack.
