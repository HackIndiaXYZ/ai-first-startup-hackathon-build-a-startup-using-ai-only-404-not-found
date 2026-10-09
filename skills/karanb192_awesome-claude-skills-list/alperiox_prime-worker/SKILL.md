---
name: prime-worker
description: Use when delegating multi-turn work to a cheap local prime-agent subagent that must remember context across turns — iterating on a refactor, working through a subsystem, branching a what-if from an established investigation. Triggers when a delegated task needs more than one exchange, or when an earlier delegation should be continued rather than restarted. For one-shot descriptive reading that needs no follow-up, use delegate-bulk-read instead.
---

# Prime Worker

## Overview

`prime-agent` is installed locally and runs models from the user's **OpenCode Go subscription**. Because that is a subscription, per-token price is *not* the thing to optimize — the real axes are context window, latency, and how much the model can be trusted with the task.

**A worker is a named directory.** `~/.claude/prime-workers/<name>/` holds exactly one session `.jsonl` plus a `worker.env` recording the `--cwd` and `--model` it was spawned with. The name is the only handle you ever need.

Drive it with `scripts/pw`. Do not hand-roll `prime-agent` invocations — the raw CLI has a trap that silently breaks continuity (see Failure Modes).

## Choosing the Model: Ask First

**Ask the user which model to use before spawning a worker.** Default to `deepseek-v4-flash`, but present the choice — the user tracks which models are performing well and that changes faster than this file does.

Ask **once per worker, at spawn**. `pw say` reuses the recorded model silently; do not re-ask every turn.

Use `AskUserQuestion` with `deepseek-v4-flash` first and marked `(Recommended)`. Sensible option set:

| model | ctx / max-out | fits |
|---|---|---|
| **`deepseek-v4-flash`** *(default)* | 1M / 384K | Default for everything. Much the biggest output budget, and the only one that will hold a long refactor's worth of edits in one turn. |
| `gpt-5.6-luna` | 1.05M / 128K | Strongest reasoning of the three; accepts images. Reach for it when flash returns sloppy edits. |
| `minimax-m3` | 1M / 131K | Accepts images, middle of the range. |

**`pw models` is a floor, not the list.** It shows only what is compiled into `prime-agent`'s catalog — 3 models for opencode-go on 0.9.7, down from 23 on 0.8.0. The provider still accepts the uncatalogued ids: `mimo-v2.5`, `hy3`, `kimi-k3` and `deepseek-v4.1-flash` were each verified working on 0.9.7 while absent from `pw models`. So if the user names a model the list does not show, **try it rather than refusing** — an upgrade that drops catalog entries does not take the models away.

The cost of going off-catalog is metadata: an uncatalogued model has no recorded context window, max-output or price, so nothing warns you before a long session overflows it. Prefer a catalogued model when the session will run long, and use `pw list` to watch the token count when you don't.

Override the default permanently with `PW_DEFAULT_MODEL` in the environment.

## The Verbs

```bash
pw spawn <name> --cwd <dir> --model <m> "<task>"   # create; records cwd + model
pw say <name> "<follow-up>"                        # resume, context intact, no flags needed
pw fork <src> <dst> "<what-if>"                    # branch without disturbing the trunk
pw list                                            # name, model, turns, tokens, size, cwd
pw history <name> [n]                              # last n exchanges, tool noise stripped
pw refine <name>                                   # learn from the session - see Refinement
pw retire <name> --yes                             # delete the worker
```

**Finishing a worker is a two-question checkpoint, not just `retire`.** When its task is done:

1. Ask the user whether to run `pw refine <name>`. The worker can convert this session's friction into notes future runs read automatically.
2. If that produced anything, show it with `pw learned <name>` and ask whether to promote it with `--global`.
3. Then `pw retire <name> --yes`.

Retiring without asking throws away everything the worker learned, and neither question is yours to answer alone. Ask them even when the task went smoothly — a clean run still teaches the environment's quirks.

Add `--gate "<cmd>"` to run autonomously — see below.

Prompts come from trailing arguments or **stdin**, so a long task brief goes in as a heredoc rather than a quoting nightmare:

```bash
pw spawn auth-refactor --cwd ~/proj/src/auth --model deepseek-v4-flash <<'EOF'
<multi-paragraph brief, freely containing quotes and $ and backticks>
EOF
```

Add `--json` for NDJSON progress events instead of silence until completion. **Reach for it whenever a run feels stuck** — text mode is silent until the end, so a slow run and a hung one are indistinguishable without it. Background long runs and do other work.

