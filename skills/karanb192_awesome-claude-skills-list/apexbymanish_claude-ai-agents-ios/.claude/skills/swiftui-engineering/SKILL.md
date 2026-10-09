---
name: swiftui-engineering
description: Procedure for reviewing SwiftUI code for state-ownership, view-identity, lifecycle, and rendering correctness — distinct from ios-ux-reviewer's visual/HIG review. Use when the task involves SwiftUI state, @StateObject/@ObservedObject, view identity, body recomputation, navigation, UIKit interop, or a question like "why is this view re-rendering".
---

# SwiftUI Engineering

## Purpose

Review SwiftUI code for state-ownership and lifecycle correctness — a
different lens from `ios-ux-reviewer`'s visual/HIG review. This skill
asks "is this pattern correct," not "does this look right."

Distinguish sharply throughout: **"this SwiftUI pattern looks
correct"** (a static read) is not the same claim as **"this runtime
behavior has been verified"** (something was actually observed
running).

## When to Use

Any task touching SwiftUI state (`@State`, `@Binding`, `@StateObject`,
`@ObservedObject`, `@Environment`, `@Observable`), view identity, body
recomputation/rendering performance, SwiftUI navigation, or
UIKit-SwiftUI interop (`UIViewRepresentable`,
`UIViewControllerRepresentable`).

## Inputs

- The actual view code — read it; don't reason about SwiftUI state
  ownership in the abstract.
- `knowledge/architecture-patterns.md` for the underlying state-
  ownership and view-identity decision criteria this skill's checks
  are built on.
- If `ios-agent` MCP is configured, `mcp__ios-agent__review_swiftui`
  alongside the manual read — `STATIC_ANALYSIS` tier, same as reading
  the code, never higher.

## Core Knowledge

- **`@StateObject`** is for a reference type the view *creates and
  owns* — SwiftUI keeps the same instance alive across re-renders.
  **`@ObservedObject`** is for one *passed in* from a parent — using it
  for an owned instance is the most common SwiftUI state bug, because
  a parent re-render can recreate the object and silently reset it.
- **View identity** (same type, same explicit `.id()`, same stable
  position in a container) is what lets `@State` survive a body
  re-evaluation. Losing identity — switching between different view
  types in the same slot, or a `ForEach` keyed on something unstable —
  resets state and can produce visible animation glitches.
- **`body` re-evaluates often**, on any state change anywhere in its
  dependency graph. Expensive work inside `body` (formatting, sorting,
  filtering, date math) re-runs every time, not just when its inputs
  actually change.
- **`@EnvironmentObject`/`@Environment`** values must actually be
  injected somewhere up the view hierarchy — a required
  `@EnvironmentObject` with no `.environmentObject(...)` ancestor is a
  runtime crash, not a compile error.
- **`UIViewRepresentable`/`UIViewControllerRepresentable`**'s
  `updateUIView(_:context:)` runs on every relevant parent
  re-render — not just when something it actually cares about changed,
  unless the implementation explicitly diffs.

## Detection Patterns

