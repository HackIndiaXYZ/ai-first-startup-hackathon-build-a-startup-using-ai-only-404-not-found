---
name: workflow-design
license: MIT
description: Models, proves, measures, and safely changes multi-step workflows — approval chains, review pipelines, intake/triage/fulfillment flows, ticketing, order processing, state machines with human gates. Use when designing states/gates/transitions or an audit trail, when a status field or event log is being added to a system, when tests guarding a workflow need auditing ("the suite is green but I don't trust it"), when someone asks where items get stuck, whether an approval step is worth keeping, who approved something, or why a queue is growing, or when a live workflow's definition must change with items still in flight. Also covers spreadsheet/paper approval processes, human review of AI or agent output, SLA/escalation design, and the workflow-engine-vs-hand-rolled decision. Stack-agnostic; ships four dependency-free tools (flow linter, guard red-proof runner, transition-log metrics, log-vs-model conformance).
---

# Workflow design, proof, and dynamics

A workflow is anything an item moves through: intake → review → approval → fulfillment,
draft → edit → publish, ticket → triage → assignment → close. It has **stations** (where an
item waits), **gates** (where a decision is made), and **transitions** (how it moves).

## Which phase am I in?

Route by the situation, not by curiosity — read only the reference the task needs:

- **Designing a flow, adding a status field, or reviewing a data model** → Phase 1.
- **Auditing tests, a green suite that shipped a bug, "do these tests protect anything?"** → Phase 2.
- **"Where do items get stuck?", "is this approval step worth it?", reading an event log** → Phase 3.
- **The flow's definition is changing while items are in flight** → Phase 4 (and capture
  the Phase 3 baseline *first*).

And four contexts that change *where* the rules land, not the rules — read alongside the
phase you are in:

- **No code at all** — the flow runs on spreadsheets, forms, or paper →
  [references/human-flows.md](references/human-flows.md) (the log is a sheet; the CSV
  bridge feeds `dynamics.py` unchanged).
- **A human gate reviews AI/agent output** — drafts, classifications, proposed actions →
  [references/ai-gates.md](references/ai-gates.md) (the agent is an actor, never a
  decider; rubber-stamp detection; a prompt change is a flow change).
- **Time promises** — SLAs, deadlines, reminders, escalation →
  [references/slas.md](references/slas.md) (an SLA needs an execution point; deadlines
  stored, not recomputed; set bounds from measured p90).
- **Choosing the substrate** — hand-rolled tables vs a workflow engine →
  [references/engines.md](references/engines.md) (engines orchestrate code, these flows
  orchestrate decisions; the hybrid; keep your own log either way).

Four phases, in order. Skipping phase 1 makes phase 3 impossible — the metrics that tell you
where a flow is stuck can only be computed from a transition log that was designed to support
them. Phase 4 is where flows that survived the first three break anyway.

| Phase | Question | Read | Run |
|---|---|---|---|
| **1. Model** | What are the states, who may move an item, what is recorded? | [references/modeling.md](references/modeling.md) | `flowcheck.py my-flow.json` |
| **2. Prove** | Do the tests guarding this flow actually catch anything? | [references/proving.md](references/proving.md) | `redproof.py spec.json` |
| **3. Measure** | Where does the flow stall, and which gate is theater? | [references/dynamics.md](references/dynamics.md) | `dynamics.py --db app.sqlite` |
| **4. Change** | How do you move a flow that is full of in-flight items? | [references/evolving.md](references/evolving.md) | (checklist) |

For a full engagement (new flow, end to end), copy this checklist and check items off as
you go:

```
Workflow progress:
- [ ] Model drafted as a flow JSON; flowcheck.py exits 0
- [ ] Transition log designed (actor_kind on every row, enumerated reason codes)
- [ ] Guards implemented; every guard has an assertion
- [ ] redproof spec written; every guard went red and was restored
- [ ] Anything visible opened in a real client
- [ ] Metrics run once on real or fixture data; refusals fixed at the log, not the metric
- [ ] Before any later definition change: phase-3 baseline captured
```

