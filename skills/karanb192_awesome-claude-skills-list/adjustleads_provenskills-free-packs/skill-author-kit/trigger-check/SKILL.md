---
name: Trigger check
description: Use when a skill won't fire, or someone asks if a description matches what buyers type. Tests eight buyer phrasings and rewrites the description till they hit.
runs_in: anywhere
---

# Trigger check

You are testing whether a skill will fire. A buyer's AI app reads only the description when it decides which skill to use. It never sees the body until after that decision. So a description that misses the buyer's words is the same as no skill at all, and this test is the difference between a skill that gets used and one that sits in the catalog.

## What to collect first

You need the description. If the user pasted a whole SKILL.md, take it from the frontmatter and read the body so you know what the skill does. If they pasted only the description, ask in one line what the skill produces, then proceed.

## Step 1, write eight phrasings

Write eight things a buyer would type or paste into a chat app when they need this skill. Write them the way people type, short and in their own words, not the way a seller describes the feature. Mix them:

- Two that name the task outright ("write the follow-up email from this meeting").
- Another two that describe the situation without naming the task ("here are my notes from the call, what did we agree to").
- Two that paste something with a short ask on top ("[notes] recap this for the team").
- A lazy one, five words or fewer ("recap").
- One near miss from an adjacent moment that should not fire this skill ("draft the agenda for tomorrow's meeting" for a follow-up skill).

Number them 1 to 8 and mark the near miss.

## Step 2, score the current description

For each phrasing, decide whether the description catches it. Judge the way an AI app would: does the description share the situation's nouns and verbs with the phrasing, or a plain synonym? Exact string matches are not required, and a shared topic word is not enough on its own.

Show the score as a list: the number, catch or miss, and the words that overlap or the words that are missing. The near miss should be a miss. If it catches, the description is too broad.

## Step 3, rewrite

Rewrite the description until at least seven of the eight catch and the near miss does not. Rules for the rewrite:

- Start with "Use when".
- Name the moment first: what the buyer has in hand and what they're asking for, in the buyer's words. Fold in the nouns from the misses.
- Finish with one clause on what the skill does, so the AI app can tell this skill from a neighbor.
- One line, under 160 characters when you can, never over 300. No AI vendor names.
- No synonym piles. "Recap, summary, summarize, wrap-up, digest" reads as spam and fires on everything. Pick the two or three words buyers use most.

Re-score after each rewrite. Stop after three passes and say what still misses if anything does.

## Step 4, hand it over

Give the user the final description with its character count, the before and after scores, and two lines on what you changed and why. If the near miss kept catching, say which word to cut and what it costs.

## Rules

- Never widen the description past what the body does. A skill that fires and then can't deliver is worse than one that never fires.
- If the body does something the description never mentions, say so. Either the description grows a clause or the body shrinks.
- Keep the user's own phrasing where it already works. Do not rewrite for style.
