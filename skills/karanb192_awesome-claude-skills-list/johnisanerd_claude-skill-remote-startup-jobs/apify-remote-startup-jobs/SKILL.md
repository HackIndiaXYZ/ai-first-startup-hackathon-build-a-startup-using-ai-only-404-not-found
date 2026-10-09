---
name: apify-remote-startup-jobs
description: "Pull live remote startup jobs as structured rows with the Apify Wellfound Jobs API Actor (johnvc/wellfound-jobs-api). Wellfound, formerly AngelList, is where early-stage companies post, and this returns their listings as JSON: title, apply URL, the full description in markdown, the raw compensation string plus parsed salaryMin, salaryMax, equityMin and equityMax, remote arrangement, accepted applicant locations, job type, years of experience, posted date, and a company object carrying size, funding stage, and the Y Combinator, top-investor and actively-hiring flags. Filter by role, city, remote only, minimum salary, and minimum equity, and cap the run with maxItems. Use when someone wants remote startup jobs, a startup job feed for a board or aggregator, jobs api data for an app or an agent, or Wellfound listings when there is no official API to sign up for. Billed per job delivered with no start fee, and MCP-ready for Claude and other AI agents."
author: John Cole
author_url: https://github.com/johnisanerd
license: MIT
metadata:
  version: "1.0"
---

# Remote Startup Jobs, as Rows You Can Query

A role and a remote flag in, remote startup jobs out as structured rows, each with pay and equity already parsed into numbers.

## When to use this skill

- Someone wants remote startup jobs and does not want to read a job board by hand.
- You are filling a job board, a market-intel dashboard, or a sourcing tool with early-stage roles.
- You need salary and equity as numbers, not as a string a human has to read.
- You went looking for a Wellfound or AngelList API and found nothing you can sign up for.

Not for: comparing pay across Y Combinator or top-investor portfolios. Use the companion `apify-yc-startup-jobs` skill, which is built on the same Actor but shaped for that question. See `references/actor-index.md`.

## What you get

One dataset row per job. `result_type` separates `job` rows from `error` rows.

Core fields:

- `id`, `url` (canonical, safe as a dedupe key), `title`, `slug`, `primaryRoleTitle`
- `description` (full markdown, unless you turn it off)
- `compensationRaw`, and parsed `salaryMin`, `salaryMax`, `salaryCurrency`, `equityMin`, `equityMax`
- `remote`, `remoteKind` (for example `REMOTE_ONLY`, `ONSITE_OR_REMOTE`), `wfhFlexible`
- `locationNames`, `acceptedRemoteLocationNames` (where applicants may sit)
- `jobType`, `yearsExperienceMin`, `yearsExperienceMax`, `postedAt`, `atsSource`, `autoPosted`
- `company`: `name`, `slug`, `url`, `logoUrl`, `size`, `tagline`, plus the startup signals `ycFunded`, `topInvestors`, `activelyHiring`, `stage`
- `searchContext` (which role, location, remote flag, and page produced the row), `scrapedAt`

With `fetchJobDetails` on, each row also carries `benefits`, `industry`, `companyWebsite`, `detailSalary` (structured currency, minValue, maxValue), `geo`, `applicantLocationRequirements`, `datePosted`, `jobLocationType`, `directApply`, and `experienceRequirements`.

The Actor ships an `overview` dataset view that trims this to the nine fields most people want on screen: `result_type`, `title`, `company`, `compensationRaw`, `remote`, `locationNames`, `jobType`, `postedAt`, `url`.

## Prerequisites

