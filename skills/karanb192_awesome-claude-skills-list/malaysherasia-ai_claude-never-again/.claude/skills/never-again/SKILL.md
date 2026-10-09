---
name: never-again
description: Capture a bug or mistake as a permanent guardrail so it cannot happen twice. Use this skill whenever a bug is fixed, a test fails and is repaired, the user says "you did that again", "don't do that", "remember this", "never do X", or any correction is made that a future session would otherwise forget. Also use when the user asks to review, promote, or clean up existing lessons and hooks.
---

# Never Again

Turn a mistake into something that cannot happen again.

Most memory tools write a note and hope it gets read. A note costs tokens on
every single turn and can still be drifted past in a long session. This skill
asks a different question first:

> **Can this be enforced instead of remembered?**

If yes, it becomes a hook — a script that runs automatically and blocks the
wrong path. Enforced rules cost nothing per turn beyond their one line.
If no, it becomes one short line in `LESSONS.md`.

## The rule that governs this skill

**This skill must not cost more than it saves.** Every line added to
`LESSONS.md` is paid for on every future turn. Be ruthless. If you would not
pay 30 tokens per turn forever to prevent this bug, do not file it.

## Workflow

### 1. Establish the lesson

You need three things. Get them from the conversation first; ask only for what
is genuinely missing.

- **Symptom** — what was observed going wrong
- **Cause** — the actual root cause, not the surface
- **Rule** — the instruction that prevents it, written as an imperative

If the cause is still unknown, stop. A lesson without a cause becomes a
superstition, and superstitions never expire.

**Spend tokens here, not per turn.** A lesson is filed once and read on
every turn forever, so the moment of filing is the cheap place to be
thorough and the rule line is the expensive place to be vague. Before you
write anything down: read the code path that failed, not just the diff
that fixed it; name the input that made it fail; ask whether the first
cause you found is the cause or the place the cause showed up. Then write
the rule at the altitude that covers the next case, not this one. A
thorough capture costs a few thousand tokens once. A shallow one costs a
repeat.

### 2. Triage: enforceable or not?

Work down this ladder and stop at the first rung that fits.

| Rung | Use when | Result |
|---|---|---|
| **1. Existing gate** | A linter rule, tsconfig flag, test, or git hook already covers this | Turn it on. File nothing. |
| **2. Hook** | The mistake is detectable by a script at a known moment | Write a hook (§3) |
| **3. Rule line** | It needs judgement a script cannot make | One line in `LESSONS.md` (§4) |
| **4. Nothing** | One-off, environment-specific, or already impossible | Say so and move on |

Rung 4 is a real answer. Use it.

**A mistake is hook-shaped if you can describe the check in one sentence
beginning with "before" or "after".** "Before committing, fail if the page does
not boot." That is a hook. "Prefer clear names" is not.

### 3. If it is a hook

Hooks live in `.claude/hooks/na/` and are registered in `.claude/settings.json`
(and in the hook file of any other agent the installer was told about; the
hooks themselves are the same).
Commit-time hooks also run from git's own pre-commit hook, so they apply to
commits made from any tool or terminal, not only Claude Code's Bash tool.

**Every new hook starts in warn mode. No exceptions.** A hook that blocks on
day one will block something legitimate and the user will delete the whole
tool. Warn mode is also how the lesson proves itself.

