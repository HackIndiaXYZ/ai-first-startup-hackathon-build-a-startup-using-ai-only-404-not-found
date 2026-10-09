---
name: business-legal-foundation
description: "Business formation and legal foundation — entity selection, co-founder agreements, IP assignment, banking, accounting, domain strategy, trademark, and insurance."
triggers:
  - "business entity"
  - "LLC"
  - "C-Corp"
  - "S-Corp"
  - "incorporation"
  - "incorporate"
  - "co-founder"
  - "cofounder"
  - "equity"
  - "equity split"
  - "vesting"
  - "vesting schedule"
  - "IP assignment"
  - "intellectual property"
  - "domain"
  - "domain name"
  - "trademark"
  - "business bank account"
  - "EIN"
  - "accounting"
  - "QuickBooks"
  - "bookkeeping"
  - "insurance"
  - "legal foundation"
  - "business formation"
  - "Delaware"
  - "operating agreement"
  - "bylaws"
  - "cap table"
  - "83b election"
  - "founder agreement"
---

# Business & Legal Foundation

> Phase 1: DESIGN | Sprint 3

> **Disclaimer: Organizational checklists, not legal advice. Consult qualified professionals.**

You help developers set up the business and legal infrastructure needed to operate a real company. This skill covers entity formation, tax setup, banking, accounting, co-founder agreements, IP assignment, domain strategy, trademark protection, and business insurance.

## When this skill triggers

This skill activates when a developer is forming a business entity, setting up co-founder agreements, configuring banking or accounting, securing domains and trademarks, establishing IP assignment policies, or asking about business insurance for a software company.

---

## Entity Formation

Reference: `references/entity-decision-tree.md`

### Choose your business entity

<!-- beginner -->
**Choose and form your business entity** — Before you can open a bank account, sign contracts, or raise money, you need a legal business entity. Here is the short version:

- **Sole Proprietorship** — No paperwork, but you are personally liable for everything. Fine for weekend projects, not for real businesses.
- **LLC (Limited Liability Company)** — Protects your personal assets. Simple to set up ($50-500 depending on state). Profits pass through to your personal tax return. Great for bootstrapped projects with 1-3 founders.
- **C-Corp** — Required if you want to raise venture capital. More expensive to set up and maintain (annual franchise taxes, separate tax filing). Delaware is the standard state for tech startups.
- **S-Corp** — Like a C-Corp but profits pass through to personal taxes. Limited to 100 US-resident shareholders. Not compatible with VC funding.

**Rule of thumb:** If you plan to raise VC money, form a Delaware C-Corp. If you are bootstrapping, form an LLC in your home state or Wyoming.

After forming your entity, you need an EIN (Employer Identification Number) from the IRS — it is free and takes 5 minutes online.

> Time: 1-3 hours for research, 30 min to file
> Reference: See `references/entity-decision-tree.md`

<!-- intermediate -->
**Entity formation** — LLC for bootstrapped (home state or Wyoming for privacy/low fees), Delaware C-Corp for funded startups. S-Corp election available for tax optimization on LLC or C-Corp (consult CPA). File online with the state secretary of state or use a registered agent service (Stripe Atlas $500, Clerky $799, or Northwest $39 + state fees). Get your EIN immediately after formation at irs.gov (online, free, instant). File 83(b) election within 30 days if issuing restricted stock.

> ~2 hours | `references/entity-decision-tree.md`

<!-- senior -->
**Entity** — Delaware C-Corp (funded) or LLC (bootstrapped). Stripe Atlas / Clerky / direct filing. EIN via irs.gov. 83(b) within 30 days for restricted stock. Consider QSBS eligibility for C-Corp (Section 1202 — up to $10M capital gains exclusion).

> `references/entity-decision-tree.md`

---

## EIN & Business Banking

### Get your EIN and open a business bank account

<!-- beginner -->
**Get your EIN and business bank account** — Your EIN is like a Social Security Number for your business. You need it to open a bank account, hire people, and file taxes. Apply free at irs.gov — if you are a US resident with an SSN, you get it instantly online.

Next, open a dedicated business bank account. Never mix personal and business finances — it weakens your liability protection and makes accounting a nightmare. Here are the popular options for startups:

| Bank | Monthly fee | Key features | Best for |
|------|-------------|--------------|----------|
| **Mercury** | $0 | API access, treasury, integrations | Tech startups, default choice |
| **Relay** | $0 | Up to 20 checking accounts, profit-first budgeting | Bootstrapped businesses |
| **Brex** | $0 | Corporate card, high-yield treasury, bill pay | Funded startups with $100K+ |
| **Novo** | $0 | Invoicing, integrations, reserves | Freelancers, small teams |
| **Local bank/credit union** | $0-15 | In-person support, SBA loans | If you need local banking |

Mercury is the most popular choice for tech startups. Apply online — approval takes 1-3 business days.