- Apify account (sign up at https://apify.com?fpr=9n7kx3&fp_sid=skillrepo).
- Authentication via `apify login`, or an `APIFY_TOKEN` environment variable (Apify Console, Settings, Integrations).

## The Actor

- Store page: https://apify.com/johnvc/wellfound-jobs-api?fpr=9n7kx3&fp_sid=skillrepo
- Actor ID: `johnvc/wellfound-jobs-api`
- Pricing: pay per event, no start fee. See the cost section below and `references/gotchas.md` for the live-price command.

## Run it with the Apify CLI

Remote engineering roles, capped at 25:

```bash
apify actors call "johnvc/wellfound-jobs-api" -i '{"roles":["software-engineer"],"remoteOnly":true,"maxItems":25}' \
  --json \
  --user-agent apify-awesome-skills/apify-remote-startup-jobs \
  2>/dev/null
```

Several roles at once, only jobs paying at least 150k, descriptions off to halve the cost:

```bash
apify actors call "johnvc/wellfound-jobs-api" -i '{"roles":["backend-engineer","full-stack-engineer"],"remoteOnly":true,"minSalary":150000,"includeDescription":false,"maxItems":100}' \
  --json \
  --user-agent apify-awesome-skills/apify-remote-startup-jobs \
  2>/dev/null
```

A city rather than remote, with full detail-page enrichment:

```bash
apify actors call "johnvc/wellfound-jobs-api" -i '{"roles":["product-manager"],"locations":["new-york"],"fetchJobDetails":true,"maxItems":20}' \
  --json \
  --user-agent apify-awesome-skills/apify-remote-startup-jobs \
  2>/dev/null
```

Confirm the live schema and prices before a large batch:

```bash
apify actors info "johnvc/wellfound-jobs-api" --json \
  --user-agent apify-awesome-skills/apify-remote-startup-jobs \
  2>/dev/null
```

Read the rows back from a finished run:

```bash
apify datasets get-items <DATASET_ID> --format json \
  --user-agent apify-awesome-skills/apify-remote-startup-jobs \
  2>/dev/null
```

Every call carries the three flags this repo expects: `--json` (or `--format json`), `--user-agent apify-awesome-skills/apify-remote-startup-jobs`, and `2>/dev/null`.

## Run it from Claude or another AI agent (MCP)

The Actor is MCP-ready. Add the hosted server URL:

`https://mcp.apify.com/?tools=actors,docs,johnvc/wellfound-jobs-api`

Then ask, for example: "Find remote startup jobs for a senior backend engineer paying over 160k, and tell me which of those companies are Y Combinator backed." MCP setup docs: https://docs.apify.com/platform/integrations/mcp

## Workflow

1. Start with one role, `remoteOnly: true`, and `maxItems` around 25. Look at the row shape before you pay for a wide crawl.
2. Use real role slugs. Plain words are mapped for you (`software` becomes `software-engineer`, `pm` becomes `product-manager`), but an unmapped word produces an error row rather than results. The recognised set is in `references/gotchas.md`.
3. Add `locations` only when you want a city. `remoteOnly` and `locations` are different axes, and each role and location pair becomes its own search thread, so pairs multiply the pages fetched.
4. Filter at the source, not downstream. `minSalary`, `minEquity`, `jobType`, and `excludeKeyword` all drop jobs before they are billed.
5. Turn `includeDescription` off once you know you do not need the body text. That removes the second charge event on every row.
6. Check `result_type` before treating a row as a job. An `error` row carries `error_type` and an `error_message` that says what to change.
7. Dedupe downstream on `url`. It is canonical and survives a company editing the title.

## Inputs

- `roles` (array of strings): Wellfound role slugs, or plain words that get mapped. Each role is its own search thread.
- `locations` (array of strings): location slugs such as `san-francisco`, `new-york`, `london`, `india`.
- `remoteOnly` (boolean, default false): restrict to remote listings.
- `keyword` (string): narrows the jobs on the pages already fetched. Read the limits section before relying on it.
- `excludeKeyword` (string): drops jobs whose title or description contains the phrase.
- `jobType` (enum `any`, `full-time`, `part-time`, `contract`, `internship`, default `any`)
- `minSalary` / `maxSalary` (integer, USD per year, default 0 meaning off)
- `minEquity` (integer, percent, default 0 meaning off)
- `ycOnly`, `topInvestorsOnly`, `activelyHiringOnly` (boolean, default false)
- `companyStage` (string): for example `early_stage`, `growth_stage`
- `includeDescription` (boolean, default true)
- `fetchJobDetails` (boolean, default false): adds the detail-page fields, at a third charge event per job
- `maxItems` (integer, default 50): the primary spend cap
- `maxPagesPerSearch` (integer, default 20): safety cap per search thread
- `startUrls` (array of objects): paste Wellfound search URLs directly, used alongside `roles` and `locations`
- `proxyConfiguration` (object): residential US by default

## Cost

Billing is pay per event with no start fee, so a run that returns nothing costs almost nothing. Confirm live prices with the info command above rather than trusting a number copied here.

Three events, charged only on rows actually delivered:

- `job-listing`, once per job row returned.
- `job-description`, once per row that carries the full description. Turn `includeDescription` off to skip it.
- `job-detail`, once per job enriched from its detail page. Only fires when `fetchJobDetails` is on, and it is the expensive one, roughly four times a listing.

Jobs removed by your filters are never charged. As a shape, 100 jobs with descriptions is small change; 100 jobs with full detail enrichment is several times that.

Suggested confirmation thresholds: mention the estimate under about $5, warn the user over about $5, get explicit confirmation over about $20. Present cost as "around $X", never as a guarantee.

## Honest limits

- **There is no site-wide free-text search.** Wellfound does not serve one, so `keyword` filters the jobs on the pages a run already fetched rather than searching the whole site. Drive intent through `roles` and `locations`. A keyword that names a job function is used as the role search itself; anything else falls back to the general feed and may find nothing.
- **Role slugs have to be real.** Wellfound returns a 404 for a role it does not serve, so `roles: ["software"]` only works because it is mapped to `software-engineer`. Unmapped words produce an error row.
- Salary and equity appear only when the company published them on the posting. Nothing is inferred or estimated, and plenty of listings carry neither.
- `equityMin` and `equityMax` are percentages as posted. They say nothing about strike price, preference stack, or dilution, so they are a starting point for a conversation and not a valuation.
- Public listing data only. No applicant data, no recruiter contacts, nothing behind a login.
- Company-directory mode, browsing companies rather than jobs, is not in this version.

## Troubleshooting

- `NoSuchSearchPage`: the role or location slug does not exist on Wellfound. Check the spelling against the recognised list in `references/gotchas.md`.
- `SearchPageUnavailable`: the pages did not load on this run, usually a temporary block on automated traffic. Retry, and keep the residential proxy setting on.
- `NoMatchingJobs`: the pages loaded but your filters removed everything. Relax `minSalary`, `minEquity`, `ycOnly`, or `companyStage` first.
- `InvalidStartUrl` or `NoValidTarget`: a `startUrls` entry is not a usable Wellfound search URL, or the run has no role, location, or URL to work from.
- Zero rows and no error row: check that `maxItems` is not set to something tiny.
- Duplicates across runs: dedupe on `url`, never on title.

See `references/gotchas.md` for cost guardrails, the role slug list, and error recovery, and `references/actor-index.md` for the Actor routing table.

## Related Actors

- LinkedIn Jobs API: https://apify.com/johnvc/linkedin-jobs-api?fpr=9n7kx3&fp_sid=skillrepo
- Google Jobs Scraper: https://apify.com/johnvc/Google-Jobs-Scraper?fpr=9n7kx3&fp_sid=skillrepo
- Crunchbase Company API: https://apify.com/johnvc/crunchbase-company-api?fpr=9n7kx3&fp_sid=skillrepo
- LinkedIn Company API: https://apify.com/johnvc/linkedin-company-api?fpr=9n7kx3&fp_sid=skillrepo
