import {EDL} from './edl';
import {BOARD, Graphics, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import type {Cue, EditConfig} from '../../lib/edit';

// SFX cues: `at` is the output frame where the file's transient lands (HIT table in
// AudioLayer). Anything on top of a word is side-chained down by the SFX bus.
const CUES: Cue[] = [
	// Hook: FLY lands, PENALTI stamp + strike-through
	{sfx: 'swoosh_accent', at: T.fly - 1, vol: 0.35},
	{sfx: 'impact_fast', at: T.penalti, vol: 0.5},
	{sfx: 'glitch_break', at: T.penalti + 6, vol: 0.18},
	// KENAPA?
	{sfx: 'swoosh_accent', at: T.kenapa, vol: 0.3},
	{sfx: 'pop_light', at: T.kenapaWord + 1, vol: 0.45},
	// Race: wall dashes, ball crawls, wall wins
	{sfx: 'whoosh_fast', at: T.sebab, vol: 0.4},
	{sfx: 'swoosh_wind', at: T.wallWord, vol: 0.35},
	{sfx: 'tick', at: T.wallWord + 6, vol: 0.3},
	{sfx: 'tick', at: T.wallWord + 14, vol: 0.3},
	{sfx: 'bass_hit', at: T.sampai + 8, vol: 0.45},
	// Lob board: board in, long airy flight, lock-out
	{sfx: 'whoosh_cine', at: BOARD.lob + 4, vol: 0.4},
	{sfx: 'swoosh_wind', at: BOARD.lob + 24, vol: 0.3},
	{sfx: 'pop_hard', at: BOARD.lobLand + 1, vol: 0.4},
	{sfx: 'zoom_impact', at: T.tutupWord, vol: 0.45},
	// Sharp board: flat pass snaps in, shot
	{sfx: 'whoosh_fast', at: BOARD.sharpLand - 2, vol: 0.45},
	{sfx: 'pop_light', at: BOARD.sharpLand + 2, vol: 0.5},
	{sfx: 'bass_drum', at: BOARD.sharpShot + 4, vol: 0.35},
	// MOVE! x2 + direction arrow
	{sfx: 'impact_fast', at: T.move1Word, vol: 0.45},
	{sfx: 'impact_fast', at: T.move2Word, vol: 0.5},
	{sfx: 'whoosh_fast', at: T.point + 6, vol: 0.45},
	{sfx: 'pop_hard', at: T.point + 12, vol: 0.3},
	// Outro
	{sfx: 'riser', at: T.outro, vol: 0.15},
	{sfx: 'impact_trailer', at: T.outro + 14, vol: 0.4, dur: 50},
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
		musicTrimFrames: 61, // first drum hit at 2.04 s lands on the hook
	},
	captionY: 800,
	zoomOriginY: 1100,
	captionKeys: new Set(['FLY', 'PENALTI', 'WALL', 'DULU', 'BOLA', 'LAMBUNG', 'MOVE', 'TUTUP', 'SHARP', 'BELUM']),
	captionAutoFit: true,
	maxFaceHeight: 200,
	Graphics,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	musicUnderSpeech: 0.09,
	musicInGaps: 0.3,
	sfxBus: 0.55,
};
