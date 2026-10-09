---
name: design-fidelity-verify
description: Prove a running app matches its design spec by measuring rendered values, not eyeballing a screenshot. Use when the user says "verify the design", "is this pixel-perfect", "check against Figma", "does the app match the design", or "design QA this screen". Runs a bounded vision+numeric loop over web or mobile, classifying every spec row rather than reporting a bare pixel delta. Consumes the figma-design-extract spec table.
license: MIT
compatibility: Requires a browser MCP (web) or a device MCP (mobile) that can evaluate JavaScript in the running app.
---

# Design Fidelity Verify — prove the running app matches the spec

"Looks done" is not a check. This skill runs a **measured feedback loop**: render → capture → read the *actually rendered* values off the live app → compare each against the design spec → fix → re-verify, bounded. The numeric pass is the whole point — it catches what the eye and a screenshot cannot. The bar is **spec fidelity** — every value resolves to its intended token, within tolerance — not literal "pixel-perfect" (a phrase that means little across devices); measure tokens and deltas, don't chase byte-identical pixels.

## Upstream: the spec table

This skill **consumes the design-spec table produced by [`figma-design-extract`](../figma-design-extract/SKILL.md)** — rows of `element | property | exact value | repo token | source component`. If you don't have one yet, run that skill first. The spec is your pass/fail checklist; without it you're back to eyeballing.

## Why this exists (two failure modes)

1. **Blurry capture.** The default device/headless screenshot is often low-res and hides truncation, wrong colors, and small spacing drift. Always capture full-resolution.
2. **No feedback loop.** Building once and declaring victory is not verification. Render → measure → compare → fix → re-measure, with a hard cap so it terminates.

## When to use

Trigger phrases: "verify the design", "is this pixel-perfect", "check against Figma", "does the app match the design", "design QA this screen", or immediately after building a screen with `figma-design-extract`.

---

## Pick your platform (then load the matching reference)

The loop below is **identical for web and mobile**. Only two steps differ — how you capture full-res, and how you read rendered values. **Read the one reference file for your platform before the numeric pass (B5)**; ignore the other.

| Platform | Capture + measure mechanics | Reference to load |
|----------|-----------------------------|-------------------|
| **Web**    | `getComputedStyle` + `getBoundingClientRect` via a browser/Playwright/Chrome MCP; capture at devicePixelRatio ≥ 2 | [`references/verify-web.md`](references/verify-web.md) |
| **Mobile** | The resolved style off the rendered React fiber, read over the Metro/CDP eval channel; capture at `scale: 1.0` | [`references/verify-mobile.md`](references/verify-mobile.md) |

Both platforms then classify each row using [`references/drift-classification.md`](references/drift-classification.md).

Runnable readers ship with this skill — [`scripts/`](scripts/). Don't re-derive them per run.

> **Tool-agnostic:** Argent, metro-mcp, agent-device, Playwright, Chrome MCP — any of them works. The reference files name specific tools as *examples*; what matters is that you read the rendered value, not that you use a particular MCP. The one hard requirement is a channel that can **evaluate JavaScript in the running app**.

---

## The loop (same for every platform)

### B0. Preflight (clear these FIRST)

**In practice most verify time goes to infrastructure gates, not the design diff** — often the large majority of it. Discovering a gate *after* a 15–20 minute native build is the dominant failure mode. Clear all five before you build or rebuild anything:

- **Environment up?** Is the backend/API the screen needs actually reachable? A failed login or an empty data screen is usually a down environment, not a code bug — don't burn a rebuild fighting it. Read the error literally: an auth error naming a bad URL is infrastructure, not a bad credential.
- **Test-data shape right?** Does the account/fixture expose what the screen needs? A component that only renders when `items.length > 1` **verifies nothing** on a single-item account — you will measure an empty screen and report a pass. Confirm the data shape before building.
- **Inspection tooling connected?** Whatever you'll use for the numeric pass (browser devtools/CDP, the app's JS-eval channel, native view introspection) — confirm it actually attaches **now**, not at measurement time. Plan the fallback if it doesn't (see your platform reference). On mobile, note that "the MCP server isn't connected" is not the same as "the tool isn't installed."
- **Build current?** A stale build verifies the wrong code. Rebuild if the bundle/entry changed. Tell-tale on RN: a red box reading "No script URL" or "Unable to resolve module ./index".
- **Authenticated?** Most real screens sit behind auth. Automate the login so re-verifies are repeatable, and keep credentials out of the transcript.

### B1. Run, navigate, and record the path

Build/run the app and navigate to the screen. **Record the navigation as a replayable flow** so every re-verify is identical — no interaction variance between iterations. (See your platform reference for the recording mechanism.)

### B2. Capture full-resolution

Capture the screen at full resolution (web: dpr ≥ 2; mobile: `scale: 1.0`). Low-res capture is failure mode #1 — do not skip the resolution bump.

### B3. Map on-screen elements → code

