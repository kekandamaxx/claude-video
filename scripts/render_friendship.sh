#!/usr/bin/env bash
# Render "A Friendship to Remember" (1920x1080, 30 fps, H.264) and loudness-master it.
# Usage: scripts/render_friendship.sh [preview]   -> out/FriendshipTribute/A-Friendship-to-Remember.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=out/FriendshipTribute; mkdir -p "$OUT"
npm run -s qa:friendship   # refuses to render with missing / duplicated photos or assets
if [ "${1:-}" = preview ]; then
  npx remotion render FriendshipTribute "$OUT/preview.mp4" --log=error --scale=0.5 --crf=23
  exit 0
fi
npx remotion render FriendshipTribute "$OUT/raw.mp4" --log=error --codec=h264 --crf=15 \
  --pixel-format=yuv420p --x264-preset=slow --jpeg-quality=95 --audio-bitrate=320k
scripts/master_audio.sh "$OUT/raw.mp4" "$OUT/A-Friendship-to-Remember.mp4"
rm -f "$OUT/raw.mp4"
