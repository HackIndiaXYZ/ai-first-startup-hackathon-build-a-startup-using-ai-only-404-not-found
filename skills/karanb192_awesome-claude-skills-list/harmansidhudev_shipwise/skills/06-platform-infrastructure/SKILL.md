---
name: platform-infrastructure
description: "CI/CD pipelines, containerization, Infrastructure as Code, environment management, secrets management, DNS/SSL, and CDN configuration. Adapts output to beginner/intermediate/senior."
triggers:
  - "CI/CD"
  - "GitHub Actions"
  - "Docker"
  - "Dockerfile"
  - "Docker Compose"
  - "Terraform"
  - "infrastructure as code"
  - "deploy pipeline"
  - "deployment"
  - "secrets management"
  - "environment variables"
  - "env vars"
  - "DNS"
  - "SSL"
  - "CDN"
  - "Cloudflare"
  - "container"
  - "staging"
  - "production"
  - "preview environment"
  - "IaC"
---

# Platform & Infrastructure

You handle CI/CD pipelines, containerization, IaC, environment management, secrets, DNS/SSL, and CDN configuration. This skill covers everything between writing code and running it reliably in production.

## When this skill triggers

This skill activates when a developer asks about setting up deployment pipelines, writing Dockerfiles, configuring Terraform, managing environment variables across stages, handling secrets securely, setting up custom domains with SSL, or configuring CDN caching.

---

## CI/CD Architecture

Reference: `references/cicd-pipeline-templates/`

### Recommended stack: GitHub Actions

GitHub Actions is the default recommendation for CI/CD. It integrates natively with GitHub, has a generous free tier, and has the largest ecosystem of reusable actions.

### Pipeline stages

Every pipeline should follow this order:

```
checkout → install → lint → typecheck → test → build → deploy
```

| Stage | Tool | Fails build? |
|-------|------|-------------|
| Lint | ESLint / Ruff | Yes |
| Typecheck | `tsc --noEmit` / mypy | Yes |
| Test | Vitest / pytest | Yes |
| Build | `next build` / Docker build | Yes |
| Deploy | Vercel / AWS / Railway | Yes (on prod) |

### Branch strategy

```
main (production) ← PR merge only, protected
  ├── staging ← auto-deploy on merge to staging
  └── feature/* ← preview deploys (optional)
```

**Branch protection rules for `main`:**
- Require PR reviews (1 minimum)
- Require status checks to pass (lint, typecheck, test, build)
- Require branches to be up to date before merging
- No direct pushes

<!-- beginner -->
**What is CI/CD?** CI (Continuous Integration) automatically runs your tests every time you push code. CD (Continuous Deployment) automatically deploys your code after tests pass. Together, they prevent you from shipping broken code and eliminate manual deployment steps.
> Time: ~30 min to set up with GitHub Actions
> Template: See `references/cicd-pipeline-templates/`

<!-- intermediate -->
**CI/CD pipeline (GitHub Actions)** — lint, typecheck, test, build, deploy. Branch protection on main. Use `concurrency` groups to cancel stale runs. Cache `node_modules` and `.next/cache` between runs.
> ~30 min

<!-- senior -->
**CI/CD** — GHA: lint/type/test/build/deploy gates. Concurrency groups. Dependency caching. Matrix builds if multi-platform. OIDC for cloud auth (no long-lived secrets). Reusable workflows for shared org patterns.

### Deploy gates

Before deploying to production, require:
- All CI checks green
- At least one PR approval
- No `FIXME` or `TODO: BEFORE_DEPLOY` markers in diff
- Database migrations reviewed (if any)
- Bundle size within budget (fail if > 10% increase)

---

## Container Strategy

### Dockerfile best practices

