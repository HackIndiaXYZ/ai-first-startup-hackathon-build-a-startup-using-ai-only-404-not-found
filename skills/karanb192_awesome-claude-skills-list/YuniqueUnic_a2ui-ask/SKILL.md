---
name: a2ui-ask
description: >
  When the user must choose among options or fill in structured config, spawn
  a browser form (powered by schemaui Web UI, bound to 0.0.0.0), open the
  user's browser, and write the result to .schemaui/answers/. Never use a
  terminal/TUI prompt — the agent process has no TTY attachment. Supports
  rich content: figures on questions and answer options (Mermaid/SVG/Markdown
  via x-content / x-options) and a live Mermaid editor (x-control: mermaid).
  Trigger phrases: "give me a form", "ask me via form", "configure", "pick a
  deploy environment", "I need to choose", "grill me", "a2ui", "给我个表单",
  "配置一下", "用表单问我", "问我几个问题", "拷问我".
---

# a2ui-ask — collect user input via a browser form (file output)

Interactive UI for AI agents: turn structured questions into browser forms. The
rendering engine is the `schemaui` binary (`schemaui web`) from
[YuniqueUnic/schemaui](https://github.com/YuniqueUnic/schemaui); this skill
wraps it with scripts that handle binding, browser wakeup, timeout, and the
file-output contract.

## Prerequisite: the schemaui engine

Check for the binary first: `command -v schemaui` (or just run the ask script —
it exits with code 3 when the engine is missing).

If missing, offer to install it — you can do this yourself, unattended:

```bash
bash scripts/install.sh        # macOS / Linux / FreeBSD: auto-detect & install
pwsh scripts/install.ps1       # Windows / PowerShell 7+
```

Both default to a prebuilt-binary download (no toolchain needed) and support
`--dry-run` / `-DryRun` to preview. They fetch from GitHub first and fall back
to the [Gitee mirror](https://gitee.com/Credhat/schemaui) — same tags, same
asset names — which is what makes them work from mainland China. If a user
reports a stalled or failed install, re-run with the mirror pinned rather than
retrying GitHub:

```bash
bash scripts/install.sh --source gitee
pwsh scripts/install.ps1 -Source gitee
```

The brew / scoop / winget manifests still hardcode GitHub download URLs, so on a
blocked network prefer `--source gitee` or `cargo install schemaui-cli`. Full
channel list: see `install.md` in this repository.

## Non-negotiables

1. Web form only, via `schemaui web`. Terminal prompts are forbidden — your
   process has no TTY, so a TUI renders nowhere and blocks forever.
2. Bind `0.0.0.0` so the form is reachable from localhost, LAN, SSH tunnels, and
   port-forwards.
3. Output to a FILE under `.schemaui/answers/` — stdout-only is forbidden.
4. Tell the user the URL and the answer file path in your response, in the same
   turn as the tool call.
5. Block on the subprocess; read the answer file when it exits.
6. Fall back to plain text on any failure — never abort the task.
7. `-o` is greedy: every other flag goes BEFORE `-o`; extra destinations are
   space-separated in the same `-o` (`-o answer.json -`), never repeated.

## Asking well (grill-me discipline, form edition)

- **Explore before asking.** If the codebase, git history, or
  `.schemaui/answers/` can answer the question, answer it yourself. The form is
  for decisions only the user can make.
- **One form per decision cluster.** Batch the questions of one topic (e.g.
  "deployment config") into a single form; do not spawn ten forms for ten
  questions, and do not interrogate serially in chat either.
- **Every question ships a recommended answer.** Put your recommendation in the
  field's `default` so the user can confirm with one click instead of typing.
  Say in chat what you recommended and why.
- **Keep the recommendation out of the option label.** `default` is the one
  place the recommendation lives; the label is what lands in the answer file.
  Suffixing options with `（推荐）` / `(recommended)` duplicates the hint and
  then leaks it into the data, so every downstream consumer has to strip it.
  Explain the recommendation in the field's `description` instead ("推荐
  X：因为…"), where it stays readable without contaminating the value.
- **Speak the user's language.** Write every `title` and `description` in the
  language the user is chatting in, and say in the description what the answer
  changes downstream ("drives whether we need rate limiting").
- **Pick the control, don't settle for text boxes.** A slider for a scale, a
  two-handle range for a window, a colour picker for a colour, a segmented
  control for a handful of short options, `x-visible-when` for anything that
  only matters sometimes. Choosing from the gallery is what makes the form
  pleasant to fill in — see
  [Picking the control](#picking-the-control-use-the-gallery).
- **Always leave an escape hatch, and keep it out of the way.** Your options and
  defaults are guesses, so every select gets an `其他`/`other` option plus a
  sibling `<field>_custom` text input. Gate that input with `x-visible-when` so
  it only shows up once the user actually picks the escape option — a
  permanently visible empty box reads as a question they still owe you an answer
  to:

  ```json
  "delivery_form": { "enum": ["单个 HTML 文件", "其他"], "default": "单个 HTML 文件" },
  "delivery_form_custom": {
    "type": "string",
    "title": "交付形式 · 自定义说明",
    "description": "选了「其他」时填写:你想要的交付形式。",
    "x-visible-when": { "field": "delivery_form", "op": "equals", "value": "其他" }
  }
  ```

  Use `"op": "contains"` when the controlling field is a multi-select (the
  option list has to _contain_ the escape value). The rule must name a sibling
  of the same object: a typo is rejected when the form loads rather than hiding
  the field forever. The controlling field's `default` must not be the escape
  value, or the input would be visible from the start.

## Grilling: which interview skill to use

Open-ended designs sometimes need a relentless interview before they become a
form. When the user asks to be grilled (or a plan needs stress-testing before
you can draft the schema), use an existing grilling skill if the user named or
installed one — check their skills directory for something like `grill-me`,
`grilling`, or a skill they explicitly referenced, and defer to it. Only when
none exists, fall back to the one bundled here:
[`skills/grill-with-docs/SKILL.md`](./skills/grill-with-docs/SKILL.md) — the
same one-question-at-a-time, recommend-then-ask discipline, plus a rule to
ground every question in the project's docs and the galleries referenced above,
and to end by turning the settled decisions into a form. The bundled skill is a
convenience so a fresh install works out of the box; it never overrides a
grilling skill the user chose themselves.

## Question type → schema cheat sheet

| You need               | Schema shape                                                                                                                     | Renders as                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| short text input       | `{"type": "string", "minLength": …, "pattern": …}`                                                                               | inline text field                                   |
| long text input        | `{"type": "string", "x-multiline": true}`                                                                                        | multi-line text area                                |
| number                 | `{"type": "integer", "minimum": …, "maximum": …}`                                                                                | numeric field with guards                           |
| number on a scale      | `{"type": "…", "minimum": …, "maximum": …, "x-control": "slider"}`                                                               | slider with a live readout                          |
| slider with labels     | slider + `"x-slider-marks": [{"value": …, "label": …}, …]`                                                                       | slider with labelled stops                          |
| two-number interval    | `{"type": "array", "items": {"type": "number"}, "minItems": 2, "maxItems": 2, "minimum": …, "maximum": …, "x-control": "range"}` | two-handle range slider                             |
| colour                 | `{"type": "string", "x-control": "color"}`                                                                                       | colour picker, not a text box                       |
| few short options      | `{"type": "string", "enum": [...], "x-control": "segmented"}`                                                                    | inline segmented control                            |
| few verbose options    | `{"type": "string", "enum": [...], "x-control": "radio"}`                                                                        | stacked radio group                                 |
| yes/no                 | `{"type": "boolean"}`                                                                                                            | toggle                                              |
| yes/no, part of a set  | `{"type": "boolean", "x-control": "checkbox"}`                                                                                   | checkbox                                            |
| single select          | `{"type": "string", "enum": [...]}`                                                                                              | popup selector                                      |
| multi select           | `{"type": "array", "items": {"enum": [...]}, "uniqueItems": true}`                                                               | checkbox list (one per option)                      |
| select + escape hatch  | `enum: [..., "其他"]` plus a sibling `"<field>_custom"` carrying `x-visible-when`                                                | selector, then a text field once 「其他」 is picked |
| conditional field      | `"x-visible-when": {"field": <sibling>, "op": "equals"\|"contains", "value": …}`                                                 | hidden until the sibling matches                    |
| explain with a diagram | `"x-content": {"type": "mermaid", "source": "flowchart …"}` on the field                                                         | rendered figure above the control                   |
| explain with prose     | `"x-content": {"type": "markdown", "source": "**why** this matters…"}`                                                           | sanitised rich text above the control               |
| options worth seeing   | `"x-options": [{"label": …, "description": …, "content": {"type": "mermaid", "source": …}}, …]` (aligned with `enum` by index)   | each option shows its own figure                    |
| edit a diagram         | `{"type": "string", "x-control": "mermaid"}`                                                                                     | mermaid source editor with a live preview           |
| pick-one-with-config   | `{"oneOf": [{"title": "A", …}, {"title": "B", …}]}`                                                                              | variant chooser + subform                           |
| grouped fields         | `{"type": "object", "properties": {…}}`                                                                                          | nested section                                      |
| list of records        | `{"type": "array", "items": {"type": "object", "properties": {…}}}`                                                              | list + per-entry overlay                            |
| free-form key/value    | `{"type": "object", "additionalProperties": {"type": "string"}}`                                                                 | key/value editor                                    |

`x-visible-when` is not only for escape hatches: use it whenever a question only
applies conditionally (`has_changes` → `change_notes`, `cache.enabled` →
`cache.ttl_seconds`). `x-multiline` is for anything you would expect the user to
write more than one line into — a goal, a description, a change log.

## Picking the control: use the gallery

A form of plain text boxes makes the user do the translating. Reach for the
control that matches the value — the gallery is the catalogue, and using it is
what turns a wall of inputs into something people actually want to fill in:

- a percentage, a count on a scale, a weight → `"slider"` (add
  `"x-slider-marks"` when the stops have names);
- a window with two ends (hours, price, days) → `"range"` — an array of two with
  `minItems`/`maxItems: 2` and `minimum`/`maximum` on the array itself;
- a colour → `"color"`; a 2-4 option enum → `"segmented"`; options with longer
  labels → `"radio"`; a long list → leave it a `select`;
- a boolean that reads as "one of the things I'm choosing" → `"checkbox"`; one
  that flips a mode right now → leave it a `switch`;
- a paragraph-length answer → `x-multiline` (or `"textarea"`), never a one-line
  box;
- anything that only matters sometimes → `x-visible-when`, on the same object.

Don't make every field a special case either: a hint earns its place when it
removes typing or removes a wrong answer, not for decoration.

`x-control` is a _request_, and bounds stay validation keywords: a slider needs
`minimum`/`maximum` on the value, and a hint the engine cannot honour falls back
to that shape's default control rather than failing. Slider/range/colour/
segmented/radio hints need `schemaui` ≥ 0.14 / `schemaui-cli` ≥ 0.8; the figure
surfaces below need `schemaui` ≥ 0.16 / `schemaui-cli` ≥ 0.9. An older engine
ignores unknown `x-` keywords, so the form still runs — it just shows plain
inputs everywhere.

Read these before writing your own: `examples/web-research-brief.schema.json`
(中文 — the worked reference: every control in the gallery, escape hatches,
conditional fields, `oneOf`, a record list, a key/value map, and figures on
nodes and options), `examples/feature-brief.schema.json` (English, every control
type) and `examples/invoice-reimbursement.schema.json` (中文, escape hatches on
every select). For what figure-bearing options look like as a complete form,
read `examples/deployment-architecture.schema.json` (中文 — every option carries
a diagram). The engine's own galleries,
[`schemaui/examples/controls-gallery.schema.json`](https://github.com/YuniqueUnic/schemaui/blob/main/examples/controls-gallery.schema.json)
and
[`schemaui/examples/rich-content.schema.json`](https://github.com/YuniqueUnic/schemaui/blob/main/examples/rich-content.schema.json),
show every hint value and every figure surface side by side.

## Figures: when a picture answers faster than prose

Some choices are easier to **see** than to read. The engine renders three kinds
of figure content — Mermaid diagrams, raw SVG, and sanitised Markdown — and puts
them in three places. Reach for them when the user would otherwise have to
mentally simulate your prose:

1. **On the node** —
   `"x-content": {"type": "mermaid"|"svg"|"markdown", "source": …}` renders a
   figure above the control. Use it when the field needs context a sentence
   can't carry: the request flow the timeout applies to, the pipeline the stage
   names refer to, a legend of the states.
2. **On the options** — `"x-options"` entries (aligned with `enum` by index) may
   each carry `label`, `description`, and `content` (same shape as `x-content`).
   Use it when the options are _shapes of a system_ — topologies, rollouts, data
   models — and the user picks by recognising the picture. A select shows each
   option's figure inline; `radio` shows it under the label with the
   description.
3. **As the value itself** — `"x-control": "mermaid"` makes the field's string
   value a Mermaid source, edited in a live-preview editor. Only for fields
   whose _answer is a diagram_ (a flow to review, a topology to correct) — never
   as decoration on a config answer.

Hard rules (the engine rejects the schema on these): every `source` must be a
non-empty string; an `x-options` array aligns with `enum` by index, so keep the
lengths aligned and give plain options `{}`/a `label` only; **`segmented` cannot
show figures** — use `radio` or `select` when options carry content; options
that mean "none/not configured" should not carry a figure. A figure is
explanatory, never the value: the answer file still receives the enum string.

Choose figures the way you choose controls — because they remove work, not for
decoration. A three-option enum with one-word labels needs no diagrams; an
architecture choice whose options differ in shape is exactly what they're for.

## Steps

1. Generate a draft-07 JSON Schema for the question (top-level `type: object`;
   per-field `title` / `description` / `default`; `enum`, `minimum` / `maximum`,
   nested `properties` as needed — see the cheat sheet). A form with an `其他`
   option and no `x-visible-when` on its companion field, or a paragraph-length
   answer squeezed into a one-line input, is an unfinished form.

2. Run the helper script from this skill's directory — it spawns the server,
   prints the URL, opens the user's browser, and writes the answer file. The
   timeout is handed to the engine, which counts it down on screen and ends the
   session itself:

   ```bash
   cat > /tmp/question.json <<'EOF'
   { "...": "your generated schema" }
   EOF
   python3 scripts/ask.py \
     --schema /tmp/question.json \
     --topic <topic> \
     --title "<question summary>" \
     --description "<one-line context>" \
     --timeout 300
   ```

   No Python? Use the twin for your platform — same flags, same stdout contract:
   `bash scripts/ask.sh --schema …` (macOS/Linux) or
   `pwsh scripts/ask.ps1 -Schema …` (Windows / PowerShell 7+).

   Prefer piping the schema straight in (`--schema -`) when you just generated
   it — the script persists it under `.schemaui/schemas/<topic>-<ts>.json` for
   the audit trail.

3. In your response text, relay what the script prints:

   > Form ready at http://localhost:8787 — I'll wait for you to fill it in. Your
   > answers will be saved to `.schemaui/answers/<file>.json`.

   Say how long they have. The form shows a live countdown next to its title and
   turns amber, then red, as the deadline nears — but the user has not seen it
   yet when they read your message, so name the budget (`--timeout 300` → "about
   5 minutes") and note that the form closes itself when it runs out. Raise
   `--timeout` for a long form rather than letting it expire mid-fill: nothing
   is saved on timeout, by design.

   On remote/headless runs pass `--no-open` and relay `SCHEMAUI_LAN_URL` (or the
   forwarded URL) instead of opening a browser locally.

4. The script blocks until the user clicks **Save & Exit**. On exit 0 it prints
   the answer JSON and `SCHEMAUI_RESULT=<path>`. Read the answer file and
   continue the task, citing field paths:

   > Per `.schemaui/answers/deploy-config-20260916-101500.json`:
   > `environment = staging`, `replicas = 3`.

   Honor the escape hatches: when a field's value is `其他`/`other`, the real
   answer is in the sibling `<field>_custom` — use that, not the literal
   "other".

## Exit codes and fallback

| Code | Meaning              | Your action                                                                                              |
| ---- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| 0    | answer written       | read the file, continue                                                                                  |
| 3    | schemaui not found   | offer to run `scripts/install.sh` / `install.ps1` and retry; `--source gitee` if github.com is blocked   |
| 4    | timeout (default 5m) | the form showed a countdown and closed itself; nothing was saved. Fall back to plain text, tell the user |
| 5    | cancelled / failed   | fall back to plain text, tell the user                                                                   |
| 6    | bad schema/config    | fix the schema or fall back, tell the user                                                               |

Never hard-fail the task because a question could not be asked.

## Theming: make the form match the project

The web UI is a layer of design tokens, and a plain stylesheet overrides them —
no build step, no `!important`. Pass one with the ask script's `--theme PATH`
(or `--web-theme PATH` on the raw CLI); the engine serves it at
`/api/v1/theme.css`, layered over its own stylesheet, and unsupported builds are
probed and skipped with a note rather than failing the ask.

The tokens worth overriding (Tailwind v4 `@theme` block in schemaui's
`web/ui/src/styles/globals.css`):
`--color-primary`/`--color-primary-foreground`, `--color-background`,
`--color-muted`, `--color-ring`, `--color-destructive`, `--color-border`, the
`--color-chart-*` set for report charts, and the `--radius-*` scale. Cover
`.dark { … }` too, or dark mode keeps the default accent. schemaui ships a
worked example to copy:
[`examples/themes/midnight.css`](https://github.com/YuniqueUnic/schemaui/blob/main/examples/themes/midnight.css).

To match an external design system, translate its variables onto schemaui's
token names inside the stylesheet and comment each mapping next to its override
(e.g. a design system's `--xx-accent` → `--color-primary`). Generate the file,
pass `--theme`, and say in chat that the form will pick up the project's look.

Fully custom frontends are a bigger lever and rarely what was asked: the engine
speaks a plain REST contract (`GET /api/v1/session`,
`POST /api/v1/save|exit|validate|preview|render`) and can host any directory
containing an `index.html` via `--frontend DIR` — schemaui's
[`examples/frontend/`](https://github.com/YuniqueUnic/schemaui/blob/main/examples/frontend/README.md)
is the minimal scaffold. Reach for that only when CSS genuinely cannot express
the request.

## Raw CLI (when the scripts are unavailable)

```bash
mkdir -p .schemaui/schemas .schemaui/answers
schemaui web \
  --host 0.0.0.0 --port 8787 \
  --schema .schemaui/schemas/<topic>-<timestamp>.json \
  --title "<question summary>" \
  --timeout 300 \
  --force \
  -o .schemaui/answers/<topic>-<timestamp>.json
```

The server announces `<title> schemaui UI available at http://<addr>/` on
stderr, followed by `Session closes automatically in <budget>` when a
`--timeout` was given — that second line is how you learn the deadline without
parsing the UI. Port 8787 busy → retry once with `--port 0` and parse the
`http://…` line from stderr. A session that hits its deadline exits **4** and
writes nothing; drop `--timeout` (or pass `0`) for no deadline at all. Optional
stdout echo: append `-` after the answer path (`-o <file> -`) — only when your
runtime shows tool output live and the JSON is small; default is file-only.

## Sensitive input

Use `--host 127.0.0.1` and tell remote users to tunnel first:
`ssh -L 8787:localhost:8787 <host>`.

## Past answers

Before asking, check `.schemaui/answers/` — the user may have already answered
something similar. Reuse a prior answer as defaults via `--config`.

## Examples

Six runnable forms live in `examples/` (each with a `.defaults.json` carrying
the recommended answers):

| Example                               | Scenario                                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `env-schema.json`                     | minimal 4-field deploy form — first smoke test                                                                        |
| `web-research-brief.schema.json`      | research: scope a web-research task — **every control in the gallery** + figures on nodes and a mermaid editor (中文) |
| `feature-brief.schema.json`           | 12-question requirements brief, every control type + both hints (EN)                                                  |
| `invoice-reimbursement.schema.json`   | office: invoice & expense reimbursement (中文, escape hatches)                                                        |
| `ecommerce-main-image.schema.json`    | design: e-commerce hero image specs — sizes, fonts, colors, oneOf backgrounds (中文)                                  |
| `seo-diagnosis.schema.json`           | SEO triage: site, issues, keywords, competitors (中文)                                                                |
| `deployment-architecture.schema.json` | architecture choice: **every option carries a diagram** (中文 — the figure surfaces reference)                        |

```bash
python3 scripts/ask.py \
  --schema examples/web-research-brief.schema.json \
  --config examples/web-research-brief.defaults.json \
  --title "联网调研任务确认"
```

## License

MIT — see [LICENSE](https://github.com/YuniqueUnic/a2ui-ask/blob/main/LICENSE).
