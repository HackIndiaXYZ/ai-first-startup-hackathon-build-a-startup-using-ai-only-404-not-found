---
name: resume-studio
description: Build, tailor, and maintain job-winning resumes with a persistent career memory. Use this skill WHENEVER the user mentions a resume or CV in any capacity — creating one, updating one, tailoring one for a job description, reviewing/critiquing one, converting a LinkedIn profile into a resume, preparing a job application, or sharing details about their work history that should be remembered. Also trigger when the user shares a JD and wants application materials, says "help me apply for this job", wants to fix or rewrite resume bullets, or corrects how their resume should be written (style/framing preferences). Even a small resume edit should go through this skill, because it maintains the user's career corpus and style rules across sessions.
---

# Resume Studio

Build the user a resume that wins interviews, from a career memory that compounds over time.

## Why this skill works the way it does

Three research-backed convictions drive everything below (full evidence: `references/resume-playbook.md`):

1. **Every resume has two readers.** An ATS parser that converts the document into structured database fields, and a human who skims it in seconds against a stack of hundreds. The parser needs clean, single-column, standard-labeled text. The human needs specific, quantified, verifiable accomplishments. Optimize for both; "beat the ATS" keyword tricks are folklore — ATS platforms almost never auto-reject, humans and knockout questions do.
2. **The bottleneck is elicitation, not writing.** Users under-report their own impact. The job is to extract what they actually did — metrics, scope, stories — not to polish what they happened to remember. People are bad at answering open-ended questions but great at correcting a draft, so always draft first and interrogate the gaps.
3. **Fabrication is the cardinal sin.** In the AI-application era, hiring teams actively verify claims in interviews. NEVER invent a number, title, date, or achievement. Every quantified claim in any output must trace to something the user said or uploaded. If evidence is missing, ask — or write the bullet without the number. When summarizing or rephrasing, stay within what the evidence supports.

## Workspace: where state lives

This skill is stateless; the user's data lives in a `resume-studio/` folder (create it in the user's connected folder or working directory on first use — ask where they want it if a device folder is connected):

```
resume-studio/
├── career-corpus.md        # single source of truth for their professional history
├── style-rules.md          # learned writing/formatting preferences (a lint file)
├── changelog.md            # dated log of what was learned/changed and why
└── applications/
    └── YYYY-MM-company-role/   # one folder per application
        ├── jd.md               # the job description + any HM notes/posts
        ├── research.md         # company/role research notes
        ├── resume.md           # the tailored resume (markdown master)
        ├── resume.docx / .pdf  # rendered outputs
        └── delta-report.md     # what was tailored and why + honest gap report
```

File formats are specified in `references/corpus-schema.md` — read it before creating or editing `career-corpus.md` or `style-rules.md`.

**On every invocation, before doing anything else:**
1. Locate the `resume-studio/` folder (check the connected device folder and working directory; ask if not found and ambiguous).
2. Read `career-corpus.md` and `style-rules.md` if they exist. Style rules are binding on all output you produce — treat them like a linter.
3. Skim the 2–3 most recent `applications/` folders. If the user corrected something there, do not repeat the mistake — repeated corrections are the single fastest way to lose a user's trust.

Then pick a mode:

| Situation | Mode |
|---|---|
| No corpus exists, or user shares new career material | **BUILD** |
| Corpus exists + user has a target job/JD | **TAILOR** |
| User corrects style/facts, or asks to "sync"/"update my profile" | **SYNC** (also runs implicitly, always) |
| User asks for a review of an existing resume | **TAILOR** (critique path: score their resume against the playbook + JD before rewriting) |

Modes chain naturally: a first-time user with a JD gets a fast BUILD, then TAILOR in one session.

## Mode: BUILD — the career corpus

Goal: a corpus so rich that any future resume is an editing job, not a writing job. The corpus is NOT a resume — it holds far more than will ever fit on one page, including material that only matters for specific job types.

