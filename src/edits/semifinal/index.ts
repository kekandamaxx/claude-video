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
	// -> berharap yang terbaik
	{sfx: 'swoosh_wind', at: T.harap - 3, vol: 0.4},
	{sfx: 'swoosh_accent', at: T.terbaik - 1, vol: 0.3},
	{sfx: 'pop_light', at: T.harapFinal, vol: 0.5},
	// -> pressure gauge
	{sfx: 'whoosh_fast', at: T.pressure - 4, vol: 0.45},
	{sfx: 'swoosh_accent', at: T.noMore + 2, vol: 0.35},
	// -> SEMIFINAL slam
	{sfx: 'swoosh_wind', at: T.semi - 3, vol: 0.4},
	{sfx: 'glitch_break', at: T.semiWord - 1, vol: 0.3},
	{sfx: 'bass_hit', at: T.semiWord, vol: 0.5},
	// -> road to final
	{sfx: 'whoosh_cine', at: T.masuk1 - 4, vol: 0.4},
	{sfx: 'riser', at: T.adaDiFinal, vol: 0.15},
	{sfx: 'impact_fast', at: T.adaDiFinal + 1, vol: 0.4},
	// -> KENA MENANG x2
	{sfx: 'whoosh_fast', at: T.menangSeg - 4, vol: 0.4},
	{sfx: 'bass_drum', at: T.menang, vol: 0.28},
	{sfx: 'swoosh_accent', at: T.buatlah, vol: 0.3},
	{sfx: 'zoom_impact', at: T.menang2 + 1, vol: 0.3},
	{sfx: 'bass_drum', at: T.menang2Word, vol: 0.28},
	// -> JIWA (heartbeat) x2 takes
	{sfx: 'heartbeat', at: T.jiwa1 + 1, vol: 0.75, dur: 22},
	{sfx: 'heartbeat', at: T.jiwa1 + 23, vol: 0.6, dur: 20},
	{sfx: 'pop_hard', at: T.tigaGol - 1, vol: 0.35},
	{sfx: 'heartbeat', at: T.jiwa2Word, vol: 0.6, dur: 22},
	// -> JANGAN GIVE UP stamp
	{sfx: 'impact_fast', at: T.giveup + 2, vol: 0.5},
	// -> sizing / teknikal / tempo
	{sfx: 'whoosh_fast', at: T.teknikalSeg - 4, vol: 0.4},
	{sfx: 'swoosh_accent', at: T.sizing - 5, vol: 0.3},
	{sfx: 'pop_light', at: T.masalah + 4, vol: 0.35},
	{sfx: 'swoosh_accent', at: T.teknikal - 5, vol: 0.3},
	{sfx: 'pop_light', at: T.bagus + 4, vol: 0.35},
	{sfx: 'swoosh_accent', at: T.laju - 7, vol: 0.3},
	{sfx: 'pop_light', at: T.perlahan + 8, vol: 0.35},
	// -> LAWAN TETAP LAWAN x2, EXTRA TIME
	{sfx: 'swoosh_wind', at: T.lawan0 - 3, vol: 0.4},
	{sfx: 'bass_drum', at: T.l0b + 1, vol: 0.4},
	{sfx: 'tick', at: T.lawanSeg + 8, vol: 0.35},
	{sfx: 'tick', at: T.lawanSeg + 38, vol: 0.35},
	{sfx: 'bass_drum', at: T.lawan2 + 1, vol: 0.4},
	{sfx: 'zoom_impact', at: T.extra1 - 2, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.tarik, vol: 0.3},
	// -> JIWA x3 (LAWAN!)
	{sfx: 'whoosh_cine', at: T.jiwa3 - 4, vol: 0.4},
	{sfx: 'heartbeat', at: T.jiwa3Word, vol: 0.6, dur: 22},
	// Climax: KITA MESTI ADA FINAL ... KITA MESTI ... ADA KAT FINAL
	{sfx: 'swoosh_wind', at: T.ada - 3, vol: 0.4},
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
	captionKeys: new Set(['DUA', 'TAHUN', 'BERTURUT-TURUT', 'FINAL', 'TERBAIK', 'PILIH', 'NO', 'MORE', 'PRESSURE', 'SEMIFINAL', 'MASUK', 'MENANG', 'SEKALIPUN', 'JIWA', '3', 'GOL', 'GIVE', 'UP', 'SIZING', 'MASALAH', 'TEKNIKAL', 'BAGUS', 'LAJU', 'PERLAHAN', 'LAWAN', '50', 'TERAKHIR', 'EXTRA', 'TIME', 'MESTI']),
	captionAutoFit: true,
	Graphics,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	musicUnderSpeech: 0.1,
	musicInGaps: 0.28,
	sfxBus: 0.55,
};
