# UMPSA Handball: coach-talk edits (Remotion)

A Remotion template for vertical 9:16 edits (1080×1920, 30 fps) of raw coach talks, made for TikTok and Instagram Reels. There is one composition per source clip. All of them share the same pipeline: transcript-driven cuts, motion graphics that avoid faces, captions inside the safe area, premium SFX and ducked music.

| Composition | Source | Raw → cut | Status |
|---|---|---|---|
| `TimeoutEdit` | `IMG_7678.MOV`, handball timeout talk | 42.9 s → 25.0 s | final delivered, all corrections confirmed |
| `SemifinalEdit` | `IMG_7546.MOV`, pep talk before the semifinal | 89.3 s → 45.7 s | final delivered, all corrections confirmed |
| `BriefingEdit` | chat upload, coach briefing on reacting to elbows | 32.0 s → 18.6 s | preview awaiting approval |
| `FriendshipTribute` | 16 photos, 16:9 tribute "A Friendship to Remember" | 16 stills → 172.0 s | rendered |
| `VivaEdit` | Viva! juice teaser: taste-test clip + pallet B-roll + 3 bottle stills | 35.4 s + 3.8 s + stills → 21.1 s | final delivered, all items confirmed |
| `DrillEdit` | `IMG_6114/6115/6116.MOV`, defence drill talk (3 clips) | 41.3 s → 19.9 s + 2.5 s end card | preview awaiting approval |

## Layout

```
src/lib/edl.ts            createEdl(): kept ranges + transcript → segments, captions, speech mask
src/lib/edit.tsx          EditConfig + context (everything that differs per video)
src/components/           shared template: graded video, cut flash, captions, audio mix, guides
src/edits/<id>/           per video: edl.ts (cuts), Graphics.tsx, index.ts (SFX cues, levels),
                          transcript.json (Whisper large-v3 words), faces.json (YuNet, 5 fps)
scripts/prepare_media.sh  <id> <source.MOV> → public/<id>/ (master, proxy, voice); public/shared/ (music, SFX)
scripts/render.sh         <Comp> preview|final → out/<Comp>/, loudness-mastered to −14 LUFS / −1 dBTP
scripts/overlap_qa.py     every frame: overlays vs face boxes, and overlays vs the safe area
scripts/video_faces.py    YuNet faces at 5 fps (1x + 2x pass for distant faces) → faces.json
hyperframes/<id>/         HyperFrames overlay project (HTML + GSAP) → transparent WebM plate (EditConfig.overlay)
scripts/stems.sh + word_snr.py + audio_qa.py   per-word voice masking check
```

```bash
npm install
scripts/prepare_media.sh semifinal /path/to/IMG_7546.MOV
COMP=SemifinalEdit npm run preview
COMP=SemifinalEdit npm run qa:faces
COMP=SemifinalEdit EDIT=semifinal npm run qa:audio
COMP=SemifinalEdit npm run render:final      # only after the preview is approved
```

The refactor to multiple compositions was checked against the delivered `TimeoutEdit`. Seven full frames and the full audio mix are bit-identical before and after.

## Shared rules

- Platform UI no-go areas (TikTok and IG combined): top 0–250, bottom 1440–1920, right 960–1080, left 0–60.
- Graphics live in **y 260–610**, above every measured face in both clips.
- Captions go where the faces leave room. They are below the faces at y 1150–1410, or above them at y 665–865 when the face band sits low. Each segment sets this (`captionY`) from `faces.json`.
- Zooms pivot on that take's coach face (`zoomOriginY`), so faces barely move when the frame punches in.
- Voice chain: high-pass at 90 Hz, gentle FFT denoise, −2 dB at 250 Hz, +3 dB at 3.4 kHz, 3:1 compression, normalised to −14 LUFS.
- Music: Mixkit "Epical Drums 02", with a 1–4 kHz pocket carved out for the voice. It sits at 0.10 under speech and 0.28 in gaps. The SFX bus is side-chained to the same speech envelope at −14 dB.
- Every kept word must be at least 8 dB above music+SFX (`word_snr.py`).

