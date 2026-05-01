# Porterful Visualizer Studio — UX & Copy Direction

**Status:** Design/copy direction only. No implementation.
**Owner:** O D Porter / Porterful
**Date:** 2026-05-01

---

## Purpose

Make Porterful Lyric Visualizer feel like a premium creator tool — not a technical pipeline. A non-technical artist should go from song + cover to a finished, share-ready lyric video without ever opening Terminal, touching a config file, or seeing the words "render," "encode," "FFmpeg," or "pipeline."

The product name **users see** is **Porterful Visualizer Studio**.

---

## Tone & voice

- **Premium** — quiet confidence, no exclamation points except in success states.
- **Simple** — short sentences. One idea per line.
- **Creator-friendly** — talk to artists like artists, not engineers.
- **Not technical** — never expose file formats, codecs, bitrates, or build steps.
- **Honest** — when something fails, say what happened and what to do next.

Words to use: *song, cover, lyrics, video, format, share, post.*
Words to avoid: *render, encode, build, compile, pipeline, FFmpeg, Remotion, queue, worker, job, exit code, stderr, console.*

---

## Screen 1 — Start

### Purpose
Welcome the creator. Set the mood. Get them moving in one tap.

### Copy

- **Title:** Make a lyric video.
- **Subtitle:** Turn your song into something people want to post.
- **Primary button:** Start a new video
- **Secondary link:** My videos

### Empty state (no past videos)

> You haven't made a video yet. Your first one takes about a minute.

### Helper text (under primary button)

> You'll need your song file, cover art, and your lyrics.

---

## Screen 2 — Choose template

### Purpose
Let the artist pick a look in seconds. Each template is a vibe, not a feature list.

### Copy

- **Title:** Pick a look.
- **Subtitle:** You can change this later.

### Template cards

Each card shows: a 3-second preview loop, the name, a one-line description, a vibe tag, and the formats it supports (9:16 · 1:1 · 16:9).

| Card | Description shown to artist | Vibe tag |
|---|---|---|
| **Classic Lyric** | Clean and timeless. Lets the song lead. | Timeless |
| **Cover Pulse** | Your cover art, moving with the beat. | Release-day |
| **Minimal Wave** | One lyric. One line. No noise. | Editorial |
| **Release Promo** | A 15-second teaser with a countdown. Built for Reels and TikTok. | Promo |
| **Support This Artist** | Your lyric, plus a tip / stream / follow button built in. | Fan-funded |
| **Streetlight** *(coming soon)* | Late-night, handwritten, walking-home energy. | Moody |
| **Gold Room** *(coming soon)* | Foil type and a slow zoom. Feels like a luxury rollout. | Premium |
| **Pain & Healing** *(coming soon)* | Split-screen contrast for songs with a turn. | Emotional |

### Helper text

> Tap a card to preview. Tap again to choose.

### Empty state (none chosen yet)

> Pick a template to keep going.

---

## Screen 3 — Add song + cover

### Purpose
Collect the two assets the video is built around. Make uploads feel calm.

### Copy

- **Title:** Add your song and cover.
- **Subtitle:** This is the heart of your video.

### Song uploader

- **Label:** Your song
- **Button (empty):** Add song
- **Button (filled):** Replace song
- **Helper text:** MP3, WAV, or M4A works. Up to 10 minutes.
- **Filename caption (after upload):** *"{filename}" — looks good.*

### Cover uploader

- **Label:** Your cover art
- **Button (empty):** Add cover
- **Button (filled):** Replace cover
- **Helper text:** A square image works best. JPG or PNG.

### Empty state (nothing uploaded)

> Add a song to keep going. The cover can wait — but it'll make the video feel finished.

### Error messages

- **Song too long:** *That song is longer than 10 minutes. Try a shorter version, or pick a single verse.*
- **Unsupported song format:** *We can't read this file. Try MP3, WAV, or M4A.*
- **Cover too small:** *That image is a little small. A larger one will look sharper.*
- **Upload failed (network):** *Upload didn't finish. Check your connection and try again.*
- **Upload failed (unknown):** *Something went wrong on our end. Try again in a moment.*

### Safe use copy (always visible on this screen)

> **Use music you own or are allowed to use.**
> By uploading, you confirm you have the rights to this song — your own work, or music you've been cleared to post. Porterful is built for artists posting their own art.

### Primary button

- **Label:** Next: add lyrics
- **Disabled state tooltip:** *Add your song first.*

---

## Screen 4 — Add lyrics

### Purpose
Get the lyrics in. Keep this calm — no time-syncing required for v0.1.

### Copy

- **Title:** Add your lyrics.
- **Subtitle:** One line per line. We'll handle the timing.

### Lyric input

- **Placeholder:**
  > Paste your lyrics here.
  > One line per line.
  > Leave a blank line between verses.

- **Helper text (below input):** *About 4–8 words per line reads best on phones.*

- **Character / line counter:** *{n} lines · about {seconds}s of screen time*

### Empty state

> Your lyric area is empty. Paste a verse, a hook, or the whole song.

### Error messages

- **Too long:** *That's a lot of lines. Try trimming to your strongest verse and hook.*
- **All caps detected:** *Your lyrics are in all caps. Want us to fix the casing?* — buttons: **Fix it** / **Keep it**
- **Suspicious paste (HTML/markup):** *Looks like there's extra formatting in there. We'll clean it up.*

