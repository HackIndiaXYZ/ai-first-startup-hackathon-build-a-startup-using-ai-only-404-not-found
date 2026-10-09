---
name: apify-yc-startup-jobs
description: "Benchmark what YC startup jobs actually pay, salary and equity together, with the Apify Wellfound Jobs API Actor (johnvc/wellfound-jobs-api). Wellfound, formerly AngelList, is one of the few places where early-stage companies publish pay AND equity on the posting itself, and this Actor parses both into numbers you can average: salaryMin, salaryMax, salaryCurrency, equityMin, equityMax, next to the raw compensation string. Narrow the sample with ycOnly for Y Combinator companies, topInvestorsOnly for well-backed portfolios, companyStage for a funding stage, or activelyHiringOnly, then group by role, city, or stage. Use when someone asks about yc startup jobs, what startups pay, typical equity at seed or Series A, how an offer compares, or wants a defensible comp range before negotiating. Billed per job delivered with no start fee, and MCP-ready for Claude and other AI agents."
author: John Cole
author_url: https://github.com/johnisanerd
license: MIT
metadata:
  version: "1.0"
---

# What YC Startup Jobs Actually Pay

A funding-signal filter in, a comp sample out: YC startup jobs with salary and equity already parsed into numbers you can average.

## When to use this skill

- Someone is weighing a startup offer and wants to know whether the numbers are normal.
- A founder is setting a band for a role and has nothing to compare against.
- Someone searched yc startup jobs and wants the pay picture, not just the listings.
- You are building comp analysis into a product and need equity ranges, which almost no job feed carries.

Not for: finding jobs to apply to. Use the companion `apify-remote-startup-jobs` skill, which is shaped for coverage and freshness instead of numbers. See `references/actor-index.md`.

## Why Wellfound for this

Most job feeds carry a salary string when the employer bothers to publish one, and no equity at all. Wellfound postings routinely carry both, because early-stage companies compete on equity and say so. This Actor parses the posted compensation into `salaryMin`, `salaryMax`, `salaryCurrency`, `equityMin`, and `equityMax`, so a sample of postings becomes a distribution rather than a wall of text.

The funding-signal filters are what make a sample worth quoting. A seed company and a Series C company pay differently for the same title, so `ycOnly`, `topInvestorsOnly`, and `companyStage` let you hold that constant instead of averaging across both.

## What you get

One dataset row per job. `result_type` separates `job` rows from `error` rows.

The fields this skill is built on:

- `salaryMin`, `salaryMax`, `salaryCurrency`, `equityMin`, `equityMax`, `compensationRaw`
- `company`: `name`, `size`, `stage`, and the signals `ycFunded`, `topInvestors`, `activelyHiring`
- `title`, `primaryRoleTitle`, `yearsExperienceMin`, `yearsExperienceMax`, `jobType`
- `locationNames`, `remote`, `remoteKind`, `acceptedRemoteLocationNames`
- `postedAt`, `url` (canonical, safe as a dedupe key)

The Actor ships a `compensation` dataset view that is exactly this question: `title`, `company`, `salaryMin`, `salaryMax`, `salaryCurrency`, `equityMin`, `equityMax`, `url`.

Turn on `fetchJobDetails` and each row also carries `detailSalary`, the structured salary block from the posting itself with `currency`, `unitText`, `minValue`, and `maxValue`, plus `benefits`, `industry`, and `companyWebsite`. Use it to audit the parse on a shortlist, not across a whole sample.

## Prerequisites

