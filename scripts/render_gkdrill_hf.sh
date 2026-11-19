#!/usr/bin/env bash
# Render the GkDrillEdit HyperFrames stingers (src/edits/gkdrill/hyperframes/<name>/index.html)
# to transparent VP9 WebM in public/gkdrill/hf/, which Remotion layers with <OffthreadVideo transparent>.
# gsap and the fonts are copied in from node_modules, so the render needs no network.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
mkdir -p public/gkdrill/hf
for name in hook gameover; do
  B="out/.hf/$name"; rm -rf "$B"; mkdir -p "$B/assets/fonts"
  cp "src/edits/gkdrill/hyperframes/$name/index.html" "$B/"
  cp node_modules/gsap/dist/gsap.min.js "$B/assets/"
  cp node_modules/@fontsource/anton/files/anton-latin-400-normal.woff2 "$B/assets/fonts/anton.woff2"
  cp node_modules/@fontsource/montserrat/files/montserrat-latin-900-normal.woff2 "$B/assets/fonts/montserrat-900.woff2"
  HYPERFRAMES_TELEMETRY=0 npx hyperframes render "$B" --format webm --quality delivery --fps 30 -o "public/gkdrill/hf/$name.webm" --quiet
done
echo "stingers -> public/gkdrill/hf/"
