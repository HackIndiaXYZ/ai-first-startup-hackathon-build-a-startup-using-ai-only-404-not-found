---
name: seo-translator
description: Use when the user asks to translate or localize content — documents, blog posts, marketing copy, website pages, UI strings — into one or more languages, or requests SEO-aware translation for international markets. Handles single texts and batches; detects SEO intent (titles, meta descriptions, keywords) automatically and preserves search-optimized phrasing per target market. Do not trigger for programming-language "translation" or for interpreting spoken conversation.
---

# SEO Translator

Battle-tested translation methodology from the SkillProof localization pipeline — the same rules
used to localize 4,500+ pages into 10 languages. Produces native-sounding text, keeps SEO value,
and burns as few tokens as possible.

## Step 1 — classify the job (silently, before translating)

- **SEO content** (page titles, meta descriptions, headings, blog posts, landing pages):
  keywords must survive translation in the form people actually SEARCH in the target market —
  not the literal dictionary form. "Claude skills installieren", not "Fähigkeiten installieren".
- **Marketing copy**: register and idiom matter more than word fidelity. Translate the intent.
- **Technical/UI**: consistency and precision. Build a mini-glossary first if strings repeat.

If the source has `<title>`, meta descriptions, H1/H2 markdown, or the user mentions SEO/search —
treat as SEO content without asking.

## Step 2 — register per market (defaults that professionals use)

| Language | Register | Like |
|---|---|---|
| German | informal "du" for dev/consumer tools, "Sie" for finance/legal | Linear, Stripe DE |
| French | professional "vous" | Stripe FR |
| Spanish, Italian, Portuguese | informal "tú"/informal | Notion ES |
| Dutch, Swedish, Danish, Norwegian | informal "je"/"du" — standard in tech | — |
| Czech, Polish | polite "vy"/neutral informal for dev tools | local SaaS |
| Japanese | です/ます form unless told otherwise | — |

Ask only if the domain makes the default risky (medical, legal, government).

## Step 3 — translate with these hard rules

1. **Never translate**: product names, brand names, code blocks, commands, file paths, URLs,
   email addresses, placeholders like `{n}` or `%s`, established tech terms the market keeps in
   English (commit, deploy, frontmatter, prompt).
2. **SEO fields respect limits**: titles ≤60 chars, meta descriptions ≤155 chars — rewrite to fit,
   don't truncate mid-thought.
3. **Keywords**: identify the 1-3 target keywords in the source (or ask if ambiguous). Render each
   as the target market searches it — check: would a native type this into Google? Keep keyword in
   title and first paragraph, as in the source.
4. **Numbers, scores, dates**: unchanged. Localize only formats (1,000 → 1 000 where native).
5. **Links**: URLs untouched; anchor text translated.
6. **Structure**: markdown/HTML structure survives exactly — same headings, same tables, same
   emphasis. If the source has a CTA block, translate only its visible text.

## Step 4 — the anti-AI pass (mandatory)

Translated text fails if it reads like machine output. After drafting, re-read and fix:
- calques from the source language (word order copied, not natural)
- AI-tell vocabulary in the target language (the local equivalents of "delve", "crucial",
  "landscape", "seamless")
- uniform sentence length — vary it the way natives write
- literal idioms — replace with the target market's own idiom or drop
- title case in languages that use sentence case (most European languages)

One question per text: "would a native copywriter sign this?" If not, redo the failing sentence.

## Step 5 — token discipline

- Translate in ONE pass; don't restate or summarize the source first.
- For batches: process sequentially in one response, no per-item preamble.
- Output ONLY the translation (plus a one-line note if a decision needs flagging).
  No "Here is your translation".
- For repeated strings across a batch, translate once and reuse verbatim.

## Output format

Single text → the translation, nothing else.
Multiple languages → one `## <lang>` section per language.
Batch of files/strings → same keys/structure as input (JSON in → JSON out, valid).

## Do not

- Add translator notes unless a real ambiguity forced a choice
- "Improve" the source content beyond translation (unless asked)
- Translate quoted user testimonials' names or company names
- Trigger for code refactoring or spoken-language interpretation requests
