---
name: feynman-pdf
description: >-
  Turn any topic into a polished, visualization-heavy PDF that explains it using the
  Feynman technique — plain language, vivid analogies, and a diagram for every idea —
  then save it to the user's Desktop. Use this skill whenever the user wants to explain,
  teach, break down, demystify, or "make a PDF / one-pager / handout / explainer / cheat
  sheet / study guide / illustrated guide" about a concept, system, or process. Trigger
  even when the user doesn't say "Feynman" — any request for a clear, diagram-rich PDF
  that *teaches* something qualifies (e.g. "make me an illustrated explainer on how DNS
  works", "explain like I'm 12 in a PDF", "a visual one-pager on compound interest").
  Do NOT use it for PDFs that aren't explanatory (forms, invoices, reports of raw data,
  merging/splitting existing PDFs) — those belong to the generic pdf skill.
---

# Feynman PDF — explain anything as an illustrated PDF

## The bargain

The Feynman technique rests on one idea: **if you can't explain it simply, with a picture, you don't really understand it.** This skill turns a topic into a PDF that teaches it the way Feynman taught — plain words, a vivid analogy, and a diagram for every idea — then drops the finished PDF on the user's Desktop.

The output is not a report and not a slide deck. It's a short, friendly, *illustrated explainer* that a curious person could read in a few minutes and walk away actually understanding the thing.

## Step 0 — Know the thing well enough to teach it

You can only Feynman-explain what you genuinely understand. Before building — and without pausing to ask the user anything; this skill runs to completion on its own:

- **Identify the concept** and any source material the user pointed at (a file, notes, a URL, or just the topic name).
- **If source material exists, read the actual thing before drafting anything.** For a codebase that means opening the relevant files, not describing what similar codebases usually look like; for an article or book, the real passages, not a half-remembered gist.
- **If the user only named a topic** and it's something you know cold, proceed — your job is to simplify, not to research.
- **If it's niche, technical, fast-moving, or you're unsure, research it before writing the one-sentence opener.** A confidently-wrong explainer is the worst possible outcome — it teaches falsehoods beautifully. When in doubt, get it right before you make it pretty.
- **If research genuinely can't resolve something, don't guess and don't stop — name it plainly inside the explainer itself.** The gaps/snags section exists exactly for this ("this is where the honest answer runs out"). An honest unknown in the finished doc beats a fabricated answer or a mid-build question back to the user.

## The method (depth in `references/feynman-method.md`)

Read that reference once per session for the full playbook. The shape:

1. **One sentence.** Open with a single plain-language sentence that says what the thing *is* — and earns the reader's interest, not just their comprehension. No jargon allowed in it.
2. **Explain it to a smart 12-year-old.** Short sentences. Concrete words. Every time you'd reach for a technical term, either replace it or define it in passing the first time.
3. **Anchor it with an analogy.** Map the unfamiliar concept onto something the reader already lives with (a queue at a coffee shop, mail in envelopes, a thermostat). The analogy gets its *own picture*. Test it first: if defending *why* the analogy works would require jargon you haven't introduced, it's not solid ground — it's cheating.
4. **Find the gaps and the snags.** Where do people get confused? What's the counterintuitive part? Call those out explicitly — they're the highest-value content. Where a chain of "why" genuinely bottoms out, say so plainly instead of inventing a tidy-sounding answer.
5. **Recap in one breath.** End with a tight summary the reader could repeat to a friend.

## Scale the depth to the topic

A single page is the default, not a hard ceiling. Match the shape of the output to the shape of the material:

| The material is…                                             | Build…                                                                                                      |
|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|
| One concept, one "aha" (how DNS resolution works)                | A single page: cover, big idea, analogy, snags, recap.                                                       |
| A handful of related ideas (a design pattern and its variants)   | 2–4 pages, one idea per section, still one analogy and one figure per idea.                                  |
| A whole system, book, or codebase                                 | A short cover/overview page, then one section per major idea, each still running the full method (sentence → ELI12 → analogy → snags). Add a table of contents to the cover once there are more than ~4 sections. |

Whatever the length, every individual section still obeys the same rule: one sentence, one analogy, one recap-able idea. Length grows by adding sections, never by letting one section sprawl — a "whole book" explainer is a sequence of short Feynman sections, not one long one.

## Visualization-first — the part people skimp on

This is where most explainers fail and where this skill earns its name. The rule is
the same for every kind of visual below: **emphasize one wherever it actually helps
the idea land — and leave it out wherever it wouldn't.** Never include a visual for
its own sake; never skip one that would make an idea click. Hold yourself to this:

