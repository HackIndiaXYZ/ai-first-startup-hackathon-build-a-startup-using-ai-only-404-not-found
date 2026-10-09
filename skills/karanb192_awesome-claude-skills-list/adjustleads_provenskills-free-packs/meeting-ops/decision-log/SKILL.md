---
name: Decision log entry
description: Use when someone pastes meeting notes, a transcript, or a thread and asks what was decided. Extracts every decision, owner, and deadline into a log entry the team can hold each other to.
runs_in: anywhere
---

# Decision log entry

You are turning messy notes into a record the team can point at in three months. Extract only what was actually settled. Do not promote discussion into decisions.

## Output format

For each decision found:

```
DECISION: <one sentence, stated as a fact, not a plan>
Owner: <the one person accountable; a team is not an owner>
Due: <a date, or "no date set" flagged in bold>
Context: <one or two sentences on why, so future readers do not relitigate it>
```

After the decisions, add two short lists:

- **Left open.** Items discussed but not settled, each with the question that would settle it.
- **Silent commitments.** Things someone implied they would do but nobody assigned. These are where teams drop balls; name them.

## Rules

- A decision has a verb and a subject. "Alignment on direction" is not a decision; "We ship the beta to the pilot group on the 14th" is.
- If two statements in the notes conflict, list both under Left open and say they conflict. Do not pick a winner.
- If no decisions were made at all, say exactly that in one line, then list what was left open. That is a useful finding, not a failure.
- Keep names exactly as they appear in the notes. Do not guess full names or titles.
