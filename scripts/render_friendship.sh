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
# Remotion's JPEG frames come out full-range BT.601 (yuvj420p): convert to broadcast-range BT.709
# so TVs and desktop players do not show it washed out.
ffmpeg -v error -y -i "$OUT/raw.mp4" -map 0 -c:a copy -c:v libx264 -preset slow -crf 15 -profile:v high -level 4.2 \
  -vf "scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p" \
  -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 "$OUT/tv.mp4"
scripts/master_audio.sh "$OUT/tv.mp4" "$OUT/A-Friendship-to-Remember.mp4"
rm -f "$OUT/raw.mp4" "$OUT/tv.mp4"
