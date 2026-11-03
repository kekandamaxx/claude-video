# UMPSA Handball: Timeout Talk (Remotion edit)

A 9:16 edit (1080×1920, 30 fps, 25.0 s) of `IMG_7678.MOV`, which is 42.9 s of raw footage of a team talk during a timeout. It is made for TikTok and Instagram Reels. The coach approved the preview and the corrections below; `npm run render:final` produces the delivered file.

## Pipeline

```
IMG_7678.MOV
 ├─ transcription  faster-whisper large-v3 with word timestamps  → src/data/transcript.json
 ├─ face detection OpenCV YuNet at 5 fps                         → src/data/faces.json
 ├─ scripts/prepare_media.sh  upright master and proxy, voice chain, music, SFX → public/
 └─ Remotion composition "TimeoutEdit"                           → out/preview.mp4 / out/final.mp4
```

```bash
npm install
scripts/prepare_media.sh /path/to/IMG_7678.MOV   # downloads the Mixkit music and SFX too
npm run preview        # 540p preview, loudness-mastered
npm run guides         # still with the safe-zone and face-box overlay
npm run qa:audio       # renders the stems, then checks per-word voice masking
npm run render:final   # 1080p final; run only after the preview is approved
```

## Transcript and edit decisions

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

Output order: hook → 5 minit → Syahmi / target / rotate → lineup → last 3 minutes → COME ON → end card. The ranges live in `src/lib/edl.ts`. Every graphic and SFX cue is tied to word timestamps through `at(segment, sourceTime)`, so changing one cut moves everything that follows it.

## Safe zones and faces

- Platform UI no-go areas (TikTok and IG combined): top 0–250, bottom 1440–1920, right 960–1080, left 0–60.
- Measured faces: y 680–1060 across the whole clip.
- Graphics stay in **y 260–610** (the sky, above every face). Captions stay in **y 1150–1410** (bodies, below the faces).
- Zooms pivot at y=864, the centre of the face band, so the faces barely move when the frame punches in.
- `npm run guides` or the `guides: true` prop draws the zones and the face boxes detected on each frame.

## Audio

- Voice: high-pass at 90 Hz, gentle FFT denoise against the crowd, a −2 dB cut at 250 Hz, +3 dB at 3.4 kHz, 3:1 compression, normalised to −14 LUFS. The closing "Ok / Come on" was recorded quieter, so it gets a +5 dB clip gain.
- Music: Mixkit "Epical Drums 02" (117.5 BPM). Only 8% of its energy sits in the 300 Hz–3 kHz voice band, and an extra EQ notch at 1–4 kHz widens the gap. It starts on its first drum hit (2.04 s), so the downbeat lands on the hook.
- Ducking: the music sits at 0.10 under speech and 0.28 in gaps, with a 3-frame attack and a 10-frame release. The SFX bus is side-chained to the same speech envelope at −14 dB.
- Measured (`npm run qa:audio`): median voice-over-music margin 14.3 dB. Every one of the 67 kept words is at least 8 dB above music+SFX (median 13.9 dB). The master is at −14.0 LUFS, −1.0 dBTP.
- SFX come from Mixkit (free licence): cinematic impact, whooshes, swooshes, pops, a clock tick, a heartbeat, a riser, stadium crowd and a game buzzer. `prepare_media.sh` lists the IDs.

## Corrections confirmed by the coach

The raw ASR stays untouched in `src/data/transcript.json`. The fixes are applied in `src/lib/edl.ts` (`FIX` for single words, `MERGE` for words the ASR split):

- "Syamil" → **Syahmi**, "Bukri" → **Muqri** (Chai and Jason were already correct).
- "nasib baik kita pun ada" → "nasib baik **keeper** ada".
- Confirmed as written: "2 aku tu keluarkan", the "0 GOL" stat, and the end card "UMPSA Handball · Last 3 minutes".
