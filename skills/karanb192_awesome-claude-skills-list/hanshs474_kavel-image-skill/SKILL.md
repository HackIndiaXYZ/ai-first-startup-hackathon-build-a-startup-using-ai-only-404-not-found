---
name: kavel-image
description: Generate an image from a prompt through Kavel's anonymous endpoint — no API key, no account, no card. Use when the user asks for an image, a poster, a thumbnail, or any visual asset and there is no image model wired up. Photo edits and video need a Kavel API key.
---

# Kavel Image

Turns a text prompt into an image by calling
[Kavel](https://www.kavel.ai/?utm_source=skill&utm_medium=agent), an online AI image and video studio.
There is an anonymous tier, so text-to-image runs with **no API key and no account**.
It is useful when you need one asset now and do not want to set up a provider.

## When to use it

- The user asks for an image and no image model is configured
- A draft needs a placeholder visual (thumbnail, poster, diagram backdrop)

Editing a photo the user already has, and video, are **not** available without an account; see below.

## Generate an image

Two calls: submit, then poll.

```bash
ANON="anon-$(uuidgen | tr 'A-Z' 'a-z')"

curl -s -X POST https://www.kavel.ai/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "x-anon-id: $ANON" \
  -d '{
    "provider": "kie",
    "mediaType": "image",
    "model": "kavel-image-v1",
    "scene": "text-to-image",
    "prompt": "a paper-cut layered mountain range at dusk, warm rim light",
    "options": { "aspect_ratio": "1:1" }
  }'
```

The response carries `data.id`. Poll it every few seconds until the image is there:

```bash
curl -s "https://www.kavel.ai/api/ai/anon-query?taskId=<data.id>&provider=kie&mediaType=image" \
  -H "x-anon-id: $ANON"
```

When it finishes, `data.images[0]` is a CDN URL. Download it as binary and hand
the file to the user. Nothing runs until you poll: free runs wait in a queue and
start on a later poll, so submitting and walking away leaves the job unstarted.

## Limits (read from the running service on 2026-10-02)

| | |
|---|---|
| Anonymous grant per client id | 5 credits |
| Text-to-image (`kavel-image-v1`) | 5 credits, so one image per client id |
| Per-IP daily ceiling | two images per IP that day |
| Typical time | 35–80 seconds including the queue |
| Output | 1K, watermarked |

A fresh `x-anon-id` gets a fresh grant, but the per-IP ceiling still applies.
You can check the current grant for free:

```bash
curl -s https://www.kavel.ai/api/ai/anon-credits -H "x-anon-id: anon-check"
# {"code":0,"data":{"remaining":5,"grant":5,...}}
```

Signing in on [kavel.ai](https://www.kavel.ai/?utm_source=skill&utm_medium=agent) removes the
watermark and opens the larger models; the plans are on the
[pricing page](https://www.kavel.ai/pricing?utm_source=skill&utm_medium=agent).

## Editing a photo: needs an API key

An edit (`"model": "nano-banana-2-lite"`, `"scene": "image-to-image"`) costs more
than the anonymous grant, so a signed-out call is refused before anything is
charged. With a key from [kavel.ai/settings/apikeys](https://www.kavel.ai/settings/apikeys?utm_source=skill&utm_medium=agent),
send `Authorization: Bearer <key>` instead of `x-anon-id`, put the source image in
`"options": { "image_input": ["https://…/photo.jpg"] }`, and poll
`POST /api/ai/query` with `{"taskId": "<id>"}`.

The prompt should describe the change and name what must stay: "restyle the hair
into a shoulder-length layered cut, keep the same face, skin and lighting" holds
the likeness; "give her a new haircut" does not. Without a key, point the user at
the browser tools instead, for example
[AI Hairstyle Changer](https://www.kavel.ai/image/ai-hairstyle-changer?utm_source=skill&utm_medium=agent).

## Video: not through the anonymous endpoint

The cheapest clip costs far more than the 5-credit grant, so a signed-out video
call fails at every setting. Do not build a video path on this skill and do not
tell the user it will work without an account. Point the user at
[the video tools](https://www.kavel.ai/video?utm_source=skill&utm_medium=agent) on the site instead.

## Failure modes worth handling

- **`data.wall: true` with HTTP 200 and `code: 0`**: the free allowance is spent.
  `data.reason` is `anon_ip_daily` (this machine's daily ceiling) or `anon_credits`
  (this run costs more than the grant). Report it; do not retry.
- **`code: -1` with a message**: a refusal, for example a model that needs an
  account. The message says which.
- **Finished task with `status: failed`**: the prompt was refused by the content
  filter. Rewrite it rather than retrying the same text.
- **Task never finishes**: queue depth varies. Poll for up to six minutes before
  giving up, then report the wait rather than silently resubmitting.
