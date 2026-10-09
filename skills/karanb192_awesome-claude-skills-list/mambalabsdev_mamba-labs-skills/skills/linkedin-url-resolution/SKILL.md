---
name: linkedin-url-resolution
description: |
  Turn a list of company domains into company profile URLs, and fill the gaps a native enrichment leaves behind. Use when a profile URL column has holes, when someone needs profile URLs from domains, or when building a social enrichment pipeline.
license: MIT
metadata:
  category: identity-enrichment
  tags: [clay_operator, identity_enrichment, linkedin_authority]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# LinkedIn URL Resolution

## What this does

Native enrichments resolve most domains to a company profile and quietly return nothing for the rest, and the rest is where the interesting companies often are. This skill resolves the list, reports the fill rate, and handles the specific cases that cause misses: holding company structures, country subsidiaries, and companies whose profile name does not resemble their domain.

## When to use it

- find LinkedIn URLs from domains
- my LinkedIn column has gaps
- domain to LinkedIn
- enrich with social data
- resolve company profiles

## Inputs

- **domains**: the domain list
- **names**: company names where available, which improve the match

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Resolution runs domain to company profile directly, and can return firmographics in the same call so a second enrichment is not needed.

- **domain-to-linkedin-url-resolver**: company domain to company profile URL, with optional firmographics
  Store page: https://apify.com/mambalabs/domain-to-linkedin-url-resolver

Runnable example input:

```json
{
  "company_domain": "example.com",
  "company_name": "Example Co",
  "includeFirmographics": "true"
}
```

## Method

1. Normalize domains before resolving: lowercase, strip protocol, strip the www prefix, and drop tracking parameters.
2. Pass the company name alongside the domain where you have it. The pair resolves materially better than the domain alone.
3. Report the fill rate before and after. The point of this skill is the gap it closes, so the gap has to be measured.
4. Handle the three miss patterns: a holding company domain whose profile is under a trading name, a country subsidiary that shares a domain with a global parent, and a company whose profile name shares no tokens with its domain.
5. Decide the parent versus subsidiary rule up front, because both are correct answers to different questions and mixing them corrupts follower and headcount data.
6. Spot check a sample by hand. Resolution rates look fine right up until they are matching the wrong entity.

## Output

The resolved table with domain, profile URL, matched name and confidence; the fill rate before and after; the unresolved list with its miss pattern; and the sample check result.

## Quality bar

- Fill rate is reported before and after
- The parent versus subsidiary rule is decided and stated
- Unresolved rows are labeled with a miss pattern rather than left blank
- A hand checked sample is included

## Related skills

- `company-identity-resolution`
- `social-presence-reader`
- `clay-dedupe-and-merge`

Ships in the **clay-operator**, **linkedin-authority** packs.
