#!/usr/bin/env bash
# Prepares every media file a Remotion edit reads from public/.
# Usage: scripts/prepare_media.sh <edit-id> /path/to/source.MOV
#   timeout   -> IMG_7678.MOV (Google Drive > Video)
#   semifinal -> IMG_7546.MOV (Google Drive > Video)
# Per-edit files go to public/<edit-id>/, shared music + SFX to public/shared/
# (Mixkit free license; downloaded here, not committed).
set -euo pipefail
EDIT="${1:?edit id (timeout|semifinal)}"
SRC="${2:?path to the source .MOV}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PUB="$ROOT/public/$EDIT"; SHARED="$ROOT/public/shared"; TMP="$(mktemp -d)"
mkdir -p "$PUB/video" "$PUB/audio" "$SHARED/music" "$SHARED/sfx"

# 1. Upright 1080x1920 30 fps master + 540x960 proxy for fast previews.
ffmpeg -v error -y -i "$SRC" -map 0:v:0 -an -vf "fps=30,scale=1080:1920" \
  -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -movflags +faststart "$PUB/video/master.mp4"
ffmpeg -v error -y -i "$PUB/video/master.mp4" -vf scale=540:960 -c:v libx264 -preset veryfast \
  -crf 23 -g 15 -pix_fmt yuv420p "$PUB/video/proxy.mp4"

# 2. Dialogue: rumble cut, gentle crowd-noise reduction, de-mud, presence lift,
#    compression, loudness to -14 LUFS (TikTok/IG delivery level).
ffmpeg -v error -y -i "$SRC" -map 0:a:0 -ac 1 -ar 48000 -af "\
highpass=f=90,afftdn=nr=10:nf=-32:tn=1,\
equalizer=f=250:t=o:w=1:g=-2,equalizer=f=3400:t=o:w=1.2:g=3,\
acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=2,\
loudnorm=I=-14:TP=-1.5:LRA=9" "$PUB/audio/voice.wav"

# 3. Music bed (shared): Mixkit "Epical Drums 02" (id 677). Carve a 1-4 kHz pocket
#    so the voice sits on top, then normalise. Ducking happens in Remotion.
if [ ! -f "$SHARED/music/epical_drums_02.wav" ]; then
curl -sSL -o "$TMP/music.mp3" https://assets.mixkit.co/music/677/677.mp3
ffmpeg -v error -y -i "$TMP/music.mp3" -t 60 -ar 48000 -af "\
equalizer=f=1800:t=o:w=1.5:g=-6,equalizer=f=3500:t=o:w=1:g=-4,\
loudnorm=I=-14:TP=-1.5:LRA=11" "$SHARED/music/epical_drums_02.wav"
fi

# 4. Sound effects (shared, Mixkit ids), peak-normalised to -1 dBFS.
declare -A SFX=(
  [impact_trailer]=2908 [whoosh_fast]=1492 [whoosh_cine]=1490 [swoosh_wind]=1471
  [swoosh_accent]=1464 [riser]=790 [heartbeat]=498 [pop_light]=3005 [pop_hard]=2364
  [tick]=1061 [bass_hit]=2299 [glitch_break]=2952 [buzzer]=1647 [crowd]=3022
  [impact_fast]=2655 [zoom_impact]=772 [bass_drum]=2294 [whoosh_hit]=2919
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
echo "media ready in $PUB"
