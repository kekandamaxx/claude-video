"""Face / safe-zone QA for one composition.
Renders two passes at half scale (faces as white boxes; graphics+captions only),
then for every frame reports overlay pixels that land on a face or outside the
TikTok/IG safe area (x 60-960, y 250-1440 at full scale).
Usage: python3 scripts/overlap_qa.py SemifinalEdit"""
import subprocess, sys, json, numpy as np
comp = sys.argv[1]
W, H = 540, 960
def render(mode):
    out = f'out/qa_{comp}_{mode}.mp4'
    props = json.dumps({"preview": True, "guides": False, "music": False, "sfx": False, "voice": False, "qa": mode})
    subprocess.run(['npx', 'remotion', 'render', comp, out, f'--props={props}', '--scale=0.5', '--crf=8', '--muted', '--log=error'], check=True)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', out, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W)
faces = render('faces') > 128
over = render('overlay') > 40
n = min(len(faces), len(over))
safe = np.zeros((H, W), bool); safe[125:720, 30:480] = True
bad_face = []; bad_safe = []
for i in range(n):
    hit = (faces[i] & over[i]).sum()
    if hit > 20: bad_face.append((i, int(hit)))
    out_ = (over[i] & ~safe).sum()
    if out_ > 20: bad_safe.append((i, int(out_)))
print(f'{comp}: {n} frames checked')
print(f'  frames with overlay on a face: {len(bad_face)}', bad_face[:30])
print(f'  frames with overlay outside safe area: {len(bad_safe)}', bad_safe[:30])
sys.exit(1 if bad_face or bad_safe else 0)
