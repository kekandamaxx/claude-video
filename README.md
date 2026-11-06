# UMPSA Handball: coach-talk edits (Remotion)

A Remotion template for vertical 9:16 edits (1080×1920, 30 fps) of raw coach talks, made for TikTok and Instagram Reels. There is one composition per source clip. All of them share the same pipeline: transcript-driven cuts, motion graphics that avoid faces, captions inside the safe area, premium SFX and ducked music.

| Composition | Source | Raw → cut | Status |
|---|---|---|---|
| `TimeoutEdit` | `IMG_7678.MOV`, handball timeout talk | 42.9 s → 25.0 s | final delivered, all corrections confirmed |
| `SemifinalEdit` | `IMG_7546.MOV`, pep talk before the semifinal | 89.3 s → 45.7 s | final delivered, all corrections confirmed |
| `BriefingEdit` | chat upload, coach briefing on reacting to elbows | 32.0 s → 18.6 s | preview awaiting approval |
| `VivaEdit` | Viva! juice teaser: taste-test clip + pallet B-roll + 3 bottle stills | 35.4 s + 3.8 s + stills → 21.1 s | preview awaiting approval |

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

To confirm: "Mesir" (ASR heard "mesin"), "akak" (ASR heard "kat akhir"), who says "25 persen" and what the 25% refers to, and whether the guava drink is a Viva! product. The graphics name Viva! only on the pomegranate stills. The added texts "Uji rasa" and "Promo akan datang" also need checking.

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
