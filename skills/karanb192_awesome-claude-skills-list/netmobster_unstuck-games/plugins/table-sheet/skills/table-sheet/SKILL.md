---
name: table-sheet
description: Build a table-side play guide for a D&D character from their D&D Beyond sheet — what each spell and feature actually does in plain English, what fits in one turn, fight playbooks, roleplay notes, and a pre-session checklist. Use when someone shares a D&D Beyond character link or asks for help playing, prepping, understanding or picking spells for their character.
---

# Table Sheet

A character sheet says a druid has Moonbeam. It does not say that Moonbeam keeps
burning for ten rounds without costing another action, that moving it costs your
whole turn, or that one spell slot per turn is a rule now. Players find this out
by losing a fight.

This skill turns a D&D Beyond sheet into the page that answers "what do I
actually do on my turn?" — and, on the way, catches the things that will fail at
the table, like a Revivify with no diamond in the pack.

## Step 1 — Get the character

```bash
node scripts/ddb-fetch.mjs <url-or-id> --out=character.raw.json
```

Public and link-shared sheets need nothing else. Another player's sheet returns
403, and then you need a token.

**Getting a token.** The token belongs to the person you are helping and to
their browser session. Ask them to open D&D Beyond, signed in to an account that
can see the sheet, and run this in the browser console:

```js
await (await fetch('https://auth-service.dndbeyond.com/v1/cobalt-token',
  {method:'POST', credentials:'include'})).json()
```

Pass the `token` value as `--token=...` or the `DDB_TOKEN` environment
variable. It expires quickly. **Never write it to a file, a commit, or a
message.** If you have a browser tool, the cleaner route is to fetch the JSON in
the browser and download it, which keeps the token out of the transcript
entirely.

## Step 2 — Digest it

```bash
node scripts/ddb-digest.mjs character.raw.json --out=digest.json
```

A raw sheet is several hundred kilobytes. The digest keeps abilities, saves,
skills, hit points, spells (with casting time, concentration, ritual and
components), features by level, kit, limited-use resources and the roleplay
text — and prints a **"worth checking"** list: spells prepared twice, costed
components missing from the pack, armour in the pack rather than on, resources
still spent from last session.

Read the digest. Read all of it. It is the only thing you know about this
character.

## Step 3 — Work out how they actually play

This is the part no script can do. Before writing a line of the page, answer:

- **What is their engine?** The one resource or stance the rest hangs off:
  a Stars druid's Starry Form, a Battle Master's superiority dice, a warlock's
  short-rest slots. Explain it once, properly, with the numbers.
- **What fills each part of a turn?** Movement, action, bonus action, reaction,
  and anything that persists across rounds (concentration, a stance, a summon).
  Most players do not know how many of these they have.
- **What do they do at will, with no resource spent?** Give the number. A player
  who knows their floor plays braver.
- **What is the one decision each fight?** Usually which concentration spell, or
  when to spend the big resource.
- **Where are the traps?** One spell slot per turn. Concentration does not
  stack. Components that get used up. A reaction you must call before the roll.
- **Who are they?** The personality, ideals, bonds, flaws and backstory on the
  sheet are the player's own writing. Take them seriously and build the roleplay
  section out of them, not out of generic advice.

Check anything you are unsure of against the rules the sheet itself carries —
every spell and feature comes with its own text in the raw JSON. **Do not
reconstruct rules from memory**, and say so plainly when something is a table
call for the DM rather than a rule.

## Step 4 — Build the page

Read `reference/page-spec.md` for the section order and what each section is
for, then write the HTML. If an Artifact tool is available, load the
`artifact-design` skill and publish it; otherwise write a self-contained HTML
file the player can open and keep.

Design for someone holding a phone at a table with the lights down, halfway
through a fight, with four people waiting on them.

## Step 5 — Hand it over

Give them the link, then the short version in the chat: the two or three things
that change how they play next session, and anything the "worth checking" list
turned up. Those findings are the part they will thank you for.

## House rules

- **Never republish rules text.** Rewrite every spell and feature in your own
  plain words, from the sheet you were given, for the character you were given.
  A page that pastes the books is not shippable.
- **Flag, don't fix.** It is their character. Say what you found and what you
  would do; change the sheet only if they ask.
- **Verify before asserting.** If you cannot confirm a number from the digest,
  say it needs checking on the sheet rather than guessing. Armour class is the
  usual one: D&D Beyond does maths the digest deliberately does not.
- **Plain language.** "Pick someone up from across the room as a bonus action,"
  not "ranged bonus-action single-target heal."
- **Their character data is theirs.** Keep raw sheets and digests out of any
  repo, and out of anywhere they did not ask you to put them.
