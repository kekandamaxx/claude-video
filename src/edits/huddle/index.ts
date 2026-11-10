import {EDL} from './edl';
import {Graphics, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import type {Cue, EditConfig} from '../../lib/edit';

// SFX cues: `at` is the output frame where the file's transient lands (HIT table
// in AudioLayer). Effects on top of words are side-chained down by the SFX bus.
const CUES: Cue[] = [
	// Hook: heartbeat under "budak perempuan kena tinggal", slam on -3, dots on "tau..."
	{sfx: 'heart_single', at: T.hook + 1, vol: 0.55},
	{sfx: 'heart_single', at: T.hook + 17, vol: 0.55},
	{sfx: 'swoosh_accent', at: T.budak, vol: 0.22},
	{sfx: 'swoosh_accent', at: T.kenaH, vol: 0.22},
	{sfx: 'movie_impact', at: T.three, vol: 0.5, dur: 50},
	{sfx: 'pop_hard', at: T.gol, vol: 0.28},
	{sfx: 'tick', at: T.tau + 1, vol: 0.25},
	{sfx: 'tick', at: T.tau + 4, vol: 0.25},
	{sfx: 'tick', at: T.tau + 7, vol: 0.25},
	// Rewind to the start of the talk (flashback): the line-up
	{sfx: 'tape_rewind', at: T.hookEnd - 3, vol: 0.4, dur: 22},
	{sfx: 'swoosh_accent', at: T.afiq - 2, vol: 0.3},
	{sfx: 'pop_light', at: T.okay, vol: 0.35},
	{sfx: 'swoosh_accent', at: T.keeper - 2, vol: 0.3},
	{sfx: 'pop_light', at: T.syahmi, vol: 0.4},
	{sfx: 'swoosh_accent', at: T.captainW - 2, vol: 0.3},
	{sfx: 'shutter', at: T.simpan + 4, vol: 0.35},
	// Positions board: WING KIRI, 45 KIRI
	{sfx: 'whoosh_fast', at: T.wingSeg, vol: 0.32},
	{sfx: 'pop_hard', at: T.wingW, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.ffSeg, vol: 0.25},
	{sfx: 'pop_hard', at: T.ff, vol: 0.3},
	// SEMUA BOLEH MOVE + footprints
	{sfx: 'whoosh_fast', at: T.move - 1, vol: 0.45},
	...[0, 1, 2, 3, 4, 5].map((i): Cue => ({sfx: 'pop_light', at: T.semua2 + i * 2, vol: 0.16})),
	{sfx: 'pop_hard', at: T.footwork, vol: 0.3},
	// BASIC stamp
	{sfx: 'swoosh_wind', at: T.basicSeg - 2, vol: 0.35},
	{sfx: 'swoosh_accent', at: T.remember, vol: 0.2},
	{sfx: 'bass_hit', at: T.basic, vol: 0.5},
	// Tactics board: drive, collapse, pass, catch, "?"
	{sfx: 'whoosh_fast', at: T.tebukSeg - 2, vol: 0.3},
	{sfx: 'whoosh_cine', at: T.tebuk + 4, vol: 0.32},
	{sfx: 'bass_drum', at: T.tebuk + 9, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.release + 1, vol: 0.38},
	{sfx: 'pop_light', at: T.release + 9, vol: 0.4},
	{sfx: 'pop_light', at: T.faham, vol: 0.3},
	// FULL PRESSURE gauge -> 40 MINIT stopwatch
	{sfx: 'swoosh_wind', at: T.pressureSeg, vol: 0.3},
	{sfx: 'zoom_impact', at: T.full + 3, vol: 0.28},
	{sfx: 'bass_hit', at: T.pressure, vol: 0.35},
	{sfx: 'zoom_impact', at: T.forty, vol: 0.3},
	{sfx: 'tick', at: T.forty + 3, vol: 0.22},
	{sfx: 'tick', at: T.forty + 7, vol: 0.22},
	{sfx: 'tick', at: T.forty + 11, vol: 0.22},
	{sfx: 'heart_single', at: T.ingat, vol: 0.5},
	// MENTAL: power-down on "tinggal", JANGAN stamp, recharge, riser into the payoff
	{sfx: 'glitch_break', at: T.tinggal + 1, vol: 0.3},
	{sfx: 'bass_drum', at: T.jangan, vol: 0.32},
	{sfx: 'swoosh_accent', at: T.mentalW + 2, vol: 0.25},
	{sfx: 'riser', at: T.boleh, vol: 0.22},
	// BOLEH MENANG: the flip + crowd under the hands-in
	{sfx: 'impact_trailer', at: T.menang + 2, vol: 0.5, dur: 60},
	{sfx: 'crowd', at: T.menang + 4, vol: 0.2, trim: 2.0, fadeIn: 10, dur: 120},
	{sfx: 'whoosh_fast', at: T.cheer, vol: 0.25},
	// Freeze on the shout: shutter click, hit, end card
	{sfx: 'shutter', at: T.shout, vol: 0.5},
	{sfx: 'impact_fast', at: T.shout + 1, vol: 0.45},
	{sfx: 'trailer_whoosh', at: T.shout + 2, vol: 0.3, dur: 60},
	{sfx: 'crowd_chant', at: T.shout, vol: 0.14, trim: 6, fadeIn: 6, dur: 80},
];

export const huddleEdit: EditConfig = {
	id: 'huddle',
	edl: EDL,
	faces,
	media: {
		master: 'huddle/video/master.mp4',
		proxy: 'huddle/video/proxy.mp4',
		voice: 'huddle/audio/voice.wav',
		music: 'huddle/audio/music_bed.wav',
		// Drop at 21.32 s in the bed lands on "Boleh" (20.70 s out); the break (19.25-21.32 s)
		// sits under "Ingat, kena tinggal, jangan mental down".
		musicTrimFrames: 19,
	},
	captionY: 1300,
	zoomOriginY: 600,
	captionKeys: new Set(['AFIQ', 'WING', 'KIRI', '45', 'PRESSURE', 'MOVE', 'FOOTWORK', 'BASIC', 'TEBUK', 'RELEASE', 'FAHAM', 'KEEPER', 'SYAHMI', 'CAPTAIN', 'SIMPAN', '40', 'MINIT', 'INGAT', 'TINGGAL', 'MENTAL', 'DOWN']),
	captionAutoFit: true,
	maxFaceHeight: 330, // the coach is close to the lens in clip3 (faces up to 311 px); 353 px is a back-of-head false hit
	Graphics,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	musicUnderSpeech: 0.1,
	musicInGaps: 0.28,
	sfxBus: 0.55,
};
