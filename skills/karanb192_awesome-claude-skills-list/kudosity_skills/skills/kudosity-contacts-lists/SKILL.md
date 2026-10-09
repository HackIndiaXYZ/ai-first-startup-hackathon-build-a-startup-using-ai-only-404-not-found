---
name: kudosity-contacts-lists
description: "Create contact lists and manage their members on the Kudosity platform. Use when creating a contact list, adding or removing recipients, bulk-importing contacts from a CSV, opting a contact out or unsubscribing them, or preparing an audience for a bulk SMS campaign."
metadata:
  author: Kudosity
  version: 0.2.1
  category: Audience
  tags: contacts, lists, audience, opt-out, unsubscribe, bulk-import, csv, compliance
  related:
    - kudosity-setup
    - kudosity-sms
---

# Contact Lists & Contacts

Lists are how you send to many recipients at once. All list and contact operations are on the **V1 API**.

## Authentication

V1 uses **HTTP Basic**, not the `x-api-key` header the V2 endpoints use:

- Header: `Authorization: Basic {base64(KUDOSITY_API_KEY:KUDOSITY_API_SECRET)}` — `curl -u` does this for you
- **Both** `KUDOSITY_API_KEY` and `KUDOSITY_API_SECRET` are required. V1 will not accept the key alone.
- Credentials come from the Kudosity dashboard under **Developers → API Settings**

- **Base URL**: `https://api.transmitsms.com`
- **Content-Type**: `application/x-www-form-urlencoded` — form fields, not JSON

## Create a list

**Endpoint:** `POST /add-list.json`

- `name` (string, required) — a unique name for the list
- `field_1` … `field_10` (optional) — custom field names. `firstname` and `lastname` exist by default.

```bash
curl -s -X POST "https://api.transmitsms.com/add-list.json" \
  -u "${KUDOSITY_API_KEY}:${KUDOSITY_API_SECRET}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -d "name=My Campaign List&field_1=email&field_2=postcode"
```

The response returns the list `id`. Keep it — everything below needs it.

## Add one contact

**Endpoint:** `POST /add-to-list.json`

- `list_id` (integer, required)
- `msisdn` (string, required) — E.164 international format
- `countrycode` (optional) — 2-letter ISO code; auto-formats local numbers
- `first_name`, `last_name`, `field_1` … `field_10` (optional)

```bash
curl -s -X POST "https://api.transmitsms.com/add-to-list.json" \
  -u "${KUDOSITY_API_KEY}:${KUDOSITY_API_SECRET}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -d "list_id=4213644&msisdn=0491570156&countrycode=AU&first_name=John&last_name=Doe&field_1=john@example.com"
```

**An existing contact is ignored, not updated.** Use `POST /edit-list-member.json` to change one.

## Bulk import from a CSV

**Endpoint:** `POST /add-contacts-bulk.json`

Either `list_id` (add to an existing list) **or** `name` (create a new list and return its ID) is required.

- `file_url` — a **direct** URL to the CSV. Not a redirect, not a local path. The file must have a column headed `mobile`. Basic auth in the URL is supported: `https://user:pass@host/file.csv`
- `countrycode` (optional) — formats numbers on import
- `field_n` (optional) — create or map a custom field. CSV headers matching a custom field name map automatically: a column headed `email` maps to `field_1=email`.

Expected CSV shape — **the column order matters**:

```csv
Firstname,Lastname,Mobile,"Custom Field 1"
Jane,Doe,61412345678,10.44
```

Only `Mobile` is strictly required.

```bash
curl -s -X POST "https://api.transmitsms.com/add-contacts-bulk.json" \
  -u "${KUDOSITY_API_KEY}:${KUDOSITY_API_SECRET}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -d "list_id=4213644&file_url=https://example.com/contacts.csv&countrycode=AU&field_1=email"
```

> ⚠️ **`200` does not mean the contacts were imported.** It means the request reached the server, nothing more. There is no error returned if the import itself fails — a bad `file_url` yields a list ID that is then silently deleted.
>
> **You must poll `add-contacts-bulk-progress.json` to find out what happened.**

Unlike single-contact adds, **bulk import updates existing contacts** rather than ignoring them.

