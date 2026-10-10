# Design: one day on one Indian roof

This is the design brief Claude wrote for itself before the second build pass, and the record of what shipped. It follows the process in the `skills/` folder: `awwwards` (both variants), `awwwards-designer`, `design-taste-frontend`, `emil-design-eng`, `gsap-web` and `impeccable`.

## 1. Design read

> Reading this as: a consumer-trust product for Indian homeowners, judged by a design-literate panel, with an editorial, cinematic language, leaning toward full-bleed WebGL, kinetic sans-serif type and measured GSAP motion.

| Question | Answer |
|---|---|
| Register | Brand on the landing (the design is the argument), product on the tools (the design serves the numbers) |
| Emotion on first load | Calm confidence. A real place at dawn, not a sales pitch |
| Metaphor | **The roof itself.** छत means roof; its headline stroke (shirorekha) is literally a roof line. A day on one roof carries the whole story: sun, panels, quote, bill, night |
| The unforgettable thing | Scroll moves the real sun (NOAA equations for Delhi on 15 April) across a lit 3D rooftop; panels drop at noon and the HUD shows the roof's live output; at dusk the city lights up and Diwali lights twinkle on the parapet |
| Dials (taste skill) | Variance 8 · Motion 7 · Density 4 on the landing; 4 · 3 · 6 on the tools |
| Motion lens | Polish (measured, choreographed) on the landing; restraint (fast, near-invisible) on the tools |

## 2. Palette

Committed, from an Indian rooftop. OKLCH tokens live in `app/src/styles/tokens.css`.

| Role | Token | Use |
|---|---|---|
| Night ink | `--ink` oklch(0.19 0.03 258) | Text, dark surfaces, the curtain, the preloader |
| Limewash | `--paper` oklch(0.968 0.007 235) | Page background (never pure white) |
| Neel (Jodhpur blue) | `--neel` | Bill Audit card, focus rings, links |
| Haldi (turmeric) | `--haldi` | The single accent: CTAs, the sun, highlights. Signal, not fill |
| Sindoor | `--sindoor` | Warnings and audit stamps only |

The landing's background follows the time of day. A unit test (`tests/design.test.ts`) samples 201 moments and requires WCAG AA (4.5:1) text contrast at every one. That test caught a real bug: the dusk fade passed through mid-tones where neither ink nor limewash text reached 4.5:1. The fix switches palettes at sunset instead of blending through them, and a registered CSS `@property` eases the switch.

## 3. Type

- **Archivo Variable** for display and body, using its width axis as the expressive tool: `wdth 100` for most headlines, `wdth 122` for the emphasised half of the hero ("has a number."), `wdth 110-118` for numbers and the logo. Emphasis stays within one family, per the taste skill's emphasis rule.
- **Geist Mono** for data: the HUD, sources, counters, the terminal.
- **Tiro Devanagari Hindi** for every Hindi label and the छत mark.
- Fluid sizes with `clamp()`; hero type tops out at 9.4 rem; display line-height 0.9-0.93 with SplitText line masks padded for descenders.

## 4. Motion system

One vocabulary in `app/src/lib/motion.ts`:

| Ease | Curve | Used for |
|---|---|---|
| `chhat-out` | cubic-bezier(0.16, 1, 0.3, 1) | Every entrance |
| `chhat-inout` | cubic-bezier(0.76, 0, 0.24, 1) | The curtain, the preloader exit, chapter exits |
| `chhat-drawer` | cubic-bezier(0.32, 0.72, 0, 1) | Drawers |

| Moment | What moves | Why |
|---|---|---|
| Preloader | A sun rises behind छत as the counter follows **real** load progress (fonts, scene chunk, 11 CC0 assets, first frame) | The wait becomes the brand mark; it never lies about progress |
| Hero | Lenis smooth scroll drives one ScrollTrigger; sun, camera, sky, colour, clock, HUD and chapter all derive from one progress value | One playhead, nothing drifts out of sync |
| Chapters | GSAP SplitText: outgoing lines leave upward, incoming lines rise from a mask | Tells you "this changed" without moving the scene |
| Manifesto | Words light from 14% to 100% as you read | Pace the one paragraph that explains why the company exists |
| Marquee | 72 cities' NASA yields; speed and skew follow Lenis velocity | The data feels alive under your thumb |
| Tool cards | Sticky stack; the card underneath shrinks and darkens | Four tools, one gesture |
| Facts | Count up once, ending on the exact authored string (tested) | Draws the eye to sourced numbers |
| Routes | An ink curtain with the destination's name in English and Hindi | Wayfinding, and a brand moment between tools |
| Cursor | A sun dot and a trailing ring; labels on cards ("Audit", "Source") | Fine pointers only; never on form fields |

Every effect checks `prefers-reduced-motion`. With it set, the story becomes a static page with every chapter readable, and the cursor, curtain, counter and marquee are off. An end-to-end test verifies this.

## 5. The 3D scene

