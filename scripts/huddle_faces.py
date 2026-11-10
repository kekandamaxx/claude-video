"""YuNet face boxes for a 1080x1920 master at 5 fps -> faces.json ([x, y, w, h, score], full-scale px).
Usage: python3 scripts/huddle_faces.py public/huddle/video/master.mp4 src/edits/huddle/faces.json
Runs at 1x and 1.6x so the small faces in the back row are found too; boxes are merged by IoU.
`--clean-only` re-applies the false-hit filter to an existing faces.json."""
import cv2, json, sys, os
# False hits checked by eye: from 24.1 s to 49.6 s (clip2, clip3, clip4) the players nearest the lens show
# the back of the head or an ear, which YuNet scores 0.75-0.78 at y > 820; every real face
# in those clips has its top above y 760.
def false_hit(t, b):
    return 24.1 <= t < 49.6 and b[1] > 820 and b[4] < 0.8
def clean(samples):
    return [{'t': s['t'], 'faces': [b for b in s['faces'] if not false_hit(s['t'], b)]} for s in samples]
if sys.argv[1] == '--clean-only':
    json.dump(clean(json.load(open(sys.argv[2]))), open(sys.argv[2], 'w'), separators=(',', ':')); sys.exit(0)
src, dst = sys.argv[1], sys.argv[2]
model = os.path.expanduser('~/.cache/friendship/yunet_2023mar.onnx')
cap = cv2.VideoCapture(src); fps = cap.get(cv2.CAP_PROP_FPS); step = round(fps / 5)
def iou(a, b):
    ax2, ay2, bx2, by2 = a[0]+a[2], a[1]+a[3], b[0]+b[2], b[1]+b[3]
    iw = max(0, min(ax2, bx2) - max(a[0], b[0])); ih = max(0, min(ay2, by2) - max(a[1], b[1]))
    inter = iw * ih; return inter / (a[2]*a[3] + b[2]*b[3] - inter + 1e-6)
dets = {}
out = []; i = 0
while True:
    ok, img = cap.read()
    if not ok: break
    if i % step == 0:
        found = []
        for sc in (1.0, 1.6):
            w, h = int(1080*sc), int(1920*sc)
            im = img if sc == 1.0 else cv2.resize(img, (w, h), interpolation=cv2.INTER_CUBIC)
            if sc not in dets: dets[sc] = cv2.FaceDetectorYN.create(model, '', (w, h), score_threshold=0.75, nms_threshold=0.3, top_k=200)
            _, f = dets[sc].detect(im)
            if f is None: continue
            for r in f:
                b = [r[0]/sc, r[1]/sc, r[2]/sc, r[3]/sc, float(r[14])]
                if not any(iou(b, o) > 0.3 for o in found): found.append(b)
        out.append({'t': round(i / fps, 2), 'faces': [[int(b[0]), int(b[1]), int(b[2]), int(b[3]), round(b[4], 2)] for b in found]})
    i += 1
os.makedirs(os.path.dirname(dst), exist_ok=True)
json.dump(clean(out), open(dst, 'w'), separators=(',', ':'))
print(len(out), 'samples')
