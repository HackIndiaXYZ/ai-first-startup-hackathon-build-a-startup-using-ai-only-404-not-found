---
name: Dunning email
description: Use when a payment failed or an invoice is past due and you want a personal note, not the processor's robot. Three short emails, subject lines, a reply plan.
runs_in: anywhere
variables:
  - name: product_name
    description: What you call the product in emails to customers
    example: "Northwind Reports"
  - name: owner_name
    description: The name the emails end with
    example: "Sam"
  - name: billing_portal_url
    description: The link where a customer can update their card, usually the customer portal from your payment processor
    example: "the customer portal link from your payment processor"
---

# Dunning email

You are writing the personal version of the email the payment processor already sent. Theirs said "Your payment has failed." Yours sounds like a person who noticed and wants to help. Work from what the user pastes: who the customer is, the plan and price, when the charge failed, how many attempts, and anything the customer has said.

## Before drafting

Check two things.

Did they also ask to cancel? Then this is a save conversation, not a billing one. Use the save-play skill instead.

Has the invoice been failing for weeks while the account stayed active? Then the first email is already late. Skip the gentle opener and start at the day 5 tone, but send it as the first note.

## The sequence

Three emails. Each one fits on a phone screen without scrolling. None of them threatens. The link is {{billing_portal_url}} every time, and it's the only link.

Day 1. The heads-up.

Subject: Quick heads-up on your {{product_name}} bill

Say the card was declined on the latest renewal. Say it's usually an expired card or a hold from the bank, nothing dramatic. Give the link and say it takes about thirty seconds. Close with: if anything else is going on, reply and tell me.

Day 5. Still open.

Subject: Still seeing that failed payment

Say you noticed it hasn't gone through yet. If the user confirms access is still on, say so, since it takes the pressure off. Same link. When there's a second way to pay (invoice, bank transfer), offer it here. Ask one question: is it the card, or something else?

Day 12. The last one.

Subject: Last note about the {{product_name}} bill

Say this is the last email about it. State what happens next and when, as a plain fact: access pauses on a date, or you'll pause the account yourself so they stop getting charged for something they aren't using. Same link. Leave the door open: reply and it's sorted in a minute.

## If they reply

- "Fixed it." Thank them in one line. Stop the sequence.
- "New card's coming, give me a week." Say yes, name the date you'll check back, and stop the sequence until then.
- "I meant to cancel." Cancel it cleanly. Don't chase the failed invoice. Then use the exit-interview skill.
- "I wasn't getting much out of it." That's a save conversation. Switch to the save-play skill with what they said.
- Annoyed about the processor's emails. Apologize once, plainly. Don't defend the robot.

## Rules

- No "final notice", no "account suspension", no capital letters for emphasis, no countdown.
- Never say access is still on unless the user has confirmed it.
- Each email ends with {{owner_name}}. Not "the billing team".
- One link. No attached invoice, no PDF, no second link to a help article.
- Write all three at once so the user can see the arc, and label each with its day.
- Drafts only. The user sends day 1, and decides on the day whether 5 and 12 go out at all.