## DrillEdit: edit decisions (19.9 s + 2.5 s end card)

Three clips joined into one source by `scripts/prepare_drill.sh` (6114 at 0.000 s, 6115 at 5.455 s, 6116 at 20.403 s). Whisper large-v3 ran on the joined track and on each clip alone; the kept lines agree in both passes except where noted.

Motion graphics are split between two engines:
- **HyperFrames** (`hyperframes/drill`, HTML + GSAP): the hook title, the ATTACK → DEFENSE swap and the end card. `hyperframes/render.sh drill` renders a transparent VP9 WebM (`public/drill/overlay/hf_overlay.webm`, 22.4 s) that Remotion lays over the whole edit from frame 0. Its `data-start` values are output seconds; the word times come from `T` in `src/edits/drill/Graphics.tsx`.
- **Remotion** (`src/edits/drill/Graphics.tsx`): touch / patah balik steps, footsteps on each "tok", the lama-lama bar, the "01" stamp, "macam ni" chevrons, "defense kena macam ni", "sebab apa?" glitch, and the berdua-vs-defense cards.

Layout: every face sits at y 824-1081 and the coach demonstrates with his whole body, so the floor stays clear. Captions go above the heads (centre y 700, x 90-930, at most 4 words, split on phrase breaks) and graphics in the top band (y 260-650). Each take zooms 1.16-1.4x, pivoting on the coach's face (`zoomOriginX`/`zoomOriginY`).

| # | Source time | Speech |
|---|---|---|
| 1 | 20.76-22.36 | **HOOK** (cold open) Melainkan dia lompat, baru you move. |
| 2 | 0.72-4.32 | Sekarang ni kita bukan cerita pasal attack ni, kita nak cerita pasal korang punya defense. |
| 3 | 5.58-8.76 | Aku kata, bila dapat bola je, korang kena touch, korang patah balik. |
| 4 | 12.04-13.86 | Bila jalan, tok, jalan, tok, tok, tok. (the next five "tok" cut) |
| 5 | 14.36-15.26 | Lama-lama. |
| 6 | 17.86-18.50 | Itu satu. |
| 7 | 24.30-26.04 | Kalau dia floor base, korang macam ni. |
| 8 | 26.90-29.06 | Sebab itulah korang punya defense kena macam ni. |
| 9 | 33.22-34.60 | Itu defense. Sebab apa? |
| 10 | 35.20-36.72 | Bila korang berdua, korang tak ada reverse. |
| 11 | 37.04-38.36 | **CLIMAX** Bila defense, korang banyak reverse. |

Not used: "That's why" lead-ins, "Okay? Right?", the repeated "tok", "Alright?", 30.1-31.1 ("Defense 3, lompat" / "Defend drill, nampak?": the passes disagree), "Okay?" before "Itu defense", the trailing "Right? Okay." and all dead air.

QA results: 0 of 672 frames with an overlay on a face or outside the safe area. 75 words, median 20.8 dB above music+SFX, none under 8 dB; the music sits at 0.055 under speech (5 dB under the coach edits) because the phone mic is quiet on an open court. The preview master is at -14 LUFS.

To confirm: "floor base" (one pass heard "flow, base"), "reverse" (a focused pass heard "ribes"), "korang" vs "kau" (the passes differ), and the end card "Defense Drill · UMPSA Handball".

## VivaEdit: edit decisions (21.1 s)

Sources: a taste-test clip (the dialogue track), a 3.8 s pallet pan, and three stills of the Viva! pomegranate bottle. These are 478×850 and 720×1280 phone exports, upscaled with lanczos and a light unsharp (`scripts/prepare_viva.sh`). The music is Mixkit "Sounds Good", an upbeat track with only 18% of its energy in the voice band. Segments can now carry a `visual` (B-roll or still) while the dialogue runs on underneath (a J-cut). Dialogue that runs across a picture-only cut is not faded.

