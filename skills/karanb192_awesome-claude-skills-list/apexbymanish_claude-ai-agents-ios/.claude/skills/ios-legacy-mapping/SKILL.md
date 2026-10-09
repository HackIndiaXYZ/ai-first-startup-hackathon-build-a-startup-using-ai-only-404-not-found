---
name: ios-legacy-mapping
description: Step-by-step procedure for mapping an undocumented, unfamiliar, or large legacy iOS codebase (Objective-C, UIKit, SwiftUI, or a mix) before making changes. Use when onboarding onto a project with no CLAUDE.md, no architecture docs, or when asked to "explore this codebase" or "figure out how this app is structured".
---

# iOS Legacy Codebase Mapping

A read-only reconnaissance procedure. Do not modify code while running
this — the output is a document, not a refactor.

## 1. Inventory targets and schemes

```bash
find . -name "*.xcodeproj" -o -name "*.xcworkspace"
xcodebuild -list -project <Project>.xcodeproj   # or -workspace
```

Note every target (app, extensions, frameworks, test targets) and which
scheme builds what. A large app often has more targets than the obvious
main one (share extensions, widgets, watch app).

## 2. Detect the architecture actually in use — don't assume

Codebases rarely match what their README claims (if they have one at
all). Grep for signal, don't guess:

```bash
# Massive View Controller smell
grep -rlZ "class.*ViewController" --include="*.swift" --include="*.m" . \
  | xargs -0 wc -l | sort -rn | head -20

# Singleton usage density
grep -rn "\.shared\b" --include="*.swift" . | wc -l

# Delegate pattern density (common in older UIKit code)
grep -rn "Delegate" --include="*.swift" --include="*.h" . | wc -l

# MVVM signal
grep -rl "ViewModel" --include="*.swift" . | wc -l
```

A file count over ~400-500 lines for view controllers, high singleton
density, and low ViewModel presence together indicate a Massive View
Controller / MVC-in-name-only codebase regardless of what any doc claims.

**Known false positives:** a large view-controller file that's mostly
generated or boilerplate (Interface Builder outlet dumps, generated
model/mapping code) isn't the same finding as a large hand-maintained
one — open the file rather than trusting the line count alone. Raw
`.shared` count includes standard Apple singletons (`UIApplication.shared`,
`URLSession.shared`, `FileManager.default`) that are normal API usage,
not an app-specific anti-pattern — the density signal is about
*app-defined* singletons; skim a sample of hits to see which kind
dominates before citing the raw count as evidence of over-reliance.
Delegate-density hits include standard UIKit protocol conformance
(`UITableViewDelegate`, `UICollectionViewDelegate`) alongside any
custom delegate protocols substituting for real architecture — only
the latter is the smell.

## 3. Flag Objective-C ↔ Swift bridging points

```bash
find . -name "*-Bridging-Header.h"
find . -name "*.h" -o -name "*.m" | wc -l   # Obj-C surface area
grep -rl "@objc" --include="*.swift" . | head -20
```

For each bridging header found, read it and note which Obj-C types are
exposed to Swift — these are the highest-risk edit points (changes on
either side can silently break the other without a compiler error on
both sides in mixed-language files).

## 4. Flag security-relevant patterns

```bash
# Hardcoded secrets/keys in source
grep -rniE '(api[_-]?key|secret|password|token)\s*=\s*"' --include="*.swift" --include="*.m" --include="*.h" .

# Credentials/tokens stored insecurely (UserDefaults instead of Keychain)
grep -rniE 'UserDefaults' --include="*.swift" . | grep -iE 'token|password|secret|credential'

# Is there a Keychain wrapper at all?
grep -rl "kSecClass\|SecItemAdd\|SecItemCopyMatching" --include="*.swift" . | wc -l

# App Transport Security weakened
grep -A5 "NSAppTransportSecurity" **/*.plist 2>/dev/null

# TLS/certificate validation bypassed
grep -rn "didReceive challenge" --include="*.swift" . -A5 | grep -i "useCredential\|performDefaultHandling"

# Sensitive data reaching logs
grep -rniE '(print|NSLog|os_log)\(.*\b(token|password|secret)\b' --include="*.swift" .
```

Per `ios-evidence-reporting`'s "a pattern match is a lead, not a
finding" rule, a hit on any of these is a lead to verify, not proof.
The absence of any Keychain usage combined with `UserDefaults` calls
near "token" or "password" is a strong signal worth verifying, even
though neither half alone confirms insecure storage.

**Known false positive:** zero hits on raw `kSecClass`/`SecItemAdd`
doesn't mean zero Keychain usage — a project using a third-party
Keychain wrapper (e.g. KeychainAccess, KeychainSwift) calls the
wrapper's API, not the raw Security framework calls this grep looks
for. Check `Package.resolved`/`Podfile.lock` for a Keychain-wrapper
dependency before concluding credentials aren't in the Keychain at all.

## 5. Map module and dependency boundaries

```bash
find . -name "Package.swift"
find . -name "Podfile"
find . -name "*.podspec"
```

Note whether the app is a single monolithic target, uses local SPM
packages, or uses CocoaPods/Carthage — this determines how safely code
can be moved or extracted later.

## 6. Produce the summary document

Write findings as a `CLAUDE.md`-ready summary with these sections:

```markdown
## Codebase Summary (generated)

- **Targets:** [list from step 1]
- **Architecture actually in use:** [finding from step 2, with evidence:
  "42 view controllers over 500 lines, 180 `.shared` references,
  6 files referencing ViewModel" — not just a label]
- **Legacy Objective-C surface:** [bridging headers found, approximate
  `.m`/`.h` file count, riskiest bridging points]
- **Module structure:** [monolith / SPM packages / CocoaPods, and which]
- **Security signals:** [hits from step 4, each labeled "verify" not
  "confirmed" — e.g. "no Keychain usage found; 3 UserDefaults calls
  near 'token' in AuthManager.swift — recommend verifying token storage"]
- **Suggested entry points for new work:** [the most decoupled, best-
  tested area to build on, if one exists]
```

Hand this to the user as the seed for their project's own `CLAUDE.md` —
don't silently create or overwrite one without being asked.
