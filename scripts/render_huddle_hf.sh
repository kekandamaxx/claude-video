#!/usr/bin/env bash
# Renders the HyperFrames overlays of HuddleEdit as transparent WebM (VP9 + alpha)
# into public/huddle/hf/, with word times taken from the EDL (scripts/huddle_hf.ts).
# Usage: scripts/render_huddle_hf.sh [draft|looks]
set -euo pipefail
Q="${1:-looks}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
export HYPERFRAMES_NO_TELEMETRY=1 HYPERFRAMES_NO_UPDATE_CHECK=1 HYPERFRAMES_SKIP_SKILLS=1
mkdir -p public/huddle/hf out/.qa
npx esbuild scripts/huddle_hf.ts --bundle --platform=node --log-level=warning --outfile=out/.qa/huddle_hf.js
node out/.qa/huddle_hf.js
for name in hook finale; do
  npx hyperframes render "hyperframes/huddle-$name" --format webm --quality "$Q" --fps 30 \
    --variables-file "out/.hf/huddle_$name.json" --output "public/huddle/hf/$name.webm" --quiet
  echo "-> public/huddle/hf/$name.webm"
done
