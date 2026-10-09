---
name: event-presence-prospecting
description: |
  Find which conferences a company sponsors, exhibits at, or speaks at, and use that as a budget and audience signal. Use when someone wants event based prospecting, wants to know if a prospect will be at a show, or is planning outreach around a conference.
license: MIT
metadata:
  category: signal-research
  tags: [signal_based_selling, signal_research]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Event Presence Prospecting

## What this does

Event presence is an unusually honest signal because it costs money and it is public. A company that buys a booth has both budget and a stated audience. This skill finds the events, separates sponsorship from attendance from speaking, and builds outreach that is timed to the event rather than generic.

## When to use it

- which conferences do they sponsor
- event based prospecting
- will this company be at the show
- conference outreach
- who exhibits at this event

## Inputs

- **domain**: the company domain
- **years**: which years to look at
- **event**: a specific event, if the question is about one

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Event presence is read from public sponsor, exhibitor and speaker listings for the years requested.

- **event-presence-index**: conference sponsorship, booth and speaker presence for a company
  Store page: https://apify.com/mambalabs/event-presence-index

Runnable example input:

```json
{
  "domain": "example.com",
  "company_name": "Example Co",
  "years": "2026",
  "include_own_events": true
}
```

## Method

1. Separate the three presence types. Sponsoring is a budget signal, exhibiting is a pipeline signal, and speaking is a positioning signal. They imply different things.
2. Check whether the company runs its own events. A company with its own conference has a different marketing posture than one that buys booths at other people's.
3. Read the audience of the events, not just the names. Which events a company buys is a statement about who it thinks its buyer is.
4. Time the outreach. Before the event is about planning, during is crowded, and two weeks after is when the follow up backlog is being worked and a relevant message lands.
5. Write the angle from the specific event and the specific presence type, never from the fact of attendance.
6. Note the events they stopped attending, where the data supports it. A dropped sponsorship is a signal too.

## Output

The event list by year with presence type, the audience read, the timing recommendation, and the angle.

## Quality bar

- Presence types are separated and each one is interpreted differently
- Own events are distinguished from third party events
- The timing recommendation is tied to a date relative to the event
- The angle names the specific event

## Related skills

- `gtm-signal-aggregator`
- `account-intelligence-brief`
- `public-award-prospecting`

Ships in the **signal-based-selling** pack.
