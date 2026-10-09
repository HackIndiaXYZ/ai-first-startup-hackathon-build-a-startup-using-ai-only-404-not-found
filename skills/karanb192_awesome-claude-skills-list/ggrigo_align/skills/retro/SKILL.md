---
name: retro
description: Synthesize the /align archive into a pass document — aggregate metrics, failure-mode clusters, pipeline-blind-spot clusters, proposed patches with human-review gates. Reads the archive; never modifies it.
---

<!-- v0.8.4 — 2026-07-13 (name-purge): retired the estate term "contract" —
     "archive contract" → "archive rules"; vocabulary only, behavior unchanged.
     v0.8.3 — 2026-07-01. Fable-touch batch 1 (skills-estate shape-up 2026-07);
     first skill-local version header (prior history at plugin level: v0.6
     retro-output/, v0.7.0 apply mode + saturation + dry-run 2026-05-24,
     v0.8.0 analyst pass 2026-05-26). De-prescribed the clustering
     micro-recipe (tokenize/stopword steps) to its goal; all interfaces kept:
     argument grammar, sum-invariant check, ≥2-corrections/≥2-sessions cluster
     qualification, saturation procedure (K=5, N>K), pass-document schema,
     apply-mode semantics incl. rollback + Applied-footer dedup, read-only
     archive guarantee. No model is named anywhere: the skill inherits the
     session model. -->

# /retro — archive synthesis

`/retro` is the downstream consumer of `/align`'s archive. It reads the manifest, opens each session's `.md`, and writes one synthesis pass document per run. It proposes patches; it does not apply them.

This skill covers both modes of the synthesis loop:

- **Default invocation** (no `apply` arg) — synthesis side. Reads the archive, writes a pass document with proposed patches.
- **`/retro apply`** — Stage 2 of the review-gate. Reads a marked-up pass document, applies accepted patches to target files, records what landed. See §Apply mode below.

See `references/retro-design.md` for the architectural rationale and review-gate mechanics. See `references/archive-format.md` for the manifest and per-session `.md` schemas /retro reads from.

## Arguments

```
/retro                              # synthesis: last 7 days, all sources
/retro 2026-05                      # synthesis: one month
/retro 2026-05-15..2026-05-22       # synthesis: explicit date range
/retro rhythm                        # synthesis: filter by source slug
/retro rhythm 2026-05                # synthesis: both filters
/retro apply                        # apply mode: apply the most recent pass
/retro apply <pass-file>            # apply mode: apply a specific pass file
/retro apply --dry-run              # apply mode: preview only, no file writes
/retro apply --dry-run <pass-file>  # apply mode: preview a specific pass file
```

Resolve the args:

- If the first arg is literal `apply` → switch to apply mode (see §Apply mode). Remaining args, in any order: `--dry-run` flag (optional); pass file path (optional; defaults to most recent file in `<archive>/retro-output/`).
- If the arg matches `YYYY-MM` → month filter, last day inclusive.
- If the arg matches `YYYY-MM-DD..YYYY-MM-DD` → explicit range, both inclusive.
- If the arg is a single kebab-case token not matching either date shape → source-slug filter.
- If two args are provided (synthesis mode) → first is slug, second is date filter.
- If no args → default synthesis: last 7 days, all sources.

## Inputs

Read these in order:

1. **Manifest** at `rhythm/align-archive/align-index.md` (or equivalent — the archive folder may not be under `rhythm/`; check `~/align` working memory for the active archive path).
2. **Per-session `.md` files** in the archive folder, one per filtered row.
3. **Pending corrections queue** at `align-archive/align-corrections-pending.md` if it exists.

Skip the `.html` files. Per `references/integrations.md` §/retro integration: the archive is consumed via `.md` only.

If the manifest file is missing: the archive doesn't exist yet. Report this and stop. Do not create the manifest from /retro — that's /align's job during Phase 2.

If the manifest exists but the filter selects zero rows: tell the user the filter is empty and suggest broadening it. Do not write an empty pass file.

## Process

