#!/usr/bin/env python3
"""Downbeat grid of the tribute soundtrack -> src/edits/friendship/beats.json.

Usage: python3 scripts/friendship_beats.py <music.wav> <out.json>
The track is 76 BPM 4/4. Beats come from librosa's tracker with a 76 BPM prior; the bar phase is
the beat phase with the most harmonic change (chord changes land on the downbeat).
"""
import json
import sys

import librosa
import numpy as np

src, out = sys.argv[1], sys.argv[2]
y, sr = librosa.load(src, sr=22050, mono=True)
hop = 512
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
_, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, trim=False, start_bpm=76, tightness=400)
bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
ch = librosa.util.sync(librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop), beats, aggregate=np.median)
nov = np.r_[0, 1 - np.sum(ch[:, 1:] * ch[:, :-1], 0) / (np.linalg.norm(ch[:, 1:], axis=0) * np.linalg.norm(ch[:, :-1], axis=0) + 1e-9)]
phase = int(np.argmax([nov[p::4].mean() for p in range(4)]))
# Check the phase holds in every 32-beat window (a seam off the bar would break it).
for i0 in range(0, len(bt) - 32, 32):
    w = np.arange(i0, i0 + 32)
    local = int(np.argmax([nov[w[w % 4 == p]].mean() for p in range(4)]))
    if local != phase:
        print(f'WARNING: bar phase changes near {bt[i0]:.1f} s ({phase} -> {local})')
down = bt[phase::4]
period = float(np.median(np.diff(bt)))
json.dump({'bpm': round(60 / period, 2), 'beat': round(period, 4), 'beats': [round(float(t), 3) for t in bt],
           'downbeats': [round(float(t), 3) for t in down]}, open(out, 'w'))
print(f'{len(bt)} beats, {len(down)} bars, {60 / period:.1f} BPM, phase {phase} -> {out}')
