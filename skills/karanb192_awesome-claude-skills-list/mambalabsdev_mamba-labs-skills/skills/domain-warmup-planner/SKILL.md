---
name: domain-warmup-planner
description: |
  Plan the warmup ramp for new sending domains and inboxes so real campaign volume starts on the date it is needed. Use when someone bought new domains, is adding inboxes, asks how long warmup takes, or needs to know when they can start sending for real.
license: MIT
metadata:
  category: deliverability
  tags: [deliverability]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Domain Warmup Planner

## What this does

Warmup is a scheduling problem more than a technique problem. The question that matters is not how to warm up but whether the domains bought today can carry the volume the campaign needs on its start date. This skill works backward from the campaign date, computes the required ramp, and says plainly whether the date holds.

## When to use it

- I bought new domains
- how long does warmup take
- when can I send for real
- adding inboxes
- warmup schedule

## Inputs

- **domains**: new domains and their registration dates
- **target**: the volume the campaign needs per day
- **date**: the campaign start date

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:


If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Work backward from the campaign date and the target daily volume to the number of inboxes needed at steady state.
2. Compute the ramp per inbox: a conservative daily increase from a small base, with the increase paused rather than continued whenever a bounce or complaint appears.
3. Add domain age. A domain registered days ago carries reputation risk independent of its warmup volume, so age and volume are two separate clocks.
4. Sum the ramp to the campaign date and compare against the target. State the gap in emails per day, not as a percentage.
5. If the date does not hold, give exactly two options: move the date, or add inboxes, with the number of inboxes and their cost.
6. Set the checkpoints: the dates on which the ramp should be reviewed and the metric that would pause it.

## Output

A per inbox ramp table to the campaign date, the achievable volume against the target, the gap, the two options if there is a gap, and the review checkpoints.

## Quality bar

- Domain age and warmup volume are treated as two separate clocks
- The gap is stated in emails per day
- The pause metric is named and has a threshold
- The options are concrete, with inbox counts and costs

## Related skills

- `domain-health-precheck`
- `sending-capacity-planner`
- `email-deliverability-audit`

Ships in the **deliverability** pack.
