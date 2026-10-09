---
name: ios-testing-strategy
description: Step-by-step procedure for adding tests to existing Swift/iOS code, whether untested legacy code or new TDD work. Use when asked to "add test coverage", "write tests for this", "make this testable", or when starting TDD on new Swift code.
---

# iOS Testing Strategy

A concrete procedure, not just principles. Follow these steps in order.

## 1. Identify the seams

Before writing a single test, find (or create) the seams that let you
substitute real dependencies with test doubles:

- Networking, persistence (Core Data/SwiftData contexts), date/time,
  and any singleton (`.shared`) are the usual suspects.
- If the code under test reaches a singleton directly, introduce a
  protocol and inject it — don't test through the singleton.

```swift
protocol UserRepository {
    func fetchUser(id: String) async throws -> User
}

final class LiveUserRepository: UserRepository { /* real network call */ }

final class ProfileViewModel {
    private let repository: UserRepository
    init(repository: UserRepository) { self.repository = repository }
}
```

If the class under test currently hardcodes `LiveUserRepository()`
internally, that's the first fix: add the initializer parameter above
(default it to the live implementation so call sites don't all need to
change at once).

## 2. Write a test double, not a framework

A hand-written struct/class conforming to the protocol is almost always
enough. Reach for a mocking library only if the project already has one.

```swift
final class StubUserRepository: UserRepository {
    var result: Result<User, Error> = .success(.mock)
    func fetchUser(id: String) async throws -> User { try result.get() }
}
```

## 3. Write the test against behavior, not implementation

Assert on outputs and observable state changes, not on which private
methods got called.

```swift
@Test func profileLoadShowsFetchedUserName() async throws {
    let repository = StubUserRepository()
    repository.result = .success(User(id: "1", name: "Ada"))
    let viewModel = ProfileViewModel(repository: repository)

    await viewModel.load(id: "1")

    #expect(viewModel.displayName == "Ada")
}
```

Use Swift Testing (`@Test`, `#expect`) for new code in projects on Swift
5.10+ / Xcode 16+. Use XCTest for projects that haven't adopted Swift
Testing yet — check the existing test target before picking one; don't
mix frameworks in the same target without a reason.

## 4. Verify red before green

Before implementing the fix/feature, run the test and confirm it fails
for the *expected* reason (not a compile error, not a setup bug):

Run: `xcodebuild test -scheme <Scheme> -destination 'platform=iOS Simulator,name=iPhone 16' -only-testing:<Target>/<TestClass>/<testName>`

Then implement the minimal code to pass, and re-run the same command to
confirm green.

## 5. Prioritize by risk, not by percentage

Coverage percentage is a lagging indicator. Prioritize, in order:

1. Business logic with branching (pricing, eligibility, state machines).
2. Anything that has broken in production before.
3. Public API of a module other code depends on.
4. Pure UI layout code is usually not worth unit testing — that's what
   `ios-ui-test-engineer` and snapshot tests are for.

## 6. What NOT to test

- Don't test that a SwiftUI `View`'s `body` produces particular view
  types — that's an implementation detail and breaks on every refactor.
- Don't test third-party framework behavior (e.g. that `URLSession`
  actually makes a network call) — test that *your code* calls it
  correctly, via the seam from step 1.
- Don't write a test for a private method by making it internal/public
  just to reach it — test through the public behavior that uses it.
