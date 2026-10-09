---
name: pit-stop
description: "Use when the user asks to fully improve, overhaul, audit-and-fix, clean up tech debt, or run pit-stop on a project, repo, or codebase. Triggers: 'improve this project', 'overhaul the repo', 'audit and fix everything', 'tech debt cleanup', 'pit-stop', '全面改进', '项目体检', '进站', '重构整个项目'. Do NOT use for reviewing a single PR or diff, or for read-only questions about a codebase."
argument-hint: "<项目路径> [--禁区 <路径或事项>...] [--max-rounds N]"
allowed-tools: Read Edit Write Bash Glob Grep Task WebFetch WebSearch
---

# Pit-Stop

F1 pit-stop for codebases: drive in, get fixed, come out faster. One instruction runs
**load → find → propose → fix → ideas → report** with no mid-run questions. The user only says go;
you return once with a report.

## The run (in order, no skipping)

1. **Load**: read README/AGENTS.md (or equivalent) + `git status` + recent-commit hot spots.
   Write one line first: MODE = what counts as a finding here, what is rejected outright.
   Missing a key fact? Ask ONCE, then proceed under strictest defaults.
2. **Find**: scope before you scan (named target > git hot spots > full tree).
   Every finding needs `path:line` evidence. Skip recorded decisions unless friction
   justifies reopening. Tag each: `delete/stdlib/native/yagni/shrink/perf/security/obs`,
   strength `Strong/Worth/Speculative`. Speculative = report only, never fix.
   Nothing found: name the search surface first, then `Lean already. Ship.` — never pad.
3. **Propose**: Strong items only. Each = symptom + evidence + impact + minimal fix + cost.
   Plus a NOT-doing list with its trigger conditions.
4. **Fix**: review→fix loop with an independent reviewer (different angle beats same eyes);
   stop at clean or `--max-rounds` (default 3). Cross-round ledger, no repeat fixes.
   Two stagnant rounds → escalate to "needs human", stop. See `references/review.md`.
5. **Ideas**: after the loop closes, read-only brainstorm — no edits, no subagent.
   ≤3 candidates, each anchored in this run's ledger/diff, shaped
   `[idea] <capability ≤20 words> — <path:line> — probe: <≤12 words>`.
   Never built this run. See `references/ideas.md`.
6. **Report**: header `Generated fully automatically by pit-stop`. Four blocks —
   changed / verified (tool output) / unverified / remaining. No claim without fresh
   tool output. Secret/token/PII redaction in everything pasted. The ideas ride behind
   needs-human items in Remaining. See `templates/report.md`.

## Iron laws

- **Evidence before claims, always.** No verification run in this turn = no success claim.
- **A subagent's "done" is not done.** Read its diff before reporting.
- **Fuzzy spots downgrade, never guess.** Write "needs human", keep moving.
- **Push/commit never automatic.** Changes wait in the workdir for one explicit word.
- **Single spend fuse**: one phase estimated over $20 → stop phase, write report.

Details: `references/audit.md`, `references/fix.md`, `references/review.md`,
`references/report.md`, `references/ideas.md`, `references/guardrails.md`,
`references/verification.md`.
