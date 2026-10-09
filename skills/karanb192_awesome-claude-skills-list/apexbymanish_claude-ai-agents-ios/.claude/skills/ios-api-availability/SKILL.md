---
name: ios-api-availability
description: Procedure for determining whether code actually works at a project's stated minimum iOS version — deployment target vs. API introduction version vs. guard correctness. Use when asked "does this work on iOS 14", "is this compatible", about deprecated APIs, or @available/if #available guards.
---

# iOS API Availability

## Purpose

Answer "does this work on iOS X" with an actual comparison of four
specific facts, not an impression. Never claim compatibility without
having checked all four.

## When to Use

Any question about minimum deployment target compatibility, a specific
API's availability, deprecated-API usage, or `@available`/
`if #available`/`#if` guard correctness.

## Inputs

- The project's actual stated minimum deployment target — read it from
  the project settings/`Package.swift`/`CLAUDE.md`, never assume it.
- The specific API(s) in question.
- If `ios-agent` MCP is configured,
  `mcp__ios-agent__check_availability_guards` alongside the manual
  check — `STATIC_ANALYSIS` tier, same as reading the code, never
  higher. It specifically catches the over-restrictive-guard case
  below, which is easy to miss by eye.

## Core Knowledge

- **`#if os(iOS)` and `@available`/`if #available` are different
  mechanisms.** The former is a *compile-time* platform-family check
  (does this even compile for this OS family); the latter is a
  *run-time* OS-*version* check. Confusing them is a real, common
  mistake — a `#if` guard does nothing to protect a version-specific
  API from crashing at runtime on an older OS in the same family.
- **A missing guard is the obvious failure mode; an
  over-restrictive guard is the sneaky one.** `@available(iOS 16, *)`
  on an API that actually only needs iOS 15 doesn't crash anything —
  it silently drops support for every iOS 15 device for no reason,
  and nobody notices because nothing breaks, it just quietly works for
  fewer users than it could.
- **Framework availability and symbol availability aren't the same
  check.** A framework can exist in the SDK you compile against while
  a specific symbol inside it was only introduced later — check the
  specific API's own `@available` annotation in its documentation/
  header, not just "is the framework importable."
- **Deprecation isn't removal.** A deprecated API usually still works;
  the question is whether it still behaves the same way, and whether
  there's a replacement worth adopting given the project's actual
  minimum target (see Common Mistakes).

## Detection Patterns

| Pattern | Risk | Detect by |
|---|---|---|
| API call with no availability guard, API's introduction version above the project's minimum deployment target | Crashes or is unavailable on real devices still on the minimum target | For each API in question, compare its documented introduction version against the project's actual minimum target |
| `@available`/`if #available` guard set higher than the API actually requires | Silently drops support for real devices between the true minimum and the guard's version — no crash, no signal, just fewer supported users | Compare the guard's stated version against the API's actual documented introduction version, not just "a guard exists" |
| `#if os(iOS)` used where a version check was actually needed | Compiles fine, still crashes at runtime on an older iOS version in the same family | Check whether the guarded API is version-specific, not just platform-specific |
| `@available` guard present but the guarded call happens outside the guarded scope (e.g. inside an escaping closure captured before the check) | The guard doesn't actually protect the call it looks like it protects | Trace execution: does the flagged API call actually execute *inside* the `if #available` branch, or just textually near it |
| Deprecated API used with no note of a replacement or reason to keep it | Missed opportunity, or a behavior change already shipped in the OS that the deprecation warning is flagging | Check the deprecation message for *why* — some deprecations mean "still works, better option exists," others mean "behavior changed" |

## Procedure

For every API call in question, establish these four facts and report
all four together — not a conclusion without showing the comparison:

```text
Current deployment target: [read from project settings, cited]
API introduced version: [from Apple's documentation, cited]
Required guard: [what guard, if any, is actually needed]
Actual project compatibility: [does the code as written handle this correctly]
```

1. Read the project's actual minimum deployment target — don't assume
   a common default.
2. Look up the API's actual introduction version.
3. Compare: if introduction version > deployment target, a guard is
   required; if introduction version ≤ deployment target, no guard is
   needed and one present anyway isn't wrong, just unnecessary.
4. If a guard exists, check its stated version against the API's real
   introduction version — flag both "missing" and "over-restrictive"
   mismatches.
5. Report the four facts above for every API checked, not just the
   ones that turned out to be a problem — a clean check is still
   evidence.

## Common Mistakes

- Assuming the newest guard/API pattern is automatically the right
  answer without checking this project's actual minimum target first
  (see `ios-api-availability`'s companion project-constraints
  discipline in `CLAUDE.md.template`).
- Treating "compiles without a warning" as proof of runtime
  compatibility — the compiler only catches API availability, not
  necessarily every version-specific *behavior* difference.
- Reporting only the APIs that had a problem, making it impossible to
  tell later which ones were actually checked vs. never examined.

## Verification

- The four-fact comparison above, from documentation and source
  reading, is `STATIC_ANALYSIS`.
- Confirming the app actually builds against the stated minimum target
  (a real Xcode build with that deployment target set, not just a read)
  is `BUILD_VERIFIED`.
- Confirming behavior on an actual device/simulator running the
  minimum OS version is `RUNTIME_VERIFIED`.

## Evidence Requirements

"Works on iOS 14" requires the full four-fact comparison at minimum
(`STATIC_ANALYSIS`); a stronger claim requires actually building and,
ideally, running against that minimum version (`BUILD_VERIFIED`/
`RUNTIME_VERIFIED`). Never report compatibility from having checked
only the API's existence without checking the guard's correctness.

## Claim Restrictions

- Never say "compatible with iOS 14" without having actually compared
  the API's introduction version against 14, not just noticing *a*
  guard is present.
- Never say a deprecation is "safe to ignore" without reading what the
  deprecation message actually says changed.
- Never assume the project's deployment target — state where you read
  it from.

## Output Format

The four-fact table (deployment target / API version / required guard /
actual compatibility) per API checked, findings for any mismatch with
file:line and the concrete fix, and the `ios-evidence-reporting` status
block.
