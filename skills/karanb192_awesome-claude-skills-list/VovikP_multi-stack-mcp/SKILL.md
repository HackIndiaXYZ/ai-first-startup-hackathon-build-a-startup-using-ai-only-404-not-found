---
name: multi-stack-mcp
description: Generate native UI sections (hero, pricing, features, CTA, footer) for Next.js, Flutter, WordPress, or Vue from a unified pattern catalog with shared design tokens. Use when the user asks to "add a hero", "insert pricing section", "build landing page section", "create Flutter widget for marketing block", or wants the same brand styling applied across multiple stacks.
license: MIT
version: 0.1.3-alpha
author: VovikP
---

# multi-stack-mcp

## When to invoke this skill

Trigger when the user asks any of:

- "Add a hero section" / "вставити hero" / "build landing section"
- "Create a [pricing|features|CTA|footer|testimonials] block for [Next.js|Flutter|WordPress|Vue]"
- "Apply my brand tokens to a hero across all stacks"
- "Generate a Gutenberg block for [pattern]"
- "Build the same section in Flutter and Next.js"

Do **NOT** trigger when:
- The user wants raw component code without semantic structure (use shadcn MCP / pub.dev instead)
- The user wants to edit an existing component (use Edit tool directly)
- The user wants design assets, not code (use design / banner-design skill)

## How to use

1. **Identify the pattern** the user wants (`hero-section`, `pricing-section`, ...). If unclear, ask: *"Which section pattern — hero, pricing, features, or footer?"*

2. **Identify the target stack** (Next.js / Flutter / WordPress / Vue). If unclear, look at the working directory:
   - `package.json` with `next` → Next.js
   - `pubspec.yaml` → Flutter
   - `wp-content/` or `style.css` with `Theme Name:` → WordPress
   - `package.json` with `vue` → Vue
   - If still unclear, ask the user.

3. **Read the pattern files**. A stack folder can hold **more than one file** (e.g. WordPress always ships `block.json` + `render.php`). Always render the ENTIRE stack folder, not just the declared entry:
   ```
   Read: multi-stack-mcp/patterns/<pattern>/pattern.json
   Run:  node multi-stack-mcp/scripts/render.mjs --all <pattern> <stack> [tokens.json] [slots.json]
   ```
   This outputs a JSON map `{ filename: rendered_source }` covering every file in the stack folder, with token substitution applied and security denylist enforced.

4. **Resolve tokens**. Look for `tokens.json` in:
   - Current project root (preferred)
   - `multi-stack-mcp/tokens/default.json` (fallback)

   Token substitution happens inside `render.mjs` — never hand-substitute, because that would bypass the T3 denylist (see SECURITY.md).

5. **Write the resolved files** into the user's project at a sensible path. For multi-file stacks (WordPress), all files go into the SAME target directory (e.g. `wp-content/themes/<theme>/blocks/<pattern>/`). Always confirm paths with the user before writing, and use `scripts/safe-write.mjs` (or its containment logic) to refuse writes that escape the project root.

## Pattern catalog (current)

All shipped patterns support Next.js (`.tsx`), Flutter (`.dart`), WordPress (`block.json` + `render.php`), and Vue 3 (`.vue`).

| Pattern | Slots | Status |
|---|---|---|
| `hero-section` | title, subtitle, cta_label, cta_href | ✅ shipped (v0.1.0) |
| `pricing-section` | section_title + 3 tiers (name/price/period/cta) | ✅ shipped (v0.1.1) |
| `features-section` | section_title + 3 features (glyph/title/text) | ✅ shipped (v0.1.1) |
| `cta-section` | title, subtitle, cta_label, cta_href | ✅ shipped (v0.1.1) |
| `footer-section` | — | ⏳ planned |
| `navbar-section` | — | ⏳ planned |
| `testimonials-section` | — | ⏳ planned |
| `faq-section` | — | ⏳ planned |

## Hard rules (do not bypass)

1. **Always write through `render.mjs --write` or `safeWrite()`** — never hand-write files into the user's project. These tools enforce token denylist + path containment + no-clobber. Hand-writing bypasses every security guarantee in SECURITY.md.
2. **Never overwrite existing files without explicit user confirmation** — `safeWrite` refuses by default; if the user asks to replace, pass `{overwrite:true}` only after they confirm.
3. **Never fetch patterns from external URLs** — only use bundled `patterns/` directory.
4. **License compliance**: every pattern dir MUST have a `LICENSE` file. The validator already enforces this; do not skip a pattern that fails validation.
5. **Token and slot sanitization**: `render.mjs` rejects unsafe values with `SECURITY:` prefix and exit code 2. If you see that exit code, surface the message to the user — do not retry with mutated input.
6. **Multi-file stacks**: WordPress ships `block.json` + `render.php`. Use `render.mjs --all` or `--write` (which already cover all files) — never `render.mjs <pattern> <stack>` alone for WP.

See `SECURITY.md` for the full threat model.

## Requirements (target projects)

- Next.js: ≥ 13 (App Router or Pages Router both work; component is pure)
- Flutter: ≥ 3.10 (uses `super.key`, pure Material widgets, no external packages)
- WordPress: ≥ 6.0 with block theme support (uses `apiVersion 3` block.json)
- Vue: 3.x with `<script setup>` and `lang="ts"`

## Examples

**User**: "Add a hero to my druzi_flutter project"
**Skill action**:
1. Detect `pubspec.yaml` → Flutter stack
2. Confirm target path: `druzi_flutter/lib/widgets/hero.dart`
3. Run: `node multi-stack-mcp/scripts/render.mjs --write druzi_flutter lib/widgets hero-section flutter [druzi_flutter/tokens.json] [slots.json]`
4. Report the written file path from the JSON output

**User**: "Build same hero for Next.js + Flutter with my Poruch brand"
**Skill action**:
1. Locate `poruch/brand/tokens.json`
2. Run `render.mjs --write` twice (Next.js then Flutter) with the same tokens file
3. Report both written paths
