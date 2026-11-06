#!/usr/bin/env python3
"""Scan the friendship photo folder and build everything the Remotion edit reads.

Usage: python3 scripts/friendship_scan.py [photos_dir]   (default: assets/friendship/photos)

For every image (jpg/jpeg/png/webp, natural filename order) it:
  * applies EXIF orientation, rejects exact duplicates (pixel hash),
  * detects faces with YuNet (OpenCV zoo, 2023mar) and stores normalised boxes,
  * writes a lanczos-upscaled working copy to public/friendship/img/ (originals untouched),
  * writes a pre-blurred 1920x1080 backdrop to public/friendship/bg/ (used for portraits),
then writes src/edits/friendship/photos.json (the manifest the composition imports).
"""
import hashlib
import json
import os
import re
import subprocess
import sys
import urllib.request

import cv2

os.environ.setdefault("OPENCV_LOG_LEVEL", "ERROR")
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, sys.argv[1] if len(sys.argv) > 1 else 'assets/friendship/photos')
PUB = os.path.join(ROOT, 'public', 'friendship')
MANIFEST = os.path.join(ROOT, 'src', 'edits', 'friendship', 'photos.json')
CACHE = os.path.join(os.path.expanduser('~'), '.cache', 'friendship')
YUNET_URL = ('https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/'
             'face_detection_yunet/face_detection_yunet_2023mar.onnx')
EXTS = ('.jpg', '.jpeg', '.png', '.webp')
# Working copies must cover 1920x1080 at the deepest Ken Burns zoom (1.18) without
# the browser upscaling them again.
TARGET_W, TARGET_H = 1920 * 1.18, 1080 * 1.18


def natural_key(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r'(\d+)', s)]


def yunet():
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, 'yunet_2023mar.onnx')
    if not os.path.exists(path) or os.path.getsize(path) < 100_000:
        urllib.request.urlretrieve(YUNET_URL, path)
    return path


