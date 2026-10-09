---
name: security-compliance
description: "OWASP Top 10, auth hardening, input validation, security headers, dependency management, and pre-commit secret scanning."
triggers:
  - "web security"
  - "application security"
  - "app security"
  - "OWASP"
  - "auth hardening"
  - "rate limiting"
  - "CSRF"
  - "XSS"
  - "SQL injection"
  - "security headers"
  - "CSP"
  - "vulnerability"
  - "pen test"
  - "dependency scanning"
  - "secret scanning"
  - "gitleaks"
  - "Snyk"
  - "Dependabot"
  - "helmet"
  - "Argon2"
  - "MFA"
  - "input validation"
  - "DOMPurify"
  - "SSRF"
---

# Security & Compliance

> Phase 2: BUILD | Sprint 2

## Coverage

- OWASP Top 10 (2025) checklist with verification steps
- Auth hardening (Argon2id, rate limiting, session security, MFA, HaveIBeenPwned)
- Input validation (server-side Zod/Joi, DOMPurify, file upload security)
- Security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- Dependency management (Dependabot/Renovate, Snyk/Socket, lock files, CI audit)
- Pre-commit secret scanning (gitleaks/trufflehog)

---

## Read project context first

Before responding, check `.claude/shipwise-state.json` for:
- `project.stack.auth` — determines which auth hardening items apply
- `experience_level` — beginner, intermediate, senior
- `expected_scale` — affects rate limiting thresholds

### Managed auth provider detection

If `project.stack.auth` is a managed provider (`clerk`, `auth0`, `supabase`, `firebase`), the provider handles password hashing, breach checking, and account lockout internally. **Skip these sections** from the auth hardening checklist and note why:

- **Skip Section 1 (Argon2id/bcrypt)** — managed by the provider
- **Skip Section 5 (HaveIBeenPwned)** — managed by the provider
- **Skip Section 7 (Account lockout)** — managed by the provider (verify in provider dashboard settings)

**Focus instead on** what the developer IS responsible for with managed auth:
- Rate limiting at the application layer (provider rate limits protect their endpoints, not yours)
- Session/cookie configuration via the provider's SDK
- CSRF protection for non-API routes
- MFA enablement via the provider's dashboard
- Security headers (always your responsibility regardless of auth provider)

If `project.stack.auth` is self-managed (`nextauth`, `lucia`, `custom`) or absent, present the full checklist.

---

## Checklist Items

### OWASP Top 10 Compliance

<!-- beginner -->
**Run through the OWASP Top 10 checklist** — OWASP is a nonprofit that publishes the 10 most critical web security risks. Think of it as a "building code" for web apps. Each item (like Broken Access Control, Injection, Cryptographic Failures) represents a category of attacks. Walking through this checklist catches the vast majority of real-world vulnerabilities before attackers find them.
> Time: ~2 hours for initial audit
> Reference: See `references/owasp-checklist.md`

<!-- intermediate -->
**OWASP Top 10 (2025) audit** — A01 Broken Access Control, A02 Cryptographic Failures, A03 Injection, A04 Insecure Design, A05 Security Misconfiguration, A06 Vulnerable Components, A07 Authentication Failures, A08 Software/Data Integrity, A09 Logging Failures, A10 SSRF. Verify each with automated + manual checks.
> ~2 hours | `references/owasp-checklist.md`

<!-- senior -->
**OWASP Top 10 (2025)** — Full A01-A10 audit. Automated SAST/DAST + manual verification per category.
> `references/owasp-checklist.md`

---

### Security Headers

<!-- beginner -->
**Add security headers to every response** — Security headers are instructions your server sends to the browser saying "here's how to protect this user." CSP (Content Security Policy) tells the browser which scripts/styles are allowed to run, blocking injected malicious code. HSTS forces HTTPS so no one can intercept traffic. X-Frame-Options prevents your site from being embedded in a malicious iframe (clickjacking). Without these headers, browsers allow almost anything by default.
> Time: ~15 min with templates
> Template: See `references/security-headers/`

<!-- intermediate -->
**Security headers** — CSP (nonce-based for scripts), HSTS (max-age=31536000, includeSubDomains, preload), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy (restrict camera, mic, geolocation). Use helmet (Express) or next.config.js headers.
> ~15 min | `references/security-headers/`

<!-- senior -->
**Security headers** — CSP w/ nonce, HSTS w/ preload, XFO, XCTO, Referrer-Policy, Permissions-Policy. Templates in `references/security-headers/`.

---

### Auth Hardening

> **Note:** If using a managed auth provider (Clerk, Auth0, Supabase Auth, Firebase Auth), see the "Managed auth provider detection" section above. Skip password hashing, HIBP, and account lockout — your provider handles those. Focus on rate limiting, session config, CSRF, and MFA enablement.

<!-- beginner -->
**Harden your authentication system** — Authentication is how your app knows who someone is. If it's weak, attackers can steal accounts.

**If using Clerk, Auth0, or similar managed auth:**
- Your provider handles password hashing and breach checking — you don't need to implement those
- **Rate limiting**: Still your responsibility. Limit login attempts to 5 per minute per IP on YOUR API routes. The provider protects their endpoints, but you need to protect yours.
- **Secure cookies**: Configure via your provider's SDK. Clerk: set `sameSite: 'strict'` in middleware. Auth0: configure in tenant settings.
- **CSRF protection**: Add CSRF tokens to all state-changing forms so requests can only come from your own site.
- **MFA**: Enable in your provider's dashboard. Clerk: Dashboard → User & Authentication → Multi-factor. Auth0: Dashboard → Security → MFA.

