"""Per-word masking check: for every kept word, voice energy vs (music + sfx)
energy over the word's own span in the rendered stems. Flags words < 8 dB.
Usage: python3 scripts/word_snr.py <edit-id> <Composition>   (run scripts/stems.sh first)"""
import json, re, wave, numpy as np, sys
FPS = 30
EDIT, COMP = sys.argv[1], sys.argv[2]
src = open(f'src/edits/{EDIT}/edl.ts').read()
SEGS = [(m[0], float(m[1]), float(m[2])) for m in re.findall(r"id: '(\w+)', srcStart: ([\d.]+), srcEnd: ([\d.]+)", src)]
tr = json.load(open(f'src/edits/{EDIT}/transcript.json'))
words, out = [], 0
for _, a, b in SEGS:
    f0 = round(a * FPS); ln = round(b * FPS) - f0
    for s in tr['segments']:
        for w in s['words']:
            if w['s'] >= a - 0.05 and w['e'] <= b + 0.1:
                words.append((w['w'], out + (max(w['s'], a) - a), out + (min(w['e'], b) - a)))
    out += ln / FPS
def load(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x.reshape(-1, w.getnchannels()).mean(1), w.getframerate()
v, sr = load(f'out/{COMP}/stem_voice.wav'); m, _ = load(f'out/{COMP}/stem_music.wav'); s, _ = load(f'out/{COMP}/stem_sfx.wav')
e = lambda x: 10 * np.log10((x ** 2).mean() + 1e-12)
low = 0; rows = []
for txt, a, b in sorted(words, key=lambda r: r[1]):
    i, j = int(a * sr), int(b * sr)
    snr = e(v[i:j]) - e(m[i:j] + s[i:j]); rows.append(snr)
    short = (b - a) < 0.1  # ASR timestamp too short to measure
    flag = ' <-- masked' if (snr < 8 and not short) else (' (span too short to measure)' if short else '')
    low += snr < 8 and not short
    print(f"{a:6.2f}s {txt:12} {snr:5.1f} dB{flag}")
print(f"words {len(rows)}  median {np.median(rows):.1f} dB  min {min(rows):.1f} dB  below 8 dB: {low}")
sys.exit(1 if low else 0)
