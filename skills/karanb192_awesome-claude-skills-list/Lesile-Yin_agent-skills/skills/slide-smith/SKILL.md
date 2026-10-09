---
name: slide-smith
description: >-
  Batch PowerPoint automation with python-pptx. Audits deck structure,
  standardizes typography/colors/spacing against design tokens, and performs
  safe bulk text operations across many decks. Use when processing courseware
  or training material at scale, unifying inconsistent decks to a house style,
  or preparing accessibility-friendly (large-type, high-contrast) variants.
---

# Slide Smith

Batch-forging decks: audit → standardize → verify. Built for courseware
pipelines where dozens of .pptx files must share one visual system.

## Safety rule (non-negotiable)

Never modify originals in place. Every script reads a source path and writes a
new file (`*_standardized.pptx` or an explicit `--out`). If the user asks to
overwrite originals, produce the outputs first, then let *them* swap.

## Capabilities

### 1. Inventory — know what you're dealing with

```bash
python3 scripts/inventory.py deck.pptx [more.pptx ...] [--json]
```

Reports per deck: slide count, layouts used, distinct fonts, distinct font
sizes, image count, text boxes overflowing slide bounds. Run this first on any
batch — the inventory decides which standardize presets are needed.

### 2. Standardize — apply design tokens

```bash
python3 scripts/standardize.py deck.pptx --preset house [--out out.pptx]
```

Applies a named preset from `references/design-tokens.md`:

- Title/body font families and size floors (titles never below the preset's
  minimum; body text scaled up, never down).
- Theme colors for titles, body, and accents.
- Consistent margins for text placeholders.

Presets included: `house` (neutral corporate), `access-large`
(accessibility/elder-friendly: 40pt+ titles, 24pt+ body, high contrast),
`sans-minimal`. Add your own by editing the PRESETS dict in the script.

### 3. Bulk text ops — replace/append across decks

For find-replace or boilerplate insertion across a batch, drive python-pptx
directly with a short inline script; pattern:

```python
from pptx import Presentation
prs = Presentation(src)
for slide in prs.slides:
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                for run in para.runs:
                    run.text = run.text.replace(OLD, NEW)
prs.save(dst)
```

Keep replacements at run level to preserve formatting; only rebuild
paragraphs when structure must change.

## Workflow for a batch job

1. `inventory.py` over the whole folder → note font chaos / overflow counts.
2. Pick or define a preset; run `standardize.py` on one representative deck;
   open and eyeball it (script output says what changed).
3. Loop over the batch; collect the per-deck change summaries.
4. Deliver: standardized files + one Markdown summary (deck, slides,
   changes applied, warnings like "images may overlap enlarged text").

## Known limits

- Charts, SmartArt and grouped shapes are not restyled (python-pptx access
  is limited); inventory flags them so a human can check.
- Font availability: standardize sets font *names*; if the target machine
  lacks the font, PowerPoint substitutes. Prefer widely installed families.
- Overflow detection is geometric (box bounds vs slide), not optical.
