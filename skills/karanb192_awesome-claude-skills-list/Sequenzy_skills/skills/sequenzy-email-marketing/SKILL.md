---
name: sequenzy-email-marketing
description: Primary agent guide for operating Sequenzy as an email-marketing platform. Use when Codex needs to authenticate, inspect identity, manage subscribers, create or edit campaigns/sequences/templates, control the campaign lifecycle (cancel, pause, resume, delete, duplicate), run campaign A/B tests, mutate lists/tags/segments, enroll subscribers into sequences, invite team members, triage and reply to inbox conversations, manage outbound webhooks, generate draft email content, send transactional email, read delivery stats, or decide whether a requested Sequenzy email-marketing workflow is currently supported. Prefer this over the generic sequenzy skill when both seem relevant.
---

# Sequenzy Email Marketing

## Overview

Use this as the default skill for Sequenzy email-marketing/product operations: subscribers, lists, tags, segments, campaigns, sequences, templates, AI email generation, transactional sends, delivery stats, dashboard URLs, CLI/MCP behavior, and currently-supported workflow checks. Prefer the `sequenzy` CLI for supported workflows, treat `packages/mcp/src/tools/index.ts` as the MCP source of truth when the task goes through MCP tools, and explicitly call out when a requested workflow is not wired in the current implementation. If both `sequenzy` and `sequenzy-email-marketing` match, load this skill first.

## Ground Rules

1. Treat `packages/cli/src/index.tsx` as the source of truth for which commands are actually wired.
2. Treat `packages/cli/src/commands/` and `packages/cli/src/api.ts` as the source of truth for CLI behavior, payload shape, and API routes.
3. Treat `packages/mcp/src/tools/index.ts` as the source of truth for MCP tool names, arguments, and preflight validation.
4. Do not promise support for commands or tools that only appear in docs or `--help` text without an attached implementation.
5. Prefer `sequenzy login` for interactive auth and `SEQUENZY_API_KEY` for automation.
6. Prefer inspection before mutation whenever the workflow allows it.

## Supported Workflows

Read [references/use-cases.md](references/use-cases.md) before executing anything non-trivial. The currently implemented CLI flows are:

