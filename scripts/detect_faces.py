"""Face boxes for an edit's master clip, sampled at 5 fps, in 1080x1920 pixels.
Writes src/edits/<id>/faces.json: [{t, faces: [[x, y, w, h, conf], ...]}].
Usage: python3 scripts/detect_faces.py <edit-id>"""
import cv2, json, os, sys, urllib.request
EDIT = sys.argv[1]
URL = ('https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/'
       'face_detection_yunet/face_detection_yunet_2023mar.onnx')
CACHE = os.path.expanduser('~/.cache/claude-video'); os.makedirs(CACHE, exist_ok=True)
model = os.path.join(CACHE, 'yunet_2023mar.onnx')
if not os.path.exists(model): urllib.request.urlretrieve(URL, model)
cap = cv2.VideoCapture(f'public/{EDIT}/video/master.mp4')
det = cv2.FaceDetectorYN.create(model, '', (1080, 1920), 0.6, 0.3, 5000)
out, i = [], 0
while True:
    ok, frame = cap.read()
    if not ok: break
    if i % 6 == 0:
        _, f = det.detect(frame)
        faces = [] if f is None else [[int(b[0]), int(b[1]), int(b[2]), int(b[3]), round(float(b[14]), 2)] for b in f]
        out.append({'t': round(i / 30, 2), 'faces': faces})
    i += 1
json.dump(out, open(f'src/edits/{EDIT}/faces.json', 'w'), separators=(',', ':'))
print(len(out), 'samples,', sum(len(o['faces']) for o in out), 'face boxes')
