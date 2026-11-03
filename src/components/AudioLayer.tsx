import React from 'react';
import {Audio, interpolate, Sequence, staticFile} from 'remotion';
import {at, FPS, SEGMENTS, SPEECH, TOTAL_FRAMES} from '../lib/edl';
import {clamp} from '../lib/anim';
import {T} from './Graphics';

// ---------------------------------------------------------------- music ducking
// Music and voice are both normalised to -14 LUFS in prepare_media.sh.
// Under speech the bed sits at 0.13 (-17.7 dB), in gaps it lifts to 0.30
// (-10.5 dB). Fast attack (3 frames), slow release (10 frames).
const MUSIC_SPEECH = 0.1;
const MUSIC_GAP = 0.28;

// Smoothed speech presence 0..1 (look-ahead 3 frames, release 8) used to
// side-chain the SFX bus as well, so effects never sit on top of a word.
export const SPEECH_ENV: number[] = (() => {
	const e: number[] = [];
	let cur = 0;
	for (let f = 0; f < TOTAL_FRAMES; f++) {
		const tgt = SPEECH.slice(f, f + 4).some(Boolean) ? 1 : 0;
		cur += (tgt - cur) * (tgt > cur ? 0.5 : 1 / 8);
		e.push(cur);
	}
	return e;
})();
const SFX_BUS = 0.55; // overall SFX trim
const SFX_UNDER_SPEECH = 0.2; // -14 dB extra while a word is spoken
export const MUSIC_GAIN: number[] = (() => {
	const target = SPEECH.map((s) => (s ? MUSIC_SPEECH : MUSIC_GAP));
	const g: number[] = [];
	let cur = target[0];
	for (let f = 0; f < TOTAL_FRAMES; f++) {
		const tgt = f >= T.outro ? 0.5 : target[f];
		const k = tgt < cur ? 1 / 3 : 1 / 10;
		cur += (tgt - cur) * k;
		g.push(cur);
	}
	// Hard fade over the final 14 frames.
	return g.map((v, f) => v * interpolate(f, [TOTAL_FRAMES - 14, TOTAL_FRAMES - 1], [1, 0], clamp));
})();

// Clip gain: the closing "Ok. Come on x3" was shouted off-axis and lands ~7 dB
// under the rest of the dialogue, so it gets +5 dB.
const QUIET_FROM = at('last3', 41.8 - 0.95);
const voiceGain = (f: number) => interpolate(f, [QUIET_FROM - 4, QUIET_FROM], [1, 1.78], clamp);

// ---------------------------------------------------------------- SFX cues
type Cue = {sfx: string; at: number; vol: number; hit?: number; trim?: number; dur?: number; fadeIn?: number};
// `hit` = seconds into the file where the transient sits; the cue is shifted so
// that transient lands exactly on `at`.
const HIT: Record<string, number> = {
	bass_drum: 0, bass_hit: 0.06, glitch_break: 0.41, impact_trailer: 0.92, impact_fast: 0.15,
	pop_hard: 0, pop_light: 0.02, riser: 2.53, swoosh_accent: 0.11, swoosh_wind: 0.43,
	tick: 0.66, whoosh_cine: 0.71, whoosh_fast: 1.07, zoom_impact: 0.41, heartbeat: 0.09,
	buzzer: 0.05, crowd: 0,
};