## Check import progress

**Endpoint:** `POST /add-contacts-bulk-progress.json` — `list_id` required.

Lists over 50,000 contacts take a while. This is also the only way to see import errors.

```bash
curl -s -X POST "https://api.transmitsms.com/add-contacts-bulk-progress.json" \
  -u "${KUDOSITY_API_KEY}:${KUDOSITY_API_SECRET}" \
  -d "list_id=4213644"
```

```json
{ "list_id": 4214121, "status": "completed", "importlength": 2, "completed": 2,
  "duplicates": 0, "skipped": 0, "optout": 0, "imported": 2 }
```

| Field | Meaning |
|---|---|
| `status` | `completed`, `in progress` or `failed` |
| `importlength` | Total rows in the file, **including invalid numbers** |
| `completed` | Rows processed — equals `importlength` when done |
| `imported` | Rows actually added |
| `duplicates` | Matched an existing contact; only the first is kept |
| `skipped` | Blank rows, invalid numbers, or a blank `mobile` cell |
| `optout` | Already opted out — **not imported** |

`imported` is usually lower than `importlength`. Report `imported` to the user, not the file's row count, and surface `skipped` — that's where a malformed export shows up.

## Opt a contact out

**Endpoint:** `POST /optout-list-member.json`

- `msisdn` (required) — E.164
- `list_id` — the list to opt out of. **`0` opts out of every list.**

```bash
curl -s -X POST "https://api.transmitsms.com/optout-list-member.json" \
  -u "${KUDOSITY_API_KEY}:${KUDOSITY_API_SECRET}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -d "list_id=4213644&msisdn=61491570156"
```

Returns `list_ids` — every list the contact was opted out of.

> 📘 **Global Opt Out changes the blast radius.** If GOO is switched on for the account, opting out of a *single* list opts the contact out of **all** lists and adds them to the GOO list. Check the returned `list_ids` rather than assuming the scope you asked for is the scope you got.

**Opt-out is not the same as removal.** Opting out is the compliance action and it persists — a later bulk import will not resurrect an opted-out contact, it counts them under `optout`. Deleting a contact removes that record; it does not record consent withdrawal.

If you send marketing, an unsubscribe method is a legal requirement. See Kudosity's [Anti-Spam Policy](https://help.kudosity.com/s/article/44001077041-anti-spam-policy). To put an opt-out link in a message, use `[opt-out-link]` (V2) or `[unsub-reply-link]` (V1) — see `kudosity-sms`.

## Remove a contact

**Endpoint:** `POST /delete-from-list.json`

- `msisdn` (required), `list_id` (**`0` removes from all lists**), `countrycode` (optional)

```bash
curl -s -X POST "https://api.transmitsms.com/delete-from-list.json" \
  -u "${KUDOSITY_API_KEY}:${KUDOSITY_API_SECRET}" \
  -H "User-Agent: kudosity-skills/0.2.1" \
  -d "list_id=4213644&msisdn=61491570156"
```

Use opt-out, not delete, when a recipient asks to stop hearing from you.

## Other list operations

| Task | Endpoint |
|---|---|
| Get one list | `POST /get-list.json` |
| Get all lists | `GET /get-lists.json` |
| Update a contact | `POST /edit-list-member.json` |
| Get a contact | `POST /get-contact.json` |
| Add a custom field to a list | `POST /add-field-to-list.json` |
| Delete a list | `POST /remove-list.json` |

## Notes

- A list holds up to **10 custom fields** beyond the default firstname and lastname.
- Country codes: Australia `AU`, New Zealand `NZ`, United Kingdom `GB`, United States `US`.
- Number formats: AU local `0491570156` → `61491570156`; NZ `0212670129` → `64212670129`; GB `0750017696` → `44750017696`; US `2513551145` → `12513551145`.
- Pass `countrycode` rather than formatting numbers yourself — it is the documented way to avoid delivery failures from local formats.

## Related

- `kudosity-sms` — sending to a `list_id`, and opt-out link parameters
- `kudosity-webhooks` — the `OPT_OUT` event, for opt-outs that happen by reply or link rather than through this API
