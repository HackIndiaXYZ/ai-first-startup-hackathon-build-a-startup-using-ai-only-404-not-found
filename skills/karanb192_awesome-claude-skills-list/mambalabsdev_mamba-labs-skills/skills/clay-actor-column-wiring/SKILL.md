---
name: clay-actor-column-wiring
description: |
  Wire an external actor or API into a Clay column so the types survive the round trip. Use when someone wants to call an Apify actor from Clay, add an HTTP API column, pass Clay values into a scraper, or is getting type errors from an external enrichment.
license: MIT
metadata:
  category: clay-builds
  tags: [clay_builds, clay_operator]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Clay Actor Column Wiring

## What this does

Clay sends every column value as a string. An external tool that declares a field as a number, a boolean or an array will reject or silently mishandle what Clay sends it. This skill covers the wiring: how to type the fields on the tool side, how to build the request body, and how to read the response back into extraction columns without guessing at the path.

## When to use it

- call an Apify actor from Clay
- add an HTTP API column
- pass Clay values to a scraper
- type error from external enrichment
- wire an actor into Clay

## Inputs

- **tool**: the actor or endpoint being called and its input schema
- **fields**: which Clay columns feed the request
- **output**: which fields you need back

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Read the tool's input schema. Every field the request will carry from Clay must be declared as a string on the tool side, with the tool coercing internally. A field declared as a number will fail validation on a value Clay sent as text.
2. Build the request body with the Clay column references, and send one row first. Not ten, one.
3. Open the column output preview on that one row and copy the actual response shape. Do not write extraction paths from documentation.
4. Decide whether the response is wrapped. Write the extraction path against what the preview shows.
5. Add extraction columns one field at a time, each verified on the same single row before adding the next.
6. Only then ramp to 10 rows, then 50 to 100, then the table.
7. Set a run condition on the actor column before the full ramp, because an external call is almost always the most expensive column in the table.

## Output

The request body, the verified extraction paths with the preview evidence they came from, the run condition, and the ramp plan.

## Quality bar

- Every field crossing the boundary is typed as a string on the tool side
- Extraction paths are quoted from the column preview, not from documentation
- The first run is one row
- The actor column carries a run condition before the full ramp

## Related skills

- `clay-failure-triage`
- `clay-build-gate`
- `clay-cost-audit`

Ships in the **clay-operator** pack.
