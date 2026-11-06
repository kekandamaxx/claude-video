import {EDL} from './edl';
import {Graphics, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import type {Cue, EditConfig} from '../../lib/edit';

// SFX cues: `at` is the output frame where the file's transient lands (HIT table
// in AudioLayer). Effects on top of words are side-chained down by the SFX bus.
const CUES: Cue[] = [
	// Hook: JANGAN stamp + tally
	{sfx: 'impact_fast', at: T.jangan + 2, vol: 0.45},
	{sfx: 'swoosh_accent', at: T.dah - 3, vol: 0.25},
	{sfx: 'pop_light', at: T.dah, vol: 0.4},
	{sfx: 'pop_light', at: T.dah + 3, vol: 0.4},
	{sfx: 'pop_light', at: T.dah + 6, vol: 0.4},
	{sfx: 'pop_light', at: T.dah + 9, vol: 0.4},
	// -> situation: kena siku, panggil coach
	{sfx: 'whoosh_fast', at: T.siku - 4, vol: 0.45},
	{sfx: 'bass_hit', at: T.sikuWord - 1, vol: 0.45},
	{sfx: 'swoosh_accent', at: T.panggil - 2, vol: 0.3},
	{sfx: 'pop_hard', at: T.coach - 1, vol: 0.35},
	// -> pemain vs coach
	{sfx: 'swoosh_wind', at: T.biar - 3, vol: 0.4},
	{sfx: 'pop_light', at: T.beritahu + 4, vol: 0.4},
	// -> TD, cards
	{sfx: 'whoosh_cine', at: T.td - 4, vol: 0.4},
	{sfx: 'bass_drum', at: T.td1, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.gaduh, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.panggil2 - 2, vol: 0.3},
	// -> sikit lagi
	{sfx: 'swoosh_wind', at: T.sikit - 3, vol: 0.4},
	{sfx: 'tick', at: T.sikit + 6, vol: 0.35},
	{sfx: 'tick', at: T.sikit2 + 4, vol: 0.35},
	// -> tak tahu kenapa / tanya
	{sfx: 'whoosh_fast', at: T.pernah - 4, vol: 0.4},
	{sfx: 'glitch_break', at: T.tahu - 2, vol: 0.25},
	{sfx: 'swoosh_accent', at: T.tanya - 4, vol: 0.2},
	// -> KENA JUGA stamp
	{sfx: 'impact_fast', at: T.kena + 2, vol: 0.45},
	// -> biasanya dia panggil + outro
	{sfx: 'whoosh_cine', at: T.biasa - 6, vol: 0.3},
	{sfx: 'riser', at: T.outro, vol: 0.15},
	{sfx: 'impact_trailer', at: T.outro + 2, vol: 0.4, dur: 38},
	{sfx: 'crowd', at: T.outro - 4, vol: 0.18, trim: 4.5, fadeIn: 8},
];

export const briefingEdit: EditConfig = {
	id: 'briefing',
	edl: EDL,
	faces,
	media: {
		master: 'briefing/video/master.mp4',
		proxy: 'briefing/video/proxy.mp4',
		voice: 'briefing/audio/voice.wav',
		music: 'shared/music/epical_drums_02.wav',
		musicTrimFrames: 61, // first drum hit at 2.04 s lands on the hook
	},
	captionY: 765,
	zoomOriginY: 1180,
	captionKeys: new Set(['JANGAN', 'BERITAHU', 'BANYAK', 'SIKU-SIKU', 'PANGGIL', 'COACH', 'KITA', 'TD', 'GADUH', 'SIKIT', 'LAGI', 'PERNAH', 'KENAPA', 'TANYA', 'KENA', 'JUGA', 'BIASANYA']),
	captionAutoFit: true,
	Graphics,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	musicUnderSpeech: 0.08, // quieter delivery in this clip: -2 dB vs the other edits
	musicInGaps: 0.28,
	sfxBus: 0.55,
};
