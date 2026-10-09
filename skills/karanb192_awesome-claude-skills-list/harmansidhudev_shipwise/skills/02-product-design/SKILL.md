---
name: product-design
description: "Product design methodology — MVP scoping, user stories, roadmapping, wireframes, design systems, accessibility, pricing models, and responsive strategy."
triggers:
  - "product design"
  - "MVP"
  - "MVP scope"
  - "user story"
  - "user stories"
  - "roadmap"
  - "product roadmap"
  - "wireframe"
  - "information architecture"
  - "user flow"
  - "design system"
  - "accessibility"
  - "WCAG"
  - "responsive design"
  - "pricing model"
  - "feature prioritization"
  - "MoSCoW"
  - "RICE scoring"
  - "RICE"
  - "design handoff"
  - "design tokens"
  - "color tokens"
  - "typography scale"
  - "spacing system"
  - "component inventory"
  - "breakpoints"
  - "mobile-first"
  - "touch targets"
  - "acceptance criteria"
  - "feature gates"
  - "Van Westendorp"
  - "form validation"
  - "form UX"
  - "inline validation"
  - "autosave"
  - "onboarding flow"
  - "onboarding checklist"
  - "first-time user"
  - "activation metric"
  - "progressive disclosure"
  - "tooltip tour"
  - "empty state"
  - "button states"
  - "toast notification"
  - "skeleton screen"
  - "loading state"
  - "micro-interaction"
  - "optimistic UI"
  - "design audit"
  - "UI audit"
  - "UX audit"
  - "UX review"
  - "visual audit"
  - "accessibility audit"
  - "a11y audit"
  - "contrast ratio"
  - "contrast check"
  - "color contrast"
  - "review my UI"
  - "review my design"
  - "UI review"
  - "review brief"
  - "brand personality"
  - "theme parity"
---

# Product Design

> Phase 1: DESIGN | Sprint 5

Guides product scoping, design methodology, and design system foundations for webapp launches.

## Coverage

- MVP scoping (MoSCoW, RICE scoring with calibration examples)
- User story format with acceptance criteria (Given/When/Then)
- Roadmap template (MVP → V1.1 → V2 with explicit out-of-scope)
- Pricing model design (tiers, trials, feature gates, Van Westendorp survey)
- Information architecture and user flow mapping
- Wireframe methodology (low-fi → mid-fi → high-fi pipeline)
- State inventory (empty, loading, populated, error, offline per screen)
- Design system foundation (color tokens, typography scale, spacing system, component inventory)
- Design handoff checklist
- Responsive strategy (breakpoints, mobile-first, touch targets ≥44px)
- WCAG 2.2 AA checklist at design stage (50 items)
- Form UX patterns (multi-step vs single-page, validation timing, error display, autosave)
- Onboarding UX patterns (checklists, tooltip tours, progressive disclosure, activation metrics)
- Micro-interaction patterns (button states, toasts, skeletons, optimistic UI, transitions)

---

## Checklist Items

### MVP Scope Definition

<!-- beginner -->
**Define your MVP scope** — MVP stands for "Minimum Viable Product" — the smallest version of your app that delivers real value to real users. The goal is to launch fast, learn from users, then improve. Start by listing every feature you can think of, then ruthlessly cut using MoSCoW: **Must-have** (launch blockers — the app is broken without these), **Should-have** (add within 2-4 weeks after launch), **Could-have** (nice but not important), **Won't-have** (explicitly out of scope). Your MVP should have 3-5 must-haves maximum. If you have more, you are building too much. Use RICE scoring (Reach x Impact x Confidence / Effort) to break ties between features that seem equally important.
> Time: ~2-3 hours
> Reference: See `references/mvp-scoping-rice.md`

<!-- intermediate -->
**MVP scope (MoSCoW + RICE)** — Must/Should/Could/Won't categorization with RICE scoring for prioritization within tiers. Calibrate RICE using the examples in the reference doc. Target 3-5 must-haves for MVP. Define explicit out-of-scope list. Document scope cut decisions with rationale to prevent revisiting them later. Set up scope change process (any new must-have requires removing one).
> ~2-3 hours | `references/mvp-scoping-rice.md`

