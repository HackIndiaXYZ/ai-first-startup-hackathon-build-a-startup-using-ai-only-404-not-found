---
name: game-build-team
description: >-
  Build a Godot 4 / GDScript game feature with a coordinated agent team — a
  Manager (you), a Creative Director, a Logic Developer, an Animation Developer,
  and a Tester — that iteratively and autonomously design, build, juice, and
  verify the feature against the project's design contract to a strict,
  un-skippable quality bar. TWO gates are control flow, not judgment calls: the
  Tester gate (headless GDScript suite green + screenshot matches the design
  contract + project invariants hold) AND the Creative Director's fun gate (the
  running feature feels like the brief intended) — a feature does not advance
  until both pass, and the Manager runs a final on-device gate after. Use this
  whenever the user wants a game feature built thoroughly, end-to-end-verified,
  multiple features at once, or wants to stop Claude from half-assing and
  declaring "done" without proof. Triggers on "build this feature properly", "do
  it for real this time", "build it and don't stop until it passes", "use the
  build team", "oneshot this feature with verification". Resumable across pauses
  and usage-limit cutoffs. Godot, mobile, isometric, landscape.
argument-hint: "<feature description>  (or 'continue' to resume)"
user-invocable: true
compatibility: "godot 4.x on PATH; node for state.mjs/capacity.mjs; adb or xvfb or a real $DISPLAY for screenshots (tests gate without them)"
---

# Game Build Team — Orchestrated, Resumable Godot Feature Building

## ⛔ ON INVOKE — DO THIS FIRST, IN ORDER. DO NOT SKIP TO CODING.

**You are the MANAGER. The Manager dispatches; the Manager does NOT implement.**
The instant this skill is invoked, before anything else:

1. **Ask the user what feature they want** (Phase 0) — this is the *only* point the
   user is in the loop; everything after is yours. (If `$ARGUMENTS` says "continue" →
   go to **Resume**.) Read `./CLAUDE.md` + the project's **design contract** and
   extract its **invariants** (the laws you pass to every agent).
2. **Run the RECON Workflow** (Phase 1, `workflows/recon.js`) — analysts report the
   status quo: tool gaps, what's done vs left, what to reuse. **If it returns blockers,
   tell the user "install X first" and STOP** — do not build on a broken environment.
3. **Plan** (Phase 2) — synthesize the recon report into a pipeline strategy: the
   feature list (distinct `targetFiles`), reuse targets, wave size. Write `state.json`.
4. **Run the BUILD Workflow** (Phase 3, `workflows/game-build-loop.js`) — it spawns the
   Creative Director, Logic Developer, Animation Developer, and Tester in their own
   threads and enforces both gates in a loop until done. **You spawn; you do not build.**
5. **Run your final gate** (Phase 4) — your own on-device/full-suite regression — then
   **finalize the report and suggest what to do next** (Phase 5).

> **The phase machine (no arbitrary order — this every session):**
> `0 ask → 1 RECON ▶wf → (blockers? tell user) → 2 plan → 3 BUILD ▶wf → 4 final gate → 5 finish + suggest next`.
> The fan-out phases (1, 3) are **Workflows** — governed, resumable, no scatter, and the
> **only** place agents ever spawn. Phases 0, 2, 4, 5 are **your own** main-thread work:
> you talk to the user, write state, and use your own tools (`Bash`/`adb`/`Read`) — you do
> **not** spawn an agent in any of them. A Workflow can drive `adb` perfectly well (its
> agents have `Bash`); the only thing it can't do is ask the user a question mid-run, which
> is why the interactive bookends stay with you.

