import {EDL} from './edl';
import {Graphics, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import {beat} from './beats';
import type {Cue, EditConfig} from '../../lib/edit';

// SFX cues: `at` is the output frame where the file's transient lands (HIT table
// in AudioLayer). The music leads this edit, so the SFX mark section changes and calls.
const CUES: Cue[] = [
	// Hook: LATIHAN stamp
	{sfx: 'impact_fast', at: 2, vol: 0.45},
	{sfx: 'whoosh_fast', at: T.hook2 - 3, vol: 0.4},
	// Drill 1: a swoosh on each word
	{sfx: 'swoosh_accent', at: beat(8), vol: 0.35},
	{sfx: 'swoosh_accent', at: beat(12), vol: 0.3},
	{sfx: 'swoosh_accent', at: beat(16), vol: 0.3},
	{sfx: 'swoosh_accent', at: beat(20), vol: 0.3},
	// Coach
	{sfx: 'whoosh_cine', at: T.coach, vol: 0.35},
	{sfx: 'pop_light', at: T.coach2, vol: 0.35},
	// Drill 2: SWAP stamp + tick per rep
	{sfx: 'bass_hit', at: T.swapWord, vol: 0.4},
	...[34, 36, 38, 40, 42, 44, 46].map((b) => ({sfx: 'tick', at: beat(b), vol: 0.25})),
	// Rest
	{sfx: 'swoosh_wind', at: T.rest, vol: 0.35},
	{sfx: 'heartbeat', at: T.rest + 8, vol: 0.35},
	{sfx: 'heartbeat', at: T.rest + 38, vol: 0.3},
	{sfx: 'heartbeat', at: T.rest2 + 8, vol: 0.3},
	// Build: stamps, riser into the climax
	{sfx: 'impact_fast', at: T.satu, vol: 0.4},
	{sfx: 'impact_fast', at: T.sekali, vol: 0.45},
	{sfx: 'riser', at: T.climax, vol: 0.2},
	// Climax: PERGI x3
	{sfx: 'bass_drum', at: T.pergi1, vol: 0.35},
	{sfx: 'bass_drum', at: T.pergi2, vol: 0.35},
	{sfx: 'bass_hit', at: T.pergi3, vol: 0.4},
	{sfx: 'whoosh_hit', at: T.hero, vol: 0.35},
	// End card
	{sfx: 'impact_trailer', at: T.outro + 2, vol: 0.4, dur: 46},
	{sfx: 'crowd', at: T.outro - 4, vol: 0.18, trim: 4.5, fadeIn: 8},
];

export const trainingEdit: EditConfig = {
	id: 'training',
	edl: EDL,
	faces,
	media: {
		master: 'training/video/master.mp4',
		proxy: 'training/video/proxy.mp4',
		voice: 'training/audio/voice.wav',
		music: 'shared/music/epical_drums_02.wav',
		musicTrimFrames: 61, // first drum hit at 2.04 s lands on frame 0; beats.ts is measured from here
	},
	captionY: 1320,
	zoomOriginY: 960,
	captionKeys: new Set(['MAIN', 'PAS', 'PERGI', 'LOW', 'MOVE', 'GOOD TRY', 'SWAP', 'HANTAR', 'AGAIN', 'ONE MORE', 'SEKALI', 'LAGI', 'WING']),
	captionAutoFit: true,
	maxFaceHeight: 320,
	Graphics,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	// Montage: the bed leads. Under a call it drops to 0.12 so the shout reads; between calls it carries the cut.
	musicUnderSpeech: 0.12,
	musicInGaps: 0.42,
	sfxBus: 0.55,
};
