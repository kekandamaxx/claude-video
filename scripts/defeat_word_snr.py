"""DefeatEdit per-word masking check: voice stem vs (music + sfx/room) over each kept word.
Run scripts/stems.sh DefeatEdit and scripts/defeat_words.ts first (npm run qa:defeat-audio does both)."""
import json, wave, numpy as np, sys
def load(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x.reshape(-1, w.getnchannels()).mean(1), w.getframerate()
O = 'out/DefeatEdit'
v, sr = load(f'{O}/stem_voice.wav'); m, _ = load(f'{O}/stem_music.wav'); s, _ = load(f'{O}/stem_sfx.wav')
e = lambda x: 10 * np.log10((x ** 2).mean() + 1e-12)
rows, low = [], 0
for txt, a, b in json.load(open(f'{O}/words.json')):
    i, j = int(a * sr), int(b * sr)
    if j - i < sr * 0.1: continue
    snr = e(v[i:j]) - e(m[i:j] + s[i:j]); rows.append(snr); low += snr < 8
    if snr < 10: print(f'{a:6.2f}s {txt:14} {snr:5.1f} dB' + ('  <-- masked' if snr < 8 else ''))
print(f'words {len(rows)}  median {np.median(rows):.1f} dB  min {min(rows):.1f} dB  below 8 dB: {low}')
sys.exit(1 if low else 0)
