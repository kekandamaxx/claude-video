#!/usr/bin/env python3
"""Malay voice-over for the two-pivot clip: replaces the French narration.

1. Demucs (htdemucs, two stems) splits the source audio into voice and bed (music + SFX).
2. Each Malay sentence is spoken by Edge TTS ms-MY-OsmanNeural (male, like the original
   narrator), starting where the French sentence started. The speaking rate is raised
   per sentence until it fits before the next French sentence.
3. Voice chain as in the README, the bed is side-chain ducked under it, mix to -14 LUFS / -1 dBTP.
4. Subtitle cues from malay_subs.CUES are retimed to the TTS word boundaries.

Writes <out_dir>/voice_ms.wav, mix_ms.wav, cues_ms.json. Then run malay_subs.py.
usage: scripts/malay_voiceover.py <source.mp4> <out_dir>
"""
import asyncio, difflib, io, json, os, re, ssl, subprocess, sys
from pathlib import Path

import edge_tts, edge_tts.communicate
import numpy as np, soundfile as sf

sys.path.insert(0, str(Path(__file__).parent))
from malay_subs import CUES  # noqa: E402

VOICE = "ms-MY-OsmanNeural"
SR = 48000
BASE_RATE, MAX_RATE = 12, 45      # percent
GAP = 0.15                        # breath kept before the next sentence
OUTRO_CUES = 2                    # the last cues translate on-screen text; no narration there

# (French sentence start, Malay text as spoken)
SENTENCES = [
    (0.60, "Kau lawan pertahanan yang melekat di garisan, tapi tak jumpa celah."),
    (4.50, "Masa untuk keluarkan sistem dua pivot!"),
    (7.30, "Matlamatnya, cipta huru-hara di tengah."),
    (10.16, "Langkah satu: transformasi."),
    (12.22, "Sambil bola bergerak di atas, pemain sayap kau atau salah seorang pemain belakang "
            "tinggalkan posisi sambil memecut, untuk jadi pivot kedua di garisan enam meter."),
    (20.82, "Langkah dua: membelah Laut Merah."),
    (23.46, "Dua pivot menjarak dan pasang blok besar pada defender tengah."),
    (27.56, "Mereka betul-betul belah pertahanan jadi dua, dan buka lubang besar tepat di tengah."),
    (32.30, "Langkah tiga: hukuman!"),
    (34.56, "Sebab defender dah terkunci di garisan oleh pivot kau, pemain belakang kau "
            "ada lebuh raya sebenar untuk masuk laju,"),
    (40.66, "rempuh lubang tengah, dan bedil penjaga gol dari jarak dekat."),
]
END_OF_NARRATION = 44.90

edge_tts.communicate._SSL_CTX = ssl.create_default_context(
    cafile=os.environ.get("SSL_CERT_FILE", "/root/.ccr/ca-bundle.crt"))


async def tts(text, rate):
    cm = edge_tts.Communicate(text, VOICE, rate=f"+{rate}%", boundary="WordBoundary",
                              proxy=os.environ.get("HTTPS_PROXY"))
    audio, words = b"", []
    async for ch in cm.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            words.append({"w": ch["text"], "s": ch["offset"] / 1e7, "e": (ch["offset"] + ch["duration"]) / 1e7})
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", "pipe:0", "-f", "f32le", "-ac", "1", "-ar", str(SR), "pipe:1"],
                         input=audio, capture_output=True, check=True).stdout
    return np.frombuffer(pcm, np.float32), words


def speak(text, avail):
    rate = BASE_RATE
    while True:
        pcm, words = asyncio.run(tts(text, rate))
        span = words[-1]["e"] - words[0]["s"]
        if span <= avail or rate >= MAX_RATE:
            return pcm, words, rate, span
        rate = min(MAX_RATE, int(np.ceil((100 + rate) * span / avail - 100)) + 2)


def norm(tok):
    tok = tok.lower().strip(".,:;!?\"'")
    return {"1": "satu", "2": "dua", "3": "tiga", "6": "enam"}.get(tok, tok)


