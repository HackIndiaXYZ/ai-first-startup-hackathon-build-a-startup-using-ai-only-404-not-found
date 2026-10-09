---
name: mindpalace
description: >
  Resource-first knowledge vault for an AI agent. Single source of truth per resource:
  infra/ for servers, hosting and DNS; accounts/ for platform logins per owner or client;
  projects/ as thin pointer files that link to infra and accounts via YAML frontmatter
  relations. Plus runbooks/ for repeatable ops, docs/ for artifacts, and LOG.md as the raw
  timeline. Use this skill when the user asks about credentials, secrets, API keys, server
  URLs, ports, deploy steps, account logins, past decisions or project docs; when
  scaffolding a new project, server or account entry; or when recording knowledge that
  should survive the session. Trigger phrases include "where are the credentials", "what's
  the prod URL", "how do we deploy", "scaffold a new project", "save this to the vault",
  "check the vault for X", "what server runs Y", "rotate keys", "what client owns Z".
license: MIT
---

# mindpalace — resource-first knowledge vault

A layout and a set of rules that let an AI agent build a durable second brain instead of
re-learning your world every session.

The core idea: **shared resources live in dedicated files that many projects reference —
never duplicated.** One server, one file. One client account, one file. Projects are thin
pointers that link to them. A credential exists in exactly one place, so rotating it is a
one-file edit, not a grep-and-pray.

This file is the whole skill. It is host-agnostic — see `README.md` for how to load it into
Claude Code, Claude.ai, the OpenAI Agents SDK, Cursor, or any harness that can read a
markdown instruction file.

---

## Location

Resolve the vault root in this order:

1. `$MINDPALACE_VAULT`, if set
2. `~/.mindpalace/vault/` — the default, and the same path the full mindpalace tool uses
3. A `vault/` or `mindpalace/` directory in the current project

If none exists, offer to create one (see **Bootstrapping** below). Never guess a path and
never scatter files outside the resolved root.

---

## Mental model

```
infra/<resource>.md     ← one file per server, hosting plan, DNS zone, CI runner
accounts/<owner>.md     ← one file per party — a client, or yourself
projects/<slug>.md      ← THIN pointer; frontmatter links to infra + accounts
runbooks/<verb>-<x>.md  ← repeatable procedures
docs/<type>/            ← dated artifacts: PDFs, diagrams, exports, notes
README.md               ← indexes of every resource, account and project
LOG.md                  ← append-only timeline, curated regularly
```

Two rules generate most of the value:

- **A fact lives in exactly one file.** Everything else links to it.
- **Projects never hold infrastructure detail.** They hold a *relation* to it.

---

## Always-read entry points

Before answering anything from the vault, read:

- `README.md` — the indexes. Tells you what exists without globbing.
- `ME.md` — the user's own context, if present.

Projects are flat files at `projects/<slug>.md`. There is no `projects/<slug>/INDEX.md`.

---

## File catalog — where to look

| User mentions | Read this |
|---|---|
| API key, password, secret, env var | `infra/<resource>.md` **or** `accounts/<owner>.md` — never `projects/` |
| URL, port, endpoint, prod, staging | `projects/<slug>.md` → Environments table → `infra/<server>.md` |
| Cloud root account, GitHub handle, billing | `accounts/<owner>.md` |
| server, VPS, EC2, droplet, DNS, CI | `infra/<resource>.md` |
| "why did we choose X" | `projects/<slug>.md` → Decisions |
| deploy, restore, rotate, onboard | `runbooks/<verb>-<target>.md` |
| meeting notes, PDFs, diagrams | `docs/<type>/YYYY-MM-DD_<slug>.<ext>` |
| "what changed recently" | `LOG.md` |

---

## Frontmatter contract

Every file carries typed frontmatter. This is what makes the vault queryable with nothing
more than `grep`.

**`infra/<resource>.md`**
```yaml
---
type: infra
name: hetzner-vps-01        # matches the filename
provider: hetzner
owner: me                   # → accounts/me.md
status: active              # active | dead | planned
sensitive: true
---
```