<!-- senior -->
**MVP scope** — MoSCoW + RICE scored. Max 3-5 must-haves. Explicit out-of-scope log. Scope change requires trade-off (add one = cut one). RICE calibrated against reference examples.
> `references/mvp-scoping-rice.md`

---

### User Stories & Acceptance Criteria

<!-- beginner -->
**Write user stories for every feature** — User stories describe features from the user's perspective: "As a [role], I want [action] so that [benefit]." This format forces you to think about WHY users need a feature, not just WHAT it does. Each story needs acceptance criteria written in Given/When/Then format: "Given I am logged in, When I click the dashboard, Then I see my recent activity." These criteria are your definition of "done" — if all acceptance criteria pass, the story is complete. Size stories as XS (< 1 hour), S (half day), M (1-2 days), L (3-5 days), or XL (break it down further).
> Time: ~1-2 hours for an epic with 5-8 stories
> Reference: See `references/user-story-template.md`

<!-- intermediate -->
**User stories with acceptance criteria** — "As a [role], I want [action] so that [benefit]" with Given/When/Then acceptance criteria. Size using XS/S/M/L/XL (anything XL needs splitting). Group into epics. Include edge cases in acceptance criteria (empty state, error handling, permissions). Watch for anti-patterns: stories too large, missing benefit clause, tech-only stories without user value.
> ~1-2 hours per epic | `references/user-story-template.md`

<!-- senior -->
**User stories** — Role/Want/Benefit format, Given/When/Then acceptance criteria, XS-XL sizing (split XL), edge cases in AC, grouped by epic. Avoid tech-only stories without user value.
> `references/user-story-template.md`

---

### Product Roadmap

<!-- beginner -->
**Create a product roadmap** — A roadmap is a timeline for what you will build and when. Organize it into three releases: **MVP** (what you launch with — your must-haves), **V1.1** (first update 2-4 weeks after launch — your should-haves and quick wins from user feedback), and **V2** (major update 2-3 months later — could-haves and features informed by real usage data). Critically, also write an "Out of Scope" section listing features you are deliberately NOT building. This prevents scope creep and keeps your team focused. Share the roadmap with stakeholders so everyone agrees on what is and is not included.
> Time: ~1-2 hours
> Reference: See `references/mvp-scoping-rice.md` (roadmap template section)

<!-- intermediate -->
**Product roadmap** — Three-horizon plan: MVP (must-haves, 4-8 weeks), V1.1 (should-haves + feedback-driven, 2-4 weeks post-launch), V2 (data-informed features, 2-3 months post-launch). Explicit out-of-scope section with rationale. Review cadence: weekly during build, bi-weekly post-launch. Update based on user feedback, analytics, and business metrics — not stakeholder opinions alone.
> ~1-2 hours | `references/mvp-scoping-rice.md`

<!-- senior -->
**Roadmap** — MVP / V1.1 / V2 horizons. Explicit out-of-scope. Weekly review during build. Data-informed re-prioritization post-launch.
> `references/mvp-scoping-rice.md`

---

### Pricing Model Design

<!-- beginner -->
**Design your pricing model** — If you are charging money, you need to decide: (1) **Tiers** — Free, Pro, Enterprise is the most common SaaS pattern. Define exactly what each tier gets. (2) **Trials** — 14-day free trials convert better than 7-day but worse than 30-day. Pick 14 to start. (3) **Feature gates** — Which features are behind the paywall? Gate the features that provide the most value to power users, not basic functionality. (4) **Pricing research** — The Van Westendorp survey asks 4 price questions to find the acceptable range. Run it with 20-30 potential users. Start with pricing you feel is "uncomfortably high" — you can always discount but rarely raise prices.
> Time: ~3-4 hours (including research)
> Tip: If you are pre-revenue, skip this until you have at least 10 users asking about pricing.

