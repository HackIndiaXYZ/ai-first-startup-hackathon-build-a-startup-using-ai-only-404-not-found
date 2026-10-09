---
name: quality-assurance
description: "Testing strategy, test pyramid, unit/integration/E2E testing, load testing, cross-browser testing, and code quality tooling."
triggers:
  - "testing"
  - "unit test"
  - "integration test"
  - "E2E test"
  - "end-to-end test"
  - "Playwright"
  - "Vitest"
  - "load testing"
  - "k6"
  - "code quality"
  - "test coverage"
  - "ESLint"
  - "Prettier"
  - "cross-browser"
  - "flaky test"
  - "test pyramid"
---

# Quality Assurance

You handle all testing strategy, test implementation, load testing, cross-browser validation, and code quality tooling. This skill covers the full testing pyramid from unit tests through production load testing.

## When this skill triggers

This skill activates when a developer asks about writing tests, setting up test infrastructure, improving code quality tooling, debugging flaky tests, load testing, or cross-browser compatibility.

---

## Testing Pyramid

Reference: `references/testing-pyramid.md`

Follow the testing pyramid to allocate effort correctly:

| Layer | Share | Speed | Tools | What to test |
|-------|-------|-------|-------|-------------|
| **Unit** | 70% | < 10ms each | Vitest | Pure functions, calculations, permissions, data transforms |
| **Integration** | 20% | < 2s each | Vitest + test DB | API routes, auth flows, DB queries, service interactions |
| **E2E** | 10% | < 30s each | Playwright | 4 critical user paths only |

<!-- beginner -->
**Why a pyramid?** Unit tests are fast and cheap. E2E tests are slow and brittle. If you write mostly E2E tests, your test suite takes 20 minutes and breaks constantly. The pyramid says: test most things at the unit level, some things with real integrations, and only the most critical user flows end-to-end.

<!-- intermediate -->
The pyramid is a cost model. Unit tests give the fastest feedback per dollar of maintenance. Integration tests catch wiring bugs that unit tests miss. E2E tests validate the 4 paths that would cost you customers if broken.

<!-- senior -->
70/20/10 split. Unit for logic, integration for wiring + DB, E2E for critical paths only. Track flake rate — kill any E2E test above 2%.

---

## Unit Tests

Reference: `references/testing-pyramid.md`

### Recommended stack

**Vitest** — drop-in replacement for Jest with native ESM, TypeScript, and Vite integration. Faster cold starts, native code coverage via v8.

### What to unit test

Focus 80% of unit test coverage on **business logic**, not UI:

| Test this | Skip this |
|-----------|-----------|
| Payment calculations | React component renders |
| Permission checks | CSS class assertions |
| Data transformations | Snapshot tests (fragile) |
| Validation logic | Third-party library wrappers |
| State machine transitions | Simple getters/setters |
| Date/currency formatting | Framework boilerplate |

