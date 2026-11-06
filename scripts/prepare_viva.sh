#!/usr/bin/env bash
# Media for the Viva! juice edit (several sources). Usage:
#   scripts/prepare_viva.sh <talk.mov> <broll.mov> <bottle1.jpg> <crates.jpg> <bottle2.jpg>
# The sources are 478x850 / 720x1280 phone exports, so they are upscaled with
# lanczos + light unsharp to the 1080x1920 canvas.
set -euo pipefail
TALK="$1"; BROLL="$2"; IMG1="$3"; IMG2="$4"; IMG3="$5"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; PUB="$ROOT/public/viva"; SHARED="$ROOT/public/shared"; TMP="$(mktemp -d)"
mkdir -p "$PUB/video" "$PUB/audio" "$PUB/img" "$SHARED/music"
UP="scale=1080:1920:flags=lanczos,unsharp=5:5:0.6"
for pair in "talk:$TALK" "broll:$BROLL"; do
  name="${pair%%:*}"; src="${pair#*:}"
  ffmpeg -v error -y -i "$src" -an -vf "$UP" -r 30 -c:v libx264 -crf 17 -preset medium -pix_fmt yuv420p -movflags +faststart "$PUB/video/${name}_master.mp4"
  ffmpeg -v error -y -i "$PUB/video/${name}_master.mp4" -vf scale=540:960 -c:v libx264 -preset veryfast -crf 23 -g 15 -pix_fmt yuv420p "$PUB/video/${name}_proxy.mp4"
done
i=0; for img in "$IMG1" "$IMG2" "$IMG3"; do
  i=$((i+1)); name=$(echo "bottle1 crates bottle2" | cut -d' ' -f$i)
  ffmpeg -v error -y -i "$img" -vf "$UP" -q:v 2 "$PUB/img/$name.jpg"
done
# Dialogue: same chain as the coach edits.
ffmpeg -v error -y -i "$TALK" -map 0:a:0 -ac 1 -ar 48000 -af "\
highpass=f=90,afftdn=nr=10:nf=-32:tn=1,\
equalizer=f=250:t=o:w=1:g=-2,equalizer=f=3400:t=o:w=1.2:g=3,\
acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=2,\
loudnorm=I=-14:TP=-1.5:LRA=9" "$PUB/audio/voice.wav"
# Music bed: Mixkit "Sounds Good" (id 1077, upbeat, 18% of energy in the voice band).
if [ ! -f "$SHARED/music/sounds_good.wav" ]; then
  curl -sSL -o "$TMP/m.mp3" https://assets.mixkit.co/music/1077/1077.mp3
  ffmpeg -v error -y -i "$TMP/m.mp3" -t 60 -ar 48000 -af "\
equalizer=f=1800:t=o:w=1.5:g=-6,equalizer=f=3500:t=o:w=1:g=-4,\
loudnorm=I=-14:TP=-1.5:LRA=11" "$SHARED/music/sounds_good.wav"
fi
rm -rf "$TMP"; echo "media ready in $PUB"