### Step 1 — Parse the manifest

Read each row and apply the date/slug filter. Keep:

- Session number (`#`)
- Date
- Source string
- The six count columns (✅ ❌ 🔶 🔷 🤷 ⬜)
- Total `Claims` count
- Filename of the per-session `.md`

Verify the per-row sum-invariant (✅+❌+🔶+🔷+🤷+⬜ = Claims). If any row fails, flag it in the pass output's anti-pattern section — don't stop.

### Step 2 — Read each session's `.md`

For each filtered row:

1. Open the `.md` file referenced in the manifest row.
2. Parse three sections (per `references/archive-format.md`):
   - `## Summary` table (already covered by the manifest; sanity-check the totals match)
   - `## Corrections Required` — list of corrections; each has a claim, the user's reality note, and a rating
   - `## Missing — Not Captured` — list of items the user added via the form's missing affordance

If any of the three sections is missing or malformed, log the file path in the anti-pattern section and proceed with what's available.

### Step 3 — Cluster corrections (failure modes)

For each correction across all sessions, extract the claim text and the reality note, and tag with source slug and session date. Then group into clusters by:

- **Shared root noun** — the most-frequent meaningful noun in the claim. Examples: "handover," "release," "deadline," "decision," "deploy," "PR," "meeting."
- **Structural feature in the reality note** — what kind of correction it is. Examples: "date was wrong," "status was wrong," "wrong party named," "missed a precondition," "overstated completion."

A cluster qualifies if:

- ≥2 corrections share both the noun and the structural feature, AND
- They come from ≥2 different sessions (cross-session signal, not a single-session repeat).

For each qualifying cluster, name it with a one-line label, list its instances, and write a one-paragraph root-cause read. Severity tag is the strongest rating among the cluster's instances (❌ > 🔶 > 🔷).

#### Meta-clusters (corpus-level patterns)

Some clusters aren't found by grouping instances on noun + feature — they're found by aggregate rates across the corpus. Examples:

