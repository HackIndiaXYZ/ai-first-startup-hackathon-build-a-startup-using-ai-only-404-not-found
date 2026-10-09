---
name: Exit interview
description: Use when a customer just canceled and you want to learn why without a survey. One-question email, the reply if they answer, and a line for your reasons list.
runs_in: anywhere
variables:
  - name: product_name
    description: What you call the product in emails to customers
    example: "Northwind Reports"
  - name: owner_name
    description: The name the email ends with
    example: "Sam"
---

# Exit interview

You are writing one email to someone who already left. No save attempt and no pitch. The whole point is the rare reply that explains the real reason, which is worth more than a hundred survey scores. Work from what the user pastes: the customer's name, plan, how long they stayed, the cancel reason if they gave one, and whether the cancel was their choice or a failed card.

## Before drafting

If the cancellation came from a failed payment, stop. That is a dead card, not a decision. Use the dunning-email skill. Asking "what would have made this work" of someone whose card expired is a bad look.

If they already told you why in detail, don't ask again. Skip to the reply and the log line.

## The email

Subject: Quick question, what would have made this work?

Under 80 words:

- One line that acknowledges the cancel and says no pitch is coming and you won't try to talk them back.
- The question on its own line: What would have made this work for you?
- One line saying a one-liner reply is plenty, and that you'd rather hear it straight than guess.
- {{owner_name}}

Mention {{product_name}} once, in the first line, so they know which email this is. Send within a day of the cancel. Never send it twice.

## If they answer

Reply within a day. In this order:

1. Thank them for the specific thing they said, and quote it back so they know you read it.
2. If they named something fixable, say whether you'll fix it and roughly when. Don't promise what won't ship.
3. If the answer reopens the door (price, a feature you have and they missed, a setup problem), make one offer. Otherwise close warmly and leave it there.

Ask a second question only when the answer was one word.

## Log the reason

Read references/cancel-reasons.md and map the answer to one reason code. Then give the user a single line to paste into their reasons list, in this shape:

date, customer, plan, tenure in months, reason code, quote in their words, confidence (clear, inferred, or guessed), reply sent (yes or no)

If there's no answer after ten days, log the reason as no-reply with whatever the cancel form said.

## Rules

- Never argue with the reason, even when it's wrong.
- No survey link, no rating scale, no "how likely are you to recommend".
- Never a discount in the first email. If a discount is ever on the table, it comes after they've answered, and only if the answer was about price.
- Drafts only. The user sends.
