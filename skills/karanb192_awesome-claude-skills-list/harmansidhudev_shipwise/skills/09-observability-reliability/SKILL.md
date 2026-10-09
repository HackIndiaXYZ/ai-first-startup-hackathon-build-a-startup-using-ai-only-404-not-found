---
name: observability-reliability
description: "Monitoring, error tracking, structured logging, alerting, health endpoints, backups, disaster recovery, status page, incident response, and auto-scaling."
triggers:
  - "monitoring"
  - "observability"
  - "Sentry"
  - "error tracking"
  - "logging"
  - "structured logging"
  - "alerting"
  - "health check"
  - "health endpoint"
  - "backup"
  - "disaster recovery"
  - "incident response"
  - "status page"
  - "uptime"
  - "APM"
  - "metrics"
  - "tracing"
  - "Datadog"
  - "Grafana"
  - "Better Uptime"
  - "auto-scaling"
  - "HPA"
  - "scale-to-zero"
  - "runbook"
  - "post-mortem"
  - "RTO"
  - "RPO"
  - "correlation ID"
---

# Observability & Reliability

> Phase 3: SHIP | Sprint 3

## Coverage

- Monitoring stack selection (Sentry for errors, Datadog/Grafana for APM, Better Uptime for synthetic)
- Sentry setup checklist (SDK, source maps, releases, user context, performance, alerts)
- Structured logging (JSON, correlation IDs, log levels, no PII)
- Alerting (P1-P4 severity, escalation, alert fatigue prevention)
- Health endpoints (/health/live, /health/ready, /health/detailed)
- Backup strategy (automated daily, PITR, tested restores monthly, off-site)
- Disaster recovery (RTO/RPO definitions, failover plan, runbooks, annual DR drill)
- Status page (Instatus/Statuspage.io, components, incident templates)
- Incident response (detect -> triage -> communicate -> mitigate -> resolve -> post-mortem)
- Auto-scaling (HPA, metrics-based, scale-to-zero)

---

## Checklist Items

### Monitoring Stack Selection

<!-- beginner -->
**Choose your monitoring tools** — Monitoring means knowing what your app is doing in production. There are three types you need: (1) **Error tracking** catches crashes and bugs — Sentry is the standard choice. (2) **APM (Application Performance Monitoring)** shows you slow endpoints, database queries, and bottlenecks — Datadog or Grafana Cloud are popular. (3) **Uptime monitoring** checks that your site is reachable from the outside — Better Uptime or UptimeRobot ping your site every minute and alert you if it goes down. Start with Sentry (free tier covers most early-stage apps) and an uptime monitor.
> Time: ~30 min to decide + set up
> Reference: See `references/monitoring-stack-selection.md`

<!-- intermediate -->
**Monitoring stack selection** — Error tracking (Sentry), APM (Datadog/Grafana Cloud/New Relic), uptime monitoring (Better Uptime/Checkly), log aggregation (Datadog Logs/Grafana Loki). Select based on budget, team size, and existing infra. Most stacks converge on Sentry + one APM/logging vendor.
> ~30 min | `references/monitoring-stack-selection.md`

<!-- senior -->
**Monitoring stack** — Sentry (errors) + APM vendor (Datadog/Grafana/New Relic) + synthetic monitoring (Checkly/Better Uptime). Evaluate vendor lock-in, OpenTelemetry support, and cost at scale.
> `references/monitoring-stack-selection.md`

---

### Sentry Setup

<!-- beginner -->
**Set up error tracking with Sentry** — When your app crashes in production, you need to know about it before your users complain. Sentry captures every error with the exact line of code, which user was affected, and what they did before the crash. The setup wizard handles most of the work. After installing, you also want source maps (so errors show your real code, not minified gibberish), release tracking (so you know which deploy introduced a bug), and user context (so you can see which user hit the error).
> Time: ~15 min
> Template: See `references/sentry-setup/nextjs-sentry-config.ts` or `references/sentry-setup/express-sentry-config.ts`

