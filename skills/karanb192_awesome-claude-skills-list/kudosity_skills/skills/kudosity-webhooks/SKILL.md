---
name: kudosity-webhooks
description: "Create and manage webhooks on the Kudosity platform. Use when receiving notifications for delivery status, inbound messages and replies, MMS events, link hits, or opt-outs."
metadata:
  author: Kudosity
  version: 0.2.1
  category: Platform
  tags: webhooks, callbacks, delivery-receipts, inbound, replies, link-hits, opt-out
  related:
    - kudosity-setup
    - kudosity-sms
    - kudosity-rcs
    - kudosity-whatsapp
---

# Create & Manage Webhooks

Webhooks allow users to receive HTTP POST notifications when events occur, such as SMS delivery status changes, inbound messages, link clicks, and opt-outs.

## Authentication

- Header: `x-api-key: {KUDOSITY_API_KEY}`
- Credentials come from the Kudosity dashboard under **Developers → API Settings**

## API Details

- **Base URL**: `https://api.transmitmessage.com`
- **Content-Type**: `application/json`
- All requests use `curl` commands

## Create a Webhook

**Endpoint**: `POST /v2/webhook`

Required parameters:
- `name` (string): Webhook name, 2-100 characters
- `url` (string): HTTPS URL that accepts JSON-encoded POST requests

Optional parameters:
- `filter` (object): Filter which events trigger the webhook
  - `event_type` (array): Types of events to subscribe to
  - `sender` (array): Filter by sender number
  - `status` (array): Filter by message status (for status events only)
  - `message_ref` (array): Filter by message reference
  - `campaign_id` (array): Filter by campaign ID
- `rate_limit` (integer): Max requests per second to your URL (max 10,000, 0 = system default)

### Available Event Types

Ten event types, covering every channel — not just SMS:

| Event Type | Description |
|-----------|-------------|
| `SMS_STATUS` | SMS delivery status changes |
| `SMS_INBOUND` | Inbound SMS received from a recipient |
| `MMS_STATUS` | MMS status changes (currently internal statuses only — SENT, FAILED) |
| `MMS_INBOUND` | Inbound MMS received from a recipient |
| `WHATSAPP_STATUS` | WhatsApp message status changes |
| `WHATSAPP_INBOUND` | Inbound WhatsApp message received from a recipient |
| `RCS_STATUS` | RCS status changes — including `READ` |
| `RCS_INBOUND` | Inbound RCS message received from a recipient |
| `LINK_HIT` | Recipient clicked a tracked link |
| `OPT_OUT` | Recipient opted out via link or STOP message |

If you are sending WhatsApp or RCS, these are the event types you want — `SMS_STATUS` will not report on them.

### Status Values

For any status event, the nested `status.status` field carries one of:

| Status | Meaning |
|---|---|
| `SENT` | Submitted to the carrier |
| `ACCEPTED` | Accepted by the carrier; delivery may have been attempted, but is not confirmed |
| `DELIVERED` | Delivered to the handset |
| `FAILED` | Error from the carrier or handset |
| `SOFT_BOUNCE` | Temporarily undeliverable — handset switched off, out of range |
| `HARD_BOUNCE` | Handset disconnected |
| `READ` | Read by the recipient — **RCS only** |
| `OTHER` | Any other status from the carrier |

`ACCEPTED` is not `DELIVERED`. Treating it as a successful delivery is a common source of over-reported success rates.

### Filter Logic

- **Within a filter array** (e.g., multiple senders): conditions are combined with **OR**
- **Between different filters** (e.g., sender AND status): conditions are combined with **AND**

The same filter name reads a different part of the payload depending on the event type:

| Event type | `sender` / `message_ref` are matched against |
|---|---|
| Status events (`SMS_STATUS`, `RCS_STATUS`, …) | the `status` payload |
| `LINK_HIT` | `link_hit.source_message` |
| `OPT_OUT` | `opt_out.source_message` |
| Inbound events (`SMS_INBOUND`, …) | `sender` matches the **`recipient`** field — the address that received the inbound. `message_ref` and `campaign_id` match `last_message`, when present. |

The inbound row is the one that surprises people: filtering inbound events by `sender` filters by *your* number, not the customer's.

### Example: Create a webhook for SMS delivery status and inbound messages

```bash
curl -s -X POST "https://api.transmitmessage.com/v2/webhook" \
  -H "x-api-key: ${KUDOSITY_API_KEY}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SMS Events",
    "url": "https://myapp.com/webhooks/sms",
    "filter": {"event_type": ["SMS_STATUS", "SMS_INBOUND"]}
  }'
```

### Example: Create a webhook filtered to specific statuses