- **The pictures-only test.** Someone flipping through, reading *only* the figures and their captions, should still get the gist. If the meaning lives only in the prose, you haven't visualized enough.
- **Reach for a concept diagram on most major ideas** — analogy diagrams, process flows, before/after comparisons, labeled illustrations, cycles. This needs no real data to justify it, just an idea worth drawing, which is true of most ideas in a Feynman explainer. Recipes and copy-paste SVG patterns are in `references/visual-patterns.md` — read it before drawing.
- **Hand-author inline SVG** for conceptual diagrams. It's crisp at any zoom, prints perfectly, needs no dependencies, and gives you total control over labels and arrows. This is the default.
- **When the topic has real quantities, actively reach for a data chart.** If there are actual numbers behind the idea — sizes, trends over time, proportions, a comparison across categories, two variables plotted against each other — that's a signal to chart it, not just describe it in prose. Pick the chart type that matches the data's shape (line for a trend, bar for a category comparison, scatter or bubble for two-or-three-variable relationships, pie/stacked-bar for parts of a whole) — see the decision table in `references/visual-patterns.md`. Render with matplotlib to SVG or high-DPI PNG and embed it; for chart design (color, form, labeling), follow the `dataviz` skill.
- **Never fabricate numbers to justify a chart.** A chart implies real data. If you don't have real figures — from the source material, from research, or genuinely common knowledge — don't invent plausible-looking ones to make a chart happen. No data, no chart; use a concept diagram (SVG) instead, or no figure at all if even that wouldn't add anything.
- **Don't use a charting library to draw a concept.** Bar/line/scatter charts are for actual measured or counted quantities. A concept with no numbers behind it (how DNS resolution works, what a thermostat does) gets a hand-authored SVG concept diagram, not a fake-looking chart.
- **Illustrate, don't decorate — this is the other half of "emphasize."** Every visual must carry meaning. A diagram or chart that doesn't teach anything the prose hasn't already made clear is clutter, not visualization — cut it rather than force one in for the sake of hitting a quota. Label things directly on the diagram instead of in a legend the eye has to ping-pong to.
- **Caption every figure** with the one thing it's trying to make click.
- **Give every `<svg>` a `<title>` and `role="img"`.** The diagrams carry the primary meaning (that's the whole point of the pictures-only test) — without a `<title>` a screen reader gets nothing from them. `<svg role="img"><title>Textbook page vs. a patient tutor</title>...</svg>`.

## Build workflow

> **Desktop rule — the PDF and nothing else.** The Desktop is for the **finished PDF only**. Every intermediate — `document.html`, `theme.css`, hand-authored SVG files, matplotlib PNG/SVG charts, scratch images, screenshots — must live inside the build folder, and the build folder must **never** be the Desktop (use a temp dir). After the PDF is written, delete the build folder. Nothing but the `.pdf` should ever appear on the Desktop.

1. **Make a build folder in a temp dir** to keep things tidy — e.g. `tempfile.mkdtemp()` or `%TEMP%\feynman-build\`. **Do not** put it on the Desktop and **do not** name it `./feynman-build/` in a location that syncs to the Desktop. All HTML/CSS/SVG/PNG intermediates stay here.
2. **Copy `assets/theme.css`** into the build folder. It's a print-tuned stylesheet with ready-made components (see class list below) — lean on it instead of writing CSS from scratch.
3. **Write `document.html`** in the build folder, linking the theme: `<link rel="stylesheet" href="theme.css">`. Use the skeleton below and the components from the theme.
4. **Convert to PDF** with the bundled script — it finds Chrome/Edge, prints with backgrounds and SVG intact, and writes to the Desktop:
   ```bash
   python "<skill-dir>/scripts/html_to_pdf.py" "feynman-build/document.html" -o "How DNS Works.pdf"
   ```
   A bare filename (no folder) lands on the Desktop. Pass `--open` to pop it open afterward. Name the file after the topic in Title Case.
5. **Check the rendered pages for orphaned whitespace before calling it done.** `figure`/`.analogy`/`.watch-out`/`.recap` all use `break-inside: avoid`, so a block that doesn't fit the rest of a page gets pushed whole to the next one — that can strand a large blank gap above it. Read the PDF back (or check page count against how much content you wrote) and look for gaps bigger than ~2 inches. If you find one, shorten the section above the pushed block, reorder so the figure starts nearer the top of a page, or split a tall figure into two smaller ones.
6. **Delete the temp build folder** once the PDF is written — leave nothing behind. The PDF on the Desktop is the only artifact that survives.
7. **Tell the user the final path** (e.g. `C:\Users\<you>\Desktop\How DNS Works.pdf`) and a one-line description of what's inside.

## Document skeleton

Start from this and fill it in. The theme styles all of these classes.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>How DNS Works</title>
  <link rel="stylesheet" href="theme.css">
</head>
<body>

  <header class="cover">
    <!-- Optional but recommended: a small hero icon so the first thing the reader
         sees is a picture, not just text — see .cover-icon in theme.css. -->
    <div class="cover-icon"><svg role="img" viewBox="0 0 72 72">
      <title>A magnifying glass over a globe, representing DNS lookup</title>
      ...
    </svg></div>
    <p class="kicker">An illustrated explainer</p>
    <h1>How DNS Works</h1>
    <p class="one-sentence">DNS is the internet's phone book: it turns a name you can
      remember into the number a computer needs to find a website.</p>
  </header>

  <section>
    <h2>The big idea</h2>
    <p>...plain-language explanation...</p>
    <figure>
      <svg role="img" viewBox="0 0 720 320">
        <title>You type a name; DNS hands back an address</title>
        ...
      </svg>
      <figcaption>You type a name; DNS hands back an address.</figcaption>
    </figure>
  </section>

  <aside class="analogy">
    <h3>Think of it like…</h3>
    <p>...the analogy, in concrete everyday terms...</p>
    <figure>...analogy diagram...</figure>
  </aside>

  <section>
    <h2>Step by step</h2>
    <ol class="steps">
      <li><strong>You ask.</strong> ...</li>
      <li><strong>The resolver hunts.</strong> ...</li>
    </ol>
    <figure>...process-flow SVG...</figure>
  </section>

  <aside class="watch-out">
    <h3>Where people get stuck</h3>
    <p>...the counterintuitive bit, named plainly...</p>
  </aside>

  <section class="recap">
    <h2>In one breath</h2>
    <p>...the whole thing, repeatable to a friend...</p>
    <p>Try saying it back to someone before you go — that's when it actually sticks.</p>
  </section>

</body>
</html>
```

### Theme components you can reach for

- `.cover` — title block with kicker + one-sentence lede; put an optional `.cover-icon` (a small SVG) before the kicker so the first thing the reader sees is a picture
- `.one-sentence` — the big plain-language summary line
- `.analogy` — soft accent callout for "think of it like…"
- `.watch-out` — amber callout for snags and misconceptions
- `.recap` — closing summary box
- `figure` / `figcaption` — centered, won't break across pages (keep figures short — see the note in theme.css and step 5 of the build workflow)
- `.steps` — numbered process list with big numerals
- `.grid-2` — two-column comparison (before/after, A vs B); add `class="wrong"` / `class="right"` to the two cells for a myth-vs-reality comparison, matching the SVG comparison pattern's amber/indigo pairing
- `.term` — inline highlight for a key word you're defining
- `--accent` in theme.css can be retuned per topic (comment at the top of the file) — don't leave every explainer the same indigo if the topic calls for a different feel

## Quality bar — check before you convert

First, re-read the whole draft cold, as if you're seeing it for the first time — not the mindset you drafted in. Specifically hunt for jargon that slipped past you and try to break your own analogy by defending why it works. Drafting and grading are different jobs; do them as two separate passes, not one.

Then run this checklist. **Any item that fails means rewrite that section now — noting the gap and shipping anyway isn't a quality bar, it's a to-do list:**

- **The one-sentence opener has zero jargon.** If a 12-year-old wouldn't get it, rewrite it.
- **There's a real analogy**, not just a definition reworded.
- **The analogy passes the cheating test, re-verified just now** — defending why it works doesn't require jargon you haven't introduced yet. If it does, replace the analogy or drop it; don't rationalize past it.
- **The pictures-only test passes** — flip through the figures alone; do they tell the story?
- **Every figure has a caption** that says what to notice, and a `<title>` for screen readers.
- **The snags/misconceptions section exists** — that's the Feynman gold.
- **Genuine unknowns are named, not papered over** — if a chain of "why" bottoms out or experts don't fully know, the doc says so instead of inventing a tidy-sounding reason.
- **No wall of text** runs more than a few sentences without a visual or a break.
- **Real numbers get a real chart, and only real numbers do.** Every trend, comparison, or proportion backed by actual data has a chart (right type for the data's shape); no chart anywhere rests on invented numbers.
- **The length fits the material** (see "Scale the depth to the topic") — a deep topic isn't crammed into one overstuffed page, and a simple one isn't padded into several.
- **No orphaned whitespace** — read the rendered PDF back and check for blank gaps left by a pushed-to-next-page figure or callout.

When all eleven hold, convert and hand over the path.