<!-- intermediate -->
**Sentry setup** — Install SDK, configure source map uploads in CI, enable release tracking tied to git SHA, attach user context (id, email) on auth, enable performance monitoring (tracesSampleRate: 0.1 in production), configure alert rules (new issue -> Slack/PagerDuty, regression -> email, spike -> Slack). Set up Sentry Crons for background job monitoring.
> ~15 min | `references/sentry-setup/`

<!-- senior -->
**Sentry** — SDK + source maps (CI upload) + releases (git SHA) + user context + performance (tracesSampleRate tuned per environment) + alert rules (new/regression/spike) + Crons for jobs.
> `references/sentry-setup/`

---

### Structured Logging

<!-- beginner -->
**Set up structured logging** — `console.log` works for development, but in production you need structured logging. That means every log line is a JSON object with consistent fields: timestamp, log level (info/warn/error), a message, and a correlation ID (a unique ID that follows a request across your whole system). This lets you search and filter logs in tools like Datadog or Grafana. Important: never log passwords, tokens, credit card numbers, or other PII (personally identifiable information).
> Time: ~30 min
> Key fields: `{ timestamp, level, message, correlationId, service, userId }`

<!-- intermediate -->
**Structured logging** — JSON format with consistent schema: `{ timestamp, level, message, correlationId, service, userId, metadata }`. Use pino or winston. Inject correlation ID via middleware (generate with `crypto.randomUUID()`, propagate via `x-correlation-id` header). Log levels: debug (dev only), info (business events), warn (degraded but functional), error (action needed). Scrub PII with redaction rules. Ship logs to aggregator (Datadog/Loki/CloudWatch).
> ~30 min

<!-- senior -->
**Structured logging** — pino/winston, JSON, correlation ID middleware (`x-correlation-id`), log levels (debug/info/warn/error), PII redaction, ship to aggregator. OpenTelemetry-compatible trace context propagation.

---

### Alerting Architecture

<!-- beginner -->
**Set up alerting so the right people get notified** — Alerts tell your team when something is wrong. But too many alerts cause "alert fatigue" — people start ignoring them. The key is severity levels: **P1** (site is down, revenue is lost — page someone immediately), **P2** (major feature broken — notify within 15 min), **P3** (degraded performance — Slack channel, fix today), **P4** (cosmetic or minor — ticket, fix this week). Route P1/P2 to PagerDuty or Opsgenie. Route P3/P4 to Slack.
> Time: ~45 min
> Reference: See `references/alerting-architecture.md`

<!-- intermediate -->
**Alerting architecture** — Define P1-P4 severity with clear thresholds. P1: site-wide outage, data loss, security breach -> PagerDuty immediate page. P2: major feature broken, error rate >5% -> PagerDuty 15-min delay. P3: elevated latency, non-critical errors -> Slack #alerts. P4: warnings, non-urgent -> Slack #alerts-low. Escalation matrix, on-call rotation, alert grouping to prevent fatigue.
> ~45 min | `references/alerting-architecture.md`

<!-- senior -->
**Alerting** — P1-P4 severity matrix, escalation paths, PagerDuty/Opsgenie routing, alert grouping/dedup, on-call rotation, fatigue prevention (cooldowns, composite alerts).
> `references/alerting-architecture.md`

---

### Health Endpoints

<!-- beginner -->
**Add health check endpoints** — Health endpoints let your hosting platform and monitoring tools know if your app is running correctly. You need three levels: (1) `/health/live` — just returns "OK" to prove the process is alive. (2) `/health/ready` — checks that the app can actually serve traffic (database connected, cache reachable). (3) `/health/detailed` — returns the status of every dependency with response times (for debugging). Kubernetes, load balancers, and uptime monitors all use these endpoints.
> Time: ~20 min
> Template: See `references/health-endpoint-templates/`