### Helper tip (collapsible)

> **Tip:** Pick the part of the song that hits hardest. Lyric videos work best when every line earns its place.

### Primary button

- **Label:** Next: choose format

---

## Screen 5 — Choose format

### Purpose
Let the artist pick where they're posting. Translate aspect ratios into platforms.

### Copy

- **Title:** Where will you post this?
- **Subtitle:** Pick one or pick all three.

### Options (cards with platform icons)

| Card | Label shown | Sub-label |
|---|---|---|
| 9:16 | **Reels, TikTok, Shorts** | Tall video for stories and feeds |
| 1:1 | **Instagram, X** | Square video for the main feed |
| 16:9 | **YouTube** | Wide video for YouTube and websites |

### Helper text

> You can make all three at once. We'll line them up for you.

### Empty state

> Pick at least one format to keep going.

### Primary button

- **Label:** Make my video
- **Disabled tooltip:** *Pick a format first.*

---

## Screen 6 — Generate video

### Purpose
Show progress without ever using technical language. Make the wait feel intentional, not nervous.

### Copy

- **Title:** Making your video.
- **Subtitle:** This usually takes about a minute. You can leave this page — we'll let you know when it's ready.

### Progress states (shown one at a time, in order)

1. *Listening to your song…*
2. *Laying out your lyrics…*
3. *Putting it all together…*
4. *Almost done…*

### Helper text

> Feel free to make a coffee. Or another video — we can handle a few at once.

### Cancel option

- **Link:** Cancel and start over
- **Confirmation:** *Cancel this video? Your song, cover, and lyrics will stay saved.* — buttons: **Keep going** / **Cancel video**

### Error messages

- **Generic failure:** *We couldn't finish your video this time. Your work is saved — try again, or pick a different template.*
  - Buttons: **Try again** / **Pick a different template**
- **Song unreadable mid-process:** *Your song file gave us trouble. Try uploading it again.*
- **Timeout:** *This one's taking longer than usual. We're still working — or you can try again.*

---

## Screen 7 — View / download result

### Purpose
Celebrate the finished video. Make sharing one tap.

### Copy

- **Title:** Your video is ready.
- **Subtitle:** Looks good on you.

### Player

- Shows the finished video, autoplay muted, with a tap-to-unmute prompt.
- Tabs across the top: **Reels / TikTok** · **Instagram / X** · **YouTube** — for switching between the formats they generated.

### Action buttons

- **Primary:** Download
- **Secondary:** Share link
- **Tertiary:** Make another

### Success message (toast, after download)

> Saved. Go post it.

### Success message (toast, after copy share link)

> Link copied.

### Helper text under buttons

> The link works for 30 days. Download a copy if you want to keep it forever.

### Empty state (no video — shouldn't happen, but just in case)

> We couldn't find this video. It may have expired. Make a new one — it only takes a minute.

---

## Mobile-friendly considerations

- **One thing per screen.** Never ask for two uploads, two pickers, or two text fields on one screen at once. Phones are vertical — let the flow be vertical too.
- **Big tap targets.** Every primary button is at least 56pt tall and full-width on mobile.
- **Thumb-zone primary actions.** Keep the main "Next" button anchored to the bottom of the screen, above the keyboard, never floating mid-page.
- **Upload from camera roll first.** On mobile, the song and cover pickers default to the device library — no drag-and-drop language.
- **Keyboard-aware lyric input.** When the keyboard opens, the lyric area scrolls so the current line stays visible.
- **No hover states.** Every helper tip is reachable by tap, never hover.
- **Safe areas.** Respect iOS notch and Android nav bar — no buttons under the home indicator.
- **Offline grace.** If the connection drops mid-flow, save the artist's work locally and show: *Your work is saved on this device. We'll keep going when you're back online.*

---

## Safe-use copy (master version)

This block appears once on Screen 3 and again as fine print on Screen 7. Same words, same tone, every time.

> **Post music you own or are allowed to post.**
> Porterful Visualizer Studio is built for artists releasing their own work, or music they've been cleared to share. By uploading a song, you're confirming you have the rights to it. If you're not sure, check with whoever wrote, recorded, or released the track before posting.

### Short version (used inline near upload buttons)

> *Your song, your rights. Upload music you own or are cleared to use.*

---

## Global copy patterns

### Generic loading

> One moment…

### Generic save confirmation

> Saved.

### Generic destructive confirmation

> Are you sure? This can't be undone.

### Generic offline banner

> You're offline. We'll pick up where you left off when you're back.

### Generic unexpected error

> Something went sideways on our end. Try again in a moment — your work is saved.

---

## What the artist never sees

To keep the tool feeling premium and simple, these words and ideas should **never appear in user-facing copy**:

- File extensions beyond *MP3, WAV, M4A, JPG, PNG*
- Codec, bitrate, resolution, framerate, aspect ratio (use platform names instead)
- "Render," "encode," "build," "compile," "queue," "worker," "job," "process," "pipeline"
- "FFmpeg," "Remotion," "ffprobe," any library name
- Stack traces, exit codes, error codes, log lines
- File paths, URLs to internal services
- "Beta," "experimental," "unstable" — if it's not ready, don't ship it on this screen

If something goes wrong technically, translate it into one of the friendly error messages above. Never show a raw error to a creator.
