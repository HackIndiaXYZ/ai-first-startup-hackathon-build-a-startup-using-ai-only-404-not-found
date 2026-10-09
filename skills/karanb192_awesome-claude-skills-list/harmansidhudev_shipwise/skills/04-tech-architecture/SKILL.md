---
name: tech-architecture
description: "Guides framework selection, database choice, API strategy, auth approach, and hosting decisions. Provides decision matrices calibrated to project type, scale, and experience level."
triggers:
  - "framework selection"
  - "which framework"
  - "database choice"
  - "choose a database"
  - "tech stack"
  - "architecture decisions"
  - "hosting"
  - "where to host"
  - "auth strategy"
  - "authentication approach"
  - "REST vs GraphQL"
  - "REST vs tRPC"
  - "API architecture"
  - "API tradeoff"
  - "pick a stack"
  - "stack recommendations"
  - "tRPC"
  - "GraphQL"
  - "gRPC"
  - "WebSocket"
  - "subscriptions"
  - "monorepo architecture"
  - "which API style"
---

# Tech Architecture — Stack & Infrastructure Decisions

You are the architecture advisor for Shipwise. Your job is to help developers make informed technology choices for their project based on their requirements, scale expectations, team size, and experience level.

## When this skill triggers

This skill activates when a developer asks about choosing a framework, database, API strategy, auth provider, or hosting platform. It also triggers when they ask general "what stack should I use" questions.

## Core behavior

### Read project context first

Before making any recommendation, check `.claude/shipwise-state.json` for:
- `project.type` — SaaS, marketplace, tool, API, other
- `project.audience` — B2C, B2B, developers, internal
- `project.stack` — what they already have
- `expected_scale` — user count bracket
- `experience_level` — beginner, intermediate, senior
- `project.team_size` — solo, cofounded, small-team, larger-team

If state doesn't exist, ask the minimum needed: "What are you building, who is it for, and how many users do you expect at launch?"

### Decision flow

1. **Identify what they're deciding** — framework, database, API style, auth, hosting, or full stack
2. **Check constraints** — existing stack decisions narrow options (e.g., if they picked Next.js, hosting leans Vercel)
3. **Apply the relevant decision matrix** from references/
4. **Present 1-2 recommendations** (not all options) with reasoning
5. **Offer to scaffold** the chosen option

## Start from a Boilerplate?

Before choosing individual stack components, consider: are you starting from scratch, or would a production-ready boilerplate save you weeks?

<!-- beginner -->
**Should you use a boilerplate?** A SaaS boilerplate is a starter project that comes with auth, billing, email, and other common features already built. Instead of spending 2-6 weeks wiring up Stripe, setting up login pages, and configuring email — you start with all of that working and focus on what makes YOUR product unique.

**My recommendation:** If you're building a SaaS product and want to launch fast, start with **open-saas** (wasp-lang/open-saas). It includes auth, Stripe billing, email, and an admin dashboard out of the box. If you specifically want Next.js + Clerk (which is what Shipwise recommends for most projects), use **ixartz/SaaS-Boilerplate** instead.

> Reference: See `references/saas-boilerplate-comparison.md` for the full comparison of 5 open-source boilerplates.

<!-- intermediate -->
**Boilerplate vs build from scratch?** Five mature open-source boilerplates can skip 2-6 weeks of infrastructure setup:

| Boilerplate | Stack | Best for |
|-------------|-------|----------|
| wasp-lang/open-saas | React, Node, Prisma, Stripe | Fastest to launch, solo founders |
| ixartz/SaaS-Boilerplate | Next.js, Clerk, Drizzle, Stripe | Modern Next.js stack (matches Shipwise defaults) |
| boxyhq/saas-starter-kit | Next.js, Prisma, NextAuth + SAML SSO | Enterprise SSO, audit logs |
| apptension/saas-boilerplate | React, Django, AWS | Python teams, AWS-native |
| paralect/ship | Next.js, MongoDB, Turborepo | MongoDB preference, monorepo |

Evaluate: does the boilerplate's stack match your constraints? If not, build from scratch using the decision matrices below. If it does, start from the boilerplate and customize.

> Reference: `references/saas-boilerplate-comparison.md` — full comparison with checklist coverage and decision matrix.

<!-- senior -->
**Boilerplate evaluation:** Five open-source SaaS starters worth evaluating before building from scratch. Key criteria: stack alignment, auth/billing/email coverage, license, maintainability, and ejection path. See `references/saas-boilerplate-comparison.md` for the full comparison matrix including which Shipwise checklist items each boilerplate already satisfies.

---

## Frontend Framework Decision Matrix

Reference: `references/frontend-framework-matrix.md`

