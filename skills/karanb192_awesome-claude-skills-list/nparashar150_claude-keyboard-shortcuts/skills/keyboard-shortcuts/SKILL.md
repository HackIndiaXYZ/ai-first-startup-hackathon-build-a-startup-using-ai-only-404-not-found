---
name: keyboard-shortcuts
description: "Audit a web app for missing keyboard shortcuts and implement them end to end: a command registry, context-scoped bindings, a command palette, visible kbd hints, a ? help sheet, invariant tests, and WCAG 2.1.4 compliance. Use whenever the user mentions keyboard shortcuts, hotkeys, keybindings, a command palette, Cmd+K, power-user features, or making an app feel fast, and also when building or reviewing any list, table, modal, form, or editor UI where shortcuts and keyboard access obviously belong even if the user never says the word shortcut."
---

# Keyboard shortcuts: audit and implement

Most codebases arrive at shortcuts the same way: a `useEffect` with `addEventListener('keydown')` in one component, another in a modal, a `cmdk` palette somebody wired up for search, and a `Cmd+S` handler that fights the browser. The keys nobody documented stop working when a text field has focus, and no two of them agree on what counts as "focused".

The job here is not to add more listeners. It is to find what is missing, separate the genuine defects from the nice-to-haves, and replace the scattered handlers with one small system where bindings are data and discoverability falls out for free.

Work in phases. Do not skip the audit and go straight to code: the value of this skill is mostly in deciding what deserves a key, and a keymap invented without reading the app will be wrong.

## Phase 0: scope the app before auditing it

Two questions decide the size of everything that follows.

**Is this a keyboard-relevant surface at all?** A marketing site, a CLI, a backend service, or a docs build gets Phase 1 Tier 0 only (keyboard access is still a legal and usability requirement) and nothing else. Say so and stop rather than bolting a command palette onto a landing page.

**What shape is the app?** This picks the interaction model, and getting it wrong is the most common failure:

| App shape | Model | Real examples |
|---|---|---|
| Lists of objects the user acts on (issues, emails, rows, records) | Bare letters plus prefix sequences | Linear, Superhuman, Gmail, GitHub |
| A document or text editor | No bare letters at all. Typed triggers (`/`, `@`, `[[`, markdown autoformat) plus modifier chords | Notion |
| A canvas, board, or IDE-like tool | Bare letters for tools (canvas focus is not text focus) plus heavy chords | Figma, VS Code |
| Forms, dashboards, settings, content | Tier 0 and Tier 1 only. No bare letters. | Most CRUD apps |

All four converge on `Mod+K` for the palette, and all four then overload `Mod+K` to "insert link" inside a text field. Plan for that overload from the start.

Record the answer. Everything downstream refers back to it.

## Phase 1: audit

### Find what exists

Run these against the repo (adjust globs to the stack). The first one matters most: existing ad-hoc listeners are what you are going to consolidate and delete.

```bash
# Ad-hoc key handling: the thing to replace
rg -n "addEventListener\(['\"]keydown|onKeyDown|useHotkeys|tinykeys|hotkeys\(|Mousetrap" -g '!node_modules'
# Existing palette / kbd / a11y annotations: extend these, do not duplicate them
rg -n "cmdk|CommandDialog|kbar|CommandPalette|<kbd|aria-keyshortcuts"
# Modals, dialogs, drawers, popovers
rg -n "role=[\"']dialog|<Dialog|<Modal|<Sheet|<Drawer|<Popover"
# Lists, tables, grids, menus
rg -n "role=[\"'](grid|listbox|menu|table)|<table|<DataTable|<Virtuoso" -g '*.tsx'
# Forms and submits
rg -n "<form|onSubmit|handleSubmit"
# Search inputs
rg -n "type=[\"']search|placeholder=[\"'][^\"']*[Ss]earch"
# Destructive actions: each one needs undo or keyboard-reachable confirm
rg -n "delete|archive|remove|destroy|revoke" -g '*.ts*' -l
# Editors: the Mod+K overload zone
rg -n "contentEditable|@tiptap|ProseMirror|lexical|slate|CodeMirror|monaco"
# Mouse-only handlers: an accessibility defect and a shortcut gap at once
rg -n "onClick" -g '*.tsx' | rg -v "<button|<a |role=|onKeyDown"
```