```dockerfile
# Multi-stage build for Node.js/Next.js
# [CUSTOMIZE] Change node version and package manager as needed

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && pnpm build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

COPY --from=builder /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static

USER appuser
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

**Key rules:**
- Always use multi-stage builds (smaller images, no dev deps in prod)
- Pin base image versions (`node:20-alpine`, not `node:latest`)
- Run as non-root user
- Use `.dockerignore` to exclude `node_modules`, `.git`, `.env*`
- Order `COPY` statements from least-changed to most-changed for layer caching

### Docker Compose for local development

```yaml
# docker-compose.yml
# [CUSTOMIZE] Service names, ports, and database credentials
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: deps  # Stop at deps stage for dev
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/app_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

<!-- beginner -->
**What is Docker?** Docker packages your app and all its dependencies into a "container" that runs the same way everywhere. No more "it works on my machine" problems. Docker Compose lets you run your app alongside its database and cache with a single command: `docker compose up`.

<!-- intermediate -->
**Containerization** — Multi-stage Dockerfile, Docker Compose for local dev with Postgres + Redis. Use `.dockerignore`, non-root user, layer caching optimization.

<!-- senior -->
**Containers** — Multi-stage, non-root, pinned versions. Compose for local parity. Distroless base for prod if security-critical. Image scanning in CI with Trivy.

---

## Infrastructure as Code (IaC)

Reference: `references/iac-guide.md`

### Recommended stack: Terraform

Terraform is the default recommendation for IaC. It supports all major cloud providers, has a massive module ecosystem, and uses declarative HCL syntax.

### Module structure

```
infra/
  modules/
    networking/       # VPC, subnets, security groups
    database/         # RDS, connection pooling
    compute/          # ECS/Fargate, Lambda, EC2
    storage/          # S3, CloudFront
    dns/              # Route53, Cloudflare
    monitoring/       # CloudWatch, alerts
  environments/
    dev/
      main.tf         # Compose modules with dev settings
      terraform.tfvars
    staging/
      main.tf
      terraform.tfvars
    prod/
      main.tf
      terraform.tfvars
  backend.tf          # Remote state config
  variables.tf        # Shared variable definitions
```

### Remote state

Always use remote state with locking. Never commit `.tfstate` files.

```hcl
# backend.tf
# [CUSTOMIZE] Bucket name, region, DynamoDB table
terraform {
  backend "s3" {
    bucket         = "myapp-terraform-state"
    key            = "env/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

### Plan-review-apply workflow

```
terraform init → terraform plan → human review → terraform apply
```

Never run `terraform apply` without reviewing the plan. In CI, post the plan output as a PR comment for team review before applying.

<!-- beginner -->
**What is Infrastructure as Code?** Instead of clicking through AWS/GCP consoles to create servers, databases, and networks, you write config files that describe what you need. Terraform reads these files and creates everything for you. If you need to change something, you edit the file and Terraform figures out the minimal changes to apply.
> Time: ~1 hour for initial setup
> Reference: `references/iac-guide.md`

<!-- intermediate -->
**IaC (Terraform)** — Module-based structure. Remote state with S3 + DynamoDB locking. Plan-review-apply workflow. Per-environment variable files. Pin provider and module versions.
> ~1 hour

<!-- senior -->
**IaC** — Terraform with module composition. Remote state + locking. Workspaces or per-env directories. OIDC auth from CI (no static credentials). Drift detection on schedule. Import existing resources before writing new configs.

---

## Environment Management

Reference: `references/environment-management.md`

### Environment tiers

| Aspect | Development | Staging | Production |
|--------|------------|---------|------------|
| **Data** | Seed data / fixtures | Anonymized prod snapshot | Real user data |
| **Infra size** | Minimal (free tier) | Matches prod architecture | Right-sized for load |
| **Deploys** | On push to feature branch | On merge to `staging` | On merge to `main` |
| **Auth providers** | Test/sandbox mode | Test/sandbox mode | Live credentials |
| **Error reporting** | Console + local Sentry | Sentry (staging project) | Sentry (prod project) |
| **Feature flags** | All enabled | Selectively enabled | Controlled rollout |

### Environment variables

Use `.env.example` as the source of truth for required variables. Never commit `.env` files with real values.

```bash
# .env.example — copy to .env and fill in values
# [CUSTOMIZE] All values below

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_dev