1. Read `.claude/never-again/state.json` to get the next lesson id (`L###`).
2. Write `.claude/hooks/na/<id>.sh` from `.claude/never-again/hook-template.sh`
   and `chmod +x` it. Fill in `ID`, `RULE`, `TRIGGER` and the CHECK section.
   The template sources `na-lib.sh`, which reads the payload, decides whether
   the command is really a commit, reads the mode from `state.json`, records
   the fire, and prints the decision. You write only the check.

   Four rules for the check. Each one was a real failure:

   - **Look at what changed, not the whole tree.** `na_changed_files .css .html`
     lists the files this commit could carry. A hook that scans every file in
     the repo cost 11 seconds per commit on a small site.
   - **Keep it under a second.** People wait on it every commit, forever.
   - **A check about repository state belongs to the git runner.** The
     current branch, what is staged, whether a tag exists: `PreToolUse` sees
     all of that as it was *before* the command, so `git checkout -b fix &&
     git commit` looks like a commit on the old branch. For such a check,
     `[ "$NA_SOURCE" = claude ] && na_is_chain "$NA_CMD" && exit 0`, and let
     the git-side run, which sees the state at commit time, decide.
   - **If the rule is "X must pass before commit" (a test suite, a smoke
     command, a build, a browser boot), do not write a check at all.** Copy
     `.claude/never-again/hook-verify-template.sh` instead, set `ID` and
     `RULE`, and put the command and the watched files in `state.json`:

     ```json
     "verify": { "run": "npm test --silent", "watch": [".ts", ".tsx"], "skip": ["dist"] }
     ```

     That hook stays silent while nothing watched has changed, runs the
     command itself when something has, and fires only when it fails. It
     never asks "did you run it?": `PreToolUse` sees the repository as it is
     *before* the tool call, so a stamp written by a separate command is
     always stale and `run-x && git commit` fires every time. Files come
     from git, so nothing in `.gitignore` is watched. Running it by hand:
     `bash .claude/hooks/na/L017.sh --run`. The worked example is
     `examples/browser-boot` in the tool repo.

     The dispatcher's entry carries a 600 second timeout, which covers a
     slow suite. If a check takes longer than that, it needs its own entry
     with a bigger `"timeout"`, or it belongs in CI rather than a hook.
   - **Self-test with `NA_DRY_RUN=1`, feeding the payload from a file.**
     Write the fake payload to a file and run `bash L017.sh < payload.json`,
     so the words "git commit" never appear in your own Bash command: the
     hooks already registered fire on the command text, and one self-test
     set off the live hook that way. Test four ways: a non-commit command
     (silent), a clean tree (silent), the bug reintroduced (`ask`, naming
     the file), and `git -C . commit` (still `ask`). Without `NA_DRY_RUN` every test run lands in `fires.log` and
     counts toward promotion. A verify-shaped hook still runs its command
     under `NA_DRY_RUN`, because nothing else can decide, but records nothing;
     self-test it with a fast command first, then set the real one.
   - **Then sweep the tree once: `na sweep L017`.** A hook checks the files
     a commit carries, so every older copy of the same mistake stays in
     the tree unless the check is asked about it now. The first real catch
     in the field found one file and left eight others. Fix what the sweep
     names, or tell the person what it found and why it stays.

3. Nothing to register. One dispatcher entry in `.claude/settings.json`
   (installed once) runs every hook listed in `state.json`, so filing a hook
   never touches settings. Set `TRIGGER` and, when the check only concerns
   some file types, `WATCH=".css .html"` in the script: the dispatcher skips
   the hook when no such file changed, which is what keeps a repo with many
   hooks fast. `na index` shows what the dispatcher will run. A hook whose
   `TRIGGER` is not `commit` (an `Edit|Write` check) needs its own entry
   with that matcher; say so when you file one.

4. Add the entry to `state.json` with `"form": "hook"`, `"mode": "warn"`, and
   `"file"`: the `LESSONS.md` the one-line rule goes into, relative to the
   root (for example `"packages/api/LESSONS.md"`). `na` manages a file
   because a lesson names it, so this is what makes a package file count.
5. Write the full story to `.claude/never-again/archive/<id>.md`: symptom,
   cause, rule, fix, and one line headed **What would have gone red:** naming
   the existing check that would have caught it, or "nothing". That line is
   where the honesty lives. When the answer is "nothing", the fix belongs in
   the code path, not in a new check, and the lesson may be rung 4.
6. Add **one line** to `LESSONS.md` marked `[hook]` so the user can see it
   exists without reading the script.

Scope the matcher as narrowly as you can. A hook that fires on every write
will be resented within a day.

### 4. If it is a rule line

