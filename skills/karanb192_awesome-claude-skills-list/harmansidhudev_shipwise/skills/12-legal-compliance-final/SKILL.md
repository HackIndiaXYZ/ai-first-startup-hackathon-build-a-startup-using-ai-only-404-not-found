---
name: legal-compliance-final
description: "Privacy policy, terms of service, cookie consent, GDPR/CCPA compliance, data retention, SOC 2 readiness, and open source license audit."
triggers:
  - "privacy policy"
  - "terms of service"
  - "cookie consent"
  - "GDPR"
  - "CCPA"
  - "data protection"
  - "compliance"
  - "legal"
  - "DPA"
  - "DSAR"
  - "data retention"
  - "SOC 2"
  - "open source license"
  - "cookie banner"
  - "license audit"
  - "legal compliance"
---

# Legal Compliance (Final)

> Phase 3: SHIP | Sprint 4
> **Disclaimer: Organizational checklists, not legal advice. Consult qualified professionals.**

## Coverage

- Privacy policy (data collected, purpose, retention, sharing, jurisdiction-specific)
- Terms of service (acceptable use, liability, IP, disputes, termination)
- Cookie consent (granular opt-in, analytics vs marketing, DNT)
- GDPR/CCPA (DSARs, right to deletion, portability, consent records)
- Data retention policy (define per data type, automate purging)
- SOC 2 readiness (B2B: policies, access controls, audit logging)
- Open source license audit (inventory deps, GPL caution, document compliance)

---

## Checklist Items

### 1. Privacy Policy

<!-- beginner -->
**Create a privacy policy** — A privacy policy is legally required in most jurisdictions if you collect ANY user data, including email addresses, analytics, or IP addresses. Your policy must explain: (1) what data you collect, (2) why you collect it, (3) who you share it with, (4) how long you keep it, and (5) how users can request deletion. Start with a generator (Termly, Iubenda, or Privacy Policy Online), then customize it with your actual data practices. Place it at `/privacy` or `/privacy-policy` and link it from your footer and signup forms.
> Time: ~1-2 hours
> Reference: See `references/privacy-policy-requirements.md`

<!-- intermediate -->
**Privacy policy** — Create a data inventory first: map every piece of PII your app collects, its purpose, legal basis, retention period, and third-party processors. Draft your policy to cover all jurisdictions where you have users. Key sections: data collected, legal basis for processing, purpose limitation, retention periods, third-party sharing (name each processor), international data transfers, user rights (access, correction, deletion, portability), children's data (COPPA if US users under 13), and contact information. Review quarterly or when you add new data collection.
> ~1-2 hours | `references/privacy-policy-requirements.md`

<!-- senior -->
**Privacy policy** — Data map -> legal basis assessment -> jurisdiction-specific sections (GDPR Art. 13/14, CCPA 1798.100, PIPEDA, APPs). Enumerate processors, transfer mechanisms (SCCs, adequacy decisions), automated decision-making disclosures. Maintain versioned policy with changelog.
> `references/privacy-policy-requirements.md`

---

### 2. Terms of Service

<!-- beginner -->
**Create terms of service** — Terms of service (ToS) are the rules users agree to when using your app. They protect you legally by defining acceptable use (what users can and cannot do), who owns the content (you, the user, or both), what happens if something goes wrong (liability limits), and how disputes are resolved. You need ToS before launching publicly. Start with a template, then customize the sections that matter most for your app type (SaaS, marketplace, content platform). Place at `/terms` and require acceptance during signup.
> Time: ~2-3 hours
> Reference: See `references/tos-framework.md`

<!-- intermediate -->
**Terms of service** — Key sections: definitions, eligibility, account terms, acceptable use policy (AUP), intellectual property rights, user-generated content license, payment terms (if applicable), liability limitations and disclaimers, indemnification, dispute resolution (arbitration clause vs litigation), termination, modification procedures, and governing law. Include a severability clause. For SaaS, add SLA references and data processing terms. Review with legal counsel before launch.
> ~2-3 hours | `references/tos-framework.md`

<!-- senior -->
**Terms of service** — AUP, IP assignment/license grants, limitation of liability (cap at fees paid in 12 months), mutual indemnification, binding arbitration with carve-outs (IP, small claims), class action waiver, modification with notice period, governing law selection. Pair with DPA for B2B.
> `references/tos-framework.md`

---

### 3. Cookie Consent

<!-- beginner -->
**Add cookie consent** — If your site uses cookies (and it almost certainly does — analytics, auth sessions, and third-party scripts all set cookies), you need to tell users and get their consent. In the EU, you must get consent BEFORE setting non-essential cookies. This means: (1) show a banner on first visit, (2) let users choose which cookie categories they accept (necessary, analytics, marketing), (3) do not load analytics or marketing scripts until consent is given, and (4) save the user's choice so you do not ask again every visit. Use a consent management platform (CMP) like CookieYes, Osano, or build a lightweight custom banner.
> Time: ~2-4 hours
> Reference: See `references/cookie-consent-guide.md`

