---
name: diagnose
description: |
  Backward-looking root-cause analysis for /align corrections. Read an /align pass file + the project's instruction surfaces (CLAUDE.md, skills/*/SKILL.md, references/, TASKS.md, optionally smart-memory) and trace each ❌ / 🔶 / 🔷 claim back to the stale, contradictory, or missing instruction that caused it. Output: a per-claim trace report with quoted-evidence citations, 0–100 confidence scoring, and threshold-80 filtering.

  Source-agnostic by design: any /align pass file (whatever producer emitted the original claims) can be /diagnose'd against any project's instruction surfaces.

  Trigger words: "/diagnose", "diagnose", "what went wrong", "trace the misalignment", "find the stale instruction", "why did claude get this wrong".

  IMPORTANT: This skill READS project files (instruction surfaces); it does not write or modify them. It produces a markdown report saved to the archive. Suggested fixes appear in the report but are not auto-applied — that's `/diagnose apply` (v0.9 candidate, not implemented).
---

<!-- v0.8.4 — 2026-07-13 (name-purge): retired the estate term "contract" —
     "Claim Adapter Contract" → "claim shape", "source-scope contract" →
     "source-scope rules"; vocabulary only, behavior unchanged.
     v0.8.3 — 2026-07-01. Fable-touch batch 1 (skills-estate shape-up 2026-07);
     first skill-local version header (prior history tracked at plugin level:
     born in align plugin v0.8.0, 2026-05-26; doc-polished in v0.8.2).
     Rephrased "non-negotiable" hectoring while keeping the rule binding
     (no verbatim quote → confidence ≤50); everything else preserved: the
     source-scope rules, confidence rubric + reserved caps, report schema,
     read-only guarantee, no-silent-scope-widening. No model is named anywhere:
     the skill inherits the session model. -->

# /diagnose — root-cause analysis on faulty context

## Purpose

`/align` captures *what's wrong* in an LLM output (per-claim ratings + reality notes). `/retro` synthesizes *what to build next* across many sessions (longitudinal patterns + feature roadmap). `/diagnose` answers a third question: *why did this specific session go wrong, and where is the fix?*

The trio:

| Direction | Command | Time-scale | What it answers |
|---|---|---|---|
| Capture | `/align` | now | What's in this output? |
| Backward | `/diagnose` (this skill) | single-session | Why did this go wrong? |
| Forward | `/retro` | longitudinal | What features take us forward? |
| Ship | `/retro apply` | longitudinal | Open PRs from accepted patches |

`/diagnose` reads one pass file at a time. It does not cluster across sessions (that's `/retro`'s job).

## When to invoke

The user explicitly invokes `/diagnose <pass-file>` after running `/align` on a session and noticing the corrections suggest a recurring or structural problem — i.e., the operator's gut says *"this kind of mistake keeps happening,"* and they want to know which instruction surface to fix.

Auto-invocation is not supported. `/diagnose` is opt-in because it reads multiple project files and consumes meaningful tokens.

## Argument parsing

```
/diagnose <pass-file> [--scope=<globs>] [--include-smart-memory] [--threshold=<N>]
```

- **`<pass-file>`** (required): path to an `/align` pass file. Either absolute or relative to one of the dropbox locations `/align done` checks (`~/Downloads/`, active working folder, `incoming-docs/`, cwd). If the path is unambiguous, accept it. If multiple matches, list them and ask which.

- **`--scope=<glob>[,<glob>...]`** (optional): comma-separated globs that narrow the source-reading whitelist. If omitted, the default scope applies (see "Source-scope rules" below).

- **`--include-smart-memory`** (optional): off by default. When set, additionally read the `decisions` collection from smart-memory (if available). Privacy + token cost; user opts in when they suspect a past correction's drain is the cause.

- **`--threshold=<N>`** (optional): integer 0–100. Confidence threshold for the main report. Default `80`. Traces below the threshold are filtered into a "Speculative / unconfirmed" appendix.

## Source-scope rules

The instruction surfaces `/diagnose` reads, by default:

```yaml
diagnose:
  read:
    - CLAUDE.md                  # project-root
    - "**/CLAUDE.md"             # nested CLAUDE.md
    - "skills/*/SKILL.md"        # installed plugin skills
    - "references/**/*.md"       # loaded-on-demand reference docs
    - TASKS.md                   # project task list (often source-of-truth for dates / status)
  read_with_caveat:
    - smart-memory (decisions collection)  # opt-in via --include-smart-memory
    - recent producer-side output          # if recoverable from the pass file's source field
  ignore:
    - .env
    - node_modules/
    - .git/
    - secrets/
    - design-tokens/extracted/   # local-only unzip; not canonical
    - anything matched by .gitignore
```