def retime(words):
    cue_toks, owner = [], []
    for i, (_, _, txt) in enumerate(CUES[:-OUTRO_CUES]):
        for t in re.sub(r"[{}]", "", txt).split():
            cue_toks.append(norm(t)); owner.append(i)
    said = [norm(w["w"]) for w in words]
    tmap = {}
    for a, b, n in difflib.SequenceMatcher(None, cue_toks, said, autojunk=False).get_matching_blocks():
        for k in range(n):
            tmap[a + k] = b + k
    starts = []
    for i in range(len(CUES) - OUTRO_CUES):
        idx = [j for j, o in enumerate(owner) if o == i]
        hit = [tmap[j] for j in idx if j in tmap]
        assert hit, f"cue {CUES[i][2]!r} matched no spoken word"
        starts.append((words[min(hit)]["s"], words[max(hit)]["e"]))
    cues = []
    for i, (s, last_e) in enumerate(starts):
        nxt = starts[i + 1][0] if i + 1 < len(starts) else last_e + 0.6
        end = nxt if nxt - last_e < 0.5 else last_e + 0.35   # hold through short pauses only
        cues.append([round(s - 0.04, 3), round(end - 0.04, 3), CUES[i][2]])
    cues += [list(c) for c in CUES[-OUTRO_CUES:]]
    return cues


def main():
    src, out = sys.argv[1], Path(sys.argv[2])
    out.mkdir(parents=True, exist_ok=True)
    sep = out / "_sep"
    wav = sep / "src.wav"
    sep.mkdir(exist_ok=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vn", "-ac", "2", "-ar", "44100", str(wav)], check=True)
    subprocess.run([sys.executable, "-m", "demucs", "-n", "htdemucs", "--two-stems=vocals", "-o", str(sep), str(wav)],
                   check=True, capture_output=True)
    bed = sep / "htdemucs" / "src" / "no_vocals.wav"
    dur = sf.info(str(wav)).duration

    track, all_words = np.zeros(int(dur * SR) + SR, np.float32), []
    for k, (start, text) in enumerate(SENTENCES):
        limit = SENTENCES[k + 1][0] if k + 1 < len(SENTENCES) else END_OF_NARRATION
        pcm, words, rate, span = speak(text, limit - start - GAP)
        shift = start - words[0]["s"]                      # first word lands on the French onset
        a = int(max(shift, 0) * SR); skip = int(max(-shift, 0) * SR)
        seg = pcm[skip:]
        track[a:a + len(seg)] += seg[: len(track) - a]
        for w in words:
            all_words.append({"w": w["w"], "s": round(w["s"] + shift, 3), "e": round(w["e"] + shift, 3)})
        print(f"{start:6.2f}  rate +{rate:2d}%  {span:4.2f}s / {limit - start - GAP:4.2f}s  {text[:48]}")

    raw = out / "_voice_raw.wav"
    sf.write(str(raw), track[: int(dur * SR)], SR)
    voice = out / "voice_ms.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af",
                    "highpass=f=90,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3400:t=q:w=1:g=3,"
                    "acompressor=threshold=0.1:ratio=3:attack=5:release=120:makeup=2", "-ar", str(SR), str(voice)], check=True)
    mix = out / "mix_ms.wav"
    fc = ("[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit[v1][v2];"
          "[1:a]aresample=48000,volume=-3dB[b];"
          "[b][v1]sidechaincompress=threshold=0.02:ratio=8:attack=15:release=350:makeup=1[bd];"
          "[v2][bd]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[m]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(voice), "-i", str(bed), "-filter_complex", fc,
                    "-map", "[m]", "-t", f"{dur:.3f}", str(mix)], check=True)

    cues = retime(all_words)
    (out / "cues_ms.json").write_text(json.dumps(cues, ensure_ascii=False, indent=1), encoding="utf-8")
    (out / "words_ms.json").write_text(json.dumps(all_words, ensure_ascii=False, indent=1), encoding="utf-8")
    raw.unlink()
    print(mix)


if __name__ == "__main__":
    main()
