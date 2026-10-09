---
name: legal-entity-resolution
description: |
  Resolve a company domain to its registered legal entity, company number and tax identifier. Use when someone needs the legal name for a contract, is checking whether a company is registered, needs a VAT number, or is doing supplier due diligence.
license: MIT
metadata:
  category: identity-enrichment
  tags: [agency_delivery, clay_operator, identity_enrichment]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Legal Entity Resolution

## What this does

The trading name on a website and the registered entity that signs a contract are frequently different, and the gap is where invoicing, tax and diligence problems live. This skill resolves the domain to the register record, validates the tax identifier where it can, and states the jurisdiction rather than assuming one.

## When to use it

- what is their legal entity
- company registration number
- VAT number for this company
- supplier due diligence
- legal name for the contract

## Inputs

- **domain**: the company domain
- **jurisdiction**: the expected country of registration, if known
- **strictness**: whether a near name match is acceptable

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:


If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

The register lookup and tax identifier validation run live against the public registers rather than a cached copy.

- **legal-entity-resolver**: domain to registered entity, company number and validated tax identifier
  Store page: https://apify.com/mambalabs/legal-entity-resolver

Runnable example input:

```json
{
  "domain": "example.com",
  "jurisdiction_hint": "GB",
  "match_strictness": "exact",
  "validate_vat": true
}
```

## Method

1. Resolve against the register for the jurisdiction, and state which register was used. A match in the wrong register is worse than no match.
2. Prefer an exact name match. A near match on a common trading name will find a different company with a similar name, and that error is expensive downstream.
3. Validate the tax identifier rather than reporting the one on the website, because website tax numbers are frequently stale or belong to a different group entity.
4. Where a group structure exists, report the entity that matches the domain and note the parent rather than silently returning either.
5. Report status. A dissolved or dormant entity is a material finding for diligence and a blocker for a contract.
6. Return nothing rather than a low confidence match, and say what additional input would resolve it.

## Output

The entity record with registered name, number, jurisdiction, status and validated tax identifier, the group note where applicable, and the confidence.

## Quality bar

- The register used is named
- The tax identifier is validated, not copied from the website
- Entity status is reported
- A low confidence result returns nothing and names the missing input

## Related skills

- `company-identity-resolution`
- `firmographic-enrichment`
- `client-onboarding-brief`

Ships in the **clay-operator**, **agency-delivery** packs.
