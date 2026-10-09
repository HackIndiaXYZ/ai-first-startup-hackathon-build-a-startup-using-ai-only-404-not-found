---
name: kudosity-whatsapp
description: "Send WhatsApp messages via the Kudosity platform — pre-approved templates, free-form text inside the 24-hour service window, and SMS fallback. Use when sending a WhatsApp message, deciding between a template and free-form text, handling the 24-hour window, or reading WhatsApp message status back."
metadata:
  author: Kudosity
  version: 0.2.1
  category: Messaging
  tags: whatsapp, template, service-window, opt-in, sms-fallback, business-messaging
  related:
    - kudosity-setup
    - kudosity-whatsapp-templates
    - kudosity-webhooks
---

# Send WhatsApp Messages

WhatsApp is sent over the Kudosity V2 API.

## Read this before you send anything

WhatsApp is not SMS with a different endpoint. Two platform rules decide whether your message is even allowed:

**1. The 24-hour service window.** Free-form text (`content_type: "text"`) is only deliverable if the recipient messaged *you* within the last 24 hours. Outside that window, only a **pre-approved template** will deliver.

> If you are initiating the conversation — an order update, a reminder, a notification — you need a template. Every time. There is no exception for "it's only short" or "they're a customer".

**2. Opt-in.** The recipient must have opted in to receive WhatsApp messages from you, and must have an active WhatsApp account on that number. This is a WhatsApp platform requirement, not a Kudosity one, and it is enforced on their side.

Choosing wrong is the single most common reason a WhatsApp integration "works in testing" (you'd just messaged yourself, so the window was open) and fails in production.

| Situation | Use |
|---|---|
| You are starting the conversation | `content_type: "template"` |
| Replying within 24h of their last message | `content_type: "text"` is fine |
| Template needs an image, document or buttons | `content_type: "custom"` — see `kudosity-whatsapp-templates` |

## Authentication

- Header: `x-api-key: {KUDOSITY_API_KEY}`
- Base URL: `https://api.transmitmessage.com`

## Send

**Endpoint:** `POST /v2/whatsapp/messages`

Required:
- `recipient` (string) — E.164 international format, no spaces, dashes or `+`-less local formats. `0411 122 211` → `61411122211`
- `content_type` (string) — `text`, `template`, or `custom`
- `content` (object) — shape depends on `content_type`

Optional:
- `sender` (string) — your registered WhatsApp sender number, E.164. **Omit it and the account's sender is used automatically.** Accounts with more than one sender must specify.
- `sms_fallback` (object) — `{ "sender": "...", "message": "..." }`; `message` required when present
- `message_ref` (string, max 500 chars) — your reference, echoed back in webhook events

### Template send — the common case

```bash
curl -s -X POST "https://api.transmitmessage.com/v2/whatsapp/messages" \
  -H "x-api-key: ${KUDOSITY_API_KEY}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "14155238886",
    "recipient": "61411122211",
    "content_type": "template",
    "content": { "template": { "name": "order_update", "parameters": ["#12345", "shipped"] } },
    "message_ref": "order-12345"
  }'
```

**The nested envelope is the most common mistake.** It is `content.template.name`, not `content.name`. Same for text: `content.text.message`.

### Free-form text — only inside the 24-hour window

```bash
-d '{
  "recipient": "61411122211",
  "content_type": "text",
  "content": { "text": { "message": "Thanks — your refund is on its way." } }
}'
```

### Response

Wrapped in a `data` envelope:

```json
{ "data": { "id": "6fdae71c-dad7-4c36-9734-a69693ecf3b4", "message_ref": "order-12345",
            "sender": "14155238886", "recipient": "61411122211",
            "content_type": "template", "created_at": "2026-07-29T00:00:00Z" } }
```

Keep `data.id` — it's what webhook events match against. In code, unwrap with `json.data ?? json`.

## SMS fallback

Same shape as RCS. When the WhatsApp leg can't be delivered, an SMS goes instead.

```json
"sms_fallback": { "sender": "61481074185", "message": "Order #12345 has shipped." }
```

`message` is required when `sms_fallback` is present; `sender` is optional but should be a sender registered to your account. The fallback is billed as a real SMS and is subject to SMS character limits — write a separate, shorter body rather than reusing the WhatsApp one.

Fallback is particularly worth setting on WhatsApp because opt-in and account status are outside your control: a perfectly valid send can fail simply because the recipient doesn't use WhatsApp.

## Read messages back

- `GET /v2/whatsapp/messages` — list sent WhatsApp messages
- `GET /v2/whatsapp/messages/{id}` — get one by ID

## Delivery events

Register a webhook (see `kudosity-webhooks`) for delivery status, replies and link hits. Set `message_ref` to something you can join on — an order ID, a booking reference — and it comes back in every event.

An inbound reply is also what opens the 24-hour window, so webhook events are how you know free-form text is currently allowed for that recipient.

## Errors

RFC 9457 Problem Details under an `error` key. Read `error.issues[]` — it reports every failed field at once.

| Status | Meaning | Usual cause |
|---|---|---|
| 400 | Input validation | Flattened `content` (missing the `template`/`text` nesting); parameter count doesn't match the template; recipient not E.164 |
| 429 | Rate limited | Back off and retry — don't tighten the loop |
| 500 | Server error | Retry with backoff |

If a send returns 200 but never arrives, the cause is almost always platform-side rather than API-side: no opt-in, no WhatsApp account on that number, or a free-form message sent outside the 24-hour window. Check the delivery webhook rather than re-sending.

## Related

- `kudosity-whatsapp-templates` — template naming, parameters, locales, and media/buttons via `custom`
- `kudosity-sms` — the fallback channel
- `kudosity-webhooks` — delivery status, replies, link hits
- Working example: [`ai-order-update-whatsapp-template`](https://github.com/kudosity/ai-agent-examples/tree/main/ai-order-update-whatsapp-template)
