#!/usr/bin/env bash
# Renders a HyperFrames overlay project to a transparent WebM (VP9 + alpha) that a Remotion
# edit lays over itself (EditConfig.overlay). Usage: hyperframes/render.sh drill
# -> public/drill/overlay/hf_overlay.webm. Telemetry off; uses the pre-installed headless shell.
set -euo pipefail
NAME="${1:?project dir, e.g. drill}"
HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$HERE/.." && pwd)"
export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1
SHELL_BIN=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
[ -x "$SHELL_BIN" ] && export HYPERFRAMES_BROWSER_PATH="$SHELL_BIN"
mkdir -p "$ROOT/public/$NAME/overlay"
cd "$HERE"
npx hyperframes lint "$NAME"
npx hyperframes render "$NAME" --format webm --fps 30 --quality delivery -o "$ROOT/public/$NAME/overlay/hf_overlay.webm"
ffprobe -v error -show_entries stream=codec_name,width,height:stream_tags=alpha_mode:format=duration -of compact "$ROOT/public/$NAME/overlay/hf_overlay.webm"
