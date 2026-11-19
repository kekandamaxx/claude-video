#!/usr/bin/env bash
# Media for the training-night montage (TrainingEdit): ten phone clips of one session.
# Usage: scripts/prepare_training.sh c01.mov c02.mov ... c10.mov   (in the order uploaded)
# The clips are 576x1024 portrait (stored 1024x576 with a -90 rotation tag), some at
# 31.58 fps. Each is rotated upright, resampled to 30 fps CFR, upscaled with lanczos +
# light unsharp, and the ten are joined into ONE source (master/proxy/voice), so the
# shared EDL engine can address every shot by a single source time.
# Clip start offsets in that joined source -> public/training/offsets.json.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; PUB="$ROOT/public/training"; SHARED="$ROOT/public/shared"; TMP="$(mktemp -d)"
mkdir -p "$PUB/video" "$PUB/audio" "$SHARED/music"
UP="fps=30,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6,setsar=1"
i=0; : > "$TMP/v.txt"; : > "$TMP/a.txt"; echo '{' > "$PUB/offsets.json"; off=0
for src in "$@"; do
  i=$((i+1)); n=$(printf %02d $i)
  ffmpeg -v error -y -i "$src" -an -vf "$UP" -c:v libx264 -crf 15 -preset medium -pix_fmt yuv420p "$TMP/v$n.mp4"
  frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$TMP/v$n.mp4")
  # Audio cut to exactly the video's frame count so the two stay in sync after the join.
  ffmpeg -v error -y -i "$src" -vn -ac 1 -ar 48000 -af "apad" -t "$(python3 -c "print($frames/30)")" "$TMP/a$n.wav"
  echo "file '$TMP/v$n.mp4'" >> "$TMP/v.txt"; echo "file '$TMP/a$n.wav'" >> "$TMP/a.txt"
  [ $i -gt 1 ] && echo ',' >> "$PUB/offsets.json"
  printf '"c%s": {"start": %s, "dur": %s}' "$n" "$(python3 -c "print(round($off/30,4))")" "$(python3 -c "print(round($frames/30,4))")" >> "$PUB/offsets.json"
  off=$((off+frames))
done
echo '}' >> "$PUB/offsets.json"
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/v.txt" -c copy -movflags +faststart "$PUB/video/master.mp4"
ffmpeg -v error -y -i "$PUB/video/master.mp4" -vf scale=540:960 -c:v libx264 -preset veryfast -crf 23 -g 15 -pix_fmt yuv420p "$PUB/video/proxy.mp4"
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/a.txt" -c copy "$TMP/court.wav"
# Court sound / coach calls: the coach chain, with a limiter first because the
# shouts next to the phone clip at 0 dBFS.
ffmpeg -v error -y -i "$TMP/court.wav" -af "\
highpass=f=90,alimiter=limit=0.7:attack=2:release=50,afftdn=nr=10:nf=-32:tn=1,\
equalizer=f=250:t=o:w=1:g=-2,equalizer=f=3400:t=o:w=1.2:g=3,\
acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=2,\
loudnorm=I=-14:TP=-1.5:LRA=9,aresample=48000" "$PUB/audio/voice.wav"
# Music bed: the house track for the handball edits (Mixkit "Epical Drums 02", id 677).
if [ ! -f "$SHARED/music/epical_drums_02.wav" ]; then
  curl -sSL -o "$TMP/music.mp3" https://assets.mixkit.co/music/677/677.mp3
  ffmpeg -v error -y -i "$TMP/music.mp3" -t 60 -ar 48000 -af "\
equalizer=f=1800:t=o:w=1.5:g=-6,equalizer=f=3500:t=o:w=1:g=-4,\
loudnorm=I=-14:TP=-1.5:LRA=11" "$SHARED/music/epical_drums_02.wav"
fi
rm -rf "$TMP"; echo "media ready in $PUB"; cat "$PUB/offsets.json"
