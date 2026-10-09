---
name: support-ticket-theme-miner-ecommerce
description: Analyzes e-commerce support ticket exports, chat transcripts, email samples, and help center content to identify repeated questions, policy confusion, product information gaps, and automation candidates. Use when the same questions keep arriving, support load grows faster than orders, or the store wants to know which page or policy is generating its own tickets.
---

# Support Ticket Theme Miner - E-commerce

## Use this skill when

The user wants to turn support tickets into store improvements.

Common requests:

- "Analyze these support tickets."
- "What questions keep repeating?"
- "What should we add to product pages or FAQ?"
- "Find automation candidates for support."

## Required input

Minimum useful input:

- Support tickets, chats, or email samples.
- Time period and channel.
- Tags or categories if available.
- Help center, policy, or FAQ links if available.

Optional:

- Product page URLs.
- Order status tags.
- Resolution time.
- Customer sentiment.
- Refund or return outcomes.

## Before analysis

1. Confirm whether tickets are pre-purchase, post-purchase, support, returns, or mixed.
2. Remove or avoid exposing sensitive customer data where possible.
3. Do not recommend full automation before identifying theme quality.
4. Keep escalation topics human.

## Analysis workflow

1. Cluster tickets by theme:
   - order status
   - shipping time
   - returns/exchanges
   - sizing/fit
   - compatibility
   - product usage
   - discount/payment issues
   - damaged/wrong item
   - policy confusion
2. Identify repeated questions and root information gaps.
3. Map themes to fixes:
   - product page
   - checkout
   - help center
   - transactional email
   - support macro
   - automation candidate
   - human escalation
4. Prioritize by frequency, buyer impact, and operational load.
5. Give every theme a denominator. A theme is a share of total tickets in a stated period, not a raw count, otherwise a busy month reads as a new problem and a quiet one hides an old one.

## Decision and evidence standard

Every finding should include:

- Evidence tag: `export`, `screenshot`, `url`, `review_cluster`, `support_ticket`, `return_reason`, `policy`, `feed_diagnostics`, `margin_csv`, `inventory_export`, `hypothesis`, or `needs_data`.
- Severity: low, medium, high, or critical.
- Confidence: low, medium, or high.
- Business impact: revenue, margin, cashflow, retention, conversion, support_load, or risk.
- Effort: XS, S, M, or L.
- Owner decision: do_now, test, investigate, monitor, ignore, or approval_needed.

If the evidence is weak, mark the finding as `hypothesis` or `needs_data` and lower confidence.

## Output format

### Support verdict

Top repeated themes and the likely store-side causes.

### Theme table

| Theme | Frequency signal | Likely cause | Recommended fix | Automation fit |
|---|---|---|---|---|

### Content updates

FAQ, PDP, policy, and help center updates to consider.

### Human escalation topics

Issues that should stay with a human agent.

## Example input and output

Input:

- support ticket export
- chat transcripts
- policy links
- affected product URLs

Good output excerpt:

| Finding | Evidence | Severity | Confidence | Business impact | Effort | Owner decision |
|---|---|---|---|---|---|---|
| Customers repeatedly ask whether Product A fits Product B | `support_ticket`, `url` | high | high | conversion/support_load | S | do_now |
| Refund edge cases need human escalation | `support_ticket`, `policy` | medium | high | risk/support_load | S | approval_needed |

What not to do yet: automate refunds, cancellations, or sensitive complaints by default.

## Guardrails

- Do not expose personal customer data.
- Do not write final support macros unless policy and tone are provided.
- Do not automate refunds, cancellations, or sensitive complaints by default.
- Do not treat high frequency as proof that customers are wrong.
- Do not ignore product or fulfillment root causes.
