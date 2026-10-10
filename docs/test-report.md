# Test report

Second build pass, October 2026. Everything below was run by Claude Code inside its cloud session against the production build (`npm run build` → `vite preview`), in headless Chromium with a software GPU (SwiftShader). The same suite runs on every push in GitHub Actions (`.github/workflows/ci.yml`).

```bash
cd app
npm run test:all     # typecheck + unit + build + bundle budget + end-to-end
```

## 1. Results

| Layer | Tool | Tests | Result |
|---|---|---|---|
| Types | `tsc -b` (strict, no unused locals/params) | whole app, API, server, tests | clean |
| Unit: engine, parsers, agent | Vitest | 34 | 34 passed |
| Unit: design system and assets | Vitest (`tests/design.test.ts`) | 23 | 23 passed |
| End-to-end | Playwright (`e2e/`), desktop + Pixel 7 | 67 | 67 passed, 0 flaky (first run: 62 of 66 passed, 4 failed; see §3) |
| Accessibility | axe-core, WCAG 2.1 A + AA, 8 routes | in e2e | 0 serious or critical violations |
| Bundle budget | `scripts/check-budget.mjs` | 6 budgets | all within budget |
| Lighthouse | Lighthouse 12, desktop preset | 3 routes | see §5 |

## 2. What the suites cover

**Unit (57)**
- Engine: solar geometry against hand-checked values, PV yield bands, subsidy slabs and state top-ups, sizing, net metering, EMI, the full report, quote and bill audits.
- Parsers and the on-device agent: every sample document, English, Hindi, Hinglish, multi-turn memory.
- Design system: the day timeline never runs backwards; **hero text meets WCAG AA (4.5:1) at 201 sampled moments of the day**; all seven chapters are reached in order; the sun dial's geometry; the camera path never jumps more than 2° or 1 m between 1/500 steps of scroll and never dips into the roofs; panels always fit inside the parapet; every count-up figure ends on exactly its authored string with Indian digit grouping.
- Assets: every model and texture the scene loads exists, is credited as CC0 with a Poly Haven source link, matches its recorded size, and the set stays under 1 MB (each model under 200 KB and 12k triangles).

**End-to-end (67)**

| Spec | What it proves |
|---|---|
| `smoke` (9) | Every route renders its heading with no page errors, no console errors and no failed same-origin requests, with no sideways scroll; titles are distinct |
| `landing` (7) | The preloader tracks real progress and hands over; returning visitors get the short version; scrolling walks the clock, chapters, panel drop, live roof output and night; hidden chapters are `inert`; the landing's quick report recomputes; count-ups land on their sourced values; the hero CTA navigates through the route curtain; the sample-house button loads the Delhi sample |
| `tools` (9) | Roof Report produces size, savings, payback and a live kW meter; Quote Check grades the overcharger F and the fair deal A/B and writes the vendor message in Hindi; Bill Audit catches import-only billing, drafts the letter and passes a correct bill; Ask Chhat answers a Hindi question with tool-computed rupees and a visible trace; the drawer closes on Escape; the deck moves on arrow keys; loading a tool with a sample does not flash the route curtain |
| `a11y` (10) | axe-core on all 8 routes; the skip link is the first tab stop; every focusable control on the landing shows a visible focus ring |
| `fallbacks` (3) | Reduced motion: the story becomes a still page with every chapter readable, no cursor, no curtain. No WebGL: the landing shows its poster and still works; the Roof Report still computes every number |
| `mobile` (5, Pixel 7) | Hero text sits under the scene; the menu opens and closes; stacking cards fall back to a column; four tool pages fit a phone without sideways scroll |
| `visual` (24) | Six routes at 375, 768, 1280 and 1920 px: no sideways scroll, plus screenshots for review (`app/test-results/screens/`) |

## 3. What testing found, and the fixes

The test phase was not a formality. Each of these was found by a test or by reading test screenshots, then fixed and re-tested.

