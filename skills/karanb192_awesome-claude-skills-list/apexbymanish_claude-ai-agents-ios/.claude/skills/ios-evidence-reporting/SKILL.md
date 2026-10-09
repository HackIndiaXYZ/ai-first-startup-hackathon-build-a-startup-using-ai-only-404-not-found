---
name: ios-evidence-reporting
description: Standard for reporting task outcomes with verifiable evidence instead of confident prose. Use before writing "it works", "done", "fixed", "faster", "thread-safe", "secure", or "production-ready" at the end of any iOS agent task — implementation, testing, review, audit, or architecture consultation.
---

# iOS Evidence-Based Reporting

AI confidence is not evidence. AI reasoning is not runtime evidence. A code
change is not automatically a verified fix. Every claim in a report is
backed by evidence at a specific tier — and a claim never gets reported at
a higher tier than the evidence actually reached.

## The seven evidence tiers

From weakest to strongest. A claim's tier is the *weakest* link that
actually backs it — gathering strong evidence for half a claim doesn't
license reporting the whole claim at that strength.

1. **ASSUMPTION** — a belief based on reasoning, not evidence. Never
   reported as verified. Phrase it as a hypothesis: "likely a decoding
   cost" not "is a decoding cost."
2. **STATIC_ANALYSIS** — evidence from reading source, a compiler
   diagnostic, AST/dependency inspection, or a static-analysis tool
   (including an MCP analyzer such as `ios-agent-mcp`) run over source
   without building or running the app. Reading the output of `grep`,
   `wc`, or `git diff` also lands here — running a text command over
   source is still static analysis, not runtime evidence, regardless of
   whether the agent doing it is otherwise read-only. Example: "no
   obvious retain cycle found during static inspection" — this does
   **not** mean "no memory leak exists."
3. **BUILD_VERIFIED** — the project actually compiled. Example:
   "`xcodebuild` completed successfully."
4. **TEST_VERIFIED** — an automated test suite ran and its result is
   shown. Example: "42 tests passed."
5. **RUNTIME_VERIFIED** — the app was actually launched, installed, or
   interacted with (simulator or device) and its behavior observed — a
   screenshot, a deep link reaching the right screen, a manual
   walkthrough. Confirms *behavior*, not a number — see the next tier
   for that.
6. **RUNTIME_MEASURED** — an actual number came from actually running
   the app: Instruments (Allocations, Leaks, Time Profiler), MetricKit,
   XCTMetric, `os_signpost`, a launch-time or memory measurement.
   Required for any performance or memory *improvement* claim — no
   lower tier can support one.
7. **HUMAN_VERIFICATION** — the agent cannot perform the verification
   this claim needs (driving the Instruments GUI, for instance) and
   says so explicitly, rather than guessing or silently skipping it.

Tiers 3-6 all require something to have actually *run*; only 5 and 6
require the app itself to have run. Static analysis — including an MCP
tool's structured findings — never outranks build/test/runtime tiers,
no matter how sophisticated the analysis.

### MCP/tool-assisted analysis is still whatever tier it actually is

Canonical rule, referenced rather than re-derived: an MCP server's
output is graded by what it actually did, not by the fact that a tool
(rather than a human) did it.

- `ios-agent`-style servers are static analyzers — they read source and
  never build or run the app. Their findings are `STATIC_ANALYSIS`,
  identical tier to a manual code read, never higher, no matter how
  structured or confident-looking their output is.
- `ios-simulator`-style servers actually build, install, and launch the
  app — their `build_project`/`run_tests`/`launch_app`/`screenshot`
  output can genuinely earn `BUILD_VERIFIED`, `TEST_VERIFIED`, or
  `RUNTIME_VERIFIED`, because the app actually ran. It still cannot
  produce `RUNTIME_MEASURED` on its own unless it reports an actual
  measured number (a screenshot confirms behavior, not a quantity).

### A pattern match is a lead, not a finding

Canonical rule, referenced rather than re-derived: a `grep` hit, an MCP
tool flag, or any other pattern match is a *candidate* to verify, never
a confirmed issue on its own — regardless of which agent produced it or
how narrow the pattern looks. "`UserDefaults` called near the word
`token`" is a lead; "this stores the session token insecurely" requires
having actually traced that it's a real token, on that path, with no
Keychain wrapper already handling it. Report a match as a lead — cite
the evidence, state what would confirm it — until the trace is actually
done. This applies most often in `ios-security-review`,
`ios-legacy-mapping`, and `ios-feature-implementation`'s Security
Review, but the rule itself lives here rather than being restated in
each.

### Independent review requirement

Any report reaching `BUILD_VERIFIED` or higher — not just
`STATIC_ANALYSIS` — is handed to `ios-evidence-reviewer` before being
presented as final. The agent that ran the build/test/measurement is
not the sole authority on whether its own report is honest about it;
see `ios-evidence-reviewer` for what it checks. Skip this only for a
report making no claim above `STATIC_ANALYSIS`/`ASSUMPTION` (a pure
read-only consult has nothing for the reviewer to add).

## Claim → minimum evidence matrix

