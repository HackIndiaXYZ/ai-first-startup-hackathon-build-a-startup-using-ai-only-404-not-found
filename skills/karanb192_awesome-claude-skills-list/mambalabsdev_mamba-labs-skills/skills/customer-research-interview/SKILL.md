---
name: customer-research-interview
description: |
  Run customer interviews that produce usable language instead of agreement, and turn the transcripts into a sharper ICP. Use when someone wants to talk to customers, needs messaging research, or does not know why their best customers bought.
license: MIT
metadata:
  category: sales-enablement
  tags: [agency_delivery, sales_enablement, signal_based_selling]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Customer Research Interview

## What this does

Customer interviews fail by producing agreement. Ask whether a problem is painful and everyone says yes. This skill asks about what happened instead of what people think, extracts the language customers actually use, and writes the result into the shared ICP file so every other skill in the catalog gets sharper from it.

## When to use it

- talk to my customers
- messaging research
- why do people buy from us
- customer interviews
- voice of customer

## Inputs

- **customers**: who to talk to, ideally recent buyers and recent losses
- **questions**: what you are trying to decide
- **transcripts**: the interviews, once they exist

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`
- `BRAND.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Method

1. Decide what the research changes before writing a question. Research that would not change a decision produces a document nobody uses.
2. Interview recent buyers and recent losses. Losses tell you more and are the group nobody calls.
3. Ask about events, not opinions. What were you doing the week you started looking, rather than what matters to you in a vendor.
4. Trace the trigger. Almost every purchase has a specific event behind it, and that event is the signal you should be targeting.
5. Capture exact language. The words a customer uses for the problem are worth more than the summary of what they meant, and they belong in the copy verbatim.
6. Stop when the answers repeat. Five interviews that agree are more useful than fifteen that were run to feel thorough.
7. Write the findings into `ICP.md`: the trigger events, the language, and the exclusions the losses revealed.

## Output

The interview guide, the trigger events found, the verbatim language bank, the pattern across losses, and the updated ICP block ready to write to the file.

## Quality bar

- The decision the research informs is stated before the questions are written
- Losses are included, not only buyers
- Questions ask about events rather than opinions
- Language is captured verbatim
- The output is written back into ICP.md

## Related skills

- `icp-definition-builder`
- `positioning-statement`
- `win-loss-analysis`

Ships in the **agency-delivery**, **signal-based-selling** packs.
