#!/usr/bin/env python3
"""YuNet faces on an edit's master at 5 fps -> src/edits/<id>/faces.json
Usage: python3 scripts/detect_faces.py <edit-id> [threshold]
Boxes are [x, y, w, h, score] in 1080x1920 output pixels. Two scales (1x, 2x)
because the subjects are small in wide shots."""
import json, os, sys, urllib.request
import cv2
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EDIT = sys.argv[1]; TH = float(sys.argv[2]) if len(sys.argv) > 2 else 0.7
URL = 'https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx'
model = os.path.expanduser('~/.cache/yunet_2023mar.onnx')
if not os.path.exists(model) or os.path.getsize(model) < 100_000:
    os.makedirs(os.path.dirname(model), exist_ok=True); urllib.request.urlretrieve(URL, model)
cap = cv2.VideoCapture(os.path.join(ROOT, 'public', EDIT, 'video', 'master.mp4'))
fps = cap.get(cv2.CAP_PROP_FPS); step = round(fps / 5); out = []; i = 0
def iou(a, b):
    x1, y1 = max(a[0], b[0]), max(a[1], b[1]); x2, y2 = min(a[0]+a[2], b[0]+b[2]), min(a[1]+a[3], b[1]+b[3])
    inter = max(0, x2-x1) * max(0, y2-y1); return inter / (a[2]*a[3] + b[2]*b[3] - inter + 1e-9)
while True:
    ok, img = cap.read()
    if not ok: break
    if i % step == 0:
        h, w = img.shape[:2]; found = []
        for s in (1.0, 2.0):
            im = cv2.resize(img, (int(w*s), int(h*s))) if s != 1 else img
            det = cv2.FaceDetectorYN.create(model, '', (im.shape[1], im.shape[0]), TH, 0.3, 50)
            _, f = det.detect(im)
            for r in (f if f is not None else []):
                found.append([round(float(r[0]/s)), round(float(r[1]/s)), round(float(r[2]/s)), round(float(r[3]/s)), round(float(r[-1]), 2)])
        found.sort(key=lambda b: -b[4]); kept = []
        for b in found:
            if all(iou(b, k) < 0.3 for k in kept): kept.append(b)
        out.append({'t': round(i / fps, 2), 'faces': kept})
    i += 1
json.dump(out, open(os.path.join(ROOT, 'src', 'edits', EDIT, 'faces.json'), 'w'), separators=(',', ':'))
print(len(out), 'samples')
