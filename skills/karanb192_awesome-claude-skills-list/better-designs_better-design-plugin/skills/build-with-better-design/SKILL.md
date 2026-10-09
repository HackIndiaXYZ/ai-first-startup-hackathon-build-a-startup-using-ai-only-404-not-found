---
name: build-with-better-design
description: Build or redesign a web or mobile interface on a Better Design design system. Use when the user asks for an app, site, page, dashboard or component and wants it built on Better Design, or asks to choose, create or install a design system.
---

# Build with Better Design

The Better Design MCP server provides design systems, design principles and review checks. This skill is the order to use them in when building an interface.

## 1. Keep the design system the project already has

If `components/ui/` already holds a Better Design system, or `components/icons/.library.json` names an icon library, build with those. Change them only when the user asks.

## 2. Choose a design system with the user

1. Call `find-design-system` with a short description of the product and its audience.
2. Show the user the top matches, each with its name and preview link, and let the user pick one.
3. For a custom brand, call `create-design-system` with a description of the look. Pass the chosen match as `baseDesignSystemId`, or pass `brandCss` from `extract-from-url` or `extract-design-system` when the user has an existing site or stylesheet.
4. Poll `get-design-system-status` until the system is ready, then share its preview link.

## 3. Install it

Call `get-design-system-kit` with the target that fits the project:

| Project | Target |
| --- | --- |
| React or Next.js with a terminal | `react`, then run the returned install command |
| An inline canvas or artifact with no build step | `html` |
| React Native or Expo | `react-native` |
| An iOS app in SwiftUI | `swiftui` |
| A Shopify theme | `shopify` |

Build with the installed components instead of writing new ones.

## 4. Check the principles for the job

- Before styling, call `get-ui-principle` with the topic, such as `spacing`, `typography` or `color`.
- Before building a flow, call `get-ux-principle` with the topic, such as `forms`, `onboarding` or `errors`.
- For icons, call `find-icon-library`, then `find-icons`, then `install-icons`, and save the returned files.

## 5. Review before you present

Use the `review-ui-with-better-design` skill on the finished screens, and fix every critical and serious finding.