When `--scope=<glob>` is passed, replace the default `read:` list with the user's globs.

Never silently expand scope. If a wrong claim has no verifiable cause within the current scope, report it as "no source found in current scope; consider widening with --scope=..." rather than recursively reading more files.

## Per-claim diagnosis — the reasoning step

For each claim marked ❌ Wrong, 🔶 Almost, or 🔷 Needs nuance in the pass file:

### Step 1 — Extract the claim's content

From the pass file's `## Corrections Required` section, parse:

- The claim text (the `> {claim text}` quote line)
- The source label (the `> *{source}*` italic line, when present)
- The reality note (the `**Reality:** ...` line)
- The rating (Wrong / Almost / Needs nuance — implicit in the `### Claim N: <rating>` header)

### Step 2 — Search scope for potential causes

For each in-scope source file, look for content that could plausibly have caused the wrong claim. Useful heuristics:

- **Date/number contradictions**: if the claim has a number (date, count, deadline, version), grep the scope for the same field with a *different* number. The other number is a candidate cause if it's older than the claim's reality.
- **Outdated assertions**: if a CLAUDE.md or SKILL.md line states something the reality note contradicts, that line is a candidate.
- **Producer-side framing**: if the original producer's prompt (in `skills/*/SKILL.md`) gave the producer a heuristic that would explain the mistake (e.g., "group attendees by surname-prefix" causing "Anna Stein" and "Andrew Stein" to merge), that's a candidate.

### Step 3 — Verification requirement

**Every cited source must include a verbatim quote of the text that establishes the causal claim.** If you cannot extract a quote, the confidence drops to ≤50 (below default threshold; trace lands in the appendix).

This rule is binding — it is what separates a trace from a guess. It mirrors the pattern from Anthropic's `code-review` plugin: *"For CLAUDE.md issues: verifies guideline explicitly mentions it."*

### Step 4 — Assign confidence (0–100)

| Score | Criteria |
|---|---|
| 90–100 | Single cited source, quoted verbatim, no contradictions in other read surfaces. The trace is mechanical and verifiable. |
| 70–89 | Cited source with quoted text supporting the claim, but alternative explanations could fit. The trace is plausible but not uniquely determined. |
| 50–69 | Quoted source has weak claim-coupling (the quote tangentially supports the cause) OR multiple sources point in different directions. |
| 30–49 | No directly quoted source; inference-heavy. Possible patterns identified but not verified. |
| 0–29 | No plausible source within scope; trace is speculative. |

Reserved confidence levels for specific situations:
- **`50` cap when producer evidence is missing.** If the pass file doesn't preserve the original producer output and the claim's cause likely lives in that producer-side context, cap confidence at 50 regardless of how strong the project-file evidence looks.
- **`30` for `--include-smart-memory` traces** that lack other corroborating sources. Smart-memory entries are noisy by design.

### Step 5 — Suggest a fix

Every trace should propose a concrete remediation, sized to the evidence:

- **High confidence (90–100)**: name the exact file + line(s) to change, and the specific edit. E.g., *"Update `CLAUDE.md` line 32 from '2026-05-30' to '2026-06-15' matching TASKS.md line 18."*
- **Medium confidence (70–89)**: name the candidate file + the kind of edit, but acknowledge alternatives.
- **Low confidence (≤69)**: surface as `/retro` candidate (pattern needs more datapoints to confirm cause) — do not propose a specific fix.

## Output format

Write to: `<archive-root>/diagnose-{slug}-{date}.md`

Where `<archive-root>` is the same archive folder `/align` writes to (`.align/`, or the producer-specific prefix per `references/archive-format.md`), `{slug}` matches the source pass file's slug, and `{date}` is `YYYY-MM-DD`.

### Report structure

