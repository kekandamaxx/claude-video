import {ACTION, EDL} from './edl';
import {Graphics, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import type {Cue, EditConfig} from '../../lib/edit';

// SFX cues: `at` is the output frame where the file's transient lands (HIT table in
// AudioLayer). Effects on top of words are side-chained down by the SFX bus.
const B = T.board;
const CUES: Cue[] = [
	// Hook: road whoosh, HIGHWAY slam, TAHAN stamp
	{sfx: 'whoosh_fast', at: 2, vol: 0.4},
	{sfx: 'impact_fast', at: T.highway, vol: 0.45},
	{sfx: 'pop_hard', at: T.tahan, vol: 0.4},
	// Lineup: chips, two strikes, the pick
	{sfx: 'swoosh_accent', at: T.lineup + 1, vol: 0.35},
	{sfx: 'glitch_break', at: T.centerX, vol: 0.2},
	{sfx: 'pop_light', at: T.ipan, vol: 0.4},
	{sfx: 'glitch_break', at: T.ipanX, vol: 0.2},
	{sfx: 'bass_drum', at: T.engkau, vol: 0.35},
	// Tactic board (HyperFrames): board in, players, pivots, ball flow, 45, luar, X, tarik
	{sfx: 'whoosh_cine', at: B - 3, vol: 0.2, dur: 10}, // lands in the cut gap, clear of "Yang"
	{sfx: 'tick', at: B + 74, vol: 0.3},
	{sfx: 'pop_light', at: B + 83, vol: 0.4},
	{sfx: 'pop_light', at: B + 89, vol: 0.4},
	{sfx: 'pop_light', at: B + 123, vol: 0.35},
	{sfx: 'pop_light', at: B + 135, vol: 0.35},
	{sfx: 'bass_hit', at: T.b45, vol: 0.4},
	{sfx: 'swoosh_wind', at: B + 234, vol: 0.35},
	{sfx: 'glitch_break', at: B + 265, vol: 0.25},
	{sfx: 'whoosh_hit', at: B + 322, vol: 0.3},
	{sfx: 'swoosh_accent', at: B + 332, vol: 0.3},
	// Flow -> tengok
	{sfx: 'pop_light', at: T.flow3 + 1, vol: 0.35},
	{sfx: 'pop_light', at: T.tengok - 2, vol: 0.35},
	// Drill + LAGI x3
	{sfx: 'riser', at: T.drill + 4, vol: 0.14},
	{sfx: 'zoom_impact', at: T.drill + 2, vol: 0.35},
	{sfx: 'impact_fast', at: T.lagi1 - 4, vol: 0.2, dur: 6},
	{sfx: 'impact_fast', at: T.lagi2, vol: 0.2, dur: 6},
	{sfx: 'impact_fast', at: T.lagi3 + 5, vol: 0.35},
	{sfx: 'whoosh_fast', at: T.drill2, vol: 0.35},
	// Switch
	{sfx: 'swoosh_wind', at: T.sw1, vol: 0.4},
	{sfx: 'swoosh_wind', at: T.sw2, vol: 0.4},
	// Rebound / pivot
	{sfx: 'pop_hard', at: T.reboundW, vol: 0.35},
	{sfx: 'swoosh_accent', at: T.pivot + 6, vol: 0.3},
	{sfx: 'bass_drum', at: T.pivotW, vol: 0.4},
	// Game: whoosh in, crowd bed, MASUK stamp
	{sfx: 'whoosh_hit', at: T.brk + 3, vol: 0.35},
	{sfx: 'crowd', at: T.brk + 10, vol: 0.12, dur: 150, fadeIn: 20}, // fades before the shot take
	{sfx: 'impact_trailer', at: T.masuk, vol: 0.35, dur: 40},
	// Pivot shot take
	{sfx: 'zoom_impact', at: T.shot + 2, vol: 0.3},
	{sfx: 'whoosh_fast', at: T.feed, vol: 0.35},
	{sfx: 'heartbeat', at: T.feed + 1, vol: 0.25, dur: 20},
	{sfx: 'impact_fast', at: T.shoot, vol: 0.45},
	{sfx: 'crowd', at: T.shoot + 2, vol: 0.14, dur: 70, fadeIn: 4},
	// Options -> IMPROVISE climax -> end card
	{sfx: 'pop_light', at: T.opt1, vol: 0.4},
	{sfx: 'pop_light', at: T.opt2, vol: 0.4},
	{sfx: 'pop_light', at: T.opt3, vol: 0.4},
	{sfx: 'pop_hard', at: T.opt3 + 6, vol: 0.35},
	{sfx: 'riser', at: T.improvise - 1, vol: 0.2},
	{sfx: 'impact_trailer', at: T.improvise + 1, vol: 0.4, dur: 46},
	{sfx: 'whoosh_cine', at: T.outro + 2, vol: 0.3},
	{sfx: 'bass_hit', at: T.outro + 8, vol: 0.35},
];

// Action shots keep the hall sound (sneakers, ball, team calls) but lower, under the music.
// Clip gain (+4 dB) on words the coach says softly: "kita" in the title line, "tengok dulu".
const SOFT: [number, number][] = [
	[EDL.at('title', 24.5), EDL.at('title', 24.85)],
	[EDL.at('flow3', 66.12), EDL.segEnd('flow3')],
];
const actionGain = (f: number) => {
	const s = EDL.segmentAt(f);
	if (SOFT.some(([a, b]) => f >= a && f < b)) return 1.6;
	return s && ACTION.has(s.id) && s.id !== 'masuk' && s.id !== 'shot' ? 0.55 : 1; // the shot take keeps the coach's "Haa!" at full level
};

export const trainingEdit: EditConfig = {
	id: 'training',
	edl: EDL,
	faces,
	media: {
		master: 'training/video/master.mp4',
		proxy: 'training/video/proxy.mp4',
		voice: 'training/audio/voice.wav',
		music: 'shared/music/epical_drums_02.wav',
		musicTrimFrames: 0,
	},
	captionY: 1290,
	zoomOriginY: 900,
	captionKeys: new Set(['HIGHWAY', 'TAHAN', 'CENTER', 'ENGKAU', 'ATTACK', 'DOUBLE', 'PIVOT', 'FLOW', '45', 'LUAR', 'BELAKANG', 'TARIK', 'KELUAR', 'TENGOK', 'LAGI', 'SWITCH', 'REBOUND', 'MASUK', 'OPTION', 'IMPROVISE']),
	captionAutoFit: true,
	maxFaceHeight: 320,
	Graphics,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	voiceGain: actionGain,
	musicUnderSpeech: 0.085,
	musicInGaps: 0.3,
	sfxBus: 0.55,
};
