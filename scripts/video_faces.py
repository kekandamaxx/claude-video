"""YuNet face boxes for a 1080x1920 master, sampled at 5 fps.
Usage: python3 scripts/video_faces.py public/<id>/video/master.mp4 src/edits/<id>/faces.json
Writes [{"t": s, "faces": [[x, y, w, h, score], ...]}]. Small, distant faces (players
across a court) need the 2x pass; boxes from both scales are merged by IoU."""
import json, os, sys, urllib.request
import cv2

URL = 'https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx'
CACHE = os.path.join(os.path.expanduser('~'), '.cache', 'friendship', 'yunet_2023mar.onnx')
if not os.path.exists(CACHE) or os.path.getsize(CACHE) < 100_000:
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    urllib.request.urlretrieve(URL, CACHE)

def iou(a, b):
    x1, y1 = max(a[0], b[0]), max(a[1], b[1])
    x2, y2 = min(a[0] + a[2], b[0] + b[2]), min(a[1] + a[3], b[1] + b[3])
    i = max(0, x2 - x1) * max(0, y2 - y1)
    return i / (a[2] * a[3] + b[2] * b[3] - i + 1e-9)

src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
step = round(fps / 5)
dets = {}
res, i = [], 0
while True:
    ok, img = cap.read()
    if not ok:
        break
    if i % step == 0:
        h, w = img.shape[:2]
        found = []
        for scale in (1.0, 2.0):
            sw, sh = int(w * scale), int(h * scale)
            im = cv2.resize(img, (sw, sh), interpolation=cv2.INTER_CUBIC) if scale != 1 else img
            key = (sw, sh)
            if key not in dets:
                dets[key] = cv2.FaceDetectorYN.create(CACHE, '', key, score_threshold=0.6, nms_threshold=0.3, top_k=200)
            _, faces = dets[key].detect(im)
            for f in ([] if faces is None else faces):
                found.append([float(f[0]) / scale, float(f[1]) / scale, float(f[2]) / scale, float(f[3]) / scale, float(f[-1])])
        found.sort(key=lambda b: -b[4])
        keep = []
        for b in found:
            if all(iou(b, k) < 0.3 for k in keep):
                keep.append(b)
        res.append({'t': round(i / fps, 2), 'faces': [[round(v) for v in b[:4]] + [round(b[4], 2)] for b in keep]})
    i += 1
json.dump(res, open(out, 'w'))
ys = [b[1] for r in res for b in r['faces'] if b[4] >= 0.7]
ye = [b[1] + b[3] for r in res for b in r['faces'] if b[4] >= 0.7]
hs = [b[3] for r in res for b in r['faces'] if b[4] >= 0.7]
print(f'{len(res)} samples; faces (conf>=0.7): {len(ys)}; y {min(ys):.0f}-{max(ye):.0f}; h {min(hs):.0f}-{max(hs):.0f}')
