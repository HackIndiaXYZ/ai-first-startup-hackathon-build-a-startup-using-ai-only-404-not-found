---
name: crosscheck
description: Claude-hosted Claude↔Codex crosschecks of improvement ideas, plans, and completed changes. Automatically selects independent proposals, draft critique, or mutual review and allows candid rejection. Use for explicit requests such as "크로스체크", "코덱스랑 핑퐁", "둘이 의견 취합해", "cross-check with codex", or "/crosscheck". Discussing or editing this skill does not authorize another model call.
---

# Claude-hosted Crosscheck

This compatibility entrypoint delegates to the shared procedure in [verify](../verify/SKILL.md). Read that file and follow its routing, permission, evidence, wrapper, strategy, stopping, and reporting contracts. Do not maintain a second workflow here.

- Claude is the host; Codex is the read-only counterpart. The host owns implementation. In Codex, use the shared entrypoint's model-family routing instead.
- Choose the strategy automatically, within task-scoped reviewer permission; do not ask which method to use. Respect an explicitly selected method.
- Infer the stopping stage from intent: opinions → `analyze`, plans → `plan`, completed work → `verify`, authorized implementation → `full`. Advice does not default to implementation.
- For advice and planning, read the shared [strategy reference](../verify/references/crosscheck-strategies.md). Broad improvement exploration normally uses independent proposals plus mutual review; a concrete draft uses critique; a narrow exploration uses independent proposals.
- Say when an idea is poor value, recommend keeping the current approach when justified, and preserve evidence-based dissent. No mandatory praise, criticism, or consensus.
- Every Codex call goes through this entrypoint's `scripts/codex_ask.sh`, which links to the shared implementation. Keep its read-only sandbox and exact returned session ID; never call `codex exec` directly or recursively invoke crosschecking.
- Preserve user model/effort settings. Local edits, Git changes, remote mutations, and deployment retain their existing approval boundaries.
- Reply in the user's language. Report actual reviewer responses and checks only; no claimed crosscheck without a collected response.