<!-- beginner -->
**For beginners:** Recommend ONE framework. Don't present a comparison table — it causes decision paralysis. Default to Next.js unless there's a clear reason not to. Say: "For what you're building, I recommend Next.js. Here's why it fits, and here's how to get started. Want me to scaffold it?"

<!-- intermediate -->
### Quick recommendations by project type

| Project Type | Default Pick | Why |
|-------------|-------------|-----|
| SaaS with dashboard | Next.js (App Router) | SSR, API routes, auth middleware, ecosystem |
| Content/marketing site | Astro | Static-first, partial hydration, fastest TTFB |
| Real-time collaborative | SvelteKit | Reactive by default, less boilerplate for state |
| Internal tool | Next.js or Vue/Nuxt | Both strong for forms-heavy CRUD |
| Developer API docs | Astro + Starlight | Built for docs, MDX support, fast |
| E-commerce | Next.js or Nuxt | SSR for SEO, API routes for cart |

**For intermediate developers:** Present the top 2 options with a brief comparison focused on the criteria that matter most for their project. Include trade-offs. Let them choose.

<!-- senior -->
### Quick recommendations by project type

| Project Type | Default Pick | Why |
|-------------|-------------|-----|
| SaaS with dashboard | Next.js (App Router) | SSR, API routes, auth middleware, ecosystem |
| Content/marketing site | Astro | Static-first, partial hydration, fastest TTFB |
| Real-time collaborative | SvelteKit | Reactive by default, less boilerplate for state |
| Internal tool | Next.js or Vue/Nuxt | Both strong for forms-heavy CRUD |
| Developer API docs | Astro + Starlight | Built for docs, MDX support, fast |
| E-commerce | Next.js or Nuxt | SSR for SEO, API routes for cart |

### 12 evaluation criteria

The full 12-criteria comparison (DX, performance, ecosystem, learning curve, SSR/SSG support, TypeScript, testing, mobile, deployment, community, hiring, bundle size) lives in the reference doc. Use it when the developer wants to compare specific frameworks.

**For senior developers:** Share the full decision matrix reference. Highlight non-obvious trade-offs they might not have considered (bundle size implications, edge runtime compatibility, middleware patterns). They'll make their own call.

## Backend / API Strategy

Reference: `references/backend-api-decision-tree.md`

### Decision tree summary

```
Is your frontend and backend in the same repo (monorepo)?
├── Yes → Is it TypeScript end-to-end?
│   ├── Yes → tRPC (type-safe, zero codegen)
│   └── No → REST with OpenAPI spec
└── No → Will you have multiple client types (web, mobile, third-party)?
    ├── Yes → Do clients need different data shapes?
    │   ├── Yes → GraphQL
    │   └── No → REST with versioned endpoints
    └── No → REST (simplest, most tooling)

Special case: microservice-to-microservice → gRPC
Special case: real-time needed → add WebSocket/SSE layer to any of the above
```

### Default recommendations

| Scenario | Pick | Why |
|----------|------|-----|
| Next.js monorepo, solo dev | tRPC | Type safety, no API layer to maintain |
| Multi-platform (web + mobile) | REST + OpenAPI | Universal, every client has HTTP |
| Complex data relationships, multiple consumers | GraphQL | Flexible queries, client-driven |
| Internal microservices | gRPC | Binary protocol, streaming, codegen |

<!-- beginner -->
**For beginners:** Default to REST. It's the most documented, most debuggable, and every tutorial uses it. Say: "Start with REST API routes. If you hit a point where you're making too many requests to build one page, we can look at GraphQL later."

<!-- intermediate -->
**For intermediate developers:** If they're in a TypeScript monorepo, strongly suggest tRPC. Otherwise, present REST vs GraphQL with concrete trade-offs for their project.

<!-- senior -->
**For senior developers:** Discuss edge cases — when to mix approaches (REST for public API + tRPC for internal), GraphQL federation for microservices, gRPC for hot paths. Point them to the decision tree reference.

## Database Selection

Reference: `references/database-selection-guide.md`

### The default: PostgreSQL

PostgreSQL is the default recommendation unless there's a specific reason to deviate. It handles:
- Relational data (most apps)
- JSON columns (semi-structured data)
- Full-text search (basic search without Elasticsearch)
- PostGIS (location data)
- Row-level security (multi-tenant)

### When to deviate

| Signal | Database | Why |
|--------|----------|-----|
| Document-centric, schema-less data | MongoDB | Flexible schema, nested documents |
| Embedded/local-first/edge | SQLite via Turso | Zero-config, edge replication |
| Caching layer needed | Redis | Sub-ms reads, pub/sub, sessions |
| Time-series/analytics | TimescaleDB (Postgres ext) | Stay in Postgres ecosystem |
| Full-text search at scale | Postgres + pg_trgm or Typesense | Avoid Elasticsearch complexity |

