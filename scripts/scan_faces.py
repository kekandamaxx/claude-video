"""YuNet face scan of a 1080x1920 master at 5 fps -> faces.json [{t, faces:[[x,y,w,h,conf]]}].
Usage: python3 scripts/scan_faces.py public/training/video/master.mp4 src/edits/training/faces.json"""
import cv2, json, os, sys, urllib.request
URL = 'https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx'
cache = os.path.expanduser('~/.cache/yunet_2023mar.onnx')
if not os.path.exists(cache) or os.path.getsize(cache) < 100_000:
    os.makedirs(os.path.dirname(cache), exist_ok=True); urllib.request.urlretrieve(URL, cache)
src, out = sys.argv[1], sys.argv[2]
cap = cv2.VideoCapture(src)
det = cv2.FaceDetectorYN.create(cache, '', (1080, 1920), 0.6, 0.3, 5000)
res, i = [], 0
while True:
    ok, fr = cap.read()
    if not ok: break
    if i % 6 == 0:
        det.setInputSize((fr.shape[1], fr.shape[0]))
        _, f = det.detect(fr)
        faces = [] if f is None else [[int(a[0]), int(a[1]), int(a[2]), int(a[3]), round(float(a[14]), 2)] for a in f]
        res.append({'t': round(i / 30, 2), 'faces': faces})
    i += 1
json.dump(res, open(out, 'w'), separators=(',', ':'))
print(len(res), 'samples;', sum(len(r['faces']) for r in res), 'faces')
