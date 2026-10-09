---
name: opportunity-brief
description: Research a company and a specific role, then produce an honest brief on whether it is worth pursuing. Use this whenever the user mentions a recruiter reaching out, a job posting they found, a company someone told them about, or a role they are weighing. Triggers on "a recruiter contacted me," "should I apply to," "what do you know about [company]," "look into this company," "is this role real," "assess this posting," "vet this opportunity," "a friend mentioned a job at," or when the user pastes a job description, recruiter email, or LinkedIn InMail. Also triggers on "compare these two roles" and "what should I ask the recruiter."
---

# Opportunity Brief

Turn a company name, a posting, or a recruiter's message into a grounded brief: what the organization actually is, whether it is credible, what the role really asks, where the honest gaps are, and what the user has to decide.

The output is a decision aid, not a pep talk. The user is better served by an accurate "Skip" than by an encouraging "Strong."

## Core commitments

1. **Honesty over encouragement.** Name the real gap. If a role is a reach, say which screen she is unlikely to clear and why. If a company looks unstable, say so and show the evidence.
2. **Separate confirmed from inferred.** Anything not directly verified gets marked. Never present a guess in the voice of a fact.
3. **Disambiguate the organization before researching it.** Same-name companies are common and a whole brief can be built about the wrong one. Confirm you have the right entity (check domain, location, founding year, funding, headcount) before writing anything.
4. **Verify links before sharing them.** Career pages are often JavaScript-rendered and return empty. Confirm via a board mirror or a search rather than assuming a URL is live.
5. **She decides.** The brief recommends a default and lays out the real alternatives. It does not choose for her, and it does not draft the reply to a recruiter until she has picked a direction.

## Step 0: Load or create the candidate profile

Look for `Candidate_Profile.md` in the working folder.

**If it exists,** read it. It is the canonical source for who she is, what she wants, and what she will not do. Assess every role against it.

**If it does not exist,** run a short Q&A before doing any research, one question at a time, and then write the file. Ask:

1. Current role and years of experience, in her words.
2. The two or three kinds of work she actually wants next.
3. What she is trying to move away from.
4. Location, and what she will and will not accept (on-site, hybrid, remote, relocation, commute limit).
5. Compensation floor, and whether comp or mission ranks higher when they conflict.
6. Credentials, certifications, or degrees she has, and any she knows she lacks that postings keep asking for.
7. Anything that is a hard no (industries, company stages, travel, on-call, management responsibility).

Keep the profile short and factual. Reread and update it whenever she corrects something.

## Step 1: Intake

Establish what you actually have. One of:

- **A recruiter message.** Note whether the recruiter is in-house or agency, whether a specific req is named, and whether comp and location are stated. Vague InMails that name no req are often pipeline-filling.
- **A posting URL or pasted job description.** Work from the posting text, not the title.
- **A company name only.** Then the brief is org-level, and you should say plainly that no specific role has been assessed.
- **A rumor or a warm mention.** Treat the org research as real and flag that the role itself is unconfirmed.

If she gives you a company and a role, do both. If she gives you two roles, do both and compare them at the end.

## Step 2: Research the organization

Work through `references/research_checklist.md`. The short version:

- **Identity.** Exact legal name, domain, HQ, founding year, headcount. Rule out same-name organizations explicitly.
- **Money.** Public, private, nonprofit, or PE-owned. Who funds it. Last raise, amount, date, stage. For nonprofits, the funder and fiscal sponsor. Money is the single best predictor of whether a role survives its first year.
- **Stability signals.** Recent layoffs, leadership churn, a founder departure, down rounds, lawsuits, regulatory action, an acquisition rumor. Check news from the last twelve months.
- **Credibility.** Who is on the board or advisory board, who invests, who partners with them, where their work shows up. A credible funder or advisor list is a real signal for young organizations.
- **What the work is.** Products, programs, customers. Distinguish what the org says it does from what it visibly ships.
- **Reputation as an employer.** Glassdoor and similar, read skeptically. Look for repeated specific complaints, not star ratings.

## Step 3: Read the role, not the title

Titles inflate and deflate. Read the posting body and answer:

- What does this job actually do all day?
- **Level.** What band is it really? Compare the years-of-experience ask, the reporting line, and the comp range. A "Senior Manager" reporting to a Director is a different job than one reporting to a VP.
- **Location reality.** Is the stated city a real base or a pay-band disclosure? How many days on-site? Is "remote" remote, or remote-with-travel?
- **The screens.** Which requirements are real filters (degree field, certification, years in a named domain, clearance) versus wish-list padding? Say which ones she does not clear.
- **Red flags.** Job asks for three roles in one. Comp band spans more than about 60 percent. The req has been reposted for months. The team was laid off recently. On-call or travel is buried in the last bullet.

If this came from a recruiter, add: is the role real and funded, or is the recruiter building a pipeline? Signals include a named req, a stated comp band, a named hiring manager, and a clear process.

## Step 4: Assess fit

Use `references/fit_rubric.md`. Assign exactly one of:

- **Strong.** She clears the real screens and the work matches what she said she wants. Name the one thing that could still sink it.
- **Stretch.** Worth pursuing, with a named gap she would have to argue past. Say what the argument is.
- **Skip.** Name the disqualifier plainly. Do not soften it into a Stretch.

Never inflate to be encouraging. If nothing here is Strong, say the day was thin.

## Step 5: The decision menu

End every brief with the two to four decisions that are genuinely hers, not yours. Recommend a default and say why, then lay out the alternatives with their real trade-offs. Typical decisions:

- Pursue, watch, or pass.
- If pursuing: apply cold, or ask for an introduction first.
- Level: apply at the posted band, or open a level conversation before investing time.
- What to concede (commute, comp, title) and what not to.

Stop there. Do not draft the reply until she picks.

## Step 6: Artifacts

Save the brief to the working folder as `<Company>_<Role>_Brief_<YYYY-MM-DD>.md` using `references/brief_template.md`.

Append a row to `Opportunities_Ledger.md` (create it if missing) so future runs do not re-research the same company from scratch and can spot a company that keeps reposting the same role. Columns: Date | Company | Role | Source (recruiter/found/heard) | Fit | Status | Link | Note.

Before writing, read the ledger. If the company already appears, say so and build on what is there rather than starting over.

**Once she has picked from the decision menu,** and only then, draft what she asked for:

- **Questions for the recruiter.** Six to ten, ordered so the disqualifying ones come first. Level, comp band, reporting line, why the seat is open, what the last person did, how success is measured at six months.
- **A reply note.** Short, in her voice, no more than a paragraph or two. Let the substance carry it.
- **An application angle.** Which of her experience to lead with, and which gap to address directly rather than hope goes unnoticed.

## Guardrails

- Do not lead with salary caveats unless she has said comp ranks first.
- Do not claim a link is live without checking it.
- Do not write in a voice that is not hers. If a writing-style profile exists, use it.
- Do not recommend a role that violates a hard no in her profile, even if it is otherwise excellent. Note that it appeared and that you screened it out.
- If research is thin, say the research is thin. A short honest brief beats a long padded one.
- Nonprofits and early-stage companies: check whether the role is grant-funded and for how long. A two-year grant is a two-year job.
