---
name: crm-hygiene-sweep
description: |
  Run a recurring cleanup on new and changed CRM records so the database stops degrading between audits. Use when someone wants ongoing data hygiene, has just finished a cleanup and wants it to hold, or needs a weekly CRM routine.
license: MIT
metadata:
  category: crm-operations
  tags: [crm_operations, crm_operations_pack]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# CRM Hygiene Sweep

## What this does

A CRM cleaned once is dirty again in a quarter, because the intake keeps producing the same defects. This skill fixes the records that arrived since the last sweep, measures the drift rate, and points at the intake that caused it, so the sweep gets shorter over time instead of longer.

## When to use it

- weekly CRM cleanup
- keep the CRM clean
- data hygiene routine
- we cleaned it and it is dirty again
- new record hygiene

## Inputs

- **window**: records created or changed since when
- **standards**: the field standards the records should meet
- **intakes**: the forms, imports and integrations that create records

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Scope to the window. A sweep that re examines the whole database is an audit and it will not run weekly.
2. Check the standard set: owner present, lifecycle value valid, required fields populated, geography and industry values from the picklist rather than free text, and email present and formatted.
3. Fix the mechanical ones automatically and list the judgment ones for a person, and keep those two lists separate so nobody has to sort them.
4. Attribute every defect to its intake. That attribution is what makes the sweep shrink, because a form fixed once removes a defect class permanently.
5. Report the drift rate: defects per hundred new records, tracked over sweeps. A flat or rising rate means the intake work is not happening.
6. Cap the manual list. If it exceeds what a person will actually do, the excess is a fix at the intake, not a queue.

## Output

The window counts, the defect table by type, the automatic fixes applied, the manual list within its cap, the intake attribution, and the drift rate over the last several sweeps.

## Quality bar

- The sweep is scoped to a window, not the whole database
- Automatic and manual fixes are listed separately
- Every defect is attributed to an intake
- The drift rate is tracked across sweeps
- The manual list is capped and the excess is routed to an intake fix

## Related skills

- `crm-audit`
- `crm-dedupe-plan`
- `crm-enrichment-refresh`

Ships in the **crm-operations-pack** pack.
