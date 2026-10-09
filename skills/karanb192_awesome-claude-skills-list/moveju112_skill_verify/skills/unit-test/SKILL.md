---
name: unit-test
description: Use when the user directly requests efficiency-aware multi-angle unit tests or a test report after code changes. Triggers include "단위 테스트", "유닛테스트", "테스트 돌려", "다방면 테스트", "테스트 문서 정리", and the English equivalents "unit test", "run the tests", "multi-angle tests", "write up the test results", and "/unit-test". Codex or Claude runs tests locally without calling another LLM, avoids duplicate full-suite gates, and writes a focused report to the project's test directory. Not for E2E, external DB/network checks, runtime verification, or performance benchmarks.
---

# unit-test — multi-angle unit testing after code changes

The active host designs, runs, and documents unit tests for freshly changed code.
Use the runtime identity supplied by the current session; never infer it from skill paths.
Host-local only: never call the counterpart, crosscheck scripts, or another LLM.
Respond in the language the user writes in — Korean request, Korean output; English request, English output.
The report follows that same language. This rule document stays English regardless.

## 0. Invocation — explicit requests only

- Use this skill only when the user explicitly asks for unit testing or its report.
- Ordinary code modification does not trigger this skill. Do not offer unit tests merely because code changed.
- A direct request to run unit tests IS the approval for local unit testing; do not ask again.
- Approval covers local unit testing only. Never access an external DB, network,
  service, or runtime from this skill. Route those checks to a separate verification
  step with its own explicit permission.

## 1. Scope — what to test

