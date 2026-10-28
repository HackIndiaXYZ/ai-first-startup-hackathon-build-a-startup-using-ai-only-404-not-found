# AGENTS.md

Notes for coding agents working on this repo. Read [README.md](README.md) first for what the demo is.

## Setup

- There is no build step, no package.json and nothing to install. Plain HTML, CSS and ES modules.
- Serve the root with any static server (`npx serve .` or `python3 -m http.server`). ES modules don't load from `file://`.
- GSAP, ScrollTrigger and ScrollSmoother (3.15.0) are vendored in `js/` and loaded as classic scripts before the module, so `gsap`, `ScrollTrigger` and `ScrollSmoother` are globals. Don't import them.
- three.js (r186) is vendored in `js/` too, as the package's own ES module build (`three.module.js`, which imports `three.core.js`). Only the WebGL variations (06–09) use it, through an import map in their `<head>`, so their modules `import * as THREE from 'three'`.
- There are no automated tests. Check a change in a browser: scroll the whole grid down and back up, resize across 65em (910px) where the column count changes, and try phone width and reduced motion. Look at the console.

## Map

| Path                                                             | What it is                                                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `index.html`…`index9.html`                                       | One page per variation (01 is `index.html`). Same frame; they differ in body class, script, images and item count. |
| `js/demo1/index.js`…`js/demo9/index.js`                          | One script per variation. Each is self-contained: they follow the same structure but share no code except `utils.js`. |
| `js/demo6/ElasticColumns.js`                                     | 06's three.js layer: one full-screen shader that draws every column as an elastic strip, the springs, and the texture array. |
| `js/demo7/AccordionFold.js`                                      | 07's three.js layer: the grid as a folding sheet (a mesh in perspective), its spring, and the texture array. |
| `js/demo8/ElasticTwist.js`                                       | 08's three.js layer: one full-screen shader that twists the grid around the pointer, its spring, and the texture array. |
| `js/demo9/Whirlpool.js`                                          | 09's three.js layer: 08's twist turned into a whirlpool that only ever turns one way (twist plus phase), and the texture array. |
| `js/utils.js`                                                    | `preloadImages()`: decodes the grid's background images and waits for the fonts before the page is revealed. |
| `js/gsap.min.js`, `js/ScrollTrigger.min.js`, `js/ScrollSmoother.min.js` | GSAP, vendored.                                                                                        |
| `js/three.module.js`, `js/three.core.js`                         | three.js, vendored (06–09 only).                                                                             |
| `css/base.css`                                                   | All styles: loader, frame, grid, and each variation's overrides under `.demo-<N>`.                           |
| `assets/1.webp`…`assets/40.webp`                                 | The images (Midjourney). 1–20 are used by 02 and 03, 21–40 by 01 and 04–09.                                     |

## How a page works

```html
<div id="smooth-wrapper">
  <main id="smooth-content">
    <header class="frame">…</header>          <!-- outside the wrapper in 04 -->
    <div class="grid">
      <figure class="grid__item">
        <div class="grid__item-img" style="background-image: url(assets/21.webp)"></div>
        <figcaption class="grid__item-caption">Zorith - L91</figcaption>
      </figure>
      …
    </div>
  </main>
</div>
```

- **CSS decides the column count, JS reads it.** `.grid` is a CSS grid with `--column-count` columns (3 below 65em, 7 above; 5 in 03, 9 in 04). The script counts the computed `grid-template-columns`; never hard-code a count in JS.
- **Start-up.** The body starts with `loading` (a full-screen loader in the CSS). `preloadImages('.grid__item-img')` resolves, the class comes off, then `init()` runs.
- **`init()`** calls `clearGrid()`, which kills the current lag effects and puts the items back in their original order. It then deals the items into columns by `index % columnCount`, wraps each column in a `.grid__column` and gives each one `smoother.effects(column, { speed: 1, lag })`. The lag per column is what makes each variation. (05 is the exception: it lags every item on its own, see below.)
- **Every effect goes into `lagEffects`.** `smoother.effects()` returns ScrollTriggers; push them into `lagEffects` so `clearGrid()` can kill them. Otherwise every rebuild leaves the old ones running on detached columns. When the effects sit on the items themselves (05), `clearGrid()` also clears their transforms, since the items are reused.
- **Resize** rebuilds only when the column count changes.
- **Reduced motion.** When `prefersReducedMotion` is true, the smoother gets `smooth: 0` and no lag effects are applied (in 02 and 05 the ticker isn't added either, and 06–09 don't start WebGL). The grid keeps its columns and scrolls as a still grid. Every variation must do the same.
- ScrollSmoother is created once per page with `effects: true` and `normalizeScroll: true`.

