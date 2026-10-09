---
name: domain-health-precheck
description: |
  Check whether one sending domain is safe for cold outreach by reading its SPF, DKIM and DMARC records and its blacklist status. Use when someone asks about email deliverability, domain health, SPF or DKIM or DMARC setup, whether a domain is blacklisted, or whether they will land in spam.
license: MIT
metadata:
  category: deliverability
  tags: [cold_email_system, deliverability]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Domain Health Precheck

## What this does

Before a single email leaves a domain, four things decide whether it arrives: a valid SPF record, a published DKIM selector, a DMARC policy that is not left at none forever, and a clean listing across the major blocklists. This skill checks all four on one domain and returns a plain verdict with the exact DNS records to add for anything that fails.

## When to use it

- check my domain
- am I going to land in spam
- is this domain blacklisted
- SPF DKIM DMARC setup
- domain health

## Inputs

- **domain**: the sending domain, not the website domain if they differ
- **provider**: which mail provider sends for it

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

The checks run live against DNS and public blocklists through the Mamba Labs deliverability actor, so the result is the current record rather than a cached report.

- **domain-deliverability-checker**: SPF, DKIM, DMARC and blacklist status for a sending domain
  Store page: https://apify.com/mambalabs/domain-deliverability-checker

Runnable example input:

```json
{
  "domains": [
    "example.com"
  ],
  "checkBlacklists": true
}
```

## Method

1. Read the SPF record. Check that it exists, that there is exactly one, that it authorizes the actual sending provider, and that it stays under the ten lookup limit.
2. Read DKIM at the selector the provider uses. A domain with no published selector is unsigned regardless of what the provider dashboard says.
3. Read DMARC. Report the policy, and treat a policy of none that has been in place for months as a finding rather than a pass.
4. Check the blocklists and report which one, since the delisting process differs per list.
5. Check whether the sending domain is the primary brand domain. Sending cold outreach from the primary domain puts the whole company's mail at risk and is the single most consequential finding.
6. Return a verdict: safe to send, safe after the listed fixes, or do not send. Give the exact record content to add, not a description of it.

## Output

A four row check table with the record found and the verdict, then the exact DNS records to add, then the one line overall verdict.

## Quality bar

- Every failed check comes with the literal record value to publish
- Multiple SPF records are reported as a failure, not merged
- A DMARC policy of none is reported with its age rather than passed silently
- Sending from the primary brand domain is called out explicitly

## Related skills

- `email-deliverability-audit`
- `domain-warmup-planner`
- `sending-capacity-planner`

Ships in the **deliverability**, **cold-email-system** packs.
