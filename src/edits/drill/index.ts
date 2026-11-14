import {EDL, CAPTION_Y} from './edl';
import {Graphics, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import type {Cue, EditConfig} from '../../lib/edit';

// SFX cues: `at` is the output frame where the file's transient lands (HIT table in
// AudioLayer). Anything that lands on a word is side-chained down by the SFX bus.
const CUES: Cue[] = [
	// Hook (HyperFrames title on screen from frame 0)
	{sfx: 'zoom_impact', at: 1, vol: 0.4},
	{sfx: 'swoosh_accent', at: T.lompat - 2, vol: 0.4},
	{sfx: 'bass_hit', at: T.lompat, vol: 0.45},
	{sfx: 'pop_hard', at: T.move, vol: 0.35},
	// ATTACK struck out -> DEFENSE
	{sfx: 'whoosh_fast', at: EDL.seg('bukan').outFrom - 2, vol: 0.4},
	{sfx: 'glitch_break', at: T.attack + 1, vol: 0.3},
	{sfx: 'swoosh_wind', at: T.defenseA - 6, vol: 0.3},
	{sfx: 'impact_trailer', at: T.defenseA, vol: 0.35, dur: 40},
	// touch / patah balik
	{sfx: 'whoosh_cine', at: T.touchSeg - 2, vol: 0.3},
	{sfx: 'pop_light', at: T.bola - 3, vol: 0.4},
	{sfx: 'pop_hard', at: T.touchW - 1, vol: 0.4},
	{sfx: 'swoosh_accent', at: T.patah, vol: 0.4},
	// jalan, tutup ... lama-lama: a snap on every "tutup" as the walls close
	{sfx: 'whoosh_fast', at: T.jalanSeg - 2, vol: 0.35},
	...T.tutups.map((t, n) => ({sfx: 'pop_hard', at: t, vol: 0.22 + 0.04 * n})),
	{sfx: 'swoosh_wind', at: T.lama + 2, vol: 0.3},
	// itu satu
	{sfx: 'impact_fast', at: T.satuW, vol: 0.45},
	// macam ni
	{sfx: 'whoosh_fast', at: T.floorSeg - 2, vol: 0.3},
	{sfx: 'pop_hard', at: T.macamF, vol: 0.4},
	// defense kena macam ni
	{sfx: 'whoosh_cine', at: T.kenaSeg - 2, vol: 0.3},
	{sfx: 'bass_hit', at: T.defK, vol: 0.4},
	{sfx: 'swoosh_accent', at: T.macamK, vol: 0.3},
	// sebab apa?
	{sfx: 'heartbeat', at: T.sebabSeg + 1, vol: 0.4, dur: 30},
	{sfx: 'glitch_break', at: T.sebabW, vol: 0.35},
	// berdua (no) vs defense (yes)
	{sfx: 'whoosh_fast', at: T.berduaSeg - 2, vol: 0.35},
	{sfx: 'buzzer', at: T.reverse1 + 1, vol: 0.18, dur: 14},
	{sfx: 'whoosh_fast', at: T.banyakSeg - 2, vol: 0.35},
	{sfx: 'pop_hard', at: T.defM, vol: 0.35},
	{sfx: 'impact_fast', at: T.banyak, vol: 0.45},
	{sfx: 'crowd', at: T.reverse2, vol: 0.22, dur: 70, fadeIn: 6},
	// end card (HyperFrames)
	{sfx: 'whoosh_hit', at: T.outro + 2, vol: 0.35},
	{sfx: 'impact_trailer', at: T.outro + 10, vol: 0.4, dur: 60},
];

export const drillEdit: EditConfig = {
	id: 'drill',
	edl: EDL,
	faces,
	media: {
		master: 'drill/video/master.mp4',
		proxy: 'drill/video/proxy.mp4',
		voice: 'drill/audio/voice.wav',
		music: 'shared/music/epical_drums_02.wav',
		musicTrimFrames: 0,
	},
	captionY: CAPTION_Y,
	zoomOriginY: 940,
	captionKeys: new Set(['ATTACK', 'DEFENSE', 'TOUCH', 'PATAH', 'BALIK', 'LOMPAT', 'MOVE', 'TUTUP', 'FLOW', 'LAMA-LAMA', 'SATU', 'MACAM', 'KENA', 'APA', 'BERDUA', 'REVERSE', 'BANYAK']),
	captionAutoFit: true,
	// Wider than the default (x 90-930, still inside x 60-960): 4-word chunks stay on 2 lines.
	captionZone: {x: 90, w: 840},
	maxFaceHeight: 200,
	Graphics,
	overlay: {src: 'drill/overlay/hf_overlay.webm'},
	shakeHits: SHAKE_HITS,
	cues: CUES,
	// Outdoor court, quiet phone-mic voice: the bed sits 5 dB under the coach edits while he speaks.
	musicUnderSpeech: 0.055,
	musicInGaps: 0.26,
	sfxBus: 0.55,
};
