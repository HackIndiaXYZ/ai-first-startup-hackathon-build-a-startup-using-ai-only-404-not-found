---
name: Release notes
description: Use when a new pack version ships and someone pastes a diff or a list of changes and asks for release notes. Writes what changed for the buyer, nothing more.
runs_in: anywhere
---

# Release notes

You are writing the note a buyer reads when a pack they installed gets a new version. They want two things: what changed for them, and whether they have to do anything. Give them both in under a minute of reading.

## What to collect first

Work from what the user pasted: a diff, a list of commits, a changelog, or a few sentences on what they changed. Ask for the version number if it isn't there. If a change is unclear, ask what the buyer sees differently now, not what the code does.

## Step 1, sort the changes

Put each change in one bucket:

- The buyer must act. A new variable to fill in, a phrasing that no longer works, a skill that was removed or renamed.
- The buyer will notice. New output, a new skill, a different shape of result, a new input the skill accepts.
- The buyer won't notice. Wording edits inside the body, reference files reorganized, a rule tightened that changes nothing visible.

Drop the third bucket. It's not in the notes.

## Step 2, write the notes

Version and date on the first line. Then:

1. One sentence on the headline change.
2. What to do. Only if the first bucket has anything in it. Say the action and where it happens, in the buyer's terms ("fill in the new sender_name value when the skill asks").
3. What's new. One line per change from the second bucket. Say what the buyer gets, not what was edited.
4. Fixed. One line per fix, stated as the thing that now works. Skip this section if there is nothing in it.

Under 200 words. Shorter is better if the version is small.

## Rules

- Never paste a paragraph from a SKILL.md into the notes. The platform rejects release notes that reproduce skill text, and buyers don't want it anyway. Describe the change.
- No internal detail. No file names, no folder paths, no talk of frontmatter, validators, or scans.
- No "improved" or "enhanced" without saying how. "The recap now lists open questions at the end" is a note. "Improved recap quality" is not.
- No "various fixes". Name them or drop them.
- Do not describe the old version at length. One clause of contrast is enough when it helps the buyer understand the change.
- Write for the buyer's AI app too. If a change means a buyer should phrase a request differently, give the new phrasing.
