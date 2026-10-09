---
name: okf
description: >
  Create, author, validate, and navigate Open Knowledge Format (OKF) bundles —
  vendor-neutral knowledge represented as a directory of markdown files with YAML
  frontmatter. Use when asked to create an OKF bundle, write a concept document,
  build a knowledge bundle/catalog as markdown, produce index.md or log.md for a
  bundle, check OKF conformance, convert metadata or docs into OKF, or work with
  anything described as OKF, a "knowledge bundle", or "metadata as markdown".
---

# OKF — Open Knowledge Format

OKF represents **knowledge** (the metadata and context around data and systems) as
a directory of markdown files with YAML frontmatter. No schema registry, no SDK, no
required tooling: **if you can `cat` a file you can read OKF; if you can `git clone`
a repo you can ship it.** Authoritative spec: OKF v0.1 (`references/spec-quickref.md`).

## The model (learn this first)

You cannot author a bundle correctly without the mental model. Five terms:

- **Bundle** — a directory tree of markdown files. The unit of distribution (a git
  repo, a tarball, or a subdir of a larger repo).
- **Concept** — one unit of knowledge = one markdown file. May describe a real asset
  (a table, an API) or an abstract idea (a metric, a playbook).
- **Concept ID** — the file's path within the bundle with `.md` removed.
  `tables/users.md` → concept id `tables/users`. **The path *is* the concept's
  identity**: moving or renaming a file renames the concept and breaks every inbound
  link to it. Each segment must be a filesystem-safe slug (exact rule:
  `references/spec-quickref.md` §2).
