#!/usr/bin/env bash
# GkDrillEdit media: the shared prep (master, proxy, voice chain, shared SFX), then the
# extra game-HUD SFX, the "K.O." music bed, faces and the HyperFrames stingers.
# Usage: scripts/prepare_gkdrill.sh /path/to/source.mov
set -euo pipefail
SRC="${1:?path to the source .mov}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
SHARED="$ROOT/public/shared"; TMP="$(mktemp -d)"
scripts/prepare_media.sh gkdrill "$SRC"

# Music: Mixkit "K.O." (id 1068, free licence for videos). Only 7.8% of its energy sits in
# 1-4 kHz; the same voice pocket as the shared bed is carved on top.
if [ ! -f "$SHARED/music/ko.wav" ]; then
  curl -sSL -o "$TMP/ko.mp3" https://assets.mixkit.co/music/1068/1068.mp3
  ffmpeg -v error -y -i "$TMP/ko.mp3" -t 70 -ar 48000 -af "\
equalizer=f=1800:t=o:w=1.5:g=-6,equalizer=f=3500:t=o:w=1:g=-4,\
loudnorm=I=-14:TP=-1.5:LRA=11" "$SHARED/music/ko.wav"
fi

# Game-HUD SFX (Mixkit ids), peak-normalised to -1 dBFS like the shared set.
declare -A SFX=(
  [tape_rewind]=1091 [game_over]=213 [level_up]=2059 [low_battery]=1084
  [ko_punch]=2155 [coin]=216 [unlock]=253 [glitch_intro]=2950
)
for name in "${!SFX[@]}"; do
  [ -f "$SHARED/sfx/$name.wav" ] && continue
  id=${SFX[$name]}
  curl -sSL -o "$TMP/$id.wav" "https://assets.mixkit.co/active_storage/sfx/$id/$id.wav"
  if [ "$(stat -c%s "$TMP/$id.wav")" -lt 2000 ]; then
    curl -sSL -o "$TMP/$id.wav" "https://assets.mixkit.co/active_storage/sfx/$id/$id-preview.mp3"
  fi
  peak=$(ffmpeg -hide_banner -i "$TMP/$id.wav" -af volumedetect -f null - 2>&1 | sed -n 's/.*max_volume: \(.*\) dB/\1/p')
  gain=$(python3 -c "print(-1.0-($peak))")
  ffmpeg -v error -y -i "$TMP/$id.wav" -ar 48000 -ac 2 -af "volume=${gain}dB" "$SHARED/sfx/$name.wav"
done
rm -rf "$TMP"

# Last source frame, held under the outro.
mkdir -p public/gkdrill/img
ffmpeg -v error -y -sseof -0.05 -i public/gkdrill/video/master.mp4 -frames:v 1 -q:v 2 public/gkdrill/img/last.jpg

[ -f src/edits/gkdrill/faces.json ] || python3 scripts/detect_faces.py public/gkdrill/video/master.mp4 src/edits/gkdrill/faces.json 0.6
scripts/render_gkdrill_hf.sh
echo "gkdrill media ready"