# Auth
AUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# External services
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...

# Storage
S3_BUCKET=my-app-dev
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

### Preview environments

Deploy every PR to a temporary preview URL for testing and review. Vercel and Netlify do this automatically. For custom setups, use Terraform workspaces or namespace by branch name.

<!-- beginner -->
**What are environments?** You typically run your app in three places: development (your laptop), staging (a test copy of production), and production (what real users see). Each has its own database, API keys, and config. Environment variables are how you tell your app which settings to use.
> Reference: `references/environment-management.md`

<!-- intermediate -->
**Environment management** — Dev/staging/prod parity. `.env.example` as source of truth. Preview environments per PR. Validate env vars at startup with Zod/`t3-env`. Never commit `.env` files.
> Reference: `references/environment-management.md`

<!-- senior -->
**Environments** — Parity across tiers. Schema-validated env vars (`t3-env` or `envalid`). Preview deploys per PR. Feature flags for staged rollout. Anonymized prod data for staging. Automated teardown of preview envs.

---

## Secrets Management

Reference: `references/secrets-management.md`

### Principles

1. **Never commit secrets** to version control (use pre-commit scanning)
2. **Rotate regularly** — 90 days for API keys, 30 days for database passwords
3. **Least privilege** — each service gets only the secrets it needs
4. **Audit logging** — track who accessed what secret and when
5. **Encrypt at rest** — all secrets stored encrypted, decrypted only at runtime

### Secret storage hierarchy

```
Where should this secret live?
├── CI/CD pipeline secret (GitHub Actions, etc.)
│   → GitHub Secrets (encrypted, injected as env vars)
│
├── Application runtime secret
│   → Cloud provider secret manager (AWS SSM / Secrets Manager, Vercel env vars)
│
├── Infrastructure secret (Terraform)
│   → Terraform variables + cloud secret manager (never in .tfvars)
│
└── Local development secret
    → .env file (git-ignored, never committed)
```

### Pre-commit scanning with gitleaks

```yaml
# .gitleaks.toml — place in repo root
# [CUSTOMIZE] Add paths to allowlist if needed
title = "gitleaks config"

[allowlist]
  paths = [
    '''\.env\.example''',
    '''\.gitleaks\.toml''',
  ]
```

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

<!-- beginner -->
**What is secrets management?** Secrets are passwords, API keys, and tokens that your app needs to connect to databases, payment providers, and other services. If they leak (e.g., pushed to GitHub), attackers can access your data. Secrets management means storing them securely and scanning your code to make sure you never accidentally commit them.
> Time: ~15 min for pre-commit scanning setup
> Reference: `references/secrets-management.md`

<!-- intermediate -->
**Secrets management** — GitHub Secrets for CI, cloud secret manager for runtime, `.env` for local. Pre-commit scanning with gitleaks. 90-day rotation schedule. No secrets in Terraform state (use data sources).
> ~15 min for scanning, ~1 hour for full vault setup

<!-- senior -->
**Secrets** — Vault-based (AWS SSM/Secrets Manager or HashiCorp Vault). Gitleaks in pre-commit + CI. Rotation automation. Audit logging. OIDC for CI/CD auth (no long-lived credentials). Secrets never in tfstate — use `data` sources.

---

## Domain, DNS & SSL

### Recommended stack: Cloudflare

Cloudflare provides DNS, SSL, CDN, and DDoS protection in one service. Free tier covers most needs.

### Subdomain plan

| Subdomain | Purpose |
|-----------|---------|
| `app.example.com` | Main application |
| `api.example.com` | API (if separate from app) |
| `staging.example.com` | Staging environment |
| `docs.example.com` | Documentation site |
| `status.example.com` | Status page (Betterstack, Instatus) |