- login and logout
- local auth/session check with `whoami`
- account inspection with `account`
- company inspection, creation, or brand/sender-identity updates with `companies list|get|create|update`
- stats overview or stats by campaign, sequence, or transactional ID, with custom `--start`/`--end` ranges, `--email-type` and `--mailbox-provider` scoping, `--include-bots`, and campaign `clickedLinks` plus poll/NPS `polls` arrays
- raw delivery/engagement event listing with `events --campaign|--sequence`, and per-delivery inspection with `email-sends list|get` plus bounce-suppression cleanup with `suppressions get|remove`
- subscribers `list`, `add`, `update`, `get`, and `remove`, with `list` fetching every page by default and supporting tag, segment, and list filters; `add` and `update` set native profile names via `--first-name` / `--last-name` (MCP `add_subscriber` / `update_subscriber`: `firstName` / `lastName`), so never store names in custom attributes; both also handle native phone numbers and SMS consent
- bulk subscriber imports with `subscribers import` / `import-status`, subscriber notes, custom event triggering with `subscribers event` (live or `--occurred-at` backfill), and bulk tag operations with `subscribers tags add|remove`
- lists `list`, `create`, `update`, `delete`, `add-subscribers`, `remove-subscribers`, and `import` alias for bulk list population from emails, JSON, CSV, or newline files
- tags `list`, `create`, `update`, and `delete`, with bare `sequenzy tags` still listing tag definitions for backwards compatibility
- segments `list`, `create`, `update`, `delete`, and `count`, including `--match any`, nested filter roots, custom event filters, and saved-segment composition filters
- templates `list`, `get`, `create`, `update`, and `delete`, with `list` supporting label filters and `create`/`update` accepting labels, raw HTML, or Sequenzy block JSON
- campaigns `list`, `get`, `create`, `update` including label and reply-to updates, `schedule`, and `test`, with `list` supporting label filters, `create` accepting labels plus raw HTML, Sequenzy block JSON, or prompt-generated content, `update` accepting labels plus raw HTML or Sequenzy block JSON, and `schedule` returning a review preview link; `create` and `schedule` both accept the audience via `--segment` or `--target-lists-json`/`--target-lists-file`
- campaign lifecycle control with `campaigns cancel` (stops scheduled, paused, waiting-approval, or sending campaigns immediately, no confirmation prompt), `campaigns unschedule` (returns a scheduled campaign or recurring series to draft), `campaigns pause` and `campaigns resume` for an active send (resume supports `--spread-over-hours`), `campaigns delete` (blocked while sending, scheduled, or paused - cancel first), and `campaigns duplicate` with `--mode campaign|ab_test|variant`
- campaign audience inspection with `campaigns audience`, true-to-send HTML previews with `campaigns render` / `templates render` / `sequences render` (subscriber or ad-hoc personalization, locale, tracking, `--out`), recurring sends with `campaigns schedule --repeat weekly|monthly`, and post-send re-engagement with `campaigns resend-to-non-openers`
- ab-tests `list`, `get`, `stats`, `restart`, `update-variant`, `create`, `add-variant`, `delete-variant`, and `delete`; create/add-variant/delete-variant/delete work on campaign A/B tests in draft status, variant A is the protected control, and `restart` reruns a finished sequence A/B test. For a sequence A/B step, `sequences get --json` and MCP `get_sequence` expose each variant's full blocks when `ab_tests:read` is granted; edit them only through `ab-tests update-variant` / `update_ab_test_variant`
- MCP template and campaign tools support labels on list/create/update; MCP `update_campaign` also supports `replyTo` and `replyProfileId`, and MCP `schedule_campaign` schedules draft or already scheduled campaigns
- MCP `search_subscribers` supports list filters through `list`, `listId`, or `listName`; MCP `add_subscribers_to_list` accepts up to 500 emails per call
- sequences `list`, `get`, `create`, `update`, `enable`, `disable`, `delete`, `enroll`, and `cancel-enrollments`, including explicit discount action steps, cancellation by subscriber ID or event-property field values, and `update` branch insertion with tag, list, segment, event, clicked-link, and field conditions; event and clicked-link branch checks can use `activityScope` (`this_sequence`, `previous_email`, `ever`)
- manual sequence enrollment with `sequences enroll` from emails, JSON, or files, optionally at a specific node with `--target-node-id`, reporting enrolled, skipped, and not-found subscribers
- team `list`, `invite` with `--role admin|marketer|viewer|restricted` and owner-only `--billing-access`, and `cancel-invitation`
- inbox `list` with status, search, unread, and pagination filters, `get`, `reply` including internal notes with `--note`, `close`, `reopen`, and `mark-read`
- webhooks `list`, `create`, `update`, `delete`, `test`, `deliveries`, and `replay` for outbound webhook endpoints, with `create` returning a one-time signing secret that must be handled as sensitive
- AI generation with `generate email`, `generate sequence`, `generate subjects`, and `generate sms`
- dashboard URL generation with CLI `urls`, MCP `get_app_urls`, and `appUrls`/`url` fields on campaign, sequence, template, and company results
- websites `list`, `add`, `check`, and `guide`
- products `list`, `sync`, `upsert` (API-provider products keyed by your own ID, bulk up to 100), `delete`, `attach-file`, and `detach-file` for digital product delivery, with `attach-file --file` uploading local files via presigned URLs; attached files are exposed on `saas.purchase` events as `{{event.download.url}}` / `{{event.download.name}}` (MCP: `list_products`, `upsert_products`, `delete_product`, `attach_product_file`, `remove_product_file`, `sync_products`)
- API key management with `api-keys create|list|revoke`, including permission presets and explicit scopes on create; new keys are handled as sensitive output
- transactional email: one-off sends by template or raw HTML with `send`, plus saved-template management with `transactional list|get|create|update|delete` and preferences-iframe tokens via `transactional widgets preferences-token`
- forms `list` and `update` (MCP additionally: `create_form`, `get_form_embed`) and full landing-page management with `landing-pages` including publish/unpublish, duplicate, custom domains, and DNS verification
- sequence operations beyond CRUD: `render`, per-node `test` sends, `duplicate`, `archive`/`unarchive`, enrollment listing with CSV export, `pause-enrollments`/`resume-enrollments`, conversion `goals`, and inbound trigger `webhook get|configure|rotate`
- template AI/manual localization with `templates localizations set|sync`
- integrations: `catalog`, `connect` (API-key/webhook-secret providers; OAuth providers connect in the dashboard), `list`, `get`, `activity`, `sync`, `enable-sync`/`disable-sync`, Shopify `pixel`/`enable-pixel`, and `guide`
- Meta Ads audience syncs with `audience-syncs list|ad-accounts|create|update|delete|sync`
- deliverability and sending config: `sender-profiles list|update`, `tracking settings|update` (open/click tracking, strict bot filtering, attribution window, double opt-in, auto-UTM), and sequence/step-level sending windows
- Shopify automation settings with `shopify settings get|update` (browse abandonment, cart abandonment, price drop)
- SMS operations with `sms settings`, `sms send-test`, SMS sequence steps, and `generate sms`
- integration event-to-tag sync rules with `sync-rules get|update`
- personal notification preferences with `account notifications get|set`
- product feedback with `feedback`, sending missing-capability reports, bug reports, and other product feedback to the Sequenzy team after the user approves the exact payload (MCP: `submit_feedback`)