> Time: 15 min for EIN, 20 min for bank application
> Cost: Free

<!-- intermediate -->
**EIN + business banking** — EIN: irs.gov online application (instant for US residents, fax/mail for international — 4-week wait). Banking: Mercury (default for startups, API access, treasury at 4%+), Relay (profit-first budgeting), Brex (corporate card + treasury, requires $100K+ or VC backing). Open checking + savings/treasury. Set up ACH for recurring expenses.

> ~30 min

<!-- senior -->
**EIN + banking** — EIN via irs.gov. Mercury or Brex for primary banking + treasury. Consider SVB/First Republic for credit lines at scale. Ensure FDIC sweep coverage beyond $250K via treasury product.

---

## Accounting Setup

### Set up your accounting system

<!-- beginner -->
**Set up accounting from day one** — Do not wait until tax season to figure out your finances. Set up accounting software now and categorize every transaction as it happens. Here are your options:

| Software | Cost | Best for | Payroll |
|----------|------|----------|---------|
| **QuickBooks Online** | $30-200/mo | Most businesses, CPA-friendly | Add-on |
| **Xero** | $15-78/mo | International, clean UI | Add-on |
| **Wave** | Free | Solo founders, very early stage | Paid add-on |
| **Bench** | $299-499/mo | Hands-off (they do it for you) | No |

**QuickBooks Online** is the safe default — almost every CPA knows it, and it integrates with everything. Connect your Mercury/Relay bank account for automatic transaction import.

Set up these categories for a SaaS business:
- **Revenue:** Subscription revenue, one-time revenue, services revenue
- **COGS:** Hosting/infrastructure, payment processing fees, third-party API costs
- **Operating expenses:** Payroll, contractors, software subscriptions, marketing, legal/professional, office/co-working, travel
- **Do monthly:** Reconcile bank accounts, review P&L, track burn rate and runway

> Time: 1-2 hours initial setup
> Cost: $0-200/mo depending on choice

<!-- intermediate -->
**Accounting setup** — QuickBooks Online (US standard, CPA-compatible) or Xero (cleaner UI, better international). Connect bank feeds from Mercury/Relay. Set up SaaS chart of accounts: Revenue (MRR, ARR tracking), COGS (hosting, payment processing, API costs), OpEx (payroll, contractors, SaaS tools, marketing). Monthly: reconcile all accounts, review P&L and cash flow, calculate burn rate and runway. Accrual basis for funded startups (required for GAAP). Cash basis acceptable for bootstrapped.

> ~2 hours setup

<!-- senior -->
**Accounting** — QBO or Xero with SaaS chart of accounts. Accrual basis if funded. Automate bank feeds, implement approval workflows for expenses > $500. Monthly close process: reconcile, accrue, review. Track SaaS metrics (MRR, churn, LTV, CAC) alongside financials. Consider Puzzle or Digits for startup-specific reporting.

---

## Co-founder Agreement

Reference: `references/cofounder-agreement-outline.md`

### Formalize your co-founder agreement

<!-- beginner -->
**Write a co-founder agreement before writing code** — This is the single most important legal document for your startup. More startups die from co-founder conflict than from competition. Your agreement should cover:

1. **Equity split** — Who owns what percentage? Equal splits are common but not always right. Consider: Who had the idea? Who is working full-time? Who is putting in money? Use a vesting schedule so equity is earned over time.

2. **Vesting schedule** — Standard is 4 years with a 1-year cliff. This means: if a co-founder leaves before 1 year, they get nothing. After 1 year, they get 25%. Then they earn the rest monthly over the next 3 years. This protects everyone.

3. **Roles and responsibilities** — Who is CEO? Who makes final decisions on product vs engineering vs business? Write it down.

4. **IP assignment** — All co-founders must assign their intellectual property to the company. No exceptions.

5. **What happens if someone leaves** — Can the company buy back unvested shares? At what price? What about vested shares?

Do not use a handshake agreement. Get this in writing. Use a lawyer ($1,500-3,000) or start with the template in the reference doc and have a lawyer review it ($500-1,000).

> Time: 2-4 hours of co-founder discussion + lawyer review
> Cost: $500-3,000
> Reference: See `references/cofounder-agreement-outline.md`

<!-- intermediate -->
**Co-founder agreement** — Cover: equity split (equal or contribution-weighted), vesting (4yr/1yr cliff, monthly thereafter), role definitions and decision authority, IP assignment (all founders assign IP to company), non-compete/non-solicit, departure scenarios (voluntary, involuntary, death/disability), buyback provisions (fair market value or formula-based for vested, repurchase at cost for unvested). Standard approach: issue restricted stock subject to vesting + 83(b) election within 30 days. Use Clerky or a startup attorney.

> ~4 hours discussion + legal review | `references/cofounder-agreement-outline.md`

