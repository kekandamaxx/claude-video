#!/usr/bin/env bash
# Song for the 90 s CapCut-style edit (FriendshipCapcut).
# Usage: scripts/prepare_song.sh <song.mp3|wav|m4a> [start_seconds] [bpm_hint]
#   start_seconds: where in the song the edit starts (e.g. the chorus). Default 0.
#   bpm_hint:      tempo hint for the beat tracker; 0 = estimate (default).
# Writes public/friendship/song.wav (92 s, faded, -14 LUFS) and src/edits/friendship/capcut/song_beats.json,
# and records the start offset there so lyrics.lrc can keep the song's own timestamps.
#
# Lyrics: put your own timed lyrics at public/friendship/lyrics.lrc (standard LRC, "[mm:ss.xx] line",
# timed against the full song). That file and the song are git-ignored.
set -euo pipefail
SRC="${1:?audio file}"; START="${2:-0}"; BPM="${3:-0}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
mkdir -p public/friendship src/edits/friendship/capcut
ffmpeg -v error -y -ss "$START" -t 92 -i "$SRC" -vn -ac 2 -ar 48000 \
  -af "afade=t=in:d=0.25,afade=t=out:st=88:d=4,loudnorm=I=-14:TP=-1.5:LRA=11" public/friendship/song.wav
python3 scripts/friendship_beats.py public/friendship/song.wav src/edits/friendship/capcut/song_beats.json "$BPM"
python3 - "$START" "$SRC" <<'PY'
import json, os, sys
p = 'src/edits/friendship/capcut/song_beats.json'
d = json.load(open(p)); d['start'] = float(sys.argv[1]); d['source'] = os.path.basename(sys.argv[2])
json.dump(d, open(p, 'w'))
PY
echo "song ready: public/friendship/song.wav (from ${START}s)"
