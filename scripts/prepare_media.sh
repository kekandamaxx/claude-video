#!/usr/bin/env bash
# Prepares every media file a Remotion edit reads from public/.
# Usage: scripts/prepare_media.sh <edit-id> /path/to/source.MOV
#   timeout   -> IMG_7678.MOV (Google Drive > Video)
#   semifinal -> IMG_7546.MOV (Google Drive > Video)
# Per-edit files go to public/<edit-id>/, shared music + SFX to public/shared/
# (Mixkit free license; downloaded here, not committed).
set -euo pipefail
EDIT="${1:?edit id (timeout|semifinal)}"
SRC="${2:?path to the source .MOV}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUB="$ROOT/public/$EDIT"; SHARED="$ROOT/public/shared"; TMP="$(mktemp -d)"
mkdir -p "$PUB/video" "$PUB/audio" "$SHARED/music" "$SHARED/sfx"

# 1. Upright 1080x1920 30 fps master + 540x960 proxy for fast previews.
ffmpeg -v error -y -i "$SRC" -map 0:v:0 -an -vf "fps=30,scale=1080:1920" \
  -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -movflags +faststart "$PUB/video/master.mp4"
ffmpeg -v error -y -i "$PUB/video/master.mp4" -vf scale=540:960 -c:v libx264 -preset veryfast \
  -crf 23 -g 15 -pix_fmt yuv420p "$PUB/video/proxy.mp4"

# 2. Dialogue: rumble cut, gentle crowd-noise reduction, de-mud, presence lift,
#    compression, loudness to -14 LUFS (TikTok/IG delivery level).
ffmpeg -v error -y -i "$SRC" -map 0:a:0 -ac 1 -ar 48000 -af "\
highpass=f=90,afftdn=nr=10:nf=-32:tn=1,\
equalizer=f=250:t=o:w=1:g=-2,equalizer=f=3400:t=o:w=1.2:g=3,\
acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=2,\
loudnorm=I=-14:TP=-1.5:LRA=9" "$PUB/audio/voice.wav"

# 3-4. Shared music bed + SFX library.
"$ROOT/scripts/prepare_shared.sh"
rm -rf "$TMP"
echo "media ready in $PUB"