<!-- intermediate -->
**Health endpoints** — `/health/live` (200 if process up, for liveness probes), `/health/ready` (checks DB, Redis, critical APIs — for readiness probes), `/health/detailed` (per-dependency status + latency, behind auth). Return JSON: `{ status: "healthy"|"degraded"|"unhealthy", checks: {...}, timestamp }`. Add timeouts per check (2s default). Cache results for 5s to prevent thundering herd.
> ~20 min | `references/health-endpoint-templates/`

<!-- senior -->
**Health endpoints** — live/ready/detailed, per-dependency checks with timeouts, cached results (5s TTL), JSON schema, detailed behind auth.
> `references/health-endpoint-templates/`

---

### Backup Strategy

<!-- beginner -->
**Set up automated backups** — If your database disappears tomorrow, can you recover? Backups are your safety net. You need: (1) **Automated daily backups** — never rely on manual backups, they get forgotten. (2) **Point-in-Time Recovery (PITR)** — most managed databases (RDS, Supabase, PlanetScale) support this, letting you restore to any second in the past 7-30 days. (3) **Monthly restore tests** — a backup you have never tested is not a backup. Once a month, restore to a test environment and verify. (4) **Off-site copies** — keep at least one backup in a different region or cloud provider.
> Time: ~1 hour
> Reference: See `references/backup-dr-template.md`

<!-- intermediate -->
**Backup strategy** — Automated daily snapshots (managed DB provider or pg_dump cron), PITR enabled (7-30 day retention), monthly restore test to staging (document results), off-site copies (cross-region replication or S3 bucket in separate account), file/blob storage backups (S3 versioning + lifecycle rules). Document backup inventory and recovery procedures.
> ~1 hour | `references/backup-dr-template.md`

<!-- senior -->
**Backups** — Automated daily + PITR (7-30d) + monthly restore test + off-site (cross-region/cross-account). Document RTO per data store.
> `references/backup-dr-template.md`

---

### Disaster Recovery

<!-- beginner -->
**Create a disaster recovery plan** — Disaster recovery (DR) is your plan for when something catastrophic happens: database corruption, cloud region goes down, or a bad deploy wipes data. Two key metrics to define: **RTO** (Recovery Time Objective) — how long can you be down? For most SaaS apps, aim for <1 hour. **RPO** (Recovery Point Objective) — how much data can you lose? With PITR, often just seconds. Write down the exact steps to recover (a "runbook") so anyone on the team can follow them under pressure.
> Time: ~2 hours
> Reference: See `references/backup-dr-template.md`

<!-- intermediate -->
**Disaster recovery** — Define RTO/RPO per service tier (critical: RTO <1h, RPO <5min; standard: RTO <4h, RPO <1h). Failover plan: multi-AZ database, DNS failover (Route 53 health checks), read replicas promotable to primary. Runbooks for top 5 scenarios (DB failure, region outage, bad deploy, data corruption, security breach). Annual DR drill: simulate failure, measure actual RTO, document gaps.
> ~2 hours | `references/backup-dr-template.md`

<!-- senior -->
**DR plan** — RTO/RPO per tier, multi-AZ + DNS failover, promotable replicas, runbooks (top 5 scenarios), annual DR drill with measured RTO.
> `references/backup-dr-template.md`

---

### Status Page

<!-- beginner -->
**Set up a public status page** — A status page (like status.yourapp.com) tells your users whether your service is up, degraded, or down. When there is an outage, users check the status page before flooding your support inbox. Services like Instatus or Statuspage.io make this easy — you define your components (API, Web App, Database), and update them during incidents. Many also integrate with your monitoring tools to auto-update.
> Time: ~30 min
> Reference: See `references/status-page-setup.md`

<!-- intermediate -->
**Status page** — Instatus or Statuspage.io. Define components (API, Web App, Auth, Payments, Database). Configure uptime monitoring integration for auto-updates. Create incident templates (investigating, identified, monitoring, resolved). Set up subscriber notifications (email + RSS). Custom domain: status.yourdomain.com.
> ~30 min | `references/status-page-setup.md`

