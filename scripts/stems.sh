#!/usr/bin/env bash
# Render voice / music / sfx stems of a composition to out/<Comp>/stem_*.wav.
set -euo pipefail
COMP="${1:?composition id}"; OUT="out/$COMP"; mkdir -p "$OUT"
for s in voice music sfx; do
  v=false; m=false; x=false
  [ "$s" = voice ] && v=true; [ "$s" = music ] && m=true; [ "$s" = sfx ] && x=true
  npx remotion render "$COMP" "$OUT/stem_$s.wav" --codec=wav --log=error \
    --props="{\"preview\":true,\"guides\":false,\"music\":$m,\"sfx\":$x,\"voice\":$v}"
done