`pw history` is what makes a worker survive *your* context being compacted — the worker's memory outlives yours, and `pw list` plus `pw history` reconstructs what it knows.

## Autonomous Mode

Hand the worker a task plus a shell command that defines "done", and it loops — feeding each failure back to itself — until every gate exits 0 or a limit trips.

```bash
pw spawn fixer --cwd ~/proj --model deepseek-v4-flash \
  --gate "python3 -m pytest -q" --gate "ruff check ." --max-turns 12 <<'EOF'
Fix the failing tests in tests/test_parser.py.
Do not modify any file under tests/.
EOF
```

`--gate` implies `--auto` and is repeatable. Gates are **shell commands evaluated in the worker's `--cwd`**, so pipes and `;` work. They persist in the worker directory: a later `pw say <name> --auto "<more work>"` reuses them, while passing `--gate` again replaces them.

Limits default to 12 turns / 3 continuations / 80K tokens / 30 min; override with `--max-turns` and `--max-continuations`.

**Run the gate yourself before delegating.** A gate that can never pass costs a full round of retries before it gives up, and a typo'd path or missing dependency is enough to trigger it. On current `prime-agent` the run ends cleanly — the gate retries, the continuation limit trips, and it exits non-zero with `autonomous limit reached: maxContinuations reached`. On builds a few months old it could instead stall indefinitely without ever writing a session file, so `pw` still imposes its own wall clock: autonomous runs default to 900s, `--timeout <secs>` overrides, and a kill exits **124**.

**A gate proves a command exits 0. It does not prove the work is correct.** The worker can read its own gate and reason about what would satisfy it — the classic failure is making tests pass by editing the tests. Gates are a ratchet against *premature stopping*, not an adversarial check. So:

- Name the off-limits paths in the prompt itself: *"do not modify any file under `tests/`"*.
- Read `git diff` afterward. A green gate does not retire that step.
- Prefer at least one gate the worker cannot rewrite in its own favour — a build, a type check, a lint — alongside the test run.

Use `--auto` with no gate only deliberately; it then stops on turn and token limits alone, which is weaker than a plain one-shot with a clear brief. `pw` warns when you do.

## Refinement: Letting the Worker Learn

`prime-agent` can inspect its own session trajectory and write durable harness entries — environment facts, tooling quirks, kernel APIs — that future runs read automatically. This is how delegation gets cheaper over time instead of rediscovering the same friction every run.

```bash
pw refine <name>                          # local scope - safe, run this freely
pw learned <name>                         # inspect what it wrote
pw learned --global                       # inspect the shared harness
pw refine <name> --global "<steering>"    # promote - ASK THE USER FIRST
pw refine <name> rollback <id> --global   # undo
```

**Run `pw refine <name>` before retiring a worker that hit real friction.** It is local by default, writing to `<PW_HOME>/session-artifacts/<session-id>/harness/`, and cannot affect anything outside that worker.

**Never run `--global` on your own initiative.** Global entries land in `~/.prime/agent/harness/` and are read by *every* prime-agent session, including the user's own interactive ones. To propose one:

1. `pw refine <name>` locally, then `pw learned <name>` to see what it found.
2. Show the user the actual entries and ask whether to promote.
3. On approval, `pw refine <name> --global "<steering>"`.

Promote **only durable, reusable facts** — a tool that isn't on PATH, a kernel API signature, a path convention. Never task-specific memories ("fixed the bug in the parser"); they pollute the shared harness for every future session.

**A useful tell, not a rule:** if an entry names a repository, a path, or a line number, it is probably not durable. Observed on a real promotion — four of five candidates named a repo or carried line numbers (two read-coverage maps, a findings list that itself warned "re-verify line numbers if the repo has moved"); the one naming no repository at all was the one worth keeping. Treat it as a prompt to look harder rather than a filter to apply silently: *"prime-agent's only tool is `ipython`"* names a tool and is perfectly durable. Make the call with the user, not for them.

Steering text works and is worth passing. This measurably suppressed a one-off memory while keeping two durable ones:

```
Record only durable, reusable environment facts about running this kernel.
Skip anything specific to this task or repo.
```

Rollback removes the entries but the refinement log is append-only, so promotions stay auditable. `pw learned --global` shows the log.

Refinement reads the entire trajectory, so its cost scales with session size and a multi-MB `.jsonl` can run for minutes. `pw refine` has a 600s watchdog (`PW_REFINE_TIMEOUT`); check `pw list` for the session size and raise it rather than assuming a hang.

