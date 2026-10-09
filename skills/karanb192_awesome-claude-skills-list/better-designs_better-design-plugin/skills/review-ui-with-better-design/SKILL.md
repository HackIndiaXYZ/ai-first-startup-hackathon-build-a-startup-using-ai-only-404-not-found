---
name: review-ui-with-better-design
description: Review an interface with Better Design's checks for accessibility, visual design, copy clarity and spacing. Use when the user asks to review, audit or check a screen, or after building one with Better Design.
---

# Review UI with Better Design

## 1. Review the code

Call `get-review-rules` for the categories that apply: `accessibility`, `visual-design`, `animation`, `content`, `comprehension` or `ai-features`. Check the code against each rule and note its severity.

## 2. Check the copy

Call `check-comprehension` with the screen's headline, body and action labels, or with its markup. It flags insider words, screens that take too long to explain, and actions that hide their result.

## 3. Measure the spacing

When a browser is available:

1. Call `inspect-spacing` with no states to get the capture script.
2. Run the script in the rendered page at desktop and mobile widths.
3. Call `inspect-spacing` again with the captured states. It returns each spacing fault with a correction.

## 4. Dashboards

For a dashboard or overview page, call `review-dashboard-structure` with the page source, its data fixture and the installed component sources.

## 5. Fix and report

Fix every critical and serious finding, run the checks again, and tell the user what changed and what remains.