<!-- intermediate -->
**Pricing model** — Tier structure (Free/Pro/Enterprise or usage-based), trial length (14d standard, consider freemium for PLG), feature gating strategy (gate value, not basics). Van Westendorp survey (4 price questions, n≥20) to find acceptable price range. Consider annual discount (15-20% off monthly), seat-based vs usage-based, overage handling. Document pricing in a decision log with rationale. Plan for grandfathering existing users on price changes.
> ~3-4 hours

<!-- senior -->
**Pricing** — Tier structure, trial/freemium decision, feature gates (value not basics), Van Westendorp (n≥20), annual discount, grandfathering plan. Document rationale for pricing tribunal reviews.

---

### Information Architecture & User Flows

<!-- beginner -->
**Map your information architecture and user flows** — Information architecture (IA) is how you organize content and navigation in your app. Think of it as a tree: top-level pages branch into sub-pages and features. Start by listing every page/screen your app needs, then organize them into a hierarchy that makes sense to users (not developers). User flows are step-by-step paths through your app for key tasks. Map the "happy path" (everything works) and at least one error/edge case path for each critical flow. Draw these on paper, a whiteboard, or in Figma/Excalidraw.
> Time: ~2-3 hours
> Reference: See `references/wireframe-checklist.md` (IA template section)

<!-- intermediate -->
**Information architecture & user flows** — Site map / screen inventory (list every screen with parent-child relationships). Navigation model (primary nav, secondary nav, breadcrumbs, contextual links). User flows for critical paths: signup/onboarding, core task loop, upgrade/payment, settings/account management. Each flow: happy path + error states + edge cases. Validate IA with card sorting (open sort with 5+ users) or tree testing if resources allow.
> ~2-3 hours | `references/wireframe-checklist.md`

<!-- senior -->
**IA & user flows** — Screen inventory with hierarchy, navigation model, critical-path user flows (happy + error), card sort or tree test validation.
> `references/wireframe-checklist.md`

---

### Wireframe Methodology

<!-- beginner -->
**Create wireframes for every screen** — Wireframes are simplified drawings of your screens that focus on layout and content, not colors or polish. Work in three stages: (1) **Low-fi** (paper sketches or whiteboard, ~5 min per screen) — get ideas out fast, explore 2-3 layout options per screen. (2) **Mid-fi** (Figma or Excalidraw, key screens only) — add real content, define the grid, show all interactive elements. (3) **High-fi** (pixel-perfect, design tokens applied) — only after low-fi and mid-fi are validated. Most MVP teams only need mid-fi wireframes. Do not skip to high-fi — you will waste time polishing screens that get redesigned after user feedback.
> Time: Low-fi ~30 min, Mid-fi ~2-4 hours, High-fi ~1-2 days
> Reference: See `references/wireframe-checklist.md`

<!-- intermediate -->
**Wireframe pipeline** — Low-fi (paper/whiteboard, 5 min/screen, explore alternatives), Mid-fi (Figma/Excalidraw, key screens, real content, grid-based), High-fi (design tokens applied, pixel-perfect, only after validation). For each screen at mid-fi, complete the state inventory: empty, loading, populated, error, offline. Most MVP launches need mid-fi only — high-fi for landing page and first-run experience.
> Low-fi ~30 min, Mid-fi ~2-4 hours | `references/wireframe-checklist.md`

<!-- senior -->
**Wireframes** — Low-fi → mid-fi → high-fi pipeline. State inventory per screen (empty/loading/populated/error/offline). High-fi only for landing + onboarding at MVP stage.
> `references/wireframe-checklist.md`

---

### State Inventory

<!-- beginner -->
**Map every state for every screen** — Every screen in your app can be in multiple states, and you need to design for all of them: (1) **Empty** — no data yet (the user just signed up). Show a helpful message or onboarding prompt, not a blank page. (2) **Loading** — data is being fetched. Show a skeleton or spinner. (3) **Populated** — normal state with data. This is what you designed first. (4) **Error** — something went wrong. Show a clear message and a retry action. (5) **Offline** — no internet connection (relevant for mobile/PWA). Create a grid: rows are screens, columns are states. Every cell needs a design.
> Time: ~1-2 hours for all screens
> Reference: See `references/wireframe-checklist.md` (state matrix section)

