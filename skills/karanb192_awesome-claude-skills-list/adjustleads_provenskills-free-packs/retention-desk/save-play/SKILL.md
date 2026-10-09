---
name: Save play
description: Use when a customer is about to cancel, went quiet, or asked to downgrade, and you need to decide what to say. Says why they are churning and drafts the note.
runs_in: anywhere
variables:
  - name: product_name
    description: What you call the product in emails to customers
    example: "Northwind Reports"
  - name: owner_name
    description: The name the note ends with, usually the founder or whoever owns the account
    example: "Sam"
  - name: tone_notes
    description: How you write to customers, in your own words, or a short sample of a real email you sent
    example: "Short and plain. Contractions. No exclamation points. I sign with my first name."
---

# Save play

You are deciding what to say to one customer who might leave. You work only from what the user pastes. There is no database to pull from and no export to read. If the paste is thin, ask once for the missing facts below, then work with whatever comes back.

## What to collect

The facts that change the answer:

- Plan and price, plus how long they have been a customer
- Payment status: paid, failed, past due, and for how long
- Usage notes: last login, what they use, what they stopped using, anything that broke
- What they said, in their words: the cancel reason, the downgrade ask, the last few messages
- Anything the user already offered them

## Step 1. Name the signal

Read references/churn-signals.md and pick exactly one: set to cancel, past due, silently dying, low product value, or no signal. Quote the fact that decided it. When two signals fit, the one with the earlier deadline wins. A cancel date beats a failing card. A failing card beats low usage.

## Step 2. Pick one tactic

One offer, never a menu. The customer should be able to say yes in one word.

- Swap. They use the product, but the part they bought is the wrong part. Move them onto what fits at the same bill.
- Pause. They are between projects, in a slow season, or buried. Thirty days off the clock, nothing lost, same setup when they come back.
- Downgrade. The price is wrong for how much they use. Put them on the smaller plan yourself before they cancel to get there.
- Concierge call. They never got set up. Offer twenty minutes of your time to do it with them. Only for accounts where setup is the whole problem.
- Discount. Last resort. Only when the product delivered and the single objection is price. Cap it and put a date on it. Never lead with it.
- Let go. They closed, moved, or the product is for someone else. Thank them, make leaving easy, and ask the exit question from the exit-interview skill.

Two rules for the pick. Past due is a billing problem, so it gets the dunning-email skill and no save offer. A customer who never used the product gets setup help or a pause, never a discount, because you would be paying them to keep ignoring it.

## Step 3. Draft the note

Write it the way the user writes: {{tone_notes}}. The product is {{product_name}}. End with {{owner_name}} and nothing after it.

- First line is the specific thing you noticed about their account, stated plainly. No "hope you're well."
- Then the offer, in one or two sentences.
- No guilt, no "we value your business", no feature pitch, no second offer.
- Close with a question they can answer in a word.
- Under 120 words.

## Output

1. The signal, with the fact that decided it
2. The tactic, with one sentence on why it beats the next best
3. The note in a code block, ready to paste
4. When to follow up if they don't answer, and what the follow-up says

## Rules

- The diagnosis is a draft, not a verdict. If the facts point away from the obvious tactic, say so and pick differently.
- Never invent a usage number, a quote, or a date. A missing fact gets named as missing.
- A customer whose card failed did not decide to leave. Don't write to them as if they did.
- If the user pastes several customers, do them one at a time. Each one is a separate case.
- You draft. The user reads it and sends it. Never send anything.
