---
name: outbound-stack-fingerprint
description: |
  Detect whether a company runs cold outbound, which tools it sends with, and how many sending domains it operates. Use when selling to sales teams, sizing a competitor's outbound, or qualifying whether a prospect already runs the motion you sell into.
license: MIT
metadata:
  category: signal-research
  tags: [deliverability, signal_based_selling, signal_research]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Outbound Stack Fingerprint

## What this does

Whether a company already runs cold outbound is the single most useful qualifier for anyone selling outbound tooling or services, and it is visible from the outside: sending domains, mail records, and the fingerprints of the tools that provision them. This skill reads that infrastructure and reports scale as well as presence.

## When to use it

- do they run cold outbound
- what sequencer do they use
- how many sending domains
- size a competitor's outbound
- qualify an outbound buyer

## Inputs

- **domain**: the company domain
- **depth**: how thoroughly to probe for related sending domains

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

The fingerprint reads mail records and related sending domains directly rather than inferring the stack from a website tag.

- **outbound-infrastructure-fingerprint**: sending domain discovery and outbound tool fingerprinting
  Store page: https://apify.com/mambalabs/outbound-infrastructure-fingerprint

Runnable example input:

```json
{
  "domain": "example.com",
  "scan_sending_domains": true,
  "sending_domain_depth": "deep",
  "check_deliverability": false
}
```

## Method

1. Read the primary domain's mail configuration first, which tells you who they receive with and often who they send with.
2. Discover related sending domains. The count is the scale signal, and it is more informative than the tool name.
3. Fingerprint the provisioning pattern. Domains bought in a batch, with the same registrar and the same record template, indicate a deliberate outbound program rather than incidental sending.
4. Report scale in bands rather than as a precise count, because discovery is never exhaustive and a precise number implies a completeness the method does not have.
5. Read absence carefully. No detected sending domains means none were found, which is different from none existing.
6. Turn it into a qualification: already running the motion, running it badly, or not running it, each of which is a different conversation.

## Output

The mail configuration, the discovered sending domain list with a scale band, the provisioning pattern read, and the qualification with its angle.

## Quality bar

- Scale is reported as a band with the discovery limits stated
- No detection is reported as not found rather than as absence
- The provisioning pattern is assessed, not only the tool name
- The output ends in a qualification, not a tool list

## Related skills

- `tech-stack-signal-reader`
- `email-deliverability-audit`
- `gtm-signal-aggregator`

Ships in the **signal-based-selling**, **deliverability** packs.
