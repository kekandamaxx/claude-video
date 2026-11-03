#!/usr/bin/env bash
# Loudness-master a Remotion render for TikTok/IG: -14 LUFS integrated, -1 dBTP.
# Video stream is copied untouched.  Usage: scripts/master_audio.sh in.mp4 out.mp4
set -euo pipefail
IN="$1"; OUT="$2"
read -r I TP LRA TH OFF < <(ffmpeg -hide_banner -i "$IN" -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 \
  | python3 -c "import sys,json,re; d=json.loads(re.search(r'\{[^{}]*\}', sys.stdin.read(), re.S).group()); print(d['input_i'], d['input_tp'], d['input_lra'], d['input_thresh'], d['target_offset'])")
ffmpeg -v error -y -i "$IN" -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$TH:offset=$OFF:linear=true,aresample=48000" -c:a aac -b:a 256k -movflags +faststart "$OUT"
echo "mastered -> $OUT (input was $I LUFS, $TP dBTP)"
