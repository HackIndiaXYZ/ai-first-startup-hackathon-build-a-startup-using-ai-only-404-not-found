---
name: ios-feature-implementation
description: Structured procedure for implementing a new feature or change in an existing iOS codebase — inspect and explain before touching files, then implement, then verify against a concrete checklist including memory/performance. Use when asked to "implement this feature", "add this screen/flow", or when given a feature request with context/requirements/constraints.
---

# iOS Feature Implementation

A disciplined inspect → explain → implement → verify loop for feature work
in an existing codebase. Do not skip straight to editing files.

## 0. Expected request shape

A well-formed feature request names, at minimum:

- **What to build** — the feature/behavior in plain language.
- **Existing context** — the specific screen(s), ViewModel(s), API(s),
  and model(s) already involved, by name.
- **Requirements** — the specific behaviors the finished feature must have.
- **Constraints** — minimum iOS version, dependency policy, "follow
  existing architecture", "reuse existing components", "don't touch
  unrelated files".

If a request is missing this (e.g. "add a favorites feature" with nothing
else), ask for the specific existing files involved before inspecting —
guessing which ViewModel or API is "the" relevant one wastes the
inspection step below.

## 1. Inspect before touching anything

Read, in this order, before writing a single line:

1. **The existing feature/screen this touches.** Read the actual current
   implementation, not a description of it — a stale comment or README is
   not the source of truth (if the codebase is undocumented or you can't
   tell what's current, use `ios-legacy-auditor` first).
2. **The existing business logic it must integrate with or not break.**
   Trace what the current ViewModel/service actually does with the data
   today — validation rules, edge cases already handled, state machines,
   pricing/eligibility logic, anything with branching. New code that
   duplicates or silently diverges from existing business rules is a
   correctness bug even when it compiles and looks clean.
3. **The API/model layer** it will call into or extend — actual current
   signatures and types, not remembered ones.
4. **Nearby reusable components** — check for an existing view, view
   modifier, or helper before writing a new one; constraints usually say
   "reuse existing components" for a reason.
5. **Existing API/networking behavior on this path** — the actual
   current auth-header handling, retry/timeout policy, offline/error
   handling, and response caching for the endpoint(s) involved. New code
   that silently drops an existing retry or error-mapping behavior is a
   regression even if the happy path works.
6. **Existing security posture for this data path** — how any
   credential, token, or sensitive field involved is stored and
   transmitted today (Keychain vs. `UserDefaults`, TLS/ATS settings,
   whether it's ever logged elsewhere). Carry the existing posture
   forward; don't introduce a weaker one for convenience (e.g. caching a
   token in `UserDefaults` because it's easier than reusing the existing
   Keychain wrapper).

Do not modify files during this step.

## 2. Explain before implementing

Present, in this order, before writing implementation code:

1. **Existing architecture** — the pattern actually in use in the touched
   area (may not match what the rest of the app does — say so if not).
2. **Files that need modification** — exact paths, and for each, what
   changes and why.
3. **Proposed implementation** — concrete enough to review: new
   types/methods with real signatures, not just prose.
4. **Potential risks** — what could break, what's ambiguous in the
   requirements, anything the constraints make harder (e.g. "no new
   dependencies" ruling out the obvious library for this).

If the codebase's current architecture is unclear or looks like it may
not match assumptions, use `ios-architect` for the structural judgment
call before proposing an approach.

## 3. Implement

- Match the existing architecture and style in the touched files —
  this is not the place to introduce a different pattern, even a better
  one, unless the request explicitly asks for a refactor.
- Respect every stated constraint literally: if minimum iOS is 14, don't
  use an iOS 15+ API without an availability check; if "no new
  dependencies", don't add one even for a one-line convenience.
- Touch only the files identified in step 2. If implementation reveals
  that another file must change too, say so explicitly rather than
  silently expanding scope.
- Follow `ios-testing-strategy` for any new tests this feature needs.

## 4. Verify

Run and report on each of the following — don't skip one because it
seems obviously fine:

1. **Build** — the project actually compiles. If the `ios-simulator`
   MCP server is configured (see this repo's `.mcp.json` and README),
   `build_project` gives a structured result instead of parsing raw
   `xcodebuild` output; otherwise run `xcodebuild` directly.
2. **Tests** — run the relevant test target(s), report pass/fail counts
   (`run_tests` via `ios-simulator-mcp`, or `xcodebuild test` directly).
3. **API availability** — every API used is available at the stated
   minimum iOS version, or is properly `#available`-guarded. If the
   `ios-agent` MCP server is configured, `mcp__ios-agent__check_availability_guards`
   also catches the less obvious mistake: a guard set to a *higher* iOS
   version than the API actually requires, which silently drops support
   for every device between the true minimum and the guard's version.
4. **Retain cycles** — see the Memory & Performance Review below.
5. **Concurrency** — new `async`/actor-isolated code doesn't introduce a
   data race or an accidental main-thread block; existing concurrency
   model in the touched files is preserved, not mixed with a new one.
6. **Memory implications** — see the Memory & Performance Review below.
7. **Performance implications** — no new unbounded main-thread work
   (image decode, JSON parsing, file I/O) introduced on a hot path.
8. **Security** — see the Security Review below.
9. **Review the diff** — read your own changes once, end to end, before
   reporting done; look for anything outside the files named in step 2.

## Memory & Performance Review

For any feature involving images, networking, WebViews, large
collections, caching, Core Data, PDF, or media, check all of the
following. Do not claim memory safety without measurement — if memory
behavior genuinely matters for this feature, recommend an Instruments
Allocations/Leaks/Time Profiler investigation rather than asserting it's
fine from reading the code alone (see `ios-memory-performance-engineer`
for how to describe that investigation).

1. **Retain cycles**
   - Closures capturing `self` strongly where the closure outlives the call
   - Delegates declared `strong` instead of `weak`
   - `NotificationCenter` observers never removed
   - Combine/RxSwift subscriptions not cancelled on deinit
   - `Timer`s retaining their target
   - `Task`s captured or stored in a way that outlives their owner

2. **Large allocations**
   - `UIImage`/`Data` held at full resolution when only a thumbnail is shown
   - JSON decoding of a large payload on the main thread
   - PDF rendering/generation
   - WebView content
   - Image caching without a size bound

3. **Object lifetime**
   - Does the ViewController/View, ViewModel, Coordinator, `Task`, and
     any subscriptions all deinit when expected? Trace what holds a
     reference to what.

4. **Main-thread memory work**
   - Image decoding, JSON processing, file operations, or PDF generation
     running synchronously on the main thread

5. **Caching**
   - Is there a cache size limit? An eviction policy?
   - Is this introducing a second cache that duplicates an existing one?
   - `NSCache` (evicts under memory pressure) vs. a plain `Dictionary`
     (never evicts) — using a Dictionary as an unbounded cache is a leak
     in slow motion

6. **SwiftUI-specific**
   - `@State`/`@Observable` holding more than the view actually needs
   - Objects recreated every `body` evaluation instead of held stable
   - Expensive work inside `body` itself
   - Closures passed into child views that capture and retain more than
     necessary

7. **UIKit-specific**
   - Cell reuse actually resets per-cell state (images, subscriptions)
   - Image lifecycle across cell reuse (cancel in-flight loads on reuse)
   - Layout objects (`NSLayoutConstraint` arrays, etc.) not endlessly
     re-created
   - Notification observers registered per-cell/per-view without removal

## Security Review

For any feature touching authentication, credentials/tokens, personal
data, networking, deep links, or a WebView, check all of the following.
Per `ios-evidence-reporting`'s "a pattern match is a lead, not a
finding" rule, report a hit as something to check, not a confirmed
vulnerability, unless the data flow was actually traced.

1. **Secure storage**
   - Credentials, tokens, and other secrets live in the Keychain, not
     `UserDefaults`, a plist, or unencrypted Core Data/SwiftData
   - If this feature adds a new secret, it goes through the app's
     existing Keychain wrapper rather than a new storage path

2. **Transport security**
   - No new `NSAllowsArbitraryLoads`/ATS exception introduced for this
     feature's endpoint
   - Requests actually go over TLS; if the app uses certificate or
     public-key pinning, this feature's networking doesn't bypass it

3. **Input validation at the API boundary**
   - Deserialized JSON/response data is validated before use, not
     trusted blindly (a malformed or unexpected response shouldn't crash
     or corrupt state)
   - No URL or query string built by concatenating unescaped user input
   - Any WebView this feature adds or reuses doesn't load arbitrary or
     user-supplied URLs without restriction

4. **AuthN/authZ**
   - The new code path doesn't bypass an existing authentication check
   - A token or session isn't reused outside the scope it was issued for

5. **Logging & crash reporting**
   - No token, password, or personal data is written to logs, analytics
     events, or crash-reporter breadcrumbs — check both new logging
     calls this feature adds and any existing logging on the touched path

6. **Third-party SDKs**
   - This feature doesn't hand personal data or credentials to a
     third-party SDK beyond what the app's existing data-sharing policy
     already covers

7. **Deep links / URL schemes**
   - If this feature is reachable via a URL scheme or Universal Link,
     the incoming URL and its parameters are validated before acting on
     them — don't trust a deep link parameter the way you'd trust
     internal app state

This list is scoped to what a single feature touches. For a full,
dedicated security audit of a broader area, use `ios-security-reviewer`.

## 5. Independent review

The agent that implemented a change is not the sole authority on
whether it's correct — draft the report from steps 4 above, then hand
it (with the diff) to `ios-evidence-reviewer` before presenting it as
final. It checks every claim in the draft against the evidence actually
shown and downgrades anything overclaimed — "memory usage improved"
with no measurement becomes "memory optimization implemented; runtime
improvement not measured," for instance.

Skip this step only for genuinely trivial changes making no
build/test/runtime/memory/performance/security claim at all (e.g. a
comment-only or copy-only edit) — anything claiming a tier from the
`ios-evidence-reporting` matrix gets reviewed before it's called done.

## 6. Report

Structure the final report as:

- **Files changed** — exact paths.
- **What changed** — per file, in concrete terms.
- **Tests performed** — commands run and results, not assumed outcomes.
- **Performance considerations** — what was checked from the list above
  and what was found.
- **Memory considerations** — same, from the Memory & Performance Review.
- **Security considerations** — same, from the Security Review; label
  each item checked vs. still needing verification.
- **Independent review** — what `ios-evidence-reviewer` found, and
  what was corrected as a result, or "no overclaims found."
- **Remaining risks** — anything not fully verified (e.g. "no obvious
  retain cycle found by static inspection; recommend an Instruments
  Allocations pass before shipping if this screen is high-traffic").

If the feature has a visual component, "the UI works" needs
`RUNTIME_VERIFIED` (a screenshot, `ios-ui-test-engineer`'s test
actually passing, or a manual check) — a passing unit test alone
covers the feature's *logic*, not whether it renders or lays out
correctly; don't let a green test suite stand in for a claim about
what the screen actually looks like.

Then close with the `ios-evidence-reporting` skill's status block
(`BUILD`, `TEST`, `AVAILABILITY`, `MEMORY`, `PERFORMANCE`, `SECURITY`,
`DIFF`) as a compact summary, each line tiered per that skill's
taxonomy — every line must trace back to something already stated in
the sections above, not a new claim, and must reflect any downgrade
`ios-evidence-reviewer` made in step 5.

## Failure Scenarios

Name the specific way each verification step can fail, so a failure
gets diagnosed instead of silently re-tried or ignored:

| If this happens | It means | Do this |
|---|---|---|
| Build fails after the change | The implementation doesn't compile as written | Fix the actual compiler error — don't loosen types or add force-unwraps to make it compile |
| A previously-passing test now fails | The change broke existing behavior, or the test asserted an implementation detail | Determine which before "fixing" — don't change the test to match new behavior without confirming the new behavior is actually correct |
| Availability check flags a guard mismatch | A `#available` guard is set to the wrong version (missing, or higher than the API actually needs) | Correct the guard version — an over-restrictive guard silently drops support for real devices, not just an under-restrictive one |
| `ios-evidence-reviewer` downgrades a claim | The draft report stated more confidence than its own evidence supports | Adopt the corrected wording — don't argue the claim back up without adding the evidence that would actually support it |
| No measurable improvement after a performance change | The fix didn't address the actual bottleneck, or the reproduction wasn't held constant | Re-profile rather than re-describing the same fix as faster — see `ios-performance-measurement`'s Failure Scenarios |
