---
name: codebase-zero
description: 'Audit whether an artifact that already exists in a codebase still deserves to exist, and reach an evidence-backed verdict before changing anything. Use when asked to review, audit, clean up, simplify, or find removable scope in existing code — modules, abstractions, compatibility layers, dependencies, feature flags, config, endpoints, jobs, caches, tests, CI, or docs — or when deciding whether an existing subsystem should be deleted, consolidated, or invested in further. Reaches one verdict per artifact: DELETE, CONSOLIDATE, SIMPLIFY, DEFER CLEANUP, KEEP, or INVEST. Audits and recommends; it does not delete code on its own authority. Do not use for bug fixes, code review of a change in progress, work whose removal has already been decided and only needs carrying out, or deciding whether to build something new — that last one is requirement-zero. Already-decided removals still get audited when the target is a security, safety, privacy, data-integrity, legal, compliance, or compatibility control.'
---

# Codebase Zero

**Every artifact must keep earning its right to exist.**

Requirement Zero asks whether a requirement deserves to be built. Codebase Zero asks the same
question one stage later, about code that is already here: *does this still deserve to exist?*

This is an audit. The output is a verdict per artifact with the evidence behind it — not a diff.
Do not delete, move, or rewrite anything unless the user has separately asked you to apply a
finding; see "Applying a finding" below.

## Before auditing anything: state the mission

Answer first, in one sentence: **what must this system do well, such that doing it badly makes
everything else worthless?** Payments: settle money correctly. Search: relevance. Database:
durability.

Every verdict below is relative to that sentence. Without it there is no difference between this
audit and a size preference, and the audit will quietly become "delete the code I find
unfamiliar". If the mission cannot be stated from the repository, its docs, or the user, say so
and ask — do not substitute lines of code, file age, or churn as a proxy.

## Per-artifact procedure

For each artifact under audit, in this order:

1. **Objective** — what user-visible, operational, or contractual outcome does this artifact
   enable? State it as an outcome, not as a description of the code. "Serializes the config" is a
   description; "lets an operator change retry limits without a deploy" is an outcome.

2. **Origin** — what requirement caused it to be built, and is that requirement still valid?
   Use `git log`, `git blame`, and linked tickets or PRs to find the original reason. An artifact
   whose original requirement is gone is a deletion candidate; an artifact whose reason cannot be
   found is *not* the same thing, and is at most DEFER CLEANUP until it is understood.

3. **Dependents** — who or what depends on it *today*: callers, imports, tests, config,
   deployment manifests, external clients you cannot enumerate. Search before asserting. See
   [references/evidence.md](references/evidence.md).

4. **Failure on removal** — what observably breaks if it disappears, and who notices through what
   signal? Name the observer and the signal. If neither can be named *and* step 3 found no
   dependents, deletion is a live hypothesis. If the only answer is "a protection stops
   protecting", read "Constraints not yours to delete" before going further.

5. **Complexity class** — accidental, historical, or essential to the mission. This is the step
   that decides between SIMPLIFY and INVEST, and getting it backwards is the expensive error. See
   [references/complexity.md](references/complexity.md).

6. **Blast radius and cost** — how far a change reaches, and what keeping it costs per unit time.
   See [references/blast-radius.md](references/blast-radius.md).

Then one verdict.

## Verdicts

State exactly one per artifact. Do not offer the user a menu, and do not average several artifacts
into one vague assessment — audit them separately even when they touch.

| Verdict | Select when |
|---|---|
| **DELETE** | No current dependent, no nameable observer of its absence, and its original requirement is gone or was never valid. Removal risk is understood and acceptable. |
| **CONSOLIDATE** | Two or more artifacts do substantially the same job. The behavior is needed; this many implementations of it are not. Name the survivor. |
| **SIMPLIFY** | The behavior is justified, the implementation carries structure nothing uses — an abstraction with one implementation, an unreached branch, a layer that only forwards. |
| **DEFER CLEANUP** | It looks removable but the evidence is not there yet, or the risk is not currently worth the benefit. Name the specific missing evidence or the trigger. |
| **KEEP** | It still earns its place — a live dependent, a real contract, or a protection whose value does not show up as traffic. |
| **INVEST** | It is complex and expensive *and* it is where the mission is currently won or lost. Spend more engineering here; do not simplify the capability away. |