**Local learning does not accumulate across workers** — each new worker starts with an empty local harness. Only `--global` compounds, which is exactly why it needs consent.

## Scoping

`--cwd` is **the only sandbox boundary that exists**, and `prime-agent`'s sole tool is `ipython` — it reads and edits files by executing Python. Delegating therefore grants arbitrary code execution inside `--cwd`, and file contents leave the machine to a third-party provider.

- Scope `--cwd` to the narrowest directory the task needs, never the repo root by reflex.
- For a broad or risky change, spawn against a `git worktree` instead, and review the branch diff before it lands. This is a judgment call, not a mandate.
- Only delegate into a directory whose state you can recover — committed, or disposable.

## Verification

**For any review or analysis delegation, pass `--cite` at spawn.** This is the default, not a technique to reach for — opt out only when the output is orientation you will not act on.

```bash
pw spawn review-auth --cwd ~/proj/src/auth --model deepseek-v4-flash --cite "<task>"
```

`--cite` injects a contract requiring every claim to carry a `path:line` citation, an explicit `UNVERIFIED` marker where it cannot, and a closing `## Not read` section exposing coverage gaps. `pw` records it in `worker.env`, so follow-up turns keep it; `--no-cite` turns it off.

This is what converts a cheap model's output from prose you must trust into claims you can check in seconds — which is the entire economic case for delegating the work. In real use it let a cheap model overturn a claim three Opus reviews had accepted, because the finding cited both the wrong claim and the contradicting source. Uncited, the same finding reads as a guess from a weak model and gets deprioritised.

It costs latency: the contract forces real file reads instead of inference. That is the point, not a bug to optimise away.

**Citations drift by a few lines.** Measured: a symbol on line 3 cited as `:2`, a function spanning `:6-11` cited as `:4-8`. They are imprecise, never fabricated — so treat one as a pointer to the right neighbourhood, and read around it rather than trusting the exact number.

For **edits**, `git diff` is the check, and it is not optional. A cheap model running arbitrary Python wrote those changes; read the diff before building on it.

Verify anything you are about to **act** on. Pure orientation ("this is a token refresh path") can pass unchecked.

## Failure Modes

| Symptom | Cause and fix |
|---|---|
| `registered to a failed worker that could not be safely reclaimed` | A prime-agent process was killed mid-turn. Run `pw unwedge` (`prime-agent shutdown --force`). **`prime-agent doctor` does not fix this** — it only prints status. Note `unwedge` stops *all* prime-agent services, including interactive ones. |
| A flag in `--help` does nothing, or a working command is missing from it | `prime-agent --help` is incomplete and partly stale. `model list` works but is undocumented; `--list-models` was removed. Trust the binary over its help text. |
| Resumes get slower and slower | Every turn re-reads the whole `.jsonl`. Check `pw list` for size — sessions reach tens of MB. Retire finished workers; fork rather than growing one worker forever. |
| A run sits silent for minutes | Text mode prints nothing until the run ends, so slow and hung look identical. Re-run with `--json`: a healthy run emits `session` and `agent_start` within a second or two, and `pw history <name>` shows whether the work actually completed. Every run is bounded by `PW_TIMEOUT` (default 900s, exit 124). |
| Autonomous run exits non-zero with `maxContinuations reached` | Its gate never passed. Read the gate output in the run log, then fix the gate or the brief — the limit did its job. On older builds the same situation could hang instead, which is what `--timeout` (default 900s, exit 124) backstops. |
| `Local harness refinement requires a persisted session` | The session was started with `--no-session`. `pw` always persists, so this only appears if you called `prime-agent` by hand. |
| `pw list` shows nothing but work was delegated | One-shot `prime-agent -p` runs are not workers. Also note `prime-agent list` is a *different* registry that only sees interactive TUI agents and will never show `pw` workers. |

## Red Flags

- Spawning without asking which model — the default is a default, not a decision already made
- Re-asking the model question on every `pw say` instead of once at spawn
- Building on delegated edits without reading `git diff`
- Pointing `--cwd` at a repo root when one subdirectory would do
- Using this for a single-exchange descriptive read — that is `delegate-bulk-read`
- Reaching for `kimi-k3` on a task you could just do here
- Treating a green gate as proof of correctness, or gating on tests the worker is free to edit
- Passing a gate you have never run yourself — an unsatisfiable gate burns every retry before failing
- Running `pw refine --global` without showing the user the entries and asking
- Promoting a task-specific memory to global scope because the refinement offered it
