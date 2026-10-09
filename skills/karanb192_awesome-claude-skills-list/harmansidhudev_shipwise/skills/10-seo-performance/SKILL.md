---
name: seo-performance
description: "Technical SEO, meta tags, Open Graph, structured data, sitemap, robots.txt, canonical URLs, Google Search Console, Lighthouse optimization, Core Web Vitals, bundle optimization, image optimization, caching strategy, landing page copy, onboarding flow, and content strategy."
triggers:
  - "SEO"
  - "meta tags"
  - "Open Graph"
  - "sitemap"
  - "robots.txt"
  - "structured data"
  - "JSON-LD"
  - "canonical"
  - "lighthouse"
  - "web performance"
  - "page performance"
  - "app performance"
  - "bundle size"
  - "image optimization"
  - "caching"
  - "landing page"
  - "onboarding"
  - "search console"
  - "core web vitals"
  - "Twitter Cards"
  - "code splitting"
  - "tree shaking"
  - "lazy loading"
  - "WebP"
  - "AVIF"
  - "srcset"
  - "Cache-Control"
  - "service worker"
  - "CDN"
  - "page speed"
  - "LCP"
  - "CLS"
  - "INP"
  - "schema markup"
  - "breadcrumbs"
  - "help center"
  - "changelog"
  - "pricing page"
  - "pricing tier"
  - "pricing table"
  - "feature comparison"
  - "annual monthly toggle"
  - "free to paid"
  - "upgrade prompt"
  - "web-vitals"
  - "real user monitoring"
  - "RUM"
  - "field data"
  - "TTFB"
---

# SEO & Performance

> Phase 3: SHIP | Sprint 4

## Coverage

- Meta tags + Open Graph per page, Twitter Cards
- Sitemap + robots.txt (auto-generated, Search Console submission)
- Structured data (JSON-LD: Organization, SoftwareApplication, FAQ, Breadcrumbs)
- Canonical URLs (self-referencing, pagination, query params, trailing slashes)
- Google Search Console setup
- Lighthouse targets (90+ all categories)
- Image optimization (WebP/AVIF, lazy loading, responsive srcset)
- Bundle optimization (code splitting, tree shaking, dynamic imports)
- Caching strategy (Cache-Control, ETag, service worker, CDN rules)
- Landing page copy framework
- Onboarding flow design (first-value <2 minutes)
- Help center structure, changelog, content strategy template

---

## Checklist Items

### Meta Tags + Open Graph

<!-- beginner -->
**Add meta tags to every page** — Meta tags tell search engines and social media what your page is about. Without them, Google shows random text snippets and shared links look broken on Twitter/LinkedIn. Every page needs a unique `<title>` (50-60 characters), `<meta description>` (150-160 characters), and Open Graph tags (`og:title`, `og:description`, `og:image`). Twitter Cards (`twitter:card`, `twitter:title`, `twitter:image`) control how links appear on Twitter. Create a reusable component so you never forget a tag.
> Time: ~1 hour
> Template: See `references/meta-tags-template.tsx`

<!-- intermediate -->
**Meta tags + OG + Twitter Cards** — Unique title (50-60 chars), description (150-160 chars), og:title, og:description, og:image (1200x630), og:type, og:url per page. Twitter Cards (summary_large_image). Canonical URL on every page. Use Next.js `generateMetadata` or equivalent framework helper. Validate with Facebook Sharing Debugger and Twitter Card Validator.
> ~1 hour | `references/meta-tags-template.tsx`

<!-- senior -->
**Meta/OG/Twitter/canonical** — Per-page via `generateMetadata` or framework equivalent. og:image 1200x630, summary_large_image. Validate with FB Debugger + Twitter Validator.
> `references/meta-tags-template.tsx`

---

### Sitemap + robots.txt

<!-- beginner -->
**Generate a sitemap and robots.txt** — A sitemap is an XML file that lists every page on your site so Google can find and crawl them all. Without it, Google might miss pages — especially new ones. `robots.txt` tells search engines which pages to crawl and which to skip (like admin panels or API routes). Most frameworks can auto-generate both. After generating, submit your sitemap to Google Search Console so Google starts indexing immediately.
> Time: ~30 min
> Reference: See `references/technical-seo-checklist.md`