### Copy-paste Vitest config

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['src/**/*.e2e.ts', 'node_modules'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/index.ts',
      ],
      thresholds: {
        // [CUSTOMIZE] Adjust thresholds per your project maturity
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Example unit test

```ts
// src/features/billing/utils/calculate-invoice.test.ts
import { describe, it, expect } from 'vitest';
import { calculateInvoiceTotal } from './calculate-invoice';

describe('calculateInvoiceTotal', () => {
  it('sums line items correctly', () => {
    const items = [
      { quantity: 2, unitPrice: 10.0 },
      { quantity: 1, unitPrice: 25.5 },
    ];
    expect(calculateInvoiceTotal(items)).toBe(45.5);
  });

  it('applies percentage discount', () => {
    const items = [{ quantity: 1, unitPrice: 100 }];
    expect(calculateInvoiceTotal(items, { discountPercent: 20 })).toBe(80);
  });

  it('returns 0 for empty items', () => {
    expect(calculateInvoiceTotal([])).toBe(0);
  });

  it('rounds to 2 decimal places', () => {
    const items = [{ quantity: 3, unitPrice: 0.1 }];
    expect(calculateInvoiceTotal(items)).toBe(0.3);
  });
});
```

<!-- beginner -->
**Write unit tests for your business logic** -- Tests are code that automatically checks if your code works correctly. Focus on the important stuff: payment calculations, permission checks, data transformations. Don't test UI components (those break when you change a CSS class). Aim for 80% coverage on business logic files.
> Time: ~15 min per function
> Config template: See `references/testing-pyramid.md`

<!-- intermediate -->
**Unit tests (Vitest, 80% business logic coverage)** -- Focus on pure functions, calculations, permissions, and data transforms. Skip UI component tests. Use `vi.mock()` sparingly -- prefer dependency injection. Run coverage in CI and fail the build if it drops below threshold.
> ~15 min per function

<!-- senior -->
**Unit tests** -- 80% business logic coverage, Vitest, v8 coverage. DI over mocks. Fail CI on threshold drop.

---

## Integration Tests

Reference: `references/testing-pyramid.md`

### What integration tests cover

- API route handlers with real request/response cycles
- Database queries against a real test database
- Authentication and authorization flows end-to-end
- Service-to-service interactions
- Webhook handlers with realistic payloads

### Test database strategy

Use a real database instance (not mocks) with fixtures:

```ts
// src/test/helpers/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// [CUSTOMIZE] Replace with your ORM and connection string
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL
  ?? 'postgresql://test:test@localhost:5433/testdb';

let pool: Pool;

export async function setupTestDb() {
  pool = new Pool({ connectionString: TEST_DATABASE_URL });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: './drizzle' });
  return db;
}

export async function teardownTestDb() {
  await pool.end();
}

export async function cleanTables(db: ReturnType<typeof drizzle>) {
  // [CUSTOMIZE] List your tables in dependency order
  await db.execute(`TRUNCATE users, invoices, payments CASCADE`);
}
```

### Example integration test

```ts
// src/features/auth/api/login.integration.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupTestDb, teardownTestDb, cleanTables } from '@/test/helpers/db';
import { createTestUser } from '@/test/fixtures/users';
import { app } from '@/app';

describe('POST /api/v1/auth/login', () => {
  let db: Awaited<ReturnType<typeof setupTestDb>>;

  beforeAll(async () => { db = await setupTestDb(); });
  afterAll(async () => { await teardownTestDb(); });
  beforeEach(async () => { await cleanTables(db); });

  it('returns JWT for valid credentials', async () => {
    await createTestUser(db, {
      email: 'test@example.com',
      password: 'SecureP@ss1',
    });

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecureP@ss1',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('token');
    expect(body.token).toMatch(/^eyJ/); // JWT prefix
  });

  it('returns 401 for wrong password', async () => {
    await createTestUser(db, {
      email: 'test@example.com',
      password: 'SecureP@ss1',
    });

    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'WrongPassword',
      }),
    });

    expect(res.status).toBe(401);
  });

  it('returns 400 for missing email', async () => {
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'SecureP@ss1' }),
    });

    expect(res.status).toBe(400);
  });
});
```

<!-- beginner -->
**Write integration tests for your API routes** -- Unlike unit tests that test one function, integration tests test how multiple parts of your app work together: your API receives a request, talks to a real database, and returns a response. Use a separate test database so you don't mess up your real data.
> Time: ~30 min per API route
> Template: See `references/testing-pyramid.md`

<!-- intermediate -->
**Integration tests (real DB, auth flows)** -- Test API routes against a real Postgres instance. Use fixtures for seed data. TRUNCATE between tests for isolation. Cover auth flows (login, signup, password reset) and critical CRUD paths.
> ~30 min per route

<!-- senior -->
**Integration tests** -- Real DB, fixtures, TRUNCATE isolation. Auth flows + critical CRUD. Run in CI with docker-compose Postgres.

---

## E2E Tests

Reference: `references/playwright-setup-template/`

### Recommended stack

**Playwright** -- cross-browser support, auto-waiting, trace viewer for debugging, parallel execution.

### The 4 critical paths

Only write E2E tests for paths where a bug costs you customers:

1. **Sign up / Onboarding** -- New user creates account and reaches dashboard
2. **Core value action** -- The #1 thing users do (e.g., create an invoice, send a message)
3. **Payment flow** -- Checkout, subscription upgrade, billing update
4. **Authentication** -- Login, logout, password reset

Everything else gets tested at the unit or integration level.

### Page Object Model pattern

Keep selectors and page interactions in page objects, not in test files:

```ts
// e2e/pages/LoginPage.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### Flake rate

Target: **< 2% flake rate** across all E2E tests.

- Use Playwright's built-in auto-waiting (never use `sleep` or `waitForTimeout`)
- Use `getByRole`, `getByLabel`, `getByText` over CSS selectors
- Run in CI with retries: `retries: process.env.CI ? 2 : 0`
- Track flake rate over time. Delete any test that consistently exceeds 2%

<!-- beginner -->
**Write E2E tests for your 4 critical user paths** -- E2E (end-to-end) tests open a real browser and click through your app like a user would. Only test the 4 most important user flows (signup, core action, payment, login). More than that and you'll spend all your time fixing flaky tests.
> Time: ~1 hour per path
> Template: See `references/playwright-setup-template/`

<!-- intermediate -->
**E2E tests (Playwright, 4 critical paths, POM, <2% flake)** -- Test signup, core action, payment, and auth flows. Use Page Object Model. Use role-based locators. Auto-wait, never sleep. Track flake rate. Retries in CI only.
> ~1 hour per path

<!-- senior -->
**E2E tests** -- Playwright, 4 critical paths, POM pattern, <2% flake. Role-based locators. CI retries only.

---

## Load Testing

Reference: `references/k6-load-test-templates/`

### Recommended stack

**k6** -- scriptable in JavaScript, built for developer experience, integrates with Grafana for dashboards.

### Three scenarios

| Scenario | Purpose | Config |
|----------|---------|--------|
| **Smoke** | Verify endpoints work under minimal load | 1 VU, 1 min |
| **Spike** | Test sudden traffic bursts | 1 to 100 VUs in 10s, hold 30s |
| **Soak** | Find memory leaks and connection pool exhaustion | 50 VUs, 30 min |

### Thresholds

| Metric | Target |
|--------|--------|
| P50 response time | < 200ms |
| P95 response time | < 500ms |
| P99 response time | < 1500ms |
| Error rate | < 1% |
| Throughput | Varies by endpoint |

### When to run load tests

- Before launch: run all three scenarios against staging
- After significant backend changes: run smoke + spike
- Monthly: run soak test to catch gradual degradation

<!-- beginner -->
**Run load tests before launch** -- Load tests simulate many users hitting your app at once to find out when it breaks. You need three types: smoke (does it work at all?), spike (what happens with sudden traffic?), and soak (does it crash after running for a while?). Run these against your staging environment, never production.
> Time: ~30 min to set up, scripts run themselves
> Templates: See `references/k6-load-test-templates/`

<!-- intermediate -->
**Load tests (k6, smoke/spike/soak, P50/P95/P99)** -- Smoke for baseline, spike for burst capacity, soak for memory leaks. Set thresholds on P95 < 500ms and error rate < 1%. Run against staging. Pipe results to Grafana.
> ~30 min setup

<!-- senior -->
**Load tests** -- k6: smoke/spike/soak. P95 < 500ms, error < 1%. Run pre-launch and post-backend-changes. Grafana dashboards.

---

## Cross-Browser Testing

Reference: `references/cross-browser-checklist.md`

### Browser matrix

| Priority | Browser | Engine | Notes |
|----------|---------|--------|-------|
| P0 | Chrome (latest) | Blink | Primary dev browser |
| P0 | Safari (latest) | WebKit | iOS users, different rendering |
| P1 | Firefox (latest) | Gecko | Privacy-focused users |
| P1 | Edge (latest) | Blink | Enterprise users |
| P1 | iOS Safari | WebKit | Mobile — no Chrome engine on iOS |
| P2 | Chrome Android | Blink | Mobile — test touch interactions |

### Common cross-browser issues

- **Safari**: `gap` in flexbox (older versions), `date` input rendering, backdrop-filter
- **Firefox**: `scrollbar-gutter`, form element styling, `accent-color` support
- **iOS Safari**: 100vh includes address bar, safe-area-inset, input zoom on font-size < 16px
- **All mobile**: touch targets < 44px, hover states, viewport units

### Testing strategy

1. Playwright covers Chrome, Firefox, and WebKit in CI
2. Manual testing on real iOS Safari and Chrome Android for touch/viewport issues
3. Use `@supports` for progressive enhancement of newer CSS features
4. Use `browserslist` in your build config to set transpilation targets

<!-- beginner -->
**Test your app in Chrome, Safari, Firefox, and on mobile** -- Your app might look perfect in Chrome but broken in Safari. Different browsers render CSS differently, handle dates differently, and have different bugs. Test at minimum in Chrome + Safari desktop and iOS Safari mobile. The cross-browser checklist tells you exactly what to check.
> Time: ~1 hour per release
> Checklist: See `references/cross-browser-checklist.md`

<!-- intermediate -->
**Cross-browser (Chrome, Firefox, Safari, Edge + iOS Safari, Chrome Android)** -- Run Playwright against Chromium, Firefox, WebKit in CI. Manual test iOS Safari and Chrome Android. Watch for Safari flexbox gap, iOS 100vh, and mobile touch targets.
> ~1 hour per release

<!-- senior -->
**Cross-browser** -- Playwright CI: Chromium/Firefox/WebKit. Manual: iOS Safari + Chrome Android. `browserslist` config. `@supports` progressive enhancement.

---

## Code Quality

### Recommended stack

| Tool | Purpose | Config |
|------|---------|--------|
| **ESLint** | Linting, code standards | Flat config (`eslint.config.js`) |
| **Prettier** | Formatting | `.prettierrc` |
| **TypeScript** | Type safety | `strict: true` in `tsconfig.json` |
| **Husky** | Git hooks | Pre-commit, pre-push |
| **lint-staged** | Run linters on staged files only | `.lintstagedrc` |

### Setup commands

```bash
# Install all tools
npm install -D eslint prettier typescript husky lint-staged \
  @eslint/js typescript-eslint eslint-config-prettier \
  eslint-plugin-import-x

# Initialize Husky
npx husky init

# Pre-commit hook
echo "npx lint-staged" > .husky/pre-commit

# Pre-push hook
echo "npm run typecheck && npm run test" > .husky/pre-push
```

### Copy-paste configs

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

```json
// .lintstagedrc
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

```jsonc
// tsconfig.json (relevant strict options)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true
  }
}
```

```js
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // [CUSTOMIZE] Adjust rules per your team preferences
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.config.*'],
  },
);
```

<!-- beginner -->
**Set up code quality tooling (ESLint + Prettier + Husky)** -- These tools automatically catch bugs and format your code consistently. ESLint finds problems (unused variables, type errors). Prettier formats code so everyone's code looks the same. Husky runs both automatically before you commit, so bad code never makes it into your repo.
> Time: ~20 min
> Copy the configs above directly

<!-- intermediate -->
**Code quality (ESLint + Prettier + TypeScript strict + Husky + lint-staged)** -- Flat ESLint config with `strictTypeChecked`. Prettier for formatting. Husky pre-commit runs lint-staged (lint + format staged files only). Pre-push runs typecheck + tests. TypeScript `strict: true` with `noUncheckedIndexedAccess`.
> ~20 min

<!-- senior -->
**Code quality** -- ESLint flat config + `strictTypeChecked`, Prettier, Husky pre-commit (lint-staged), pre-push (typecheck + test). TS strict + `noUncheckedIndexedAccess`.

---

## Companion tools

| Tool | Purpose |
|------|---------|
| `anthropics/claude-code` -> `webapp-testing` | Generate test scaffolds and test data |
| `obra/superpowers` -> `test-driven-development` | TDD workflow guidance |

## References

| Document | Use when |
|----------|----------|
| `references/testing-pyramid.md` | Deciding what to test at each level, setting up Vitest |
| `references/cross-browser-checklist.md` | Checking browser compatibility before a release |
| `references/playwright-setup-template/` | Setting up Playwright E2E tests from scratch |
| `references/k6-load-test-templates/` | Running load tests before launch or after backend changes |
