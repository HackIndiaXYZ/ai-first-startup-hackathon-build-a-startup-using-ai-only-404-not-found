# AGENTS.md

Notes for coding agents working on this repo. Read [README.md](README.md) first for what the demo is.

## Setup

- There is no build step, no package.json and nothing to install. Plain HTML, CSS and ES modules.
- Serve the root with any static server (`npx serve .` or `python3 -m http.server`). ES modules don't load from `file://`.
- GSAP and its ScrollTrigger, ScrollSmoother and SplitText plugins are vendored in `js/` and loaded as classic scripts before the module, so `gsap`, `ScrollTrigger`, `ScrollSmoother` and `SplitText` are globals. Don't import them.
- There are no automated tests. Check a change in a browser: scroll through all six carousels, open and close a few previews (with the title link, the Close button and Escape), at desktop and phone width and with reduced motion on, and look at the console.

## Map

| Path            | What it is                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| `index.html`    | The only page: the frame, six `.scene`s (title + carousel) inside `#smooth-content`, and six `.preview` grids. |
| `js/index.js`   | ScrollSmoother, the carousels' 3D layout and scroll timelines, text splitting, opening and closing the previews. |
| `js/gridTransition.js` | The WebGL transition of the preview grids (raw WebGL2, shaders inline).                              |
| `js/utils.js`   | `preloadImages(selector)`: decodes the images of `img` elements or elements with a background image.         |
| `css/base.css`  | All styles, including the frame, the loader, the 3D scenes and the preview grid.                             |
| `assets/`       | `img1.webp`…`img72.webp`, 960×1200. Twelve per scene, in order: scene 1 uses 1–12, scene 2 13–24, and so on. Each preview shows 15: its scene's 12, then the first 3 again (same names) to fill 5 × 3. |

## How a page works

