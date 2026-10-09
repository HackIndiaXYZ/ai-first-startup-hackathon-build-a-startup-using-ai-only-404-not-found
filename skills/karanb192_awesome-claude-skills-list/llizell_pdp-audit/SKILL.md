---
name: pdp-audit
description: Research-backed UX and conversion audit of ecommerce product detail pages (PDPs). Use this skill whenever the user wants to review, audit, critique, or improve a product page — including requests like "review this PDP", "audit my product page", "why isn't this page converting", "UX review of [URL]", "check this product page against best practices", or when the user shares a product page URL or screenshots and asks for feedback. Also trigger for CRO reviews, conversion audits, or design QA of product pages, even if the words "audit" or "PDP" are not used.
---

# PDP Audit

Audit an ecommerce product detail page against research-backed UX and conversion guidelines. Produce a prioritized, evidence-based report a design or dev team can act on immediately.

The guideline knowledge base lives in `references/pdp-guidelines.md`. Read it in full before auditing. If `references/private-guidelines.md` exists, read that too and treat its entries as additional checks (users may add their own research there — never create this file yourself).

## Step 1 — Capture evidence

Determine what you have to work with:

**Mode A: Live URL + browser access (Playwright MCP or similar).**
1. Open the URL at desktop width (1440px). Take a full-page screenshot, then screenshots of each zone as you scroll: gallery, buy box, description/specs, reviews, cross-sells, footer area.
2. Repeat at mobile width (390px). Pay attention to what is above the fold and whether a sticky add-to-cart appears on scroll.
3. Interact where guidelines require it: click a color/size swatch (does the gallery and price update?), open the size guide (overlay or new page?), attempt add-to-cart (what confirmation appears?), hover/tap the main image (zoom?).
4. Inspect the DOM where visuals are ambiguous: shipping info presence, structured data, disabled states, tap target sizes.

**Mode B: Screenshots only.**
Ask which device the screenshots represent if unclear. Audit only what is visually verifiable. Every check that requires interaction or scrolling beyond the provided images goes to the "Verify manually" list — never guess.

If the user gave a URL but no browser tooling is available, say so and ask for screenshots (ideally desktop full-page plus mobile) — don't audit a page you can't see. If the user provided neither a URL nor screenshots, ask for one of them before proceeding.

## Step 2 — Inventory the page

Before checking details, list which PDP zones exist and which expected zones are missing entirely (gallery, buy box, price, variants, shipping & returns info, reviews, description/specs, cross-sells). A missing zone is often the single biggest finding — e.g., no shipping information anywhere on the PDP outranks any styling issue. Also assess the page-level layout (single column, tabs vs. stacked sections, table of contents) against the Layout & structure (L) guidelines — layout applies to the whole page rather than any one zone.

Also note the platform if detectable (Shopify markup, theme signatures) so recommendations are realistic for that stack.

## Step 3 — Check zones against guidelines

Walk each zone against the matching section of `references/pdp-guidelines.md`.

Hard rules:
- **Evidence only.** A finding must point to something observable in the screenshot or DOM. No generic advice ("improve hierarchy", "make it cleaner"), no assumptions about pages you haven't seen.
- **Uncertain → "Verify manually", never a finding.** If shipping costs might appear in the cart, or a widget might behave differently when logged in, say so explicitly instead of flagging it. False positives destroy trust in the entire audit.
- **Severity is about purchase impact, not aesthetics:**
  - **Critical** — likely blocks or actively deters purchases (no shipping cost anywhere pre-checkout, broken variant selection, ATC below fold on mobile with no sticky bar, inaccessible CTA).
  - **High** — measurable friction or missing trust/information users need to decide (no return policy on PDP, 2 studio photos for a considered purchase, hidden review distribution).
  - **Medium** — friction or polish with plausible but smaller conversion impact.
- Also note **2–3 things done well**. Useful for stakeholder presentations and it keeps the audit credible.

## Step 4 — Write the report

Single markdown document. If file creation is available, save it as `pdp-audit-[site]-[date].md`; otherwise output in the conversation.

Structure:

```
# PDP UX Audit — [Product / Site]
[Date] · [Mode: live URL / screenshots] · [Viewports covered]

## Summary
2–4 sentences: overall state, the one or two changes with the highest
expected conversion impact, and any zone missing entirely.

## What's working
2–3 bullets, specific.

## Findings
Max 12 findings. Sorted by severity; within a severity tier, quick
wins (S effort) first. Number them.

### [N]. [Short title] — [Critical/High/Medium] · Effort: [S/M/L]
**Zone:** [zone] · **Guideline:** [ID from pdp-guidelines.md]
**Observed:** what you saw, referencing the screenshot/viewport.
**Why it matters:** the conversion rationale, one or two sentences.
**Recommendation:** concrete enough to hand to a developer — what
element, what change, what behavior. Platform-aware if the platform
is known.

## Additional observations
One line each for anything beyond the 12-finding cap.

## Verify manually
Checks that require interaction, other pages, or data you couldn't
access (logged-in states, inventory edge cases, cart behavior,
A/B variants, analytics).

---
*Based on compiled, publicly documented ecommerce UX best practice
and standards, referenced per guideline in this skill's knowledge
base. Not affiliated with or endorsed by any research organization
or platform.*
```

The 12-finding cap is a hard cap. An audit with 40 findings gets ignored; an audit with 12 prioritized ones gets shipped.

## Voice

Write like a senior UX designer presenting to a client team: direct, specific, zero filler. Findings state facts and consequences, not opinions about taste.

## Extending to other page types

This skill is structured for expansion: audits for PLPs, cart, and checkout follow the same workflow with their own guideline files (`plp-guidelines.md`, `cart-guidelines.md`, `checkout-guidelines.md`). If a user asks to audit one of those page types and the corresponding guideline file doesn't exist yet, say so and offer to audit against general principles with reduced confidence, clearly labeled.
