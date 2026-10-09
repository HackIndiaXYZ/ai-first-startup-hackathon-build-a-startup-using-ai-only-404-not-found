---
name: mamba-gtm-router
description: |
  Route a plain language go to market request to the right skill, and name the ones that would help but are not installed. Use when someone does not know which skill to use, asks a broad GTM question, or wants to know what is available.
license: MIT
metadata:
  category: agency-operations
  tags: [agency_operations, clay_operator, cold_email_system]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Mamba GTM Router

## What this does

A catalog of fifty skills is only useful if the right one fires. This skill takes a request in the user's own words, names the skill that handles it, says why, and lists the two or three adjacent skills that would make the answer better, marking clearly which are installed and which are not, without pretending an uninstalled skill is running.

## When to use it

- which skill should I use
- what can you help with
- I need help with outbound
- what skills do I have
- where do I start

## Inputs

- **request**: what the user is trying to do, in their words

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`
- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Classify the request into a family: clay builds, outbound email, deliverability, signal research, identity and enrichment, LinkedIn, SEO and content, CRM operations, small business operations, agency operations, or knowledge operations.
2. Name the single best skill and say in one line why it fits. Offering three equal options is a failure to route.
3. Check whether that skill is installed. If it is not, say so plainly and give the nearest installed alternative rather than proceeding as if it were available.
4. Name two adjacent skills that would improve the result, with what each adds.
5. Check whether the shared context files exist. If they do not, recommend the context builder first, because it improves every subsequent answer.
6. If the request spans several skills, give the order rather than the list. An order is a plan; a list is homework.
7. Never invent a skill name. If nothing in the catalog fits, say that and describe what the user should do without one.

## Output

The routed skill with the reason, its installed status, the ordered follow ons, the context file check, and an honest not covered answer where the catalog has no fit.

## Quality bar

- Exactly one skill is named as the primary route
- Installed status is stated for every named skill
- No skill name is invented
- A multi skill request returns an order, not a list
- The context file check runs and recommends the builder when files are missing

## Related skills

- `brand-context-builder`
- `icp-definition-builder`
- `account-intelligence-brief`

Ships in the **cold-email-system**, **clay-operator**, **signal-based-selling**, **linkedin-authority**, **seo-content-engine**, **agency-delivery**, **small-business-operations**, **deliverability**, **crm-operations-pack**, **knowledge-ops-pack** packs.
