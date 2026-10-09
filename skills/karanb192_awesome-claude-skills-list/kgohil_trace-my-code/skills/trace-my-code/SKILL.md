---
name: trace-my-code
description: >-
    Build and maintain a living trace of a codebase — the domain flow plus the
    underlying code structure and patterns — as curated Markdown that gives a
    coding agent the right, always-current context to develop features, follow
    existing patterns, and refactor safely without re-reading the whole repo.
    Use this whenever you map or document how a feature/flow works end to end,
    author or update a DOMAIN/ARCHITECTURE/DATA_FLOW doc or an ADR, record an
    architecture decision, onboard to or trace an unfamiliar area, link a service's
    docs to the services it talks to, or refresh docs after code changed — even if
    the user does not say "trace-my-code" by name. Strongly prefer this over ad-hoc
    doc edits or crawling files blind whenever you need to understand or document how
    the system is built. Triggers on: "trace this flow", "how does X work end to end",
    "map the codebase", "document this module", "write an ADR", "record this decision",
    "the docs are stale", "keep docs in sync", "onboard me to this repo", "link this
    service to its dependencies". NOT for: in-code type/DDD value-object design, or
    prose unrelated to architecture/domain documentation.
license: MIT
metadata:
    author: kgohil
    version: "0.11.0"
    phase: understand
---

# Trace My Code