## Unsupported Or Placeholder Workflows

Treat missing subcommands as unsupported even when the noun exists. The main remaining gaps: campaign immediate send (no "send now" command - schedule with a near-future `--at` timestamp instead), sending domain add/verify (MCP `add_sending_domain` / `verify_sending_domain` or dashboard only), form creation and embed snippets (MCP `create_form` / `get_form_embed` only), and image asset upload (MCP `upload_image_asset` only). Bulk list population is supported through `sequenzy lists add-subscribers` and its `sequenzy lists import` alias, not through `subscribers add`. When the user wanted something unsupported, offer to report the gap with `sequenzy feedback "..." --category missing_capability` (MCP: `submit_feedback`). Before sending feedback, show the user the exact message, category, and context you plan to send, leave out private account, subscriber, contact, and campaign details, and send only after the user approves.

## Workspace Roles

Inspect `sequenzy account` or MCP `get_account` before choosing a privileged workflow. Account-key permissions combine selected scopes with your current workspace role; `roleRestrictedScopes` identifies scopes blocked by that role. `canSendLive` means at least one delivery workflow is available, not that every send tool is allowed.

Marketers can manage marketing content, subscribers, campaigns and sequences, including marketing test sends and unscheduling. They cannot use transactional sending or manage team, billing, integrations, API keys, sending identities or workspace settings. Choose existing sender/reply profiles; inline creation of a new profile is also restricted. Transactional-backed templates and their campaign, A/B and sequence sources stay protected through copies, previews, share links, analytics and retained send history. Use the narrowest eligible role; billing access cannot be granted to marketers or restricted members.

## Execution Pattern

1. Check auth first with `sequenzy whoami` or by verifying `SEQUENZY_API_KEY` is set.
2. Pick the narrowest command that matches the use case.
3. Validate IDs, recipient email, subject, template, or content input before issuing a mutation.
4. Surface CLI limitations directly instead of inventing a workaround.
5. If the workflow is unsupported in the CLI, say whether the next-best path is the Sequenzy dashboard or direct API use, and offer to report the gap with `sequenzy feedback "..." --category missing_capability` (MCP: `submit_feedback`). Before sending feedback, show the user the exact message, category, and context you plan to send, leave out private account, subscriber, contact, and campaign details, and send only after the user approves.
6. When you create, inspect, or schedule a campaign, sequence, template, or company and the user may want to review/edit it, surface the dashboard URL from `url`, `previewUrl`, or `appUrls` in the tool/CLI output. If needed, generate it with `sequenzy urls` or MCP `get_app_urls`.
7. Destructive commands (`delete`, `delete-variant`, `cancel-invitation`, `revoke`, `suppressions remove`, and similar) prompt for confirmation. Before running one, tell the user the exact action and resource (ID and name) and get explicit approval for that specific operation. Only after that approval may you pass `--yes` (or `-y`), which non-TTY agent and CI runs need to skip the prompt. Never use `--yes` to bypass a confirmation the user has not given.
8. Treat API keys, webhook signing secrets, and other one-time credentials as sensitive output. Do not paste raw secret values into chat, logs, tickets, or public transcripts. Capture them to a user-approved secure destination such as a password manager, secret store, encrypted file, or local `.env` file outside version control; otherwise redact the value and report only where it was saved plus a short fingerprint.
9. Call out implementation caveats that matter operationally, such as `whoami` using cached local auth state, sequence creation supporting both `--goal` and explicit step modes, explicit discount steps requiring Stripe before activation, generated sequences being capped at 10 emails, `campaigns test` being a stubbed success path in the current backend, and conditional email content requiring block JSON rather than raw HTML.

## Dashboard URLs

Use `SEQUENZY_APP_URL` as the dashboard base when it is set; otherwise default to `https://sequenzy.com`.

Prefer actual URLs returned by the CLI/MCP result:

- sequence editor: `/dashboard/company/{companyId}/sequences/{sequenceId}`
- campaign editor: `/dashboard/company/{companyId}/campaign/{campaignId}`
- campaign preview/review: `/dashboard/company/{companyId}/campaign/{campaignId}?step=review`
- template/email editor: `/dashboard/company/{companyId}/emails/{emailId}`
- settings: `/dashboard/company/{companyId}/settings`
- settings tab: `/dashboard/company/{companyId}/settings?tab={tab}`

Useful settings tabs include `domain`, `tracking`, `localization`, `integrations`, `events`, `tags`, `goals`, `sync-rules`, `api-keys`, `widgets`, and `team`.

## References

- [references/command-reference.md](references/command-reference.md): exact command shapes, env vars, behavior, and caveats.
- [references/use-cases.md](references/use-cases.md): decision trees and examples for the most common agent tasks.