- **Links** — a standard markdown link from one concept to another asserts a
  *relationship*; the kind of relationship lives in the surrounding prose, not the
  link. Prefer **bundle-relative links rooted at `/`**: `[customers](/tables/customers.md)`.
  These are robust to moving the *linking* file (the target path doesn't change with the
  source's depth); they still break if the *target* moves — nothing rewrites links, and
  consumers treat a broken link as not-yet-written knowledge, not an error.
- **Reserved files** — `index.md` (directory listing, §6) and `log.md` (update
  history, §7). These two filenames MUST NOT be used for concept documents. Every
  other `.md` file is a concept.

A concept document = a YAML frontmatter block delimited by `---` lines, then a
markdown body. The **`type` field is required** and must be non-empty — it is the one
field consumers route on. See `references/spec-quickref.md` for all fields and the
full conformance checklist.

**Why it's built this way.** OKF is *permissive by design*: no schema registry, unknown
`type`s and extra keys tolerated, broken links allowed. That is not sloppiness — it is
the bet that knowledge is authored incrementally and never complete, so a bundle must
stay useful while it is half-written, refactored, or partly agent-generated. Treat
missing concepts and broken links as gaps to fill later, not defects to reject.

**Conformance vs. tooling-strict (one rule, stated once).** Spec §9 conformance needs
only a non-empty `type`. The reference producer (`enrichment_agent`) is stricter —
`type`, `title`, `description`, `timestamp` all truthy. Authoring all four is *defensive*
(maximal compatibility with the strictest likely consumer), not an OKF requirement.
Default to all four; validate with `--strict` to enforce them. See `spec-quickref.md`
§"Spec vs. reference-tooling differences" for the full divergence.

## How to create a bundle from scratch

1. `mkdir` a bundle directory. Decide a shallow type-based layout (`datasets/`,
   `tables/`, `references/`, `playbooks/` …) — the structure is yours; OKF does not
   dictate a taxonomy.
2. Write one concept document per unit of knowledge (next section).
3. Cross-link related concepts with `/`-rooted markdown links.
4. Write an `index.md` per directory for progressive disclosure (how-to below).
5. Validate: `python3 scripts/validate_okf.py <bundle-dir> --strict`.
6. (Optional) Add a `log.md` (hand-authored only — see `spec-quickref.md` §7; no tool
   generates it), ship as a git repo, or render with the visualizer (`references/tooling.md`).

See a complete, validated bundle in `examples/minimal_bundle/`.

## How to author a concept document

Create `<type-dir>/<name>.md`:

```markdown
---
type: BigQuery Table          # the only field §9 requires; must be non-empty
title: Orders
description: One row per completed customer order.
resource: https://console.cloud.google.com/bigquery?p=acme&d=sales&t=orders
tags: [sales, orders]
timestamp: 2026-05-28T00:00:00Z
---

# Schema

| Column     | Type    | Description                                  |
|------------|---------|----------------------------------------------|
| `order_id` | STRING  | Unique order identifier.                     |
| `cust_id`  | STRING  | FK to [customers](/tables/customers.md).     |

Part of the [sales dataset](/datasets/sales.md).
```

Field meanings and which are required: `references/spec-quickref.md` §4.1.

**Always open the file with `---`.** A file *missing* the opening fence parses as
all-body with empty frontmatter and silently fails conformance (no `type`); a file with
an *unterminated* fence is a hard error. The silent case is the trap — start every
concept with `---`.

Favor structural markdown (headings, tables, lists, fenced code) over prose — it aids
both human reading and agent retrieval. Conventional headings: `# Schema`, `# Examples`,
`# Citations` (use when applicable). Producers MAY add any extra frontmatter keys;
consumers must tolerate unknown keys and unknown `type` values.

## How to write an index.md

`index.md` has **no frontmatter**. Group entries under `#` headings (by type), one
bullet per entry, description from the linked concept's frontmatter:

```markdown
# BigQuery Table

* [Orders](orders.md) - One row per completed customer order.
* [Customers](customers.md) - One row per customer.

# Subdirectories

* [datasets](datasets/index.md) - Dataset-level concepts.
```

The one permitted exception to "no frontmatter": the **bundle-root** `index.md` may
carry a single `okf_version` line as a bare key (no `---` fences), at the very top:

```markdown
okf_version: "0.1"

# BigQuery Table
...
```

It is optional and the reference tooling neither emits nor reads it; per-directory
`index.md` files take no frontmatter at all. (Generator sort order and other index
details: `spec-quickref.md` §6.)

## How to add citations

When a body makes externally-sourced claims, list them under a trailing `# Citations`
heading, numbered. Citations may be absolute URLs, bundle-relative paths, or links into
a `references/` subdirectory that mirrors external material as first-class concepts:

```markdown
# Citations

[1] [BigQuery public dataset announcement](https://cloud.google.com/blog/...)
[2] [Internal data-quality runbook](/references/data-quality.md)
```

## How to validate conformance

```bash
python3 scripts/validate_okf.py examples/minimal_bundle --strict
```

Errors = spec §9 violations (unparseable/missing frontmatter, missing/empty `type`) plus
invalid concept-id segments. With `--strict`, missing `title`/`description`/`timestamp`
also become errors. The script needs no third-party packages (uses PyYAML if present,
else a vendored minimal frontmatter parser).

**What it does NOT check:** §9 rule 3 — the *internal structure* of `index.md`/`log.md`
(§6/§7) is your responsibility, not machine-validated here. The verdict confirms
frontmatter + `type` + concept-id rules only.

**Optional link audit.** Add `--check-links` to flag dangling intra-bundle links
(typos, renamed targets) as informational `LINK` notices. These never change the
CONFORMANT verdict or exit code — OKF treats a broken link as not-yet-written
knowledge, not a defect — so it is a pure authoring aid:

```bash
python3 scripts/validate_okf.py <bundle-dir> --strict --check-links
```

## Reference (open only what you need)

- **`references/spec-quickref.md`** — every frontmatter field, reserved filenames,
  conventional headings, link forms, the §9 conformance checklist, and the code-vs-spec
  differences. The boring complete list.
- **`references/tooling.md`** — optional accelerators: the `enrichment_agent` CLI
  (`enrich`, `visualize`) and the `kcmd` Metadata-as-Code CLI. **None are required to
  produce or read OKF** — they only speed it up.
- **`examples/minimal_bundle/`** — a complete, validator-passing bundle to copy from.
