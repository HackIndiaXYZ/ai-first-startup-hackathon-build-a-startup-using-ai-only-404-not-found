---
name: sequencer-campaign-config
description: |
  Configure a sending platform campaign correctly the first time: schedule, tracking, limits, timezone and the fields that silently reset. Use when creating a campaign in a sequencer, when settings appear not to save, or when a campaign is sending at the wrong time.
license: MIT
metadata:
  category: outbound-email
  tags: [cold_email_system, outbound_email]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Sequencer Campaign Config

## What this does

Sequencer campaign settings have a specific failure shape: some fields are dropped silently at creation and must be set in a second update call, and some values that look valid are rejected or, worse, stored as a literal zero. This skill sets the configuration in the order that survives, then reads it back and diffs it against what was intended.

## When to use it

- set up a campaign in my sequencer
- my campaign settings did not save
- sending at the wrong time
- configure tracking and limits
- campaign schedule

## Inputs

- **platform**: which sending platform
- **schedule**: sending days, hours and the recipient timezone
- **limits**: per account daily limit and campaign level caps
- **tracking**: open and click tracking preference

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Pushing a finished list into the sequencer can run through the Mamba Labs push actor rather than a manual CSV, which keeps the field names identical between the enrichment table and the campaign payload.

- **clay-to-instantly-smartlead-push**: push enriched rows into a sequencer campaign with the field names preserved
  Store page: https://apify.com/mambalabs/clay-to-instantly-smartlead-push

Runnable example input:

```json
{
  "campaign_id": "example-campaign",
  "leads": [
    {
      "email": "jordan@example.com",
      "first_name": "Jordan",
      "company": "Example Co"
    }
  ]
}
```

## Method

1. Create the campaign with the minimum viable settings, then set the rest in a second update. Fields dropped at creation are the most common cause of a campaign that sends with tracking on when tracking was meant to be off.
2. Set the timezone with the exact identifier the platform accepts. Platform timezone enums are not the standard database list and a rejected value falls back to a default silently on some platforms.
3. Distinguish clearing a field from setting it to zero. On several platforms null removes the setting and zero stores a literal zero, which is a hard cap of nothing.
4. Turn open tracking off unless there is a specific reason for it. Tracking pixels cost deliverability and the metric they produce is unreliable.
5. Set the daily limit per account below the platform maximum, leaving headroom for follow up steps already in flight.
6. Read the campaign back through the API or the interface and diff every field against the intent. This step is the point of the skill.
7. Send one test to a seed address on a different provider and read the raw source, not the rendered preview.

## Output

The configuration as set, the read back diff with any field that did not stick, and the seed test result.

## Quality bar

- Configuration is read back and diffed, not assumed
- The timezone identifier used is one the platform accepts
- Null and zero are treated as different values and this is stated
- A seed test is sent and its raw source is read

## Related skills

- `merge-variable-linter`
- `wave-launch-precheck`
- `sending-capacity-planner`

Ships in the **cold-email-system** pack.