| # | Picture | Dialogue (source time) |
|---|---|---|
| 1 | talk | **HOOK** sip, then "MasyaAllah" (4.60–6.62) |
| 2 | talk | Awak pernah rasa tak? Selalu guava kita Malaysia warna apa? Warna pink kan? Tapi guava dia Mesir, ni colour dia. (7.36–12.84) |
| 3 | talk | Tapi dia punya pekat, dia punya sedap tu. Ya Allah, memang sedap sangat. (13.30–16.60; 0.45 s pause cut) |
| 4 | talk | Dia pekat, berapa persen ada dalam ni? (19.56–20.80; starts on the real onset) |
| 5 | talk | 25… 25 persen. (22.22–23.80) |
| 6 | pallet B-roll | Tak sabar akak nak promo kat korang (26.10–28.70) |
| 7 | crates still | semua yang best-best (28.70–30.00) |
| 8 | bottle still | …ni (30.00–30.90) |
| 9 | bottle still + end card | Tunggu-tunggu (31.46–32.46) |

Not used: "Dah dah bangun?" (off-mic), "Nak ni", "Memang sangat sedap guys" (it repeats "memang sedap sangat", and the camera whips to a second person's face) and the trailing "okay".

The face data has four false detections removed: hands and the bottle cap below the chest. Real faces in this clip stay above y 900. QA results: 0 of 632 frames with an overlay on a face or outside the safe area. 58 words with a median of 18.7 dB and a minimum of 9.2 dB.

Confirmed as shown in the preview: "Mesir", "akak", "25% dalam ni", "Uji rasa" and "Promo akan datang".

## BriefingEdit: edit decisions (18.6 s)

Two Whisper passes agree on every kept line. Faces sit low in this clip (y ≥ 998), so the captions use the band above the faces throughout. The music under speech is 2 dB lower than in the other edits because the delivery is quieter.

| # | Source time | Speech |
|---|---|---|
| 1 | 10.60–12.82 | **HOOK** (cold open) Jangan beritahu. Dah banyak kali dah. |
| 2 | 3.28–6.14 | Sekarang ni, bila dia siku-siku, kau panggil dia, "Man, Coach!" |
| 3 | 7.58–9.36 | Biar kita orang ni yang beritahu. |
| 4 | 13.78–17.36 | Nanti TD akan gaduh dekat. Nanti TD akan panggil dia. |
| 5 | 20.20–21.42 | Sikit lagi, sikit lagi. |
| 6 | 21.54–24.18 | Kau tak pernah pun main macam itu. Kau tak tahu kenapa. |
| 7 | 24.62–25.52 | Kau akan tanya dia. |
| 8 | 26.68–27.52 | Kena juga. |
| 9 | 28.32–29.48 | Biasanya dia panggil macam ini. |

Not used: 0.00–2.00 ("kau orang punya sikit karek, mana-mana kali lah", unclear) and a hallucinated line at 30.0 s (confidence 0.00).

QA results: 0 of 558 frames with an overlay on a face or outside the safe area. 59 words with a median of 16.2 dB and a minimum of 9.4 dB.

To confirm: "TD" (ASR heard "TDI"), "Man, Coach!", "gaduh dekat", and the end-card tagline "Biar coach cakap".

## SemifinalEdit: edit decisions (v2, 45.7 s)

The coach asked for 45–50 s, and for the rhetorical repeats to stay ("kena menang", "jiwa nak menang mesti ada", "kita mesti ada di final", "lawan tetap lawan"). Confirmed as written: "sizing", "50 minit yang terakhir", "Pre-semifinal talk".

| # | Source time | Speech |
|---|---|---|
| 1 | 52.24–54.84 | **HOOK** Dua tahun berturut-turut berada di final. Tak semua orang boleh buat. |
| 2 | 17.24–20.72 | Aku memang berharap yang terbaik, duduk di final. |
| 3 | 23.36–27.40 | Korang pilih lah nak warna apa dah. Final tu, no more pressure. (coach's correction; ASR heard "pilih nak menang apa dah"). "Warna" means the medal: gold or silver, and the card shows both. |
| 4 | 29.10–31.46 | Tetapi untuk game kali ni, semifinal kali ni, |
| 5 | 32.58–33.80, 34.60–35.50 | Kita mesti masuk final. Kita mesti ada di final. (0.8 s pause cut) |
| 6 | 59.50–63.94 | Nak tak nak, kita tetap kena menang. Buatlah macam mana cara sekalipun. |
| 7 | 5.97–7.42 | Kita tetap kena menang. (close-up; the graphic moves to the low band) |
| 8 | 8.52–10.40 | Jiwa nak menang, mesti ada. |
| 9 | 11.50–14.98 | Kena tinggal ada 3 biji gol, jiwa nak menang mesti ada. |
| 10 | 68.98–69.66 | Jangan give up. |
| 11 | 77.86–82.50 | Jangan takut sizing apa semua. Tak ada masalah. Teknikal kita bagus. Dia orang laju, kita perlahan. |
| 12 | 37.66–39.42 | Lawan tetap lawan. |
| 13 | 40.84–44.32 | Biarlah sampai ke 50 minit yang terakhir, lawan tetap lawan. |
| 14 | 44.84–47.02 | Kalau nak heret extra time, tariklah extra time. (0.5 s pause cut) |
| 15 | 65.74–67.62 | Lawan! Jiwa nak menang mesti ada. |
| 16 | 36.30–37.70 | Kita mesti ada final. |
| 17 | 47.52–48.64, 49.10–50.20 | **CLIMAX** Kita mesti … ada kat final. (0.45 s of the pause cut) |

Not used: 1.0–5.6 ("so/nak tak nak", the onset is unclear), 15.0–16.4, 20.8–23.4, 55.98–59.48, 69.62–75.56 and 83.0–88.6 (low ASR confidence even after a focused second pass), plus filler and dead air.

QA results: `qa:faces` gives 0 of 1370 frames with an overlay on a face and 0 outside the safe area. `word_snr` gives 122 words with a median of 14.9 dB and a minimum of 8.2 dB. The preview master is at −13.9 LUFS.

Confirmed by the coach: "Kena tinggal ada 3 biji gol", shown on the graphic as "Tinggal 3 biji gol pun".

## TimeoutEdit: edit decisions (final)

| Source time | Speech | Kept? | Why |
|---|---|---|---|
| 0.00–1.08 | 5 minit saja lagi | **Yes (slot 2)** | clearest of the three takes |
| 1.08–5.14 | 5 minit saja lagi ok / 5 minit je lagi | No | repeated twice |
| 5.14–5.88 | Alright | No | filler |
| 6.92–8.72 | Kita tadi aku kira | No | lead-in, so the hook starts on the number |
| 8.72–11.30 | 7 kali attack, satu pun tak dapat | **Yes: HOOK** | strongest line: a hard stat and the tension in it |
| 11.30–14.40 | Tapi diorang attack, nasib baik keeper ada | **Yes** | continues the hook |
| 15.34–19.40 | Kita 7 attack … satu pun tak dapat | No | repeats the hook; contains a 1.7 s pause |
| 19.40–20.04 | Ok | No | filler |
| 20.04–26.24 | So Syahmi mesti, tolong lah, please. Nampak 1 biji lagi, 2 biji lagi. Kita dah rotate, 5 minit lagi | **Yes** | |
| 26.20–31.00 | Ok, alright, the last 3 minutes kalau kita leading 5, ok | No | first take of a line that is repeated more clearly later |
| 31.00–33.56 | Muqri. Chai. Jason. Ready. | **Yes** | |
| 33.50–34.56 | Ok | No | filler and pause |
| 34.56–42.83 | The last 3 minutes, kalau kita masih leading, kalau tak ada gap, 2 aku tu keluarkan, korang balik. Ok. Come on ×3 | **Yes** | |

Corrections confirmed by the coach are applied in `src/edits/timeout/edl.ts` (`fix` and `merge`); the raw ASR stays untouched in `transcript.json`:

- "Syamil" → **Syahmi**, "Bukri" → **Muqri**.
- "nasib baik kita pun ada" → "nasib baik **keeper** ada".
- Confirmed as written: "2 aku tu keluarkan", "0 GOL", and the end card "UMPSA Handball · Last 3 minutes".
- The closing "Ok / Come on" gets a +5 dB clip gain because it was recorded quieter.

## FriendshipTribute: "A Friendship to Remember" (1920×1080, 30 fps, 2:57)

A cinematic photo tribute. It is separate from the 9:16 coach-talk template and has its own code in `src/edits/friendship/`.

```bash
# 1. put the photos in assets/friendship/photos/ (jpg/png/webp; this folder is git-ignored)
npm run prepare:friendship     # faces, colour match, working copies, music, beat grid, grain -> public/friendship/
npm run qa:friendship          # coverage, assets, cuts on downbeats, face-safe framing per frame; EXPECTED_PHOTOS=31 enforces a count
npm run studio                 # preview; all on-screen text is editable as props
npm run render:friendship      # -> out/FriendshipTribute/friendship_final.mp4 (upload copy) + friendship_final_master.mp4
```

| File | Role |
|---|---|
| `story.ts` | everything editable: shots in bars, pairs, motion, transitions in beats, text, camera speeds, grade, music |
| `timeline.ts` | places every shot on the soundtrack's downbeats (`beats.json`); throws on an unknown or repeated photo |
| `framing.ts` | face-safe moves at constant speed; a window may never cut a protected face box |
| `PhotoShot.tsx` | full-frame moves, framed prints with parallax, side-by-side pairs, ending dim |
| `FilmLook.tsx` | grade overlays, vignette, grain, flicker, dust, light leaks, film burn, bokeh |
| `Typography.tsx` | word-by-word serif reveal (Cormorant Garamond italic), gold rule, spaced caps |
| `scripts/friendship_scan.py` | YuNet faces, duplicate check, per-photo colour match, lanczos working copies, blurred backdrops |
| `scripts/friendship_beats.py` | 76 BPM downbeat grid of the soundtrack |

### v2 edit review (what changed from v1, and why)

| Area | v1 | v2 |
|---|---|---|
| Music seam | cut from beat 4 to beat 1, so one bar had 5 beats | 99.80 s → 171.48 s, downbeat to downbeat; the beat grid is 4/4 throughout (bars 3.0–3.2 s) |
| Cutting | equal slots per scene, cuts anywhere in the bar | every cut centred on a downbeat (QA: 13/13); shots last 2, 3 or 4 bars; dissolves in beats (laughter 1, beginning 2, journey 3, appreciation 4) |
| Camera | eased moves that stalled inside dissolves; 7 zoom-ins; amount unrelated to length | constant speed, a fixed pace per second; 3 zoom-ins, 2 zoom-outs, 5 pans, 2 pair drifts, 2 framed drifts; no two neighbours alike |
| Portraits | 5 portraits each alone on a blurred backdrop | two pairs: the elder on the bench + at the airport (the same man); the wedding + the scarf ceremony. The first print opens centred and both glide aside as the second arrives |
| Colour | each photo as shot (boardroom L 31, night gathering yellow, wedding over-bright, China trip desaturated) | each photo pulled part-way to a shared exposure, white point and saturation before the film grade (values in `photos.json → match`) |
| Text | thank-you lines over people's knees | the print lifts and shrinks; the line sits under it (QA: no face or print under the line) |
| Opening | two lines on dark | lamp-glow rise, two lines, gold rule, title in spaced capitals; the text is gone before the first photo arrives |
| Ending | cut to empty bokeh | the last group photo stays, dims and desaturates under the closing lines on the piano outro, fades to black, then the final card |
| Music sync | climax at 119 s, near the scene change | strings enter on the elder pair (bar 25); hospital on the breakdown (bar 34); grave on the rebuild; climax (bar 40) opens the appreciation scene; outro under the closing lines |

### Shot list (bars; 1 bar ≈ 3.12 s)

| Bars | Scene | Shot | Move | Note |
|---|---|---|---|---|
| 0–3 | Opening | two lines + title | lamp glow | soft piano |
| 3–6 | Beginning | 06 boardroom | pull out (framed) | colour lift: dark, flat original; 2.35× upscale needed, so framed |
| 6–9 | | 02 numismatic wall | pan right | desaturated original, saturation restored |
| 9–12 | | 03 mosque visit | drift right (framed) | portrait; travel direction continues |
| 12–15 | | 04 Abu Waqqas tomb | push in | heads near the top edge, so the move is limited |
| 15–17 | Laughter | 07 mamak night | pan left, film-burn entry | |
| 17–19 | | 14 night stall | push in | strongest saturation in the set, toned down |
| 19–21 | | 09 wicker chairs | pan right | yellow cast removed |
| 21–25 | | 10 wedding + 11 scarf ceremony | pair, counter-drift | narrowest photo in the set (509 px) |
| 25–29 | Journey | 16 bench + 15 airport, the elder | pair, light-leak entry | strings enter |
| 29–32 | | 08 park meetup | pan left | |
| 32–36 | | 12 hospital visit | slow push in | music seam and breakdown |
| 36–40 | | 13 grave visit | slow pull out | rebuild |
| 40–44 | Appreciation | 05 night gathering + "Through every moment…" | drift (framed, lifted) | climax; lowest-quality original (864 px, night) |
| 44–52 | | 01 Raya group + "Thank you…", held under the closing lines | push in (framed, lifted) | the strongest group photo closes the film |
| 52–57 | Ending | final card | | fade to black, piano outro |

Music: "We Will Get It" by Eugenio Mininni (Mixkit, free licence for use in videos; downloaded by the prep script and not committed). To use other music, put it at `public/friendship/music.wav`, then run `python3 scripts/friendship_beats.py public/friendship/music.wav src/edits/friendship/beats.json` and re-time the bars in `story.ts`.

Adding photos (the brief named 31; 16 were supplied): copy them into the folder and re-run `prepare:friendship`. Any photo `story.ts` does not list is appended to the Journey scene as a 2-bar shot. That makes the film longer and moves the later music sync points, so place new photos in `story.ts` by hand.

## FriendshipCapcut: 90 s vertical beat edit (1080×1920, 30 fps)

The same 16 photos, cut the way a CapCut beat edit is:
- hard cuts on the song's beats, with short punchy transitions: zoom punch, whip left/right, spin, white flash, shake and blur;
- a scale "pulse" on every beat, bigger on the first beat of each bar;
- clean, bright colour with no film grain;
- bold pop-in titles and karaoke-style lyrics.

Photos fill the screen when every face fits a 9:16 crop; otherwise they run full-width over a blurred copy of themselves.

```bash
npm run prepare:song -- /path/to/your-song.mp3 [start_seconds] [bpm_hint]   # -> public/friendship/song.wav + capcut/song_beats.json
# your own timed lyrics (standard LRC, timestamps against the full song):
#   public/friendship/lyrics.lrc      e.g.  [00:42.10] first line
npm run qa:capcut                                # 16/16 photos once, ~90 s, every cut on a beat, faces clear of titles and lyrics
npm run render:capcut                            # -> out/FriendshipTribute/friendship_capcut.mp4
```

- Song and lyrics are not part of the repo (`public/` is git-ignored), and no lyrics are written into the code. Until `prepare:song` is run with your song, the edit uses a 92 s section of the tribute soundtrack (Mixkit, licensed).
- Set `SONG.showTitle = true` in `src/edits/friendship/capcut/config.ts` to show the "♪ Musafir Rindu" sticker on the opening once the real song is in.
- The shot order, beat lengths and transitions are in `capcut/config.ts`. Beat counts scale together so the edit stays near `SONG.targetSeconds` (90) at any tempo.
- The lyric line on each shot goes in the first band (bottom, top, lower) with no face in it. On the first and last shots the photo sits lower, so the big title never covers anyone.