```bash
curl -s -X POST "https://api.transmitmessage.com/v2/webhook" \
  -H "x-api-key: ${KUDOSITY_API_KEY}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Failed SMS Alerts",
    "url": "https://myapp.com/webhooks/failures",
    "filter": {"event_type": ["SMS_STATUS"], "status": ["FAILED", "HARD_BOUNCE"]}
  }'
```

## List All Webhooks

**Endpoint**: `GET /v2/webhook`

```bash
curl -s "https://api.transmitmessage.com/v2/webhook" \
  -H "x-api-key: ${KUDOSITY_API_KEY}" \
  -H "User-Agent: kudosity-skills/0.2.1"
```

## Webhook Payload Examples

### SMS Status Event
```json
{
  "event_type": "SMS_STATUS",
  "timestamp": "2021-05-06T05:16:07Z",
  "status": {
    "type": "SMS",
    "id": "a51ebe4e-a412-440e-a8d9-464e68a521cc",
    "message_ref": "ncc5009d",
    "recipient": "447507222200",
    "routed_via": "447507333300",
    "sender": "61481074190",
    "status": "SENT"
  }
}
```

### SMS Inbound Event

```json
{
  "event_type": "SMS_INBOUND",
  "timestamp": "2021-05-06T05:16:33Z",
  "mo": {
    "type": "SMS",
    "id": "alss-2way-605b31c7-d2c49104",
    "message": "Yes, I'm interested",
    "recipient": "61481074190",
    "routed_via": "447507333300",
    "sender": "447507222200",
    "last_message": {
      "type": "SMS",
      "id": "a51ebe4e-a412-440e-a8d9-464e68a521cc",
      "message": "Hey, check this out!",
      "message_ref": "ncc5009d",
      "recipient": "447507222200",
      "routed_via": "447507333300",
      "sender": "61481074190"
    }
  }
}
```

**`last_message` is the field that makes two-way messaging work.** On receipt of an inbound message, Kudosity looks for a message you sent to that recipient from that sender and attaches it here. Its `message_ref` is your join key back to whatever the original send belonged to — an order, a booking, a conversation thread.

Route replies on `mo.last_message.message_ref`, not on the phone number. Number matching breaks the first time one contact is in two flows at once, and it breaks again when a shared number is involved.

It is best-effort — if no recent outbound matches, `last_message` is absent. Handle that case rather than assuming it's always there.

### Shared numbers and `routed_via`

`routed_via` appears when a **shared local number** was used to deliver your message. When it's present, the number the recipient actually replied to is not your sender.

Any logic that pairs an inbound message to an outbound one by comparing `sender`/`recipient` needs to account for this — which is the other reason to prefer `last_message.message_ref`.

### Link Hit Event

The payload nests under `link_hit`, with a running total of `hits` and the message the link was sent in:

```json
{
  "event_type": "LINK_HIT",
  "timestamp": "2021-07-20T23:14:04Z",
  "link_hit": {
    "hits": 1,
    "url": "https://www.example.com/abc",
    "source_message": {
      "type": "SMS",
      "id": "faf68308-16cd-4cf9-aef7-47342bd405be",
      "message": "Hey, Check this out! http://clckme.info/KYhSsuIH",
      "message_ref": "D301",
      "recipient": "61435795809",
      "sender": "61481074185"
    }
  }
}
```

For an MMS the `source_message` additionally carries `subject` and `content_urls`.

`url` is the original destination, not the shortened link. `hits` is cumulative for that tracked link — so it counts repeat clicks, and is not a unique-recipient count.

### Opt-Out Event
```json
{
  "event_type": "OPT_OUT",
  "timestamp": "2021-05-06T05:16:20Z",
  "opt_out": {
    "source": "SMS_INBOUND",
    "source_message": {
      "type": "SMS",
      "id": "a51ebe4e-a412-440e-a8d9-464e68a521cc",
      "message": "Your promo message with opt-out link",
      "message_ref": "ncc5009d",
      "recipient": "61435790000",
      "sender": "61481074190"
    }
  }
}
```

`opt_out.source` tells you how they opted out — `SMS_INBOUND` for a STOP reply, `LINK_HIT` for the opt-out link. Both are binding; don't treat the link as weaker consent withdrawal than the reply.

## Important Notes

- Webhook URLs **must use HTTPS**
- A successful create returns **`201`**, not `200`
- The `event_type` field at the top level of the request body is **deprecated** — always use `filter.event_type` instead
- Rate limit defaults to the system limit if set to 0 or not specified; max is 10,000/sec
- **Multiple status events can be triggered for a single message**, and they are not guaranteed to arrive in order. Key on `status.id` and treat handling as idempotent — a message can go `SENT` → `DELIVERED`, and a late `SENT` must not overwrite a recorded `DELIVERED`.
- Validation errors on this endpoint return a plain `{"error": "..."}` string, not the RFC 9457 Problem Details object the messaging endpoints use
- Always confirm with the user which event types they need before creating the webhook