def load_oriented(path):
    """cv2.imread applies EXIF orientation by default (IMREAD_COLOR)."""
    img = cv2.imread(path, cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit(f'cannot decode {path}')
    return img


def detect_faces(img, model):
    h, w = img.shape[:2]
    found = []
    # 0.82: below it YuNet fired on a glass-table reflection, a hand and a spoon in this set.
    # Run at two scales: phone photos with small faces in group shots need the upscale.
    for scale in (1.0, 2.0):
        sw, sh = int(w * scale), int(h * scale)
        im = cv2.resize(img, (sw, sh), interpolation=cv2.INTER_CUBIC) if scale != 1.0 else img
        det = cv2.FaceDetectorYN.create(model, '', (sw, sh), score_threshold=0.82, nms_threshold=0.3, top_k=100)
        _, faces = det.detect(im)
        if faces is None:
            continue
        for f in faces:
            x, y, fw, fh, score = (float(v) for v in (f[0] / scale, f[1] / scale, f[2] / scale, f[3] / scale, f[-1]))
            found.append([x, y, fw, fh, score])
    # Merge the two passes (IoU > 0.3 = same face, keep the higher score).
    found.sort(key=lambda b: -b[4])
    kept = []
    for b in found:
        if all(iou(b, k) < 0.3 for k in kept):
            kept.append(b)
    # Drop implausibly tiny detections (background posters, reflections).
    if kept:
        big = max(k[3] for k in kept)
        kept = [k for k in kept if k[3] >= big * 0.35]
    return [{'x': round(k[0] / w, 4), 'y': round(k[1] / h, 4), 'w': round(k[2] / w, 4), 'h': round(k[3] / h, 4),
             'score': round(k[4], 3)} for k in kept]


def iou(a, b):
    ax1, ay1, bx1, by1 = a[0] + a[2], a[1] + a[3], b[0] + b[2], b[1] + b[3]
    ix = max(0, min(ax1, bx1) - max(a[0], b[0]))
    iy = max(0, min(ay1, by1) - max(a[1], b[1]))
    inter = ix * iy
    return inter / (a[2] * a[3] + b[2] * b[3] - inter + 1e-9)


# Colour matching: every photo is pulled part-way toward one shared look before the film grade, so
# phone shots from different years, cameras and lighting cut together. Partial strengths keep each
# photo's own mood (night shots stay night shots) and never push skin tones far.
MATCH = {'L_median': 52.0, 'a': 0.5, 'b': 4.0, 'chroma': 18.0}


def colour_match(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0] * 100 / 255
    a = lab[..., 1] - 128
    b = lab[..., 2] - 128
    C = np.hypot(a, b)
    neutral = (L > 20) & (L < 90) & (C < 18)
    na, nb = (float(a[neutral].mean()), float(b[neutral].mean())) if neutral.mean() > 0.02 else (MATCH['a'], MATCH['b'])
    # 1. Cast: 60% of the way from the photo's neutral tones to the shared warm-neutral, capped.
    da = float(np.clip(-0.6 * (na - MATCH['a']), -7, 7))
    db = float(np.clip(-0.6 * (nb - MATCH['b']), -7, 7))
    # 2. Exposure: gamma on L moving the median 50-60% of the way (log domain) to the target.
    med = float(np.clip(np.median(L), 5, 95)) / 100
    g_full = np.log(MATCH['L_median'] / 100) / np.log(med)
    g = float(np.clip(g_full ** (0.6 if g_full < 1 else 0.5), 0.7, 1.3))
    Ln = 100 * np.power(np.clip(L / 100, 0, 1), g)
    # 3. White point: lift dull highlights a little (p98 toward 96).
    p98 = float(np.percentile(Ln, 98))
    gain = float(np.clip(96 / max(p98, 1), 1.0, 1.06))
    Ln = np.clip(Ln * gain, 0, 100)
    # 4. Saturation toward a shared chroma level, partially.
    sat = float(np.clip((MATCH['chroma'] / max(float(C.mean()), 1)) ** 0.4, 0.85, 1.25))
    out = np.dstack([Ln * 255 / 100, (a + da) * sat + 128, (b + db) * sat + 128])
    out = cv2.cvtColor(np.clip(out, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
    return out, {'cast_a': round(da, 2), 'cast_b': round(db, 2), 'gamma': round(g, 3), 'white_gain': round(gain, 3), 'saturation': round(sat, 3)}


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)


def main():
    if not os.path.isdir(SRC):
        raise SystemExit(f'photo folder not found: {SRC}')
    files = sorted([f for f in os.listdir(SRC) if f.lower().endswith(EXTS)], key=natural_key)
    skipped = [f for f in os.listdir(SRC) if not f.lower().endswith(EXTS) and not f.startswith('.')]
    if skipped:
        print('WARNING: unsupported files ignored:', ', '.join(skipped))
    if not files:
        raise SystemExit(f'no photos in {SRC}')
    os.makedirs(os.path.join(PUB, 'img'), exist_ok=True)
    os.makedirs(os.path.join(PUB, 'bg'), exist_ok=True)
    model = yunet()
    hashes, photos = {}, []
    for f in files:
        path = os.path.join(SRC, f)
        img = load_oriented(path)
        h, w = img.shape[:2]
        digest = hashlib.sha1(cv2.resize(img, (64, 64), interpolation=cv2.INTER_AREA).tobytes()).hexdigest()
        if digest in hashes:
            raise SystemExit(f'duplicate photo: {f} == {hashes[digest]}')
        hashes[digest] = f
        faces = detect_faces(img, model)
        matched, grade = colour_match(img)
        tmp = os.path.join(CACHE, os.path.splitext(f)[0] + '.matched.png')
        cv2.imwrite(tmp, matched)
        pid = os.path.splitext(f)[0]
        # Working copy: lanczos upscale (+ light unsharp) only when the original is smaller than needed.
        k = max(1.0, TARGET_W / w, TARGET_H / h)
        k = min(k, 4.0)
        ow, oh = int(round(w * k / 2) * 2), int(round(h * k / 2) * 2)
        flt = f'scale={ow}:{oh}:flags=lanczos' + (',unsharp=5:5:0.45:5:5:0.0' if k > 1.01 else '')
        ffmpeg('-i', tmp, '-vf', flt, '-q:v', '1', os.path.join(PUB, 'img', pid + '.jpg'))
        # Backdrop: cover-fit, heavy blur, slightly darkened (blur baked here, not in the browser).
        ffmpeg('-i', tmp, '-vf',
               'scale=1920:1080:force_original_aspect_ratio=increase:flags=bicubic,crop=1920:1080,'
               'gblur=sigma=38:steps=3,eq=brightness=-0.06:saturation=0.85',
               '-q:v', '2', os.path.join(PUB, 'bg', pid + '.jpg'))
        photos.append({'id': pid, 'file': f, 'src': f'friendship/img/{pid}.jpg', 'bg': f'friendship/bg/{pid}.jpg',
                       'width': w, 'height': h, 'faces': faces, 'match': grade})
        os.remove(tmp)
        print(f'{f:28s} {w}x{h}  faces={len(faces)}  match={grade}')
    with open(MANIFEST, 'w') as fh:
        json.dump({'source': os.path.relpath(SRC, ROOT), 'count': len(photos), 'photos': photos}, fh, indent=1)
    print(f'{len(photos)} photos -> {os.path.relpath(MANIFEST, ROOT)}')


if __name__ == '__main__':
    main()