export const CUES: Cue[] = [
	// Hook
	{sfx: 'impact_trailer', at: T.zero, vol: 0.4, dur: 60},
	{sfx: 'bass_hit', at: T.zero, vol: 0.55},
	{sfx: 'glitch_break', at: T.zero + 1, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.hookShrink + 3, vol: 0.4},
	// -> 5 minit
	{sfx: 'whoosh_fast', at: T.five - 6, vol: 0.5},
		{sfx: 'tick', at: T.fiveEnd - 2, vol: 0.4},
	// -> Syahmi / target / rotate
	{sfx: 'swoosh_wind', at: T.fiveEnd - 3, vol: 0.45},
	{sfx: 'pop_hard', at: T.syahmi - 3, vol: 0.4},
	{sfx: 'bass_drum', at: T.please, vol: 0.35},
	{sfx: 'swoosh_accent', at: T.nampak, vol: 0.3},
	{sfx: 'pop_light', at: T.ball1 + 2, vol: 0.75},
	{sfx: 'pop_light', at: T.ball2 + 2, vol: 0.75},
	{sfx: 'pop_hard', at: T.ball2 + 2, vol: 0.25},
	{sfx: 'swoosh_accent', at: T.rotate + 2, vol: 0.45},
	{sfx: 'tick', at: T.rotateFive + 3, vol: 0.45},
	// -> lineup
	{sfx: 'whoosh_cine', at: T.lineup - 4, vol: 0.45},
	{sfx: 'swoosh_accent', at: T.muqri - 2, vol: 0.25},
	{sfx: 'swoosh_accent', at: T.chai - 2, vol: 0.25},
	{sfx: 'swoosh_accent', at: T.jason - 2, vol: 0.25},
	{sfx: 'impact_fast', at: T.ready + 3, vol: 0.5},
	// -> last 3 minutes
	{sfx: 'whoosh_fast', at: T.lineupEnd - 3, vol: 0.45},
	{sfx: 'heartbeat', at: T.last3, vol: 0.8, dur: 22},
	{sfx: 'heartbeat', at: T.last3 + 22, vol: 0.7, dur: 22},
	{sfx: 'swoosh_accent', at: T.plan + 1, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.leading - 5, vol: 0.25},
	{sfx: 'pop_light', at: T.leading + 10, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.gap - 5, vol: 0.25},
	{sfx: 'pop_light', at: T.gap + 10, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.keluar - 3, vol: 0.4},
	// COME ON x3 + outro
	{sfx: 'riser', at: T.come1 - 8, vol: 0.15},
	{sfx: 'impact_fast', at: T.come1 + 1, vol: 0.25},
	{sfx: 'bass_drum', at: T.come1 + 1, vol: 0.3},
	{sfx: 'impact_fast', at: T.come2 + 1, vol: 0.25},
	{sfx: 'bass_drum', at: T.come2 + 1, vol: 0.45},
	{sfx: 'impact_trailer', at: T.come3 + 1, vol: 0.45, dur: 70},
	{sfx: 'bass_drum', at: T.come3 + 1, vol: 0.5},
	{sfx: 'crowd', at: T.come3, vol: 0.18, trim: 4.5, fadeIn: 8},
	{sfx: 'buzzer', at: T.outro + 2, vol: 0.45},
];

const SfxCue: React.FC<{cue: Cue}> = ({cue}) => {
	const hit = Math.round((HIT[cue.sfx] ?? 0) * FPS);
	let start = cue.at - hit;
	let trimBefore = Math.round((cue.trim ?? 0) * FPS);
	if (start < 0) {
		trimBefore += -start;
		start = 0;
	}
	const dur = Math.min(cue.dur ?? 6 * FPS, TOTAL_FRAMES - start);
	if (dur <= 0) return null;
	return (
		<Sequence from={start} durationInFrames={dur} name={`sfx:${cue.sfx}`} layout="none">
			<Audio
				src={staticFile(`sfx/${cue.sfx}.wav`)}
				trimBefore={trimBefore || undefined}
				volume={(f) => {
					const fin = cue.fadeIn ? interpolate(f, [0, cue.fadeIn], [0, 1], clamp) : 1;
					const fout = interpolate(f, [dur - 6, dur], [1, 0], clamp);
					const end = interpolate(start + f, [TOTAL_FRAMES - 12, TOTAL_FRAMES - 1], [1, 0], clamp);
					const sp = SPEECH_ENV[Math.min(start + f, TOTAL_FRAMES - 1)];
					const duck = 1 - (1 - SFX_UNDER_SPEECH) * sp;
					return cue.vol * SFX_BUS * duck * fin * fout * end;
				}}
			/>
		</Sequence>
	);
};

export const AudioLayer: React.FC<{music: boolean; sfx: boolean; voice: boolean}> = ({music, sfx, voice}) => (
	<>
		{voice
			? SEGMENTS.map((s) => (
					<Sequence key={s.id} from={s.outFrom} durationInFrames={s.len} name={`voice:${s.id}`} layout="none">
						<Audio
							src={staticFile('audio/voice.wav')}
							trimBefore={s.srcFrom}
							trimAfter={s.srcFrom + s.len}
							// 2-frame fades hide clicks and room-tone jumps at each cut.
							volume={(f) => interpolate(f, [0, 2, s.len - 2, s.len], [0, 1, 1, 0], clamp) * voiceGain(s.outFrom + f)}
						/>
					</Sequence>
				))
			: null}
		{music ? <Audio src={staticFile('audio/music.wav')} trimBefore={61} volume={(f) => MUSIC_GAIN[Math.min(f, MUSIC_GAIN.length - 1)]} /> : null}
		{sfx ? CUES.map((c, i) => <SfxCue key={i} cue={c} />) : null}
	</>
);
