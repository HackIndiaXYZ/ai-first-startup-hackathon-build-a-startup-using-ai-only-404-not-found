---
name: kudosity-setup
description: "Get set up with Kudosity from scratch — create an account, find your API credentials, understand which of the two APIs needs which credential, get a sender, and verify it all works before sending. Use when someone has no Kudosity account or credentials yet, when a call returns 401, or when a send fails because there is no valid sender."
metadata:
  author: Kudosity
  version: 0.2.1
  category: Getting started
  tags: setup, onboarding, credentials, api-key, api-secret, authentication, sender, getting-started
  related:
    - kudosity-sms
    - kudosity-whatsapp
---

# Get set up with Kudosity

Everything needed before the first message sends. Four things have to be true:

1. A Kudosity account exists
2. API credentials are in the environment
3. The right credential is used for the right API
4. A **sender** is available to send from

Steps 1–3 are the usual focus. **Step 4 is the one that's missed** — credentials can be perfectly valid and a send still fails because there's nothing to send *from*.

## 1. Account

If the person has no account, direct them to **https://kudosity.com/signup**.

Account creation is not available through the API — it happens in a browser. An agent can't complete this step on someone's behalf; hand them the link and wait.

## 2. Find the credentials

Once signed in: **Developers → API Settings**.

| Credential | Environment variable | Needed for |
|---|---|---|
| API Key | `KUDOSITY_API_KEY` | Everything |
| API Secret | `KUDOSITY_API_SECRET` | The V1 API only — contacts, lists, bulk SMS, reporting, balance |

If the API Secret field is blank, it hasn't been generated yet. It has to be created in the dashboard before V1 calls will work — there's no API to mint one.

## 3. Which credential for which API

Kudosity runs two APIs. This is the single biggest source of confusion, and a 401 is almost always this.

| | Base URL | Auth |
|---|---|---|
| **V2** — single-recipient SMS, MMS, WhatsApp, RCS, webhooks | `api.transmitmessage.com` | Header `x-api-key: {KUDOSITY_API_KEY}` |
| **V1** — contact lists, bulk/list sends, scheduling, reporting, balance | `api.transmitsms.com` | HTTP Basic — base64 of `{KUDOSITY_API_KEY}:{KUDOSITY_API_SECRET}` |

The V2 API never uses the secret. The V1 API always needs both.

## 4. Store them

> 🔒 **Credentials stay on the user's machine.** Store them as environment variables. They are not sent to the model, to Kudosity's MCP server, or to any cloud service — they are used only when making direct API requests. On a shared machine, anyone who can read the shell profile can read these values.

Never write credentials into source files, and never echo them back in full.

Shell profile (`~/.zshrc`, or `~/.bashrc` for bash):

```bash
export KUDOSITY_API_KEY="..."
export KUDOSITY_API_SECRET="..."
```

If the variable is already set, replace the existing line rather than appending a second one — a duplicate export silently wins and makes a stale key look like a valid one.

For a project rather than a shell, a `.env` file works equally well. Add it to `.gitignore`.

## 5. Verify before sending

Two read-only calls. Neither sends anything or costs money.

**V2 — key only:**

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://api.transmitmessage.com/v2/sms?limit=1" \
  -H "x-api-key: ${KUDOSITY_API_KEY}"
```

`200` means the key works. `401` or `403` means it doesn't.

**V1 — key and secret:**

```bash
curl -s "https://api.transmitsms.com/get-balance.json" \
  -u "${KUDOSITY_API_KEY}:${KUDOSITY_API_SECRET}"
```

Returns the account balance and currency. An error here with a working V2 check means the **secret** is wrong or missing — the key is already proven good.

## 6. Get a sender

**A verified sender is required. Without one, sends fail even with perfect credentials.**

What counts as a sender depends on the channel:

| Channel | Sender is |
|---|---|
| SMS / MMS | A number registered to the account, or an approved alphanumeric sender ID (max 11 characters) |
| WhatsApp | A registered WhatsApp Business number, E.164. Omit it and the account's default is used. |
| RCS | **A registered RCS agent ID — not a phone number.** Passing a number fails validation. |

### Check what the account already has

Don't guess — ask:

```bash
curl -s "https://api.transmitmessage.com/v2/senders/registrations" \
  -H "x-api-key: ${KUDOSITY_API_KEY}" \
  -H "User-Agent: kudosity-skills/0.2.1"
```

For virtual numbers on the account, V1 answers the same question:

```bash
curl -s "https://api.transmitsms.com/get-numbers.json?filter=owned" \
  -u "${KUDOSITY_API_KEY}:${KUDOSITY_API_SECRET}"
```

### Getting a new sender

Senders are provisioned through the Kudosity dashboard or by talking to a Kudosity account contact. Alphanumeric sender IDs and RCS agents both need approval and are not instant — factor that into any "we'll be live tomorrow" plan.

### Is my sender ready to send?

A sender that exists is not necessarily a sender you can use. `GET /v2/senders/registrations` returns `details.alphanumeric.status`, which moves through the registry lifecycle:

`NEW` → `SUBMITTED_TO_REGISTRY` → `PENDING_CUSTOMER` → `PENDING_APPROVAL` → `VERIFIED` → `READY_TO_USE`

> **`VERIFIED` does not mean you can send.** It means *Provisioning*. **`READY_TO_USE` is the one that means ready.** Sending on `VERIFIED` fails, and the failure looks like a mystery rather than a sender problem.
>
> `PENDING_CUSTOMER` means it's waiting on **you**, not on the registry — check `status_reason` and act.

This enum is expected to grow as the registry adds states, so render an unrecognised value gracefully rather than treating the list as closed.

Two things worth knowing early:

- **Alphanumeric senders can't receive replies.** If the use case needs two-way messaging, a number is required.
- **RCS agents must be launched per carrier** before they deliver in a given market.

On accounts with a parent/child structure, `GET /v2/senders/registrations` reports the `child_account_id` a sender belongs to.

## 7. Confirm and move on

A good summary to give the user:

```
✅ Kudosity setup complete

V2 API (SMS, MMS, WhatsApp, RCS, webhooks): connected
V1 API (contacts, lists, bulk, reporting):  connected
Account balance: {balance} {currency}
Sender:          {sender or "not yet configured"}
```

Then, depending on what they want to do:

| Goal | Skill |
|---|---|
| Send a text message | `kudosity-sms` |
| Send an image, GIF or video | `kudosity-mms` |
| Message on WhatsApp | `kudosity-whatsapp`, then `kudosity-whatsapp-templates` |
| Send rich RCS with SMS fallback | `kudosity-rcs` |
| Build an audience to send to | `kudosity-contacts-lists` |
| Receive delivery status and replies | `kudosity-webhooks` |

## Troubleshooting

| Symptom | Cause |
|---|---|
| `401` on a V2 call | `KUDOSITY_API_KEY` wrong, unset, or a stale duplicate export |
| V2 works, V1 returns an error | Secret wrong or never generated — check **Developers → API Settings** |
| Credentials verify, send fails | No valid sender for that channel — see step 6 |
| RCS send fails validation | `sender` is a phone number; RCS needs an agent ID |
| Variables set but not visible | Shell not reloaded — `source ~/.zshrc`, or open a new terminal |
