---
name: public-award-prospecting
description: |
  Find companies that just won a government contract or public grant and reach them while the money is new. Use when someone wants to target contract winners, grant recipients, or public sector suppliers.
license: MIT
metadata:
  category: signal-research
  tags: [signal_based_selling, signal_research]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Public Award Prospecting

## What this does

A public award is a funding event with a public record, a date, and an amount, and it is far less contested than a venture round. This skill reads the award registers, filters to awards large enough to change behavior, resolves the recipient to a domain, and builds outreach timed to the award date.

## When to use it

- who won government contracts
- grant recipients
- public sector suppliers
- contract award prospecting
- federal award list

## Inputs

- **register**: which award register to read
- **window**: how far back to look
- **floor**: the minimum award value worth acting on

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Awards are read from the public register and the recipient is resolved to a company domain, which is the step that usually blocks this list from being usable.

- **public-award-monitor**: public contract and grant awards with recipient domain resolution
  Store page: https://apify.com/mambalabs/public-award-monitor

Runnable example input:

```json
{
  "register": "us_federal_contracts",
  "window_days": 30,
  "min_award_value": 250000,
  "exclude_government_recipients": true,
  "resolve_domains": true
}
```

## Method

1. Set the award floor from what the money would actually fund. An award below the cost of your offer is not a trigger.
2. Exclude government recipients. A public body receiving an award is not the same as a supplier winning one, and the two are mixed in most registers.
3. Resolve recipients to domains and report the resolution rate. An unresolved recipient is not a lead, and the rate tells you whether the register is usable for your market.
4. Read the award description for what is being delivered. That is where the angle is.
5. Time the outreach to the award date plus the ramp. Money awarded is not money spent, and spending starts weeks after the announcement.
6. Check for repeat winners. A company that wins the same award annually is running a program, not a project, and the message is different.

## Output

The filtered award list with recipient, domain, amount, date and description; the domain resolution rate; the timing plan; and the angle per award type.

## Quality bar

- Government recipients are excluded and the count is reported
- The domain resolution rate is stated
- The award floor is justified against the offer price
- Repeat winners are identified separately

## Related skills

- `funding-event-trigger`
- `event-presence-prospecting`
- `gtm-signal-aggregator`

Ships in the **signal-based-selling** pack.
