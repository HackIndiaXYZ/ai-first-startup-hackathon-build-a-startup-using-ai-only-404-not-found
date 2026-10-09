---
name: ios-accessibility
description: Procedure for reviewing and verifying iOS accessibility — VoiceOver, Dynamic Type, contrast, hit targets, Switch Control, Reduce Motion — with an explicit static-vs-runtime split. Use when asked to "make this accessible", check VoiceOver support, or evaluate accessibility beyond the visual-consistency checks ios-ux-reviewer already does.
---

# iOS Accessibility

## Purpose

Check accessibility with the same static-vs-runtime discipline this
repo applies everywhere else. A code read can find real, concrete
problems (a missing label, a fixed font size) — it cannot confirm
"fully accessible," which is a claim only actual assistive-technology
use can support.

## When to Use

Any request to review or improve accessibility beyond
`ios-ux-reviewer`'s visual/HIG checklist — VoiceOver behavior,
Dynamic Type, contrast, tap targets, Switch Control, Reduce Motion, or
accessibility notifications.

## Inputs

- The actual view code — labels, traits, hints, font choices,
  frame/padding values, animation code.
- Whether the project's test target uses
  `XCUIApplication().performAccessibilityAudit()` (Xcode 15+) — a real
  automated audit API, not a manual checklist substitute (see
  Verification).

## Core Knowledge

- **STATIC REVIEW** (reading code) can find: a missing
  `accessibilityLabel` on an icon-only control, a missing
  `accessibilityTraits` on a custom (non-standard) control, a fixed
  point-size font instead of a Dynamic-Type-scalable one, a tap target
  smaller than 44×44pt, and state conveyed by color alone with no
  icon/text backup.
- **RUNTIME ACCESSIBILITY VERIFICATION** (actually running with
  VoiceOver/Switch Control/Reduce Motion enabled, or running an
  automated audit) is a different, stronger claim — it can catch
  things static review cannot, like whether VoiceOver's reading order
  actually makes sense, or whether a custom gesture has no alternative
  action for Switch Control users.
- **`XCUIApplication().performAccessibilityAudit()`** (Xcode 15+) runs
  a real automated audit against categories including contrast,
  hit-target size, and missing labels — this is `TEST_VERIFIED`
  evidence when it's actually run, not a manual checklist substitute.
- **Reduce Motion** (`UIAccessibility.isReduceMotionEnabled`) — custom
  animations/transitions that don't check this setting force motion on
  users who've explicitly asked to reduce it, which for some users is
  a vestibular-disorder trigger, not just a preference.
- **Accessibility notifications** — dynamic content changes that don't
  trigger navigation (an async load finishing, a form field appearing)
  need an explicit `UIAccessibility.post(notification:)` (`.screenChanged`
  or `.announcement`) or VoiceOver users get no signal anything changed.

## Detection Patterns

| Pattern | Risk | Detect by |
|---|---|---|
| Icon-only button/control with no `accessibilityLabel` | VoiceOver reads the asset filename or just "button" — the control is functionally unusable | grep for image-only buttons/icons; check for a matching label |
| Custom (non-standard) control with no `accessibilityTraits` | VoiceOver doesn't announce it as a button/toggle/etc. — users can't tell what it does or that it's interactive | Any hand-rolled tappable view not using a standard `Button`/`Toggle`/etc. |
| Fixed point-size font (`.font(.system(size: 14))`) instead of a Dynamic-Type-scalable style | Text doesn't grow for users who've increased their text size — a real usability barrier, not a preference | grep fixed-size font modifiers on user-facing text |
| Tap target smaller than 44×44pt | Mis-taps for users with limited dexterity or larger fingers | Check frame/padding values against the 44pt minimum |
| State conveyed by color alone (e.g. a red border for an error, no icon/text) | Inaccessible to colorblind users and to VoiceOver (color has no audible representation) | Look for color-only state changes with no accompanying icon/text |
| Custom animation/transition with no Reduce Motion check | Forces motion on users who've explicitly disabled it | grep for custom animation code with no `isReduceMotionEnabled` check |
| Swipe-only or gesture-only interaction with no alternative action | Unusable via Switch Control, which can't perform complex gestures | Check whether an `accessibilityAction` alternative exists alongside the gesture |
| Compound view (icon + label) exposed as separate VoiceOver elements when they should announce together | VoiceOver users hear two fragments instead of one coherent announcement | Check for `.accessibilityElement(children: .combine)` (or `.ignore` with an explicit combined label) on compound controls |
| Async content change with no accessibility notification | VoiceOver users get no signal that new content appeared without a navigation event | grep for state updates from async work with no `UIAccessibility.post(notification:)` call |

## Procedure

1. Read the actual view code and check the static patterns above.
2. For each finding, state the concrete assistive-technology
   consequence (which user, using what technology, hits what problem)
   — not "may have accessibility issues."
3. If the project's test target has `performAccessibilityAudit()`
   available, recommend running it — and if it's already run, use its
   actual output as `TEST_VERIFIED` evidence, not a description of what
   it would probably find.
4. Explicitly separate what was found by static review from what would
   need VoiceOver/Switch Control/Reduce Motion actually enabled to
   confirm.
5. If accessibility identifiers for UI testing (not VoiceOver labels)
   are what's actually needed, hand off to `ios-ui-test-engineer` —
   related but a different concern (testability, not assistive tech).

## Common Mistakes

- Treating a comprehensive static checklist pass as "fully accessible"
  — static review cannot confirm VoiceOver's actual reading order or
  Switch Control usability.
- Adding an `accessibilityLabel` that just restates the visible text
  redundantly instead of describing function ("Photo of sunset" vs.
  "photo" when the surrounding text already says "sunset").
- Confusing `accessibilityIdentifier` (for UI test selectors) with
  `accessibilityLabel` (for VoiceOver) — they serve different purposes
  and a control usually needs both, not one standing in for the other.

## Verification

- A missing-label/trait/Dynamic-Type/tap-target/color-only finding from
  reading code is `STATIC_ANALYSIS`.
- `performAccessibilityAudit()` actually run and its output shown is
  `TEST_VERIFIED`.
- VoiceOver/Switch Control/Reduce Motion actually enabled and the
  behavior actually observed is `RUNTIME_VERIFIED`.

## Evidence Requirements

Per `ios-evidence-reporting`'s matrix, "fully accessible" is never
claimable from static inspection — state what was checked (which
categories, which screens) and what remains unverified rather than
implying completeness.

## Claim Restrictions

- Never say "fully accessible" or "accessible" as a blanket claim —
  report per-category findings (labels, contrast, Dynamic Type, motion,
  Switch Control) with their own evidence tier each.
- Never claim VoiceOver reading order is correct without actually
  having heard it (`RUNTIME_VERIFIED`) or run an automated audit
  (`TEST_VERIFIED`) — a logical code read is not the same evidence.
- Never claim `performAccessibilityAudit()` passing covers everything —
  it audits specific categories; state which ones, don't imply total
  coverage.

## Output Format

Findings grouped by category (labels/traits, Dynamic Type, contrast,
tap targets, motion, Switch Control, notifications), each with
file:line, the concrete assistive-technology consequence, and the fix.
Close with the `ios-evidence-reporting` status block, explicit about
which lines are `STATIC_ANALYSIS` vs. `TEST_VERIFIED`/`RUNTIME_VERIFIED`.