- **Carousels.** Each `.scene` holds a `.carousel` of `.carousel__cell`s. `setupCarouselCells` spaces the cells evenly around a ring (`rotateY` + `translateZ`), with the radius from the scene's `data-radius` (default 500, scene 5 uses 650 for its six cells). Each `.card` has a front and back face that both show `--img`, set inline on the card.
- **Scroll.** `createScrollAnimation` gives each carousel one scrubbed timeline, from the scene's top entering the viewport to its bottom leaving it: the ring turns from 0° to -180°, tilts slightly, and the cards dim and turn. The timeline is kept on `carousel._timeline`. A scene that's centered in the viewport is at progress 0.5 (rotationY -90°), which the close transition relies on.
- **Speed.** `initScrollMotion` makes the carousels react to how fast they move: the cards spread out from the ring's center (added to each cell's `translateZ`) and lean against the direction they move in (through the CSS `rotate` property on `.card`, which adds to GSAP's `transform` instead of fighting it). Scrolling (ScrollSmoother's `getVelocity()`) does it to all of them through `--spread` and `--lean` on `.scene-wrapper`; dragging a slider only to that one, through `--spin-spread` and `--spin-lean` on its `.carousel`. Each set has its own springs (`createSpeedSprings`). Both go through springs, so they settle back to 0 when the scroll stops. The values are in `scrollMotion` at the top of `js/index.js`. It's off while a preview opens, is open or closes, and with reduced motion.
- **Drag to turn.** `initDragSpin` turns a slider by dragging it sideways, with the mouse or a finger (`ScrollTrigger.observe()`, GSAP's Observer built into ScrollTrigger, on `.scene-wrapper`). It sets `--spin` on that `.carousel`, which its cells add to their `rotateY`, so it never touches GSAP's scroll timeline or the open/close transition. A slider stays where it's turned and keeps turning a little after it's let go. Only a press that actually turned a slider has its click ignored (so a drag ending on a title doesn't open it); every new press resets that, so a scroll never swallows the next tap. `.scene` has a grab cursor, and `body.is-dragging` a grabbing one with no text selection. It's ignored while a preview opens, is open or closes. Sideways scrolling (trackpad, Shift + wheel) deliberately does nothing. Values (`spin`, `spinSmoothing`, `spinInertia`) are in `scrollMotion`.
- **Titles.** `.scene__title`, `.preview__title` and `.preview__close` are split into words and characters with SplitText (`splitMap` keeps the instances). Characters fade in one after another.
- **Opening a preview.** The scene title links to its preview (`href="#preview-N"`). `activatePreviewFromCarousel` pauses ScrollSmoother, loads that preview's images as textures (`gridTransition.prepare`), scrolls the scene to the center, disables every ScrollTrigger, flies the carousel through the camera, then shows the preview and plays the grid's WebGL transition in. Focus moves to the Close button.
- **Closing.** The Close button or Escape call `deactivatePreviewToCarousel`: the grid's WebGL transition plays out first, and the carousel only spins back in as its wave collapses into the center (its delay is what's left of the grid's animation, `secondsLeft`, minus 0.2s; GSAP reports a reversed animation's timeScale as negative, hence the `Math.abs`). Then ScrollSmoother resumes and focus returns to the scene title.
- **Reduced motion.** The carousels turn a third as much on scroll, ScrollSmoother has no smoothing or `data-speed` effects, and previews crossfade with the scenes (`crossfadePreview`) instead of the fly-through. No WebGL is used.
- **Without WebGL2**, `createGridTransition` returns null and the grid simply fades in and out.
- **Loading.** The page waits for the carousel images and the fonts, then removes `body.loading`; the preview images load in the background after that.
- **Preview layout.** From 53em the grid is 5 columns × 3 rows, sized in CSS (`--column-width` in the `min-width: 53em` block) so the three rows fit the screen's height, or the five columns its width. Below that it's 3 columns that scroll. The title and Close sit at the top corners (`--preview-padding`), where the page's frame was: the `.frame` fades out when a preview opens and back in when the carousel returns (in the crossfade too, with reduced motion).
- **Small screens** (below 53em): the frame stacks, the carousels are scaled to 0.7 with the CSS `scale` property (GSAP owns `transform`), and the preview scrolls on its own (ScrollSmoother's `normalizeScroll` uses `allowNestedScroll` for that).

## Variations

| #  | Page         | What it does                                       | Notes                  |
| -- | ------------ | -------------------------------------------------- | ---------------------- |
| 01 | `index.html` | Six scroll-driven 3D carousels opening into grids. | The author's original. |

## Adding a variation

1. Copy `index.html` to `index<N>.html` and change what the variation is about. Every scene keeps a matching `.preview` with the same title and the twelve images of that scene.
2. Give the page a `demo-<N>` body class and put variation-specific styles under it in `css/base.css`, or a variation-specific script next to `js/index.js`, so the original page stays as it is.
3. There's no variations nav yet. The first variation adds one to the frame of **every** page: a compact numbered grid (`Variations 01 02 …`) in a `.frame__demos` nav, the current page as `<span class="frame__demo frame__demo--current">`, the others as links. Give it its own grid area in `.frame`, on desktop and in the small-screen layout.
4. Add a row to the table above.

## WebGL conventions (the grid transition)

- **The idea, "warp".** The carousel opens by flying through the camera like a ring. Right then, a shockwave of bent space bursts from the grid's center and races to the edges (a thin rim of light with a faint prismatic edge and a slightly wobbling front, drawn by its own full-screen program), and the images ride in behind it one by one, from the edges to the center (`stagger`): each flies in from far away to its own place (`depth`, power3.out in the shaders), with light-speed streaks and a focus pull. Like a stone in water, the wave leaves space rippling behind it (`ripples`); the images fly in through the ripples, which bulge them towards the viewer and refract their pictures, and the ripples calm down exactly as the last image lands. Closing plays the opening timeline backwards (`closeSpeed` faster), so the center images leave first.
- Why the ripples: a wave that starts at the center always outruns the images (they only spread out on screen once they're close), so the front itself never touches them. Keep the bending in the wake, not on the front.
- The images don't turn or tilt: each comes straight in at its own place. Don't make the grid move as one slab; it's too wide for that.
- **Motion blur.** The fragment shader works out where the point now at a pixel was earlier in the image's rush towards the viewer and averages the image along that streak, as long as the "shutter" (`blur`) stays open. One sample per 2px of streak (up to 16), so it's a single sample once an image slows down; keep it that cheap, or phones can't keep up. The quad is grown so the streak and the bulge aren't clipped. The color fringe weights the same samples (red towards the end of the streak, blue towards its start); no extra texture reads. A separate per-channel refraction split was tried and dropped: it looked like a 3D-glasses glitch and doubled the pictures.
- All the tunable values are in `settings` at the top of `js/gridTransition.js`, the wave's in `settings.wave`.
- One fixed `.grid-canvas`, first in the page and without a z-index, so the carousel flying through the camera passes in front of the wave and the arriving images, and the previews' titles and captions sit above it. It only renders while a grid animates (`gsap.ticker`), and is cleared afterwards. The wave's light is added on top of the page (alpha 0 with premultiplied blending).
- **Space.** Positions are CSS px from the viewport center, y up, z towards the viewer. The projection matches CSS `perspective: 900px` (the scenes' perspective) with the grid's center as the vanishing point and the wave's center, so a flat image at z = 0 covers its DOM image pixel for pixel.
- **The rest state must match the DOM exactly**: when the last image lands, the wave and its ripples are at 0 and every image is flat, in place, unblurred, with no color change, so handing back to the DOM doesn't show. Anything new in the shaders has to vanish then.
- **One transition at a time.** `animate` keeps the running transition in `current`. Closing while the opening still plays (the page unlocks after the carousel's fly-through, before the grid has landed) reverses that same opening from where it is; anything else still running is ended first. Before this, an early close let the leftover opening's cleanup stop the closing and put the DOM grid back over the returning carousel.
- **Handoff.** `.is-drawn` hides a DOM image while the canvas draws it. Add it and render in the same frame, or the image blinks out for a frame.
- **Warm-up.** `prepare` draws both programs and every texture once, invisibly, before the carousel starts moving, so the GPU's one-time setup doesn't freeze the carousel mid-flight when the grid appears.
- **Textures** are drawn at the size the image is shown at (device px, DPR capped at 2) on a 2D canvas first, so they're as sharp as the DOM image. Only the open preview's textures are kept. Their mipmaps are also what the focus pull samples from.
- Captions stay in the DOM and fade in as the images land.
- The DOM grid has no 3D CSS (`perspective`, `preserve-3d`) on purpose: nothing in it moves in 3D, and those properties made the browser build a 3D layer per tile the moment a preview appeared, which froze the carousel for a few frames.

## Style

- Two-space indentation, single quotes, semicolons, trailing commas, arrow functions with JSDoc blocks above them. Follow what's in the file.
- Comments are short and say what a line or block is for, often at the end of the line.
- No dependencies and no build tooling unless asked.

## Ask before changing

- The page `<title>`, the `frame__title` heading, the tags and the frame links (Article, All demos, GitHub).
- The scene titles, the people's names in the previews, the images and the credits.
- The author's original effect: the scroll timeline values and the carousel's own open and close animations.