<!-- senior -->
**Status page** — Instatus/Statuspage.io, component definitions, incident templates, auto-update via API, subscriber notifications, custom domain.
> `references/status-page-setup.md`

---

### Incident Response

<!-- beginner -->
**Create an incident response plan** — When production breaks, panic is the enemy. An incident response plan gives your team a clear sequence of steps: (1) **Detect** — monitoring alerts fire. (2) **Triage** — determine severity (P1-P4). (3) **Communicate** — update the status page and notify stakeholders. (4) **Mitigate** — stop the bleeding (roll back, feature flag off, scale up). (5) **Resolve** — fix the root cause. (6) **Post-mortem** — write up what happened, why, and how to prevent it. Even solo founders should have a lightweight version of this.
> Time: ~1 hour
> Reference: See `references/incident-response-template.md`

<!-- intermediate -->
**Incident response plan** — Detection (automated alerts + user reports), triage (severity classification + incident commander assignment), communication (status page update within 5 min for P1, internal Slack channel), mitigation (rollback playbook, feature flags, circuit breakers), resolution (root cause fix), post-mortem (blameless, within 48h, action items with owners and deadlines). Define roles: Incident Commander, Communications Lead, Technical Lead.
> ~1 hour | `references/incident-response-template.md`

<!-- senior -->
**Incident response** — Detect/triage/communicate/mitigate/resolve/post-mortem. IC + Comms + Tech Lead roles. Severity-based SLAs. Blameless post-mortems within 48h.
> `references/incident-response-template.md`

---

### Auto-Scaling

<!-- beginner -->
**Configure auto-scaling** — Auto-scaling means your app automatically adds more server capacity when traffic spikes and scales back down when traffic drops. Without it, you either over-provision (wasting money) or under-provision (site goes down during peaks). If you are on Vercel or Netlify, serverless functions auto-scale by default. If you are on Kubernetes, use HPA (Horizontal Pod Autoscaler) based on CPU or custom metrics. For cost savings, consider scale-to-zero for dev/staging environments.
> Time: ~30 min (depends on platform)

<!-- intermediate -->
**Auto-scaling** — Serverless (Vercel/Netlify/Lambda): auto-scales by default, configure concurrency limits and cold start optimization. Kubernetes: HPA (Horizontal Pod Autoscaler) targeting CPU 70% or custom metrics (requests/sec, queue depth). Set min/max replicas. Scale-to-zero for non-production (KEDA or Knative). Load test to validate scaling behavior before launch.
> ~30 min

<!-- senior -->
**Auto-scaling** — HPA (CPU/custom metrics), KEDA for event-driven, scale-to-zero (non-prod), concurrency limits, load-test validated. Define scaling policies (stabilization window, scale-down rate).

---

## Verification Steps

After completing the checklist above, verify:

1. **Sentry**: Trigger a test error in production — confirm it appears in Sentry within 60s with source maps, user context, and correct release tag.
2. **Health endpoints**: `curl https://your-domain.com/health/live` returns 200. `curl https://your-domain.com/health/ready` returns 200 with dependency status JSON.
3. **Structured logging**: Tail production logs — confirm every line is valid JSON with timestamp, level, correlationId.
4. **Alerting**: Trigger a test P3 alert — confirm it routes to Slack within 2 min. Verify P1 escalation path reaches PagerDuty/Opsgenie.
5. **Backups**: Restore the latest backup to a test environment. Verify data integrity matches production.
6. **Status page**: Visit status.yourdomain.com — confirm all components are listed and operational.
7. **Incident response**: Run a tabletop exercise: "The database is returning errors on 50% of queries." Walk through the full detect-to-post-mortem flow.

---

## Companion tools

- `getsentry/sentry-for-claude` — Sentry integration for Claude Code: query issues, create alerts, manage releases
- `phrazzld/claude-config` -> `/check-observability` — Automated observability configuration checker
- `julianobarbosa/claude-code-skills` — Extended observability skills for Claude Code