<!-- intermediate -->
**Sitemap + robots.txt** — Auto-generate sitemap.xml (Next.js `app/sitemap.ts`, Nuxt `@nuxtjs/sitemap`, Astro `@astrojs/sitemap`). Include lastmod, changefreq, priority. robots.txt: allow all public pages, disallow /api/*, /admin/*, /_next/*. Submit sitemap URL in Search Console. Validate with `curl https://yourdomain.com/sitemap.xml`.
> ~30 min | `references/technical-seo-checklist.md`

<!-- senior -->
**Sitemap + robots.txt** — Framework auto-generation, lastmod from git/CMS, disallow private routes, Search Console submission. Sitemap index for >50K URLs.
> `references/technical-seo-checklist.md`

---

### Structured Data (JSON-LD)

<!-- beginner -->
**Add structured data to your pages** — Structured data is a way to tell Google exactly what your content is: "this is an organization," "this is a FAQ," "this is a software product." Google uses it to show rich results — star ratings, FAQ dropdowns, breadcrumb trails, and more. You add it as a JSON-LD `<script>` tag in your HTML. Start with Organization (on every page), then add SoftwareApplication (for your product page), FAQ (for help/pricing pages), and BreadcrumbList (for navigation).
> Time: ~45 min
> Templates: See `references/structured-data-templates/`

<!-- intermediate -->
**Structured data (JSON-LD)** — Organization schema on layout (name, url, logo, sameAs for social profiles). SoftwareApplication on product/pricing pages (offers, aggregateRating). FAQPage on help/pricing (question + acceptedAnswer pairs). BreadcrumbList for navigation hierarchy. Validate with Google Rich Results Test and Schema Markup Validator. Embed via `<script type="application/ld+json">`.
> ~45 min | `references/structured-data-templates/`

<!-- senior -->
**Structured data** — Organization (layout), SoftwareApplication (product), FAQPage (help/pricing), BreadcrumbList (all). Validate with Rich Results Test. Consider HowTo, Article for blog.
> `references/structured-data-templates/`

---

### Canonical URLs

<!-- beginner -->
**Set canonical URLs on every page** — A canonical URL tells search engines which version of a page is the "real" one. Without it, Google might see `yoursite.com/pricing`, `yoursite.com/pricing/`, and `yoursite.com/pricing?ref=twitter` as three different pages, splitting your SEO value. Add a `<link rel="canonical" href="...">` tag on every page pointing to the clean, preferred URL. Rules: always self-referencing, strip query params, pick one trailing-slash convention and stick with it, handle pagination (`?page=2` gets its own canonical).
> Time: ~20 min
> Reference: See `references/technical-seo-checklist.md`

<!-- intermediate -->
**Canonical URLs** — Self-referencing canonical on every page. Consistent trailing-slash policy (enforce via middleware redirect). Strip tracking query params (utm_*, ref, fbclid) from canonical. Paginated content: each page gets its own canonical (no rel=prev/next since Google deprecated it). Cross-domain canonicals for syndicated content. Set via `<link rel="canonical">` or HTTP `Link` header.
> ~20 min | `references/technical-seo-checklist.md`

<!-- senior -->
**Canonicals** — Self-referencing, consistent trailing slash (middleware redirect), strip tracking params, per-page pagination canonical, cross-domain for syndication.
> `references/technical-seo-checklist.md`

---

### Google Search Console Setup

<!-- beginner -->
**Set up Google Search Console** — Search Console is Google's free tool that shows you how your site appears in search results: which queries bring traffic, which pages are indexed, and any errors Google found while crawling. Verify your domain (DNS TXT record is the most reliable method), submit your sitemap, and check back in a few days to see your first data. Fix any errors in the Coverage report (404s, redirect issues, noindex pages that should be indexed).
> Time: ~20 min
> Reference: See `references/technical-seo-checklist.md`

<!-- intermediate -->
**Google Search Console** — Verify via DNS TXT record (domain-level verification covers all subdomains). Submit sitemap.xml. Monitor: Coverage report (fix errors/warnings), Performance report (impressions, clicks, CTR, position), Core Web Vitals report, Mobile Usability. Set up email alerts for critical issues. Link to Google Analytics for combined data.
> ~20 min | `references/technical-seo-checklist.md`

<!-- senior -->
**Search Console** — DNS verification, sitemap submission, monitor Coverage + CWV + Performance. Link to GA4. API access for automated reporting.
> `references/technical-seo-checklist.md`

---

### Lighthouse Targets (90+ All Categories)

<!-- beginner -->
**Hit 90+ Lighthouse scores in all categories** — Lighthouse is Google's built-in audit tool (open Chrome DevTools > Lighthouse tab). It scores your site from 0-100 in four categories: Performance, Accessibility, Best Practices, and SEO. Aim for 90+ in all four before launch. The most common issues: large images (use WebP, add width/height), missing alt text, no HTTPS, missing meta description, render-blocking CSS/JS. Run Lighthouse in Incognito mode for accurate results (extensions can skew scores).
> Time: ~2-4 hours to fix issues
> Reference: See `references/lighthouse-targets.md`

<!-- intermediate -->
**Lighthouse 90+ all categories** — Performance: LCP <2.5s, CLS <0.1, INP <200ms. Optimize critical rendering path, preload LCP image, inline critical CSS, defer non-critical JS. Accessibility: semantic HTML, ARIA labels, color contrast 4.5:1, keyboard navigation. Best Practices: HTTPS, no mixed content, no deprecated APIs, CSP headers. SEO: valid meta tags, crawlable links, mobile viewport, structured data. Run in CI with Lighthouse CI to catch regressions.
> ~2-4 hours | `references/lighthouse-targets.md`

<!-- senior -->
**Lighthouse 90+** — LCP <2.5s, CLS <0.1, INP <200ms. Lighthouse CI in GitHub Actions with performance budgets. Address CWV regressions in PR checks.
> `references/lighthouse-targets.md`

---

### Web Vitals & Real User Monitoring

<!-- beginner -->
**Measure how your site performs for real users** — Lighthouse tests in a controlled environment, but your actual users have slower phones and weaker connections. Real User Monitoring (RUM) measures performance on real devices. Install the `web-vitals` library and send the results to your analytics platform. The key metrics: LCP (loading speed, must be under 2.5s), INP (responsiveness, under 200ms), CLS (layout stability, under 0.1). Google uses real-user data (not Lighthouse scores) for search ranking.
> Time: ~30 min to set up
> Reference: See `references/web-vitals-rum-setup.md`

<!-- intermediate -->
**Web Vitals RUM** — Install `web-vitals`, report LCP/INP/CLS/TTFB via `sendBeacon` to PostHog or custom endpoint. Monitor p75 values (what Google uses for ranking). Set up weekly regression alerts. Lab data (Lighthouse) catches regressions in CI; field data (RUM) catches real-world issues.
> ~30 min | `references/web-vitals-rum-setup.md`

<!-- senior -->
**Web Vitals RUM** — `web-vitals` library → PostHog/custom endpoint. p75 monitoring, regression alerts, field vs lab data comparison. Diagnostic trees for LCP/INP/CLS issues.
> `references/web-vitals-rum-setup.md`

---

### Image Optimization

<!-- beginner -->
**Optimize all images for web** — Images are usually the heaviest assets on a page and the #1 cause of slow load times. Three things to do: (1) **Use modern formats** — WebP is 25-35% smaller than JPEG at the same quality; AVIF is even smaller. Next.js `<Image>` component handles this automatically. (2) **Lazy load** — images below the fold should only load when the user scrolls to them. Add `loading="lazy"` to `<img>` tags (but NOT the hero/LCP image — that should load immediately). (3) **Responsive sizes** — serve different image sizes for mobile vs desktop using `srcset` and `sizes` attributes.
> Time: ~1 hour
> Reference: See `references/lighthouse-targets.md` (Image optimization section)

<!-- intermediate -->
**Image optimization** — WebP/AVIF with fallback (`<picture>` element or Next.js Image). Lazy loading via `loading="lazy"` (exclude LCP image). Responsive srcset with breakpoints (640w, 750w, 1080w, 1200w, 1920w). Explicit width/height to prevent CLS. Use `priority` prop on LCP image (Next.js). CDN image transformation (Cloudinary, imgix, Vercel Image Optimization). SVG for icons/logos, rasterize only photos. Max 200KB per hero image after compression.
> ~1 hour

<!-- senior -->
**Images** — WebP/AVIF, lazy load (except LCP), responsive srcset, explicit dimensions, CDN transforms, <200KB hero budget. `priority` on LCP element.

---

### Bundle Optimization

<!-- beginner -->
**Reduce your JavaScript bundle size** — Large JavaScript bundles make your site slow to load and slow to become interactive. Three strategies: (1) **Code splitting** — break your app into smaller chunks that load on demand. Most frameworks do this automatically per route/page. (2) **Tree shaking** — your bundler removes unused code. Make sure you import only what you need (e.g., `import { Button } from 'ui'` not `import * as ui from 'ui'`). (3) **Dynamic imports** — heavy components (charts, editors, maps) should load only when needed using `React.lazy()` or `next/dynamic`.
> Time: ~1-2 hours
> Reference: See `references/lighthouse-targets.md` (Bundle section)

<!-- intermediate -->
**Bundle optimization** — Route-based code splitting (automatic in Next.js/Nuxt). Dynamic imports for heavy components (`next/dynamic`, `React.lazy`). Tree shaking: use ESM imports, check bundle with `@next/bundle-analyzer` or `source-map-explorer`. Target: <200KB initial JS (gzipped). Avoid barrel files that defeat tree shaking. Externalize large dependencies (moment.js -> date-fns/dayjs). Preload critical chunks with `<link rel="modulepreload">`.
> ~1-2 hours

<!-- senior -->
**Bundles** — Route splitting, dynamic imports, tree shaking (ESM, no barrels), <200KB initial JS (gzip), bundle analyzer in CI, modulepreload for critical path.

---

### Caching Strategy

<!-- beginner -->
**Set up caching for fast repeat visits** — Caching stores copies of your files so browsers and CDNs don't re-download everything on every visit. Three layers: (1) **Browser caching** — set `Cache-Control` headers so static assets (JS, CSS, images) are cached for a long time. Hashed filenames (like `app.a1b2c3.js`) let you cache forever since the name changes when content changes. (2) **CDN caching** — services like Cloudflare, Vercel, or CloudFront cache your pages at edge servers worldwide for faster global access. (3) **Service worker** (optional) — enables offline access and instant repeat loads. Only add this if you need offline support.
> Time: ~1 hour
> Reference: See `references/technical-seo-checklist.md` (Caching section)

<!-- intermediate -->
**Caching strategy** — Static assets (JS/CSS/fonts with content hash): `Cache-Control: public, max-age=31536000, immutable`. HTML pages: `Cache-Control: public, max-age=0, must-revalidate` (let CDN handle with stale-while-revalidate). API responses: `Cache-Control: private, max-age=60` or `no-store` for user-specific data. ETag for conditional requests. CDN: configure cache rules per path pattern. Service worker: cache-first for static, network-first for API. Purge strategy for deploys.
> ~1 hour

<!-- senior -->
**Caching** — Content-hashed assets (immutable, 1yr), HTML (must-revalidate + SWR at CDN), API (private/no-store), ETag, CDN path rules, service worker (cache-first static, network-first API), deploy purge.

---

### Landing Page Copy Framework

<!-- beginner -->
**Write landing page copy that converts** — Your landing page is your first impression. It needs to answer three questions in seconds: (1) What does this do? (2) Why should I care? (3) What do I do next? Structure: **Hero** (headline + subheadline + CTA button), **Social proof** (logos, testimonials, user count), **Features/benefits** (3-4 key benefits with icons), **How it works** (3 steps), **Pricing** (if applicable), **FAQ**, **Final CTA**. Write the headline as a benefit, not a feature: "Ship faster" not "CI/CD pipeline tool."
> Time: ~2-4 hours
> Reference: See `references/technical-seo-checklist.md` (Landing page section)

<!-- intermediate -->
**Landing page copy framework** — Hero: benefit-driven headline (6-12 words), supporting subheadline (problem -> solution), primary CTA (action verb + value: "Start shipping faster"), secondary CTA (lower commitment: "See how it works"). Above the fold: headline + subheadline + CTA + hero image/demo. Social proof section (logos, metrics: "trusted by X teams", testimonials with names/photos). Feature grid (3-4 benefits, not features). How-it-works (3 steps max). Objection handling (FAQ). Final CTA with urgency or guarantee.
> ~2-4 hours

<!-- senior -->
**Landing page** — Hero (benefit headline + CTA), social proof, feature-benefit grid, 3-step how-it-works, FAQ for objections, final CTA. A/B test headline + CTA copy.

---

### Onboarding Flow Design

<!-- beginner -->
**Design onboarding to reach first value in under 2 minutes** — Most users who sign up for your product will leave within 5 minutes if they don't see value. Your goal: get them to their "aha moment" as fast as possible. That means: (1) Remove unnecessary signup fields (name + email + password is enough — or just email with magic link). (2) Skip the product tour — instead, guide them to complete ONE meaningful action. (3) Use progressive disclosure — don't show everything at once, reveal features as they need them. (4) Show a progress indicator so they know how close they are. Measure: time-to-first-value should be under 2 minutes.
> Time: ~3-5 hours to design + implement

<!-- intermediate -->
**Onboarding flow** — Target: first-value <2 minutes. Minimal signup (email + password or magic link/OAuth). Skip tours in favor of task-based onboarding (guide user to complete one core action). Checklist pattern (3-5 items max, start with one pre-completed). Progressive disclosure of features. Empty states with CTAs (not blank screens). Measure: signup-to-activation rate, time-to-first-value, checklist completion rate. A/B test onboarding variants.
> ~3-5 hours

<!-- senior -->
**Onboarding** — First-value <2min, task-based (not tours), checklist pattern, progressive disclosure, measure activation rate + TTFV. Segment onboarding by user persona if applicable.

---

### Help Center + Changelog + Content Strategy

<!-- beginner -->
**Set up a help center, changelog, and content plan** — Three things users expect from a launched product: (1) **Help center** — organized docs answering common questions. Structure: Getting Started (3-5 articles), Core Features (one per feature), Account & Billing, Troubleshooting/FAQ. Tools: Notion (free), GitBook, or a `/docs` section of your site. (2) **Changelog** — a page showing what's new. Update it with every release. Users and investors read it. (3) **Content strategy** — plan 4-8 blog posts targeting keywords your audience searches for. Each post should solve a specific problem and naturally mention your product.
> Time: ~4-6 hours for initial setup

<!-- intermediate -->
**Help center + changelog + content** — Help center: Getting Started, Core Features, Integrations, Account/Billing, Troubleshooting/FAQ categories. Use intercom, Crisp, or static docs site. Changelog: date + version + categorized entries (new/improved/fixed). SEO content strategy: keyword research (Ahrefs/Ubersuggest), target long-tail keywords with <30 KD, publish 2-4 posts/month, internal linking strategy, programmatic SEO for scalable pages.
> ~4-6 hours

<!-- senior -->
**Help center + changelog + content** — Structured help center, versioned changelog, SEO content targeting <30 KD long-tails, programmatic SEO for scale, 2-4 posts/month cadence.

---

## Verification Steps

After completing the checklist above, verify:

1. **Meta tags**: Run Facebook Sharing Debugger and Twitter Card Validator on your key pages — confirm title, description, and image render correctly.
2. **Sitemap**: `curl https://yourdomain.com/sitemap.xml` returns valid XML with all public pages listed. Submit to Search Console and confirm "Success" status.
3. **Structured data**: Run Google Rich Results Test on your homepage, product page, and FAQ page — zero errors, zero warnings.
4. **Canonical URLs**: View source on 5 pages — every page has a `<link rel="canonical">` pointing to the clean URL. Confirm trailing-slash consistency.
5. **Search Console**: Verify domain ownership. Coverage report shows 0 errors. Sitemap shows "Success."
6. **Lighthouse**: Run `npx lighthouse https://yourdomain.com --output=json` — all four scores are 90+.
7. **Images**: No image on any page exceeds 200KB. All images below the fold have `loading="lazy"`. LCP image loads in <2.5s.
8. **Bundles**: Initial JS payload is <200KB gzipped. Run `npx @next/bundle-analyzer` (or equivalent) and confirm no unexpected large dependencies.
9. **Caching**: `curl -I https://yourdomain.com/_next/static/chunks/main.abc123.js` shows `Cache-Control: public, max-age=31536000, immutable`. HTML pages show `must-revalidate`.
10. **Onboarding**: New user signup to first meaningful action takes <2 minutes (time it manually).

---

## Companion tools

- `coreyhaines31/marketingskills` -> `seo-audit` — SEO audit and recommendations
- `coreyhaines31/marketingskills` -> `site-arch` — Site architecture analysis
- `coreyhaines31/marketingskills` -> `page-cro` — Page conversion rate optimization