- **Self-rater bias.** Own-work passes (producer == rater) systematically under-flag errors relative to external-rated passes. Evidence: aggregate ❌ rate diverges between own-work and external subsets.
- **Aspirational claims.** A 🤷 (can't-verify) rate above ~15% signals practices committed-but-untested. Evidence: corpus-level 🤷 rate.

Meta-clusters qualify on **aggregate evidence**, not on the ≥2/≥2 instance rule. Shape them like instance clusters — label, root-cause paragraph — but the "Where surfaced" table reports rates and subset comparisons rather than per-instance citations. Most meta-cluster patches are Informational (no diff); see Step 5.

### Step 4 — Cluster missing items (pipeline blind spots)

Same grouping as Step 3 but on `## Missing — Not Captured` entries:

- Shared noun / topic that keeps being missed by the producer.
- Optional shared structural feature (e.g., "always missing the cross-team dependency," "always missing the financial impact").

A cluster qualifies on the same ≥2/≥2 rule.

For each, write a one-paragraph "what's blind" note.

### Step 4.5 — Saturation check

After both clustering steps complete (Step 3 + Step 4), check whether the latest sessions in the filter window introduce new cluster types versus the prior sessions. Adapted from [Hamel Husain & Shreya Shankar's evals workflow](https://maven.com/parlance-labs/evals): *"if ~20 new traces don't surface a new failure category, the corpus is saturated."*

**Procedure:**

1. Walk the filtered sessions in date order. Let `N` = total filtered session count.
2. Pick a saturation window `K`. Default: `K = 5` (the minimum useful comparison). If the user supplied a custom window via args (future enhancement), use that.
3. **Require `N > K`.** If not, set saturation status to `insufficient data` and skip the rest.
4. Collect the set of cluster types active across sessions `1..N-K` (call it *prior set*).
5. Collect the set of cluster types active across sessions `N-K+1..N` (call it *recent set*).
6. Compute `new_in_recent = recent_set − prior_set`.
7. Set saturation status:
   - **`saturated`** if `new_in_recent` is empty — the last `K` sessions added no new cluster types.
   - **`active`** if `new_in_recent` is non-empty — recent sessions are still surfacing new patterns; the corpus hasn't converged.

**Saturation is a signal, not a stop.** `/retro` continues with patch proposal in either case. The user reads the status to decide whether to keep collecting traces (if `active`) or to focus on fixing the surfaced patterns (if `saturated`).

**Edge cases:**

- **Single-source filter (e.g., `/retro rhythm`):** the saturation read is for that source only. Sessions from other sources don't affect it.
- **Very large archives (N >> 20):** the K=5 default reads a small recent slice. To read the full Hamel-scale window, the user filters to recent traces (e.g., `/retro 2026-05`) so the saturation check fires over the relevant N.
- **Mixed-source archives:** if the recent window happens to draw from a different source than the prior window, the saturation read can be misleading. Note the source distribution in the §Anti-pattern self-check.

### Step 4.6 — Analyst pass (additive in v0.8)

After clustering + saturation, before patch proposals, run an **analyst pass** over the manifest table. The goal: surface quantitative patterns and non-discriminating signals that aren't captured by cluster-shape reasoning. Borrowed from Anthropic's `skill-creator` benchmark workflow ([reading note tick-144](../../agent-ggrigo/reading/2026-05-26-anthropic-plugins-survey-part-2.md)).

**What to compute:**

1. **Per-producer pass-rate variance.** Group the manifest's rows by source slug (the "Source" column). For each group with ≥3 sessions:
   - Compute `mean ± stddev` of the accuracy roll-up (✅ / rated) across those sessions.
   - Surface groups with `stddev > 15%` as **high-variance producers** (the same producer flips between good and bad across sessions; something is unstable upstream).
   - Surface groups with `stddev < 5%` and `mean > 90%` as **non-discriminating producers** (always rate near-perfect; their claims may not be falsifiable enough to be informative).

2. **Per-claim recurrence detection.** Across pass files, identify *individual claim texts* (the `> {claim text}` content) that recur across sessions:
   - **Recurring-and-always-correct**: the same claim shape rates ✅ in ≥3 separate passes. Candidate for *dropping from future extraction* — informative noise.
   - **Recurring-and-mixed**: the same claim rates ✅ in some passes and ❌/🔶 in others (≥2 of each). Candidate for *root-cause investigation* — the claim is genuinely ambiguous; either the producer is unstable on this claim or the user's grading criteria shifted.

3. **Time/token tradeoffs** (when archive carries cost data; future-archive-format extension): not in v0.8. Placeholder for v0.9.

**Output**: a new `## Analyst pass` section in the schema (see Step 6). Findings are descriptive, not prescriptive — they inform the patch proposal step but don't drive it directly.

**When the analyst pass surfaces nothing**: omit the section entirely (don't emit empty headers).

### Step 5 — Propose patches (gated)

For each qualifying cluster (failure-mode or blind-spot), propose one concrete patch. A patch is one of:

- **Producer prompt edit** — a target file path + section + diff.
- **CLAUDE.md rule** — a one-line rule body to add to the user's CLAUDE.md.
- **Skill SKILL.md edit** — a target file + section + diff.
- **Informational (no patch)** — for clusters where the right response is awareness, not a rule change.

Each patch has a Review status of `⬜ pending`. The user accepts/rejects/revises in the pass document directly (Stage 1 of the review gate — see `references/retro-design.md` §Review-gate mechanics).

Do not propose more than one patch per cluster. If multiple patches would all help, pick the one most likely to land.

**Resolved instances (optional).** When a cluster's instances are largely already addressed in earlier PRs or ticks, list them under a `**Resolved instances:**` line in the cluster (with PR # or commit SHA), and propose a patch only for the remaining unresolved instance(s). This preserves the historical signal — "this cluster mattered enough to be patched 6 times" — without inflating the patch list with closed work.

### Step 6 — Write the pass document

Output path: `<archive-folder>/retro-output/YYYY-MM-DD-pass-N.md` where:

- `YYYY-MM-DD` is today's date.
- `pass-N` is the next sequential pass number for today (1 if first, 2+ otherwise — check the directory).

Create the `retro-output/` subdirectory if it doesn't exist.

Use this schema:

```markdown
# /retro pass — synthesis

Generated: YYYY-MM-DD HH:MM TZ
Scope: <N datapoints, filter description>
Sources read: <list of session filenames>

---

## Aggregate metrics

| # | Source | Claims | ✅ | ❌ | 🔶 | 🔷 | 🤷 | ⬜ |
|---|--------|--------|----|----|----|----|----|----|
| ... |
| **Total** | | ... |

Accuracy roll-up (✅ / rated): N%.            <!-- rated = total − ⬜ -->
Raw accuracy (✅ / total): N%.                 <!-- emit only when ⬜ > 0 -->
Calibration roll-up ((✅+❌+🔶+🔷+⬜) / total): N%.
Aspirational rate (🤷 / total): N%.

Saturation status: <saturated | active | insufficient data> (window K = N).

---

## Analyst pass

[Emit this section only if analyst-pass findings exist; omit entirely otherwise. v0.8 additive.]

### Per-producer variance

| Producer | Sessions | Mean accuracy | Stddev | Tag |
|----------|----------|---------------|--------|-----|
| <source slug> | N | M% | σ% | <high-variance \| non-discriminating \| stable> |

- **High-variance** (stddev > 15%): <producer slug> — flips between <highest>% and <lowest>%. Investigate upstream instability.
- **Non-discriminating** (stddev < 5%, mean > 90%): <producer slug> — claims may not be falsifiable enough to be informative. Consider whether to keep extracting.

### Recurring claims

- **Always-correct (≥3 passes, no errors)**: "<claim text excerpt>" — candidate for dropping from extraction. Informative noise.
- **Mixed (≥2 ✅ AND ≥2 ❌/🔶 across passes)**: "<claim text excerpt>" — genuinely ambiguous; either producer-side instability or rater criteria drift. Investigate at root.

---

## Failure-mode clusters

### Cluster A: <label>

| Where surfaced | Session | Severity |
|----------------|---------|----------|
| ... |

**Root cause:** <one paragraph>

→ **Proposed patch:** <category, target, diff>
**Review status:** ⬜ pending

### Cluster B: ...

---

## Pipeline-blind-spot clusters

### Cluster <letter>: <label>

| Where surfaced |
|----------------|
| ... |

**What's blind:** <one paragraph>

→ **Proposed patch:** <as above>

---

## Proposed patches (gated)

### Patch 1 — <one-line summary>

**Source cluster:** Cluster <letter>
**Target:** <file path>
**Section:** <heading>

Diff:
```
- <existing>
+ <proposed>
```

**Review status:** ⬜ pending — accept / reject / revise

### Patch 2 — ...

---

## Anti-pattern self-check

- **Sample size:** N sessions. Is this enough for the patterns claimed? <yes/no, with reasoning>
- **Time window:** sessions span <date range>. Is this representative?
- **Author skew:** <list of session sources>. Any one producer over-represented?
- **Manifest sum-invariant violations:** <list any flagged rows>
- **Malformed session `.md` files:** <list any>
- **Re-pass recommendation:** <yes/no, with reasoning>

If >50% of sessions came from a single producer or rater, prepend a top-of-doc warning to the synthesis.

---

## Recursion note

This pass is itself an LLM output. The synthesis claims clusters and proposes patches; both are graded by the next /align session that runs against this file. Self-rater bias (per §Anti-pattern self-check) applies when the same agent produces and grades.
```

### Step 7 — Report back to the user

After writing the pass file, give the user:

1. The absolute path of the pass document.
2. The Aggregate metrics row totals (one line summary).
3. The count of clusters surfaced (failure-mode + blind-spot).
4. The count of proposed patches.
5. Next step: "Open the pass file, mark each patch ✅/❌/🔶 in the Review status line, then run `/retro apply` to land the accepted ones."

## Stop conditions

- **Empty archive** (manifest missing or filter returns zero rows): report and stop. Don't write an empty file.
- **All sessions malformed:** report and stop. Don't write a pass that has no data behind it.
- **Sum-invariant violations across most rows:** report, log the violations, but still write the pass — the user needs to see what's broken.

## Apply mode

When invoked as `/retro apply <pass-file>` (or `/retro apply` to pick the most recent pass file in `<archive>/retro-output/`), /retro runs Stage 2 of the review-gate per `references/retro-design.md` §Stage 2. This is the patch-applying side of the synthesis loop.

### Apply — Inputs

Read the named pass file. Parse:

- Each `### Patch N` section
- Its **Review status** line (`⬜ pending` / `✅ accept` / `❌ reject` / `🔶 revise`)
- Its **Target** file path (declared in the patch's metadata)
- Its diff content (the original block for `✅`; the user's rewritten text for `🔶` — the user is expected to have edited the patch body inline)
- The **Applied** footer if it exists (deduplication signal — see Step 4 below)

### Apply — Process

1. **Validate the pass file.** Every `### Patch N` should have a Review status line and a Target. If malformed, report which patch is broken and stop without applying anything.
2. **Check the Applied footer**, if present. Skip any patch already listed there (dedup; re-runs of `/retro apply` don't double-apply).
3. **For each `✅ accept` or `🔶 revise` patch, in order:**
   - Read the target file.
   - Apply the diff. The diff is the **original block** for `✅`; the **user-rewritten block** for `🔶`.
   - If the diff context doesn't match the current target file (the file changed since synthesis), abort that patch with a clear message naming the patch number and the conflict reason. Don't silent-partial-apply. Continue with remaining patches if their target is a different file; abort the per-file batch if same file.
   - Validate the patched file by parsing it back: markdown headings still match expected structure; YAML still parses; etc., as applicable to the target type.
4. **Append an Applied footer** to the pass file recording what landed:

   ```markdown
   ## Applied (YYYY-MM-DD HH:MM)
   - Patch 1 → CHARTER.md §Decision authority — applied
   - Patch 2 → SKILL.md §Phase 2 — applied (revised version used)
   - Patch 3 → producer-skill.md — skipped: diff context mismatch (file changed since synthesis); re-synth needed
   - Patch 4 → CLAUDE.md §rules — skipped: rejected
   ```

   Footer entries record `applied`, `applied (revised version used)`, `skipped: <reason>`, or `skipped: rejected`. The footer is the dedup signal for subsequent `/retro apply` runs.

5. **Report to the user.** Three counts: how many patches were applied (✅ and 🔶 combined), how many were skipped with a reason, how many were left untouched (`⬜ pending` — user hasn't decided yet). Cite the absolute path of the pass file so the user can re-open it.

### Apply — Dry-run mode

When invoked with `--dry-run` (e.g., `/retro apply --dry-run` or `/retro apply --dry-run <pass-file>`), apply mode runs the full procedure with **zero file writes**:

- Steps 1-2 (validate, check Applied footer) run as normal — read-only.
- Step 3 (apply diffs) is simulated: for each `✅` or `🔶` patch, read the target file, *compute* the patched version in memory, validate the *computed* version (markdown headings, YAML, etc.) — but do not write the target file.
- Step 4 (append Applied footer) is suppressed: the pass document is not modified.
- Step 5 (report) runs but is reframed for preview:

  > **DRY RUN — no files changed.** Would apply: 4 patches across 2 target files. Would skip: 1 (rejected). Would leave untouched: 2 (`⬜ pending`).
  > 
  > Per-patch preview:
  > - Patch 1 → CHARTER.md §Decision authority — would apply (clean diff context).
  > - Patch 2 → SKILL.md §Phase 2 — would apply (revised version).
  > - Patch 3 → producer-skill.md — **would FAIL**: diff context mismatch (file changed since synthesis). Re-synth recommended.
  > - …
  > 
  > To apply for real, re-run without `--dry-run`.

**Use cases:**

- **Many-target-file passes** — preview cumulative effect across files before committing.
- **Stale-synthesis check** — surface diff-context mismatches without partially applying.
- **Validation gates** — CI / pre-merge checks that pass-files don't break their targets.

**Constraint:** `--dry-run` is read-only on the pass file too. It does NOT append a "would-apply" footer, since that footer is the dedup signal for *actual* application. Dry-run reports stay in-conversation; the pass document is untouched.

### Apply — Stop conditions

- **Pass file missing or unparseable** → report and stop.
- **All patches already applied** (per the Applied footer) → report "nothing to do" and stop.
- **Validation failure on a patched file** (e.g., YAML no longer parses, expected markdown headings missing) → roll back that patch by writing back the pre-edit content (snapshot the pre-edit content in memory before applying each patch; restore on validation failure). Record the failure in the Applied footer as a skipped patch with the validation error. Continue with remaining patches targeting other files; abort the per-file batch if subsequent patches target the same already-rolled-back file. If the rollback itself fails (e.g., the snapshot is unavailable for some reason), report the corrupted file path to the user and stop without applying further patches.

### Apply — What it does NOT do

- Open PRs, commit, push, or otherwise touch git. Target-file edits live in the working directory; the user (or their agent) wraps them in commits / PRs through their own workflow.
- Modify the original patch body in the pass file. Only the Applied footer is appended (and only outside `--dry-run`); the patch sections themselves stay as the user marked them.
- Cluster across multiple pass documents. One pass file per invocation.
- Apply patches whose target file no longer exists or has moved (record as a skipped patch in the footer with reason).
- (Under `--dry-run`) write anything to disk. Output is in-conversation only.

### Apply — Recursion

The patched target files and the appended Applied footer are LLM outputs. They're gradable by /align; future /align passes that include these outputs feed back into /retro's spec.

## What /retro does NOT do

- **Modify the archive.** Never edit `align-index.md`, never edit per-session `.md` files. Read-only on the archive folder. (Synthesis and apply modes both honor this.)
- **Apply patches automatically.** `/retro apply` only lands patches the user has explicitly marked `✅ accept` or `🔶 revise`. `⬜ pending` and `❌ reject` markings are honored as-is; nothing is applied without the user's marking.
- **Cluster across multiple users' archives.** /align is single-user by design. /retro reads one archive per run.
- **Read the `.html` files.** Per the archive rules, the `.md` carries the structured signal; the `.html` is for human re-inspection only.
- **Open PRs or commit to git.** Apply mode edits target files in the working directory; git wrapping is the user's call (or the user's agent's call, per their workflow).

## Failure modes to surface

The maintainer agent's own dogfooding passes (the practical /retro analog runs at `~/agent-ggrigo/.align/retro-output/2026-05-23-pass-1.md` and `pass-2.md`) showed three failure modes worth surfacing if /retro hits them:

1. **Self-rater bias.** If the corpus is >50% own-work (the producer and rater are the same entity), prepend a top-of-doc warning and bias §Anti-pattern self-check toward the conservative read.
2. **Sample bias from focused-on-changes passes.** If many sessions extracted dramatically fewer claims than peers (e.g., 14-16 vs. 26-27), the syntheses skew toward what changed and miss drift in unchanged content. Surface this in §Anti-pattern self-check.
3. **Aspirational claim ratio.** A high 🤷 rate (>15%) signals practices committed-but-untested. The synthesis should note that the corpus reads as forward-looking rather than testable — patches against aspirational content are weaker signal.

These are the calibration notes for the LLM running /retro. They are not user-facing UX.

## Recursion note

The /retro skill is run by an LLM, against an archive that grades claims made by LLMs. The synthesis pass document this skill produces is itself an LLM output and needs grading. The agent that maintains /align dogfoods /retro on its own outputs — the pattern-mining output gets graded by /align in the next session. The recursion is operational, not aspirational.

— `/align` maintainer agent (design grounded in real passes 2026-05-23; v0.7.0 extensions — apply mode, saturation check, dry-run — landed 2026-05-24)
