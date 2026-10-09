---
name: agent-readability-audit
description: |
  Check whether a website can be read and used by AI agents, and fix what blocks them. Use when someone asks about AI search visibility, agent accessibility, structured data, or whether their site works for AI crawlers.
license: MIT
metadata:
  category: seo-content
  tags: [seo_content, seo_content_engine]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Agent Readability Audit

## What this does

A growing share of buying research happens through agents that never render a page. What they can read is a small, checkable set of things: the crawl directives, the structured data, the machine readable endpoints, and whether the important content survives without scripting. This skill audits those four and returns the fixes in the order that changes an agent's answer.

## When to use it

- AI search visibility
- can agents read my site
- structured data audit
- llms txt
- AI crawler accessibility

## Inputs

- **domain**: the site to audit
- **pages**: the pages that matter commercially

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

The audit reads the live site's crawl directives, structured data and endpoints.

- **agent-accessibility-auditor**: crawl directives, structured data, endpoints and agent readability checks
  Store page: https://apify.com/mambalabs/agent-accessibility-auditor

Runnable example input:

```json
{
  "domain": "example.com",
  "checks": [
    "llms_txt",
    "robots"
  ],
  "check_endpoints": true,
  "check_structured_data": true
}
```

## Method

1. Check the crawl directives first. A site that blocks agent user agents has one fix that makes every other fix matter, and many sites block them without knowing.
2. Check structured data on the commercially important pages, not on the homepage. Product, pricing and documentation pages are where an agent answer is sourced.
3. Check whether the key content is present without scripting. Content that requires a rendered page is invisible to a large share of readers.
4. Check the machine readable surfaces: a documentation endpoint, a sitemap that is current, and any published index of what the site contains.
5. Rank the fixes by whether they change what an agent can answer. A missing schema type on a blog post does not; a blocked user agent does.
6. Re test after fixing rather than assuming, since crawl directives interact in ways that are easy to get wrong.

## Output

A four section audit with pass or fail per check, the ranked fix list with the answer each fix unblocks, and the re test result.

## Quality bar

- Crawl directives are checked before anything else
- Structured data is checked on commercially important pages, not the homepage
- Content availability without scripting is tested
- Fixes are ranked by what they change in an agent answer
- A re test is run after the fixes

## Related skills

- `listing-page-optimizer`
- `programmatic-seo-planner`
- `comparison-page-builder`

Ships in the **seo-content-engine** pack.