Get the element tree with names + coordinates, so when something is off you can jump straight from the on-screen position to the `file:line` that renders it instead of hunting.

### B4. Vision pass

Place the app capture beside the Figma reference (`get_screenshot` from the extract step). Enumerate discrepancies **by category** so nothing is hand-waved:

`layout/alignment · spacing · color · typography · radius · sizing · states/icons · missing/extra elements`

### B5. Numeric pass (the rigor)

Read the **actually rendered** values off the live app and compare each against the spec table. **Read your platform's reference file now** (`references/verify-web.md` or `references/verify-mobile.md`) for the exact calls — the discipline is the same:

- Pull the rendered value with the bundled reader (`scripts/web-style-read.js` or `scripts/rn-style-read.js`).
- **Check state parity first.** If the on-screen element is in a different state than the Figma node you extracted from, stop — that's a `VARIANT`, and every delta below it is noise. Re-pick the node.
- **Walk every row** of the spec table: spec value vs measured value → **verdict + delta**.
- **Resolve the measured value back to a named token before you label the row.** A bare hex/px delta is not a finding — see [`references/drift-classification.md`](references/drift-classification.md) for the five verdicts (`PASS` · `DRIFT` · `HARDCODED` · `VARIANT` · `MISSING`) and where each one's fix lands.
- **Tolerance:** rendered box and position values are *fractional* (sub-pixel layout, dpr, dp rounding), so a literal `123.5 === 124` check produces noisy FAILs. Round to the nearest px, or allow ±1px, on every box/position/spacing delta. Colors, weights, and radii compare exactly.
- **Degrade gracefully, don't skip.** If one measurement channel is blocked, fall back to what *is* measurable (bounds/placement/sizing from the element tree) and record the rest as an explicit **residual** — "hex not measured: no JS-eval channel" — rather than silently claiming a full pass.

### B6. Discrepancy report

```
element  | property | spec token / value   | measured / resolves to    | delta | verdict   | scope
---------+----------+----------------------+---------------------------+-------+-----------+----------------
CTA      | bg       | primary-500 #3366cc  | #3060c0 (primary-600)     | —     | DRIFT     | component-level
Title    | weight   | font-semibold 600    | 400 (font-normal)         | -200  | DRIFT     | theme-level
Row gap  | gap      | space-2 8            | 12 (space-3)              | +4    | DRIFT     | component-level
Card     | bg       | surface-0 #ffffff    | #fdfdfd (no token)        | —     | HARDCODED | component-level
```

`delta` is a signed number for numeric properties, `—` otherwise. Sort by `scope`: a `theme-level` row is one upstream fix across every app that consumes the design system, and must not be patched locally.

### B7. Fix + re-verify (bounded)

Fix highest-severity first → replay the recorded flow → re-capture → re-run the numeric pass. Tokenize every value you touch while fixing — never paste a raw hex/px to "make it match"; that just reintroduces drift. **Hard cap: ~3 iterations.** Then stop and report what remains. Unbounded loops cause context rot and undo-fixes.

### B8. Optional clean-context review

For a high-stakes screen, spawn a fresh review subagent to run B4–B6 without the implementer's bias.

### B9. Optional — lock in a regression baseline

Two different jobs, both worth doing:

**Token-drift baseline (this skill).** Serialize the classified rows to a snapshot JSON and commit it. On the next run, [`scripts/token-drift-diff.js`](scripts/token-drift-diff.js) tells you which drift is **NEW** (yours — exit `1`) versus **PERSISTING** (the app already had it). Without a baseline, every run re-reports the app-wide drift as noise and buries the one row you introduced. Schema, exit codes, and the three rules for living with a baseline are in [`references/drift-classification.md`](references/drift-classification.md).

**Visual regression (a different tool).** The numeric pass proves a **first build** matches the spec; VR tools can't do that — they need a prior approved render to diff against. Once it passes, snapshot the screen so a VR tool (Playwright `toHaveScreenshot`, Chromatic, Percy, Applitools) catches *future* regressions. Complementary: numeric diff for first-build conformance, VR for ongoing protection.

---

## Guardrails

- **Never report "matches the design" without the numeric pass (B5).** A clean vision pass alone is not proof.
- **Never measure from a screenshot** — either side. Screenshots catch "wrong thing built", not "4px off".
- **Always capture full-res** (web dpr ≥ 2 / mobile `scale: 1.0`). The default is usually too blurry to trust.
- **Resolve every measured value back to its named token before labelling a row.** Name both tokens on a `DRIFT`; say "resolves to no token" on a `HARDCODED`.
- **Variant-match before drift.** A state mismatch invalidates every delta downstream of it.
- **`MISSING` is an error, not a pass.** A selector that matches nothing has verified nothing.
- **Cap the loop at ~3 iterations** and report residuals honestly rather than thrashing.
- **Record the navigation as a flow** so each re-verify measures the same screen state.

## Worked example

[`examples/worked-example.md`](examples/worked-example.md) — one full pass over a built screen: preflight, capture, both passes, the report, and the fix.
