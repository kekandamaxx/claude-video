#!/usr/bin/env bash
# Media for DefeatEdit ("After the Loss"). Five phone clips, 464x832, 60 fps.
# Usage: scripts/prepare_defeat.sh <clip1> <clip2> <clip3> <clip4> <clip5>
#   clip1 2f5c468e  night, wide behind the team (coach off-screen)
#   clip2 346a431c  night, wide behind the team, "comeback ... susah"
#   clip3 8ddfb44c  two coaches standing, "relax, settle down ... reset ... jalan"
#   clip4 67dbb485  two coaches standing, player notes (not used in the cut)
#   clip5 b91101ac  coach from behind, players heads down (speech too faint to use)
# Writes public/defeat/ (git-ignored). Mixkit assets: free licence for use in videos.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; PUB="$ROOT/public/defeat"; SHARED="$ROOT/public/shared"; TMP="$(mktemp -d)"
mkdir -p "$PUB/video" "$PUB/audio" "$PUB/grain" "$SHARED/sfx"
[ $# -eq 5 ] || { echo "need 5 clips"; exit 1; }

i=0
for SRC in "$@"; do
  i=$((i+1))
  # 1. Keep the native 60 fps so 0.5x slow motion uses real frames, not repeats.
  #    Lanczos upscale to cover 1080x1920 (source is 0.558:1, canvas 0.5625:1, so 8 px of
  #    height are cropped top and bottom), light unsharp to restore edge contrast.
  ffmpeg -v error -y -i "$SRC" -map 0:v:0 -an -vf "fps=60,scale=1080:-2:flags=lanczos,crop=1080:1920,unsharp=5:5:0.55" \
    -c:v libx264 -preset medium -crf 15 -g 30 -pix_fmt yuv420p -movflags +faststart "$PUB/video/clip$i.mp4"
  ffmpeg -v error -y -i "$PUB/video/clip$i.mp4" -vf scale=540:960 -c:v libx264 -preset veryfast -crf 22 -g 15 \
    -pix_fmt yuv420p "$PUB/video/clip${i}_proxy.mp4"
  # 2. Dialogue: the coach-talk chain (rumble cut, gentle denoise, de-mud, presence, 3:1),
  #    each clip normalised on its own so the cuts match in level.
  ffmpeg -v error -y -i "$SRC" -map 0:a:0 -ac 1 -ar 48000 -af "\
highpass=f=90,afftdn=nr=10:nf=-32:tn=1,\
equalizer=f=250:t=o:w=1:g=-2,equalizer=f=3400:t=o:w=1.2:g=3,\
acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=2,\
loudnorm=I=-16:TP=-2:LRA=9" "$PUB/audio/clip$i.wav"
  # 3. Slow-motion ambience: the same room, an octave down and muffled (0.5x, so source
  #    second s sits at 2s in this file). Speech turns into an unreadable murmur.
  ffmpeg -v error -y -i "$SRC" -map 0:a:0 -ac 1 -af "\
aresample=48000,asetrate=24000,aresample=48000,lowpass=f=1100,highpass=f=45,\
afftdn=nr=8:nf=-40,loudnorm=I=-24:TP=-6:LRA=7" "$PUB/audio/clip${i}_slow.wav"
done

# 4. Sub drone (synthesised, no licence question): brown noise under 150 Hz + a soft
#    49 Hz tone with a slow swell. Sits under the hook and the silence beat.
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=brown:amplitude=0.6:d=70:r=48000" -f lavfi -i "sine=f=49:d=70:r=48000" \
  -filter_complex "[0]lowpass=f=150,lowpass=f=150,volume=0.7[n];[1]volume=0.25,tremolo=f=0.12:d=0.5[s];[n][s]amix=inputs=2:normalize=0,\
afade=t=in:d=3,loudnorm=I=-20:TP=-4" -ac 2 "$PUB/audio/drone.wav"

# 5. Film grain: 12 tiles of 512x512 mid-grey noise, overlaid with a new tile each frame.
for g in $(seq 0 11); do
  ffmpeg -v error -y -f lavfi -i "color=c=0x808080:s=512x512:d=1,noise=alls=34:allf=u+t:all_seed=$((g*7919+13)),gblur=sigma=0.55" \
    -frames:v 1 "$PUB/grain/g$g.png"
done

# 6. Music: Mixkit "Silent Descent" (id 614). Sparse piano 0-42 s, strings from 41.98 s,
#    fuller layer 70-124 s, piano outro from 124 s. A 1-4 kHz pocket keeps the voice on top.
if [ ! -f "$PUB/audio/music.wav" ]; then
  curl -sSL -o "$TMP/music.mp3" https://assets.mixkit.co/music/614/614.mp3
  ffmpeg -v error -y -i "$TMP/music.mp3" -ar 48000 -af "\
equalizer=f=1800:t=o:w=1.5:g=-5,equalizer=f=3200:t=o:w=1:g=-3,\
loudnorm=I=-16:TP=-2:LRA=11" "$PUB/audio/music.wav"
fi

# 7. SFX (Mixkit ids), peak-normalised to -1 dBFS; shared with the other edits.
declare -A SFX=([impact_trailer]=2908 [bass_hit]=2299 [heartbeat]=498 [whoosh_cine]=1490 [swoosh_wind]=1471)
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
rm -rf "$TMP"; echo "media ready in $PUB"
