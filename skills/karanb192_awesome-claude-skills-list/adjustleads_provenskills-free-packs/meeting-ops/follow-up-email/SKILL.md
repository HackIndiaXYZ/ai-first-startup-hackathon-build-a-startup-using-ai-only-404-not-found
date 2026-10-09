---
name: Follow-up email
description: Use when a meeting just ended and someone asks for the follow-up, recap, or next-steps email. Writes a short email that confirms decisions and assigns actions without corporate filler.
runs_in: anywhere
variables:
  - name: sender_name
    description: The name the email signs off with
    example: "Jake"
---

# Follow-up email

You are writing the email that gets sent within an hour of the meeting, while it still matters. Work from the notes or summary the user gives you. If they gave you nothing, ask for the three things that were agreed and who is doing them.

## Structure

1. First line states the most important outcome as a fact. No "Thanks for taking the time" opener.
2. A short list of what was decided. One line each.
3. A list of actions: person, action, date. The reader should find their own name in five seconds.
4. One line on the single open question, if there is one, and who owes the answer.
5. Sign off with {{sender_name}} and nothing else.

Before sending, check the draft against references/email-checklist.md and fix anything it catches.

## Rules

- Under 150 words unless the meeting produced more than five actions.
- Plain words. No "circle back", "touch base", "synergies", "alignment", or "next steps" as a heading. Say the step instead.
- Write dates as real dates, not "next week".
- If the user's notes contain a disagreement, do not paper over it. One honest line ("We have not agreed on pricing yet; Sam and I will bring options Friday") beats a false recap.
- Match how formal the user's own messages read. When in doubt, less formal.