## The tools

Four stdlib-only Python scripts. Each has `--selftest`, and each is red-proofed by a shipped
spec — including the red-prover itself.

| Tool | What it does |
|---|---|
| [`scripts/flowcheck.py`](scripts/flowcheck.py) | Lints a flow definition: unreachable states, dead ends, gates with no rejection destination, rejections with no enumerated reason, automatic transitions wearing a human decision's name. Suppression only via a reasoned `allow` list, and an `allow` entry that suppresses nothing is itself reported. |
| [`scripts/redproof.py`](scripts/redproof.py) | Proves both sides of every guard: removes it and requires your suite to go **red**, then runs it in place against a **known-good artifact** and requires it to pass (catching guards that reject everything). Where a guard checks an agreement, it forces **both halves to be read from the built artifact** and refuses an assumed side. Restores files byte-for-byte. |
| [`scripts/dynamics.py`](scripts/dynamics.py) | Computes the metrics below (plus the top real paths items take) from a SQLite transition log. Refuses any metric the log cannot support instead of printing a confident wrong number. |
| [`scripts/conformance.py`](scripts/conformance.py) | Holds the real log against the declared flow model, both directions: observed transitions the model forbids (off-model moves, broken per-item chains, exits from terminal states, auto passes recorded as human, undeclared rejection reasons) and declared edges nobody has ever taken. Reports per-item **trace fitness**. No allowlist on purpose: a violation means the model file or the code is wrong, and the model file is cheap to fix. |

```bash
python scripts/flowcheck.py --selftest && python scripts/redproof.py --selftest && python scripts/dynamics.py --selftest && python scripts/conformance.py --selftest
```

The model you lint in phase 1 is not documentation that rots — `conformance.py` turns it
into an executable claim about production: `--db app.sqlite --flow my-flow.json`. Run it
whenever the log and the model might have drifted, and after any phase-4 change.

Each tool is a feedback loop, not a one-shot check: run it, fix what it reports, run it
again, and only move on at exit 0. For `flowcheck`, fix the model (or add a *reasoned*
`allow` entry) — never delete the rule. For `redproof`, a guard that stays green means fixing
the **assertion or the fixture**, not the spec. For `dynamics`, a refused metric means fixing
the **log**, not computing the number another way.

[`examples/intake.flow.json`](examples/intake.flow.json) is a worked flow that passes
`flowcheck` cleanly — the fastest way to see the modeling rules as a concrete object.

Every rule below came from a flow that shipped and then failed in a specific way. They are
stack-independent: the examples may be SQL or shell, but no rule depends on a language,
a database, or a framework.

---

## Phase 1 — Model

**One current value plus an append-only history. Never two competing fields.**
`status` and `is_approved` will diverge. The one that a screen reads and the one that a
guard reads will not be the same one. Keep a single current state, and a separate
transition log that only ever gets rows appended.

**Every transition is an event with a name, an actor, and a timestamp.**
"Who moved this and when" is not an audit luxury — it is the raw material of phase 3.
Without an actor on every row, you cannot compute a single dynamics metric.

**Never name an automatic state after a human decision.**
If nobody looked at it, it is not `approved`; it is `auto_passed` or `skipped`. The moment
the two share a name, the most valuable metric you have — *what fraction of this gate is
actually a human decision* — becomes uncomputable, and every audit that reads the log lies.

**Store what you route on; never recompute it at read time.**
If an item is routed to a queue based on a lookup (category → team), write the resolved key
onto the item at the moment of the transition. Recomputing at read time means the next edit
to the lookup table silently rewrites history: last month's items appear to have been routed
somewhere they never went.

**Two labels that change on different clocks are two fields, not one enum.**
If A almost never changes after intake and B changes several times a day, an enum of their
cross-product loses transitions: you cannot tell "B changed" from "A was wrong". Split the
axes, and the state machine shrinks.

