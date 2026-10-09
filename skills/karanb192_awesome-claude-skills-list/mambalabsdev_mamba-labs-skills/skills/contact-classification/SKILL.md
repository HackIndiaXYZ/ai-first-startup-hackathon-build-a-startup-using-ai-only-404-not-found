---
name: contact-classification
description: |
  Classify contacts by department, seniority and role from their job title, and route them to the right persona. Use when a contact list has messy titles, when routing by persona, or when deciding who in a company to actually contact.
license: MIT
metadata:
  category: identity-enrichment
  tags: [clay_operator, identity_enrichment, signal_based_selling]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Contact Classification

## What this does

Job titles are unstandardized across companies and countries, and title matching by keyword sends the wrong message to the wrong person at scale. This skill classifies to department and seniority rather than matching strings, handles the ambiguous titles explicitly, and routes each contact to a persona with a stated confidence.

## When to use it

- classify these job titles
- route contacts by persona
- who should I contact at this company
- messy title data
- seniority filtering

## Inputs

- **contacts**: names and titles, with company domain where available
- **personas**: your personas and what distinguishes them
- **routing**: what each persona should receive

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Classification runs per title with optional position verification, so a title that is out of date can be caught rather than routed on.

- **contact-classifier**: department, seniority and role classification from a job title
  Store page: https://apify.com/mambalabs/contact-classifier

Runnable example input:

```json
{
  "job_title": "Vice President, Revenue Operations",
  "company_domain": "example.com",
  "verify_position": true
}
```

## Method

1. Classify to department and seniority first, and only then to persona. Persona is a business concept and it changes; department and seniority do not.
2. Handle the ambiguous families explicitly rather than letting them fall to a default: founder titles at small companies that cover several departments, regional titles that look senior and are not, and consultant or advisor titles that indicate no authority at all.
3. Verify position where the list is old. A title that was right two years ago routes a message to someone who left.
4. Set the seniority floor per persona and state what happens to contacts below it: dropped, or kept as a coach rather than a buyer.
5. Report the unclassifiable share. A high share means the titles need a different source, not a better classifier.
6. Attach a confidence and route low confidence contacts to a generic sequence rather than a persona specific one, because a wrong persona message is worse than a general one.

## Output

The classified table with department, seniority, persona, confidence and route; the ambiguous families flagged; and the unclassifiable share.

## Quality bar

- Department and seniority are derived before persona
- Ambiguous title families are handled explicitly, not defaulted
- The unclassifiable share is reported
- Low confidence contacts route to a generic sequence

## Related skills

- `people-finder-recipe`
- `icp-definition-builder`
- `cold-email-sequence-system`

Ships in the **clay-operator**, **signal-based-selling** packs.