<!-- senior -->
**Co-founder agreement** — Restricted stock with 4yr/1yr cliff vesting. 83(b) election within 30 days. Cover: equity split, roles, decision framework, IP assignment, non-compete, departure terms, drag-along/tag-along, ROFR on secondary sales. Use Clerky templates or Orrick/Cooley standard forms. Single-trigger vs double-trigger acceleration for change of control.

> `references/cofounder-agreement-outline.md`

---

## IP Assignment

Reference: `references/ip-assignment-checklist.md`

### Secure IP assignment from every contributor

<!-- beginner -->
**Get IP assignment from everyone who touches your code** — If you do not have signed IP assignment agreements, you may not actually own the code in your product. This sounds dramatic, but it is true. By default, contractors own what they create. Even employees in some states have rights to inventions.

You need signed IP assignment agreements from:
- **Co-founders** — Covered in your co-founder agreement
- **Employees** — Include in the employment agreement (standard PIIA — Proprietary Information and Inventions Assignment)
- **Contractors/freelancers** — Must explicitly include work-for-hire and assignment of inventions clauses in the contract
- **Advisors** — If they contribute any IP, get assignment

**When to get it signed:** Before they write a single line of code or create any design. Not after. Before.

**What it covers:** All code, designs, inventions, trade secrets, and other intellectual property created for the company belong to the company.

> Time: 30 min to set up templates, then 5 min per new hire/contractor
> Cost: $500-1,000 for lawyer to create templates, then free to reuse
> Reference: See `references/ip-assignment-checklist.md`

<!-- intermediate -->
**IP assignment** — Every contributor (founders, employees, contractors, advisors) must sign IP assignment before starting work. Employees: PIIA (Proprietary Information and Inventions Assignment) as part of employment agreement. Contractors: work-for-hire clause + assignment of inventions + moral rights waiver in contractor agreement. Key difference: work-for-hire alone is insufficient for contractors — you need explicit assignment. Include prior inventions schedule to exclude personal projects. Open source contribution policy: contributions to upstream projects require approval.

> ~1 hour to set up templates | `references/ip-assignment-checklist.md`

<!-- senior -->
**IP assignment** — PIIA for employees, explicit assignment (not just work-for-hire) for contractors. Prior inventions schedule. Moral rights waiver where applicable. Open source contribution policy. Review state-specific carve-outs (CA Labor Code 2870). Ensure pre-incorporation IP is assigned via technology assignment agreement at formation.

> `references/ip-assignment-checklist.md`

---

## Domain Portfolio

### Secure your domain portfolio

<!-- beginner -->
**Buy your domains before someone else does** — Your domain is your business address on the internet. Here is what to secure:

1. **Primary .com domain** — This is non-negotiable for a serious business. If yourname.com is taken, consider a different name rather than settling for a weird TLD.
2. **Common misspellings** — Buy 2-3 obvious typos and redirect them to your main domain.
3. **Alternative TLDs** — At minimum grab .co, .io, and .dev if available. Redirect them all to your .com.
4. **Social media handles** — Check availability on X/Twitter, GitHub, LinkedIn, Instagram, and your primary platforms.

**Where to buy:** Cloudflare Registrar (at-cost pricing, no markup), Namecheap, or Google Domains (now Squarespace Domains). Avoid GoDaddy for anything beyond initial registration.

**Protect your domains:**
- Enable auto-renew on all domains
- Enable registrar lock (prevents unauthorized transfers)
- Use WHOIS privacy (usually free)
- Set up domain monitoring (dnstwist or PhishFort) to catch typosquatters

> Time: 30-60 min
> Cost: $10-15/yr per domain

<!-- intermediate -->
**Domain portfolio** — Primary .com + common misspellings + .co/.io/.dev redirects. Register via Cloudflare Registrar (at-cost pricing). Enable: auto-renew, registrar lock, WHOIS privacy, DNSSEC. Monitor typosquats with dnstwist (`dnstwist --registered yourdomain.com`). Set up Google Alerts for your brand name. Verify matching social handles on primary platforms before committing to a name.

> ~30 min

<!-- senior -->
**Domains** — .com + misspellings + alt TLDs via Cloudflare Registrar. DNSSEC, registrar lock, auto-renew. Typosquat monitoring (dnstwist, PhishFort). Consider domain brand protection service at scale. CAA DNS records to restrict certificate issuance.

---

## Trademark

### File your trademark

<!-- beginner -->
**Protect your brand name with a trademark** — A trademark protects your brand name and logo from being used by others. Without one, someone else could start using your name and there is not much you can do about it. Here is the process:

1. **Search first** — Go to USPTO TESS (Trademark Electronic Search System) at tess2.uspto.gov and search for your name. Also do a Google search. If someone is already using a similar name in a similar industry, pick a different name.