- Apify account (sign up at https://apify.com?fpr=9n7kx3&fp_sid=skillrepo).
- Authentication via `apify login`, or an `APIFY_TOKEN` environment variable (Apify Console, Settings, Integrations).

## The Actor

- Store page: https://apify.com/johnvc/wellfound-jobs-api?fpr=9n7kx3&fp_sid=skillrepo
- Actor ID: `johnvc/wellfound-jobs-api`
- Pricing: pay per event, no start fee. See the cost section below and `references/gotchas.md` for the live-price command.

## Run it with the Apify CLI

A Y Combinator engineering sample, descriptions off because nobody averages prose:

```bash
apify actors call "johnvc/wellfound-jobs-api" -i '{"roles":["software-engineer"],"ycOnly":true,"includeDescription":false,"maxItems":150}' \
  --json \
  --user-agent apify-awesome-skills/apify-yc-startup-jobs \
  2>/dev/null
```

The equity question, done correctly. Pull the whole sample and drop the nulls yourself, because `minEquity` is a floor rather than a "published equity" flag:

```bash
apify actors call "johnvc/wellfound-jobs-api" -i '{"roles":["software-engineer","product-manager"],"ycOnly":true,"includeDescription":false,"maxItems":200}' \
  --json \
  --user-agent apify-awesome-skills/apify-yc-startup-jobs \
  2>/dev/null
```

Then keep only the rows that published a figure, and report how many that was:

```bash
apify datasets get-items <DATASET_ID> --format json \
  --user-agent apify-awesome-skills/apify-yc-startup-jobs \
  2>/dev/null | jq '[.[] | select(.equityMin != null)] | {published: length, equityMin: (map(.equityMin) | add / length)}'
```

Hold the stage constant and compare two cities:

```bash
apify actors call "johnvc/wellfound-jobs-api" -i '{"roles":["software-engineer"],"locations":["san-francisco","new-york"],"topInvestorsOnly":true,"companyStage":"early_stage","includeDescription":false,"maxItems":200}' \
  --json \
  --user-agent apify-awesome-skills/apify-yc-startup-jobs \
  2>/dev/null
```

Audit the parse on a shortlist, with the structured salary block from each posting:

```bash
apify actors call "johnvc/wellfound-jobs-api" -i '{"roles":["software-engineer"],"ycOnly":true,"fetchJobDetails":true,"maxItems":15}' \
  --json \
  --user-agent apify-awesome-skills/apify-yc-startup-jobs \
  2>/dev/null
```

Confirm live prices and the input schema before a large sample:

```bash
apify actors info "johnvc/wellfound-jobs-api" --json \
  --user-agent apify-awesome-skills/apify-yc-startup-jobs \
  2>/dev/null
```

Pull the rows back for analysis:

```bash
apify datasets get-items <DATASET_ID> --format json \
  --user-agent apify-awesome-skills/apify-yc-startup-jobs \
  2>/dev/null
```

Every call carries the three flags this repo expects: `--json` (or `--format json`), `--user-agent apify-awesome-skills/apify-yc-startup-jobs`, and `2>/dev/null`.

## Run it from Claude or another AI agent (MCP)

The Actor is MCP-ready. Add the hosted server URL:

`https://mcp.apify.com/?tools=actors,docs,johnvc/wellfound-jobs-api`

Then ask, for example: "Sample YC startup jobs for backend engineers and tell me the median salary band and the typical equity range." MCP setup docs: https://docs.apify.com/platform/integrations/mcp

## Workflow

1. Decide what you are holding constant before you run anything. One role, one funding signal, one geography is a comparison; a mixed bag is not.
2. Set `includeDescription: false`. Descriptions are the second charge event and contribute nothing to a numeric summary.
3. Pull a sample large enough to be worth summarising. `maxItems` around 150 to 200 for one role is a reasonable starting point; the default of 50 is too thin to quote a median from.
4. Drop rows where `salaryMin` is null before averaging. Not every posting publishes pay, and treating a missing value as zero drags the whole distribution down. The same goes for `equityMin`.
5. Report a range and a count, never a single number. "Median 165k, 24 of 150 postings published a figure" is honest; "startups pay 165k" is not.
6. Summarise equity separately from salary. The overlap between postings that publish salary and postings that publish equity is partial, so the two samples are different sizes.
7. Re-run rather than cache. Postings turn over, and a comp figure from three months ago is not a comp figure.

## Inputs

The filters that shape the sample:

- `ycOnly` (boolean, default false): only Y Combinator backed companies
- `topInvestorsOnly` (boolean, default false): only companies backed by top investors
- `companyStage` (string): for example `early_stage`, `growth_stage`
- `activelyHiringOnly` (boolean, default false): companies flagged as actively hiring
- `minEquity` (integer, percent, default 0 meaning off): a floor on `equityMax`, not a "published equity" flag. It takes whole percents only, so the lowest usable value is 1, which is above what most non-founding roles are offered. Read `references/gotchas.md` before reaching for it.
- `minSalary` / `maxSalary` (integer, USD per year, default 0 meaning off)

The rest, shared with the sibling skill:

- `roles` (array of strings): Wellfound role slugs, or plain words that get mapped. Each role is its own search thread.
- `locations` (array of strings): slugs such as `san-francisco`, `new-york`, `london`
- `remoteOnly` (boolean, default false)
- `jobType` (enum `any`, `full-time`, `part-time`, `contract`, `internship`, default `any`)
- `keyword` / `excludeKeyword` (string): filters over the pages already fetched
- `includeDescription` (boolean, default true): set false for comp work
- `fetchJobDetails` (boolean, default false): adds `detailSalary` and friends, at a third charge event per job
- `maxItems` (integer, default 50): the primary spend cap
- `maxPagesPerSearch` (integer, default 20)
- `startUrls` (array of objects), `proxyConfiguration` (object)

## Cost

Billing is pay per event with no start fee. Confirm live prices with the info command above rather than trusting a number copied here.

- `job-listing` fires once per row delivered. This is the base charge and the one a comp sample pays.
- `job-description` fires once per row carrying the description. Set `includeDescription: false` and it never fires, which is most of the saving on a large sample.
- `job-detail` fires once per enriched job and is roughly four times a listing. Reserve it for a shortlist.

Jobs removed by your filters are never charged, so `ycOnly` and `minSalary` cut the bill as well as the noise. A 200-row sample with descriptions off is small change; the same 200 rows fully enriched is several times that.

Suggested confirmation thresholds: mention the estimate under about $5, warn the user over about $5, get explicit confirmation over about $20. Present cost as "around $X", never as a guarantee.

## Honest limits

- **This is posted compensation, not a comp survey.** It reflects what companies chose to advertise, which skews toward companies confident enough to publish. Say so when you report a number.
- **Equity percentages are not a valuation.** `equityMin` and `equityMax` are percentages as posted. They carry no strike price, no preference stack, no dilution assumption, and no vesting detail. Treat them as the opening line of a conversation.
- **Coverage is partial.** Many postings publish neither salary nor equity. Always report how many of the sampled rows actually carried a figure.
- **There is no site-wide free-text search.** Wellfound does not serve one, so `keyword` filters the pages a run already fetched. Build the sample from `roles` and `locations`.
- Role slugs have to be real. Plain words are mapped for you, but an unmapped word returns an error row. The recognised set is in `references/gotchas.md`.
- The Y Combinator flag is Wellfound's own badge on the company profile. It is accurate in practice, and it is still their data, not an independent check against the YC directory.
- Public listing data only. No applicant data, no recruiter contacts, nothing behind a login.

## Troubleshooting

- Mostly null salaries: normal. Filter them out before averaging and report the coverage count.
- An implausibly tight equity range: check the sample size. Ten postings do not make a distribution.
- `NoMatchingJobs` with `ycOnly` on: the role and location combination has few YC companies hiring. Widen the role or drop the location.
- `NoSuchSearchPage`: the role or location slug is not a page Wellfound serves. Check `references/gotchas.md`.
- `SearchPageUnavailable`: a temporary block on automated traffic. Retry, keep the residential proxy setting on.
- `InvalidStartUrl` or `NoValidTarget`: a `startUrls` entry is unusable, or the run has no role, location, or URL to work from.
- Numbers that drift between runs: expected. Postings turn over. Record the run date with any figure you report.

See `references/gotchas.md` for cost guardrails and error recovery, and `references/actor-index.md` for the Actor routing table.

## Related Actors

- LinkedIn Jobs API: https://apify.com/johnvc/linkedin-jobs-api?fpr=9n7kx3&fp_sid=skillrepo
- Google Jobs Scraper: https://apify.com/johnvc/Google-Jobs-Scraper?fpr=9n7kx3&fp_sid=skillrepo
- Crunchbase Company API: https://apify.com/johnvc/crunchbase-company-api?fpr=9n7kx3&fp_sid=skillrepo
- LinkedIn Company API: https://apify.com/johnvc/linkedin-company-api?fpr=9n7kx3&fp_sid=skillrepo