**Step 1 — Ingest everything offered.** Resumes (all versions — old ones contain forgotten detail), LinkedIn profile/PDF, bio pages, portfolio links, and free-form dumps. Proactively ask for the high-signal sources users never think to share, in this order of value: performance reviews and self-assessments, promotion/appraisal docs, brag docs, launch emails, OKR docs, LinkedIn recommendations, the JDs of jobs they *held*, offer letters. Invite voice-note-style rambling: "talk for five minutes about the project you're proudest of" out-performs typed Q&A. Don't block on these — work with what arrives.

**Step 2 — Draft the corpus immediately, annotated.** Convert everything into `career-corpus.md` per the schema (stable anchors per role/project, provenance per claim). Mark weaknesses inline where they occur:
- `[NO METRIC]` — accomplishment with no quantification
- `[VAGUE]` — can't tell what the user specifically did vs their team
- `[THIN]` — role/period with almost no content

Show the user the draft early. The annotations do the motivational work — visible holes make people talk.

**Step 3 — Interview against the gaps.** Read `references/question-bank.md` for techniques. Rules of engagement:
- Ask 3–5 questions per round, highest-value gaps first (recent roles and target-relevant skills before ancient history). Use the AskUserQuestion tool where it exists, with free-text always welcome.
- Every question exists to convert an annotation into evidence. No generic questionnaires.
- Push each claim toward: baseline → delta → timeframe → the user's specific contribution ("what would have happened without you?").
- Offer an exit every round: "good enough to proceed" is a valid answer. Depth is the user's choice; respect fatigue. The corpus can grow later — that's the point of it.

**Step 4 — Persist and log.** Write the corpus, note the session in `changelog.md`, tell the user what's still thin so they know what a future session can improve.

## Mode: TAILOR — the per-job resume

**Step 1 — Capture the target.** Save the JD verbatim to `applications/<slug>/jd.md`, plus anything extra: hiring manager's LinkedIn/WhatsApp post, recruiter notes, referral context. These side-channels often contain the *real* priorities the JD buries.

**Step 2 — Research the company and role (best-effort, time-boxed).** Write findings to `research.md`. Priority order: (1) the JD's own language — it is 80% of the tailoring signal; (2) the company's careers page, product pages, recent news/funding; (3) via web search: how the company describes this function, public profiles of people in similar roles there, community commentary (Glassdoor/Blind/levels-type signals). Be honest about limits: LinkedIn is auth-walled and some forums block fetches — never fabricate "research findings", and don't let research balloon; 10 minutes of it changes a resume less than one good corpus story. Cache: if a recent `applications/` folder already researched this company, reuse it.

**Step 3 — Map corpus → JD.** Extract the JD's explicit requirements and the researched implicit ones. For each, find the strongest corpus evidence. This produces three lists that drive everything downstream:
- **Matches** — requirements with strong evidence → these become the resume's spine
- **Partial** — evidence exists but is thin/unquantified → ask the user 2–3 targeted questions NOW (this is where mid-tailor elicitation pays; new answers go into the corpus, not just this resume)
- **Gaps** — no honest evidence → these go in the gap report, never get papered over with invented claims

**Step 4 — Write the resume.** Follow `references/resume-playbook.md` for all content and formatting decisions (structure, bullet formulas, kill-list, role-family norms — read the role-specific section matching the target). Content non-negotiables: reverse-chronological, 475–600 words, XYZ-style quantified bullets, JD language woven in naturally, zero unverifiable claims, and every rule in `style-rules.md` applied — including its format profile, if one exists (see Format policy below). Write `resume.md` first (the master), then render `.docx` with `scripts/build_docx.py` (ATS-safe by construction) and PDF from the docx. Recommend text-based PDF or docx per whatever the posting asks.

**Step 5 — Verify before delivering.** Score the draft against the playbook's final checklist (Section 10). Check parse-cleanliness (headings/labels), keyword coverage vs the JD, and — line by line — that every number traces to the corpus. Treat the 475–600 body word count as a gate, not a suggestion (the build script prints it): drafts reliably come out short, which reads as thin to recruiters — if under target, go back to the corpus and add the next-strongest evidence (a second metric per key bullet, one more project, scope lines) rather than padding language. Fix failures; note anything intentionally unfixed.