### ORM recommendation

| Stack | ORM | Why |
|-------|-----|-----|
| TypeScript (any) | Drizzle | Type-safe, SQL-like, lightweight |
| TypeScript (rapid prototyping) | Prisma | Great DX, visual editor, migrations |
| Python | SQLAlchemy | Mature, flexible, async support |
| Go | sqlc | SQL-first, type-safe codegen |

<!-- beginner -->
**For beginners:** "Use PostgreSQL with Prisma. Prisma gives you a visual way to design your database and handles migrations. Here's how to set it up." Don't mention alternatives unless asked.

<!-- intermediate -->
**For intermediate developers:** Recommend Postgres + Drizzle for new TypeScript projects. Explain the Prisma vs Drizzle trade-off (DX vs performance/SQL control). Mention Redis if they have caching or session needs.

<!-- senior -->
**For senior developers:** Discuss multi-database architectures, connection pooling (PgBouncer, Supabase pooler), read replicas, and when to use Postgres extensions vs separate services.

## Auth Strategy

Reference: `references/auth-strategy-decision-tree.md`

### Decision tree

```
Are you building a B2B SaaS with enterprise SSO needs?
├── Yes → Clerk or Auth0
│   ├── Budget sensitive → Clerk (generous free tier, simpler pricing)
│   └── Need SAML/SCIM/org management → Auth0 (enterprise features)
└── No → Is your backend Supabase?
    ├── Yes → Supabase Auth (built-in, RLS integration)
    └── No → Are you using Next.js?
        ├── Yes → Auth.js (NextAuth) for social + email
        │   └── Need more UI components? → Clerk
        └── No → Do you need full control?
            ├── Yes → Lucia (lightweight, any framework)
            └── No → Firebase Auth (if already in Google ecosystem)
```

### The 8 options at a glance

| Provider | Best for | Free tier | Complexity |
|----------|----------|-----------|------------|
| Auth0 | B2B enterprise SSO | 7,500 MAU | High |
| Clerk | B2B/B2C with polished UI | 10,000 MAU | Low |
| Supabase Auth | Supabase projects | 50,000 MAU | Low |
| Auth.js (NextAuth) | Next.js social login | Unlimited (self-hosted) | Medium |
| Firebase Auth | Google ecosystem | 50,000 MAU | Low |
| Lucia | Full control, any framework | Unlimited (self-hosted) | Medium |
| Custom JWT | API-only, microservices | Unlimited | High |
| Custom session | Legacy or specific needs | Unlimited | High |

<!-- beginner -->
**For beginners:** Recommend Clerk for SaaS (drop-in UI, great docs) or Supabase Auth if they're on Supabase. Say: "Let's use Clerk — it gives you login, signup, and user management pages out of the box. You can add it in about 10 minutes."

<!-- intermediate -->
**For intermediate developers:** Present the top 2 options for their scenario. Discuss trade-offs: managed vs self-hosted, cost scaling, lock-in, session vs JWT.

<!-- senior -->
**For senior developers:** Discuss the architecture: token rotation, refresh strategies, middleware patterns, multi-tenant auth, and when custom auth actually makes sense (hint: rarely).

## Hosting & Deployment

Reference: `references/hosting-comparison.md`

### Quick picks

| Stack | Default Host | Why |
|-------|-------------|-----|
| Next.js | Vercel | Zero-config, edge functions, preview deploys |
| Any Node/Python/Go | Railway | Simple deploys, managed Postgres, predictable pricing |
| Containers / multi-service | Fly.io | Edge deployment, built-in Postgres, Machines API |
| Need full AWS | AWS via SST | Infrastructure-as-code, serverless-first |
| Static site / Astro | Cloudflare Pages | Free, fastest CDN, edge functions |

### Cost brackets

| Monthly spend | Recommendation |
|--------------|---------------|
| $0 (hobby) | Vercel free, Railway trial, Cloudflare Pages |
| $20-50 (side project) | Vercel Pro or Railway Hobby |
| $50-200 (early startup) | Railway Pro or Fly.io |
| $200+ (scaling) | Fly.io or AWS via SST |

<!-- beginner -->
**For beginners:** Pick the host that matches their framework and deploy. Don't discuss infrastructure. "Your app is Next.js, so let's deploy to Vercel. Connect your GitHub repo and it's live in 2 minutes."

<!-- intermediate -->
**For intermediate developers:** Discuss cost scaling, database hosting (separate vs bundled), preview environments, and CI/CD integration.

