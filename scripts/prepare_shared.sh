#!/usr/bin/env bash
# Shared media for every 9:16 edit: music beds and the SFX library in public/shared/.
# Mixkit free licence (use in videos); downloaded here, not committed. Idempotent.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; SHARED="$ROOT/public/shared"; TMP="$(mktemp -d)"
mkdir -p "$SHARED/music" "$SHARED/sfx"
# Music bed (shared): Mixkit "Epical Drums 02" (id 677). Carve a 1-4 kHz pocket
#    so the voice sits on top, then normalise. Ducking happens in Remotion.
if [ ! -f "$SHARED/music/epical_drums_02.wav" ]; then
curl -sSL -o "$TMP/music.mp3" https://assets.mixkit.co/music/677/677.mp3
ffmpeg -v error -y -i "$TMP/music.mp3" -t 60 -ar 48000 -af "\
equalizer=f=1800:t=o:w=1.5:g=-6,equalizer=f=3500:t=o:w=1:g=-4,\
loudnorm=I=-14:TP=-1.5:LRA=11" "$SHARED/music/epical_drums_02.wav"
fi

# Sound effects (shared, Mixkit ids), peak-normalised to -1 dBFS.
declare -A SFX=(
  [impact_trailer]=2908 [whoosh_fast]=1492 [whoosh_cine]=1490 [swoosh_wind]=1471
  [swoosh_accent]=1464 [riser]=790 [heartbeat]=498 [pop_light]=3005 [pop_hard]=2364
  [tick]=1061 [bass_hit]=2299 [glitch_break]=2952 [buzzer]=1647 [crowd]=3022
  [impact_fast]=2655 [zoom_impact]=772 [bass_drum]=2294 [whoosh_hit]=2919
  [tape_rewind]=1092 [shutter]=1430 [movie_impact]=2902 [trailer_whoosh]=2918
  [crowd_chant]=363 [heart_single]=490
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