<!-- intermediate -->
**State inventory** — For every screen: empty (CTA or onboarding), loading (skeleton preferred over spinner), populated (normal + edge cases like 1 item vs 100 items), error (message + retry + fallback), offline (cached data vs no data). Create a state matrix (screen x state grid). Prioritize: empty states drive activation, error states drive retention. Consider partial states (some data loaded, some failed).
> ~1-2 hours | `references/wireframe-checklist.md`

<!-- senior -->
**State inventory** — Screen x state matrix (empty/loading/populated/error/offline/partial). Empty states drive activation. Skeleton loading preferred. Partial failure handling.
> `references/wireframe-checklist.md`

---

### Design System Foundation

<!-- beginner -->
**Set up your design system basics** — A design system is a shared set of rules and reusable components so your app looks consistent. You need four foundations: (1) **Color tokens** — define your primary, secondary, neutral, success, warning, error, and info colors. Use semantic names (e.g., `color-primary` not `blue-500`). (2) **Typography scale** — pick one font family. Define 6-8 sizes (xs through 3xl) with matching line heights. (3) **Spacing system** — use a 4px or 8px base unit. Define spacing tokens: 4, 8, 12, 16, 24, 32, 48, 64px. (4) **Component inventory** — list every UI component you need (buttons, inputs, cards, modals, navigation, etc.) and decide which to build vs use from a library (Shadcn, Radix, etc.).
> Time: ~3-4 hours
> Tip: Use an existing design system like Shadcn/ui, Radix, or Chakra — do not build from scratch at MVP stage.

<!-- intermediate -->
**Design system foundation** — Color tokens (semantic naming: primary/secondary/neutral/success/warning/error/info, light + dark mode), typography scale (1 font family, 6-8 sizes with line-height ratios, responsive scaling), spacing system (4px or 8px base, token set: 4/8/12/16/24/32/48/64), component inventory (audit needed components, decide build vs adopt for each — prefer Shadcn/Radix/Headless UI at MVP). Define as CSS custom properties or Tailwind config tokens. Document in a living style guide.
> ~3-4 hours

<!-- senior -->
**Design system** — Semantic color tokens (light + dark), type scale (6-8 stops), 8px spacing grid, component inventory (build vs adopt). CSS custom properties or Tailwind config. Living style guide.

---

### Design Handoff Checklist

<!-- beginner -->
**Complete the design handoff checklist** — Design handoff is the process of giving developers everything they need to build what you designed. A bad handoff causes misinterpretation, back-and-forth, and wasted time. Your handoff should include: all screens in every state (not just the happy path), exact spacing and sizing values, color values, typography specs, component behavior descriptions (what happens on hover, click, focus), responsive behavior at each breakpoint, accessibility annotations (tab order, screen reader text, ARIA labels), and any animations or transitions. Use the 30-item checklist in the reference doc.
> Time: ~2-3 hours
> Reference: See `references/wireframe-checklist.md` (design handoff section)

<!-- intermediate -->
**Design handoff** — 30-item checklist covering: layout specs (spacing, sizing, grid), visual specs (colors, typography, shadows, borders), interaction specs (hover/active/focus/disabled states, transitions, animations), responsive specs (breakpoints, layout shifts, hidden/shown elements), accessibility annotations (tab order, ARIA labels, focus indicators, contrast ratios), content specs (copy, microcopy, error messages, empty states). Deliver in Figma with inspect mode or as annotated exports.
> ~2-3 hours | `references/wireframe-checklist.md`

<!-- senior -->
**Design handoff** — 30-item checklist: layout/visual/interaction/responsive/accessibility/content specs. Figma inspect mode + annotated edge cases.
> `references/wireframe-checklist.md`

---

### Responsive Strategy

<!-- beginner -->
**Plan your responsive design strategy** — Responsive design means your app works well on phones, tablets, and desktops. Follow these rules: (1) **Mobile-first** — design for the smallest screen first, then add complexity for larger screens. This forces you to prioritize what matters. (2) **Breakpoints** — use standard breakpoints: 640px (mobile), 768px (tablet), 1024px (laptop), 1280px (desktop), 1536px (wide). (3) **Touch targets** — any clickable element must be at least 44x44 pixels on touch devices. Small buttons cause frustration and accessibility problems. (4) **Test on real devices** — emulators miss real-world issues like fat-finger taps and notch interference.
> Time: ~1-2 hours to plan, ongoing during build
> Reference: See `references/wireframe-checklist.md` (responsive section)

