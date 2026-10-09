---
name: kudosity-rcs
description: "Send RCS (Rich Communication Services) messages via the Kudosity platform, with automatic SMS fallback for non-RCS devices. Use when sending an RCS message, checking whether a number can receive RCS, or configuring RCS-to-SMS fallback. RCS sends through a registered agent ID, not a phone number."
metadata:
  author: Kudosity
  version: 0.2.1
  category: Messaging
  tags: rcs, rich-messaging, sms-fallback, capability-check, agent-id, rbm
  related:
    - kudosity-setup
    - kudosity-webhooks
---

# Send RCS Messages

RCS is rich, branded messaging delivered in the recipient's native messaging app. Kudosity sends RCS over the V2 API.

> **Beta.** The RCS endpoints are marked beta in the Kudosity API and may change. Check `https://developers.kudosity.com` before relying on a field not listed here.

## The one thing that trips people up

**RCS does not send from a phone number.** Unlike SMS, MMS and WhatsApp, the `sender` field is a **registered RCS agent ID** — alphanumeric or numeric, e.g. `DemoSender`. If you pass a phone number, the send fails validation.

An agent must be registered and launched on the destination carrier before it will deliver. Registration is not part of this API — talk to your Kudosity account contact to get an agent provisioned, then use its ID here.

## Authentication

- Header: `x-api-key: {KUDOSITY_API_KEY}`
- Base URL: `https://api.transmitmessage.com`

## Send an RCS message

**Endpoint:** `POST /v2/rcs/messages`

Required:
- `sender` (string) — your registered RCS agent ID
- `recipient` (string) — destination number, local or [E.164](https://en.wikipedia.org/wiki/E.164) format (`0438 333 061` → `61438333061`)
- `content_type` (string) — currently only `text`
- `content` (object) — `{ "text": { "message": "..." } }`

Optional:
- `sms_fallback` (object) — see below. **Use this on almost every send.**
- `message_ref` (string, max 500 chars) — your reference, echoed back in webhook events

### Message length

- **Basic RCS** — up to 160 characters (SMS-shaped)
- **Simple RCS** — up to 3072 characters, full UTF-8 and emoji

```bash
curl -s -X POST "https://api.transmitmessage.com/v2/rcs/messages" \
  -H "x-api-key: ${KUDOSITY_API_KEY}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "DemoSender",
    "recipient": "61438333061",
    "content_type": "text",
    "content": { "text": { "message": "Your order has shipped. Track it: https://example.com/t/7782" } },
    "sms_fallback": {
      "sender": "61481074185",
      "message": "Your order has shipped. Track it: https://example.com/t/7782"
    },
    "message_ref": "order-7782"
  }'
```

Response is wrapped in a `data` envelope:

```json
{ "data": { "id": "6fdae71c-dad7-4c36-9734-a69693ecf3b4", "sender": "DemoSender",
            "recipient": "61438333061", "created_at": "2026-07-29T00:00:00Z" } }
```

Keep `data.id` — it's what you match webhook events against.

## SMS fallback — do this by default

Not every handset supports RCS, and carrier delivery can fail. `sms_fallback` sends an SMS instead when the RCS leg doesn't land.

```json
"sms_fallback": {
  "sender": "61481074185",
  "message": "Shorter plain-text version."
}
```

- `message` is **required** when `sms_fallback` is present
- `sender` is optional but should be a number or alphanumeric sender ID registered to your account
- The fallback is a real SMS — it is billed as one and is subject to SMS character limits, so write a separate, shorter body rather than reusing a 3072-character RCS message

## Check RCS capability before sending

**Endpoint:** `POST /v2/rcs/capabilities`

Two required fields: `sender` — the agent ID you intend to send from — and `phone_numbers`. Capability is **per agent**, so a check that omits the sender is meaningless; a number reachable for one agent is not guaranteed reachable for another.

```bash
curl -s -X POST "https://api.transmitmessage.com/v2/rcs/capabilities" \
  -H "x-api-key: ${KUDOSITY_API_KEY}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "DemoSender",
    "phone_numbers": ["61438333061", "61491570156"]
  }'
```

Numbers are E.164 without the leading `+`. Up to 100 per request; batches of **1–10** keep latency low enough for routing-time lookups.

Results come back one per number, in request order:

```json
{ "data": { "results": [
  { "phone_number": "61438333061", "code": "ENABLED" },
  { "phone_number": "61491570156", "code": "UNREACHABLE" }
] } }
```

`code` is not a boolean:

| Code | Meaning |
|---|---|
| `ENABLED` | Can receive RCS from this sender |
| `UNREACHABLE` | Cannot receive RCS from this sender |
| `REJECTED_NETWORK` | Not sent — network not allowed |
| `REJECTED_ROUTE_NOT_AVAILABLE` | No route available for that sender |
| `REQUEST_FAILED` | External problem during the check |
| `PROCESSING_ERROR` | Couldn't be processed — retry |
| `INVALID_DESTINATION_ADDRESS` | Number in the wrong format |
| `UNKNOWN` | Unknown upstream error, or a code this list doesn't cover yet |

**Don't use this as a hard gate on sending.** Results are best-effort and reflect capability at the moment of the lookup. Treat `UNKNOWN` as reachable, send anyway, and let `sms_fallback` carry the ones that don't land — the fallback is what gives you a hard delivery guarantee, not this check. Capability also goes stale, so re-check rather than caching indefinitely.

## Read messages back

- `GET /v2/rcs/messages` — list sent RCS messages
- `GET /v2/rcs/messages/{id}` — get one by ID

## Delivery events

Register a webhook (see `kudosity-webhooks`) for the `RCS_STATUS` and `RCS_INBOUND` event types. `message_ref` is echoed in every event, so set it to something you can join on — an order ID, an invoice number.

RCS reports a status SMS never will: **`READ`**. Alongside `SENT`, `DELIVERED` and `FAILED`, an `RCS_STATUS` event tells you the recipient actually opened the message. It's one of the few things RCS gives you that SMS can't, so it's worth handling rather than treating `DELIVERED` as the end of the line.

## Errors

Errors follow RFC 9457 Problem Details under an `error` key:

```json
{ "error": { "type": "https://developers.kudosity.com/reference/errors#input-validation",
             "title": "Invalid Request", "detail": "Request validation failed", "status": 400,
             "issues": [{ "name": "sender", "message": "sender is required" }] } }
```

Read `error.issues[]` — it lists every failed field at once rather than one per attempt.

| Status | Meaning | Usual cause |
|---|---|---|
| 400 | Input validation | `sender` is a phone number instead of an agent ID; missing `content_type` |
| 401 | Auth failed | Missing or wrong `x-api-key` |
| 500 | Server error | Retry with backoff |

## Related

- `kudosity-sms` — the fallback channel, and the right choice when you don't need rich content
- `kudosity-webhooks` — delivery status, replies, link hits
- Working example: [`ai-payment-reminder-rcs`](https://github.com/kudosity/ai-agent-examples/tree/main/ai-payment-reminder-rcs) and [`ai-delivery-update-rcs`](https://github.com/kudosity/ai-agent-examples/tree/main/ai-delivery-update-rcs)