**What it is:** an agentic loop that keeps a **trace of your system** — the
**domain flow** (what happens, in what order, under which conditions) layered over
the **code structure and patterns** (where it lives, how it's built, why) — as
curated, navigable Markdown. The trace is the context a coding agent reads instead
of re-deriving the system from raw files on every task.

Inspired by [Andrej Karpathy's "LLM Wiki" idea](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
— an LLM-compiled, interlinked **knowledge-graph wiki** kept current by an agent —
applied here to a codebase instead of a research corpus.

**Why it pays off:**

- **Feature development** — an agent plans a change from the trace (flow + files +
  gotchas) in a couple of reads instead of crawling dozens of files and guessing.
- **Pattern adherence** — the trace records established patterns and the _why_ (ADRs),
  so new code follows them instead of inventing a parallel approach.
- **Refactor / restructure** — knowing the real end-to-end flow and its invariants up
  front makes large refactors safe; you change with the contract in view.
- **Always current** — a drift check (git hook or CI) flags or refreshes the trace
  when the code it describes changes, so it never quietly rots into a lie.

**Proven across repos.** Bootstrapped on a ~100k-line Next.js app, the trace measures (via the
bundled `trace-eval`, below) **~22× smaller** per area than the code (~3.7k vs ~81k tokens —
fits in context where the code doesn't) at **98% citation accuracy** across 237 citations. On a
cold-vs-trace A/B — 5 planning tasks across that app **and** [honojs/hono](https://github.com/honojs/hono)
— the trace agent used **−64% input, −33% cost, −59% time** (medians), opened **~⅓ the files**,
for the *same correct plan*; in an opaque domain it also dodged a wrong-pattern rebuild the cold
agent shipped. In the same session an agent built, tested, and shipped a brand-new tool reading
**only** the trace to plan it (_"Phase 0 genuinely replaced crawling… the trace gave me everything"_),
passed 14/14 tests, and the pipeline caught a real bug a blind crawl ships. One-time cost; a crawl
is re-paid every task.

## Start here (onboarding router)

**Invoked without a clear task** — a bare `/trace` or `/trace-my-code`, "set this up", "where do
I start", or a fresh install? **Don't dump the modes and guess.** Follow
`references/onboarding.md`: read the repo's trace state in one pass (does `docs/DOMAIN.md` / any
`ARCHITECTURE.md` exist; the `trace-eval` grade, broken citations, open `_TODO_`s, `--gaps`;
whether the drift loop is wired; the routing rule), then **route**:

- **No trace** → guide first-run setup: bootstrap → **wire the loop** (recommend the CI Action;
  local pre-push fallback) → routing rule → grade.
- **Trace exists** → show the `trace-eval` report, then propose the **single highest-value next
  step** (fix broken citations / confirm `_TODO_`s worst-first / bootstrap the biggest gap / wire
  the loop / add the routing rule / else switch to reuse-first).

State is **derived from the repo each run, never stored** — the trace itself is the state. A
clear task (e.g. "document the auth module", "refresh the docs for X") skips the router and goes
straight to the matching mode below.

## The trace (what gets written)

1. **`docs/DOMAIN.md`** — the map: domains / bounded contexts, the aggregates and
   ubiquitous language, and how contexts connect.
2. **Per-area `ARCHITECTURE.md` / `DATA_FLOW.md`** (next to the code, from
   `templates/architecture-template.md`) — the flow, the **patterns & extension points**
   (the canonical example to copy + where to plug a new one in), the **invariants &
   absences** (limits, defaults, magic numbers, and what is _not_ enforced), the
   **external / out-of-repo** anchors, and the gotchas — with **symbol-anchored**
   citations.
3. **`docs/adrs/*.md`** — the _why_ behind non-trivial decisions.
4. A **routing rule** in the repo's `CLAUDE.md` / `AGENTS.md` telling agents to read
   the trace before touching an area (`references/routing-rule.md`).

Everything is plain Markdown, **stored hierarchically to mirror the codebase** and
**Obsidian-vault compatible** (YAML frontmatter + `[[wikilinks]]`), so `docs/` opens
as a visual, linked map — index -> context -> area -> decision. As the trace grows,
split oversized files behind an index (`references/doc-splitting.md`).

## Multi-repo / microservices

A trace is per-repo, but flows cross service boundaries. Each repo keeps its own trace
rooted at `docs/DOMAIN.md`; when service A calls service B, A's doc carries an **anchor
link to B's root trace doc** — a relative path when the repos sit side by side locally
(e.g. `[[../service-b/docs/DOMAIN.md]]`), or a URL otherwise. Following those anchors
lets an agent walk an **end-to-end cross-service flow** when the repos are checked out
together: no central index, just links between roots. See `references/multi-repo.md`.

## Modes

- **Mode 0 — bootstrap** (`references/bootstrap.md`): on a fresh repo, generate the
  initial trace (DOMAIN.md + per-area ARCHITECTURE.md skeletons + seed ADRs), grounded
  in code with `_TODO: confirm_` on anything unverified. A draft to curate — it kills
  the blank page. Then curate **worst-first**: `trace-eval` ranks the weak docs and names
  each missing criterion; `--gaps` lists significant dirs still to bootstrap.
- **Mode A — author / maintain**: write or update a doc/ADR from the **code + schema**, cite by
  symbol, link related nodes with `[[wikilinks]]`. Capture the _why_ in ADRs. **Harvest what was
  missing** (the `#`-key reflex, applied to architecture docs) — after each task, run this reflection
  and fold every hit into the right section of the area doc:
  - re-derived a pattern the trace should have named? → **Patterns & extension points**
  - hit a gotcha, ordering trap, or stale comment? → **Gotchas**
  - found an invariant, limit, or magic number? → **Invariants & absences** (cite its source)
  - learned a 3rd-party system from an import? → **External / out-of-repo**
  - a citation no longer resolved while you worked? → fix it in place

  This is the trace's _experience-truth_, kept current the way the drift hook keeps its _code-truth_
  current. `trace-eval`'s **what-to-curate** worklist (above) tells you which docs to harvest into first.
- **Mode B — auto-update on drift** (`references/auto-update-contract.md`): **bootstrap
  wires this on by default** (CI workflow if the repo has `.github/`, else a local pre-push
  hook). It finds **code** changes in a traced area and **rewrites** the affected docs —
  grounded, surgical — committing to the **working/PR branch** (PR branch in CI, current
  branch locally), **never directly to `main`**. Degrades to **flag** (warn-only) if no
  Claude credential is available, or set `TRACE_MY_CODE_MODE=flag` to opt out of auto-commits.
- **Mode C — reuse-first development** (`references/reuse-first.md`): before writing any
  new code, consult the trace, then climb the reuse ladder — **YAGNI → reuse → extend →
  stdlib → native → installed dep → one line → (only then) minimum new** — while holding
  the **safety floor** (validation, error handling, security, accessibility, and anything
  explicitly requested are never cut). This is the payoff mode — it's what stops an agent
  reinventing a helper/component/flow the repo already has, or over-building what a native
  feature already does.

## The Iron Law (Mode C)

```
NO NEW CODE WITHOUT A REUSE INVESTIGATION FIRST
```

A coding agent's default is to reach for a blank file. Before creating a new file,
helper, component, hook, or abstraction, you MUST first read the trace and the closest
existing implementation, climb the reuse ladder, and justify _why reuse/extend doesn't
fit_. "I didn't find it in one grep" is not an investigation. The ladder cuts code, never
correctness — the safety floor is non-negotiable. Inspired by the "lazy senior dev" ladder
+ safety floor from [ponytail](https://github.com/DietrichGebert/ponytail) (MIT). See
`references/reuse-first.md` for the gated phases, the ladder, and the red flags that mean STOP.

**On-by-default nudge.** The plugin ships a `UserPromptSubmit` hook
(`hooks/reuse-first-hooks.json` → `hooks/reuse-first-nudge.sh`) that re-states this rule
each turn, so it survives long sessions and compaction (a CLAUDE.md routing rule is read
once and drifts). It's a soft reminder, not a hard gate. It **self-gates** — silent (zero
tokens) in any repo without a trace — and costs ~100 input tokens/turn where a trace
exists. Opt out with `TRACE_MY_CODE_NUDGE=off`.

## Measuring effectiveness (`trace-eval`)

Is the trace earning its keep — and what should you fix next? Run the bundled meter — the
`/ctx-stats` analog — from any repo root (pure bash + git, reads only):

```
bash hooks/trace-eval.sh              # the scoreboard, led by "fix next"
bash hooks/trace-eval.sh --curate     # the full "what to curate" worklist, worst doc first
bash hooks/trace-eval.sh --citations  # broken citations, grouped by doc
bash hooks/trace-eval.sh --gaps       # significant dirs with no ARCHITECTURE.md (bootstrap next)
bash hooks/trace-eval.sh --usage      # size, coverage, use, approx saving (the /trace-stats default)
bash hooks/trace-eval.sh --json       # machine-readable summary (grade + gaps + next fix)
bash hooks/trace-eval.sh --gaps --all # …--all stops any list view truncating at 25
```

Every count comes from the **tracked tree** (`git ls-files`, so `.gitignore` is honoured and build
output can't inflate it), split **tracked vs uncommitted** wherever that changes what a number means.
Token figures are a `chars/4` estimate and are printed as such.

Installed as a plugin? Type **`/trace-stats`** for the four-line scoreboard — how big the codebase
is, how much of it the trace covers, how much your recorded sessions actually read it, and an
approximate saving (the benchmark A/B applied to those sessions, labelled as an estimate). With no
transcripts for the repo it says **`no session data found`** rather than printing zeros. A
`UserPromptSubmit` hook runs `trace-eval --usage` inline, **zero model tokens** (the
`/caveman-stats` pattern). Pass `--gaps` / `--curate` / `--citations` / `--json` for the health views.

It reports:

- **Coverage** — areas with an `ARCHITECTURE.md` vs significant source dirs. `--gaps` lists the
  undocumented ones, most-code-first — the bootstrap worklist.
- **Map size** — trace tokens vs codebase tokens (proof you're reading the map, not the territory).
- **Citation health** — how many `` `path › symbol` `` citations still resolve, split tracked vs
  uncommitted. The grounding metric; the drift hook protects it, `trace-eval` scores it.
- **Freshness** — Mode-B auto-refresh commits + open `_TODO: confirm_` curation debt.
- **Quality grade** — a claude-md-style **A–F** over citation accuracy, currency, conciseness,
  **patterns coverage** (does each area name its reuse-first canonical example — the section that
  stops reinvention), and gotcha coverage. A number, not a vibe.
- **The measured A/B** — the only savings claim: cold-vs-trace is **−64% input / −33% cost /
  −59% time** (medians, 5 tasks / 2 repos — see benchmarks). It is a benchmark median, not a figure
  computed from your repo, and the report says so.
- **Fix next / what to curate** — the weakest docs, worst-first, each tagged with the exact criterion
  it's missing (no Patterns section, broken citation, open `_TODO_`), plus the biggest coverage gap.
  The top three lead the report; `--curate` shows the rest. **Run this before a curation pass**
  and work the list top-down: assess before you edit (the claude-md report-first reflex), so you fix
  what moves the grade instead of polishing what's already fine.

A fresh bootstrap lands around **C** (structure solid, `_TODO_`s open); closing the worklist —
confirming `_TODO_`s, adding the missing Patterns sections, fixing broken citations — is what moves
it toward **A**. Track the grade over time: the single number that says whether the trace is an asset
or rotting into a lie.

## Guardrails (why the trace stays trustworthy)

- **Curated, not extracted.** The agent _writes_ the trace from code; it never trusts an
  auto-generated graph as the source of truth.
- **Grounded, not asserted.** Every claim cites code; unverifiable changes are flagged
  for review, not invented. **Name a 3rd-party system only from its import/SDK/config**
  (e.g. `@posthog/ai`), never from a code comment or a guess — comments rot and mislead.
- **Cite by symbol, not by line.** Use `` `path/to/file.ext › symbolName()` `` — a raw
  `:line` rots on every edit above it. A line number, if given, is a hint (`~:NN`); the
  agent locates by symbol and **confirms it before editing**. The drift hook checks cited
  symbols still exist.
- **Surgical + reversible.** Drift fixes edit only stale sections and land as one
  revertable commit — never a silent whole-file rewrite.
- **Hierarchical + linked.** Files mirror the code tree and link across areas (and across
  repos), so context stays navigable as the system grows.
- **Terse, and only the non-obvious.** The doc is the agent's prompt, so brevity is cost: one
  line per concept; capture flow, gotchas, invariants, and the _why_, and never restate what the
  code already makes plain (claude-md discipline). `trace-eval` grades conciseness + currency,
  so this stays measurable, not aspirational.
- **Don't capture the obvious** (the claude-md avoid-list). Skip the happy path a reader gets straight
  from the code, anything the signatures/types already state, DOMAIN content duplicated into an
  ARCHITECTURE doc, generic best-practice advice, and one-off fixes unlikely to recur. A doc that
  restates the code is worse than none — maintenance cost, zero signal. Keep only flow-under-conditions,
  the reuse seam, invariants/absences, the _why_, and the gotcha.
- **Compress the prose, not the precision** (caveman discipline). Within a kept line, write dense: drop
  articles, filler, hedging, and connective fluff; fragments are fine; short synonyms (`use`, not
  `utilize`) — the doc is the agent's prompt, so every token is context cost. But the precision is
  **read-only**: never compress away an **invariant or absence** (a dropped "NOT enforced" makes the
  agent assume the guard exists), a **branch condition** (`when X → A, else B`), a **magic number and its
  source**, or a security gotcha — and never touch a citation `` `path › symbol` ``, value, version, or
  path. Terseness that loses a condition or an absence is a bug, not brevity.
