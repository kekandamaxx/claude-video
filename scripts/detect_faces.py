#!/usr/bin/env python3
"""YuNet faces on an edit's 1080x1920 master at 5 fps -> faces.json ([x, y, w, h, conf] in px).
Small, distant subjects (wide gym shots) are found by running the detector on a 2x upscale too.
Usage: python3 scripts/detect_faces.py public/<id>/video/master.mp4 src/edits/<id>/faces.json [min_conf]"""
import json, os, sys, urllib.request
import cv2

URL = ('https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/'
       'face_detection_yunet/face_detection_yunet_2023mar.onnx')
CACHE = os.path.expanduser('~/.cache/yunet_2023mar.onnx')
src, out = sys.argv[1], sys.argv[2]
thr = float(sys.argv[3]) if len(sys.argv) > 3 else 0.6
if not os.path.exists(CACHE):
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    urllib.request.urlretrieve(URL, CACHE)
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
W, H = int(cap.get(3)), int(cap.get(4))
d1 = cv2.FaceDetectorYN.create(CACHE, '', (W, H), score_threshold=thr, nms_threshold=0.3, top_k=50)
d2 = cv2.FaceDetectorYN.create(CACHE, '', (W * 2, H * 2), score_threshold=thr, nms_threshold=0.3, top_k=50)
res, i, step = [], 0, round(fps / 5)
while True:
    ok, fr = cap.read()
    if not ok:
        break
    if i % step == 0:
        boxes = []
        _, f1 = d1.detect(fr)
        for f in (f1 if f1 is not None else []):
            boxes.append([int(f[0]), int(f[1]), int(f[2]), int(f[3]), round(float(f[-1]), 2)])
        _, f2 = d2.detect(cv2.resize(fr, (W * 2, H * 2), interpolation=cv2.INTER_CUBIC))
        for f in (f2 if f2 is not None else []):
            b = [int(f[0] / 2), int(f[1] / 2), int(f[2] / 2), int(f[3] / 2), round(float(f[-1]), 2)]
            if not any(abs(b[0] - o[0]) < max(b[2], 12) and abs(b[1] - o[1]) < max(b[3], 12) for o in boxes):
                boxes.append(b)
        res.append({'t': round(i / fps, 2), 'faces': boxes})
    i += 1
json.dump(res, open(out, 'w'), separators=(',', ':'))
print(f'{len(res)} samples, {sum(len(r["faces"]) for r in res)} boxes -> {out}')
