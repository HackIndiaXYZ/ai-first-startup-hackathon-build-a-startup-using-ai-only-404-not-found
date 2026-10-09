---
name: keyword-icons
description: Generate clean monochrome PNG icons from a keyword — three distinct concepts per keyword, 1:1 aspect ratio, transparent background, recolorable, ready to drop into PowerPoint, Keynote, or docs. Use this whenever the user asks for an icon, pictogram, or "a simple graphic that represents X" (hospital, growth, contract, security, teamwork…), in any language, even if they never say the word "icon". Also use it when the user wants to recolor, resize, or tweak an icon made earlier.
---

# Keyword Icons

Turn a keyword (any language) into **three alternative icon concepts**: hand-written SVG sources plus 1:1 transparent-background PNGs. The style targets classic presentation icon sets (Templafy / Fluent line icons): uniform stroke weight, rounded caps, simple geometry, recognizable even at 16 px.

## Workflow

### 1. Read the request

Extract from the user's message: the **keyword** (required), color (default near-black `#1A1A1A`), style (default `line`; use `solid` only if they ask for filled/solid icons), size (default 1024 px), output directory (default `./icons/<keyword-slug>/`, slug in lowercase English). Everything has a default — don't ask follow-up questions, just produce.

### 2. Pick three metaphors

The three concepts must be **three different visual metaphors**, not three variants of one shape. List what the concept evokes, then pick the three most recognizable. Example for "hospital":

- Concept 1: building + cross (the institution)
- Concept 2: medical cross in a circle badge (the symbol)
- Concept 3: first-aid kit (the object)

Prefer internationally understood symbols. For abstract keywords ("efficiency", "trust"), use the most conventional concrete stand-in (bolt + gear, handshake / shield).

### 3. Hand-write the SVGs

One file per concept, named `01-<slug>.svg`, `02-<slug>.svg`, `03-<slug>.svg` — slug describes the metaphor (`01-building-cross.svg`).

These rules are what make three icons look like one family:

```svg
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- line style: strokes only, color is always currentColor -->
  <path d="..." stroke="currentColor" stroke-width="6"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

- **viewBox is always `0 0 100 100`**; keep artwork inside 12–88 (a 76×76 safe area), visually centered
- **stroke-width 6 everywhere**, identical across the whole set; round caps and joins
- **Color is only ever `currentColor`** — this is what makes recoloring possible; never hard-code a hex
- Line style uses `fill="none"`; solid style uses `fill="currentColor"` with minimal cutouts
- At most ~3 element groups per icon; cut every detail you can — the test is: would it still read at 16 px?
- Prefer simple geometry (circles, rounded rects, straight lines) over complex Béziers; round the numbers so they're easy to hand-tune
- When two shapes would overlap (e.g. a badge over a document corner), break the underlying path and leave a gap around the badge instead of letting strokes cross

### 4. Render PNGs

```bash
python3 <skill-dir>/scripts/render_icons.py ./icons/<slug>/ --color "#1A1A1A" --size 1024
```

The script screenshots each SVG with Playwright/Chromium and writes a transparent square PNG next to it.

### 5. Inspect before delivering

View every rendered PNG with the Read tool and check: is the metaphor recognizable? Are stroke weights identical? Is the composition centered and optically balanced? Does anything bleed past the safe area? Fix the SVG and re-render until it passes — **never hand the user an icon that fails this check**.

Deliver by listing the three PNG paths (as markdown links) with a one-line description of each metaphor, and remind the user they can say e.g. "use concept 2 but in #0F6CBD blue", or point out any detail to change.

## Recoloring / resizing

The SVG is the single source of truth. Recoloring is always a re-render, never an edit:

```bash
python3 <skill-dir>/scripts/render_icons.py ./icons/<slug>/02-*.svg --color "#0F6CBD" --suffix blue
```

`--suffix` keeps the original PNG from being overwritten. If the user names a color vaguely ("our brand blue"), ask for the hex or sample it from a file they provide. Resizing works the same way: `--size 512`.

Advise users to recolor via re-render rather than PowerPoint's built-in picture recolor, which washes icons out.

## Revising a concept

Edit the SVG directly and re-render. When the user says "the cross in concept 3 is too small", adjust the numbers, re-run the script, inspect with Read, then deliver.

## Dependencies

Python 3 + Playwright with Chromium. If Playwright is missing, install it:

```bash
pip install playwright && playwright install chromium
```
