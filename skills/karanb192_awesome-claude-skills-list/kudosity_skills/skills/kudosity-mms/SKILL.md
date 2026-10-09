---
name: kudosity-mms
description: "Send MMS (multimedia) messages via the Kudosity platform. Use when sending a message with an image, GIF, video, or audio attachment to a recipient."
metadata:
  author: Kudosity
  version: 0.2.1
  category: Messaging
  tags: mms, multimedia, image, video, audio, gif, rich-media
  related:
    - kudosity-setup
    - kudosity-webhooks
---

# Send MMS Messages

MMS messages are sent via the Kudosity V2 API and support images, GIFs, videos, and audio attachments.

## Authentication

- Header: `x-api-key: {KUDOSITY_API_KEY}`
- Credentials come from the Kudosity dashboard under **Developers → API Settings**

## API Details

- **Endpoint**: `POST https://api.transmitmessage.com/v2/mms`
- **Content-Type**: `application/json`
- All requests use `curl` commands

## Parameters

Required:
- `sender` (string): The sender number (must be assigned to the account)
- `recipient` (string): Destination number (local or E.164 international format)
- `content_urls` (array of strings): URLs to the media files to attach

Optional:
- `subject` (string): Message subject — max 20 characters, ASCII only
- `message` (string): Body text — max 1,000 characters. Use `[opt-out-link]` for opt-out if required
- `message_ref` (string, max 500 chars): Your reference ID, returned in webhooks
- `track_links` (boolean): Enable link tracking with shortened URLs

## Example curl Command

```bash
curl -s -X POST "https://api.transmitmessage.com/v2/mms" \
  -H "x-api-key: ${KUDOSITY_API_KEY}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "New Arrival",
    "message": "Check out our latest product!",
    "sender": "61481074185",
    "recipient": "61435795809",
    "content_urls": ["https://example.com/product.jpg"]
  }'
```

## Response

**Flat object — not wrapped in a `data` envelope**, the same as SMS and unlike WhatsApp and RCS:

```json
{
  "id": "6fdae71c-dad7-4c36-9734-a69693ec2318",
  "recipient": "61435795809",
  "sender": "61481074185",
  "country": "AU",
  "subject": "USS Enterprise",
  "message": "Check out this amazing specimen.",
  "message_ref": "ncc1701d",
  "content_urls": ["https://example.com/product.jpg"],
  "status": "pending",
  "track_links": true,
  "created_at": "2022-03-29T04:42:01.631708761Z",
  "updated_at": "2022-03-29T04:42:01.631708761Z"
}
```

`status` on the immediate response is the submission status — `pending` here does not mean anything went wrong. Real delivery outcomes arrive via the `MMS_STATUS` webhook.

## Supported Media

| Format | Type | Media Type | Limit |
|--------|------|------------|-------|
| JPEG, JPG | Image | image/jpeg | Up to 400 KB |
| GIF (incl. animated) | Image | image/gif | Up to 400 KB |
| PNG | Image | image/png | Up to 400 KB |
| BMP | Image | image/bmp | Up to 400 KB |
| MP3 | Audio | audio/mpeg | Up to 400 KB |
| WAV | Audio | audio/wav | Up to 400 KB |
| MPEG, MPG, MP4 | Video | video/mpeg4 | Up to 400 KB |

## Recommended Image Dimensions

For best visibility on mobile devices, use one of these recommended sizes:
- **480px × 480px**
- **640px × 640px**

> Note: Some older handset models have limited support for certain image formats, so results may vary.

## Important Notes

- **Only one media file can be attached at a time**, up to 400 KB
- Media URLs **must be absolute paths** (e.g., `https://example.com/image.jpg`), not relative paths
- **Currently MMS can only be sent to Australia**
- The `subject` field is limited to 20 characters and ASCII characters only
- Always ask the user which sender number to use if not specified
- The sender must be a number assigned to their account