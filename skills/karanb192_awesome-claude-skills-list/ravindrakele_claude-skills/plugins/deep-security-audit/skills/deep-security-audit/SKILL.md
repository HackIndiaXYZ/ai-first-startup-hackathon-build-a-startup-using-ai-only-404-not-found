---
name: deep-security-audit
description: >-
  Deep, multi-agent security audit of a codebase — WordPress plugin, Laravel,
  Next.js, Node/Express, Django/Rails, or any app. Detects the framework, maps
  the REAL attack surface (routes, handlers, auth, sinks), then fans out scoped
  finder agents that READ and understand the code (not just grep), adversarially
  verifies every finding (proves the guard is genuinely absent + traces
  reachability), scores honest CVSS 3.1, dedupes, and produces a ranked report.
  Use whenever the user asks to find security issues / vulnerabilities, run a
  security audit or pentest, "is this secure", "scan this plugin/app/repo", or
  review auth / SSRF / IDOR / injection / secrets. READ-ONLY by default — never
  edits, commits, or exploits live systems.
---

# Deep Security Audit

A repeatable, multi-agent pipeline that finds real, exploitable security bugs by
**understanding code**, not pattern-matching. It fans work out to scoped finder
agents, then makes a second wave of agents **try to refute** each finding before
it's reported — so what survives is high-signal.

## Operating rules (non-negotiable)

1. **READ-ONLY.** Static analysis of source only. Never edit/commit/push. Never
   run an exploit against a live/hosted system. Local, self-owned, non-destructive
   PoCs only — and only if the user explicitly asks to verify one.
2. **Understand, don't grep.** grep is for *locating* the surface. Every finding
   must come from an agent that read the handler, its callers, its
   auth/middleware/validation, and traced reachability. No finding from a raw
   grep hit alone.
3. **Prove the guard is ABSENT.** A missing check is only a finding if you
   verified the framework's normal guard (nonce, capability, policy,
   `permission_callback`, auth middleware, `prepare()`, escaping, validation)
   is genuinely not there on that path. Frameworks have defaults — check them.
4. **Honest CVSS, no inflation.** Score CVSS 3.1 by real preconditions. If a
   BOLA needs an unguessable UUID → `AC:H`. If exploitation needs auth → `PR:L/H`.
   State the precondition. Downgrade the moment evidence contradicts the ceiling.
5. **Empirically calibrate when possible.** If a "read-back / exfil" claim can be
   safely checked locally and the data doesn't actually come back (lossy AI/serializer
   layer, blind SSRF), **downgrade it** — don't report the theoretical worst case
   as confirmed.
6. **Local ≠ deployed.** The checkout may lag or lead production. Flag that
   findings are "candidates to verify against the deployed branch," and diff
   against `origin`/the deploy branch when possible.
7. **No false positives from non-runtime code.** Ignore tests, stubs, fixtures,
   seeders, factories, `*.min.js`, vendor/, node_modules/, and env examples.

## Phase 0 — Recon (do this yourself, inline, before fanning out)

1. **Detect the framework(s).** Look for signal files:
   - Laravel → `artisan`, `composer.json` (`laravel/framework`), `routes/*.php`, `app/Http`
   - WordPress plugin → a main `*.php` with `Plugin Name:` header, `register_rest_route`, `add_action('wp_ajax_`, `$wpdb`
   - Next.js → `next.config.*`, `app/**/route.ts`, `pages/api/**`, `"use server"`
   - Express/Node → `express()`, route files, `app.get/post`
   - Django → `urls.py`, `views.py`; Rails → `config/routes.rb`, `app/controllers`
2. **Size it.** Count source files (exclude vendor/node_modules/tests). This sets
   the finder count (small ~10, large ~15, huge → split by module).
3. **Map the attack surface** — enumerate the real entry points and sinks:
   - **Routes/endpoints** and the **auth/middleware** on each (this is the spine).
   - **Auth/token/session** logic; **capability/permission/policy** layer.
   - **Sinks**: SQL (`$wpdb`, `DB::raw`, ORM raw), HTTP-fetch of user URLs (SSRF),
     file ops (LFI/traversal/upload), deserialization, command exec, template/HTML
     output (XSS), redirects, secrets/config.
4. Write a short inventory (route→auth table, sink list) to the scratchpad —
   the finders use it as ground truth.

See `references/frameworks.md` for the per-framework surface map and the exact
guards to check for each.

## Phase 1 + 2 — Fan out finders → adversarially verify (one Workflow)

Author a run-specific Workflow (multi-agent) from the template in
`references/workflow-template.js`. The template encodes the two-phase pipeline:

- **Find:** N scoped finder agents (one per attack-surface dimension). Each READS
  the code for its scope and returns structured findings (file:line, vulnerable
  code, concrete attack, honest CVSS + vector, confidence).
- **Verify:** every finding is handed to a fresh agent told to **REFUTE it** —
  open the exact file, read the guard chain + registration + reachability, and
  default to `confirmed:false` unless the code substantiates it. It re-scores CVSS
  honestly (downgrading for required privileges / non-default config / unguessable
  ids). Findings run through verify as soon as their dimension finishes (pipeline,
  no barrier).

Pick dimensions from `references/frameworks.md` for the detected framework. Scale
the finder count to size. Filter to `confirmed && exploitable && cvss >= threshold`
(default 5.0; the user may ask for higher/lower). Sort by adjusted CVSS.

Invoking this skill IS the user's opt-in to multi-agent orchestration — the
Workflow call is expected.

## Phase 3 — Dedupe, calibrate, report

1. **Dedupe.** Multiple finders re-find the same root cause (e.g. one missing
   ownership scope across many controllers). Collapse to unique issues; note the
   shared root cause and every affected location.
2. **Calibrate honestly.** Apply rules 4–6. If a claim's worst case is
   conditional (gadget chain, IMDSv1, an internal service that acts-on-request),
   say so and score the *demonstrated* impact, not the ceiling.
3. **Write the report** (markdown, to scratchpad or `~/Documents`), grouped by
   severity, each finding: title · CVSS + vector · location · root cause (with
   code) · concrete attack · fix · status (verified-from-source / needs-live-confirm).
   Include an honest "not confirmed / nothing survived" section and a "verify
   against deployed" caveat. Lead with a "if you fix only 3 things" list.
4. **Offer** to (a) write fixes as diffs, (b) produce a responsible-disclosure
   writeup, or (c) re-verify top findings against the deployed branch.

## Disclosure & safety posture

- Frame output as **responsible disclosure from an authorized review**.
- Redact any real tokens/secrets/UUIDs from the report.
- If asked to actively exploit a **hosted/production/third-party** system, or to
  extract live credentials to pivot, **decline** and explain: the finding is
  provable from source; live-fire against real infra is intrusion, not testing.
  Local, self-owned, non-destructive PoCs are fine when the user asks.
- Reserve the catastrophic labels (RCE, account-wide cloud takeover) for cases you
  can substantiate; prefer a calibrated medium over an inflated critical.