An audit that never reaches KEEP or INVEST is not rigorous, it is miscalibrated. The failure mode
of a subtraction practice on an existing codebase is not over-building — it is removing the load-
bearing thing because it was the hardest to understand.

## What every non-trivial verdict must include

Seven fields. A verdict missing any of them is not reviewable, and a reviewer cannot disagree with
it cheaply, which is the only property that makes an audit useful.

1. **Fundamental objective** — the outcome the artifact serves, from step 1.
2. **Evidence** — what you actually searched and what you found, including "searched X, found no
   callers". State absence as absence; never fill a gap with plausible reasoning.
3. **Confidence** — high, medium, or low, and the one thing that would raise it.
4. **Blast radius** — what a change to this reaches, including anything you could not enumerate.
5. **Expected benefit and cost** — what removing or changing it buys, against what the change
   costs to make and verify. If the benefit is only "less code", say that plainly; it is a weak
   benefit and should read like one.
6. **What is retained** — the behavior that must still hold afterwards.
7. **Verification needed** — the specific test, check, or observation that would show the change
   was safe. "Run the test suite" is only sufficient if you checked that the suite actually covers
   this artifact.

## Evidence rules

Absence of evidence is a finding, not a licence. Three fallacies decide most wrong verdicts:

- **Age is not irrelevance.** Code untouched for four years may be finished. Stable and dead look
  identical in `git log`.
- **Churn is not value.** A file changed every week may be a defect cluster, not a core asset.
- **No traffic is not no purpose.** A kill switch, a rate limiter, a fallback path, or an audit log
  can be doing its job precisely by never being exercised.

Prefer evidence in this order: current references in code and config; tests that assert the
behavior; a contract with a caller; history explaining the original requirement; telemetry, but
only where it is already collected and trustworthy. Do not commission new telemetry to justify a
cleanup — that is a bigger project than the cleanup.

Do not read the whole repository. Search for what would change the verdict, and stop when it
would not. [references/evidence.md](references/evidence.md) has the specific searches.

## Constraints not yours to delete

Some artifacts exist to stop something rare and expensive. Their evidence profile looks exactly
like abandonment: no traffic, no recent change, no one who remembers why.

Do not recommend DELETE on your own authority for: authentication, authorization, encryption,
input validation, audit trails; rate limits, circuit breakers, kill switches, idempotency and
replay protection; data integrity constraints, privacy, consent, retention and deletion behavior;
anything satisfying a regulation or contract; migration and backfill correctness; the compatibility
surface of an interface whose callers you cannot enumerate.

For these the default is **KEEP**, and the challenge is aimed at the *size of the implementation*,
not the existence of the protection — a synchronous audit write may become asynchronous while
still logging every access. Where removal is genuinely warranted, the verdict is a recommendation
routed to a named owner with the residual risk written down, and where applicable a security,
legal, or compliance review. Absence of an incident is not evidence the protection is unnecessary;
that inference is backwards exactly where it is most expensive.

## Applying a finding

Default mode is audit only. Do not delete code because it looks unused.

When the user asks you to apply a finding, apply **one** hypothesis — not the audit's whole
backlog:

1. Take a single high-confidence finding. Not a batch, and not a "while I'm here" bundle.
2. Re-verify references, dependents, and history at HEAD; the audit may be stale.
3. State the blast radius and the verification you are relying on before editing.
4. Work on an isolated branch or worktree.
5. Make the smallest change that realizes the finding. Deleting less than the finding proposed is
   an acceptable outcome; deleting more is not.
6. Run the tests that cover the affected behavior, then the project's required gates.
7. Review the effective diff against the base branch, not just the last edit.
8. Open one focused pull request naming the finding, the evidence, and the retained behavior.

Never make several unrelated removals in one pull request. A cleanup that cannot be reverted
independently cannot be safely reverted at all.

## References

Load only the one that matches the step you are on.

- [references/evidence.md](references/evidence.md) — the specific searches per artifact type, what
  counts as evidence, and how to set confidence honestly.
- [references/blast-radius.md](references/blast-radius.md) — enumerating dependents you can and
  cannot see, sizing the radius, and choosing the verification that would actually catch a
  mistake.
- [references/complexity.md](references/complexity.md) — separating accidental from essential
  complexity, the bar for INVEST, and the rules that decide CONSOLIDATE against SIMPLIFY.