Append to the nearest `LESSONS.md` (§6) in exactly this format, and record
that file's path as `"file"` in the lesson's `state.json` entry:

```
- [scope] Rule as an imperative — when: trigger condition (L###)
```

One line. No prose, no reasoning, no examples. All of that goes in
`.claude/never-again/archive/<id>.md`, which is only ever read when someone
asks why.

Before appending, **check for a near-duplicate**: run
`.claude/never-again/na dup "<the rule>"`. It prints the existing rules
that say much the same thing, or nothing. If one covers it, sharpen that
rule in place rather than adding a second one, and say which id you
sharpened. Two overlapping rules are worse than one, because neither gets
trusted.

If `LESSONS.md` is at its cap (default 40 rules per file, `cap` in
`state.json`), you may not add another until one is promoted to a hook or
retired. Say this plainly and propose which one to retire.

**Order matters.** Models follow earlier instructions more reliably than later
ones, so the rules that fire most belong at the top. Do not reorder by hand;
`na sort` does it from the fire log. If the user asks why a rule keeps being
ignored, check where it sits in the file before anything else.

### 5. Report

One line to the user. Nothing more:

```
Filed L017 as a hook (warn mode) · 23 rules, 9 hooks
```

Do not print a summary, a table, or a celebration. Those are tokens. The stats
command exists for that and it is free.

## When the commit asks you

You will not always notice that a fix just happened. The capture check
does: before a commit whose message says it is a fix (`fix`, `bug`,
`revert`, `regression`, `broken` and the like) and that carries no lesson
file, it asks, in the same shape as a warn-mode hook:

```
never-again capture asks: this commit looks like a fix (fix nav font) and files no lesson. ...
```

It runs from every agent's own hook and from git's `commit-msg` hook, so a
commit from a terminal or from an agent whose hook never ran meets it too.
When you see it, do one of two things and nothing else:

- Run this skill from §1. A commit that carries the archive entry, the
  rule line or a hook script satisfies the check by itself.
- Decide it is rung 4 and say so with `.claude/never-again/na none <why>`,
  as its own command before the commit. The mark clears once the commit
  lands, so it never silences the next fix.

Do not reword the commit message to get past it. `"capture": "off"` in
`state.json` is the person's switch, not yours; `"block"` makes it refuse.

A commit can also be refused because this repo runs an old release:

```
never-again 1.8.0 is out (this repo has 1.7.0). This commit is stopped until the repo moves: ...
```

Run `.claude/never-again/na upgrade` and commit again. If the person has
said not now, `.claude/never-again/na upgrade --later` lets commits
through until tomorrow or the next release. Do not edit `state.json` or
the hooks to get past it, and do not retry the commit unchanged: the same
stop comes back.

## Importing notes that predate the tool

Most repositories already hold lessons somewhere: a `CLAUDE.md` full of
rules, a `NOTES.md`, a `docs/lessons.md`, an editor's rules folder, and
Claude Code's own memory for this project under
`~/.claude/projects/<slug>/memory/` (what the person already told an
agent: feedback, corrections, project facts). The person should not have
to wait for each bug to recur before it counts, and nothing they already
wrote down may go to waste. `na` and `na review` name these files until
they are imported. When they are listed, or the person asks, do this:

1. Run `.claude/never-again/na import`. It lists the candidate files, how
   many lines of notes each holds, and which were imported before. Only
   files marked "not imported" or "changed since import" need work.
   Memory files are listed as `~/...`; read them at that path.
2. Take one file at a time. Read it and split it into individual notes: one
   rule, gotcha or instruction each. Ignore prose that is not a rule (project
   description, setup steps, links).
3. Run every note through the triage ladder in §2, exactly as for a fresh
   bug. Most notes are rung 3 (a one-liner) or rung 4 (nothing). Do not
   invent a hook for a note that only needs judgement, and do not file a
   note the person clearly already follows without help. If a note already
   exists as a lesson, sharpen that lesson instead of adding a second.
