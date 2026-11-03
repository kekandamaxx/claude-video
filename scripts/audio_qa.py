"""Voice-vs-bed check on rendered stems (out/stem_*.wav).
For every 100 ms window where the voice stem is active, report how far the
voice sits above music+sfx. Target: >= 10 dB (speech intelligibility margin)."""
import sys, wave, numpy as np

def load(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return a.reshape(-1, w.getnchannels()).mean(1), w.getframerate()

v, sr = load('out/stem_voice.wav'); m, _ = load('out/stem_music.wav'); s, _ = load('out/stem_sfx.wav')
n = min(len(v), len(m), len(s)); hop = sr // 10; k = n // hop
def db(x): return 10 * np.log10((x[:k * hop].reshape(k, hop) ** 2).mean(1) + 1e-10)
dv, dm, ds = db(v), db(m), db(s); bed = 10 * np.log10(10 ** (dm / 10) + 10 ** (ds / 10))
active = dv > dv.max() - 30
margin = dv - bed
print(f"speech windows: {active.sum()}  median margin {np.median(margin[active]):.1f} dB  min {margin[active].min():.1f} dB")
print(f"voice-vs-music margin median {np.median((dv - dm)[active]):.1f} dB")
bad = np.where(active & (margin < 6))[0]
for i in bad[:20]: print(f"  t={i/10:5.1f}s  voice {dv[i]:6.1f}  music {dm[i]:6.1f}  sfx {ds[i]:6.1f}  margin {margin[i]:5.1f}")
mix = v[:n] + m[:n] + s[:n]; print(f"mix sample peak {20*np.log10(np.abs(mix).max()):.2f} dBFS")
share_low = (active & (margin < 6)).sum() / active.sum()
print(f"windows under 6 dB: {share_low*100:.1f}%")
peak = 20*np.log10(np.abs(mix).max())
sys.exit(1 if (np.median(margin[active]) < 12 or share_low > 0.05 or peak > -1) else 0)
