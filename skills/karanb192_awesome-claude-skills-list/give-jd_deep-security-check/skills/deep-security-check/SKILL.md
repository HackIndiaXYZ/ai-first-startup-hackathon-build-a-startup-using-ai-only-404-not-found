---
name: deep-security-check
description: >
  Use when the user asks for a defensive security assessment, security audit,
  vulnerability scan, or "how safe / how reliable is this code/project/repo".
  Runs Semgrep (SAST), osv-scanner (dependency CVEs) and gitleaks (secrets)
  against a local project, then produces a report with a reproducible reliability
  grade (0-100, A-F). Defensive only — finds weaknesses in code you own; it does
  not exploit, attack, or test remote targets.
license: MIT
---

# Deep Security Check

Defensive, read-only security assessment of a local project + a reproducible
reliability grade. Static analysis only — this is not a penetration test and
never touches a live/remote target.

## When to use

- "Is this project secure? / how reliable is it?"
- "Audit this repo for vulnerabilities / secrets / vulnerable dependencies."
- Pre-release or pre-acquisition due-diligence on a codebase you are authorized
  to inspect.

Do **not** use for offensive requests (exploiting, attacking a running host,
credential access). This skill only inspects source you already have.

## Workflow

1. **Scan.** Run the bundled scanner. `$SKILL_DIR` is this skill's directory.
   ```bash
   bash "$SKILL_DIR/scripts/scan.sh" <project-dir>
   ```
   It runs whichever of Semgrep / osv-scanner / gitleaks are installed and writes
   one SARIF per tool. Capture the `OUT=<dir>` line. If it reports a scanner is
   missing, tell the user the one-line install command it printed and continue
   with whatever ran (the score's confidence will reflect the reduced coverage).
   Egress-restricted environments degrade automatically: if the Semgrep registry
   is unreachable it falls back to the bundled MIT ruleset (`rules/offline-basic.yaml`,
   reduced coverage — say so in the report), and if gitleaks is not on PATH on
   Linux x86_64 the vendored binary in `vendor/` is used.
   On git repos, secrets are also scanned in the **git history** (committed-then-
   removed secrets; `gitleaks-history.sarif`; skip with `DSC_SKIP_HISTORY=1` on
   huge repos). If no SCA tool ran, scan.sh prints an explicit "SCA not run"
   warning — relay it: dependency CVEs were not checked. trivy (SCA fallback,
   supports offline DB via `DSC_TRIVY_OFFLINE=1`) and syft (SBOM artifact
   `sbom.cdx.json`, informational) are used when present.

2. **Score.** Turn the SARIF into a deterministic grade:
   ```bash
   python3 "$SKILL_DIR/scripts/score.py" --sarif-dir <OUT> --project <project-dir>
   ```
   Pass `--project <project-dir>` (the scanned dir) to enable two more triage
   passes: **reachability-lite** (an SCA finding whose package name never
   appears in the source is downgraded one step with a `declared-but-unused`
   note — heuristic, conservative, never dropped) and **`.dsc-ignore`**
   suppressions (see below). Without `--project` the score is identical to
   before — both are opt-in.
   The JSON gives `score`, `grade`, `findings_by_severity`, `malicious_packages`,
   `assessment_confidence`, `triage` and `caveats`. The number comes from the
   rubric in `score.py` — narrate it, do not invent your own. If the user has a
   previous report, add `--baseline <old.json>` for a `vs_baseline` delta —
   offer this when they re-scan a project.
   - `malicious_packages` > 0: lead with it. A `MAL-*` OSV advisory means a
     dependency is *actively malicious*, not just vulnerable — the score is
     capped at 20 (F) and the project must be treated as compromised.
   - `triage`: `deduped` (same spot flagged by two tools, counted once),
     `downgraded_test_paths` and `downgraded_unreachable_sca`. Mention these so
     the user knows the grade already accounts for noise — don't re-inflate it
     by re-counting.
   - `suppressed` (if present): findings the project's `.dsc-ignore` silenced,
     each with its mandatory justification. List them so suppression stays
     visible, and flag any `.dsc-ignore ignored — …` caveat (a rule missing its
     ` -- justification` is rejected, not applied).

3. **Map the dynamic-test surface (static, zero traffic).**
   ```bash
   python3 "$SKILL_DIR/scripts/surface.py" <project-dir>
   ```
   This flags where a *dynamic* test would look — permissive CORS, missing
   security headers, insecure cookies, debug/bind-all config — by reading source
   only. The JSON gives `dast_surface[]` (`id`, `severity`, `file`, `line`,
   `recommendation`) and `is_webapp`. These are **advisory hints, not confirmed
   vulnerabilities**, and do NOT change the grade. This skill never sends network
   traffic; to actually test them, the user runs authorized DAST elsewhere.

4. **Project-structure hygiene (advisory).**
   ```bash
   python3 "$SKILL_DIR/scripts/structure.py" <project-dir>
   ```
   Validates the *shape* of the project — README/LICENSE, tests, CI, lockfiles,
   pinned dependencies, committed `.env`, Dockerfile root user. The JSON gives
   `checks[]` (`id`, `status: pass|warn|fail`, `detail`) and `summary`. Advisory
   like the surface pass: it does NOT change the grade — report `fail` items
   prominently (a non-gitignored `.env` is a real leak vector), `warn` items as
   maintenance posture.

5. **Read the findings.** Open the `*.sarif` in `<OUT>`; pull the highest-severity
   results (SARIF `runs[].results[]`: `ruleId`, `level`, `message.text`, and the
   `locations[].physicalLocation` for file:line). Do not paste raw SARIF — cite
   only what matters.

6. **Report** (match the user's language), structured as:
   - **Verdict**: `<score>/100 — grade <A-F>`, plus `assessment_confidence` and
     what the caveats mean in one line.
   - **What the grade means**: A/B solid · C manageable debt · D/E real risk ·
     F not trustworthy until fixed.
   - **Top findings** (~10 max): severity · tool · file:line · one-line issue · fix.
     For the 2-3 highest-severity findings, **propose a concrete patch** — show
     the fixed code as a suggested diff, but do NOT apply it (this skill is
     read-only; the user reviews and applies). Frame it as a suggestion, not a
     change made.
   - **Dynamic-test surface** (from `surface.py`, only if `dast_surface` is
     non-empty): list the hints, and state plainly they are unconfirmed until a
     **dynamic (DAST) test against a live, authorized staging target** checks them
     — this skill is static and never probes a running host. Point advanced users
     to an authorized DAST runner (e.g. OWASP ZAP against a staging target they
     are authorized to test).
   - **Structure hygiene** (from `structure.py`): `fail` items first (committed
     `.env` above all), then notable `warn` items in one line each.
   - **Coverage**: which scanners ran, what was NOT covered (e.g. no SCA if no
     lockfile; no DAST — this is static only), and the confidence caveats.
   - **Next steps**: 3-5 concrete, prioritized actions.

## Requirements

At least one of these on PATH (more = higher confidence):
- **Semgrep** — `pipx install semgrep` (SAST; `--config auto` needs network once).
  **Opengrep** (`https://opengrep.dev`, LGPL community fork of the semgrep
  engine) is used automatically as the SAST engine if semgrep is absent —
  drop-in rule/SARIF compatible, runs the bundled ruleset offline.
- **osv-scanner** — https://github.com/google/osv-scanner (dependency CVEs)
- **gitleaks** — https://github.com/gitleaks/gitleaks (secret detection; a
  vendored linux-amd64 binary ships in `vendor/` as automatic fallback)

## Honesty rules

- Read-only: never modify the scanned project.
- The grade comes **only** from `score.py`. Disagree with it? Argue the rubric,
  don't hand-write a number.
- A one-shot static scan is not a pentest, and `assessment_confidence` caps at
  `high` only when all three scanner classes ran. Say so.
