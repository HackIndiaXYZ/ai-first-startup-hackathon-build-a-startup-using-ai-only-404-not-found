---
name: align
description: |
  Epistemic feedback loop. Generate an interactive HTML form where the user rates LLM-produced claims as correct, wrong, almost, needs-nuance, can't-verify, or skipped — plus add notes and flag missing items. Submit downloads an align.md that Claude reads back to apply corrections to TASKS.md, smart-memory (guarded), and the per-session archive.

  Source-agnostic by design: any producer (rhythm, digest, briefing, todo, code review, financial recon, anything) that emits claims matching the claim shape can be aligned.

  Trigger words: "/align", "align", "give feedback", "correct the rhythm", "that's not right", "let me correct", "alignment feedback", "epistemic feedback", "calibrate".

  IMPORTANT: This skill writes output to the ACTIVE WORKING FOLDER — not the root selected folder. If no active folder is specified, ask.
---

<!-- v0.9.0 — 2026-07-18 (laptop-code, Fable 5): form standardization from the
     full-archive retro (references/v0.9-standardization-design.md — 23 forms,
     ~730 claims). Template v0.9: decision cards (kind:"decision", 2–4 options
     + auto "Other — see note", Recommended-first), localStorage autosave +
     restore, "unclear as written" quick-chip (🔷 + "Unclear as written: "
     prefix), export fixes (all six Summary rows always; unrated exports as
     ⬜ Skipped (unrated); DOM flush against note truncation; empty-note
     nudge on corrections), E-expand implemented, N opens notes on any
     verdict, revisit banner restored, narrow-screen fallback keeps Missing +
     Download, Google Fonts CDN removed (self-contained system stacks).
     SKILL.md: copy-template-verbatim rule, ≤25 claims per form, ## Decisions
     in Phase 2.
     v0.8.3 — 2026-07-13 (name-purge): renamed the public "Claim Adapter Contract"
     → "claim shape" (retired the estate term "contract"); vocabulary only, schema unchanged.
     v0.6.0 — 2026-07-01. Fable-touch batch 1 (skills-estate shape-up 2026-07);
     back-ported into canonical system/skills as part of the align 0.8.2 reconcile.
     Light de-prescription (Phase steps restated around outcomes; Phase-2 report
     grounded: counts must reflect writes actually performed); condensed the header
     history (full detail: plugin CHANGELOG.md + git). All interfaces preserved
     verbatim: the claim shape, template placeholders, surface-neutral
     handoff, dropbox scan, smart-memory guard + filter, archive + manifest.
     No model is named anywhere: the skill inherits the session model.
     v0.5.0 — May 22, 2026. Phase 3 Correction SDK extraction: SKILL.md slimmed
     349→~220 lines; rhythm heuristics → references/claim-extraction-rhythm.md,
     archive layout → references/archive-format.md, smart-memory queue + TASKS.md
     handling → references/integrations.md; claim schema promoted to the public
     claim shape.
     v0.3.3 — May 22, 2026. Cross-surface parity: surface-neutral handoff
     (file:// primary, computer:// additive), surface-agnostic dropbox scan,
     guarded smart-memory writes with pending-queue fallback, {{TIMEZONE}}.
     v0.3.2 — May 22, 2026. Spec compliance: dropped `version` from YAML
     frontmatter (per Anthropic spec — git history + this changelog carry it);
     documented `verifiable`; reconciled manifest column order.
     v0.3.1 — May 20, 2026. Template v0.4.1 (always-visible Download button).
     v0.3.0 — March 15, 2026. Correction SDK integration; source-agnostic claim
     format; new template. v0.2.x — March 2026. incoming-docs/ pickup, archive +
     manifest, /retro integration; Turso fabric source.
     v0.1.0 — March 11, 2026. Created during /rhythm session to close the
     epistemic feedback loop. -->

# Align — Epistemic Feedback Loop

## Purpose

LLM outputs contain claims. Some are right, some are wrong, some need nuance. /align turns reading-and-muttering into a structured artifact:

1. A producer emits claims matching the claim shape below.
2. /align renders them into an interactive HTML form.
3. The user rates each claim, adds notes, flags missing items.
4. /align reads the downloaded `.md`, applies corrections to TASKS.md and smart-memory (when wired), archives the datapoint.
5. `/retro` mines the archive for failure-mode patterns → skill prompt patches and CLAUDE.md rules.

## The claim shape

This is the public interface. A producer that emits an array of claim objects matching this schema can be aligned, regardless of what produced the output. No instrumentation required beyond the array.

### Schema

```javascript
{
  id: 1,                          // sequential integer, document order (required)
  text: "Nikos shared K16 doc",   // the falsifiable assertion (required)
  source: "fabric digest",        // human-readable provenance (required)

  // Optional — for timeline-mode rendering
  time: "13:26",                  // timestamp; presence flips the form to timeline mode
  icon: "slack",                  // source icon key: calendar, gmail, slack, fireflies, drive, fabric, rhythm, commitment, briefing

  // Optional — supporting context
  desc: "Longer description...",  // one-line context below the claim
  detail: "Full raw content...",  // verbatim original, shown in expandable detail
  categories: ["adidas/lsr"],     // topic tags; surface in filters
  files: ["doc.pdf (5MB)"],       // file attachment labels
  attendees: "Thomas Tsotsos",    // meeting attendees (for transcript-sourced claims)
  link: "https://slack.com/...",  // canonical source link

  // Optional — epistemic affordance
  verifiable: true                // default true. Set false for claims derived from filesystem state, smart-memory recall, or multi-step LLM inference the user cannot independently verify. Pre-rates as 🤷 "can't verify" with a visible badge; the user can still override.
}
```

### Decision cards (v0.9+)

A second card type for owner rulings — questions with options, not falsifiable
assertions. The archive shows sessions hand-rolling bespoke forms whenever they
needed these; now they're first-class:

```javascript
{
  id: "D1",                       // shares the id namespace with claims
  kind: "decision",               // switches the card to option-pick rendering
  text: "Default headcount basis when someone asks team size?",
  source: "owner ruling",
  options: [                      // 2–4 substantive options, no more
    "Group payroll (27) (Recommended)",  // recommended option FIRST, suffixed "(Recommended)"
    "External round number (~25)",
    "Always state the basis"
  ]
}
```

The template auto-appends **"Other — see note"** — never include it yourself.
Keys 1–N pick an option. Decisions are counted separately ("n/m decided"),
excluded from the accuracy roll-up and the manifest sum-invariant, and export
under `## Decisions` with **Choice:** + optional **Notes:**. Don't repurpose
claim verdicts as go/no-go votes — that's a decision card.

### Modes (auto-detected)

- **Claim mode** — no `time` on any object. Cards render as "Claim N" with the source line in italics. Use for *lists of assertions* (briefings, todos, status reviews).
- **Timeline mode** — every object has `time`. Cards render with timestamp headers and source icons. Use for *chronological readings* (digests, day status, commitment timelines).

Mixing modes within one form is supported but typically confusing — pick one per session.

### The `verifiable: false` affordance

Some claims are derived from sources the user can't inspect from memory — filesystem state they didn't read, smart-memory recall, multi-step inference. Asking a yes/no rating on those is a calibration trap: the user will guess, and the guess will be archived as truth. Mark such claims `verifiable: false` so they pre-render as 🤷 with a visible badge. The user can still upgrade or downgrade the rating, but the default acknowledges the epistemic gap.

### Producer responsibilities

A producer (rhythm, digest, code review, anything) must:

1. Walk its output and identify falsifiable claims. (For rhythm-shaped sources, the heuristics live in `references/claim-extraction-rhythm.md`. For other sources, the producer brings its own extraction logic.) **Cross-doc citations count.** When the source says *"per `X.md`"* or *"as documented in `Y`"*, that phrase is itself a falsifiable claim about `X`/`Y`'s content — verifiable by grep against the cited file. Extract these; don't skip them as mere attribution.
2. Build the claim array matching the schema above.
3. **Serve ≤ ~25 claims per form.** The archive's worst waste is fatigue: a 93-claim form left 76 unrated, its re-serve left 64 more. Chunk larger sets into multiple forms (re-serving the unrated remainder, priority-ordered, is the established pattern).
4. Provide context for the form: a human-readable `{{CONTEXT}}` label, a `{{SOURCE}}` description, a kebab-case `{{CONTEXT_SLUG}}` for filenames.
5. Optionally provide `{{TIMEZONE}}` (IANA name) to lock the timestamp in the exported `.md`.

Everything below this section is /align's responsibility, not the producer's.

## Two Phases

### Phase 1: Generate the HTML form

Done when: a populated `align-{slug}-YYYY-MM-DD.html` sits in the active working folder and the user has a working link to open it. How you get there matters less than these invariants:

1. **Identify the active working folder.** Where the work lives, not where the session was launched from. Infer from context; ask if ambiguous. For rhythm-shaped sources, the inference table lives in `references/claim-extraction-rhythm.md`.

2. **Receive or extract claims.** If the producer hands you a claim array, use it. If not — and the source is /rhythm-shaped — apply the heuristics in `references/claim-extraction-rhythm.md`.

3. **Populate `align-template.html` — copy it byte-for-byte, never regenerate it.** 28 of the 36 live forms in the estate drifted (forked verdict sets, lost autosave, stale footers) because sessions rebuilt the form from memory. Read the template file, substitute ONLY the placeholders below, and change nothing else. If the template lacks something the session needs, fix the template (+ CHANGELOG) — not a one-off form. Substitute:
   - `{{CONTEXT}}` → human-readable context (e.g., "Rhythm, Mar 15", "Todo + Horizon, May 21").
   - `{{DATE}}` → `YYYY-MM-DD`.
   - `{{SOURCE}}` → short source description shown in the form header.
   - `{{CONTEXT_SLUG}}` → kebab-case for filenames.
   - `{{TIMEZONE}}` → IANA timezone (optional; falls back to browser local if unsubstituted).
   - The `// {{CLAIMS_INJECT}}` line and the `const claims = [];` below it → replace with `const claims = [... your array ...];`.

4. **Save** to the active working folder as `align-{slug}-YYYY-MM-DD.html`.

5. **Hand off, surface-neutral.** The absolute path is the canonical artifact — every surface understands it. Add per-surface affordances on top.

   **Default (Claude Code, terminals, anywhere `computer://` is unavailable):**

   > Here's your alignment form with N claims extracted from today's output.
   > Open in your browser:
   > [align-{slug}-YYYY-MM-DD.html](file:///absolute/path/to/file.html)
   > Path: `/absolute/path/to/file.html`
   > Rate claims, hit **Download align.md**, then tell me "done".

   **In Cowork** (when a Cowork-specific MCP tool confirms the runtime): add one extra line for one-click open:

   > [Open in browser](computer:///absolute/path/to/file.html)

   Never make `computer://` the only handoff — that breaks Claude Code and any non-Cowork consumer.

### Phase 2: Apply the feedback and archive

> **Note on `rhythm/` prefix.** Archive paths in this skill default to `rhythm/align-archive/` for historical reasons (/rhythm was /align's first producer). When running /align in a non-rhythm working folder, substitute the prefix accordingly (e.g., `clients/adidas/align-archive/`, `clients/adidas/align-index.md`). See `references/archive-format.md` §File locations for the full convention.

Triggered when the user says "done", "apply", "process feedback", etc.

Done when: the corrections are applied (TASKS.md / smart-memory-or-queue), both files are archived as a datapoint, the manifest has its row, and the report reflects what actually happened.

#### Step 1 — Find the align.md

Surface-agnostic: scan all common locations, glob for `align-*.md`, pick the most recent match by mtime. If a filename matches the context slug from Phase 1, prefer it even if not newest.

Locations checked (all of them, every time):
- `~/Downloads/` — universal browser default.
- The active working folder (from Phase 1).
- `incoming-docs/` under the root selected folder (Cowork convention; present in Cowork only).
- The current working directory (Claude Code default).
- The root selected folder itself (Cowork convention).

The user can also hand off explicitly: "I saved it to /tmp/foo.md" — accept and skip the scan.

#### Step 2 — Read and parse

The `.md` has up to five named sections (export format from the template):
- `## Summary` — table of status counts per category; all six verdict rows always present (zero counts included) so ✅+❌+🔶+🔷+🤷+⬜ = Claims is visible. A `⚖ Decisions n/m` row appears when the form carried decision cards.
- `## Decisions` (v0.9+) — one entry per decision card: **Choice:** (the picked option, possibly "Other — see note") + optional **Notes:**.
- `## Corrections Required` — claims marked wrong / almost / needs-nuance, each with a Reality note from the user. A Reality starting with `Unclear as written:` means the claim's *wording* failed, not its facts — fix the phrasing upstream, don't treat it as a factual correction.
- `## Confirmed / Other` — claims marked correct, skipped, or can't-verify; unrated claims appear here as "⬜ Skipped (unrated)". Inline `— *note*` text on ✅/🤷 rows is real signal (steering, context) — read it.
- `## Missing — Not Captured` — items the user added that weren't in the original output.

#### Step 3 — Apply corrections

For each `Decisions` entry (v0.9+): the choice is an owner ruling. Apply it to the artifact the decision was about (the doc, TASKS.md row, or config), and write it to smart-memory (guarded, `decisions` collection) — rulings are exactly what that collection is for. "Other — see note" means the note carries the actual ruling. "*(not chosen)*" stays open — don't invent a default.

🤷 Can't-verify claims stay **open** — never write them to any sink as truth; resurface only when load-bearing (standing owner rule).

For each `Corrections Required` entry:
- If the claim relates to a TASKS.md item → update the row. Append `<!-- align-correction YYYY-MM-DD -->` for traceability. Don't delete.
- If the claim is about a person, project, or decision → write to smart-memory **only if the tools are available** (guard below). Tag with `["align-correction", "YYYY-MM-DD"]` in the `decisions` collection.
- If the claim is about a meeting outcome → leave a note for the next fabric-assembly run.

For `Missing — Not Captured`:
- If it's a task → add to TASKS.md with the correction comment.
- If it's context/knowledge → write to smart-memory (guarded).
- If it's a calendar/schedule item → flag for the user inline in the report.

##### Smart-memory guard

Smart-memory MCP (`recall`, `remember`, `remember_facts`) is present in Cowork by default and **not always present** in Claude Code. Before invoking, check tool availability:

- **Tool available** → drain the pending queue first (see `references/integrations.md`), then write the current corrections.
- **Tool unavailable** → append each would-be write to `rhythm/align-archive/align-corrections-pending.md` as a YAML entry. Never block. The queue is drained by the next session that has the tool.

Full YAML format and drain protocol: `references/integrations.md`.

##### Smart-memory filter (opt-in, v0.7.0+)

Before each `remember_facts()` call (or queue append), check the user's `CLAUDE.md` for an `<align-smart-memory-filter>` block. If present, apply the rules per-correction:

- **Skip** the smart-memory write if a rule says so. The per-session `.md` archive still records the original.
- **Transform** the claim text and / or reality note if a rule rewrites them. Use the transformed values in the smart-memory write; the archive still records the original.
- **Pass through** as-is if no rule matches.

If no `<align-smart-memory-filter>` block exists, behavior is identical to v0.6.0 (unfiltered).

Report the filter activity in the Phase 2 summary: counts of as-is / transformed / skipped, plus anonymized examples for transformed ones. Full spec and audit-trail format: `references/integrations.md` §Smart-memory filter.

#### Step 4 — Archive both files as a datapoint

Every session produces a datapoint = one `.html` + one `.md`. Copy both into `rhythm/align-archive/`. Delete the `.md` from the dropbox once archived. Keep the `.html` in the active folder for local reference; the archive copy is the canonical one for `/retro`.

Full archive folder layout, naming, and invariants: `references/archive-format.md`.

#### Step 5 — Append to the manifest

Append a row to `rhythm/align-index.md` (column schema, sum-invariant, and what doesn't go in the row: `references/archive-format.md`).

#### Step 6 — Report

Be concise, and grounded: every count in the report must reflect writes actually performed this session (auditable against tool results), never intended ones. Example:

> Applied 3 corrections, confirmed 8 claims, added 1 missing item to TASKS.md.
> Wrote 2 facts to smart-memory; drained 0 from the pending queue.
> Archived as datapoint #11 in `rhythm/align-archive/`.

## Where things live

| Concern | File |
|---------|------|
| Rhythm-specific claim extraction, context slug catalog, active folder table | `references/claim-extraction-rhythm.md` |
| Datapoint concept, file locations, manifest schema, naming, sum invariant | `references/archive-format.md` |
| TASKS.md update rules, smart-memory queue YAML, drain protocol, /retro interface, producer onboarding | `references/integrations.md` |
| Interactive form UX, template features, exportMd() | `align-template.html` (the asset) |
| This file | Public interface + Phase 1/2 flow |

## What good looks like

A well-used /align run is short: most claims ✅ with no notes; 2–3 need a Reality note; 1–2 missing items get captured. Two minutes to fill in, saves hours of future confusion.

Over time, the archive accumulates calibrated datapoints. /retro mines them. The originating skill's prompts and the user's CLAUDE.md absorb the lessons. The system learns.
