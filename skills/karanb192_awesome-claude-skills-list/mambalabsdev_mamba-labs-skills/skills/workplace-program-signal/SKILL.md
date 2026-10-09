---
name: workplace-program-signal
description: |
  Detect which workplace programs and benefits a company runs, as a signal for anyone selling into people operations, benefits or internal communications. Use when targeting HR buyers, checking benefits maturity, or looking for companies with or without a specific program.
license: MIT
metadata:
  category: signal-research
  tags: [signal_based_selling, signal_research]
compatibility: [Claude Code, Codex CLI, Cursor, MCP-compatible agents]
version: 2.0.0
---
# Workplace Program Signal

## What this does

For anyone selling to people operations, the buying signal is program presence or absence, and both are usually public across careers pages, benefits pages and job postings. This skill detects the programs, distinguishes a program that exists from one that is merely mentioned, and reads absence as the more actionable of the two.

## When to use it

- what benefits does this company offer
- HR buyer targeting
- benefits maturity check
- do they have this program
- people operations prospecting

## Inputs

- **domain**: the company domain
- **programs**: which programs to look for
- **direction**: whether presence or absence is your signal

## Shared context this skill reads

Before doing anything else, read whichever of these exist at the project root and
use them instead of asking the user to repeat themselves:

- `ICP.md`

If none exist, do the work from what the user gives you, then offer to write the
missing file so the next skill in the pack starts warmer.

## Live data

Programs are detected across the company's own pages and its job postings, which catches programs that are described in postings but never listed on a benefits page.

- **workplace-program-detector**: workplace program and benefit detection across web pages and job postings
  Store page: https://apify.com/mambalabs/workplace-program-detector

Runnable example input:

```json
{
  "domain": "example.com",
  "programs": [
    "parental",
    "learning",
    "wellbeing"
  ],
  "scan_job_postings": true,
  "scan_web_pages": true
}
```

## Method

1. Decide which direction is your signal before scanning. Selling a program platform means absence is the signal; selling program services means presence is.
2. Scan both pages and postings. Postings often describe a program that no page lists, and a page can describe a program that has been discontinued.
3. Distinguish existence from description. A benefits page listing a program is evidence it exists; a values page mentioning a concept is not.
4. Check headcount. Below a certain size, absence of a formal program is normal and not a signal at all.
5. Write the angle carefully. Program topics touch people's working conditions, so the message must be about the operational problem, not about implying a company treats people badly.
6. State detection confidence and where the evidence came from.

## Output

The program table with present, absent or unknown per program, the evidence source, the headcount context, and the angle for the chosen direction.

## Quality bar

- The signal direction is set before scanning
- Pages and postings are both scanned and reported separately
- Absence is only a signal above the stated headcount floor
- The angle avoids implying anything about how a company treats its people

## Related skills

- `hiring-signal-spotter`
- `job-board-keyword-scanner`
- `account-intelligence-brief`

Ships in the **signal-based-selling** pack.
