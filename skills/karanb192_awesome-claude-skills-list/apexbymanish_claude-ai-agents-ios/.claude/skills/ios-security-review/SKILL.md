---
name: ios-security-review
description: Comprehensive security audit procedure for iOS/Swift code covering data storage, transport security, authentication, input validation, deep links, third-party SDKs, and entitlements. Use when asked for a security review, "is this secure", to check for vulnerabilities, or to audit authentication/authorization.
---

# iOS Security Review

Per `ios-evidence-reporting`'s "a pattern match is a lead, not a
finding" rule, every hit below is something to check, not a proven
exploit. This procedure is read-only reconnaissance; it produces
findings, not fixes.

## 1. Data storage & privacy

```bash
grep -rn "UserDefaults" --include="*.swift" . | grep -iE 'token|password|secret|credential|auth'
grep -rl "kSecClass\|SecItemAdd\|SecItemCopyMatching" --include="*.swift" . | wc -l   # Keychain usage at all?
grep -rn "NSFileProtectionType\|isExcludedFromBackup" --include="*.swift" .
grep -rn "UIPasteboard.general" --include="*.swift" .
```

Check for:
- Credentials/tokens/PII in `UserDefaults`, a plist, or unencrypted
  Core Data/SwiftData instead of the Keychain.
- Sensitive Keychain items using an appropriate accessibility class
  (e.g. `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` for
  high-sensitivity secrets, not the default).
- Sensitive files not excluded from iCloud/iTunes backup when they
  should be (`isExcludedFromBackup`).
- Sensitive data placed on the general `UIPasteboard` without an
  expiration or local-only option — it can be read by other apps.
- Sensitive screens (auth, payment) not redacted in the app switcher
  snapshot (no handling of `UIApplication.willResignActiveNotification`
  to blank the screen before backgrounding).

**Known false positives:** a `UserDefaults` key whose name coincidentally
contains "token"/"password" but stores a non-sensitive flag (e.g.
`hasSeenTokenOnboarding`, `passwordFieldFocused` as UI state) rather
than a credential value — read what's actually assigned, not just the
key name, before flagging it.

## 2. Transport security

```bash
grep -A5 "NSAppTransportSecurity" **/*.plist 2>/dev/null
grep -rn "NSAllowsArbitraryLoads\|NSExceptionAllowsInsecureHTTPLoads" **/*.plist 2>/dev/null
grep -rn "didReceive challenge" --include="*.swift" . -A8 | grep -i "useCredential\|performDefaultHandling"
grep -rn "http://" --include="*.swift" . | grep -v "localhost\|127.0.0.1"
```

Check for:
- ATS weakened globally (`NSAllowsArbitraryLoads: true`) rather than a
  scoped, justified per-domain exception.
- TLS certificate/server-trust validation bypassed
  (`URLSession(didReceive:completionHandler:)` unconditionally calling
  `.useCredential` for any host) — this defeats TLS entirely, not just
  weakens it.
- If the app implements certificate or public-key pinning, that this
  feature's networking path doesn't route around it.
- Sensitive data (tokens, PII) placed in a URL query string instead of
  a header or POST body — query strings end up in server logs, proxy
  logs, and browser/webview history.

**Known false positives:** `NSAllowsArbitraryLoads` set to `false` at
the top level with a scoped `NSExceptionDomains` entry for one known
test/staging host is a justified, narrow exception, not a blanket
weakening — read the surrounding plist keys, not just whether the
string appears. A `.useCredential` response inside `didReceive
challenge` for `NSURLAuthenticationMethodClientCertificate` (presenting
a client certificate for mutual TLS) is not the same finding as
`.useCredential` for `NSURLAuthenticationMethodServerTrust` (bypassing
server validation) — check which authentication method the challenge
handler is actually branching on before treating it as a TLS bypass.

## 3. Authentication & session management

```bash
grep -rln "LAContext\|LocalAuthentication" --include="*.swift" .
grep -rn "func logout\|func signOut" --include="*.swift" . -A15
```

Check for:
- Biometric auth (`LAContext`/Face ID/Touch ID) gating access to an
  actual secret (a Keychain item with an access-control policy) rather
  than just flipping an app-level boolean that any code path could
  bypass — a boolean gate protects nothing if the underlying data is
  reachable without it.
- Token/session expiry and refresh actually enforced, not stored and
  reused indefinitely.