<!-- intermediate -->
**Cookie consent** — Implement a consent management platform with granular category controls: strictly necessary (always on, no consent needed), analytics/performance, functional/preferences, and marketing/advertising. Block non-essential cookies and scripts until consent is recorded. Store consent proof (timestamp, categories, version) server-side. Respect `Sec-GPC` and DNT headers. Integrate with GTM consent mode for tag-level control. Audit cookies quarterly — new third-party scripts often introduce undisclosed cookies.
> ~2-4 hours | `references/cookie-consent-guide.md`

<!-- senior -->
**Cookie consent** — CMP with TCF 2.2 support if running programmatic ads. Consent-aware GTM container (consent mode v2). Server-side consent record with audit trail. ePrivacy Directive compliance (per-country rules). Automated cookie scanning in CI. GPC signal handling (treat as opt-out under CCPA).
> `references/cookie-consent-guide.md`

---

### 4. GDPR / CCPA Compliance

<!-- beginner -->
**Handle GDPR and CCPA requirements** — If you have users in the EU or California, you must comply with data protection laws. The two biggest are GDPR (EU) and CCPA (California). In practice, this means: (1) know what data you collect and where it lives (data mapping), (2) have a legal reason for collecting each piece of data (consent, contract, or legitimate interest), (3) let users request a copy of their data or delete it (DSAR — Data Subject Access Request), (4) report data breaches within 72 hours (GDPR) or without unreasonable delay (CCPA), and (5) sign data processing agreements (DPAs) with every third-party service that handles user data (Stripe, AWS, analytics, email providers). Start with data mapping — you cannot comply if you do not know what data you have.
> Time: ~4-8 hours for initial setup
> Reference: See `references/gdpr-ccpa-checklist.md`

<!-- intermediate -->
**GDPR/CCPA compliance** — Data mapping (inventory all PII, storage locations, processors, retention), lawful basis assessment per data type (Art. 6 GDPR), consent management with granular opt-in, DSAR workflow (identity verification, 30-day response window GDPR / 45-day CCPA, data export in machine-readable format, deletion with cascading to processors), DPA review for all sub-processors, breach notification procedures (72h GDPR, without unreasonable delay CCPA, maintain incident log), records of processing activities (ROPA, Art. 30). If processing at scale, assess whether you need a DPO.
> ~4-8 hours | `references/gdpr-ccpa-checklist.md`

<!-- senior -->
**GDPR/CCPA** — ROPA (Art. 30), DPIA for high-risk processing, lawful basis matrix, processor/sub-processor chain with SCCs, DSAR automation (API + admin panel), consent receipts (ISO/IEC 27560), breach notification runbook, cross-border transfer mechanisms. CCPA: "sale" definition audit, opt-out mechanism, financial incentive disclosures if loyalty programs.
> `references/gdpr-ccpa-checklist.md`

---

### 5. Data Retention Policy

<!-- beginner -->
**Define data retention rules** — You should not keep user data forever. For each type of data you collect, decide how long you need it and delete it after that. For example: keep active account data while the account exists, delete logs after 90 days, delete analytics after 2 years, and purge deleted account data after 30 days. Write these rules down in a retention schedule and automate the deletion with cron jobs or database TTLs. This is required by GDPR (storage limitation principle) and reduces your risk if you are ever breached.
> Time: ~1-2 hours
> Reference: See `references/gdpr-ccpa-checklist.md` (data retention section)

<!-- intermediate -->
**Data retention policy** — Create a retention schedule mapping each data category to a retention period and legal basis. Categories: account data (life of account + 30 days), transaction records (7 years for tax/legal), server logs (90 days), analytics (24 months), support tickets (3 years), marketing consent records (life of consent + 3 years). Automate purging with scheduled jobs. Implement soft delete with hard delete after grace period. Document exceptions (legal holds, regulatory requirements).
> ~1-2 hours | `references/gdpr-ccpa-checklist.md`

<!-- senior -->
**Data retention** — Per-category retention schedule with legal basis. Automated purging (DB TTL indexes, cron, or event-driven). Legal hold mechanism to suspend deletion. Cascading deletion to sub-processors via API. Retention policy versioning. Annual review cycle.
> `references/gdpr-ccpa-checklist.md`

---

### 6. SOC 2 Readiness (B2B)

<!-- beginner -->
**Prepare for SOC 2 if you sell to businesses** — SOC 2 is a security audit that enterprise customers require before buying your product. It covers five "Trust Service Criteria": security, availability, processing integrity, confidentiality, and privacy. You do not need to get SOC 2 certified immediately, but if you plan to sell to mid-market or enterprise, start building the habits now: (1) use SSO and enforce MFA for your team, (2) log all access to production systems, (3) document your security policies (access control, incident response, change management), (4) run background checks on employees with production access, and (5) encrypt data at rest and in transit. Tools like Vanta, Drata, or Secureframe automate evidence collection.
> Time: ~1 week to get started, 3-6 months for Type II audit
> Reference: See SOC 2 section below