```markdown
# /diagnose — {context} · {date}

Pass file: `{path-to-pass-file}`
Pass result: {N} claims · {C} ✅ · {W} ❌ · {A} 🔶 · {nu} 🔷 · {un} 🤷 · {sk} ⬜ · sum-invariant {✓ | ✗}

Diagnosis scope: {scope-globs-actually-read}
Smart-memory: {included | not included (default)}
Confidence threshold: {N (default 80)}

## Per-claim traces

[One section per actionable claim — ❌ / 🔶 / 🔷 only.]

### Claim {N} — {rating} (confidence: {score})

**Claim:** {claim text}
**User's reality note:** {notes}
**Source(s) traced:**

1. [`<file>#L<line>`](file:./<file>#L<line>) — quoted text: *"<exact quote>"*. <one-line explanation of how this caused the wrong claim>
2. [`<file>#L<line>`](file:./<file>#L<line>) — quoted text: *"<exact quote>"*. <same shape>

[If 3+ sources: list all that pass the verification requirement.]

**Alternative explanations** (only for confidence 50–89):
- <one-line alternative>
- <one-line alternative>

**Suggested fix:** <concrete remediation sized to confidence>

**Confidence: {score}** — <one-line rationale for the score>

---

## Session-level findings (optional)

[Emit this section only if ≥50% of ❌s trace to a single source — i.e., the cause is structural rather than per-instance.]

### Pattern: <one-line description>

<which claims share this cause, and why a single fix resolves them all>

---

## Recommendations

| Priority | Action | Affected source | Estimated effort |
|---|---|---|---|
| High | <high-confidence single fix> | <file> | <est> |
| Medium | <medium-confidence fix with caveats> | <file> | <est> |
| Low | <wait for /retro pattern> | <TBD> | <wait + watch> |

## Speculative / unconfirmed (appendix)

[Traces with confidence below the threshold. Listed but not promoted to the main report.]

### Claim {N} — {rating} (confidence: {score; below threshold})

**Claim:** {claim text}
**Possible causes** (no quoted source):
- <hypothesis>
- <hypothesis>

**Suggested action:** Surface in next `/retro` pass if pattern recurs.

---

— /diagnose, {date}, run against `{pass-file}`
```

## Phase 2 — what `/diagnose` does NOT do

- **Does not modify any project files.** Read-only against the user's project.
- **Does not auto-open PRs.** That's `/diagnose apply` — explicitly v0.9, not v0.8.
- **Does not cluster across pass files.** Single-session scope; clustering is `/retro`'s job.
- **Does not run `/align` on its own output.** The report is `/align`-able, but the user invokes that explicitly.
- **Does not widen scope silently.** If no source is found within the declared scope, report the gap and offer `--scope=` expansion.

## Failure modes + remediations

### Pass file is malformed

If the pass file doesn't conform to `/align`'s export shape (missing sections, broken markdown), fail loudly: *"Pass file at {path} doesn't parse as an /align export. Expected sections: `## Summary`, `## Corrections Required`, etc."*

### No actionable claims in pass file

If the pass file has 0 ❌, 0 🔶, 0 🔷 (everything ✅ or skipped), report: *"No actionable claims to diagnose. Pass result is clean. {N} claims rated; {N} ✅; no corrections requested."* Don't write a diagnose report file.

### Source-scope reads nothing useful

If all scope files exist but none contain content relevant to the claims, report: *"Read {N} files matching scope; none surfaced quoted evidence for the {N} actionable claims. Consider --scope= widening to include {suggested-globs}."*

### Smart-memory unavailable but requested

If `--include-smart-memory` is passed but the smart-memory MCP tools aren't wired, report at the top of the output: *"Smart-memory requested but not available; trace performed against project files only."* Continue.

## Recursion note

The `/diagnose` report is itself an LLM output. Its per-claim traces ARE claims about cause; the user can `/align` the report to grade whether each trace is correct.

This is intentional. The recursion is the project's load-bearing idea. There is no enforced depth cap — but practical depth 2 is the usual stopping point:

1. `/align` the original session
2. `/diagnose` the corrections
3. `/align` the diagnose report if you don't trust it

Beyond depth 2, returns diminish sharply.

## Archive integration

Every `/diagnose` run produces one archive entry. The archive folder layout (per `references/archive-format.md`):

```
<archive-root>/
├── align-index.md                          # /align session manifest
├── align-<slug>-<date>.md                  # /align session datapoint
├── align-<slug>-<date>.html                # /align session form
├── diagnose-<slug>-<date>.md               # /diagnose report (this skill)
├── retro-output/
│   └── <date>-pass-N.md                    # /retro synthesis pass
```

No manifest sum-invariant applies to `/diagnose` reports (they're qualitative; not graded directly though they can be `/align`-ed). The file lives alongside the source pass file by date + slug pairing.

## References

- Design doc: `references/v0.8-diagnose-design.md` (rationale; resolved decisions).
- Archive format: `references/archive-format.md` (6-shape taxonomy; manifest schema).
- /align interface: `skills/align/SKILL.md` (the claim shape; pass-file export shape).
- /retro interface: `skills/retro/SKILL.md` (the longitudinal-pattern counterpart).
