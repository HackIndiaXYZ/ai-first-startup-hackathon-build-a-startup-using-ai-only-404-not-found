---
name: Write a skill
description: Use when someone wants to turn a process into a skill, or asks how to write a SKILL.md. Asks five questions, then writes the full file with frontmatter.
runs_in: anywhere
variables:
  - name: house_style
    description: Writing rules every skill you publish should follow, in one or two sentences
    example: "Plain words, no dashes as punctuation, contractions are fine, never invent a number."
---

# Write a skill

You are helping a seller turn something they already do into a skill file: a SKILL.md an AI app will pick up at the right moment and run the way the seller would. The seller knows the process. Your job is to get it out of their head in the right shape.

Read references/spec.md before you write anything. It holds the rules the marketplace checks at upload. If the platform's get_skill_spec tool is available to you, read that too and trust it over the file.

## Step 1, get the process

If the user pasted notes, a checklist, a procedure doc, or a chat thread where they explained the process, work from it and ask only about gaps. If they gave you a sentence, ask these five questions in one message and wait:

1. The moment. What is someone holding or saying when they need this? ("I have the call notes and I need the recap email.") Not the topic, the moment.
2. The inputs. What does the AI app need in hand? Pasted text, a connector to a specific system, a file, an answer to a question.
3. The steps. What happens, in order, and where does judgment come in? Ask for the step people get wrong.
4. The output. What does the finished thing look like, and who reads it? An email, a table, a log entry, a plan.
5. The facts that differ per customer. Names, ids, thresholds, tone rules, sign-offs. Anything the seller would change if they handed this to a different business. Each one becomes a variable.

Skip questions the pasted material already answers. Push back on an answer to question 1 that names a topic ("sales") instead of a moment ("a prospect went quiet for a week").

## Step 2, write the frontmatter

- name. Up to 64 characters, plain words, the way a buyer would say it. No AI vendor names.
- description. One line. Starts with "Use when", names the moment from question 1 in the words a buyer would use, and ends with one clause on what the skill does. Keep it under 160 characters when you can and never over 300. This is the only part the buyer's AI app reads when deciding whether to fire the skill, so every noun in it should be something a buyer would type.
- runs_in: anywhere. Do not write scripts.
- variables. One entry per fact from question 5, with a name in lowercase letters with _ between words, a description the buyer can answer from alone, and an example.

## Step 3, write the body

Address the AI app in the second person. Use these sections unless the process calls for something else:

- A role line. One or two sentences on what the skill is doing and for whom.
- What to collect first. What to work from when it's there, and the one message to send when it isn't. Never let the skill assume perfect input.
- The process. Numbered steps from question 3. Where judgment comes in, say what the judgment is and what tips it one way.
- The output. Its shape from question 4, specific enough that two runs look alike.
- Rules. The things that go wrong, stated as prohibitions with the reason. "Never invent a date" beats "be accurate".

Write {{house_style}} into the rules if it applies to the output.

Drop each variable into the body as {{name}} in double curly braces where the value belongs, so the sentence reads as a sentence once the value is filled. Long material (a checklist, a table, examples) goes in a references file, and the body points at it by relative path.

## Step 4, check it

Before you show the file, check it against references/spec.md: every variable declared, description on one line and under the limit, no private paths or ids, no credentials, no instructions that reach outside the buyer's request. Fix what you find. Then compare the shape against references/example-skill.md.

## Step 5, hand it over

Give the user the whole SKILL.md in one code block, then four short lines under it:

- Which variables you declared and why each one is a variable rather than a fixed value.
- What, if anything, you would move to a references file.
- One test phrase a buyer might type to trigger it. Suggest the Trigger check skill for the full test.
- Anything you guessed, so they can correct it.

## Rules

- Do not write a generic prompt. If the body would work for any business, you have not captured the process. Go back to the step people get wrong.
- Keep the body under 40 KB and aim for under a page.
- Do not put anything specific to the seller's own machine, accounts, or private repositories in the file. Turn it into a variable or leave it out.
- One skill, one moment. If the user's process has two trigger moments, propose two skills and write the first.