### SSL/TLS configuration

- **Automated certificates:** Use Cloudflare (automatic) or Let's Encrypt (certbot with auto-renewal)
- **HSTS:** Enable with `max-age=31536000; includeSubDomains; preload`
- **TLS version:** Minimum TLS 1.2, prefer TLS 1.3
- **HTTP redirect:** Force all HTTP to HTTPS via 301 redirect

```
# Cloudflare SSL settings (via dashboard or API)
SSL mode: Full (Strict)
Minimum TLS version: 1.2
Always Use HTTPS: On
HSTS: max-age=31536000, includeSubDomains, preload
Automatic HTTPS Rewrites: On
```

<!-- beginner -->
**What is DNS and SSL?** DNS translates your domain name (like `myapp.com`) into the server IP address where your app runs. SSL encrypts the connection so data is private (the padlock icon in your browser). Cloudflare handles both for free and also protects your site from attacks.

<!-- intermediate -->
**DNS/SSL** — Cloudflare for DNS + SSL + CDN. Full (Strict) SSL mode. HSTS with preload. Subdomain per environment. Automated cert renewal.

<!-- senior -->
**DNS/SSL** — Cloudflare with Full (Strict). HSTS preloaded. CAA records restricting issuers. DNSSEC enabled. Subdomain plan per environment. Zero-downtime cert rotation.

---

## CDN Configuration

### Cache rules

| Content type | Cache TTL | Cache-Control header |
|-------------|-----------|---------------------|
| Static assets (JS, CSS, fonts) | 1 year | `public, max-age=31536000, immutable` |
| Images | 1 year | `public, max-age=31536000, immutable` |
| HTML pages (SSG) | 60s at edge | `public, s-maxage=60, stale-while-revalidate=300` |
| API responses (public) | 30s at edge | `public, s-maxage=30, stale-while-revalidate=60` |
| API responses (authenticated) | Never | `private, no-store` |

### Cache busting

Use content-hashed filenames for static assets. Frameworks like Next.js do this automatically (`_next/static/chunks/[hash].js`). Never manually version static assets with query strings.

### Purge on deploy

After deploying, purge CDN cache for HTML pages and API responses. Static assets with hashed filenames do not need purging.

```yaml
# In GitHub Actions deploy step:
# [CUSTOMIZE] Zone ID and API token
- name: Purge Cloudflare cache
  run: |
    curl -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CF_ZONE_ID }}/purge_cache" \
      -H "Authorization: Bearer ${{ secrets.CF_API_TOKEN }}" \
      -H "Content-Type: application/json" \
      --data '{"purge_everything": true}'
```

---

## Companion tools

| Tool | Purpose |
|------|---------|
| `antonbabenko/terraform-skill` | Terraform module authoring, state management, best practices |
| `alirezarezvani/claude-skills` -> `ci-cd-builder` | Scaffold CI/CD pipelines for various platforms |
| `alirezarezvani/claude-skills` -> `senior-devops-engineer` | Advanced infrastructure design and troubleshooting |
| `zxkane/aws-skills` | AWS-specific infrastructure patterns (ECS, Lambda, RDS, CloudFront) |

## References

| Document | Use when |
|----------|----------|
| `references/iac-guide.md` | Setting up Terraform, writing modules, managing remote state |
| `references/environment-management.md` | Configuring dev/staging/prod, managing env vars, preview environments |
| `references/secrets-management.md` | Setting up secret storage, rotation schedules, pre-commit scanning |
| `references/cicd-pipeline-templates/nextjs-postgres-vercel.yml` | Deploying Next.js + Postgres to Vercel |
| `references/cicd-pipeline-templates/nextjs-postgres-aws.yml` | Deploying Next.js + Postgres to AWS (SST/CDK) |
| `references/cicd-pipeline-templates/python-fastapi-railway.yml` | Deploying Python FastAPI to Railway |
