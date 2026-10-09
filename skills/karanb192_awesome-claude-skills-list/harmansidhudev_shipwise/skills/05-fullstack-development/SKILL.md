---
name: fullstack-development
description: "Merged frontend + backend development skill (G12 consolidation). Covers component architecture, state management, API design, database patterns, migrations, error handling, caching, and responsive design. Adapts output to beginner/intermediate/senior."
triggers:
  - "React"
  - "Vue"
  - "Svelte"
  - "Next.js"
  - "Nuxt"
  - "SvelteKit"
  - "Remix"
  - "React component"
  - "UI component"
  - "Vue component"
  - "Svelte component"
  - "data grid"
  - "table component"
  - "API route"
  - "database schema"
  - "migration"
  - "frontend development"
  - "backend"
  - "fullstack development"
  - "state management"
  - "form handling"
  - "multi-step form"
  - "API design"
  - "caching"
  - "error handling"
  - "dashboard"
  - "dashboard layout"
  - "KPI card"
  - "bento grid"
  - "date range selector"
  - "widget"
---

# Fullstack Development

You handle both frontend and backend development tasks. This is a merged skill covering component architecture, state management, API design, database patterns, migrations, error handling, caching, and responsive design.

## When this skill triggers

This skill activates when a developer asks about building UI components, setting up API routes, designing database schemas, managing state, handling forms, implementing caching, or any other frontend/backend development topic.

## Read project context first

Before responding, check `.claude/shipwise-state.json` for:
- `project.stack` — framework, database, ORM, hosting
- `experience_level` — beginner, intermediate, senior
- `expected_scale` — user count bracket

Tailor code examples to the detected stack (e.g., Prisma if ORM is prisma, Next.js App Router `route.ts` if framework is nextjs). If no state file exists, ask what framework and database they're using before generating schema or API code.

### Persist stack context discovered in conversation

If the developer mentions their stack in conversation (e.g., "I'm using Next.js with Prisma and Postgres") and `.claude/shipwise-state.json` exists but `project.stack` fields are null, update the state file with the discovered values before responding. Use the same format as skill 04's state update procedure. This ensures downstream skills benefit from context gathered in any skill.

---

## Frontend Coverage

### Project structure — feature-based

Organize code by feature, not by file type. Each feature is a self-contained folder.

```
src/
  features/
    auth/
      components/
      hooks/
      api/
      utils/
      types.ts
      index.ts
    dashboard/
      components/
      hooks/
      api/
      utils/
      types.ts
      index.ts
  shared/
    components/    # Reusable atoms/molecules
    hooks/
    utils/
    types/
  app/             # App shell, routing, providers
  styles/          # Global styles, tokens
```

<!-- beginner -->
**Why feature-based?** When all components live in one folder and all hooks in another, a single feature's code is scattered across the entire tree. Feature folders keep related code together so you can find everything about "auth" in one place.

<!-- intermediate -->
Feature folders reduce cross-cutting imports. Each feature exposes a public API via `index.ts` — other features import from the barrel, never reach into internals.

<!-- senior -->
Feature-based. Barrel exports. No cross-feature internal imports. Enforce with ESLint `boundaries` plugin.

### Component architecture — atomic design

Reference: `references/component-architecture.md`

Use atomic design to categorize components:

| Level | Examples | Rules |
|-------|----------|-------|
| **Atoms** | Button, Input, Badge, Avatar | No business logic. Accept props + render. |
| **Molecules** | SearchBar, FormField, UserCard | Compose 2-3 atoms. Minimal local state. |
| **Organisms** | Header, InvoiceTable, Sidebar | Compose molecules. May connect to state. |
| **Templates** | DashboardLayout, AuthLayout | Structural only. No data fetching. |
| **Pages** | DashboardPage, SettingsPage | Data fetching + orchestration. Wire organisms to data. |

Use compound components for complex UI that shares implicit state (Tabs, Accordion, Select).

### Design token implementation

Define tokens in a central file. Consume via CSS custom properties or your framework's theme system.