**Every gate needs four things written down:** entry condition · who may decide · the allowed
outcomes · where a rejected item lands. A rejection with no destination is how items vanish.

**Leaving a queue is not leaving the table.**
"Done" and "rejected" are states, not deletions. The queue is a *view* over states; the table
is the demand record. Delete the row and you destroy the only answer to "how many asked, how
many got through" — the number the flow exists to improve.

**Every stored value must have an execution point, or be explicitly marked display-only.**
A field that is written and shown but never *enforced* anywhere is a promise the system does
not keep. If you cannot name the line that acts on it, you have not built it — you have
displayed it.

**No invisible exception inside a guard.**
An exception means two truths about who may do what, and two truths always diverge. If a
special case must exist, make it a first-class state that the UI reads from the same source
the guard reads from. Never patch the guard and leave the interface computing its own answer.

**Ordering and counts belong to the data layer.**
If the list is sorted in the UI and the counts come from a second query, the two will
disagree — and both will look correct when inspected alone. Derive the counts from the same
rows the list is built from.

→ Details, table shapes, and the transition-log schema: [references/modeling.md](references/modeling.md)

---

## Phase 2 — Prove

The whole phase exists because of one fact: **a green suite means "nothing we wrote a test
for broke", not "it works".** These are the specific ways a workflow test turns out to have
been measuring nothing.

**Self-test the harness before the first real assertion (canary).**
Feed the harness a value that must fail, and assert it reported *exactly* that many failures.
A suite whose response body never arrives will report every assertion green against an empty
string. **The canary must flow through the same function the real assertions flow through** —
if the canary has any code that is not on the main path, it is not a self-test.

**Red-proof every guard.**
For each guard, mechanically remove it, run the suite, require it to go **red**, restore the
file byte-for-byte. A guard nobody has ever seen fail is a guard you have not tested.
Commit before running the tool, verify a unique pattern match, and restore in a `finally`.

**And green-proof it: a guard must also be able to say yes.**
Red alone cannot tell a working guard from one that rejects *everything* — both go red when
removed, and the always-red one hides longer because refusing everything looks careful. Run
each guard, in place, against a **known-good artifact** and require it to pass — demanding
the evidence line it prints, since exit 0 only proves the command ran. A release guard once
reported all 37 brand assets missing from a **perfect** bundle (the names crossed an
encoding boundary and arrived as `????`); wired in with `|| exit 1`, it would have made
every future build impossible.

**Read both halves of an agreement from the artifact.**
When a guard checks that two things agree — certificate and manifest, client and server,
package and host, migration and schema — a half read from an assumption proves nothing, and
the assumed half is the one that breaks. A fingerprint was once matched perfectly against a
published association file while the app's own declaration was missing the required field
entirely: one side flawless, the other not speaking. Extract both sides from the built
artifacts, never from a constant, a config you did not read, or documentation.

**Ask "which guard answered", never "what status code came back".**
When two layers both return the same code, an assertion on the code alone passes even when
the layer you meant to test is gone. Assert on something that distinguishes them: distinct
error identifiers, or an observed side effect. (This one recurred three times in a row.)

**A fixture must not accidentally produce the right answer.**
If insertion order happens to equal correct sort order, `ORDER BY id` passes your ordering
test. Build fixtures that are hostile to the trivial implementation.

**A known blind spot must be an executable assertion, not a comment.**
If a static scan cannot see indirect writes, write a canary it *must* miss and assert that it
missed it — plus a second layer that catches it. Then the day someone "simplifies" the scan,
the suite objects. A comment does not.

**Coverage tests must build their list from disk.**
A hand-maintained list of things to check cannot catch the thing nobody remembered to add.
Enumerate the real files/routes/handlers, and require each one to either carry a guard or
appear in an allowlist with a one-line reason — plus a staleness check that fails when an
allowlist entry no longer exists.

**"I fixed it" is not "I proved the fix changed anything."**
Green *after* the fix carries zero information — it was green before. The proof is running
the same real input against the **previous** version of the test (`git show HEAD:path`) and
showing it passed while missing the defect.

