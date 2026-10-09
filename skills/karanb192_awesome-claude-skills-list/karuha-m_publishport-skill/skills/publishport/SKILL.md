---
name: publishport
description: Publish, cross-post and schedule content on social and content platforms — X/Twitter, Reddit, LinkedIn, Medium, Dev.to, Hashnode, Substack, Bluesky, Mastodon, Threads, Telegram, Tumblr, Pinterest, YouTube, TikTok, plus Chinese platforms such as Xiaohongshu (RedNote), Douyin, Bilibili, Zhihu, Weibo and WeChat — through the user's own logged-in browser via PublishPort. Also covers checking which accounts are connected, attaching images or video to a post, and confirming a post actually went live. Use whenever the user asks to post, publish, cross-post, repost or schedule content, asks which of their platform accounts are connected, or asks to pull back the link or stats of something they published.
license: MIT
---

# Publishing with PublishPort

PublishPort runs publishing commands **on the user's own machine, inside their own logged-in
browser**. No platform API keys, no cloud account impersonation — every action comes from the
user's real session, which is why platforms with no public write API (Xiaohongshu, Douyin,
Zhihu, WeChat…) can be published to at all.

Two rules matter more than everything else below:

- **Never guess a flag.** Ask the CLI for its schema; it is the only accurate source.
- **Never publish twice.** A command that errors may still have posted. Check, then retry.

## 1. Pick the channel

Publishing always goes through PublishPort's relay, which runs the command on the machine where
the user's desktop app is signed in. Two ways to reach that relay — try them in order:

**a. PublishPort MCP tools are available** (`list_capabilities`, `local_bash`, `publish_guide`, …)
— use them and follow their own instructions, which are authoritative and more detailed than this
file. Call `list_capabilities` first: it returns the online devices, the live per-platform login
state, and the `device` handle every other tool needs. Then call `publish_guide(<platform>,
<device>)` before publishing — it returns that platform's fast path together with the live
`--help` schema, saving you a round trip.

**b. No MCP — use the official CLI**, which exposes the same tools over the same relay:

```bash
npx publishport capabilities
```

It works whether or not you are on the user's machine, because the relay does the routing. If it
says it is not logged in, ask the user to run `npx publishport login` and paste the access endpoint
from the desktop app's **Connect AI** panel. The mapping to the MCP tools:

| MCP tool | CLI |
|---|---|
| `list_capabilities` | `publishport capabilities` |
| `publish_guide` | `publishport guide <platform> --device <d>` |
| `local_bash` | `publishport run --device <d> -- <command...>` |
| `prepare_upload` / `read_local_file` | `publishport upload` / `publishport download` |
| anything else | `publishport call <tool> --json '{...}'` (`publishport tools` lists them) |

**c. Neither** — stop and tell the user what is missing: publishing needs the PublishPort desktop
app (<https://publishport.app>), where they sign in to each platform once, in a normal browser
window. Do not substitute scraping, headless logins, or unofficial platform APIs.

**Do not reach for a locally installed `ppcli` and run it yourself**, even when the desktop app is
on the same machine and you can see the binary. The relay is what resolves which device to run on,
checks login state, and keeps the run accounted for; going around it silently drops all three, and
breaks the moment the user's agent moves off that machine.

Everywhere below, `ppcli <platform> …` means *run that command through your channel* — as
`local_bash` on MCP, or `publishport run --device <d> -- ppcli <platform> …` on the CLI.

## 2. Publish

1. **Confirm the account.** `ppcli auth status` lists login state per platform, but it is cached
   and can be stale — before a real publish run `ppcli <platform> whoami`. If that reports
   `AUTH_REQUIRED`, ask the user to sign in again in the desktop app instead of pushing ahead.
2. **Read the real schema.** `publish_guide` / `publishport guide <platform> --device <d>` already
   returns it; fall back to `ppcli <platform> --help`, then `ppcli <platform> <command> --help`.
   Required arguments differ per platform (some need a cover image, a topic, a category id).
   Fill in every required argument deliberately; defaults are rarely what the user wants.
3. **Stage the content as files.** Put the body on the device first — `write_local_text` over MCP,
   or `publishport call write_local_text --json '{"device":"<d>","path":"post.md","content":"…"}'` —
   then pass it with `--file` (or the command's own `--<name>-file`). Never inline a long body in
   the command line: quoting breaks on the first apostrophe, and long multi-line text gets
   truncated on Windows. Media the user's machine does not already have goes over with
   `prepare_upload` / `publishport upload`.
4. **Show the user what you are about to post** — the text, the target platform, and the account —
   and get a yes before the first publish of a session. After that, a summary per post is enough.
5. **Run one command per action.** Give uploads a generous timeout (video can take minutes):
   `timeout_ms` on MCP, `--timeout-ms` on the CLI — the default is 300 s, which a large video
   upload can exceed. On MCP a command that runs longer than about 45 s returns `[STILL_RUNNING]`
   with a handle instead of a result: call `local_bash` again with `wait_for=<handle>` (no
   `command`) to collect it, and never resend the command itself. If you need to wait between
   steps, wait in a separate command rather than chaining with `&&`.
6. **Verify.** Use the returned URL or id, or re-query the platform's own listing, and hand the
   user a link they can click. A publish is not done until you have seen it exist.

Cross-posting the same piece to several platforms means repeating steps 2–6 per platform: length
limits, required media and tag rules genuinely differ, so re-read each one's schema instead of
reusing the previous argument set.

## 3. When something goes wrong

- **A publish command failed or timed out.** Do not re-run it. Query the platform's latest posts
  or the user's profile first; only publish again once you have confirmed the content is not
  there. Blind retries are the number one cause of duplicate posts.
- **Missing media.** If the task needs an image or video and none was provided, say so and stop.
  Do not go looking through the user's disk for something that might fit.
- **Browser commands keep timing out** (even `whoami`): retry once with `--site-session ephemeral`
  before the subcommand. If everything still times out, ask the user to restart the desktop app.
- **The relay says there is no device online.** The desktop app is closed or signed out. Ask the
  user to start it; do not look for a local fallback.
- **The platform is not in the list.** Say so plainly. The catalogue of supported platforms is
  public at <https://api.publishport.app/api/registry>, and the account only works for platforms
  the user has actually signed into.

## Pacing

These are the user's real accounts, on platforms that do police automation. Publish at a human
rhythm — space posts out, don't fire the same text at a dozen accounts on one platform, and don't
work around a rate limit or a cooldown by retrying in a loop. If a platform pushes back, report it
and stop; getting the account restricted costs the user far more than a delayed post.
