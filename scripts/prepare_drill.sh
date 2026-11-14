#!/usr/bin/env bash
# Media for DrillEdit (defence drill talk). The three phone clips live in Google Drive:
#   IMG_6114.MOV (5.5 s), IMG_6115.MOV (14.9 s), IMG_6116.MOV (20.9 s)
# Usage: scripts/prepare_drill.sh /dir/with/the/three/MOVs
# 1. joins them into one upright 1080x1920 30 fps source (6114 at 0.000 s, 6115 at 5.455 s,
#    6116 at 20.403 s; src/edits/drill/edl.ts times refer to this file),
# 2. runs the shared prep (master, proxy, voice chain, music, SFX) on it,
# 3. measures faces at 5 fps (needs python3 with opencv-python),
# 4. renders the HyperFrames motion-graphics plate (hyperframes/drill -> public/drill/overlay).
set -euo pipefail
SRC="${1:?directory holding IMG_6114.MOV, IMG_6115.MOV and IMG_6116.MOV}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; TMP="$(mktemp -d)"
ffmpeg -v error -y -i "$SRC/IMG_6114.MOV" -i "$SRC/IMG_6115.MOV" -i "$SRC/IMG_6116.MOV" -filter_complex "\
[0:v]fps=30,scale=1080:1920,setsar=1[v0];[1:v]fps=30,scale=1080:1920,setsar=1[v1];[2:v]fps=30,scale=1080:1920,setsar=1[v2];\
[0:a:0]aresample=48000[a0];[1:a:0]aresample=48000[a1];[2:a:0]aresample=48000[a2];\
[v0][a0][v1][a1][v2][a2]concat=n=3:v=1:a=1[v][a]" -map "[v]" -map "[a]" \
  -c:v libx264 -crf 12 -preset medium -pix_fmt yuv420p -c:a pcm_s16le "$TMP/drill_combined.mov"
"$ROOT/scripts/prepare_media.sh" drill "$TMP/drill_combined.mov"
python3 "$ROOT/scripts/video_faces.py" "$ROOT/public/drill/video/master.mp4" "$ROOT/src/edits/drill/faces.json"
(cd "$ROOT/hyperframes" && npm install --no-audit --no-fund && ./render.sh drill)
rm -rf "$TMP"
