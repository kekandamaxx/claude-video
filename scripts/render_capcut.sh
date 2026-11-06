#!/usr/bin/env bash
# Render the 90 s vertical CapCut-style edit.
# Usage: scripts/render_capcut.sh   -> out/FriendshipTribute/friendship_capcut.mp4 (1080x1920, ~4 Mbps, TikTok-ready)
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=out/FriendshipTribute; mkdir -p "$OUT"
npm run -s qa:capcut
npx remotion render FriendshipCapcut "$OUT/capcut_raw.mp4" --log=error --codec=h264 --crf=15 --pixel-format=yuv420p --jpeg-quality=95 --audio-bitrate=320k
V="-c:v libx264 -preset slow -profile:v high -level 4.1 -b:v 4000k -maxrate 6000k -bufsize 12000k -r 30 -g 60 \
 -vf scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709:flags=lanczos+accurate_rnd+full_chroma_int,format=yuv420p \
 -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709"
ffmpeg -v error -y -i "$OUT/capcut_raw.mp4" $V -pass 1 -passlogfile "$OUT/x264c" -an -f null /dev/null
ffmpeg -v error -y -i "$OUT/capcut_raw.mp4" $V -pass 2 -passlogfile "$OUT/x264c" -c:a aac -b:a 192k -ar 44100 -movflags +faststart "$OUT/capcut_tv.mp4"
scripts/master_audio.sh "$OUT/capcut_tv.mp4" "$OUT/friendship_capcut.mp4"
rm -f "$OUT/capcut_raw.mp4" "$OUT/capcut_tv.mp4" "$OUT"/x264c*
