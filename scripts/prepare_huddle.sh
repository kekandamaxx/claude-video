#!/usr/bin/env bash
# Media for the HuddleEdit (four phone clips of the same pre-match huddle).
# Usage: scripts/prepare_huddle.sh <clip1> <clip2> <clip3> <clip4>
#   clip1  c1b4f450...mov  24.3 s, 464x832  tactics: "tebuk, release"
#   clip2  468186b5...mov   7.4 s, 720x1280 defence positions (wing kiri, 45)
#   clip3  a97f3b21...mov  14.6 s, 720x1280 line-up + "jangan mental down"
#   clip4  531bc622...mov   4.6 s, 720x1280 hands in, team cheer
# The four clips are joined back to back into ONE source (video + voice), so the
# EDL addresses them by source time:
#   clip1 0.000-24.133  clip2 24.133-31.533  clip3 31.533-46.100  clip4 46.100-50.633
# Every clip is cut to a whole number of 30 fps frames, so these offsets are exact.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; PUB="$ROOT/public/huddle"; SHARED="$ROOT/public/shared"; TMP="$(mktemp -d)"
mkdir -p "$PUB/video" "$PUB/audio" "$SHARED/music"
FRAMES=(724 222 437 136)
# Lanczos upscale (clip1 is a 464x832 export) + light unsharp, 60 -> 30 fps.
UP="fps=30,scale=1080:1920:flags=lanczos,unsharp=5:5:0.55,setsar=1"
VOICE="highpass=f=90,afftdn=nr=12:nf=-30:tn=1,equalizer=f=250:t=o:w=1:g=-2,equalizer=f=3400:t=o:w=1.2:g=3,\
acompressor=threshold=-24dB:ratio=3:attack=5:release=90:makeup=2"
LIST="$TMP/list.txt"; : > "$LIST"
for i in 0 1 2 3; do
  src="${@:$((i+1)):1}"; n=${FRAMES[$i]}; d=$(python3 -c "print($n/30)")
  ffmpeg -v error -y -i "$src" -map 0:v:0 -an -vf "$UP" -frames:v "$n" -c:v libx264 -crf 16 -preset medium \
    -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 "$TMP/v$i.mp4"
  # Each clip is loudness-matched on its own (the phone sat at different distances),
  # then padded/trimmed to exactly the picture length.
  ffmpeg -v error -y -i "$src" -map 0:a:0 -ac 1 -ar 48000 -af "$VOICE,loudnorm=I=-15:TP=-1.5:LRA=9,apad,atrim=0:$d" "$TMP/a$i.wav"
  echo "file '$TMP/v$i.mp4'" >> "$LIST"
done
ffmpeg -v error -y -f concat -safe 0 -i "$LIST" -c copy -movflags +faststart "$PUB/video/master.mp4"
ffmpeg -v error -y -i "$PUB/video/master.mp4" -vf scale=540:960 -c:v libx264 -preset veryfast -crf 23 -g 15 -pix_fmt yuv420p "$PUB/video/proxy.mp4"
ffmpeg -v error -y -i "$TMP/a0.wav" -i "$TMP/a1.wav" -i "$TMP/a2.wav" -i "$TMP/a3.wav" \
  -filter_complex "[0][1][2][3]concat=n=4:v=0:a=1,loudnorm=I=-14:TP=-1.5:LRA=9" -ar 48000 "$PUB/audio/voice.wav"
# 16 kHz copy for ASR / alignment checks.
ffmpeg -v error -y -i "$PUB/audio/voice.wav" -ar 16000 "$PUB/audio/voice16k.wav"
# Freeze frame for the ending: hands up, just before the team shout (48.50 s).
mkdir -p "$PUB/img"
ffmpeg -v error -y -ss 48.5 -i "$PUB/video/master.mp4" -frames:v 1 -q:v 1 "$PUB/img/freeze.jpg"
# Music bed: Mixkit "Rising Forest" (id 471, 123 BPM). 87% of its energy is below 150 Hz,
# 1% in 1-4 kHz, so it stays out of the voice; its break (13.5-15.5 s) sits under
# "kena tinggal, jangan mental down" and the drop (16.16 s) lands on "Boleh menang".
if [ ! -f "$SHARED/music/rising_forest.wav" ]; then
  curl -sSL -o "$TMP/rf.mp3" https://assets.mixkit.co/music/471/471.mp3
  ffmpeg -v error -y -i "$TMP/rf.mp3" -t 60 -ar 48000 -ac 2 -af "\
equalizer=f=1800:t=o:w=1.5:g=-6,equalizer=f=3500:t=o:w=1:g=-4,\
loudnorm=I=-14:TP=-1.5:LRA=11" "$SHARED/music/rising_forest.wav"
fi
"$ROOT/scripts/prepare_shared.sh"
rm -rf "$TMP"; echo "media ready in $PUB"