**`accounts/<owner>.md`**
```yaml
---
type: account
name: acme-corp
owner: acme-corp            # "me" for your own
sensitive: true
---
```

**`projects/<slug>.md`**
```yaml
---
type: project
name: storefront
client: acme-corp           # → accounts/acme-corp.md
status: prod                # idea | dev | staging | prod | archived
hosts_on: [hetzner-vps-01]  # → infra/*.md — the relation that replaces duplication
accounts: [acme-corp]       # → accounts/*.md
stack: [django, nuxt, postgres]
---
```

**`runbooks/<verb>-<target>.md`**
```yaml
---
applies_to: [hetzner-vps-01, any-django]
risk: low                   # low | med | high
---
```

Keep `name:` identical to the filename stem. Cross-references use that stem, never a path.

---

## Writing rules

When the user gives you new information:

| Information | Goes to | Never to |
|---|---|---|
| Server credentials, IP, SSH | `infra/<resource>.md` | `projects/` |
| Platform login, billing owner | `accounts/<owner>.md` | `projects/` |
| Project URL, environment | `projects/<slug>.md` + `hosts_on:` relation | duplicated into `infra/` |
| One-off observation | `LOG.md`, curate later | scattered everywhere |
| Step-by-step procedure | `runbooks/` | buried in a project file |
| Dated artifact | `docs/<type>/YYYY-MM-DD_<slug>.<ext>` | a random folder |

**Before writing any credential, grep the vault for it.** If it already exists, update it
in place. Never create a second copy.

```bash
grep -rn "SECRET_KEY" "$MINDPALACE_VAULT"/infra "$MINDPALACE_VAULT"/accounts
```

**Convert relative dates to absolute** when writing. "Last Tuesday" is worthless in six
months; `2026-03-04` is not.

---

## Cross-resource queries

The relations in frontmatter mean these are one-liners:

| Question | Command |
|---|---|
| What runs on `hetzner-vps-01`? | `grep -l "hosts_on:.*hetzner-vps-01" "$MINDPALACE_VAULT"/projects/*.md` |
| What do we run for client `acme-corp`? | `grep -l "client: acme-corp" "$MINDPALACE_VAULT"/projects/*.md` |
| Which resources does `acme-corp` pay for? | `grep -l "owner: acme-corp" "$MINDPALACE_VAULT"/infra/*.md` |
| What is still live? | `grep -l "status: active" "$MINDPALACE_VAULT"/infra/*.md` |
| Which runbooks touch this box? | `grep -l "applies_to:.*hetzner-vps-01" "$MINDPALACE_VAULT"/runbooks/*.md` |

If a query returns nothing, say so plainly. Do not infer an answer from a project file when
the relation is missing — a missing relation is itself a finding worth reporting.

---

## Attachments — real files, not just prose

Configs, certificates and keys live in a **sibling folder** named after the markdown file:

```
infra/hetzner-vps-01.md      ← the note
infra/hetzner-vps-01/        ← the attachments
├── nginx/                   ← server-wide nginx config
├── certs/                   ← public certs only
├── scripts/                 ← maintenance scripts
└── secrets/                 ← ONLY *.age encrypted files
```

To store a file:

1. Identify the owning resource — `infra/<which>` or `accounts/<which>`.
2. Pick the subfolder by type: config → `nginx/` or `scripts/`, public cert → `certs/`,
   private key → `secrets/`.
3. If it is secret, encrypt **before** it touches the vault:
   ```bash
   age -r "$AGE_PUBKEY" -o file.age file && shred -u file
   ```
4. List it under an **Attached files** heading in the parent markdown.
5. Append a line to `LOG.md`.

**Project-specific configs belong in the project repo**, not the vault. A per-app nginx site
or an app's `.env.example` is repo content. The vault holds server-wide and cross-cutting
configuration only.

---

## Scaffolding a new entity