```ts
// tokens.ts
export const tokens = {
  color: {
    primary: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' },
    neutral: { 50: '#f9fafb', 500: '#6b7280', 900: '#111827' },
    error: { 500: '#ef4444' },
    success: { 500: '#22c55e' },
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
  radius: { sm: '0.25rem', md: '0.5rem', lg: '1rem', full: '9999px' },
  font: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
} as const;
```

### State management decision tree

Reference: `references/state-management-guide.md`

Pick the simplest tool that solves the problem:

```
Is the state used by only one component?
  → YES: useState / useReducer
  → NO: Is it shared by a parent and 1-2 children?
    → YES: Lift state up + props
    → NO: Is it server/async data?
      → YES: TanStack Query (React Query)
      → NO: Is it used across 3-5 components in one subtree?
        → YES: React Context
        → NO: Is it global app state?
          → YES, simple: Zustand
          → YES, complex with middleware needs: Redux Toolkit
```

### Form handling — React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});
type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const onSubmit = (data: FormData) => { /* call API */ };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <button type="submit">Send</button>
    </form>
  );
}
```

### Performance budgets

| Metric | Target | Measurement |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Lighthouse / Web Vitals |
| INP (Interaction to Next Paint) | < 200ms | Web Vitals |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse / Web Vitals |
| JS bundle (gzipped) | < 200KB | `bundlesize` or build output |
| First Load JS | < 100KB | Next.js build analyzer |
| Image formats | WebP/AVIF | `next/image` or `sharp` |

<!-- beginner -->
**What do these mean?** LCP measures how fast the main content appears. INP measures how quickly the page responds when you click or type. CLS measures how much the layout jumps around while loading. Keeping JS small means the browser downloads less code before your page works.

<!-- intermediate -->
Enforce budgets in CI with `bundlesize` or `size-limit`. Use `@next/bundle-analyzer` to find heavy imports. Lazy-load routes and heavy components with `React.lazy` + `Suspense`.

<!-- senior -->
Set budgets in CI. Use `React.lazy`, dynamic imports, tree-shaking. Monitor with RUM (Real User Monitoring) via Vercel Analytics or `web-vitals` library. Track P75 not just median.

---

## Backend Coverage

### API design patterns

Reference: `references/api-design-patterns.md`

**RESTful conventions:**
- `GET /api/v1/resources` — list (with pagination + filtering)
- `GET /api/v1/resources/:id` — single item
- `POST /api/v1/resources` — create
- `PATCH /api/v1/resources/:id` — partial update
- `DELETE /api/v1/resources/:id` — soft delete

**Pagination:** Cursor-based for feeds/timelines, offset-based for admin tables.

**Filtering:** Query params: `?status=active&sort=-createdAt&limit=20&cursor=abc123`

**Versioning:** URL path (`/api/v1/`) for major versions. Use header-based only if you need fine-grained control.

**Rate limiting:** Apply per-endpoint. Return `429 Too Many Requests` with `Retry-After` header. Use sliding window algorithm.

### Database schema conventions

Reference: `references/database-migration-guide.md`

| Convention | Rule |
|-----------|------|
| Table names | `snake_case`, plural (`users`, `invoice_items`) |
| Primary keys | `id` column, UUID v7 or CUID2 |
| Timestamps | `created_at`, `updated_at` on every table (auto-managed) |
| Soft deletes | `deleted_at` nullable timestamp (never hard-delete user data) |
| Foreign keys | `<singular_table>_id` (e.g., `user_id`, `invoice_id`) |
| Indexes | Every foreign key. Every column in `WHERE` clauses. Composite indexes for multi-column queries. |
| Enums | Use string enums or a lookup table, not database-level enums (hard to migrate) |
| Booleans | `is_` prefix (`is_active`, `is_verified`) |

<!-- beginner -->
**Why these conventions matter:** When your database grows, consistency saves you from confusion. `snake_case` table names match SQL standards so your queries read naturally. UUIDs as primary keys prevent users from guessing other users' IDs (sequential IDs like 1, 2, 3 are easy to enumerate). Timestamps on every table let you debug issues ("when was this record last changed?"). Soft deletes (`deleted_at`) mean you can recover accidentally deleted data — never permanently delete user data. See `references/database-migration-guide.md` for a complete Prisma schema you can copy-paste.

<!-- intermediate -->
Follow these conventions from day one. Changing them later requires migrations across every table. The reference doc has copy-paste Prisma and Drizzle templates that implement all conventions.

<!-- senior -->
Conventions table above. Reference: `references/database-migration-guide.md`.

### Migration strategy

Reference: `references/database-migration-guide.md`

- **Version-controlled:** Every migration is a file in source control.
- **Reversible:** Every `up` has a corresponding `down`. Test rollbacks.
- **Zero-downtime:** Use expand-contract pattern. Never rename or drop columns in a single step.
  1. Add new column (expand)
  2. Backfill data + deploy code that writes to both
  3. Switch reads to new column
  4. Drop old column (contract) in a later migration

### Error handling

Reference: `references/error-handling-patterns.md`

Use structured error types with error codes. Implement a global error handler that catches all unhandled errors and returns consistent JSON responses.

```ts
// AppError base class
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

