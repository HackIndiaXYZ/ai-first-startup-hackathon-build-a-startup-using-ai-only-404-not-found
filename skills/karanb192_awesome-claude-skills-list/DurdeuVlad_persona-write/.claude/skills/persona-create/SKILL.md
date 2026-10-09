---
name: persona-create
description: Help the user describe and shape a custom writing persona in plain language so it can be used with Persona Write. Grounded in stylometry, rhetoric, and personality-linguistics research.
---

# Persona Create

Use this skill when the user wants a custom writing persona instead of one of the presets, or when they want to refine an existing persona.

## Goal

Help the user describe the kind of person they want the writing to sound like — at a level of specificity that downstream skills (`persona-write`, `persona-review`, `persona-copy`) can actually use.

The output should be:
- understandable to the user in plain language
- practical (no schema-jargon dumped on a non-technical user)
- reusable across tasks
- **research-grounded** under the hood — see `../persona-write/docs/persona-theory.md`

A persona is a Booth-style implied author plus a measurable stylometric fingerprint plus a rubric profile. The user does not need to know that. The skill must.

## How to guide the user

Talk in plain language. Ask only what you cannot infer.

Useful prompts:
- how direct should the writing be?
- how technical?
- does it explain a lot, or assume the reader can keep up?
- calm, sharp, skeptical, warm, blunt, analytical — which fits?
- mechanism-first, example-first, tradeoff-first, or storyteller?
- what should it never sound like?
- (optional, for the user who knows what they want) any named author or publication this should resemble?

If the user names an author or sample text, suggest they use `/persona-copy` instead, which extracts the persona from samples directly.

## Build a custom persona using the full schema

Every section is grounded in a research tradition (see `../persona-write/docs/persona-theory.md` for citations). The user does not have to fill these out themselves — you fill them out from the conversation. You only ask questions when a section cannot be inferred.

- **Identity** — Booth's implied author. Who is talking, in two or three sentences.
- **Attention model** — what they notice and prioritise.
- **Compression model** — how much they say vs leave implied; reader-competence assumptions.
- **Stance model** — how they hold certainty (Hyland 2005 stance markers).
- **Reasoning preference** — mechanism-first / example-first / tradeoff-first / structured / narrative.
- **Rhythm model** — sentence length, energy, paragraph shape.
- **Linguistic Fingerprint** — Rhythmic Pulse, Lexical Shunts, Function Word Profile, Cognitive Bias, Social Deictics. (Burrows / LIWC.)
- **Cognitive & Psychological Profile** — Big Five linguistic-marker tendencies (Pennebaker & King 1999); cognitive style.
- **Stylometric Signature** — concrete numeric or banded targets: mean sentence length, lexical density band, TTR, punctuation profile per 1000 words, Biber dimension placement, top sentence openers. (Burrows / Biber / Halliday.)
- **Literary & Rhetorical Lineage** — three to five named exemplars or traditions to anchor the implied author.
- **Taboo patterns** — specific things this persona refuses to write. (Lanham / Williams / anti-AI patterns.)
- **Failure modes** — how the persona goes wrong when pushed too far.

Use the template in `template.md`.

## Research-backed defaults

When a user is vague, fall back to defaults grounded in research, not invented:

- **For "professional / clear" voice:** Williams' classic style — characters as subjects, verbs do work, end-emphasis.
- **For "skeptical / careful":** Hyland-balanced stance — measured hedge use, calibrated boosters, attribution norms.
- **For "warm / engaging":** higher first-person plural, reader pronouns, lower lexical density, more directives — the Hyland engagement profile.
- **For "technical / dense":** high informational dimension (Biber +), nominalisation tolerated where the field demands, short claims punctuating longer mechanism descriptions.

Do not overformalise the output to the user. Show the persona file and explain it in plain language. The research is the foundation, not the customer-facing surface.

## Output style

Default output:
1. The persona file in the schema (the user sees it as readable Markdown).
2. A one-paragraph plain-English summary: "this writes like ___."
3. The pasteable invocation: `/persona-write <name> ...`.
4. An offer to save it to `.claude/skills/persona-write/personas/<name>.md`.

If the user wants the science under the hood, point to `../persona-write/docs/persona-theory.md`. Don't volunteer it unprompted.

## Example

**User:**
```
/persona-create
Make it sound like a senior engineer who is concise, practical, skeptical of vague claims, and not rude.
```

**Expected behaviour:**
Build the persona from the description. Infer:
- Identity: senior engineer, peer-to-peer with the reader, not lecturer.
- Attention: vague claims, missing tradeoffs, hidden assumptions.
- Compression: assumes competence; skips setup when the point is obvious.
- Stance: direct on the clear, careful on the uncertain — Hyland-balanced.
- Reasoning: mechanism-first, then tradeoffs.
- Rhythm: short-to-medium, low ceremony; mean sentence length around 14 with moderate variance.
- Linguistic Fingerprint: low first-person rate, low intensifiers, high concrete-noun rate, em-dash preference for asides.
- Cognitive & Psychological: high Conscientiousness signal (precise, low-error register), moderate Openness, low-to-mid Extraversion.
- Stylometric Signature: lexical density 0.5–0.55; em-dashes ≈ 6/1000w; few exclamations; sentence-opener inventory dominated by bare-noun and `When`-clause openings.
- Literary & Rhetorical Lineage: Williams' clarity school; Lanham's paramedic method; the technical-essay register of writers like Dan Luu or Julia Evans.
- Taboo: corporate filler, motivational language, performative hedging, throat-clearing intros.
- Failure modes: cold or clipped when the material needs warmth or context.

Present this in readable form. Confirm. Offer to save.

## Saving

If the user wants to save the persona, write it to `.claude/skills/persona-write/personas/<name>.md` using `template.md`. Confirm the location and show the invocation.

## Related skills

- `/persona-list` — browse available presets
- `/persona-write` — use the persona to draft, rewrite, audit, refine
- `/persona-review` — apply the persona as a reviewer
- `/persona-copy` — extract a persona from sample texts instead of describing one

## References

The schema and the defaults are grounded in the research catalogued in `../persona-write/docs/persona-theory.md`. See that doc for primary sources.
