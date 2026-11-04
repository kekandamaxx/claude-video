import {EDL} from './edl';
import {Graphics, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import type {Cue, EditConfig} from '../../lib/edit';
import {interpolate} from 'remotion';
import {clamp} from '../../lib/anim';

const {at} = EDL;

// Clip gain: the closing "Ok. Come on x3" was shouted off-axis and lands ~7 dB
// under the rest of the dialogue, so it gets +5 dB.
const QUIET_FROM = at('last3', 41.8 - 0.95);
const voiceGain = (f: number) => interpolate(f, [QUIET_FROM - 4, QUIET_FROM], [1, 1.78], clamp);

// `at` is the output frame where the SFX transient lands (see HIT in AudioLayer).
const CUES: Cue[] = [
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

export const timeoutEdit: EditConfig = {
	id: 'timeout',
	edl: EDL,
	faces: faces,
	media: {
		master: 'timeout/video/master.mp4',
		proxy: 'timeout/video/proxy.mp4',
		voice: 'timeout/audio/voice.wav',
		music: 'shared/music/epical_drums_02.wav',
		musicTrimFrames: 61,
	},
	captionY: 1280,
	zoomOriginY: 864,
	captionKeys: new Set(['7', 'ATTACK', 'KEEPER', 'SATU', 'TAK', 'DAPAT', '5', 'MINIT', 'SYAHMI', 'PLEASE', '1', '2', 'BIJI', 'ROTATE', 'MUQRI', 'CHAI', 'JASON', 'READY', 'LAST', '3', 'MINUTES', 'LEADING', 'GAP', 'KELUARKAN', 'BALIK', 'COME', 'ON']),
	Graphics,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	voiceGain,
	musicUnderSpeech: 0.1,
	musicInGaps: 0.28,
	sfxBus: 0.55,
};

export {T};
