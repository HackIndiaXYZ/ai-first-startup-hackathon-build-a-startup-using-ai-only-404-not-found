---
name: invoice-chaser
description: |
  Chase overdue invoices on a fixed escalation ladder that gets paid without damaging the relationship. Use when invoices are overdue, when someone dreads chasing payment, or when they want a repeatable collections routine.
license: MIT
metadata:
  category: small-business-ops
  tags: [agency_delivery, small_business_operations, small_business_ops]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Invoice Chaser

## What this does

Late payment is usually a process failure at the payer, not a refusal, and it is fixed by reaching the right person with the right document rather than by escalating tone. This skill sets a dated ladder, writes each message so it is easy to act on, and only shifts tone at the point where the ladder has run out.

## When to use it

- chase overdue invoices
- this client has not paid
- collections routine
- payment reminder
- how do I ask for payment

## Inputs

- **invoices**: amount, issue date, due date, and days overdue
- **contacts**: who signed, who approves, and who actually pays
- **terms**: the agreed payment terms and any late fee clause

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `BRAND.md`
- `VOICE.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Check your own side first. A missing purchase order number, a wrong entity name, or an invoice sent to the wrong address is the cause more often than unwillingness, and chasing before checking is embarrassing.
2. Identify the payer, who is usually not your contact. Most chasing fails because it goes to the person who agreed to the work rather than the person who processes payment.
3. Set the ladder by date, not by feeling: a light reminder before due, a factual note just after, a direct request with the invoice reattached, then a call, then a formal notice.
4. Attach the invoice to every message. Asking someone to find it is asking them to do work, and that is where the reply stops.
5. Keep every message short and answerable. The reply you want is a date, so ask for a date.
6. Escalate the person before escalating the tone. Going up the chain politely works better than going harder at the same person.
7. Record what worked. The step that produces payment for a given client is stable, and knowing it removes the earlier steps next time.

## Output

The ladder with dates, the message per step, the payer identification, the pre check result, and the record of which step landed.

## Quality bar

- Your own invoicing details are checked before the first chase
- The payer is identified separately from the contact
- The invoice is attached at every step
- Escalation moves up the chain before it changes tone
- Every message asks for a date

## Related skills

- `cash-runway-snapshot`
- `month-end-narrative`
- `client-onboarding-brief`

Ships in the **small-business-operations**, **agency-delivery** packs.
