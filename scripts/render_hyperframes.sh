#!/usr/bin/env bash
# Renders the Hyperframes overlays of an edit as transparent PNG sequences that the
# Remotion composition lays over the footage (src/components/HfOverlay.tsx).
# Usage: scripts/render_hyperframes.sh comeback   -> public/comeback/hf/<overlay>/NNNNN.png
set -euo pipefail
EDIT="${1:?edit id}"; ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export HYPERFRAMES_SKIP_SKILLS=1
for dir in "$ROOT/hyperframes/$EDIT"/*/; do
  name="$(basename "$dir")"; out="$ROOT/public/$EDIT/hf/$name"; tmp="$(mktemp -d)"
  npx --yes hyperframes@0.9.56 render "$dir" --format png-sequence --fps 30 --quiet -o "$tmp/seq"
  rm -rf "$out"; mkdir -p "$out"; i=0
  for f in $(ls "$tmp/seq" | sort); do cp "$tmp/seq/$f" "$out/$(printf '%05d' $i).png"; i=$((i+1)); done
  rm -rf "$tmp"; echo "$name: $i frames -> $out"
done