| Claim | Minimum evidence |
|---|---|
| Code compiles | `BUILD_VERIFIED` |
| Unit/UI tests pass | `TEST_VERIFIED` |
| A feature's logic/behavior is correct | `TEST_VERIFIED` (the tests that exercise it) |
| The UI renders/looks/behaves correctly | `RUNTIME_VERIFIED` — a passing unit test cannot confirm a visual or layout claim; something has to actually be seen running |
| An API is available at the stated minimum | `STATIC_ANALYSIS` (availability check) |
| No obvious retain cycle | `STATIC_ANALYSIS` only — never "no leak exists" |
| No runtime leak observed | `RUNTIME_MEASURED` (Instruments/Memory Graph) |
| Memory usage improved | `RUNTIME_MEASURED`, before/after |
| Performance improved | `RUNTIME_MEASURED`, before/after |
| Thread-safe | `STATIC_ANALYSIS` + concurrency-relevant tests — never inspection alone |
| Architecture preserved / consistent | `STATIC_ANALYSIS` (architecture review) |
| Security issue addressed | `STATIC_ANALYSIS`/security review, plus a regression test where practical |
| App Store ready | `STATIC_ANALYSIS` (code-visible checks) — metadata/screenshots still need `HUMAN_VERIFICATION` |

If an agent can't reach the tier a claim needs, it reports the tier it
actually reached and marks the gap — it never rounds up.

## Never say, unless the evidence supports it

Do not write these words in a final report unless the matrix above is
satisfied for that exact claim:

- **"fixed" / "working"** — unless `RUNTIME_VERIFIED` or `TEST_VERIFIED`
  backs it.
- **"optimized" / "faster" / "uses less memory"** — unless
  `RUNTIME_MEASURED` before/after backs it.
- **"leak-free"** — never claimable from `STATIC_ANALYSIS` alone.
- **"thread-safe"** — never claimable from `STATIC_ANALYSIS` alone.
- **"secure"** — a security review can say "no issues found in this
  review's scope," never an unqualified "secure."
- **"iOS [version] compatible"** — unless an availability check
  (`STATIC_ANALYSIS` at minimum) actually ran.
- **"production-ready"** — never claimable by any single agent. It's a
  cross-cutting claim spanning build, tests, security, performance,
  accessibility, and App Store readiness at once; no one specialist's
  evidence covers all of it. State which specific checks passed
  instead ("build verified, tests pass, no security findings in this
  review's scope") and leave the umbrella claim unmade.

Use precise language instead:

| Instead of | Say |
|---|---|
| "Fixed it." | "Implemented the proposed fix." |
| "Build works." | "Build verified successfully." |
| "No memory leak." | "Static inspection found no obvious retain cycle." |
| "It's faster now." | "Memory/performance improvement was not measured." (if it wasn't) |
| "Should be fine at runtime." | "Runtime verification is still required." |
| "This is production-ready." | "Build/tests/security review passed; App Store readiness and UX review are separate checks not yet run." |

## The status block

End every report with a compact status block: one line per category
relevant to your domain, each marked:

- `✓ <TIER>` — checked and fine, backed by evidence at `<TIER>`.
- `✗ <TIER>` — checked, and a real problem was found, backed by
  evidence at `<TIER>`.
- `⚠` — not checked, or only an `ASSUMPTION` exists — say why, and what
  tier would actually verify it. Never silently drop a category that
  matters because it wasn't checked; mark it `⚠`, don't omit it.

Pick categories from your own agent's checklist. Don't force categories
that don't apply to your role — a read-only review agent has no `BUILD`
line; an architecture consult has no `TEST` line.

### Example: an implementation/verification task

(`ios-feature-implementation`, `ios-unit-test-engineer`,
`ios-ui-test-engineer`, `ios-memory-performance-engineer`)

```
BUILD        ✓ BUILD_VERIFIED     xcodebuild succeeded
TEST         ✓ TEST_VERIFIED      24/24 tests passed
AVAILABILITY ✓ STATIC_ANALYSIS    iOS 14 compatible (checked 2 new API calls)
MEMORY       ✓ STATIC_ANALYSIS    no retain-cycle pattern found
             ⚠ HUMAN_VERIFICATION Instruments not run — recommend an Allocations pass
PERFORMANCE  ✓ STATIC_ANALYSIS    no blocking main-thread work introduced
SECURITY     ✓ STATIC_ANALYSIS    token stored via existing Keychain wrapper
DIFF         ✓ STATIC_ANALYSIS    4 files changed, diff reviewed end to end
```

### Example: a read-only review/audit/consult task

(`ios-architect`, `ios-ux-reviewer`, `ios-legacy-auditor`)

```
ACCESSIBILITY   ✗ STATIC_ANALYSIS  1 tap target below 44pt (ProfileView.swift:82)
CONVENTIONS     ✓ STATIC_ANALYSIS  matches platform navigation patterns
CONSISTENCY     ✓ STATIC_ANALYSIS  reuses existing button style throughout
ARCHITECTURE    ✓ STATIC_ANALYSIS  MVC-in-name-only (38 VCs >400 lines via grep,
                210 .shared refs via grep)
TESTABILITY     ⚠                  proposed design not yet unit-tested — no test exists
SECURITY        ⚠                  3 leads to verify — see Security signals section
```

Note `ARCHITECTURE` above is `STATIC_ANALYSIS`, the same tier as
`CONVENTIONS` — running `grep`/`wc` and reading real command output is
still reading source, not running the app, even for a read-only agent
whose whole job is that kind of read. Don't grade a grep-derived count
any higher than a plain code read; the strength that matters is
*static vs. runtime*, not *manual vs. tool-assisted*.

## What this is not

- Not a replacement for the full prose report each agent already
  produces — it's a compact summary at the end, and every line in it
  must be traceable to something stated in the body above it.
- Not a demand to run tools you don't have. A read-only agent marks
  `⚠` (or `HUMAN_VERIFICATION` for a specific claim) honestly rather
  than fabricating a check it couldn't perform.
- Not a reason to invent categories. If nothing in your domain
  checklist is relevant to a category, leave it out — don't pad the
  block to look thorough.
