---
name: prism-review
description: >-
  Multi-lens parallel code review. Splits one change into four independent
  review lenses — correctness, security, performance, contracts — runs them in
  parallel as read-only passes, then merges findings into a severity-ranked
  report with noise filtered out. Use before merging non-trivial changes, and
  automatically escalate to deep review when auth/payment/crypto paths are
  touched.
---

# Prism Review

One change, four lenses, one merged verdict. A white beam through a prism
splits into distinct bands; a code change through this skill splits into four
independent examinations that never contaminate each other, then recombines
into a single ranked report.

## Why parallel lenses

A single reviewer carrying four concerns in their head produces two failure
modes: anchoring (the first bug found colors everything after) and fatigue
(lens #4 gets a skim). Independent passes avoid both, and their disagreement
is signal — a finding confirmed by two lenses is almost never noise.

## Scope resolution

Determine what to review, in this priority order:

1. Files/dirs explicitly named by the user.
2. `git diff --staged` if non-empty, else `git diff`.
3. Diff between current branch and its base (`git merge-base HEAD main`).
4. Files modified in the last 3 commits.

State the resolved scope in one line before starting. If the scope exceeds
~800 changed lines, split it and review chunk by chunk.

## The four lenses

Each lens is a **read-only** pass: no edits, no formatting, no refactors.
Full checklists live in `references/lenses.md`.

| Lens | Question it answers | Typical findings |
|---|---|---|
| L1 Correctness | Does it do what it claims, and did anything regress? | Logic errors, off-by-one, broken invariants, missing migration |
| L2 Security | Can anyone make it do what we didn't intend? | Injection, authz gaps, secrets, unsafe deserialization |
| L3 Performance | Will it stay fast under real load? | N+1 queries, unbounded caches, O(n²) in hot paths |
| L4 Contracts | Do the seams still fit? | API/schema breaks, untested branches, doc drift |

### Running the lenses

- **Full mode (default)**: run all four lenses as separate parallel passes
  (subagents when available, otherwise four strictly sequential passes with
  fresh context each). Each pass receives only: the diff, the intent brief
  (below), and its own checklist.
- **Quick mode** (user says "quick", or diff < 40 lines): a single pass with
  all four checklists, explicitly labeled as quick — it must not claim the
  confidence of full mode.

### Intent brief

Before any lens runs, build a short intent brief:

1. Read AGENTS.md / README / PR description if present.
2. Summarize in ≤ 5 bullets: what the change is *supposed* to do and any
   stated constraints.
3. Pass the same brief to every lens. Lenses judge against intent, not taste.

## Escalation rule

If the diff touches paths matching `auth`, `session`, `payment`, `billing`,
`crypto`, `secret`, `migration`, or deletes tests, announce:
"Escalating to deep review" — and for each lens, additionally require:
line-by-line reading of changed security-sensitive functions (L2), and an
explicit "what must be true for this to be safe" statement per function.

## Merge protocol

After all lenses finish, the merging step:

1. Collect findings; deduplicate by root cause (two lenses, same bug → one
   finding, marked `confirmed×2`).
2. Drop anything that is style preference, hypothetical ("might someday"),
   or unactionable without more info (convert those into questions instead).
3. Rank what remains:

| Severity | Meaning | Merge impact |
|---|---|---|
| 🔴 Critical | Data loss, security hole, guaranteed regression | Block merge |
| 🟠 Major | Incorrect in realistic cases, contract break | Fix before merge |
| 🟡 Minor | Correct but fragile, missing edge handling | Fix now or file issue |
| ⚪ Note | Worth knowing, no action required | Informational |

4. Render with `templates/report.md`. Every finding must carry: file:line,
   the lens that found it, one-sentence why-it-matters, and a concrete fix
   suggestion. No finding without all four.

## Output contract

- One report, severity-ordered, Critical first.
- End with a single verdict line: `VERDICT: BLOCK / FIX-FIRST / MERGE-OK`.
- If zero findings above ⚪: say so plainly; do not invent concerns to look
  thorough. An empty report is a valid report.