4. File what survives through §3 and §4: hooks in warn mode, one-liners in
   the nearest `LESSONS.md`, the origin (file and quoted line) in each
   archive entry. Respect the cap; if the file would push past it, stop and
   say which existing rules could be retired.
5. **Never edit or delete the source file.** It is theirs. If the notes came
   from `CLAUDE.md`, suggest, once, which lines they could now remove
   because a hook enforces them; the removal is their call.
6. **Nothing skipped is lost.** Write
   `.claude/never-again/archive/import-<file-slug>.md` with one line per
   note: the note as written, and what became of it (`hook L017`,
   `rule L018`, `sharpened L004`, or `skipped: <why>`). A skipped note
   with its reason can be picked up by a later review; a note that was
   silently dropped cannot.
7. Record the file: `na import --mark <path> --filed <n>`. Then it is listed
   as imported until it changes.
8. Report with one line per file. This is the one place a short table is
   fine, because it is a one-off:

   ```
   CLAUDE.md          31 notes  → 4 hooks, 9 rules, 18 skipped
   docs/lessons.md    12 notes  → 1 hook, 6 rules, 5 skipped
   ```

A file with the same content twice, or a rules file for another editor that
repeats `CLAUDE.md`, is imported once; mark the duplicates without filing.

## Promotion: warn → block

A hook earns its way up. The user decides, never you.

You will not see a warn-mode prompt: it goes to the person. You will see the
reason as a system message, so if a hook warned and the call went ahead
anyway (auto mode answers prompts for the person), stop and check the reason
before continuing. Do not ask "was that right?" after commits. The record
keeps itself:

- The hook logs the fire when it asks.
- If the tool call then runs, `_after.sh` marks the fire **proceeded**: the
  person went ahead despite the warning.
- If it never runs, the fire is settled as **declined**: the person stopped.
  A declined fire counts as correct on its own.
- `na ok L017` / `na wrong L017` grade the latest fire when the person wants
  to say otherwise, or to grade a proceeded one. Grades attach to real fires;
  there is nothing to grade until the hook has fired.
- A proceeded fire counts for nothing until graded, and you are the one who
  read the reason and made the diff. After a commit that went past a
  warning, the after-commit hook hands the ids back in one system message:
  *never-again: L017 warned and this commit went ahead. Grade it.* Grade it
  then, once, from what you know: `na ok L017` when the hook was right
  about the code even though the commit went ahead, `na wrong L017` when it
  flagged something that was fine. Leave it ungraded when you are not sure;
  a wrong grade is worse than none. Do not ask the person.

`na` shows per hook: fires, denied, declined, proceeded, ok, wrong, and the
current streak. After five correct in a row it says so. Offer promotion once,
when the user runs `na` or asks; do not nag:

```
L017 has five correct fires in a row. Promote to blocking? (na promote L017)
```

On a false positive, do not offer promotion — narrow the check instead. A hook
that cries wolf gets uninstalled along with everything else.

Promotion is always reversible: `na demote L017`. Both obey the
`promotion` setting in `state.json`: by pull request (default), anyone, or a
list of names. If `na promote` refuses because the branch is the default
branch, say so and stop; do not create the branch or the pull request
unasked. A hook that never fires is a
hook to retire: `na retire L017` removes the rule line, deregisters the hook,
and moves its script to the archive so it stops costing anything.

## Review: what the record says

Rules decay by evidence here, not by a clock. When the person asks for a
review, or about once a week of real work, run `.claude/never-again/na
review`. It counts, changes nothing, and prints every proposal the record
supports:

- **stale**: lessons with no trace in the last 50 commits (no fire, no
  grade, no mention of the id in a commit message, no archive change). A
  hook that never fired either finished its job or misses the mistake; run
  `na sweep` before deciding which. A rule line can never prove itself:
  if the mistake stopped, retire it; if a script could judge it, promote
  it to a hook.
- **say the same thing**: pairs of rules with the same content words. Keep
  the sharper one, fold anything the other adds into it, retire the other.