Error categories: `VALIDATION_ERROR`, `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONFLICT`, `RATE_LIMITED`, `INTERNAL_ERROR`.

### Caching

Reference: `references/caching-strategy.md`

**Layers:**
1. **HTTP cache headers** — `Cache-Control`, `ETag`, `Last-Modified` for static + API responses
2. **CDN** — Cache static assets and full pages at edge (Vercel, CloudFront, Cloudflare)
3. **Application cache** — Redis for session data, computed values, rate limit counters
4. **Database query cache** — Connection pooling + prepared statements. Use materialized views for expensive aggregations.

### Background jobs

Use BullMQ (Node.js) or Celery (Python) for:
- Email sending
- PDF generation
- Webhook delivery
- Data exports
- Scheduled cleanup tasks

<!-- beginner -->
**What is a background job?** Instead of making the user wait for slow tasks (like sending an email), you put the task in a queue. A separate worker process picks it up and runs it in the background. The user sees an instant response.

<!-- intermediate -->
Use BullMQ with Redis. Set up dead-letter queues for failed jobs. Add exponential backoff for retries. Monitor with BullBoard or Arena.

<!-- senior -->
BullMQ/Celery. DLQ. Exponential backoff with jitter. Idempotency keys on every job. Monitor queue depth and processing latency. Alert on DLQ growth.

### Webhook design

- Sign payloads with HMAC-SHA256 using a shared secret
- Include `X-Webhook-Signature` and `X-Webhook-Timestamp` headers
- Retry with exponential backoff (1s, 5s, 30s, 5m, 30m)
- Log all delivery attempts
- Provide a "test webhook" endpoint in your dashboard

### File handling

- Store files in S3-compatible object storage (AWS S3, Cloudflare R2, MinIO)
- Generate signed URLs for uploads (presigned POST) and downloads (presigned GET)
- Never pass files through your API server — client uploads directly to S3
- Set content-type validation and max file size on the presigned URL
- Store metadata (filename, size, content-type, upload user) in your database

### Email

Use Resend or Postmark. Never send from your own SMTP server.

- Set up SPF, DKIM, and DMARC DNS records
- Use templates for transactional email (welcome, password reset, invoice)
- Track delivery status via webhooks from your email provider
- Implement unsubscribe headers for marketing email (`List-Unsubscribe`)

---

## Companion tools

| Tool | Purpose |
|------|---------|
| `wshobson/claude-code-workflows` → `backend-development` | Scaffolds API routes, database schemas, and backend patterns |
| `anthropics/claude-code` → `frontend-design` | Component generation, styling, accessibility checks |

## References

| Document | Use when |
|----------|----------|
| `references/component-architecture.md` | Building new UI components or refactoring existing ones |
| `references/state-management-guide.md` | Choosing how to manage state or setting up a store |
| `references/api-design-patterns.md` | Designing or reviewing API endpoints |
| `references/database-migration-guide.md` | Creating or modifying database tables |
| `references/error-handling-patterns.md` | Setting up error handling or adding new error types |
| `references/caching-strategy.md` | Adding caching to an endpoint or page |
| `references/responsive-design-checklist.md` | Building responsive layouts or reviewing mobile UX |
