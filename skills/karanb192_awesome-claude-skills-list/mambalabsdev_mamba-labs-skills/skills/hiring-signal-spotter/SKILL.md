---
name: hiring-signal-spotter
description: |
  Read a company's open roles as a buying signal and turn them into an outreach angle. Use when someone asks about hiring signals, whether a company is investing in sales or growth, job board intent, or wants to research a prospect before outreach.
license: MIT
metadata:
  category: signal-research
  tags: [signal_based_selling, signal_research]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Hiring Signal Spotter

## What this does

Open roles are the most reliable public statement of what a company has decided to spend money on next quarter. This skill reads the roles from the applicant tracking system the company actually uses, separates the roles that mean something from the backfills that do not, and turns the surviving signal into one specific outreach angle.

## When to use it

- is this company hiring
- hiring signals for this domain
- are they investing in sales
- job board intent
- research this prospect before I reach out

## Inputs

- **domain**: the company domain
- **roles**: which role families matter for your offer

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Roles are read live from the company's own job board rather than from an aggregator, so the result reflects what is open today.

- **gtm-hiring-signal-scraper**: open roles from the company's applicant tracking system, filtered to the role families you care about
  Store page: https://apify.com/mambalabs/gtm-hiring-signal-scraper

Runnable example input:

```json
{
  "domain": "example.com",
  "role_filter": [
    "sales",
    "marketing",
    "revops"
  ],
  "mode": "single",
  "include_role_details": true
}
```

## Method

1. Pull the open roles. If the company has no discoverable job board, say so plainly rather than reporting zero roles as a finding, because absence of a board is not absence of hiring.
2. Separate net new roles from backfills where the posting makes it possible. A first sales hire and a fifth are different signals.
3. Read the seniority shape. Hiring a leader before the team means a function is being built; hiring the team before the leader means one is being scaled.
4. Read the copy of the posting itself, not just the title. The tools named in a job description are a tech stack signal, and the responsibilities are a statement of the problem they are hiring to solve.
5. Grade the signal: strong, moderate, or none, with the role that carries it named.
6. Write the outreach angle from the specific role, not from the fact of hiring. Referencing that they are hiring is generic; referencing what the role is being hired to fix is not.

## Output

The role list with dates, the signal grade with the role that carries it, the stack hints found in the descriptions, and one outreach angle in two sentences.

## Quality bar

- No discoverable job board is reported as unknown, never as zero
- The signal grade names the specific role that carries it
- The outreach angle references what the role is for, not that hiring is happening
- Role descriptions are read, not only titles

## Related skills

- `job-board-keyword-scanner`
- `gtm-signal-aggregator`
- `account-intelligence-brief`

Ships in the **signal-based-selling** pack.