- Logout actually clears stored tokens/session state (Keychain,
  in-memory, cookies) rather than only navigating to a login screen
  while the old session remains valid underneath.

## 4. Input validation & injection

```bash
grep -rn "WKWebView\|UIWebView" --include="*.swift" .
grep -rln "WKScriptMessageHandler" --include="*.swift" .
grep -rn "URL(string:.*\\\\(" --include="*.swift" .   # string-interpolated URLs
```

Check for:
- `UIWebView` (deprecated, no process isolation) instead of `WKWebView`.
- A WebView loading arbitrary or user-supplied URLs without a
  scheme/host allowlist.
- A JS-to-native bridge (`WKScriptMessageHandler`) exposing more native
  functionality than the loaded content needs.
- URLs or query strings built by string interpolation/concatenation of
  unescaped user input rather than `URLComponents`.
- Deserialized JSON/response data used without validating shape/types
  before acting on it — a malformed or unexpected response shouldn't
  corrupt app state or crash.

## 5. Deep links & URL schemes

```bash
grep -rn "CFBundleURLSchemes\|associatedDomains" **/*.plist **/*.entitlements 2>/dev/null
grep -rln "func application.*openURL\|onOpenURL" --include="*.swift" .
```

Check for:
- A custom URL scheme used for anything sensitive — any app can
  register the same scheme and intercept it; prefer Universal
  Links/associated domains for anything security-relevant.
- Incoming URL parameters used to trigger navigation or actions without
  validation — treat a deep link parameter with the same suspicion as
  network input, not as trusted internal state.
- Any sensitive action (login, payment, account change) reachable
  directly via an unauthenticated deep link.

## 6. Third-party SDKs & dependencies

```bash
find . -name "Podfile.lock" -o -name "Package.resolved"
grep -rln "Analytics\|Crashlytics\|FirebaseCrashlytics" --include="*.swift" .
```

Check for:
- Data handed to analytics/crash-reporting SDKs that includes PII,
  tokens, or other secrets (check what's passed to logging/tracking
  calls near the feature you're reviewing, not just that the SDK
  exists).
- Dependencies pinned to versions with known vulnerabilities, if a
  vulnerability database check is available in this environment.

## 7. Code-level hygiene

```bash
grep -rniE '(api[_-]?key|secret|password|token)\s*=\s*"' --include="*.swift" --include="*.m" --include="*.h" .
grep -rniE '(print|NSLog|os_log)\(.*\b(token|password|secret)\b' --include="*.swift" .
```

Check for:
- Hardcoded API keys/secrets in source rather than build-time injected
  config or a server-side proxy.
- Debug logging left in that would print request/response bodies,
  tokens, or PII — check whether it's gated out of release builds.

**Known false positives:** a match inside a `Tests`/`UITests` target
using an obviously fake value (`"test-api-key-123"`, `"fake-token"`) is
a test fixture, not a production secret — check the target membership
before flagging. An `enum` case declaration (`case token`, `case
secret`) is a type discriminator with no associated value, not an
assigned credential; only a `= "..."` assignment is a hit worth
reporting.

Jailbreak/tamper detection is a judgment call, not a default
recommendation: proportionate for an app handling high-value secrets
(banking, enterprise MDM-managed data), unnecessary overhead for most
apps. Say so explicitly rather than recommending it reflexively.

## 8. Entitlements & capabilities

```bash
find . -name "*.entitlements" -exec cat {} \;
```

Check for:
- Keychain access groups or App Groups shared more broadly than the
  feature actually requires.
- Requested capabilities/entitlements that don't match anything the
  code visibly uses — unused broad permissions are attack surface with
  no corresponding benefit.

## Reporting

Every finding names the file:line evidence and is phrased as something
to verify (e.g. "3 `UserDefaults` calls near `token` in
`AuthManager.swift:42-58` — verify these aren't the actual session
token, not just a non-sensitive flag"), never as a confirmed exploit
unless you've actually traced the data flow and confirmed it. Close
with the `ios-evidence-reporting` skill's status block (e.g. `STORAGE`,
`TRANSPORT`, `AUTH`, `INPUT-VALIDATION`, `DEEP-LINKS`, `DEPENDENCIES`,
`CODE-HYGIENE`, `ENTITLEMENTS`) — include only the categories that were
actually relevant to what you reviewed.