### Classify every gap into one of four tiers

**Tier 0, must. Report these as bugs, not as features.** They are correctness and accessibility defects, and framing them as enhancements is how they stay unfixed.

| Surface | Required | Why it is a defect without it |
|---|---|---|
| Modal, dialog, drawer, popover | `Escape` closes it, focus moves inside on open, focus returns to the trigger on close, `Tab` stays trapped inside | WCAG 2.1.2 No Keyboard Trap and 2.4.3 Focus Order. A keyboard user is stranded. |
| Any list, grid, menu, or combobox the mouse can traverse | Arrow keys move, `Enter` activates, `Home`/`End` jump, `Escape` exits | WCAG 2.1.1 Keyboard. Mouse-only traversal is a hard failure. |
| Every form | `Enter` submits single-line forms, `Mod+Enter` submits multi-line ones | The user cannot finish the task without a mouse. |
| Every destructive action | Undo, or a confirm that the keyboard can reach and dismiss | A key that destroys data with no way back is worse than no key. |
| `onClick` on a div, span, or styled non-button | `onKeyDown` for `Enter` and `Space`, plus `tabIndex` and a `role` | WCAG 2.1.1 again. Extremely common in React codebases and usually the largest single finding. |
| Primary search | Reachable in one keystroke (`/` or `Mod+K`) | |

**Tier 1, should. Ordered by value per unit of effort.** These are what make an app feel fast.