- `git diff HEAD` (or the session's edit list) → enumerate changed functions/methods.
- Classify each check as `UNIT`, `STATIC`, `BUILD`, `INTEGRATION`, `RUNTIME`, or
  `PERFORMANCE`. This skill executes only local `UNIT`, plus the smallest useful
  `STATIC` or `BUILD` gate. List the other classes as uncovered; do not run them here.
- Prefer pure-logic units and isolated local fixtures first.
- Skip generated files, comments-only changes, config values.

## 2. Design — multi-angle case matrix

Pick every applicable angle per unit (skip N/A ones, say so in the report):

| Angle | What it catches |
|---|---|
| happy path | basic contract |
| boundary | 0 / max / off-by-one / time-second edges |
| empty·null·missing | `[]`, `null`, absent keys, no rows |
| error path | invalid input, enum tryFrom fail, exception contract |
| ordering·determinism | sort stability, map-vs-single result order |
| before/after equivalence | refactor: old logic vs new logic on same inputs |
| side effects | state mutation, cache pollution across calls |

- For refactors, equivalence is the top priority: use captured pre-change results or
  the OLD logic as an oracle on the same inputs. Do not derive expected values by
  calling the new implementation. Pair equivalence with an independent contract
  assertion so an existing defect does not become the desired behavior.
- Boundary values come from the code (constants, `E_`-style config), not guesses.
- Every retained case must name the defect it catches and assert an observable
  result, exception, or state effect. Prefer different failure mechanisms over
  many inputs that repeat the same assertion.
- For a newly fixed defect, observe the regression case failing on an isolated
  pre-change implementation/known-bad fixture and passing after the fix when feasible.
  Do not alter the user's working tree for this check. If unavailable, state that
  defect-detection strength was not demonstrated; do not invent a red/green run.

## 3. Run efficiently

- Prefer the project's existing test framework (`phpunit`, `jest`, `pytest`, `go test`…).
- None available → a standalone script with explicit failure exceptions/exit code ≠ 0.
  If using runtime assertions, first prove a deliberately false assertion fails;
  disabled assertions cannot supply PASS evidence.
- Script location — resolve in THIS order, stop at first hit:
  1. Test path stated in project rule docs (`CLAUDE.md`, `CLAUDE.local.md`, `AGENTS.md` …) — e.g. hnote → `tools/test/`.
  2. Existing test dir auto-detect: `tests/` → `test/` → `tools/test/` → `spec/` → `__tests__/`,
     cross-checked with framework config (`phpunit.xml` testsuite dir, `package.json` test script, `pytest.ini`/`pyproject.toml` testpaths).
  3. Neither exists → create `<project>/test/scripts/`.
- The resolved script dir affects scripts ONLY — the result report stays in `<project>/test/` (step 4) regardless.
- Isolate class dependencies: include only the needed enum/util files instead of full bootstrap
  when the framework bootstrap requires env constants.
- Run changed-unit focused tests first.
- Choose exactly one **full-suite owner** when broader regression coverage is warranted:
  the project's official build/release command if it already runs the suite, otherwise
  the direct full-suite command. Never run a full suite and then a wrapper that repeats it.
- During iterative edits, rerun affected focused tests. Run the full-suite owner once on
  the final stable change, unless the code changed after that gate.
- For a small isolated change, focused tests can be sufficient when project rules do not
  require a full gate. Record the omitted full suite as uncovered risk.
- If an unchanged test fails, rerun it once. Mark it `BASELINE_FAIL` only when pre-change
  or HEAD evidence proves the same failure. Do not repeatedly run a known baseline failure
  after every edit; include it once in the final gate.
- Capture per-case PASS/FAIL and actual values. Never fake a result. A local unit case that
  could not run is `SKIP` with the reason.
- Distinguish product failures from import/bootstrap/assertion-tooling failures before
  retrying. An unexecuted assertion is SKIP, even if the runner exited successfully.

## 4. Report — `<project>/test/`

- Write `<project>/test/UNITTEST_<YYYYMMDD>_<topic>.md` (create `test/` if absent).
- Written in the user's language, dyslexia-friendly (one sentence per line, short paragraphs).
  Sections (Korean heading / English heading — use one set, matching the report language):
  1. 요약 / Summary — one-line conclusion plus
     `<!-- UNIT_COUNTS PASS=<n> FAIL=<n> SKIP=<n> -->`
  2. 대상 / Scope — changed files and functions (file:line)
  3. 케이스 표 / Case table —
     `| type | # | angle | input | expected | actual | verdict |`, with one `UNIT` row
     per counted case
  4. 실패 상세 / Failures — reproduction command and cause, failed cases only
  5. 미커버 위험 / Uncovered risk — areas skipped (DB needed, etc.) and why
  6. 환경 / Environment — runtime version, commands run once, full-suite owner, date
- `STATIC`, `BUILD`, and `BASELINE_FAIL` results are supporting checks; report them
  separately and never add them to `UNIT_COUNTS`.
- `INTEGRATION`, `RUNTIME`, and `PERFORMANCE` results do not belong in a unit-test report.
- Use explicit representations for empty values (`[]`, `null`, `""`); leave no case
  field blank. SKIP's actual field states why it did not run. PASS/FAIL actual fields
  must contain an observed value, error, or state, never a pending/not-run placeholder.
- Before finishing, run `python3 <skill>/scripts/validate_report.py <report>` and fix any
  count mismatch, missing case evidence, or forbidden external-check row. Validator
  success proves report consistency only; execution evidence comes from the run.
- Append only when the objective and changed unit are the same and the resulting file stays
  at or below 300 lines. Append at the true EOF, never at a repeated text anchor.
- For a materially different subtask or a report over 300 lines, use a more specific new
  topic filename instead of growing the old report.
- The report file stays; whether to commit it is the user's call (never auto-commit project repos).

## 5. Cleanup

- Keep meaningful regression tests in the existing test suite when the approved change
  introduces or fixes behavior; record their path and the defect each one prevents.
- Delete task-only test scripts, probes, and fixtures after use when no durable coverage
  remains. Inspect exact task-owned paths first; preserve user files and permanent tests.
- If project rules explicitly require temporary tests only (e.g. hnote), follow that
  scope and record why no regression test remains. A request to keep tests takes priority.
- Report failures honestly in chat: FAIL count first, then the report path.