**The highest risk of a hollow test is the moment you are fixing another test.**
Attention is on the old defect, not on whether the new assertion can go red at all. Every
test born mid-fix gets seen red separately, before commit.

**Anything visible gets opened in a real client before it is called done.**
Server-side assertions in the hundreds have missed defects that one page load exposed. This
holds for command-line tools too: `dynamics.py` passed fourteen assertions while reporting
terminal states as stations with the age of the archive as their p90 — visible in one second
of reading real output, invisible to every assertion that had been written about it.

**Three test classes that workflows almost always lack:** actor A acting on actor B's item
(not just tenant isolation) · one number compared across two screens · wrong-typed input to
every write endpoint.

**Never prove a write path against live data.** Read-only verification against production
(`GET`/`HEAD`) only. If a guard is broken, the test that "checks whether the guard holds" is
the thing that corrupts the data. Prove writes locally; if something is only provable in
production, write it down as *unproven*.

→ Patterns, canary shapes, and the red-proof recipe: [references/proving.md](references/proving.md)

---

## Phase 3 — Measure

The rarest and cheapest phase. If phase 1 was done, these numbers are already in the
transition log — nobody has to file a report for the flow to tell you where it hurts.

| Metric | Reading |
|---|---|
| **Gate auto-pass rate** | High → the gate is theater; either remove it or find why nobody uses it |
| **Second-approver reversal rate** | High → the *first* station's instructions do not work |
| **Time-in-station, p50/p90** | The p90 station is the bottleneck; the p50 one is not |
| **Queue age of the oldest waiting item** | Length says how busy; age says who is being abandoned |
| **Loop-back rate per station** | Rework — the flow's silent capacity tax |
| **Never-terminal rate** | Items that entered and never reached any end state; the flow's leak |
| **Rejection reason distribution** | Needs enumerated reasons (a phase-1 decision that pays off here) |
| **Decision concentration by actor** | One person deciding most things is a single point of failure |
| **Variants (top real paths)** | The process as it exists; the rare-variant tail is where exceptions and workarounds live |
| **Conformance vs the model** | Off-model moves and never-taken edges — does the system do what the model says? (`conformance.py`) |

**Every ratio has two failure directions.** A low reversal rate can mean the first station is
excellent — or that the second gate is rubber-stamping. Never read a workflow metric without
naming both readings and the tiebreaker.

**Rule: no metric without an action.** If you cannot say what you would *do* differently at a
high value versus a low one, do not build it. A dashboard tile with no decision attached is
maintenance cost with a chart on top.

**Refuse the number you cannot trust.** A metric computed over a log that cannot support it —
missing actor kinds, timestamps in two formats, a denominator of four — is worse than no
metric, because it will be believed. `dynamics.py` refuses those rather than printing them,
and that is the behaviour to copy in whatever you build.

→ Portable SQL for each metric plus interpretation traps: [references/dynamics.md](references/dynamics.md)
→ Or just run it: `python scripts/dynamics.py --db app.sqlite --gates first,second`

---

## Phase 4 — Change

A flow that passed the first three phases still breaks the day its definition changes with
items mid-flight. Version the definition and stamp it on the item · never rename a state in
place · pick drain / map / dual-run explicitly · every migration move is a transition row
with an actor · mark backfills and never fabricate a decision · decide what happens to items
already past a newly added gate · expand → write both → backfill → read new → contract ·
capture the phase-3 baseline **before** the change, because afterwards it cannot be captured.

→ [references/evolving.md](references/evolving.md)

---

## Two rules that outrank everything above

**Claims are not evidence.** "Done", "all green", "zero open findings" — from a person, a
model, or an agent — are claims. Evidence is a command that exited 0, an output you read, or
a page you opened. Re-run it yourself before you rely on it.

**A guard's known limitation needs its own guard.** Anything you know a layer cannot see must
become an executable assertion, or the first person who simplifies that layer silently
reduces coverage and nothing turns red.