| # | Found by | Problem | Fix |
|---|---|---|---|
| 1 | Unit contrast test | During the dusk fade the background passed through mid-tones where neither ink nor limewash text reaches 4.5:1 (worst case 3.6:1). The bug predates this pass | Switch palettes at the midpoint of the day/night segment instead of blending through it; text colour chosen by actual WCAG contrast; a registered CSS `@property` eases the switch |
| 2 | axe (`color-contrast`) | The manifesto's unread words were 14% opacity, so not-yet-read text failed contrast | Words now go from an AA-passing grey (#5f6676, 5.1:1) to ink, instead of from near-invisible |
| 3 | axe (`aria-prohibited-attr`) | GSAP SplitText put `aria-label` on a `<p>`, which ARIA does not allow | `aria: "none"` for word splits; the words stay plain text |
| 4 | Keyboard test | Text fields' focus halo was 18% opacity: technically present, hard to see | 38% halo plus the blue border |
| 5 | Build output review | The landing imported the asset loader statically, pulling three.js (197 KB gzip) in front of the preloader | Dynamic import; three.js now loads after the preloader paints. A budget check fails the build if it regresses |
| 6 | Screenshot review | Stacked tool cards turned near-black: GSAP interpolated `filter` up from `brightness(0)`. A `.card` class also collided with the tools' card style | Cheaper shade overlay animated on opacity; classes renamed `stack-card` |
| 7 | Frame-time measurement | On a software GPU the top render tier (AO + bloom) ran at ~1 fps and starved the animation clock | `PerfGuard` steps the tier down when frames run slow (ignoring paused-tab gaps); the canvas stops rendering when scrolled out of view |
| 8 | Screenshot review | The "Skip the story" link showed over the logo; the noon panel glare bloomed out; the sun dial was lost against the scene | Proper visually-hidden-until-focus pattern; day bloom threshold raised and glass toned down; the dial got a frosted backing |
| 9 | Viewport sweep | Built-with-AI stats sat outside the content gutter, and at two columns left an empty grey cell | Gutter restored; the fifth stat spans both columns |
| 10 | Direct-visit test | The 404 page's styles lived in the tool pages' CSS chunk, so a direct visit rendered the art unstyled | Own stylesheet imported by the 404 route |
| 11 | Demo recording | Loading a tool page with a sample flashed the route curtain: the page rewrites its own URL and the curtain took that for a navigation | The curtain now runs only for real page changes (not same-page or replace navigations); regression test added |
| 12 | Test harness | `open()` could pass before React mounted; a fixed wait raced the count-ups under load; the noon output check sampled before the panels landed | Wait for the route's `h1`; retrying assertions; sample after the drop |

## 4. Budgets (production build)

| Check | Size | Budget | |
|---|---|---|---|
| Entry JS (gzip) | 194.2 KB | 200.0 KB | pass |
| Entry CSS (gzip) | 33.7 KB | 50.0 KB | pass |
| Landing route JS (gzip) | 15.8 KB | 30.0 KB | pass |
| 3D chunks, lazy (gzip) | 401.3 KB | 450.0 KB | pass |
| CC0 models (meshopt) | 540.5 KB | 700.0 KB | pass |
| three.js stays off the entry path | | | pass |

The landing route itself is 16 KB of JavaScript; the preloader paints before three.js (and the 3D chunk) start downloading.

## 5. Lighthouse

Desktop preset, production build, run in the sandbox (software GPU).

| Route | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| `/` landing | 48 | 100 | 100 | 100 | 0.8 s | 2.2 s | 21.9 s | 0.003 |
| `/report` | 49 | 100 | 100 | 100 | 0.9 s | 2.2 s | 5.8 s | 0 |
| `/quote` | 97 | 100 | 100 | 100 | 0.9 s | 1.0 s | 0 ms | 0 |
| `/built-with-ai` | 99 | 100 | 100 | 100 | 0.8 s | 0.8 s | 0 ms | 0 |

How to read this: paint metrics are fast everywhere (FCP under 1 s, LCP 2.2 s or better, no layout shift). The two routes with a 3D canvas lose their performance score to Total Blocking Time, and almost all of it is WebGL being rasterised on the CPU by SwiftShader, which a real GPU does off the main thread. The routes without a canvas score 97 and 99. On real hardware the scene also protects itself: it starts at a tier picked from the device, steps down when frames run slow, and stops rendering when scrolled away. The first Lighthouse pass found two issues that are now fixed: low-contrast text on the stacked tool cards (opacity on the index and body text) and a missing `robots.txt`.

## 6. Environment notes

- The sandbox has no GPU: WebGL runs on SwiftShader at roughly 1 frame per second at full quality. End-to-end tests load the landing with `?quality=low` and use retrying assertions rather than fixed waits. On real hardware the scene starts at the high tier.
- The demo video and the site's still images are rendered on a virtual clock (`app/scripts/lib/virtual-time.mjs`): the page's `performance.now`, `Date.now`, `requestAnimationFrame` and timers advance exactly 1/30 s per captured frame, so the recording is smooth and at full quality despite the slow software GPU.
- Live AI mode needs `ANTHROPIC_API_KEY` and was not exercised here; every test runs the on-device engine, which is what a judge without a key sees.