## Variations

| #   | Page          | What it does                                                                                           | Notes                                                                 |
| --- | ------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| 01  | `index.html`  | Symmetrical outer column lag: `0.5 + distance from center × 0.1`, so the outer columns trail the most. | Images 21–40, white theme.                                            |
| 02  | `index2.html` | Squeezed on scroll: the same center-out lag (`× 0.13`), plus items squeeze in X and stretch in Y with scroll speed (down to 0.7 and up to 1.7, past a 700 px/s dead zone), anchored at the top or bottom depending on direction. | `gsap.ticker` writes `--si`, `--sy` and `--to` on `.grid`, only when they change. Images 1–20. |
| 03  | `index3.html` | Stair-like lag: `0.2 + (column index + 1) × 0.3`, growing from left to right.                          | 5 columns on desktop, 5px column gap, grey theme. Images 1–20.                   |
| 04  | `index4.html` | Symmetrical center column lag: `0.3 + (maxDistance − distance + 1) × 0.15`, so the center trails the most. | 9 full-bleed columns on desktop, no gaps or captions. The frame is a fixed overlay with a top and bottom shade, outside the smooth wrapper. Images 21–40. |
| 05  | `index5.html` | Rippling lag: every item has its own lag, read off a wave that runs diagonally across the grid (`0.3 + wave × 0.45`, with the wave turning `0.8` per column and `0.35` per row). Each item also tilts along the wave, following the slope between its left and right neighbours' current offsets, eased towards a 10° limit. The grid ripples while it scrolls and settles flat when it stops. | Effects on the items, not the columns, with `effectsPadding` (900px): an effect only runs while its item is near the screen, measured from where the item would be without lag, so a trailing item released right at the top edge would catch up all at once and shoot out. The padding moves that release off-screen. `gsap.ticker` sets each item's `rotation` through `gsap.quickSetter`, only when it changes; `columnPitch` is measured again on every resize. 7 columns on desktop, white theme. Images 21–40. |
| 06  | `index6.html` | Elastic columns (WebGL): 04's layout and lag values, drawn by three.js. Each column is a seamless strip pinned to the window's top and bottom edges; its middle trails behind the scroll on a damped spring (the lag sets its speed, so the center columns trail most), so the strip stretches on one side and squeezes on the other, never opening a gap. Stretched parts smear along the motion with a slight color split, squeezed parts darken, and the springs overshoot, so the columns wobble when the scroll stops. | Shares 04's CSS (`.demo-4, .demo-6`): 9 full-bleed columns on desktop, no gaps or captions, fixed frame overlay. See WebGL below. Images 21–40. |
| 07  | `index7.html` | Accordion fold (WebGL): 04's lag, with bigger images, drawn by three.js as one sheet of paper in perspective. While the grid scrolls, the sheet folds like an accordion along its column lines (every other line comes forward), deepest mid-window and flat at its top and bottom, so it pinches into a lantern shape. Lit from the top left: panels shade by how they face the light, with a satin sheen and darker valleys (no highlight along the ridges: it read as a stray bright line on fast scrolls). One spring follows the scroll speed and overshoots, so the folds flip the other way before the sheet lies flat. | Shares 04's CSS, but the window's edges cut through the middle of the outer columns: 7 columns on desktop (6 columns' worth visible), 3 on phones (2 visible). The grid stays exactly as wide as the window, with half-width outer tracks (`0.5fr … 0.5fr`) that clip their images to the inner half. A grid wider than the window would make phones widen the page, and ScrollSmoother sets its own inline overflow, so clipping there doesn't hold. The columns keep their ScrollSmoother lag; the sheet reads their tops. Extra columns wrap in at the sides, so the folded sheet always fills the window. Images 21–40. |
| 08  | `index8.html` | Elastic twist (WebGL): 04's lag, with images slightly smaller than 06's, drawn by three.js. Scrolling wrings the grid like a rubber sheet around the pointer (the center drifts after it, or rests in the middle of the window): it turns and pulls in tight at the center, fading out over a Gaussian towards the edges. A rotational motion blur follows the spin, and the grid darkens where the twist shears it most. One spring follows the scroll speed and overshoots, so the grid unwinds past flat and back. | Same half-cut edges as 07 (`0.5fr … 0.5fr` outer tracks, shared CSS): 11 columns on desktop (10 visible, 144px wide at 1440px), 5 on phones (4 visible). The page has 220 items (the 21–40 cycle continued), so with the smaller images it still scrolls about as long as 06; the shader takes up to `maxItems` (256). The columns keep their ScrollSmoother lag; the shader reads their tops. Columns past either side wrap round, so the twist never shows a gap. Images 21–40. |
| 09  | `index9.html` | Whirlpool (WebGL): 08's twist at a much higher strength (`maxTwist` 10.55), so scrolling swirls the grid into a whirlpool around the pointer. Every point only ever turns the way the scroll turns it: as the scroll slows, the outer grid keeps turning forward until it catches up with the center, and the grid lines up again after a whole number of turns (no unwinding back, no bounce the other way). | Same layout, page and CSS as 08 (220 items, 11 columns, half-cut edges). Rows wrap round too, since the whole grid turns near the page's ends. Images 21–40. |