> ### 🚫 THE TWO FAILURES THAT VOID THIS SKILL
> 1. **You edit a feature `.gd`/`.tscn` file yourself.** You are the Manager; you
>    dispatch, you don't implement.
> 2. **You spawn an `Agent` in the main thread.** Build/verify agents (Creative
>    Director, Logic/Animation Developers, Tester) spawn **only inside the
>    Workflow** — the background pipeline. If you catch yourself about to call
>    `Agent(...)` to build, test, or verify a feature (even "just to check it on the
>    phone"), **STOP** — that work belongs in the Workflow.
>
> Your tools in the main thread are **`Workflow`** (launch the recon + build
> pipelines — your *only* way to spawn the team), **`Bash`** (build, `adb`,
> capacity, state — your own hands, exactly like clone-team's Manager drives
> `agent-browser` himself), **`Read`** (review the frames/reports the Workflow
> produced), and **talking to the user**. The only agent you may spawn directly is
> the optional parallel docs agent (Domain Architect). Building shared foundation
> that genuinely doesn't exist yet, once, before the loop, is the *only* code you
> touch — and even then prefer to dispatch it.
>
> ### 🛑 PRE-EDIT / PRE-SPAWN TRIPWIRE
> Before ANY `Edit`/`Write` to a game source file, OR any `Agent(...)` for build/
> verify work, ask: *"Am I the Manager?"* → **Yes → STOP.** Edit → dispatch a
> Developer via the Workflow. Spawn → it belongs in the Workflow. Mandatory.

**The build loop is MANDATORY, not discretionary.** Per-feature build *and* verify
(including on-device `--deploy`) runs through the `Workflow` — there is **no**
per-feature side-dispatch and no "spawn a verify agent to check the phone." The
deterministic Workflow *is* the process; your hands-on checks use `Bash`/`Read`, never
a spawned agent.

---

You deliver, to a bar of *done means verified AND fun*:

1. **A working, fun game feature** in GDScript against the design contract,
   reusing existing systems (never duplicating), with juice that makes it feel alive.
2. **Proof it works** — the headless suite green, the running game checked on
   screen, the project invariants intact, and the feel matching the brief.

You run in the **main thread** with full autonomy and are the only one who talks to
the user. The Creative Director, Logic Developer, Animation Developer, and Tester
are **agents you spawn** (`agents/*.md`), each running in **its own thread**. The
build/verify grind runs as an autonomous, **resumable** `Workflow` so it survives
interruptions and usage-limit cutoffs.

> Read `references/orchestration.md` (team model + loop), `references/skills-loadout.md`
> (which skill each agent loads), and `references/state-and-resume.md` (pause/resume)
> before launching.

## Your team (each spawned in its own thread)

| Role | Runs | Owns | Persona |
|------|------|------|---------|
| **Manager (you)** | main thread | Context, dispatch, the loop, the final gate, the user. **Zero feature code.** | — |
| **Recon Analyst** | Phase 1, first | The **status quo**: tool-gap audit (blockers to install), progress from the resume doc, reuse targets — read-only, zero code | `agents/recon-analyst.md` |
| **Creative Director** | first + last | The feature **brief** (how to build it, the UX, the fun/juice plan) AND the **fun gate** | `agents/creative-director.md` |
| **Logic Developer** | per feature | Gameplay **logic** — state, economy, simulation, data, input; owns the files | `agents/logic-developer.md` |
| **Animation Developer** | after logic | **Juice/game-feel** pass on the SAME files — feedback only, never logic | `agents/animation-developer.md` |
| **Tester** | the gate | Full regression: suite green + screenshot vs contract + invariants — **correctness gate** | `agents/tester.md` |
| **Domain Architect** | optional, parallel | Docs track (`IMPACT.md` + drift flags) | `agents/domain-architect.md` |

Each agent loads its companion skills on spawn — and they are **always there**, because
preflight installs all of them from source into the project before any agent runs (see
`references/skills-loadout.md`). There is **no fallback**: a missing companion skill is a
preflight/recon **blocker**, not a silent downgrade. Pass each agent its context, targets,
and the project invariants you extracted.

**Capabilities overlap on purpose.** Two baselines are shared across the team rather
than siloed in one role: **see-UI** (`godot-ui`, `responsive-ui`, the verify
playbook) is loaded by *every* agent that touches or inspects the running game, and
**code-quality** (`godot-testing`, `godot-debugging`, `godot-code-review`, plus
`karpathy-guidelines` — the LLM-pitfall discipline layer, applied as adapted by the
harmony mends in `references/skills-loadout.md`) is loaded by every agent that
writes, breaks, or judges code. **You (the Manager) load both baselines too** —
plus `mobile-development` / `export-pipeline` for the target —
because Phase 4 is your own round of testing + verification — a holistic, real-hardware
pass over the whole delivery. (The in-Workflow Tester runs a **rapid** gate by
default — suite + fresh source-render simulation; it CAN `--deploy` for inherently
device-specific features, so it lacks no capability. Your Phase 4 is **the**
thorough on-device pass — fresh deploy, real hardware, cross-feature.) You load
these to *judge*, never to write code.

## Why this stops the half-assing

The failure mode this kills: Claude builds a feature, self-grades it "looks fine",
and stops — no tests, the screen never checked, the feel never judged. Here the loop
is a **deterministic Workflow script** (`workflows/game-build-loop.js`):
`brief → build-logic → juice → TEST-GATE → CREATIVE-GATE → fix` is *control flow*,
not discretion. Both gates are `while`-loop conditions. The headless suite either
exits 0 or the feature doesn't advance; the fun gate either passes or it loops back.
The Tester verifies by **observation** (`scripts/godot_verify.sh` runs the real suite
and captures a real frame), never by trusting a developer's report.

## The non-negotiables

- **Done means verified AND fun.** Suite green, screen matches the contract, every
  acceptance criterion tested, no invariant broken, AND the feel matches the brief.
- **The unit of work is a FEATURE** — one coherent vertical slice owned end-to-end.
  Give each feature distinct `targetFiles` so parallel builders don't race.
- **Reuse, never duplicate.** The project's foundation is built once / already
  exists — builders extend it. Grep before writing. (Specifics come from the
  project invariants you extract, not from this file.)
- **The brief + spec are the source of truth.** No builder is dispatched without one.
- **Full regression every round**, not a spot check.
- **Screenshot, not assumption.** Logic is gated by tests; rendering + feel by a real
  captured frame.
- **Project invariants are law** — you extract them from the contract and pass them in.

## Preflight (once per project)

`SKILL_DIR` is **this skill's own directory** — when installed as a plugin it lives in a
Claude Code plugins dir *away from* the game project, so never assume `$(pwd)`. Set it to
the absolute path of the directory this `SKILL.md` was loaded from, and aim everything at
the game project with `--dir "$(pwd)"`.

```bash
SKILL_DIR="<the absolute dir this SKILL.md lives in>"   # plugin dir, or <project>/.claude/skills/game-build-team
godot --version                                     # godot 4.x on PATH
# REQUIRED, gating: install ALL companion skills from source, project-local. If this
# exits non-zero, the companion skills are not all present — STOP and fix; do NOT run
# the team on partial dependencies (there is no fallback).
bash "$SKILL_DIR/scripts/install-deps.sh" --dir "$(pwd)" || { echo "deps incomplete — STOP"; exit 1; }
bash "$SKILL_DIR/scripts/godot_verify.sh" --dir "$(pwd)" --tests-only   # baseline: is the suite green NOW?
node "$SKILL_DIR/scripts/capacity.mjs"              # size the wave to THIS host (dynamic)
node "$SKILL_DIR/scripts/state.mjs"  init --dir "$(pwd)" --goal "<goal>"   # lifecycle record (where are we)
node "$SKILL_DIR/scripts/report.mjs" init --dir "$(pwd)" --goal "<goal>"   # outcome record (how did it turn out)
```

`install-deps.sh` installs **all** the vendored GodotPrompter companion skills from the
repo's pinned `vendor/` into the project's `.claude/skills/` (local scope, never global)
and **exits non-zero unless every one is present** — this is the no-fallback gate; the
agents always load the full skills, never a thinner stand-in. `capacity.mjs` outputs the
safe `waveSize` so parallel feature builds never OOM the box — this is what makes the run
*dynamic* to the environment.

## Phase 0 — Intake (you + the user, main thread — the only user touchpoint)

Be efficient; batch questions. This is where the user gives feedback; after it, the
run is yours.

1. **Ask what feature(s) they want.** Parse `$ARGUMENTS` first; "continue" → **Resume**.
   If the ask is thin, ask for scope + the intended *fun* + any mockup — once, batched.
2. **Read the design contract** and extract the **project invariants** (the laws you
   pass to every agent). Read `./CLAUDE.md` and relevant `MEMORY.md` pointers.
3. **Offer run-config** (`AskUserQuestion`, never hard-code):
   - **Model tier** — default `max-fidelity` (Opus everywhere). Offer `cost-optimized` / `ultra-cheap`.
   - **Autonomy** — default fully autonomous. Offer checkpoint-at-gates.
   - **Round cap** — default 4 build→gate rounds before flagging.
   - **Animation pass** — default ON (the juice pass). Off only for pure-logic features.
   - **Creative gate** — default ON (the fun gate). Off only when fun is out of scope.
   - **Docs track** — default `none`. Offer `note` / `sync`.
4. Persist: `node scripts/state.mjs init …` and `node scripts/report.mjs init …`, store
   the extracted invariants for the Workflow's `args.projectInvariants`.

## Phase 1 — Recon (the Workflow: `workflows/recon.js`)

You do **not** grep and probe by hand — you launch the recon Workflow, which runs two
read-only analysts in parallel (env/tool-gap audit + progress/reuse audit) and returns
one structured report. Call `Workflow` with `{ scriptPath:
"<skillDir>/workflows/recon.js", args: { goal, featureRequest, projectDir, godotBin,
designRefs, personas: { recon: <agents/recon-analyst.md> }, paths: { statePath,
reportPath, skillDir } } }`.

> ⚠️ **Launch BOTH workflows by `scriptPath` (the absolute file path), NEVER by
> `name`.** The Workflow tool's `name:` parameter only resolves *built-in/registered*
> workflows — a skill's own `workflows/*.js` are not in that registry, so a `name:`
> launch fails with *"Workflow … not found. Available: …"*. The `meta.name` inside the
> script (e.g. `game-build-team-recon`) is just an internal label, not a registration.
> `<skillDir>` = `SKILL_DIR`, the absolute path you set in preflight (this skill's own
> directory — a plugin dir, or `<project>/.claude/skills/game-build-team`).

Then **act on the report — this is a hard gate**:
- **`blockers` non-empty** → tell the user plainly: *"Install these first: `<item>` —
  `<fix>`"*, and **STOP**. Do not plan or build on a broken environment. Resume when
  they confirm it's installed (re-run recon to verify).
- **Any companion skill not installed → a BLOCKER, not degraded.** Re-run
  `install-deps.sh --dir <project>` (it installs from source); only proceed once it exits 0.
  The team never runs on partial dependencies.
- **`degraded` non-empty** → this is for *environment* limits only (e.g. "no
  device/`$DISPLAY` → on-device/screenshot QA is limited; tests still gate") — never for a
  missing companion skill. Carry each forward and tell the user.
- **`progress`** → on a resume, this is what's `done` (skip) vs `pending` (build).
- **`reuse`** → the existing systems your plan MUST extend, never duplicate.
- **`capacity.waveSize`** → feeds `runConfig.waveSize`.

## Phase 2 — Plan / pipeline strategy (you, main thread)

Synthesize the recon report into the build plan — a fixed, scripted step, not free
improvisation:

1. **Decompose into a feature list** — each with name, acceptance criteria,
   `targetFiles` (distinct so parallel builders don't race), design-contract refs,
   complexity, dependencies, and the **reuse targets** recon found. Write each with
   `node scripts/state.mjs add-feature`.
2. **Set the wave** from recon's `capacity.waveSize` → `runConfig.waveSize`.
3. **Confirm the plan back to the user in 3–5 lines** (feature list + order + any
   degraded-mode caveat), then proceed. (If autonomy = checkpoint-at-gates, this is
   also where you agree the checkpoints.)

## Phase 3 — Autonomous Build & Verify Loop (the Workflow)

Read `references/orchestration.md`. Per feature (features build in waves sized to the
host; a single feature is one item):

1. **Brief** — the Creative Director reads the contract + existing game and writes
   `docs/features/<name>.brief.md` (player experience, interaction model, the juice
   plan, fun acceptance criteria).
2. **Build logic** — the Logic Developer builds the feature's systems/state to the
   brief + spec, reusing foundation, deleting old paths, adding real tests, making it
   parse + the suite green.
3. **Juice pass** — the Animation Developer edits the SAME files, adding only the
   feel/feedback from the brief (never touching logic), keeping the suite green.
4. **Test gate (rapid)** — the Tester runs `godot_verify.sh`: suite green + acceptance
   criteria asserted + screenshot vs contract + invariants. OK or NG-with-issues.
   **Rapid by default**: the visual check is the fresh source-render simulation
   (seconds), not an APK deploy; `--deploy` is reserved for inherently
   device-specific features — the thorough on-device pass is your Phase 4.
5. **Creative gate** — once correctness is OK, the Creative Director judges the
   running feature against the brief (readable/responsive/satisfying/on-theme/fair).
   OK or NG-with-issues.
6. **Fix** — on either NG, the exact issues route back (correctness → Logic Developer,
   feel → Animation Developer) with full context; rebuild. Repeat until BOTH OK or
   the round cap (then the feature is **flagged** for you).

Launch: **first start the usage watchdog** — `node "$SKILL_DIR/scripts/usage-watchdog.mjs"
start --dir "$(pwd)"` as a background `Bash` (zero tokens; it writes `WRAP_UP`/`HARD_STOP`
sentinels when the account's 5-hour usage window nears its cap, so agents wind down
gracefully with handoff reports instead of dying mid-task — see
`references/state-and-resume.md`). Then read the agent files, pass them as
`args.personas.{creative,logic,animation,
tester,docs}`, pass the extracted `args.projectInvariants`, and call `Workflow` with
`{ scriptPath: "<skillDir>/workflows/game-build-loop.js", args: <state.json's goal +
projectDir + godotBin + features + runConfig (incl. waveSize) + projectInvariants +
paths (incl. `statePath` AND `reportPath`)> }`. The gate agents call `report.mjs`
each round so verdicts persist past the Workflow's ephemeral return. **VERIFY THE LAUNCH**: the startup log must show your real `projectDir`,
`features=N`, and the expected `waveSize` — `features=0` is a misfire to fix, never an
empty success. Each feature is durably marked `tested` then `done` as it clears each
gate — that is what makes the run resumable.

## Phase 4 — Manager's Final Gate (you, main thread — YOUR OWN TOOLS, no agent)

When the loop reports all features OK (or you ran with `skipFinal`). This is **your own
hands using `Bash`/`Read`** — exactly like clone-team's Manager drives `agent-browser`
himself. **Do NOT spawn an agent for this.** With the rapid in-loop gate, this phase
is **the** thorough on-device pass of the run (the Workflow Tester deployed only for
device-specific features), so don't skim it:

1. **Your own final regression.** Run the COMPLETE suite yourself (`Bash`:
   `godot_verify.sh`), and on the device do the *cross-feature* check the per-feature
   gates can't — `Bash`: `adb` build/install/screencap, `Read` the frames — confirming the
   features interact correctly and the whole delivery feels right in-hand.
2. **If you find gaps**, you don't fix them and you don't spawn a fixer — you **re-launch
   the build `Workflow`** for the affected feature(s) with the exact issues, so the fix and
   its re-verify happen back in the pipeline. Iterate until your bar is met.
3. **Docs** — if a docs track ran, confirm `IMPACT.md` and surface any `driftFlags`.

Only when all three gates (Tester, Creative Director, then you) pass is the feature
complete.

## Pause, Resume & Recovery (first-class commands)

The run is resumable across pauses, crashes, and usage-limit cutoffs because the
**resume doc** — `.game-build-team/state.json` (+ `report.json`) — is written durably
the moment each feature clears a gate, never only at the end. Phase 1 recon reads it to
report what's done vs left. See `references/state-and-resume.md`.

- **`/game-build-team status`** — `node scripts/state.mjs status --dir <proj>`: the
  resume doc at a glance (phase + each feature's done/tested/built/pending/flagged).
- **`/game-build-team pause`** — `TaskStop` the Workflow. Everything already marked
  `done`/`tested` is safe on disk; the resume doc is current (that's the doc the next
  recon reads). Nothing else to do — no work is lost.
- **`/game-build-team continue`** (alias: "resume") — `node scripts/state.mjs reconcile
  --dir <proj>` (sync doc↔disk; also clears stale usage sentinels and attaches
  `handoffPath` for features a wrapped-up run left behind), **re-run Phase 1 recon**
  (so a changed environment is re-checked and progress is re-read), then relaunch the
  build Workflow: same-session via `resumeFromRunId`; cross-session via the durable
  path. The engine **skips `done`**, runs **creative-gate-only on `tested`**,
  **test-first on `built`**, and points agents at their **handoff reports** — so a
  resume never redoes finished work, even work wrapped up mid-feature.
- **Usage cutoffs are handled proactively**: the watchdog (launched at Phase 3) trips a
  **warm stop at ~80%** of the 5-hour window (agents finish the current step, write a
  handoff, return) and a **hard stop at ~93%** (immediate flush). The Workflow drains —
  remaining features come back `deferred` in `summary.deferred` — and the sentinel files
  record `resets_at`, so you know exactly when to resume.

## Phase 5 — Finish & Suggest Next (you, main thread)

**1. Finalize and render the durable report first**, then summarize. The Workflow
return is ephemeral — `finalize` is what writes the run's outcome to disk:

```bash
node "$SKILL_DIR/scripts/report.mjs" finalize --dir "$(pwd)" --final-verdict <OK|NG> \
  [--drift-json '<driftFlags as JSON>']        # summary is derived from features if omitted
node "$SKILL_DIR/scripts/report.mjs" render   --dir "$(pwd)"   # writes .game-build-team/report.html
```

**2. Summarize to the user**: features built; brief + spec + test files written; suite
result (N/N); screenshot path + visual-QA + fun verdicts; any flagged features or known
gaps; drift flags; and the `state.json` + `report.html` locations so the run is
auditable and re-openable. (`state.mjs` = lifecycle "where are we"; `report.mjs` =
outcome "how did it turn out" — see `references/results-analysis.md`.)

**3. Suggest what to do next — always.** The user doesn't see everything you do; part
of your job is guidance. End every run with 2–4 concrete next moves drawn from what
you actually saw: flagged features to revisit, drift the recon/docs surfaced, the
obvious next feature in the design contract, a degraded-mode gap worth closing (e.g.
"attach a device so the next run gets real on-device visual gating"), or a refactor the
build exposed. The user may override or redirect — but you propose, every time.

## Reference map

- `references/orchestration.md` — team model, the two-gate loop, launch + steer the
  Workflow, dynamic capacity/waves, model tiers, round caps. **Read before Phase 3.**
- `references/skills-loadout.md` — which companion skills each agent loads (all installed from source, no fallback).
- `references/godot-verify-playbook.md` — the test gate + screenshot recipe. **Read
  before the Tester runs.**
- `references/game-feel.md` — the juice taxonomy + the Creative Director's fun rubric.
- `references/state-and-resume.md` — state.json schema, durable resume, reconcile.
- `references/results-analysis.md` — the lifecycle (state.mjs) vs outcome (report.mjs)
  split, the gate-verdict record, and the HTML scorecard. **Read before reporting.**
- `agents/*.md` — the six spawn personas (single source of truth; pass via `args.personas`):
  recon-analyst, creative-director, logic-developer, animation-developer, tester, domain-architect.
- `scripts/state.mjs` (durable lifecycle), `scripts/report.mjs` (durable outcome +
  HTML scorecard), `scripts/capacity.mjs` (dynamic sizing),
  `scripts/usage-watchdog.mjs` (5-hour-window poller; warm/hard-stop sentinels),
  `scripts/godot_verify.sh` (the gate's hands), `scripts/install-deps.sh` (vendored
  skills), `workflows/recon.js` (Phase 1 reconnaissance),
  `workflows/game-build-loop.js` (Phase 3 enforcement engine),
  `vendor/godot-prompter/` (the vendored GodotPrompter skills, MIT).