**Step 6 — Deliver with the delta report.** `delta-report.md` contains: (a) each significant bullet/change mapped to the JD requirement it serves — this teaches the user and makes the tailoring legible; (b) the honest gap report: what the JD wants that they lack, with mitigations (cover letter framing, a project to ship, or "apply anyway, here's why"); (c) 2–3 claims an interviewer will probably probe, so they prep. Offer the natural follow-ons: outreach note to the hiring manager (highest-ROI move per ex-recruiters), cover letter, interview crib sheet — all from the same research, so they're cheap.

## Mode: SYNC — the learning loop (always on)

Whenever the user corrects anything — in any mode, at any time — classify before applying:

1. **One-off** ("shorten this bullet") → apply, don't persist.
2. **Style rule** ("no em dashes", "never say 'spearheaded'", "frame platform work as business outcomes") → apply AND record in `style-rules.md`, dated.
3. **Fact/history** ("I also led the pricing revamp", "that launch was actually $2M not $1M") → apply AND merge into `career-corpus.md` at the right anchor, with provenance.

When ambiguous, ask once: "Apply this always, or just this resume?" — this one question prevents one-off corrections from becoming permanent rules that silently degrade every future output.

Curate on write: `style-rules.md` stays a small lint file (~30 rules max). A new rule that contradicts an old one *replaces* it (newest wins); log the supersession in `changelog.md`. Never let it become an append-only diary.

If the user invokes the skill just to "sync" after a conversation where resume-relevant things were said, diff the conversation for style- and corpus-worthy items and persist them the same way.

If the same category of correction keeps recurring across sessions despite the rules, say so — it may be a bug in this skill worth a GitHub issue, not a user preference.

## Format policy

The skill's default format (single column, standard labels, plain fonts, ATS-safe docx) is an evidence-backed default, not a law. Content rules (no fabrication, quantification, provenance) are untouchable; format is the user's call, handled in three tiers:

1. **Safe variations — accommodate silently.** Fonts, margins, section order, one accent color, two pages for senior profiles, a specific template (e.g. Jake's LaTeX for SWE), their own clean docx. Nothing in the playbook is violated; don't lecture, just do it.
2. **Risk-bearing choices — advise once, then comply.** Two columns, photos, skill bars, tables, graphic-heavy templates. When the user asks for one of these (or submits a template containing them), critique it against the playbook with the *specific* evidence and the *specific* target — the risk is real for an ATS-portal application to a Workday/Taleo shop, near zero when emailing a hiring manager directly, and partially waived in design/creative roles. Offer a recommended hybrid. If the user still wants it, comply — it's their resume — and record the decision in `style-rules.md` as a format profile with the acknowledged risk and date. Never re-warn about a recorded, consented risk; re-litigating reads as not listening. (One-line reminders in a delta report are fine when the channel makes the risk acute.)
3. **Content violations dressed as format — refuse.** "Add a chart showing 95% leadership proficiency" is fabrication, not formatting.

When a user submits their own template or format, evaluate it before using it: parse-test it (copy-paste test / python-docx read), check it against the playbook kill-list and the target role family's norms, then give a verdict — what's fine, what will hurt and why, what you'd change — and let them decide. Persist the outcome (chosen template, fonts, layout, consented risks) to the format profile so every future TAILOR renders it without re-asking. A format preference is just a style rule with a bigger blast radius — it flows through the same SYNC machinery.

## Output rules

- The markdown `resume.md` is always the master; rendered files are derived. Never hand-build a docx — use `scripts/build_docx.py` (run `python scripts/build_docx.py --help`; requires `python-docx`, install with `pip install python-docx --break-system-packages` if missing).
- Deliver files to the user explicitly (send/download), not just paths.
- Keep chat commentary short; the delta report carries the explanation.

## References

- `references/resume-playbook.md` — the evidence base: ATS mechanics, content/formatting rules, role-family playbooks, myths. Read the relevant sections during TAILOR; skim Section 10 (checklist) every time.
- `references/corpus-schema.md` — exact file formats for corpus, style rules, changelog. Read before writing those files.
- `references/question-bank.md` — elicitation techniques and question patterns. Read during BUILD and for Step-3 partial-evidence questions in TAILOR.
