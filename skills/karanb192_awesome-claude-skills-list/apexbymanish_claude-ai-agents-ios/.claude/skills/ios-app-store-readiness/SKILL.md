---
name: ios-app-store-readiness
description: App Store submission readiness checklist covering privacy manifests, export compliance, permission usage descriptions, App Tracking Transparency, Sign in with Apple parity, and common rejection triggers. Use when asked "is this ready to submit", "will this get rejected", or to check App Store compliance before release.
---

# iOS App Store Readiness

A pre-submission audit, not a guarantee — Apple's actual review process
has human judgment calls this can't predict. This procedure catches the
mechanical, code-visible reasons apps get rejected or delayed.

## 1. Privacy manifest

```bash
find . -name "PrivacyInfo.xcprivacy"
```

If present, check it against actual code:
- **Required-reason API usage** — APIs Apple requires a declared reason
  for (e.g. `UserDefaults`, file timestamp APIs, disk-space APIs,
  system-boot-time APIs) are declared in the manifest if the code
  actually calls them.
- **Collected data types** — types declared match what the code and its
  dependencies actually collect, and whether each is linked to the
  user's identity or used for tracking.
- **Third-party SDK manifests** — SDKs that ship their own privacy
  manifest are current; SDKs that collect data but ship none are a gap
  to flag.

If no `PrivacyInfo.xcprivacy` exists and the app uses any required-reason
API or third-party SDKs that collect data, flag this as a submission
blocker, not a nice-to-have.

## 2. Export compliance

```bash
grep -rn "ITSAppUsesNonExemptEncryption" **/*.plist 2>/dev/null
grep -rln "CommonCrypto\|CryptoKit\|SecKey" --include="*.swift" .
```

- Standard HTTPS/TLS usage is export-exempt; check whether the app also
  implements custom cryptography (`CommonCrypto`, `CryptoKit` beyond
  standard TLS, custom `SecKey` usage) that would need its own export
  compliance documentation, not just the standard exemption.
- `ITSAppUsesNonExemptEncryption` should be set to match reality — set
  to `false` when only using standard exempt encryption avoids an
  unnecessary compliance question at every submission.

## 3. Permission usage descriptions

```bash
grep -o 'NS[A-Za-z]*UsageDescription' **/*.plist 2>/dev/null
grep -rln "AVCaptureDevice\|CLLocationManager\|PHPhotoLibrary\|EventKit\|CNContactStore\|AVAudioSession.*record" --include="*.swift" .
```

Cross-reference: every permission-gated API actually used in code
(camera, location, photos, contacts, calendar, microphone, etc.) needs
a matching `NS*UsageDescription` string in Info.plist, **and** that
string should explain *why* the app needs it, not just restate the
permission name — "This app uses your location" gets rejected far more
often than "Used to show restaurants near you." Flag both a missing
description string and a present-but-generic one.

## 4. App Tracking Transparency

```bash
grep -rln "AppTrackingTransparency\|ATTrackingManager\|AdSupport" --include="*.swift" .
grep "NSUserTrackingUsageDescription" **/*.plist 2>/dev/null
```

If the app uses IDFA or any tracking-adjacent API, it needs
`NSUserTrackingUsageDescription` and must show the ATT prompt
(`ATTrackingManager.requestTrackingAuthorization`) before tracking
actually begins, not after.

## 5. Sign in with Apple parity

```bash
grep -rln "GIDSignIn\|FBSDKLoginKit\|GoogleSignIn" --include="*.swift" .
grep -rln "ASAuthorizationAppleIDProvider\|SignInWithAppleButton" --include="*.swift" .
```

If the app offers a third-party social login (Google, Facebook, etc.)
as a primary sign-in option, Apple requires offering Sign in with Apple
as an equivalent option. This is one of the most common non-obvious
rejection reasons — flag it explicitly if a third-party login is found
without a corresponding Sign in with Apple implementation.

## 6. Unused entitlements & background modes

```bash
find . -name "*.entitlements" -exec cat {} \;
grep -A10 "UIBackgroundModes" **/*.plist 2>/dev/null
```

A requested capability or background mode with no corresponding code
usage is both an unnecessary rejection risk and unnecessary attack
surface (see `ios-security-review` for the security angle on this same
check — don't duplicate that audit here, just flag the App Store risk).

## 7. Common code-level rejection triggers

- Placeholder or "Lorem ipsum" text/images left in shipped UI.
- Obvious crash-on-launch conditions (force-unwraps on data that could
  be missing at first launch, e.g. a nil server response).
- Broken or `http://`-only links to external content (also flagged in
  `ios-security-review`'s transport-security check).
- Any in-app purchase or subscription code that doesn't go through
  StoreKit (App Store rules require IAP for digital goods/services).

## Reporting

Close with the `ios-evidence-reporting` skill's status block (e.g.
`PRIVACY-MANIFEST`, `EXPORT-COMPLIANCE`, `PERMISSIONS`, `ATT`,
`SIGN-IN-PARITY`, `ENTITLEMENTS`) — only categories actually relevant to
what was reviewed, each backed by the file:line evidence or command
output already shown above. This is a code-visible audit only —
metadata, screenshots, and app description content need a human's
review in App Store Connect and are out of scope here.