| Pattern | Risk | Detect by |
|---|---|---|
| `@ObservedObject` for an object the view itself instantiates | Parent re-render recreates it, silently resetting all its state | Find where the object is constructed — if it's `= SomeClass(...)` inside the view rather than passed via an initializer parameter, it should be `@StateObject` |
| `ForEach` keyed on array index or another unstable value | Reordering/inserting scrambles which row "is" which — state and animations attach to the wrong item | Check `id:` parameter or `Identifiable` conformance — index-as-id is the classic version of this bug |
| Conditional branch switching between different concrete view types in the same slot | Loses identity on the branch that changes — resets state, can glitch animations | Look for `if`/`switch` returning genuinely different view types without a shared `.id()` |
| Expensive computation directly inside `body` | Re-runs on every re-render, not just when inputs change | Look for sorting/filtering/formatting/date math written inline in `body` rather than computed once and stored, or wrapped for memoization |
| Required `@EnvironmentObject` with no visible `.environmentObject()` ancestor in this view tree | Runtime crash: "No ObservableObject of type X found" | Trace the view hierarchy up from the declaration site for the matching injection |
| `Binding.constant(...)` wrapping a value that's actually meant to be mutable | Two-way binding silently becomes one-way — edits from the child are dropped | grep `.constant(` and check whether the wrapped value has a real, mutable source of truth elsewhere |
| `updateUIView`/`updateUIViewController` doing unconditional expensive work | Runs on every parent re-render; without a diff guard this repeats real cost needlessly | Check whether the implementation compares new vs. current state before doing work |
| Eagerly-constructed `NavigationLink(destination:)` inside a `List` with many rows (pre-value-based pattern) | Builds every destination view upfront instead of lazily — real performance cost that scales with row count | grep `NavigationLink(destination:` inside a `List`/`ForEach`; prefer value-based navigation with `.navigationDestination(for:)` |
| `GeometryReader` nested inside already-constrained layout, used just to read a size | Forces an extra, often unnecessary layout pass; a common way to get surprising size/position bugs | Check whether the same information is available from a fixed frame or a `.background(GeometryReader)`-only read pattern instead |

## Procedure

1. Read the actual view/state code.
2. Check which detection patterns above apply, confirming each hit
   against the real surrounding code before reporting it.
3. For a state-ownership or identity finding, name the concrete
   consequence in this specific view, not the pattern in the abstract
   ("this will reset the search text every time the parent list
   reloads" not "this could cause issues").
4. If the finding is about rendering/performance, note whether it's
   `STATIC_ANALYSIS`-only or whether `ios-memory-performance-engineer`
   should measure the actual re-render cost.
5. If the task involves a deprecated API (`NavigationView`, an
   old-style `.onChange` signature, etc.), check against
   `ios-api-availability` rather than assuming the newest replacement
   is automatically correct for this project's deployment target.

## Common Mistakes

- Assuming a `@StateObject`/`@ObservedObject` swap fixes a state-reset
  bug without confirming the object's actual construction site changed
  accordingly.
- Reporting a rendering-performance finding as a memory-improvement
  claim — they're related but distinct; hand off performance-impact
  measurement to `ios-memory-performance-engineer`/
  `ios-performance-measurement` rather than asserting it yourself.
- Recommending the newest SwiftUI API reflexively without checking the
  project's actual minimum deployment target first.

## Verification

- A state-ownership, identity, or `EnvironmentObject`-injection finding
  from reading code is `STATIC_ANALYSIS`.
- Confirming the actual crash/reset/behavior by running the app
  (simulator or device) is `RUNTIME_VERIFIED`.
- A quantified re-render cost (body evaluation count, timing) requires
  `ios-performance-measurement`'s workflow — `RUNTIME_MEASURED`, not
  claimable from this skill alone.

## Evidence Requirements

"SwiftUI pattern looks correct" (`STATIC_ANALYSIS`) and "runtime
behavior has been verified" (`RUNTIME_VERIFIED`) are different claims —
never report the first as if it were the second. A fix for a
state-reset bug is `STATIC_ANALYSIS` until the actual screen has been
observed (manually, or via `ios-ui-test-engineer`) to retain its state
correctly under the reported conditions.

## Claim Restrictions

- Never say a view "will render correctly" from reading the code alone
  — say what the code's logic implies, and mark rendering behavior
  itself `HUMAN_VERIFICATION`/`RUNTIME_VERIFIED` until actually seen.
- Never claim a rendering-performance fix "improved performance"
  without a measurement — that claim belongs to
  `ios-performance-measurement`, not this skill.
- Never claim full UIKit-interop correctness from reading
  `updateUIView` alone — confirm the actual diffing/guard logic handles
  the specific re-render triggers this project has, not a generic case.

## Output Format

One finding per issue: pattern name, file:line, concrete user-facing
or developer-facing consequence, and the fix as a diff. Close with the
`ios-evidence-reporting` status block, distinguishing
`STATIC_ANALYSIS` pattern findings from anything actually
`RUNTIME_VERIFIED`.