## Adding a variation

1. Copy the closest page to `index<N>.html` and change the `Demo <N>` title, the `demo-<N>` body class (keep `loading`), the `frame__info` label and the script path to `js/demo<N>/index.js`.
2. Copy the closest script to `js/demo<N>/index.js` and change the lag in `buildGrid` (or add an effect, like 02's squeeze). Keep `lagEffects`, `clearGrid()` and the `prefersReducedMotion` guard.
3. Put the variation's look under `.demo-<N>` in `css/base.css`: its colors through the custom properties, and its column count and gaps.
4. Add the link to the `.frame__demos` nav on **every** page: `<a class="frame__demo" href="index<N>.html">0N</a>`. On the page itself, the entry is `<span class="frame__demo frame__demo--current" aria-current="page">`, not a link.

## Conventions

- **Images** are CSS background images on `.grid__item-img` (aspect ratio 128/160), set inline in the HTML. `preloadImages()` reads them from the computed style.
- **Colors** live in custom properties (`--color-text`, `--color-bg`, `--color-link`, `--color-link-hover`), overridden per variation on `.demo-<N>`. Keep frame links at 4.5:1 contrast or more against the background.
- **The frame** follows the CodropsTemplate markup: `frame__title`, `frame__links` (Article, All demos, GitHub), `frame__tags` (hub tag URLs), `frame__demos`, plus this demo's `frame__info`. Codrops' tooling reads the Article link and the tags from that markup, so keep the class names and the link text. In every page but 04 the frame sits inside `#smooth-content` and scrolls away with the grid; in 04 it stays fixed.
- **WebGL (06).** The DOM stays the layout: `.grid__item-img` boxes are measured, then hidden (`.is-webgl`), and `ElasticColumns` draws the whole grid in one full-screen fragment shader on an opaque canvas behind the page (and behind 04's fixed frame), painted with the page's background. With WebGL, the columns get no ScrollSmoother lag effects: their lag drives a spring per column instead. Without WebGL 2 the constructor throws and the page is 04's lag grid.
  - **Per frame**, it reads each column's top (where it is without any lag), moves the column's spring after it (`frequency / lag` rad/s, damping ratio `damping`), and hands the shader the gap between the two as the column's pull, eased towards `pull × H / π`. Past `H / π` the strip would fold over, so keep `pull` under 1. It only draws when something moved.
  - **The shader**, per pixel: finds its column, maps the screen y to the column's content with `y − top − pull × sin²(π y / H)` (pinned at the window's edges, the full pull in the middle), and reads the image under it (the images touch, so there's never a gap). The mapping's slope is the stretch: stretched parts get a 7-sample smear along y and a small color split, squeezed parts darken. At a pull of 0 it's exactly the DOM images.
  - **Textures** are one `DataArrayTexture` (a layer per image, 400×500, cover-cropped), left in their original color space so the colors match the DOM. Sample it with `textureLod` and a level computed from the image's size on screen and the stretch (`columnAt()` gets it passed in): it's read inside branches, where automatic mipmap selection falls back to the smallest level and draws flat grey lines along the edges.
  - `measure()` draws right away, because resizing clears the canvas. `sync()` also runs from ScrollSmoother's `onUpdate`, because touch scrolling moves the page outside the ticker, and the canvas would otherwise lag a frame behind.
- **WebGL (07).** Same DOM, texture array, opaque canvas, `textureLod` and `sync()` rules as 06, but drawn as a mesh: a vertex column on every column line (plus `extraColumns` wrapped in on each side) and `rows` rows down the window, seen by a perspective camera set so the flat sheet (z = 0) is exactly 1 unit per CSS px. The vertex shader folds it: `x = center + (x − center) × cos(fold)`, and every other column line comes forward by `columnWidth × sin(fold)`, with `fold = uFold × sin(π y / H)`. So each column stays a rigid panel, and the creases sit exactly on the vertex columns. The sheet is measured from the images, not the columns (the outer columns are half as wide), so it starts at the first column's images, past the window's left edge. The fragment shader looks up the image from the unfolded sheet position and lights the panel by its facing. All the shading is 1 (or 0) at a fold of 0, so at rest it's exactly the DOM images. Unlike 06, the ScrollSmoother lag effects stay on: the columns lag, and the sheet reads their tops.
- **WebGL (08).** Same DOM, texture array, opaque canvas, `textureLod`, image-based measuring and `sync()` rules as 06 and 07, drawn by one full-screen shader. Per pixel it inverts the twist (`untwist()`: rotate by `−twist × e^(−r²/R²)` about the center, and pinch in), and reads the grid there with `gridAt()`, which wraps the columns. With the twist moving it takes 9 samples across the angle it turned through this frame (`twistVelocity × blur`, capped at `maxBlur`: fewer samples read as stepped copies). At a twist of 0 with no spin it takes the plain path, exactly the DOM images. The pointer is tracked on `window` (`pointermove`), so touch works too.
- **WebGL (09).** 08's shader, with the angle at each point split in two: `phase + twist × e^(−r²/R²)`. The twist follows the scroll speed with no spring (exponential, `windUp` while it grows, `windDown` while it settles), so it never overshoots. While it winds, the phase holds. While it settles, the phase takes over what the twist lets go of: at the start of each settle it picks the next whole turn past the center's angle (`goal`), and `phase = start + (goal − start) × (1 − twist / startTwist)`, so every point's angle only moves forward and all of them arrive at `goal` together. At rest the phase is reset to 0 (a whole number of turns looks the same). Scrolling the other way turns it back with the scroll, and scrolling again mid-settle winds on from where it is. The center only follows the pointer while the phase is 0 (moving it while the whole grid is turned would slide the grid around), and it counts as at rest once every point is within half a pixel of the end, so nothing jumps. The motion blur spreads over this frame's change in both twist and phase.
- **Breakpoints.** The root font size is 14px. The frame switches to its row layout at 53em; the grid switches column count at 65em.

## Style

- Two-space indentation, single quotes, semicolons. 01, 03 and 04 use arrow-function constants; 02 mostly uses function declarations. Follow what's in the file.
- Every function has a JSDoc block, most lines have a short trailing comment, and sections are split by `// ─────────────── Name ───────────────` dividers. Keep that density.
- CSS uses native nesting (`&`, nested `@media`) and mobile-first `min-width` queries.
- No dependencies and no build tooling unless asked.

## Ask before changing

- The pages' `<title>`, the `frame__title` heading, the tags and the `frame__info` labels.
- The Article and GitHub links, the images and the credits.
- Variations 01–04 and their lag values, which are the author's own.
