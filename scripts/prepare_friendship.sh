#!/usr/bin/env bash
# Media for the "A Friendship to Remember" tribute (FriendshipTribute composition).
# Usage: scripts/prepare_friendship.sh [photos_dir]     (default: assets/friendship/photos)
#
#   1. scans every photo (faces, upscaled working copy, blurred backdrop) -> src/edits/friendship/photos.json
#   2. builds the soundtrack: Mixkit "We Will Get It" by Eugenio Mininni (id 598, Mixkit free
#      licence: free for use in videos, not for redistribution, so it is downloaded here and not
#      committed). Soft piano 0-78 s, strings 78-178 s, climax 196-222 s, piano outro.
#      One beat-aligned cut (97.45 s -> 174.59 s; chroma+MFCC match 0.82 before / 0.89 after,
#      0 dB level step) brings the climax to ~119 s, on the appreciation scene.
#      Replace the music: drop any file at public/friendship/music.wav and skip step 2.
#   3. renders film-grain tiles.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PHOTOS="${1:-assets/friendship/photos}"
PUB="$ROOT/public/friendship"; TMP="$(mktemp -d)"
mkdir -p "$PUB/grain"
cd "$ROOT"

python3 scripts/friendship_scan.py "$PHOTOS"

# Keep these in sync with MUSIC in src/edits/friendship/story.ts.
CUT_FROM=97.45; CUT_TO=174.59; XF=0.5
if [ ! -f "$PUB/music.wav" ] || [ "${FORCE_MUSIC:-0}" = 1 ]; then
  curl -sSL -o "$TMP/m.mp3" https://assets.mixkit.co/music/598/598.mp3
  A_END=$(python3 -c "print($CUT_FROM+$XF/2)"); B_START=$(python3 -c "print($CUT_TO-$XF/2)")
  ffmpeg -v error -y -i "$TMP/m.mp3" -filter_complex "\
[0:a]atrim=0:$A_END,asetpts=PTS-STARTPTS[a];\
[0:a]atrim=start=$B_START,asetpts=PTS-STARTPTS[b];\
[a][b]acrossfade=d=$XF:c1=qsin:c2=qsin,aresample=48000,\
loudnorm=I=-16:TP=-1.5:LRA=14[out]" -map "[out]" -ac 2 "$PUB/music.wav"
fi

# Film grain: 12 tiles of mid-grey gaussian noise (512x512), cycled per frame with offsets.
for i in $(seq 0 11); do
  ffmpeg -v error -y -f lavfi -i "color=c=0x808080:s=512x512:d=1" \
    -vf "noise=alls=38:allf=t:all_seed=$((i*7919+13)),format=gray,gblur=sigma=0.55" \
    -frames:v 1 "$PUB/grain/g$i.png"
done
rm -rf "$TMP"
echo "friendship media ready in $PUB"