<!-- intermediate -->
**Responsive strategy** — Mobile-first (design 375px first, enhance upward). Breakpoints: 640/768/1024/1280/1536px (Tailwind defaults). Touch targets ≥44x44px (WCAG 2.5.8). Define layout behavior at each breakpoint: stack vs side-by-side, visible vs hamburger nav, image sizing. Consider: safe areas for notched devices, landscape orientation, hover vs touch interactions (no hover-only UI on mobile). Test on physical iPhone SE (smallest common) and Android mid-range.
> ~1-2 hours | `references/wireframe-checklist.md`

<!-- senior -->
**Responsive** — Mobile-first, standard breakpoints (640/768/1024/1280/1536), touch targets ≥44px, layout rules per breakpoint, no hover-only UI, physical device testing.
> `references/wireframe-checklist.md`

---

### WCAG 2.2 AA Compliance at Design Stage

<!-- beginner -->
**Check accessibility at design stage (WCAG 2.2 AA)** — Accessibility means everyone can use your app, including people with visual, motor, hearing, or cognitive disabilities. It is also a legal requirement in many countries. The good news: most accessibility issues are cheap to fix at design stage but expensive to fix after building. The key rules: text must have 4.5:1 contrast ratio against its background (use WebAIM Contrast Checker), clickable targets must be at least 44x44 pixels, every image needs alt text, users must be able to navigate entirely by keyboard, and do not convey information by color alone (add icons or text too). Use the 50-item checklist in the reference doc.
> Time: ~1-2 hours to audit designs
> Reference: See `references/accessibility-design-checklist.md`

This checklist covers design-phase accessibility fundamentals. For comprehensive accessibility auditing with axe-core integration, ARIA pattern libraries, and WCAG 2.2 conformance testing, use a dedicated accessibility skill alongside Shipwise:
- AccessLint/claude-marketplace — color contrast checker, WCAG reviewer, automated fixer
- airowe/claude-a11y-skill — axe-core + jsx-a11y auditing
- snapsynapse/skill-a11y-audit — WCAG 2.1 AA with Lighthouse integration

<!-- intermediate -->
**WCAG 2.2 AA at design stage** — 50-item checklist organized by WCAG principles: Perceivable (contrast ratios, text alternatives, captions, adaptable layouts, non-text contrast), Operable (keyboard navigation, no keyboard traps, timing adjustable, touch targets ≥44px, focus indicators, skip navigation, target size), Understandable (readable text, predictable navigation, input assistance, error prevention, consistent navigation, language), Robust (semantic HTML planned, ARIA landmarks, valid structure, live regions). Audit designs before development to catch issues when they are cheap to fix.
> ~1-2 hours | `references/accessibility-design-checklist.md`

This checklist covers design-phase accessibility fundamentals. For comprehensive accessibility auditing with axe-core integration, ARIA pattern libraries, and WCAG 2.2 conformance testing, use a dedicated accessibility skill alongside Shipwise:
- AccessLint/claude-marketplace — color contrast checker, WCAG reviewer, automated fixer
- airowe/claude-a11y-skill — axe-core + jsx-a11y auditing
- snapsynapse/skill-a11y-audit — WCAG 2.1 AA with Lighthouse integration

<!-- senior -->
**WCAG 2.2 AA** — 50-item design-stage audit: Perceivable/Operable/Understandable/Robust. Contrast (4.5:1 text, 3:1 UI), 44px targets, keyboard nav, focus indicators, semantic structure, ARIA plan, skip nav, live regions, language tags, error prevention. Companion skills: AccessLint, airowe/a11y, snapsynapse/a11y-audit for axe-core + WCAG conformance testing.
> `references/accessibility-design-checklist.md`

---

### Design Audit