<!-- intermediate -->
**SOC 2 readiness** — Trust Service Criteria: Security (CC), Availability (A), Processing Integrity (PI), Confidentiality (C), Privacy (P). Minimum for most B2B SaaS: Security + Availability. Key controls: access management (SSO, MFA, RBAC, quarterly access reviews), change management (PR reviews, CI/CD, no direct production access), incident response plan, vendor management, encryption (at rest + in transit), audit logging (who did what, when, immutable), backup and recovery testing, employee security training. Use a compliance automation platform (Vanta, Drata, Secureframe) to continuously collect evidence. Plan 3-6 months for Type II (covers operating effectiveness over time).
> ~1 week to start | SOC 2 section below

<!-- senior -->
**SOC 2** — Type I (design) -> Type II (operating effectiveness, 3-12 month window). Map controls to TSC criteria. Automate evidence with Vanta/Drata. Key gaps for startups: formal policies, access reviews, vendor risk assessments, BCP testing. Complement with penetration testing and vulnerability scanning. Consider SOC 2 + ISO 27001 alignment if international B2B.
> SOC 2 section below

---

### 7. Open Source License Audit

<!-- beginner -->
**Check your open source licenses** — Every npm/pip/gem package you install has a license that says what you can and cannot do with it. Most are permissive (MIT, Apache 2.0, BSD) and safe to use. Some are "copyleft" (GPL, AGPL) and require you to open-source your own code if you use them. Before launching, run a license scan to find any problematic licenses in your dependency tree. Use `npx license-checker --summary` (Node.js) or tools like FOSSA to get a report. Replace any GPL/AGPL dependencies unless your project is also open source.
> Time: ~30 min to scan, 1-2 hours to resolve issues
> Reference: See `references/oss-license-audit.md`

<!-- intermediate -->
**Open source license audit** — Run a full dependency license scan: `npx license-checker --production --json` or use FOSSA/Snyk for deeper analysis. Categorize licenses by risk: low (MIT, Apache 2.0, BSD, ISC), medium (MPL 2.0, LGPL), high (GPL, AGPL, SSPL, Commons Clause). For copyleft licenses, assess whether your usage triggers the copyleft obligation (linking, modification, network use for AGPL). Maintain a NOTICE file attributing all third-party code. Add license checking to CI to catch new problematic dependencies. Document any license exceptions with rationale.
> ~1-2 hours | `references/oss-license-audit.md`

<!-- senior -->
**OSS license audit** — Automated scanning in CI (license-checker, FOSSA, or Snyk). License compatibility matrix for your distribution model (SaaS vs on-prem vs library). SBOM generation (CycloneDX/SPDX). NOTICE file maintenance. Policy: allowlist permissive, flag copyleft for review, block AGPL/SSPL in proprietary codebases. Dual-license risk assessment for critical deps.
> `references/oss-license-audit.md`

---

## SOC 2 Control Categories (Quick Reference)

| Category | Key Controls | Evidence |
|----------|-------------|----------|
| **Access Control** | SSO, MFA, RBAC, quarterly reviews | Access logs, review records |
| **Change Management** | PR reviews, CI/CD, staging env | Git history, deploy logs |
| **Incident Response** | Documented plan, post-mortems | Incident log, response records |
| **Risk Assessment** | Annual risk assessment, vendor reviews | Risk register, vendor questionnaires |
| **Encryption** | TLS 1.2+, AES-256 at rest | Config evidence, cert records |
| **Logging & Monitoring** | Audit logs, alerting, retention | Log samples, alert configs |
| **Business Continuity** | Backups, DR plan, tested annually | Backup records, DR test results |
| **HR Security** | Background checks, security training | Training records, policy acknowledgments |

---

## Compliance Timeline by Stage

```
Pre-launch (MVP)
├── Privacy policy (required by law)
├── Terms of service (required before users sign up)
├── Cookie consent banner (required if EU users)
├── Basic data retention rules (document, even if not automated)
└── OSS license scan (one-time, 30 min)

Post-launch (100-1K users)
├── GDPR/CCPA compliance (data mapping, DSAR process)
├── DPAs with all processors
├── Automated data retention / purging
├── Cookie consent with granular categories
└── OSS license check in CI

Growth (1K-10K users)
├── SOC 2 Type I (if B2B)
├── Formal incident response plan
├── DSAR automation (admin panel + API)
├── Annual compliance review cycle
└── SBOM generation

Scale (10K+ users)
├── SOC 2 Type II
├── DPO appointment (if required)
├── DPIA for high-risk processing
├── ISO 27001 alignment (if international B2B)
├── Automated compliance monitoring (Vanta/Drata)
└── External legal review annually
```

---

## Companion tools
- `rohitg00/awesome-claude-code-toolkit` -> `legal-advisor`
- `mcpmarket.com` -> `legal-advisor` skill