`Mod+K` palette · `?` help sheet · `Escape` dismisses anything transient · `Mod+Enter` submit · `Mod+Z` / `Mod+Shift+Z` undo and redo · `Mod+S` with a "Saved" toast even when the app autosaves (intercepting it is mostly about stopping the browser's Save Page dialog and reassuring the user, which is why Figma and Notion both do it) · `/` focuses search · arrows plus `Enter` in every result list.

**Tier 2, could. Only for the list-shaped model from Phase 0.**

`J`/`K` move · `G` then a letter to go somewhere (`G I` inbox) · bare letters acting on the focused row (`E` archive, `A` assignee, `X` select) · `Shift+click` range select · `Mod+1..9` switch views · `Mod+\` sidebar · `Mod+[` and `Mod+]` history · copy-the-thing shortcuts, which are quietly high value (Linear has separate keys for copy ID, copy URL, and copy git branch name).

**Never bind.** `Mod+W`, `Mod+T`, `Mod+N`, `Mod+Q`, `Mod+L`, `Mod+Shift+N`, `Mod+Shift+T`. Firefox removed `Ctrl+N`/`T`/`W` from script control and closed it WONTFIX, so some of these cannot be intercepted at all. Also never: a bare letter for a destructive action without undo, a shortcut for something a user does once a month, and `Mod+F` unless you are shipping an in-app find that genuinely beats the browser's.

### How much is enough

A skill like this fails in two directions. Under-applying leaves Tier 0 defects in place. Over-applying puts forty bindings into a settings page nobody navigates by keyboard. The tier system is the guard: Tier 0 is unconditional, Tier 1 is near-unconditional for any app with a logged-in workflow, and Tier 2 needs the app to actually be list-shaped. If you find yourself adding `J`/`K` to a billing settings form, go back to Phase 0.

### Report before you build

Write the audit to `docs/keyboard-audit.md` and show the user the summary. Use this shape:

```markdown
# Keyboard audit

App shape: <one of the four models, and why>
Existing key handling: <N ad-hoc listeners across M files, list them>

## Tier 0: defects (N)
| # | Surface | File:line | Missing | Standard |

## Tier 1: recommended (N)
| # | Binding | Command | Scope | File(s) affected |

## Tier 2: considered and declined
<what you are not adding, and why. This matters as much as what you are adding.>

## Conflict map
| Key | Meaning in scope A | Meaning in scope B | Resolution |

## Proposed keymap
<the full table, as it will appear in the code>
```

Then stop and get agreement on the keymap. Bindings are muscle memory and changing them later is expensive, so a five-minute review now is cheap. If the user has already said to just do it, proceed straight to Phase 2 but still write the report, since it is the document the help sheet and the PR description come from.

## Phase 2: build the spine

Commands and keys are separate things. The registry holds commands; the keymap maps keys to command **ids**, never to functions. Do this and the palette, the help sheet, the tooltips, user remapping, and telemetry all become views over one data structure. Skip it and the palette and the keymap drift apart within a month, which is the single most common way this work rots.

This is the model VS Code uses (`key`, `command`, `when`, resolved last-match-wins so user overrides appended at the end beat defaults). Build it directly rather than reaching for a framework.

Create these files under `src/keyboard/` (match the repo's own conventions for location and style):

### `context.ts` — the observable map that scopes everything

```ts
export type Ctx = Record<string, unknown>
const ctx: Ctx = {}
const subs = new Set<() => void>()

export const getContext = () => ctx
export const subscribe = (fn: () => void) => (subs.add(fn), () => void subs.delete(fn))
export function setContext(key: string, value: unknown) {
  if (ctx[key] === value) return
  ctx[key] = value
  subs.forEach(fn => fn())
}

export const isTextEntry = (t: EventTarget | null) =>
  t instanceof HTMLElement &&
  (t.isContentEditable ||
    !!t.closest('input, textarea, select, [contenteditable], [role="textbox"]'))

// Publish focus shape once, globally, so no binding ever has to ask the DOM itself.
document.addEventListener('focusin', e => setContext('textFieldFocus', isTextEntry(e.target)))
```

The keys worth publishing, borrowed from VS Code's built-ins: `textFieldFocus`, `editorFocus`, `hasSelection`, `listFocus`, `focusedId`, `modalOpen`, `paletteOpen`, `formFocus`, `isMac`. Components set them; bindings read them. Add a dev-only panel that dumps the map, because debugging a shortcut that silently does not fire is otherwise miserable (VS Code ships "Inspect Context Keys" for exactly this reason).

### `commands.ts` — the registry

```ts
import type { Ctx } from './context'

export type Command = {
  id: string
  title: string          // shown in the palette and help sheet: phrase it the way a user would search
  group: string           // help-sheet section
  aliases?: string[]      // so "archive" finds "Mark as done"
  when?: (c: Ctx) => boolean   // availability, independent of any key
  run: () => void | Promise<void>
}

export const commands: Record<string, Command> = {}
export const register = (c: Command) => void (commands[c.id] = c)
```

### `keymap.ts` — bindings as data

```ts
import type { Ctx } from './context'

export type Binding = { key: string; command: string; when?: (c: Ctx) => boolean }

const typing = (c: Ctx) => !!c.textFieldFocus
const row = (c: Ctx) => !!c.listFocus && !!c.focusedId

export const keymap: Binding[] = [
  { key: 'Mod+K',     command: 'palette.open',   when: c => !c.editorFocus },
  { key: 'Mod+K',     command: 'editor.link',    when: c => !!c.editorFocus && !!c.hasSelection },
  { key: 'Mod+Alt+K', command: 'palette.open',   when: c => !!c.editorFocus }, // escape hatch, as GitHub does
  { key: 'Escape',    command: 'ui.dismiss',     when: c => !!c.modalOpen || !!c.paletteOpen },
  { key: 'Mod+Enter', command: 'form.submit',    when: c => !!c.formFocus },
  { key: '?',         command: 'help.shortcuts', when: c => !typing(c) },
  { key: '/',         command: 'search.focus',   when: c => !typing(c) },
  { key: 'E',         command: 'item.archive',   when: row },
  { key: 'G I',       command: 'goto.inbox',     when: c => !typing(c) },  // space separates a sequence
]
```

A string expression language like VS Code's `when` clauses only pays off if users edit bindings as persisted JSON. For a typed codebase, predicates are simpler, type-safe, and refactor cleanly. Reach for strings only when user-editable remapping is an actual requirement.

### `resolve.ts` — one listener, matched against `event.key`

```ts
import { commands } from './commands'
import { keymap } from './keymap'
import { getContext, isTextEntry } from './context'

const SEQ_TIMEOUT = 1000
const MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock'])
let seq: string[] = []
let timer: ReturnType<typeof setTimeout> | undefined
const clear = () => { seq = []; clearTimeout(timer) }

// navigator.userAgentData is Chromium-only (no Safari, no Firefox), so fall back the way
// shipping libraries actually do. Expose it as context so tests can swap it.
export const isMac = /mac|iphone|ipad|ipod/i.test(
  (navigator as any).userAgentData?.platform ?? navigator.platform ?? navigator.userAgent,
)

/**
 * Describe an event as a binding string. Uses event.key, never event.code: code is a
 * physical position, so "KeyQ" is the ' key on Dvorak and A on AZERTY.
 * Shift joins the token only for letters and named keys. For digits and punctuation Shift
 * has already changed event.key (Shift+2 is "@"), so bind the produced character instead:
 * write '?' and not 'Shift+/'.
 */
export function describe(e: KeyboardEvent): string {
  const mod = isMac ? e.metaKey : e.ctrlKey
  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key
  const shiftable = e.key.length > 1 || /[a-z]/i.test(e.key)
  return [mod && 'Mod', e.altKey && 'Alt', e.shiftKey && shiftable && 'Shift', key]
    .filter(Boolean).join('+')
}

const live = (b: Binding) => !b.when || b.when(getContext())

export function handleKeyDown(e: KeyboardEvent) {
  // A keydown during IME composition carries candidate-selection intent, not command
  // intent. Without this guard, Enter and arrows hijack the CJK candidate window.
  if (e.isComposing || e.repeat || MODIFIERS.has(e.key)) return

  const token = describe(e)
  const bare = !e.metaKey && !e.ctrlKey && !e.altKey
  if (bare && e.key !== 'Escape' && isTextEntry(e.target)) return

  for (const attempt of seq.length ? [[...seq, token].join(' '), token] : [token]) {
    // Iterate backwards: last match wins, so overrides appended to keymap beat defaults.
    for (let i = keymap.length - 1; i >= 0; i--) {
      const b = keymap[i]
      if (b.key !== attempt || !live(b)) continue
      e.preventDefault()          // only after a real match, never speculatively
      clear()
      void commands[b.command].run()
      return
    }
  }

  // No match yet. If this could still open a sequence, buffer it.
  const prefix = [...seq, token].join(' ') + ' '
  if (keymap.some(b => b.key.startsWith(prefix) && live(b))) {
    e.preventDefault()
    clearTimeout(timer)
    seq = [...seq, token]
    timer = setTimeout(clear, SEQ_TIMEOUT)
    return
  }
  clear()
}
```

Attach it once, at the document level, in an app-root effect. Never per component.

If you would rather not own the matcher, `tinykeys` is the primitive to reach for: no dependencies, about 1 KB, matches `event.key` with a `code` fallback, and the only mainstream library that guards `event.isComposing` and `event.repeat`. Check its current state before pinning. Two things to know before adopting alternatives: `react-hotkeys-hook` defaults to matching the physical key **code**, so `ctrl+s` binds the S *position* and moves on AZERTY and Dvorak, and `mousetrap` and `react-hotkeys` have been unmaintained since 2020 and 2019 and match on the unspecified `keyCode`. `cmdk` and `kbar` are palette UI, not keybinding layers; cmdk's own README tells you to bind `Cmd+K` yourself. Whatever you pick, the registry and context store above stay yours.

### `Kbd.tsx` — the visible hint

A shortcut nobody can see is dead code, so this component is not decoration. It is how the rest of the work becomes discoverable.

```tsx
const TOKENS: Record<string, [mac: string, other: string]> = {
  Mod: ['⌘', 'Ctrl'], Alt: ['⌥', 'Alt'], Shift: ['⇧', 'Shift'],
  Enter: ['↵', 'Enter'], Escape: ['esc', 'Esc'],
}

export function Kbd({ binding }: { binding: string }) {
  const mac = useIsMac()
  // A space in the binding is a sequence, so render it as separate keys with "then".
  return (
    <span className="inline-flex items-center gap-1">
      {binding.split(' ').map((chord, i) => (
        <span key={i} className="inline-flex items-center gap-1">
          {i > 0 && <span className="text-xs opacity-60">then</span>}
          <kbd className="rounded border px-1.5 py-0.5 text-xs font-medium tabular-nums">
            {chord.split('+').map(t => TOKENS[t]?.[mac ? 0 : 1] ?? t).join(mac ? '' : '+')}
          </kbd>
        </span>
      ))}
    </span>
  )
}
```

On a server-rendered app (Next.js and friends), platform is unknowable during SSR. Have `useIsMac` return `false` on the server and correct it in an effect, so the markup matches on hydration and only the label changes. Do not read `navigator` during render.

### The palette and the help sheet are views, not features

The palette renders `Object.values(commands)` filtered by each command's `when`, with `<Kbd>` right-aligned from a reverse lookup of `keymap` by command id. The help sheet renders `keymap` grouped by `commands[b.command].group`. Both come from the same data, which is the whole point of Phase 2, and it means a new command shows up in both places with no extra work.

Two details worth copying from teams who wrote up their palettes. Superhuman scores the command title *and* its aliases, takes the higher score, multiplies by a per-context weight, and renders "Title (Matching Alias)" so the palette teaches the app's vocabulary. Retool shows the active scope as deletable pills and keeps the palette open on the first `Enter` so actions can be chained, committing on the second.

## Phase 3: migrate the surfaces

Go file by file through the Phase 1 report.

1. **Delete the ad-hoc listeners** as you replace them. Leaving them in place means two systems fighting over `preventDefault`, which produces bugs that look random. This is the step most likely to be skipped, so check it off explicitly.
2. **Publish context from the components that own it.** Lists set `listFocus` and `focusedId`, modals set `modalOpen`, editors set `editorFocus` and `hasSelection`. Every Tier 2 bare letter depends on this, and it is also the cheapest accessibility route (see Phase 4).
3. **Fix Tier 0 in the primitives, not the instances.** If there are thirty dialogs, the `Escape`, focus trap, and focus-return fix belongs in the one `Dialog` component. Prefer the repo's existing primitive library (Radix, React Aria, and HeadlessUI already handle focus scope and return correctly) over a hand-rolled trap.
4. **Register commands next to the features they belong to**, not in one giant file, so a feature deleted later takes its command with it.
5. **Wrap destructive commands in undo** as you register them, rather than adding confirm dialogs. Linear deletes an issue on `Mod+Delete` and relies on `Mod+Z`, which is both faster and safer than a modal people learn to dismiss without reading.

## Phase 4: accessibility, which is not optional here

WCAG 2.1 SC 2.1.4 Character Key Shortcuts is **Level A**. If any binding is a bare letter, number, punctuation, or symbol with no modifier, at least one of these must be true: it can be turned off, it can be remapped to include a modifier, or it is active only while the relevant component has focus.

The third is free if Phase 3 step 2 was done properly, since every bare letter is already gated on `listFocus`. Ship the first as well: a single setting that disables character-key shortcuts, exactly as GitHub does at the account level. Modifier chords are out of scope of 2.1.4 entirely, which is why they need no toggle.

Then annotate. `aria-keyshortcuts` describes a binding to assistive tech and **implements nothing**, so it goes alongside the handler, never instead of it. Syntax: space-separated alternatives, each one modifiers first joined by `+`, then exactly one non-modifier. `"Meta+K Control+K"` is valid; `"K+Meta"` is not. Describe physical keys, so `"Shift+2"` and never `"@"`. Remove it from disabled elements.

GitHub's Primer guidance calls single-character shortcuts the most common cause of accessibility failures in this area, which is a good reason to keep Tier 2 short and to test with a screen reader rather than assume.

## Phase 5: verify, so it stays fixed

A hand-checked keymap regresses on the next PR. Encode the rules as tests. Write these into `src/keyboard/keymap.test.ts` (adapt to the repo's test runner). This file is the most durable thing this skill produces.

```ts
const RESERVED = [/^Mod\+(W|T|N|Q|L)$/, /^Mod\+Shift\+(N|T)$/]
const isBare = (k: string) => !/(^|\+)(Mod|Alt)\+/.test(k) && !['Escape', 'Tab'].includes(k)

test('every binding points at a registered command', () => {
  for (const b of keymap) expect(commands[b.command], b.key).toBeDefined()
})

test('no browser-reserved chords', () => {
  for (const b of keymap) expect(RESERVED.some(r => r.test(b.key)), b.key).toBe(false)
})

test('bare keys are scoped, so they cannot fire while the user is typing', () => {
  for (const b of keymap.filter(b => isBare(b.key))) expect(b.when, b.key).toBeDefined()
})

test('no two bindings share a key with an identical scope', () => {
  const seen = new Set<string>()
  for (const b of keymap) {
    const sig = `${b.key}::${b.when?.toString() ?? 'always'}`
    expect(seen.has(sig), sig).toBe(false)
    seen.add(sig)
  }
})

test('sequence prefixes are not bound on their own', () => {
  const prefixes = new Set(keymap.filter(b => b.key.includes(' ')).map(b => b.key.split(' ')[0]))
  for (const b of keymap) expect(prefixes.has(b.key), b.key).toBe(false)
})

test('every command is discoverable in the palette and help sheet', () => {
  for (const c of Object.values(commands)) {
    expect(c.title, c.id).toBeTruthy()
    expect(c.group, c.id).toBeTruthy()
  }
})
```

Add behavioural tests for the Tier 0 and Tier 1 bindings with `userEvent.keyboard`, run once with `isMac` true and once false so the `Meta` and `Control` paths are both covered.

Then check by hand the four things tests cannot reach. Each has a specific failure it catches:

- **IME.** Switch to a CJK input method (macOS Pinyin, Windows Microsoft IME), type into a comment field, and press `Enter` mid-composition. The candidate should commit. If your shortcut fires instead, the `isComposing` guard is missing or a library swallowed it.
- **Keyboard layout.** Switch the OS to AZERTY or Dvorak and confirm `Mod+S` still saves. If it moved to a different physical key, something matched `event.code`.
- **Browsers and platforms.** Walk every chord in Chrome, Firefox, and Safari on both macOS and Windows. There is no normative list of reserved keys, so any list including the one above is incomplete by nature.
- **Screen reader.** VoiceOver and NVDA smoke test: bare letters must not fight the reader's own keys, and the disable setting must work. Also tab through each page with no mouse and confirm the primary task completes.

Finish by updating `docs/keyboard-audit.md` with what shipped versus what was declined, and point the PR description at it.

## Appendix: the conflict map to expect

These collisions show up in almost every app. Resolve them in the keymap with `when`, not with branching inside handlers.

| Key | Global meaning | Inside a text editor | Resolution used in the wild |
|---|---|---|---|
| `Mod+K` | Command palette | Insert link | Two bindings on `editorFocus`, plus `Mod+Alt+K` as the palette escape hatch (GitHub). Notion instead keeps `Mod+P` as an unambiguous second search key. |
| `Mod+B` | Toggle sidebar or board view | Bold | Editor wins while focused. Linear and VS Code both do this. |
| `Mod+A` | Select all rows | Select all text | Scope on `listFocus` versus `textFieldFocus`. |
| `Mod+Enter` | Submit | Submit | Keep it consistent, and if `Enter`-to-send is contested, make it a user setting the way Linear does rather than picking for everyone. |
| `?` | Help sheet | Types a question mark | Gate on `!textFieldFocus`. Bind `?`, never `Shift+/`. |
| `Mod+Shift+?` or `Control+Shift+?` | Help sheet | | Figma uses `Control+Shift+?` on macOS too, deliberately avoiding `Cmd` to dodge `Cmd+P`-class collisions. |

One last thing worth internalising: Notion ships different modifiers per OS on purpose (headings are `Mod+Alt+1/2/3` on macOS but `Ctrl+Shift+1/2/3` on Windows), and Figma ships selectable keyboard layouts that remap its own defaults. Both are admissions that a single global keymap cannot be correct everywhere. If a binding keeps colliding, changing it per platform is a legitimate answer rather than a hack.