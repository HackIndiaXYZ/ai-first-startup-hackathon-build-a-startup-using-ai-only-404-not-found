---
name: swift-concurrency
description: Procedure for reviewing real Swift code for concurrency correctness — async/await, actors, Sendable, cancellation, task lifetime — not a Swift Concurrency tutorial. Use when the task involves async/await, Task, actors, MainActor, Sendable, or a data-race/concurrency question like "is this thread-safe?".
---

# Swift Concurrency

## Purpose

Review real project code for concurrency correctness, and grade every
finding at the evidence tier it actually earned — never assert
"thread-safe" from reading code alone.

## When to Use

Any task touching `async`/`await`, `Task`, actors, `@MainActor`,
`Sendable`, or a direct question about thread safety, data races, or
cancellation behavior.

## Inputs

- The actual code under review — read it, don't reason about
  concurrency in the abstract.
- Whether the project has Swift 6 language mode (or
  `-strict-concurrency=complete` under Swift 5) enabled — this changes
  what the *compiler itself* can prove vs. what only a careful read can
  flag.
- If `ios-agent` MCP is configured, `mcp__ios-agent__review_swift_concurrency`
  alongside the manual read — `STATIC_ANALYSIS` tier, same as reading
  the code, never higher (per `ios-evidence-reporting`'s tool-tier rule).

## Core Knowledge

- **Structured vs. unstructured concurrency:** `async let` and task
  groups tie a child task's lifetime to its parent's scope — the
  parent can't return until children finish or are cancelled.
  Unstructured `Task {}` has no such guarantee; it keeps running
  independent of whoever created it unless something explicitly
  cancels it.
- **`@MainActor` isolation:** UI-touching state needs main-actor
  isolation. `@Observable`/`ObservableObject` types get no isolation
  for free — annotate the type (or the specific properties/methods
  that need it) explicitly.
- **`Sendable`:** a type crossing an isolation boundary (passed into a
  `Task`, an actor method, or another isolation domain) needs to be
  safe to do so — genuinely immutable, internally synchronized, or a
  value type with no shared mutable state.
- **Actor reentrancy:** an actor method that `await`s can be
  re-entered by another call to the same actor during the suspension —
  actors are not a mutex. State checked before an `await` is not
  guaranteed to still hold after it resumes.
- **Cancellation is cooperative:** calling `.cancel()` on a `Task` sets
  a flag; it does not stop execution. Code has to actually check
  `Task.isCancelled` or call `try Task.checkCancellation()` to respond.

## Detection Patterns

| Pattern | Risk | Detect by |
|---|---|---|
| Unstructured `Task {}` in `onAppear`/init/button action, never stored or cancelled | Outlives the view; can touch deallocated state or double-fire on re-render | grep for `Task {` inside SwiftUI lifecycle hooks/actions with no stored handle and no `.task {}` alternative used |
| Long-running loop with no cancellation check | `.cancel()` does nothing — work keeps running after the caller gave up | grep `for`/`while` loops inside `async` functions for absence of `Task.isCancelled`/`checkCancellation` |
| View-model type read/written from both SwiftUI and a background task, not `@MainActor` | Data race on non-`Sendable` state; Swift 6 refuses to compile, Swift 5 may silently corrupt | Check whether types backing SwiftUI views carry `@MainActor`; check whether Swift 6 mode is even enabled to catch this at all |
| `@unchecked Sendable` / `nonisolated(unsafe)` | Manually disables the compiler's only mechanical safety net for this type — a real race risk hiding behind a suppression | grep for both exact terms |
| `Task.detached` used out of habit | Loses the calling actor's isolation, priority, and task-local values (e.g. a request ID for logging) for no deliberate reason | grep `Task.detached`; check whether escaping context was actually intentional |
| Continuation (`withCheckedContinuation`) resumed on more than one path, or not on all paths | Double-resume crashes at runtime; missed resume hangs the awaiting task forever | Trace every exit path (success, error, early return) out of the continuation closure |
| State read before an `await` inside an actor method, relied on unchanged after it resumes | Actor reentrancy — another call can interleave during the suspension and change that state | Look for a state read, then an `await`, then logic that trusts the pre-`await` value without re-checking |
| `Task` stored as a property, never cancelled in `deinit`/equivalent | Wastes resources or touches a gone context indefinitely | Check every stored `Task` property has a matching cancel; prefer `.task {}` for SwiftUI, which handles this automatically |

## Procedure

1. Read the actual code — never assess concurrency from a description
   of it.
2. Check which detection patterns above apply; for each hit, read
   enough surrounding code to confirm it's real, not a false positive
   (e.g. a `Task.detached` that's genuinely meant to escape context).
3. For each real finding, state: the pattern, the risk, and the
   concrete fix — a code diff, not a description of one.
4. If the question is "is this thread-safe," don't answer yes/no from
   this reading alone — see Evidence Requirements.
5. If Swift 6 / strict concurrency mode isn't enabled, say so — it's
   the single highest-leverage recommendation available, since it
   turns several of these patterns into compile errors instead of
   silent bugs.

## Common Mistakes

- Treating "no data race pattern found by reading" as "this is
  thread-safe" — a static read can't see the actual concurrent
  interleaving.
- Suggesting `@unchecked Sendable` as a quick fix for a compiler
  warning instead of understanding what the warning is protecting
  against.
- Recommending `Task.detached` as the default for "fire and forget"
  work — plain `Task {}` is almost always the right default.

## Verification

- A pattern match from step 2 above is `STATIC_ANALYSIS`.
- Confirming the *compiler* rejects a violation under Swift 6 strict
  mode is `BUILD_VERIFIED` — genuinely stronger evidence than a manual
  read, since the compiler is checking every path, not just the ones
  read.
- A concurrency-relevant test (e.g. asserting a task actually stops
  after cancellation, or a continuation resumes exactly once across
  its tested paths) is `TEST_VERIFIED`.
- Actual concurrent behavior observed under Thread Sanitizer or in a
  real run is `RUNTIME_VERIFIED`.

## Evidence Requirements

Per `ios-evidence-reporting`'s matrix, "thread-safe" specifically
requires `STATIC_ANALYSIS` *and* a concurrency-relevant test or Swift 6
strict-mode compilation — never inspection alone. Grade every finding
honestly:

```text
Claim:
"Task cancellation is handled correctly."

Static:
Cancellation path inspected — Task.isCancelled checked at the loop
boundary in FeedLoader.swift:88.

Tests:
No test currently exercises cancellation.

Runtime:
Not observed.

Final:
PARTIALLY VERIFIED — STATIC_ANALYSIS only. Recommend a test that
cancels mid-loop and asserts the loop actually stops.
```

## Claim Restrictions

- Never say "thread-safe" from this skill's static read alone —
  `STATIC_ANALYSIS` plus a concurrency-relevant test or Swift 6
  strict-mode build is the minimum.
- Never say a data race "does not exist" — say "no data-race pattern
  found during static inspection."
- Never claim `@unchecked Sendable` usage is "safe" without stating
  the specific invariant that makes it safe (e.g. "immutable after
  `init`") — an unjustified suppression is itself a finding to report,
  not a claim to validate.

## Output Format

One finding per issue: pattern name, file:line, risk, concrete fix (a
diff, not prose), and the evidence tier the finding itself is graded
at. Close with the `ios-evidence-reporting` status block.
