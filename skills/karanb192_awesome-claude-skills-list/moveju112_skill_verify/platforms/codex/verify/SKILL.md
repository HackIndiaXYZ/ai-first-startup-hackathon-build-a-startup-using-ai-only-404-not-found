---
name: verify
description: Evidence-based local verification and explicitly requested Claude↔Codex crosschecks of improvement ideas, plans, and changes. Automatically selects independent proposals, draft critique, or mutual review, with candid recommendations and minimal exchanges. Shared by Claude Code and Codex. Generic verification stays local; discussing this skill is not permission to call another model. Direct multi-angle unit-test requests use the unit-test skill.
---

# Verify

One shared entrypoint for Claude Code and Codex. The current agent remains the host and owns implementation; the counterpart may propose alternatives and review but never edits.

## Route and permission

- Ordinary verification: inspect and test locally; never call an external LLM.
- Crosscheck: require explicit task-scoped permission to involve the selected external reviewer. Loading this skill, installing it, or asking for generic verification is not permission.
- Claude host → Codex reviewer. Codex host → Claude reviewer; never invoke Codex recursively from Codex.
- Respect an explicitly requested reviewer, but do not describe same-family review as independent cross-model verification; clarify that conflict before calling.
- Infer the stopping stage separately from the strategy below: `analyze` for opinions or exploration, `plan` for a plan, `verify` for completed work, and `full` only when implementation is genuinely requested and authorized. An ambiguous advice request never defaults to `full`.
- Review-only requests stay read-only. Ask separately before DB, network, remote, destructive, deployment, Git mutation, or service-changing operations beyond the authorized reviewer call.

## Automatic crosscheck strategy

Choose from the existing question, draft, constraints, and impact; do not ask the user to choose a strategy. Respect an explicitly requested method. Automatic routing does not grant external-model permission.

| Situation, in priority order | Strategy | Minimum useful work |
|---|---|---|
| Completed work to verify | Completion review | Fresh reviewer session; skip idea generation and planning |
| Open substantial design/workflow improvement, or consequential unresolved tradeoffs needing fresh alternatives | `mutual` | Independent proposals, then each reviews the other's proposal once |
| A concrete draft needing refinement, without the tradeoffs above | `debate` | Reviewer critiques the draft; host accepts or rebuts with evidence |
| Open exploration or a small improvement without a concrete draft | `independent` | Independent proposals; host checks and merges them |

- Ordinary trivial verification stays local. If the user explicitly requested crosschecking a trivial task, honor it with one narrowly scoped review rather than silently skipping it.
- Broad improvement exploration normally uses `mutual`; a narrow, low-impact question uses `independent`. A supplied draft alone does not justify a heavier workflow.
- Words such as "핑퐁", "크로스체크", or "고도화" alone do not select `mutual`. Infer from actual scope and uncertainty; a narrow draft can use `debate`. An explicit method describes the sequence, such as independent-only analysis or each side reviewing the other's proposal.
- Keep initial proposals blind for `independent` and `mutual`. For `debate`, disclose the draft deliberately and still ask whether its premise or a simpler alternative is better.
- For advice or planning, read [crosscheck-strategies.md](references/crosscheck-strategies.md) for the shared brief, candid evaluation, and exchange rules. Do not load it for completion-only verification.
- Stop when another call cannot change the decision or verify an accepted fix. Never request agreement for its own sake; preserve unresolved dissent. Honor explicitly requested mutual review even when the initial proposals agree.

## Local verification

1. Read applicable project rules; inspect `git status --short` and the relevant diff or stated baseline. Outside Git, inspect the explicitly scoped files instead.
2. Trace callers, contracts, authorization, state changes, and cache/persistence effects.
3. Confirm findings at the cited line and reachable call path; reproduce when practical.
4. Run the smallest relevant existing local checks. Do not equate syntax checks with behavioral tests.
5. Report `PASS`, `FAIL`, or `PARTIAL`, severity-ordered findings with `file:line`, checks actually run, and unverified risks.

## Shared call boundary

Resolve `scripts/` relative to this skill directory, then use absolute paths from the target repository. The bundled wrappers are the shared implementation; legacy entrypoints link to them. Do not call `claude -p` or `codex exec` directly.

| Reviewer | Wrapper | Environment for approved model calls |
|---|---|---|
| Claude | `scripts/claude_ask.sh` | `CROSSCHECK_REMOTE_APPROVED=1`; `CROSSCHECK_BASE_SHA` for a recorded baseline |
| Codex | `scripts/codex_ask.sh` | `CROSSCHECK_SANDBOX=read-only` |

- Run the selected wrapper's `check` before the first authorized call. It checks local installation/authentication without a model request.
- The Codex wrapper does not enforce the permission gate itself: the host MUST obtain task-scoped authorization before calling it.
- Pass paths and line ranges, never entire files or diffs. Summaries sent to the reviewer must be at most 15 lines.
- Use a caller timeout of at least **930 seconds** (930000 only for tools whose timeout unit is milliseconds). The wrapper's default internal limit is 900 seconds.
- Never read raw crosscheck logs wholesale. They contain repository content. Read only narrowly filtered diagnostic excerpts.
- Retain the exact `SESSION: <uuid>` returned. Never resume `UNKNOWN`, an implicit latest session, another reviewer's session, or a session from another repository. Start fresh after three rounds or a topic change.
- `VERDICT: AGREE|DISAGREE|NEED_INFO` is the review format. Findings are `#N [blocking|minor]`. Refer to finding numbers in follow-ups instead of repeating their text.
- Advice adds `RECOMMENDATION: adopt|revise|keep-current|avoid|need-info` and a reason. This judges the proposal's value; `VERDICT` remains the assessment of the stated question or draft. Agreement is not implementation permission or evidence of correctness.
- On permission/authentication/quota/timeout/error or format warnings, handle the actual status; never invent a successful verdict. Re-ask malformed findings, but a length-only warning can be accepted if the verdict and findings are otherwise valid.
- Do not ask reviewers to invoke another model or recursively load crosscheck workflows. Preserve explicit user model/effort settings; do not change the host model or effort.

