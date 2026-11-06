import {EDL} from './edl';
import {Graphics, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import type {Cue, EditConfig} from '../../lib/edit';

// SFX cues: `at` is the output frame where the file's transient lands (HIT table
// in AudioLayer). Effects on top of words are side-chained down by the SFX bus.
const CUES: Cue[] = [
	// Hook: sip + MasyaAllah sparkle
	{sfx: 'pop_light', at: 3, vol: 0.4},
	{sfx: 'swoosh_accent', at: T.masya - 3, vol: 0.3},
	{sfx: 'pop_light', at: T.masya, vol: 0.45},
	{sfx: 'pop_light', at: T.masya + 4, vol: 0.4},
	// Pink vs Mesir
	{sfx: 'whoosh_fast', at: T.guava - 4, vol: 0.4},
	{sfx: 'pop_hard', at: T.warna - 1, vol: 0.4},
	{sfx: 'swoosh_accent', at: T.tapi + 2, vol: 0.3},
	{sfx: 'pop_hard', at: T.mesir - 1, vol: 0.4},
	// Pekat / sedap / stars
	{sfx: 'pop_light', at: T.pekat - 1, vol: 0.4},
	{sfx: 'pop_light', at: T.sedap - 1, vol: 0.4},
	{sfx: 'pop_light', at: T.sedapSangat - 3, vol: 0.3},
	{sfx: 'pop_light', at: T.sedapSangat, vol: 0.3},
	{sfx: 'pop_light', at: T.sedapSangat + 3, vol: 0.3},
	{sfx: 'pop_light', at: T.sedapSangat + 6, vol: 0.3},
	{sfx: 'pop_light', at: T.sedapSangat + 9, vol: 0.35},
	// ?% -> 25%
	{sfx: 'whoosh_cine', at: T.persenSeg - 6, vol: 0.3},
	{sfx: 'glitch_break', at: T.berapa - 1, vol: 0.2},
	{sfx: 'swoosh_wind', at: T.dua - 3, vol: 0.35},
	{sfx: 'tick', at: T.dua + 4, vol: 0.3},
	{sfx: 'tick', at: T.dua + 10, vol: 0.3},
	{sfx: 'bass_drum', at: T.dua2, vol: 0.3},
	// B-roll: PROMO, best-best, bottle, TUNGGU
	{sfx: 'whoosh_fast', at: T.pallet - 4, vol: 0.45},
	{sfx: 'impact_fast', at: T.promo - 1, vol: 0.35},
	{sfx: 'swoosh_wind', at: T.crates - 3, vol: 0.35},
	{sfx: 'swoosh_accent', at: T.bottle1 - 2, vol: 0.35},
	{sfx: 'impact_fast', at: T.tunggu + 2, vol: 0.45},
	{sfx: 'riser', at: T.outro, vol: 0.15},
	{sfx: 'impact_trailer', at: T.outro + 3, vol: 0.35, dur: 46},
];

export const vivaEdit: EditConfig = {
	id: 'viva',
	edl: EDL,
	faces,
	media: {
		master: 'viva/video/talk_master.mp4',
		proxy: 'viva/video/talk_proxy.mp4',
		voice: 'viva/audio/voice.wav',
		music: 'shared/music/sounds_good.wav',
		musicTrimFrames: 0, // upbeat bed starts on its first beat
	},
	captionY: 1310,
	zoomOriginY: 660,
	captionKeys: new Set(['MASYAALLAH', 'RASA', 'GUAVA', 'MALAYSIA', 'PINK', 'MESIR', 'COLOUR', 'PEKAT', 'SEDAP', 'SANGAT', 'PERSEN', '25', 'SABAR', 'PROMO', 'BEST-BEST', 'TUNGGU-TUNGGU']),
	captionAutoFit: true,
	maxFaceHeight: 600, // she is close to the lens: real faces reach 350 px
	Graphics,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	musicUnderSpeech: 0.08, // phone-mic dialogue is quiet: -2 dB vs the coach edits
	musicInGaps: 0.28,
	sfxBus: 0.55,
};
