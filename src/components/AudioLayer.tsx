import React, {useMemo} from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {FPS} from '../lib/edl';
import {clamp} from '../lib/anim';
import {Cue, EditConfig, useEdit} from '../lib/edit';

// Seconds into each SFX file where its transient sits; a cue is shifted so the
// transient lands exactly on its `at` frame.
const HIT: Record<string, number> = {
	bass_drum: 0, bass_hit: 0.06, glitch_break: 0.41, impact_trailer: 0.92, impact_fast: 0.15,
	pop_hard: 0, pop_light: 0.02, riser: 2.53, swoosh_accent: 0.11, swoosh_wind: 0.43,
	tick: 0.66, whoosh_cine: 0.71, whoosh_fast: 1.07, zoom_impact: 0.41, heartbeat: 0.09,
	buzzer: 0.05, crowd: 0, whoosh_hit: 3.16,
	tape_rewind: 0.3, shutter: 0.13, movie_impact: 1.17, trailer_whoosh: 3.15, crowd_chant: 0, heart_single: 0.02,
};

const SFX_UNDER_SPEECH = 0.2; // -14 dB extra on the SFX bus while a word is spoken

/** Gain curves derived from the edit's speech mask. */
const buildMix = (e: EditConfig) => {
	const {speech, totalFrames, cutEnd} = e.edl;
	// Smoothed speech presence 0..1 (3-frame look-ahead, 8-frame release): side-chains the SFX bus.
	const speechEnv: number[] = [];
	let cur = 0;
	for (let f = 0; f < totalFrames; f++) {
		const tgt = speech.slice(f, f + 4).some(Boolean) ? 1 : 0;
		cur += (tgt - cur) * (tgt > cur ? 0.5 : 1 / 8);
		speechEnv.push(cur);
	}
	// Music: both stems are normalised to -14 LUFS, so these are the ducked levels.
	// Fast attack (3 frames), slow release (10 frames), lift on the outro, hard fade at the end.
	const target = speech.map((s) => (s ? e.musicUnderSpeech : e.musicInGaps));
	const music: number[] = [];
	let g = target[0];
	for (let f = 0; f < totalFrames; f++) {
		const tgt = f >= cutEnd ? 0.5 : target[f];
		g += (tgt - g) * (tgt < g ? 1 / 3 : 1 / 10);
		music.push(g * interpolate(f, [totalFrames - 14, totalFrames - 1], [1, 0], clamp));
	}
	return {speechEnv, music};
};

const SfxCue: React.FC<{cue: Cue; speechEnv: number[]; total: number; bus: number}> = ({cue, speechEnv, total, bus}) => {
	const hit = Math.round((HIT[cue.sfx] ?? 0) * FPS);
	let start = cue.at - hit;
	let trimBefore = Math.round((cue.trim ?? 0) * FPS);
	if (start < 0) {
		trimBefore += -start;
		start = 0;
	}
	const dur = Math.min(cue.dur ?? 6 * FPS, total - start);
	if (dur <= 0) return null;
	return (
		<Sequence from={start} durationInFrames={dur} name={`sfx:${cue.sfx}`} layout="none">
			<Audio
				src={staticFile(`shared/sfx/${cue.sfx}.wav`)}
				trimBefore={trimBefore || undefined}
				volume={(f) => {
					const fin = cue.fadeIn ? interpolate(f, [0, cue.fadeIn], [0, 1], clamp) : 1;
					const fout = interpolate(f, [dur - 6, dur], [1, 0], clamp);
					const end = interpolate(start + f, [total - 12, total - 1], [1, 0], clamp);
					const duck = 1 - (1 - SFX_UNDER_SPEECH) * speechEnv[Math.min(start + f, total - 1)];
					return cue.vol * bus * duck * fin * fout * end;
				}}
			/>
		</Sequence>
	);
};

export const AudioLayer: React.FC<{music: boolean; sfx: boolean; voice: boolean}> = ({music, sfx, voice}) => {
	const e = useEdit();
	const mix = useMemo(() => buildMix(e), [e]);
	const total = e.edl.totalFrames;
	return (
		<>
			{voice
				? e.edl.segments.map((s, i, all) => {
						if (s.voice === false) return null;
						// Dialogue that runs on across a picture-only cut (B-roll / stills) is not faded.
						const joins = (a?: (typeof all)[number], b?: (typeof all)[number]) => !!a && !!b && a.voice !== false && b.voice !== false && a.srcFrom + a.len === b.srcFrom;
						const fin = joins(all[i - 1], s) ? 0.01 : 2;
						const fout = joins(s, all[i + 1]) ? 0.01 : 2;
						return (
							<Sequence key={s.id} from={s.outFrom} durationInFrames={s.len} name={`voice:${s.id}`} layout="none">
								<Audio
									src={staticFile(e.media.voice)}
									trimBefore={s.srcFrom}
									trimAfter={s.srcFrom + s.len}
									// 2-frame fades hide clicks and room-tone jumps at each real cut.
									volume={(f) => interpolate(f, [0, fin, s.len - fout, s.len], [fin < 1 ? 1 : 0, 1, 1, fout < 1 ? 1 : 0], clamp) * (e.voiceGain ? e.voiceGain(s.outFrom + f) : 1)}
								/>
							</Sequence>
						);
					})
				: null}
			{music ? <Audio src={staticFile(e.media.music)} trimBefore={e.media.musicTrimFrames} volume={(f) => mix.music[Math.min(f, total - 1)]} /> : null}
			{sfx ? e.cues.map((c, i) => <SfxCue key={i} cue={c} speechEnv={mix.speechEnv} total={total} bus={e.sfxBus} />) : null}
		</>
	);
};