- **not imported yet**: rules or lessons someone already wrote, in the
  repo or in Claude Code's memory for it, that nothing counts or enforces
  yet. Import them (see below) before filing anything new that they may
  already cover.
- **ready to promote**, **warned past and ungraded**, **false positives**,
  and the cost line when a file is at cap or too many rules load per turn.

Act through this skill, one item at a time. Sharpening a rule and grading a
fire are yours to do. Retiring and promoting are the person's decision:
propose them with the evidence, in one line each, and wait. A review that
ends with fewer, sharper rules pays for itself on every turn afterwards.

## Monorepos and parallel agents

**Scope by package.** A lesson about `packages/api` belongs in
`packages/api/LESSONS.md`, not the root. Claude reads the root file plus the
one nearest the files it is touching, so a rule about the API never costs
tokens while working on the web app.

When you create a package-level `LESSONS.md`, copy it from
`.claude/never-again/lessons-template.md` so it carries the marker comment
(`managed by the never-again skill`). `na` only counts, sorts and edits
non-root files that carry that marker. A project's own `docs/LESSONS.md` in
another format is left alone, and you must not append to it either.

The number that matters is not rules per file but rules *loaded per turn*:
root plus nearest package. `na` reports this as "loaded here" and warns above
`loadedWarn` (default 60). Compliance degrades as that number grows, and the
failure mode is silent omission, not visible refusal. When the warning fires,
split by package, retire, or promote; do not raise the threshold.

**One writer per file.** Parallel agents each append to the `LESSONS.md`
nearest their own working directory, so two agents never write to the same
file. If two agents genuinely must touch the root file, append with `>>` under
a lock — never read-modify-write, which is how lines get lost.

Hooks are shared and therefore need more care: before writing a hook, re-read
`state.json` to claim the next id, and merge into `settings.json` rather than
replacing it.

## What not to do

- Do not file a lesson for a typo, a one-off flake, or something the user
  clearly already knows.
- Do not write reasoning into `LESSONS.md`. That is what the archive is for.
- Do not auto-promote a hook to blocking.
- Do not edit `fires.log` by hand. Self-tests use `NA_DRY_RUN=1` so there is
  never a reason to.
- Do not generate statistics yourself. Run `.claude/never-again/na`; a script
  counting lines costs nothing, and you reasoning about counts costs a lot.
  When someone wants a write-up of how the tool is doing, run
  `.claude/never-again/na report` and hand over its output. Do not write
  the report yourself: one such summary said hooks were "preventing
  regressions" in a repo whose fire log did not exist, and named an agent
  as a caller that had never called.
- Do not rewrite `CLAUDE.md` outside the marked block.

## Files this skill owns

```
LESSONS.md                          the rules Claude reads (small, capped)
.claude/never-again/state.json      lesson index, hook modes
.claude/never-again/archive/L###.md the full story, read on demand only
.claude/never-again/fires.log       one line per hook fire with its outcome and grade
.claude/never-again/hook-template.sh what a new check hook starts from
.claude/never-again/hook-verify-template.sh what a new verify hook starts from
.claude/never-again/lessons-template.md what a package LESSONS.md starts from
.claude/never-again/verified/       one manifest per verify hook — local, gitignored
.claude/hooks/na/L###.sh            the enforcement scripts
.claude/hooks/na/dispatch           the one registered entry: runs the hooks the index selects
.claude/hooks/na/na-lib.sh          shared by every hook: payload, mode, logging, decision
.claude/hooks/na/na-verify.sh       the verify engine every verify hook sources
.claude/hooks/na/na-manifest.py     what na-verify.sh compares the tree with
.claude/hooks/na/_after.sh          records that a warned commit went ahead
.claude/hooks/na/_capture.sh        asks when a fix is committed with no lesson filed
.claude/hooks/na/pre-commit         runs commit hooks from git itself
.claude/hooks/na/commit-msg         runs the capture check from git, where the message shows
.claude/never-again/.capture-none   the `na none` mark: HEAD it was given for — local, gitignored
```
