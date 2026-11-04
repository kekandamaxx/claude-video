import {EDL} from './edl';
import {Graphics, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import type {Cue, EditConfig} from '../../lib/edit';

// SFX cues: `at` is the output frame where the file's transient lands (HIT table
// in AudioLayer). Effects on top of words are side-chained down by the SFX bus.
const CUES: Cue[] = [
	// Hook: 2X, trophies, stamp
	{sfx: 'impact_trailer', at: T.hook + 3, vol: 0.35, dur: 50},
	{sfx: 'pop_light', at: T.finalWord - 1, vol: 0.6},
	{sfx: 'pop_light', at: T.finalWord + 5, vol: 0.6},
	{sfx: 'impact_fast', at: T.takSemua + 2, vol: 0.45},
	// -> pressure gauge
	{sfx: 'whoosh_fast', at: T.pressure - 4, vol: 0.45},
	{sfx: 'swoosh_accent', at: T.noMore + 2, vol: 0.35},
	// -> SEMIFINAL slam
	{sfx: 'swoosh_wind', at: T.semi - 3, vol: 0.4},
	{sfx: 'glitch_break', at: T.semiWord - 1, vol: 0.3},
	{sfx: 'bass_hit', at: T.semiWord, vol: 0.5},
	// -> KENA MENANG
	{sfx: 'whoosh_cine', at: T.menangSeg - 4, vol: 0.4},
	{sfx: 'bass_drum', at: T.menang - 2, vol: 0.45},
	{sfx: 'swoosh_accent', at: T.buatlah, vol: 0.3},
	// -> JIWA (heartbeat)
	{sfx: 'heartbeat', at: T.jiwa + 1, vol: 0.75, dur: 22},
	{sfx: 'heartbeat', at: T.jiwa + 21, vol: 0.6, dur: 20},
	// -> JANGAN GIVE UP stamp
	{sfx: 'impact_fast', at: T.giveup + 2, vol: 0.5},
	// -> sizing / teknikal
	{sfx: 'whoosh_fast', at: T.teknikalSeg - 4, vol: 0.4},
	{sfx: 'swoosh_accent', at: T.sizing - 5, vol: 0.3},
	{sfx: 'pop_light', at: T.masalah + 4, vol: 0.35},
	{sfx: 'swoosh_accent', at: T.teknikal - 5, vol: 0.3},
	{sfx: 'pop_light', at: T.bagus + 4, vol: 0.35},
	// -> LAWAN TETAP LAWAN, clock, EXTRA TIME
	{sfx: 'swoosh_wind', at: T.lawanSeg - 3, vol: 0.4},
	{sfx: 'tick', at: T.lawanSeg + 10, vol: 0.35},
	{sfx: 'tick', at: T.lawanSeg + 40, vol: 0.35},
	{sfx: 'bass_drum', at: T.lawan2 + 1, vol: 0.4},
	{sfx: 'zoom_impact', at: T.extra1 - 2, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.tarik, vol: 0.3},
	// Climax: KITA MESTI ... ADA KAT FINAL
	{sfx: 'riser', at: T.finalSeg - 2, vol: 0.2},
	{sfx: 'impact_trailer', at: T.finalPay - 2, vol: 0.5, dur: 70},
	{sfx: 'bass_drum', at: T.finalPay - 2, vol: 0.45},
	{sfx: 'crowd', at: T.outro - 6, vol: 0.2, trim: 4.5, fadeIn: 8},
	{sfx: 'buzzer', at: T.outro + 8, vol: 0.35},
];

export const semifinalEdit: EditConfig = {
	id: 'semifinal',
	edl: EDL,
	faces,
	media: {
		master: 'semifinal/video/master.mp4',
		proxy: 'semifinal/video/proxy.mp4',
		voice: 'semifinal/audio/voice.wav',
		music: 'shared/music/epical_drums_02.wav',
		musicTrimFrames: 61, // first drum hit at 2.04 s lands on the hook
	},
	captionY: 1290,
	zoomOriginY: 1000,
	captionKeys: new Set(['DUA', 'TAHUN', 'BERTURUT-TURUT', 'FINAL', 'NO', 'MORE', 'PRESSURE', 'SEMIFINAL', 'MENANG', 'SEKALIPUN', 'JIWA', 'GIVE', 'UP', 'SIZING', 'MASALAH', 'TEKNIKAL', 'BAGUS', 'LAWAN', 'TERAKHIR', 'EXTRA', 'TIME', 'MESTI']),
	captionAutoFit: true,
	Graphics,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	musicUnderSpeech: 0.1,
	musicInGaps: 0.28,
	sfxBus: 0.55,
};
