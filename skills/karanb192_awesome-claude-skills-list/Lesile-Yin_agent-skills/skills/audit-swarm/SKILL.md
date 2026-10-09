---
name: audit-swarm
description: >-
  Fan out 4–5 role-specialised audit agents (regression / security / performance
  / coverage / style) over a code change, then merge findings with a
  noise-filtered severity model. Use as a wider-net alternative to a single
  review pass, or as a complement to prism-review when a change needs breadth.
---

# Audit Swarm

One reviewer sees one lens. audit-swarm sees many at once by spawning a small
swarm, each constrained to its lane, then merging without duplicating noise.

## When to use

- After a non-trivial change, before merge.
- When prism-review's four lenses need more coverage (e.g. a dedicated coverage
  or style lane).
- When a single model's review keeps missing a category of defect.

## Workflow

### Step 1 — Scope the swarm
Given the diff + intent brief, pick 4–5 lanes. Default set: regression,
security, performance, coverage, style. Drop a lane if the change can't touch
it; add one if the domain demands (e.g. i18n, accessibility).

### Step 2 — Dispatch with contracts
Each agent gets: the diff, the brief, and *exactly one* lane checklist (see
`references/lanes.md`, adapted from prism-review's lens model). Agents report
findings **only** in their lane; cross-lane observations go to merge as "notes".

### Step 3 — Merge with a noise filter
Dedupe by `file:line`. Collapse "looks fine" noise. Rank survivors by severity
(critical / major / minor / nit). A finding is *critical* only if it can cause
data loss, a security break, or a regression in shipped behavior.

### Step 4 — Emit the merged report
Table form: `file:line · lane · severity · one-line finding · suggested fix`.
Flag escalations (critical/major) for human review; nits may be auto-batched.

## Anti-patterns (never do these)

- Overlapping lanes — two agents auditing the same thing just doubles noise.
- Agents without a contract — they drift into generic "looks okay" spam.
- Running a swarm on a one-line typo diff — cost exceeds value.
- Severity inflation — not everything is "critical".

## Output contract

Return a merged findings table + an escalation list + a one-line coverage note
("N lanes, M findings, K critical"). No swarm runs without a diff and a brief.