**Before starting:** If you haven't filled out the UI/UX Review Brief (`templates/ui-ux-review-brief.md`), do that first — it captures your routes, tokens, states, and components so the audit is focused rather than random.

<!-- beginner -->
**Run a design self-review before launch** — A design audit is a structured walkthrough of your UI to catch visual, interaction, and accessibility problems before users see them. You don't need to be a designer — the audit framework gives you 14 specific things to check with 30-second quick tests for each one. Start with Phase 1 (critical issues only): check your color contrast, make sure empty pages have guidance, and test on your phone. Those three steps catch most of the problems that make an app look unfinished.
> Time: ~1-2 hours for Phase 1
> Reference: See `references/design-audit-workflow.md`
> Prep: Fill `templates/ui-ux-review-brief.md` first (sections 1, 2, 3, 6, 10)

<!-- intermediate -->
**Design audit (14-dimension self-review)** — Structured UI review across visual hierarchy, typography, color/contrast, spacing, responsive behavior, interactive states, empty/loading/error states, navigation, forms, accessibility, content quality, and performance perception. Three-phase process: Critical (fix before any user sees it), Refinement (fix before stakeholders), Polish (production quality). Includes brand personality check (3-adjective test) and theme parity verification. Automated code-level checks via `/launch-audit`.
> ~1-2 hours | `references/design-audit-workflow.md`
> Prep: Fill `templates/ui-ux-review-brief.md` first

<!-- senior -->
**Design audit** — 14-dimension self-review + brand personality check + theme parity. 3-phase process (critical/refinement/polish). Automated code-level checks via `/launch-audit` (contrast ratios, skip nav, focus indicators, form labels, heading hierarchy, ARIA landmarks). Manual audit template for visual/interaction quality.
> `references/design-audit-workflow.md` | Prep: `templates/ui-ux-review-brief.md`

---

## Verification Steps

After completing the checklist above, verify:

1. **MVP scope**: You have a MoSCoW table with 3-5 must-haves. Every feature has a RICE score. There is an explicit out-of-scope list.
2. **User stories**: Every must-have feature has user stories with Given/When/Then acceptance criteria. No story is larger than size L.
3. **Roadmap**: MVP, V1.1, and V2 milestones are defined. Out-of-scope is documented.
4. **Wireframes**: At least mid-fi wireframes exist for every must-have screen. State inventory (empty/loading/populated/error/offline) is documented.
5. **Design system**: Color tokens, typography scale, spacing system, and component inventory are defined. Token values are in CSS custom properties or Tailwind config.
6. **Accessibility**: The 50-item WCAG 2.2 AA checklist passes at design stage. Contrast ratios verified with a checker tool.
7. **Responsive**: Breakpoints defined. Layouts wireframed at mobile and desktop widths. Touch targets are ≥44px.
8. **Design handoff**: The 30-item handoff checklist is complete for all screens going to development.

---

## Companion tools

- `anthropics/claude-code` → `frontend-design` skill
- `google-labs-code/design-md`

### Visual design direction

Shipwise covers product design methodology — what to build, how to scope it, and how to structure it for accessibility and responsiveness. For **visual design direction** — choosing an aesthetic tone, avoiding generic AI aesthetics, color palette generation, and creative typography — use bencium-marketplace alongside Shipwise:

- **bencium-controlled-ux-designer** — Systematic UX with guardrails. WCAG 2.1 AA, mathematical scales, always-ask-first protocol. Best for enterprise and regulated industries. (2,553 lines of companion docs)
- **bencium-innovative-ux-designer** — Bold creative direction. 11 aesthetic tones from minimal to maximalist. Best for landing pages and campaigns.
- **bencium-impact-designer** — Award-level visual quality. 40+ aesthetic directions, anti-sameness protocols. Best when visual identity is a competitive advantage.
- **bencium typography** — Typographic correctness (curly quotes, proper dashes, letterspacing, line length). Use alongside any designer skill.
- **bencium design-audit** — 14-dimension visual audit with 3-phase improvement plan (critical → refinement → polish).

Install: `claude plugin marketplace add bencium/bencium-marketplace`