**If using custom/self-hosted auth (NextAuth, Lucia, custom):**
- **Password hashing**: Use Argon2id (or bcrypt with cost factor >= 12 as fallback). Never store plain text or use MD5/SHA.
- **Rate limiting**: Limit login attempts to 5 per minute per IP.
- **Secure cookies**: Set `httpOnly`, `secure`, and `sameSite=strict`.
- **CSRF protection**: Add CSRF tokens to all state-changing forms.
- **Password breach checking**: Check new passwords against the HaveIBeenPwned database.
- **Account lockout**: Lock accounts after 5 failed attempts for 15 minutes.
> Time: ~30 min (managed) / ~1 hour (self-hosted)
> Reference: See `references/auth-hardening-checklist.md`

<!-- intermediate -->
**Auth hardening** — Check `project.stack.auth` first.
- **Managed (Clerk/Auth0/Supabase/Firebase):** Skip Argon2id/HIBP/lockout (provider-managed). Focus on: application-layer rate limiting (5/min login, 100/min API), session config via provider SDK, CSRF double-submit pattern, MFA enablement in provider dashboard.
- **Self-hosted (NextAuth/Lucia/custom):** Full checklist — Argon2id (memoryCost: 65536, timeCost: 3, parallelism: 4), rate limiting, httpOnly+secure+sameSite=strict cookies, CSRF double-submit, HIBP k-anonymity, account lockout (5 attempts/15 min), MFA via TOTP.
> ~30 min (managed) / ~1 hour (self-hosted) | `references/auth-hardening-checklist.md`

<!-- senior -->
**Auth hardening** — Managed auth: rate limit (app layer), session SDK config, CSRF, MFA dashboard toggle. Self-hosted: Argon2id, sliding-window rate limit, session config, CSRF double-submit, HIBP k-anonymity, account lockout, MFA (TOTP/WebAuthn).
> `references/auth-hardening-checklist.md`

---

### Input Validation

<!-- beginner -->
**Validate all user input on the server** — Never trust data from the browser. Even if you have client-side validation, attackers can bypass it entirely (using tools like Postman or curl). Always validate on the server using a schema library like Zod or Joi. For HTML content users submit, sanitize it with DOMPurify to strip malicious scripts. For file uploads: check MIME types, limit file sizes, and store files outside your web root.
> Time: ~45 min
> Key rule: Client-side validation is UX. Server-side validation is security.

<!-- intermediate -->
**Input validation** — Server-side Zod/Joi schemas on every endpoint. DOMPurify for any user-submitted HTML. File uploads: validate MIME type (check magic bytes, not just extension), enforce size limits, store outside web root, generate random filenames. Parameterized queries only (never string interpolation for SQL).
> ~45 min

<!-- senior -->
**Input validation** — Zod/Joi server-side, DOMPurify for HTML, file upload validation (magic bytes + size + random names + isolated storage), parameterized queries, allowlist over denylist.

---

### Dependency Scanning

<!-- beginner -->
**Set up automated dependency scanning** — Your app uses dozens (sometimes hundreds) of open-source libraries. Any one of them could have a security vulnerability discovered tomorrow. Dependency scanning tools automatically check your libraries against known vulnerability databases and alert you (or even create PRs to update). This is one of the highest-impact security measures because vulnerable dependencies are the #1 way real apps get hacked.
> Time: ~30 min to set up
> Reference: See `references/dependency-scanning-setup.md`

<!-- intermediate -->
**Dependency scanning** — Dependabot or Renovate for automated update PRs, Snyk or Socket for vulnerability scanning in CI, `npm audit` / lock file integrity checks in CI pipeline, pin major versions.
> ~30 min | `references/dependency-scanning-setup.md`

<!-- senior -->
**Dependency scanning** — Dependabot/Renovate + Snyk/Socket CI gate + `npm audit --audit-level=high` in CI + lock file verification.
> `references/dependency-scanning-setup.md`

---

### Secret Scanning

<!-- beginner -->
**Set up pre-commit secret scanning** — Accidentally committing an API key, database password, or secret token to Git is one of the most common and dangerous mistakes. Once a secret is in Git history, it's nearly impossible to fully remove. Pre-commit hooks with tools like gitleaks or trufflehog scan your code before every commit and block you if they detect anything that looks like a secret (API keys, tokens, passwords).
> Time: ~15 min to set up
> Reference: See `references/dependency-scanning-setup.md` (secret scanning section)

<!-- intermediate -->
**Pre-commit secret scanning** — gitleaks pre-commit hook (blocks commits containing secrets), trufflehog for CI/historical scanning, .gitleaks.toml for custom rules/allowlists.
> ~15 min | `references/dependency-scanning-setup.md`

<!-- senior -->
**Secret scanning** — gitleaks pre-commit + trufflehog CI scan + GitHub secret scanning alerts.

---

## Verification Steps

After completing the checklist above, verify:

1. **Headers**: Run `curl -I https://your-domain.com` and confirm CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy are all present.
2. **Auth**: Attempt >5 rapid login failures — should get rate-limited. Inspect cookies — should see `httpOnly`, `Secure`, `SameSite=Strict`.
3. **Injection**: Try `' OR 1=1 --` in form fields, `<script>alert(1)</script>` in text inputs — should be rejected or sanitized.
4. **Dependencies**: Run `npm audit` — should show 0 high/critical vulnerabilities.
5. **Secrets**: Try committing a file containing `AKIA...` (fake AWS key pattern) — pre-commit hook should block it.
6. **OWASP scan**: Run `npx is-website-vulnerable https://your-domain.com` as a quick smoke test.

---

## Companion tools

- `agamm/claude-code-owasp` (52K stars) — Automated OWASP Top 10 scanning with Claude Code integration
- `unicodeveloper/shannon` — Pen testing assistant for security review
- `trailofbits/skills` — Security-focused Claude Code skills from Trail of Bits
- `anthropics/claude-code-security-review` — Automated security code review
