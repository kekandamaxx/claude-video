#!/usr/bin/env bash
# TrainingEdit media: two phone clips from Google Drive > Video, joined end to end.
#   IMG_4790.mp4 (143.433 s) then IMG_4793.mp4 (39.867 s); IMG_4793 starts at 143.433 s
#   in the joined source. Usage: scripts/prepare_training.sh /path/IMG_4790.mp4 /path/IMG_4793.mp4
set -euo pipefail
A="${1:?IMG_4790.mp4}"; B="${2:?IMG_4793.mp4}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; P="$ROOT/public/training"
mkdir -p "$P/video" "$P/audio"
# 720x1280 phone exports -> 1080x1920 (lanczos + light unsharp), 30 fps.
ffmpeg -v error -y -i "$A" -i "$B" -filter_complex "\
[0:v:0]fps=30,scale=1080:1920:flags=lanczos,setsar=1,unsharp=5:5:0.4[v0];\
[1:v:0]fps=30,scale=1080:1920:flags=lanczos,setsar=1,unsharp=5:5:0.4[v1];\
[v0][v1]concat=n=2:v=1:a=0[v]" -map "[v]" -c:v libx264 -preset medium -crf 17 -pix_fmt yuv420p -movflags +faststart "$P/video/master.mp4"
ffmpeg -v error -y -i "$P/video/master.mp4" -vf scale=540:960 -c:v libx264 -preset veryfast -crf 23 -g 15 -pix_fmt yuv420p "$P/video/proxy.mp4"
# Dialogue: the coach holds the phone, so the voice is close and loud; the hall is
# reverberant with ball bounces. Rumble cut, denoise, de-mud, presence, compression.
ffmpeg -v error -y -i "$A" -i "$B" -filter_complex "\
[0:a:0]aresample=48000,apad=whole_dur=143.4333[a0];[1:a:0]aresample=48000[a1];[a0][a1]concat=n=2:v=0:a=1,pan=mono|c0=0.5*c0+0.5*c1,\
highpass=f=100,afftdn=nr=12:nf=-30:tn=1,\
equalizer=f=300:t=o:w=1:g=-3,equalizer=f=3200:t=o:w=1.2:g=3,\
acompressor=threshold=-22dB:ratio=3:attack=5:release=90:makeup=2,\
loudnorm=I=-14:TP=-1.5:LRA=9[a]" -map "[a]" -ac 1 -ar 48000 "$P/audio/voice.wav"
echo "training media ready in $P"
