---
name: project-planning-journaling
description: Scope a new project (or resume one) and set up a living, resumable documentation journal for it, including a routine weekly health check, not just updates triggered by commits. Use at the start of any project, before writing code, to ask about project type, Git repo status, short/long-term goals, and whether it should stay public/open-source or become a private product later. Also use when someone wants to document what has been done, wants a changelog or decision log, needs to resume work from a prior session without re-reading chat history, wants docs kept current after every commit, or wants a scheduled check that links and cited references are still live and reputable. Trigger for phrases like "let's plan this project", "set up a project journal", "document what we've done", "where did we leave off", or "set up a weekly check on this project" — even without the word "skill".
---

# Project Planning & Journaling

Help the developer scope a project properly before work starts, then create and
continuously maintain a living documentation/journal system that captures everything
done together — decisions, code, commits — so any new session can resume instantly from
`project-journal/README.md` alone, with no need to scroll back through chat history.

## Step 0 — Project intake (ask before anything else)

Before touching code or docs, ask the developer:

1. **Scope & type** — what is this (prototype / internal tool / library / SaaS product /
   learning project)? Who is it for?
2. **Repo status** — does a Git repo already exist for this?
   - If yes: confirm remote, current branch, visibility.
   - If no: propose a repo name (kebab-case, matches the project's purpose), a visibility
     (public/private), and a license.
3. **Timeline** — what's the short-term goal (e.g. working MVP by X) vs the long-term
   vision (e.g. scale to N users, become a paid product)?
4. **Market/product path** — is this meant to stay open-source/public indefinitely, or
   could it later be forked to a private branch/repo, developed separately, and pitched
   as a standalone product? Note the decision criteria (proprietary IP, licensing,
   timing) so it can be revisited later.
5. **Development style** — pick one:
   - **Spec-first** — full plan written and agreed before coding starts.
   - **Interactive/iterative** — flexible, the plan evolves as work goes, the journal
     captures decisions after the fact.
   - **Hybrid** — milestone-based plan, iterate freely within each milestone.
6. **Review cadence** — how often should the project get a routine health check (see
   Step 6)? Default to **weekly** if the developer has no preference.

Record the answers in `README.md` under a "Project Scope & Repo Info" section (name,
type, repo, visibility, license, short/long-term goals, product path, chosen dev style,
review cadence) — this becomes the reference point for every later planning and
journaling step.

## Step 1 — Review full history

Go through the entire conversation history and the project's git log from the very
beginning. Reconstruct: the original idea and brainstorming, key decisions and the
reasoning behind them, the developer's feedback and how it was acted on, the steps taken
in order, every code snippet/file proposed (whether or not it was ultimately kept), every
commit and push made (with hashes, messages, dates), and where the project currently
stands.

## Step 2 — Folder structure

Create a dedicated top-level folder, e.g. `/project-journal/`, separate from the source
code, containing:
- `README.md` — the main index/dashboard (see format below)
- `decisions/` — one short file per major decision, if a decision needs more than a
  paragraph
- `snippets/` — every code example discussed, saved as real files with proper extensions
  and descriptive names (not inline in the markdown), referenced from README.md via
  relative markdown links
- `sessions/` — optional, one file per work session/date if useful for history

## Step 3 — README.md format requirements

- Write in plain, simple language — no jargon, no filler, no long paragraphs.
- Prefer tables and Mermaid diagrams over prose wherever there's a list, comparison,
  flow, sequence, or architecture to show.
- Structure content under clear headings, title-style, skimmable in seconds.
- Use a checklist with checkboxes (`- [x]` / `- [ ]`) for every milestone/step, so
  progress is visually trackable and stays accurate as the project moves forward.
- For anything that needs more depth, use collapsible sections:
  `<details><summary>Short label</summary> ...longer explanation... </details>`
  so the top-level view stays short and details are opt-in.
- Include these sections at minimum:
  1. Project Scope & Repo Info (type, repo name, visibility, license, short/long-term
     goals, market/product path, chosen dev style, review cadence — from Step 0)
  2. Project Overview (what & why, 2-3 lines)
  3. Roadmap / Milestones (checklist, chronological)
  4. Key Decisions Log (table: decision | reasoning | date)
  5. Architecture / How it works (Mermaid diagram)
  6. Code Changes (table linking to files in `snippets/` and/or real commits)
  7. Git History (table: date | commit hash | message | pushed y/n)
  8. Current Status (what's done, what's in progress)
  9. Next Steps / Open Questions (checklist + short notes)

## Step 4 — Resumability

Structure everything so that in a brand-new session, the developer can open
`/project-journal/README.md` and immediately know exactly where things were left off and
what to do next — without needing to scroll through old chat history.

## Step 5 — Ongoing maintenance

From this point on, treat this folder as a living document: after any meaningful step,
decision, commit, or push, update the relevant sections (roadmap checkboxes, decisions
log, git history, current status, next steps) automatically, without waiting to be asked.
If a change affects scope, timeline, or the market/product path decided in Step 0, update
the "Project Scope & Repo Info" section too.

This is event-triggered — it only catches what happens while someone's watching. Step 6
covers what happens on a calendar, whether or not anyone touches the project that week.

## Step 6 — Routine review

Event-triggered updates (Step 5) don't catch rot: a link that quietly dies, a decision
that's been silently superseded, a roadmap item nobody's touched in months, or — if the
project cites external sources the way this skill's own `references/research.md` does —
a source that's stopped being the most current or reputable choice. Set up a routine
check at the cadence chosen in Step 0 (weekly by default) that:

1. **Re-verifies every link** in the journal and README(s) still resolves.
2. **Re-confirms decisions still hold** — nothing in the decisions log has been silently
   overridden by a later, undocumented choice.
3. **Flags stale roadmap items** — anything in "Next Steps / Open Questions" untouched
   since the last routine check, surfaced for the developer to confirm, drop, or reprioritize.
4. **Re-checks cited sources, if any** — for a project that references external
   standards/research, confirm each is still independently reputable (still cited or
   adopted elsewhere, no newer edition superseding it), not just still online.

If the project has CI (GitHub Actions or equivalent), offer to automate what's mechanical
here — a scheduled link check, and a scheduled reminder issue for the parts that need
judgment — rather than relying on memory. This repository's own
[`.github/workflows/check-links.yml`](../.github/workflows/check-links.yml) and
[`.github/workflows/reference-review.yml`](../.github/workflows/reference-review.yml) are
a working template: adapt the file list in `scripts/check_links.py` and the checklist in
the reminder issue to the target project. If there's no CI, do the routine check manually
at the agreed cadence instead — don't skip it for lack of automation.

Start by asking the Step 0 questions if they haven't been answered yet, then generate the
full initial version of the documentation based on everything done so far.

`references/research.md` holds the sources and reasoning behind these steps — read it
when the developer asks *why* a step exists, or when looking for ways to extend this
skill further.