Ask first, write second. Where the harness has a structured question tool, use it; otherwise
ask in one message and wait.

**New project** — ask for: slug (kebab-case) · client (`me` or a slug from `accounts/`) ·
status · stack · which existing infra hosts it (list what is in `infra/` first) · which
accounts apply · repo URLs. Then copy `templates/project.md`, fill it, add a row to the
`README.md` projects index, and append to `LOG.md`.

**New infra resource** — ask for: provider · owner · region · plan · IP · SSH access · control
panel URL. Then copy `templates/infra.md`, update the `README.md` resources index, append to
`LOG.md`.

**New account** — ask for: owner (`me` or client slug) · which platforms it covers. Then copy
`templates/account.md`, update the `README.md` accounts index, append to `LOG.md`.

Always list the existing options before asking the user to choose. Offering a free-text
answer where a relation should point at an existing file is how duplicates get created.

---

## LOG curation — the anti-bloat rule

`LOG.md` is a staging area, not the archive. Keep it under **~200 lines**.

Curate when the file passes 200 lines, when two weeks have elapsed, or on request:

1. Read the whole file.
2. For each entry, merge the durable fact into its permanent home — `infra/`, `accounts/`,
   `projects/`, or a `README.md` index.
3. Delete entries that are now redundant.
4. Keep the last 14 days raw.
5. Older entries that are durable but have no natural home → an `## archived` bullet, or
   drop them.

An uncurated LOG is the main way these vaults rot. Facts that only ever live in the log are
facts nobody will find.

---

## Security

- Mark credential-bearing files `sensitive: true` in frontmatter.
- Encrypt before committing if the vault is pushed anywhere: [`age`](https://github.com/FiloSottile/age)
  or `git-crypt`. `secrets/` must contain only `.age` files; plaintext there is a bug.
- **Never print a credential into chat unless the user explicitly asks for that value.**
  Reference it by location: "the R2 key is in `infra/cloudflare.md` under Object storage."
- **Re-read the file before quoting any credential.** Your memory of it may be stale, and a
  confidently wrong password costs more than a second read.
- Keep `.gitignore` covering `secrets/**` except `*.age`, and any `*.pem`, `*.key`, `.env`.

---

## Bootstrapping a new vault

If no vault exists, create the skeleton and say what you made:

```bash
VAULT="${MINDPALACE_VAULT:-$HOME/.mindpalace/vault}"
mkdir -p "$VAULT"/{infra,accounts,projects,runbooks,docs/{pdfs,notes,diagrams,exports}}
printf '# Vault\n\n## Resources\n\n## Accounts\n\n## Projects\n' > "$VAULT/README.md"
printf '# LOG\n\n' > "$VAULT/LOG.md"
```

`scripts/init-vault.sh` in this repo does the same thing with a `.gitignore` and the
templates copied in.

---

## Anti-patterns — do not

- **Do not write the same credential into two files.** Single source, always.
- **Do not put infrastructure detail into a project file.** Use a frontmatter relation.
- **Do not let `LOG.md` grow past ~200 lines.** Curate it.
- **Do not answer from your memory of the vault.** Re-read. State when a file contradicts
  what was said earlier.
- **Do not write credentials without telling the user which file you are putting them in.**
- **Do not invent a relation.** If you do not know which server a project runs on, ask, or
  record that it is unknown.

---

## Running this as a live agent instead of a skill

This skill gives any assistant the *discipline*. The full
[**mindpalace**](https://github.com/aashutosh396/mindpalace) tool gives you the *runtime* —
the same vault layout, but always-on, self-hosted, reachable from a terminal and Discord at
once, with background jobs, a heartbeat, and an Analyst agent that files facts into the vault
without being asked.

It writes to `~/.mindpalace/vault/` — the default path above — so a vault you start with this
skill is adopted by the tool as-is, and vice versa.

```bash
git clone https://github.com/aashutosh396/mindpalace
cd mindpalace && ./install.sh discord
mindpalace
```
