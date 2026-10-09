---
name: roadmap-interview
description: Run a short product-discovery interview with a user of Kochab to surface what they actually need, then turn it into structured roadmap input. Use when someone says "interview me about features," "run the roadmap interview," "I have feedback on the tool," "what should this tool do next," or when a maintainer wants to gather feature ideas from a user. Produces per-user notes plus an append to a shared feature backlog, so requests that recur across users rise to the top.
---

# Roadmap Interview

A structured, non-leading interview that pulls real needs out of a user and turns them into roadmap input. The goal is not a wish list. It is to understand the person's actual job search well enough to know which features would matter and which would just look good.

Run it in fifteen to twenty minutes. Respect the person's time.

## Interviewing principles (these matter more than the questions)

- **Ask about the real and recent, not the hypothetical.** "Walk me through the last job you applied to" beats "what features do you want." People describe their needs accurately when telling a true story and inaccurately when speculating.
- **Do not lead, and do not pitch.** Never describe a feature and ask if they would like it; almost everyone says yes. Ask what they did, where they got stuck, and what they wished had happened. Let the feature idea come from the friction.
- **Separate the stated want from the underlying need.** When they ask for a thing, ask why, twice. "I want it to auto-apply" often means "I am exhausted by the repetition," which points at a very different, and better, feature.
- **Follow the energy.** When someone gets animated or frustrated, stop and dig there. That is where the real signal is.
- **One question at a time.** Let them finish. Silence is fine.
- **Capture their words.** A vivid verbatim quote is worth more than your paraphrase.
- **Welcome disagreement.** If they think something you built is useless, that is the most valuable thing they can tell you. Do not defend it.

## The interview

Move through these sections in order, but adapt. Skip what does not apply; dig where it does.

### 1. Grounding
- Where are you in your job search right now, and what does a normal week of it look like?
- What is the search for: a similar role, a change, a first job in a field, a move up?

### 2. The last real instance
- Walk me through the last role you applied to, start to finish. What did you do first?
- Where did it get tedious, confusing, or discouraging?
- What did you do by hand that you wished something would do for you? What did you skip because it was too much work?

### 3. Current experience of the tool (for existing users)
- What have you used it for, and what did it actually do for you?
- What worked well enough that you would miss it?
- What fell short, annoyed you, or made you not trust it?
- Was there a moment you almost stopped using it? What happened?

### 4. Unmet need
- If the tool could do one more thing for you, what would move the needle most?
- Then, for whatever they say: why does that matter? And why does *that* matter? (Get to the need under the request.)
- What would make this a tool you would tell another job seeker they have to use?

### 5. Reactions to what is planned
Read them the current roadmap items in plain language (from `ROADMAP.md`), one at a time. For each:
- Does this matter to you? Would you use it?
- What is missing from this list that you expected to see?
- Is anything here that you would not bother with?

### 6. Prioritization
- Of everything we have discussed, what are the two or three things that would matter most to you, in order?
- Which one would you rely on day to day, versus which is nice to have?

### 7. Trust and dealbreakers
- What would this tool have to do, or never do, for you to trust it with your real search?
- Is there anything that would make you walk away from it entirely?

### 8. Close
- Anything I did not ask about that I should have?
- Thank them. Tell them where their input goes.

## Output

Write two things into the working folder.

**Per-user notes:** `Roadmap_Input_<name-or-id>_<YYYY-MM-DD>.md`, using `references/output_template.md`. Record pains, requests paired with the underlying need, priorities, trust conditions, and verbatim quotes. Keep stated-want and underlying-need clearly distinct.

**Shared backlog:** the canonical backlog is `docs/BACKLOG.md` in the Kochab repo. When running inside the repo, fold each distinct request into it using that file's Intake steps: write the need (not just the want), set Signal from how strongly and how often it surfaced, and raise an existing row's signal instead of adding a duplicate. When running outside the repo, write a local `Feature_Backlog_<date>.md` (columns: Feature or need | Underlying need | Times raised | Priority signal | Status) and fold it into `docs/BACKLOG.md` on return. A need that recurs across interviews is the strongest roadmap signal there is; the backlog is how that surfaces. Keep personal details out of the backlog; only the anonymized need lands there.

## Guardrails

- Do not sell the tool during the interview. You are listening, not converting.
- Record what they said, including criticism, not a flattering version of it.
- Mark every request as stated-want versus underlying-need. The need is what goes on the roadmap; the want is a clue to it.
- Do not promise that a requested feature will be built. Say it will be considered, honestly.
- Keep personal or sensitive details out of the shared backlog; those stay in the per-user notes, and the backlog carries only the anonymized need.
