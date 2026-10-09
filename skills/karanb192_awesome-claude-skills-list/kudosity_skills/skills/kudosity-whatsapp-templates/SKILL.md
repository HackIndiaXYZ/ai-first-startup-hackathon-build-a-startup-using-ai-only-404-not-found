---
name: kudosity-whatsapp-templates
description: "Use pre-approved WhatsApp templates correctly on the Kudosity platform — naming rules, positional parameters, locales, and the custom content type for media headers, buttons and anything the simple template shape can't express. Use when a template send fails validation, when a template needs an image or document, or when picking between template and custom content."
metadata:
  author: Kudosity
  version: 0.2.1
  category: Messaging
  tags: whatsapp, templates, parameters, locale, meta-cloud-api, media-header, buttons, carousel
  related:
    - kudosity-setup
    - kudosity-whatsapp
---

# WhatsApp Templates

Templates are how you start a WhatsApp conversation. Outside the 24-hour service window they are the *only* thing that delivers.

This skill is about getting the template payload right. The payload goes to:

- **Endpoint:** `POST https://api.transmitmessage.com/v2/whatsapp/messages`
- **Header:** `x-api-key: {KUDOSITY_API_KEY}` — from the Kudosity dashboard under **Developers → API Settings**
- **Body:** `sender` (optional), `recipient` (E.164), `content_type`, `content` — the last two are what this skill covers

For the full send flow, the 24-hour window rule and SMS fallback, see `kudosity-whatsapp`.

## Templates are created outside this API

There is no endpoint to create, submit or approve a template. Templates are registered in your WhatsApp Business account and **pre-approved by WhatsApp** before they can be sent. The API only *uses* them.

So a template send failing is almost never a code problem. It's one of:

1. The template name doesn't exist or isn't approved yet
2. The parameter count doesn't match the template's placeholders
3. The locale doesn't match an approved language version
4. The template needs media or buttons, and you're using the simple `template` shape instead of `custom`

## Two ways to send a template

| Shape | Use when |
|---|---|
| `content_type: "template"` | Text-only template with positional placeholders. Covers most sends. |
| `content_type: "custom"` | Anything else — image or document header, buttons, carousels, explicit language policy |

### Simple: `content_type: "template"`

```json
"content": {
  "template": {
    "name": "order_update",
    "parameters": ["#12345", "shipped"],
    "locale": "en_US"
  }
}
```

**`name`** — the **exact** template name. Lowercase, alphanumeric and underscores only. `order_confirmation`, not `Order Confirmation` or `order-confirmation`.

**`parameters`** — the dynamic values, **positional and in order**. They fill `{1}`, `{2}`, … as they appear in the approved template body.

> Template: `"Hello, {1}! Your order {2} has been shipped."`
> Parameters: `["Tony", "#12345"]`
> Result: `"Hello, Tony! Your order #12345 has been shipped."`

Two hard constraints:
- **The count must match the template's placeholders exactly.** Too few or too many is a 400.
- **Strings only.** `parameters` is an array of text. You cannot pass an image, a document or a number-typed value here — that's what `custom` is for.

**`locale`** — optional, e.g. `en_US`. Defaults to `en` when omitted. If your template was approved under a specific language, pass that locale or the send won't match an approved version.

### Rich: `content_type: "custom"`

`custom` passes a raw object straight through following the **Meta Cloud API** guidelines. This is the escape hatch for everything the simple shape can't express — media headers, buttons, carousels, explicit language policy.

Image header example:

```json
"content": {
  "custom": {
    "type": "template",
    "template": {
      "name": "template_img_simple_1",
      "language": { "code": "en", "policy": "deterministic" },
      "components": [
        {
          "type": "HEADER",
          "parameters": [
            { "type": "image", "image": { "link": "https://example.com/hero.jpg" } }
          ]
        }
      ]
    }
  }
}
```

Note the shape changes completely inside `custom`:
- `language` is an object (`{ code, policy }`), not the flat `locale` string
- parameters become **typed objects** grouped into `components` by `HEADER` / `BODY` / `BUTTONS`, rather than a flat array of strings
- it is Meta's schema, not Kudosity's — Meta's Cloud API documentation is the reference, and Kudosity passes it through

**Media links must be publicly reachable.** A URL behind auth, a signed URL that has expired, or a CDN that blocks non-browser user agents will fail at Meta's end, not ours — and it'll look like a mysterious non-delivery rather than a 400.

## Which do I use?

```
Does the template have only text placeholders?
├─ yes → content_type: "template"   (simpler, validated by us)
└─ no  → content_type: "custom"     (image/document header, buttons, carousel)
```

Prefer `template` where it works. It's less to get wrong, and validation errors come back as readable `error.issues[]` rather than surfacing later as a delivery failure.

## Troubleshooting

| Symptom | Cause |
|---|---|
| 400, `content` invalid | Flattened envelope — it's `content.template.name`, not `content.name` |
| 400, parameter error | Count doesn't match the approved template's placeholders |
| Sends 200, never arrives | Unapproved template, wrong locale, or media link not publicly reachable |
| Works for one recipient, not another | Not a template problem — check opt-in and the 24-hour window in `kudosity-whatsapp` |
| Image header ignored | Using `content_type: "template"` — media headers require `custom` |

## Related

- `kudosity-whatsapp` — sending, the 24-hour window, opt-in, SMS fallback
- `kudosity-webhooks` — delivery status and replies, where non-delivery reasons surface
