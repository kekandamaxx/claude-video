#!/usr/bin/env bash
# Joins several phone clips into one upright 1080x1920 30 fps source so a multi-clip
# edit can use the single-clip pipeline (one master, one transcript, one faces.json).
# Usage: scripts/concat_sources.sh <out.mkv> <clip1> <clip2> ...
# Prints each clip's start offset (seconds) in the joined timeline.
set -euo pipefail
OUT="${1:?output .mkv}"; shift
args=(); fc=""; n=0; off=0
for f in "$@"; do
  args+=(-i "$f")
  fc+="[$n:v:0]fps=30,scale=1080:1920,setsar=1[v$n];[$n:a:0]aresample=48000,aformat=channel_layouts=stereo[a$n];"
  d=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of default=nw=1:nk=1 "$f" | head -1)
  echo "$(basename "$f") offset=$off"
  off=$(python3 -c "print(round(round(($off+$d)*30)/30,4))")
  n=$((n+1))
done
for i in $(seq 0 $((n-1))); do fc+="[v$i][a$i]"; done
fc+="concat=n=$n:v=1:a=1[v][a]"
ffmpeg -v error -y "${args[@]}" -filter_complex "$fc" -map "[v]" -map "[a]" \
  -c:v libx264 -preset ultrafast -crf 12 -pix_fmt yuv420p -c:a pcm_s16le "$OUT"