Pipeline: `app/scripts/fetch-assets.mjs` → Poly Haven API → glTF-Transform (flatten, join, weld, meshopt simplify, WebP textures at 256 px, meshopt compression) → `app/public/models/*.glb`. Textures are resized to 512 px WebP; the concrete is lifted and desaturated to read as sun-bleached slab.

| Asset (CC0, Poly Haven) | In the scene | Size | Triangles |
|---|---|---|---|
| [exterior_aircon_unit](https://polyhaven.com/a/exterior_aircon_unit) | Split-AC outdoor units on the house and neighbours (instanced) | 162 KB | 9,546 |
| [Barrel_02](https://polyhaven.com/a/Barrel_02) | Blue water drums | 47 KB | 2,688 |
| [planter_pot_clay](https://polyhaven.com/a/planter_pot_clay) | Terracotta tulsi pots | 45 KB | 3,080 |
| [potted_plant_02](https://polyhaven.com/a/potted_plant_02) | Plants on the parapet | 98 KB | 2,987 |
| [SchoolChair_01](https://polyhaven.com/a/SchoolChair_01) | A chair on the roof | 67 KB | 5,072 |
| [brass_diya_lantern](https://polyhaven.com/a/brass_diya_lantern) | A brass lantern that glows after sunset | 118 KB | 7,694 |
| [white_plaster_rough_01](https://polyhaven.com/a/white_plaster_rough_01) | Plaster normal + roughness on every facade | 73 KB | |
| [concrete_floor_02](https://polyhaven.com/a/concrete_floor_02) | Roof slabs | 80 KB | |
| [aerial_asphalt_01](https://polyhaven.com/a/aerial_asphalt_01) | Lanes | 43 KB | |

All CC0 (public domain). Total: 738 KB, enforced by a unit test (< 1 MB, < 200 KB and < 12k triangles per model).

Procedural, because no free model fits an Indian roof: the ribbed Sintex-style water tank (lathe geometry), the mumty (stair room), parapets with a haldi coping band, the clothesline, kites, Diwali string lights, windows that light at night.

Rendering:
- The sky shader is baked into a PMREM environment map whenever the sun moves 1.5°, so panel glass and metal reflect dawn pinks and dusk oranges.
- Post-processing: N8AO ambient occlusion, mipmap bloom (stronger at night), SMAA, vignette, and Khronos PBR Neutral tone mapping (keeps the palette's base colours true).
- Quality tiers (high / medium / low) are picked from the device and stepped down automatically when frames run slow (`PerfGuard`). Rendering stops when the scene is scrolled out of view.
- three.js loads in its own chunk after the preloader has painted.

## 6. Awwwards reference board

awwwards.com could not be loaded from the build sandbox's browser, so these entries were read through web search and page fetches (titles, tags, jury scores and element lists), not watched. What each one contributed:

| Entry | What it is | What Chhat took from it |
|---|---|---|
| [REFIRE](https://www.awwwards.com/sites/refire) (CUSP, Salt and Pepper) | Site of the Day, 12 Feb 2024; hydrogen-electric energy; tagged Scrolling, 3D; Dev Award animations 7.60, accessibility 6.60 | Confirmed that energy brands win on scroll-led 3D and masked scroll reveals. Its weakest score (accessibility) became a hard requirement here: axe in CI, contrast tests, a full reduced-motion path |
| [Volta Solar](https://www.awwwards.com/inspiration/mobile-loading-volta-solar) (studio&more) | Solar site whose elements include a mobile loader, a calculator, a 404 and cursor interaction | The same set of moments got Chhat's own treatment: a preloader tied to real load progress, the on-landing quick Roof Report, a designed 404, the sun cursor |
| [Climanova, "Solar Energy"](https://www.awwwards.com/inspiration/solar-energy-climanova) (Persee) | Clean, responsive solar landing with animated vector motion | Restraint on the tool pages: motion only where it explains a change |
| [ON Energy, "Energy Stream Interaction"](https://www.awwwards.com/inspiration/energy-stream-interaction-on-energy) (Studio 28K) | WebGL interaction showing energy flow | Making energy visible: the live roof-output readout in the HUD and on the Report's 3D stage |

## 7. Sources of patterns

| Pattern | Where it came from |
|---|---|
| Preloader with a real counter, curtain transitions, magnetic CTAs, custom cursor | `skills/tponscr-debug_claude-skill-awwwards`, `skills/ga14ctic_awwwards-skill` (motion and micro-interaction references) |
| Lenis on GSAP's ticker, `lagSmoothing(0)`, SplitText masks, `ScrollTrigger.batch` | `skills/iart-ai_web-animation-skills/skills/gsap-web` |
| Anti-defaults (no Inter, no purple, no centred three-card hero), one accent, emphasis in one family | `skills/leonxlnx_taste-skill` |
| Restraint on the tools; animate transform and opacity only | `skills/emilkowalski_skills`, `skills/Masalale_awwwards-designer` hard stops |
| Radix primitives with owned styles (Select, Slider, Tabs, Dialog) | `react-components/` (shadcn/ui source) |
| Rendering stack | three.js, React Three Fiber, `postprocessing` (pmndrs), N8AO, glTF-Transform, meshoptimizer |
