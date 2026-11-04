#!/usr/bin/env bash
# Render a composition and loudness-master it.
# Usage: scripts/render.sh <Composition> preview|final  -> out/<Composition>/<mode>.mp4
set -euo pipefail
COMP="${1:?composition id}"; MODE="${2:?preview|final}"; OUT="out/$COMP"; mkdir -p "$OUT"
if [ "$MODE" = preview ]; then
  npx remotion render "$COMP" "$OUT/preview_raw.mp4" --log=error --scale=0.5 --crf=23 --audio-bitrate=256k \
    --props='{"preview":true,"guides":false,"music":true,"sfx":true,"voice":true}'
else
  npx remotion render "$COMP" "$OUT/final_raw.mp4" --log=error --crf=16 --audio-bitrate=320k \
    --props='{"preview":false,"guides":false,"music":true,"sfx":true,"voice":true}'
fi
scripts/master_audio.sh "$OUT/${MODE}_raw.mp4" "$OUT/$MODE.mp4"
