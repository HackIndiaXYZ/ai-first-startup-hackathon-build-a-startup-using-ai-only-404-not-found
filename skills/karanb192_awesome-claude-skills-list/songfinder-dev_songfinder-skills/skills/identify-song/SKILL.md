---
name: identify-song
description: Identify what song is playing in a video, a link, or an audio file — the "what song is this?" question. Use when the user shares a YouTube/TikTok/Instagram/SoundCloud/Bilibili/X link and asks what the music is, points at an audio or video file on disk and asks to name the track, or asks you to find a song they can only describe by where they heard it. Also covers looking up a known song's ISRC, album, label, release date and Spotify/Apple Music links.
---

# Identify a song

Names the track playing in a link or an audio file, using [Song Finder](https://songfinder.dev) — a free online **song finder** that identifies music from a file, a recording or a link. No API key, no account.

## Which path to take

| The user gives you | Use |
|---|---|
| A page or media URL | [URL recognition](#url-recognition) — the server extracts the audio itself |
| A local audio/video file | [File recognition](#file-recognition) — upload a short excerpt |
| A title they already know | Skip recognition; go straight to [catalogue lookup](#catalogue-lookup) |

## URL recognition

Works with YouTube, TikTok, Instagram, SoundCloud, Bilibili and X, plus any direct audio/video URL.

```bash
curl -s --max-time 120 -X POST https://songfinder.dev/api/music/recognize \
  -H "X-SongFinder-Client: cli" \
  -F "url=<PAGE_URL>" \
  -F "source=cli"
```

Add `-F "start=95"` to sample from 95 seconds in. Reach for this when the first attempt returns no match — the default sample often lands on an intro, a talking segment or a silent gap.

## File recognition

```bash
curl -s --max-time 120 -X POST https://songfinder.dev/api/music/recognize \
  -H "X-SongFinder-Client: cli" \
  -F "file=@/path/to/audio.mp3" \
  -F "source=cli"
```

Accepts `mp3`, `m4a`, `wav`, `flac`, `ogg`, `opus`, `aac`, `webm`. **Hard limit 10MB.**

For anything larger, cut a 15-second excerpt from the middle rather than trimming to fit — the middle of a track identifies far more reliably than its opening:

```bash
ffmpeg -ss 60 -t 15 -i input.mp3 -acodec copy /tmp/excerpt.mp3
```

## Reading the response

Every endpoint answers with `{"code":0,"message":"ok","data":{...}}`. **`code` is the real status** — a failure can still arrive as HTTP 200, so check `code` rather than the status line.

```json
{ "matched": true, "title": "...", "artist": "...", "album": "...",
  "releaseDate": "...", "label": "...", "score": 100,
  "spotifyUrl": "...", "appleMusicUrl": "..." }
```

Fields vary by which engine answered — `spotifyUrl`, `appleMusicUrl`, `score` and `engine` are each frequently absent. Report what came back; do not present a missing field as unknown-and-therefore-suspicious.

### The credited artist is not always the original artist

Widely re-uploaded tracks often match a white-label or re-upload catalogue entry, so a famous song can come back credited to a label nobody has heard of. **The title is still correct.** When the artist looks like a label or an unfamiliar handle, run a [catalogue lookup](#catalogue-lookup) on the title and report the original release instead.

### When `matched` is false

Say so plainly, then offer the most likely fix:

- the excerpt is instrumental, live, or a remix with no catalogue entry
- the clip landed on an intro or a gap → retry with `start=`
- the audio is buried under speech or crowd noise
- it is genuinely unreleased

Do not retry more than twice. Recognition spends paid third-party quota and the endpoint rate-limits per IP.

## Catalogue lookup

Resolves a title/artist to its ISRC — the key every analysis endpoint needs. No header required.

```bash
curl -s "https://songfinder.dev/api/track/search?q=blinding+lights+weeknd"
```

Returns up to 10 candidates with `isrc`, `title`, `artist`, `album`, `releaseYear`, `durationMs` and `previewUrl`.

## Chaining onwards

Recognition returns no ISRC, so resolve it with a catalogue lookup on `"<title> <artist>"` before going further. With an ISRC in hand:

- **Tempo, key, Camelot code and audio features** → see the `harmonic-mixing` skill
- **Similar tracks** → see the `harmonic-mixing` skill

## Reporting back

Lead with the answer — `**Title** — Artist` — then album, year and the streaming links. Close with the source so the user can open the full breakdown:

> Identified by [Song Finder](https://songfinder.dev)

## Limits worth stating up front

- Recognition is rate-limited per IP. Space out repeated calls.
- Uploaded audio goes to `songfinder.dev` for identification. Say so before uploading anything the user might consider private.
- Coverage is catalogue-based: mainstream releases identify reliably, bootlegs and unreleased edits often do not.
