import {EDL} from './edl';
import {GAMEOVER_AT, Grade, Graphics, musicGain, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import type {Cue, EditConfig} from '../../lib/edit';

// SFX cues: `at` is the output frame where the file's transient lands (HIT table in
// AudioLayer). Effects on top of words are side-chained down by the SFX bus, so the voice
// always stays on top; the big hits sit in the gaps between words.
const CUES: Cue[] = [
	// HOOK: fall, "TRAINING" slides in, "LEVEL MALAYSIA" slams
	{sfx: 'bass_hit', at: T.hookFall, vol: 0.35},
	{sfx: 'whoosh_fast', at: T.hookTraining, vol: 0.35},
	{sfx: 'impact_fast', at: T.hookLevel, vol: 0.4},
	{sfx: 'bass_drum', at: T.hookMalaysia, vol: 0.3},
	// Rewind to the start of the drill
	{sfx: 'tape_rewind', at: T.drill - 5, vol: 0.5, trim: 1.7, dur: 30},
	{sfx: 'glitch_break', at: T.drill, vol: 0.2},
	// Level 1 callouts
	{sfx: 'swoosh_accent', at: T.go - 1, vol: 0.35},
	{sfx: 'pop_light', at: T.footwork, vol: 0.4},
	{sfx: 'whoosh_fast', at: T.laju, vol: 0.35},
	{sfx: 'pop_hard', at: T.depan, vol: 0.3},
	{sfx: 'pop_hard', at: T.belakang, vol: 0.3},
	{sfx: 'pop_hard', at: T.masalah, vol: 0.35},
	// Split check: needle sweep, then 180 degrees
	{sfx: 'swoosh_wind', at: T.split + 10, vol: 0.3},
	{sfx: 'coin', at: T.split + 50, vol: 0.45},
	{sfx: 'pop_light', at: T.simpleWord - 4, vol: 0.4},
	// LEVEL UP
	// (Mixkit "level completed" is a 3.5 s jingle that masked "okey" and "punya": a short unlock + hit instead.)
	{sfx: 'unlock', at: T.lagi, vol: 0.4},
	{sfx: 'impact_fast', at: T.lagi + 1, vol: 0.3},
	{sfx: 'pop_light', at: T.footworkSeg + 40, vol: 0.35},
	// Level Malaysia callouts
	{sfx: 'coin', at: T.good1, vol: 0.5},
	{sfx: 'swoosh_accent', at: T.depan2 - 1, vol: 0.3},
	{sfx: 'coin', at: T.good2, vol: 0.5},
	{sfx: 'swoosh_accent', at: T.tukar - 2, vol: 0.3},
	{sfx: 'pop_hard', at: T.masuk1 - 1, vol: 0.35},
	{sfx: 'swoosh_wind', at: T.bawahWord - 1, vol: 0.3},
	{sfx: 'whoosh_fast', at: T.lariWord - 1, vol: 0.4},
	// Low stamina: warning beeps and a heartbeat under the last lines
	{sfx: 'low_battery', at: T.tangan, vol: 0.3, dur: 60},
	{sfx: 'heartbeat', at: T.tangan + 4, vol: 0.55, dur: T.impact - T.tangan - 4, fadeIn: 8},
	// K.O. and GAME OVER (music drops out on the impact, see musicGain)
	{sfx: 'riser', at: T.impact, vol: 0.2},
	{sfx: 'ko_punch', at: T.impact, vol: 0.6},
	{sfx: 'impact_trailer', at: T.impact + 1, vol: 0.4, dur: 46},
	{sfx: 'game_over', at: GAMEOVER_AT + 3, vol: 0.45},
	{sfx: 'tick', at: GAMEOVER_AT + 27, vol: 0.3},
	{sfx: 'tick', at: GAMEOVER_AT + 57, vol: 0.3},
	{sfx: 'tick', at: GAMEOVER_AT + 87, vol: 0.3},
];

export const gkdrillEdit: EditConfig = {
	id: 'gkdrill',
	edl: EDL,
	faces,
	media: {
		master: 'gkdrill/video/master.mp4',
		proxy: 'gkdrill/video/proxy.mp4',
		voice: 'gkdrill/audio/voice.wav',
		music: 'shared/music/ko.wav', // Mixkit "K.O." (id 1068)
		musicTrimFrames: 0,
		// A frozen <OffthreadVideo> at the last frame (73.97 s) came back as a frame near 70 s; hold an extracted still instead.
		outroStill: 'gkdrill/img/last.jpg',
	},
	captionY: 1300,
	zoomOriginY: 980,
	captionKeys: new Set(['GO', 'FOOTWORK', 'LAJU', 'DEPAN', 'BELAKANG', 'MASALAH', 'LEVEL', 'SIMPLE', 'LAGI', 'GOOD', 'TUKAR', 'MASUK', 'BAWAH', 'LARI', 'CEPAT', 'TANGAN', 'ANGKAT', 'STEP', 'LEPAS']),
	captionAutoFit: true,
	maxFaceHeight: 320,
	Graphics,
	Grade,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	musicGain,
	// "Ini level" (20.96 s) was said turned away from the phone: +4 dB clip gain until "tadi".
	voiceGain: (f) => (f >= T.simple && f < T.tadi ? 1.6 : 1),
	musicUnderSpeech: 0.08,
	musicInGaps: 0.3,
	sfxBus: 0.55,
};