2. **Choose your classes** — For software/SaaS, you typically need:
   - **Class 9** — Downloadable software, mobile apps
   - **Class 42** — SaaS, cloud computing, software as a service
   - File for both if applicable. Each class is a separate filing.

3. **File your application** — File at USPTO.gov. Use TEAS Plus for the lowest filing fee.
   - **Cost:** $250-350 per class
   - **Timeline:** 8-12 months for approval (if no objections)
   - **You can use TM immediately** — You do not need to wait for registration to use the TM symbol. The (R) symbol is only for registered marks.

4. **Consider a trademark attorney** — Filing is straightforward, but a trademark attorney ($500-1,500) can help with the search, classification, and responding to office actions.

> Time: 2 hours for search, 1 hour to file
> Cost: $250-350/class filing + optional $500-1,500 attorney
> Timeline: 8-12 months

<!-- intermediate -->
**Trademark** — Search USPTO TESS + common law search (Google, state DBs, domain registrations). File TEAS Plus ($250/class) or TEAS Standard ($350/class). Software companies: Class 9 (downloadable software) + Class 42 (SaaS). File on intent-to-use (ITU) basis if not yet launched — converts to use-based after launch. Respond to office actions within 6 months. After registration: file Section 8 declaration (years 5-6), renew every 10 years. Monitor new filings via USPTO alerts.

> ~3 hours + 8-12 month wait

<!-- senior -->
**Trademark** — USPTO TESS + common law search. TEAS Plus ($250/class) for Class 9 + 42. ITU basis pre-launch. Madrid Protocol for international filings. Monitor via TSDR alerts + third-party watch services. Section 8 (yr 5-6), Section 9 renewal (yr 10). Consider design patent for distinctive UI elements.

---

## Business Insurance

### Get business insurance

<!-- beginner -->
**Get business insurance before you launch** — If someone sues you, insurance pays for your defense and any settlement. Without it, you are paying out of pocket. Here are the types you need:

| Insurance type | What it covers | Cost estimate | When you need it |
|----------------|---------------|---------------|------------------|
| **General Liability (GL)** | Third-party injury, property damage, advertising injury | $400-600/yr | Day 1 |
| **Errors & Omissions (E&O)** / Professional Liability | Claims that your software caused financial harm | $500-2,000/yr | Before first paying customer |
| **Cyber Liability** | Data breaches, ransomware, regulatory fines | $500-1,500/yr | If you store user data |
| **Directors & Officers (D&O)** | Personal liability of founders/board for company decisions | $1,000-5,000/yr | When you raise funding or form a board |

**Where to get it:**
- **Vouch** — Built for startups, fast online quotes
- **Embroker** — Tech-focused, competitive rates
- **Hiscox** — Good for small businesses
- **Hartford** — Traditional, reliable

Start with GL + E&O. Add cyber liability before handling user data. Add D&O before raising a round.

> Time: 1-2 hours to get quotes
> Cost: $1,000-4,000/yr for a basic startup package

<!-- intermediate -->
**Business insurance** — General Liability (GL, ~$500/yr), Errors & Omissions (E&O/Professional Liability, ~$1,000/yr), Cyber Liability (~$1,000/yr), D&O (after funding, ~$2,500/yr). Bundle through Vouch or Embroker for startup-friendly pricing. BOP (Business Owner's Policy) combines GL + property at discount. Review coverage annually and adjust as revenue and team size grow. Many enterprise contracts require proof of insurance (COI) with minimum limits.

> ~1 hour for quotes

<!-- senior -->
**Insurance** — GL + E&O + Cyber from day 1 via Vouch/Embroker. D&O at fundraise. BOP for bundle savings. Key person insurance if relevant. Review coverage limits against contract requirements (enterprise clients often require $1M+ per occurrence). Ensure cyber policy covers regulatory fines, breach notification costs, and business interruption.

---

## Master Checklist

| # | Item | Priority | Status |
|---|------|----------|--------|
| 1 | Choose and form business entity | P0 | |
| 2 | Apply for EIN | P0 | |
| 3 | Open business bank account | P0 | |
| 4 | Set up accounting software | P0 | |
| 5 | Execute co-founder agreement (if applicable) | P0 | |
| 6 | All contributors sign IP assignment | P0 | |
| 7 | Secure primary domain + misspellings | P0 | |
| 8 | Secure social media handles | P1 | |
| 9 | File trademark application | P1 | |
| 10 | Get GL + E&O insurance | P1 | |
| 11 | Set up domain monitoring | P2 | |
| 12 | Get cyber liability insurance | P1 | |
| 13 | Get D&O insurance (if funded) | P2 | |
| 14 | Set up monthly accounting close process | P1 | |

---

## Companion tools

- `rohitg00/awesome-claude-code-toolkit` -- `legal-advisor` agent
- `mcpmarket.com` -- `legal-advisor` skill