### Claude reviewer

The wrapper uses a read-only Bubblewrap mount and a restricted `Read`, `Glob`, `Grep` allowlist; reviewer Bash, mutation tools, customizations, and subagents are disabled. Admin-managed policy may still apply.
The repository is mounted at `/workspace`; Git evidence is at `/evidence`. The existing `review_git.sh` gathers status, HEAD, diff, and untracked-file artifacts locally.
Tell Claude to inspect that evidence rather than execute Git commands. Diff excludes untracked contents: the reviewer must read relevant untracked files directly.
Only the current reviewer session home is writable. Host credentials enter through a one-use descriptor; unrelated home directories and previous sessions are not mounted.

```bash
# 승인된 작업에서만 실행하며 경로와 기준 커밋을 실제 값으로 치환한다.
CROSSCHECK_REMOTE_APPROVED=1 CROSSCHECK_BASE_SHA=<base-commit> \
    /absolute/skill/scripts/claude_ask.sh new -C /path/to/repo "질문"
CROSSCHECK_REMOTE_APPROVED=1 \
    /absolute/skill/scripts/claude_ask.sh resume <session-uuid> -C /path/to/repo "후속 질문"
```

### Codex reviewer

The existing wrapper uses Codex's read-only sandbox. Keep `CROSSCHECK_SANDBOX=read-only`; do not expand its permissions.
Ask Codex to inspect `git diff <base>` and `git status --short` and read relevant untracked files. Unlike the Claude wrapper, it does not use the `/workspace` and `/evidence` mount contract.
`resume` inherits its original repository and sandbox; do not pass `-C` to change them.

```bash
# 명시적인 Codex 검토 승인 후에만 실행한다.
CROSSCHECK_SANDBOX=read-only \
    /absolute/skill/scripts/codex_ask.sh new -C /path/to/repo "질문"
/absolute/skill/scripts/codex_ask.sh resume <session-uuid> "후속 질문"
```

## Crosscheck workflow

1. **Gate:** Record the original requirement, base commit (`git rev-parse HEAD`), and working-tree status. Preserve pre-existing changes. Establish authorization and run the selected preflight. For non-Git targets, clarify evidence and wrapper compatibility first.
2. **Initial assessment:** For `independent` or `mutual`, fix the reviewer prompt to the question and path hints before the host investigates; include no host conclusions. If supported, run the reviewer with a retained background/live handle while the host independently investigates. Record the host conclusion before collecting or reading reviewer output. Without background execution, record the host analysis first, then run the unchanged reviewer prompt in the foreground. For `debate`, send the existing draft and evaluate it locally; skip blind proposal generation. Never fire-and-forget or rerun a completed call merely because its task handle expired; collect its exact result file if available.
3. **Compare:** Treat findings as hypotheses. Check code claims against source, reachable callers, and a minimal reproduction when feasible; check conceptual claims against supplied facts, constraints, and feasibility without inventing file evidence. `independent` ends with the host's checked merge. `mutual` requires the host to review the counterpart's proposal and the counterpart to review the recorded host proposal. `debate` starts with the draft critique. Default to one exchange, with at most one additional exchange only for decision-changing evidence, an unresolved consequential objection, or an accepted fix needing confirmation. Send proposal summaries and relevant findings, not just disagreements; record dissent. Stop here for `analyze`.
4. **Plan:** In `plan` or `full`, draft at most 15 lines. Review missing edge cases, simpler alternatives, and conflicts; reuse a critique only if it already covered this exact plan and constraints. Do not repeat an unchanged review. Cap planning at three rounds, stopping earlier when further calls cannot affect the plan. Stop here for `plan`.
5. **Implement:** Only in `full`, the host applies verified, in-scope findings under existing permissions. Reviewers never edit. Run the smallest relevant local checks.
6. **Completion:** For `full` or `verify`, start a fresh reviewer session with the requirement in at most three lines and the recorded baseline. Use the reviewer's evidence contract above. Review coverage, regressions, and unverified risks. Cap formal review at two rounds; allow one confirmation-only pass after the last accepted fix. `verify` goes directly to this step after the gate, without unsolicited analysis/planning/implementation.

Completion prompts use the original request and changed paths, not a favorable host-written claim of success. Inspect only relevant failure conditions: authorization/trust boundaries, data loss, retry/rollback/partial failure, concurrency/stale state, missing inputs/timeouts/dependency failure, compatibility, and gaps that conceal failures. Each finding explains the failure, reachable cause, impact, and concrete remedy; do not invent style complaints or speculative defects. A confirmation-only pass checks the accepted fixes, without expanding the review scope.

If a reviewer is unavailable during `full`, explain why, continue authorized local work, and mark skipped crosscheck phases explicitly.
For analysis-only, plan-only, or verify-only crosscheck requests, stop and ask rather than silently substituting solo review.

## Report

Report the selected strategy and reason in one line, then the merged conclusion, calls/exchanges actually completed, accepted/rebutted findings, valuable minority proposals, unresolved dissent, local checks and results, and skipped checks or risks. For advice, lead with the recommendation and its conditions; say plainly when an idea is poor value or should be avoided. Do not pad the report with empty sections.
Never claim crosschecking occurred unless an actual reviewer response was collected. Static or syntax-only checks are not behavioral test completion.