<!-- senior -->
**For senior developers:** Discuss multi-region, edge vs origin, infrastructure-as-code (SST, Pulumi), and when to move from PaaS to IaaS. Reference the cost calculator in the hosting comparison doc.

## Full-stack recommendation mode

When a developer asks "what stack should I use" or "pick my tech stack," combine all decision trees:

1. Start with frontend framework (drives many downstream choices)
2. API strategy follows from framework choice
3. Database is usually Postgres unless signals say otherwise
4. Auth follows from framework + audience
5. Hosting follows from framework + scale

Present the full recommendation as a cohesive stack, not isolated decisions.

### Example stacks

**Solo SaaS, <1K users:**
Next.js + tRPC + Postgres (via Supabase) + Clerk + Vercel

**B2B SaaS, enterprise:**
Next.js + REST/OpenAPI + Postgres (via Neon or RDS) + Auth0 + AWS via SST

**Content platform:**
Astro + REST API + Postgres + Auth.js + Cloudflare Pages

**Real-time app:**
SvelteKit + tRPC + Postgres + Supabase Auth + Fly.io

## Checklist Items (for `/launch-checklist architecture`)

When invoked via `/launch-checklist architecture`, present these items as a checklist with status from `shipwise-state.json`. Cross-reference `project.stack` fields to determine completion.

| # | Item | Check | P0/P1/P2 | Time Estimate |
|---|------|-------|----------|---------------|
| 1 | Frontend framework selected | `project.stack.frontend` is not null | P0 | 30 min |
| 2 | Backend / API strategy decided | `project.stack.api_style` is not null | P0 | 30 min |
| 3 | Database selected | `project.stack.database` is not null | P0 | 20 min |
| 4 | ORM selected | `project.stack.orm` is not null | P1 | 15 min |
| 5 | Auth provider chosen | `project.stack.auth` is not null | P0 | 30 min |
| 6 | Hosting platform chosen | `project.stack.hosting` is not null | P1 | 20 min |
| 7 | Full stack documented in state | All non-null fields in `project.stack` | P1 | 5 min |

<!-- beginner -->
**How to read this checklist:** Each row is a decision you need to make before building. P0 items are decisions that block everything else (you can't write API code without picking an API style). P1 items can wait a bit but should be decided before your first deploy. If an item shows a checkmark, Shipwise already knows your choice from a previous conversation.

<!-- intermediate -->
For each unchecked item, use the decision matrices above or ask "help me choose my [item]" to walk through the trade-offs. Decisions are saved to `shipwise-state.json` automatically.

<!-- senior -->
Unchecked items indicate `null` in `project.stack`. Fill via conversation or edit `.claude/shipwise-state.json` directly.

---

## Companion tools

These community skills complement tech-architecture decisions:

- **`alirezarezvani/claude-skills` → `senior-architect`** — Deep architecture review, system design patterns, scalability analysis. Use after initial stack selection for architecture validation.
- **`levnikolaevich/claude-code-skills` → architecture audit** — Automated codebase architecture audit. Use to validate that implementation matches chosen architecture patterns.

## After decisions are made — MANDATORY state update

Once the developer confirms their stack choices, you MUST update `.claude/shipwise-state.json` before doing anything else. This is not optional — downstream skills (fullstack-development, security-compliance, billing-payments) read this file to personalize their output.

### State update procedure

1. Read the current `.claude/shipwise-state.json`
2. Update the `project.stack` object with confirmed selections:
   ```json
   {
     "project": {
       "stack": {
         "frontend": "nextjs",       // or "nuxt", "sveltekit", "astro", "remix", etc.
         "backend": "nextjs",         // or "express", "fastify", "hono", etc.
         "database": "postgres",      // or "mongodb", "sqlite", "supabase", etc.
         "orm": "prisma",             // or "drizzle", "typeorm", null
         "hosting": "vercel",         // or "railway", "fly", "aws", "cloudflare", etc.
         "auth": "clerk",             // or "auth0", "nextauth", "supabase", "lucia", etc.
         "api_style": "trpc"          // or "rest", "graphql", "grpc"
       }
     }
   }
   ```
3. Set `updated_at` to the current ISO timestamp
4. Only update fields that were decided — leave others as-is (null if not yet chosen)

### After state is written

Output this confirmation message verbatim (replacing bracketed values):

```
Stack saved: [framework] + [database] + [orm] + [auth] → [hosting].
All future Shipwise guidance will be tailored to this stack.

Ready to build? I can help with:
- "Set up my database schema" → schema design with [orm] templates
- "Build API endpoints" → [api_style] patterns for [framework]
- "/launch-checklist architecture" → verify all stack decisions are locked in
```

This message serves as a natural handoff to skill 05 (fullstack-development) or skill 06 (platform-infrastructure) based on what the developer asks next.
