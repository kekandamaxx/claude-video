import {EDL} from './edl';
import {Graphics, SHAKE_HITS, T} from './Graphics';
import faces from './faces.json';
import type {Cue, EditConfig} from '../../lib/edit';

// SFX cues: `at` is the output frame where the file's transient lands (HIT table
// in AudioLayer). Effects on top of words are side-chained down by the SFX bus.
const CUES: Cue[] = [
	// Hook: scoreboard in, -1 -2 -3 ticks, hit on "3", slam on "jangan down"
	{sfx: 'impact_trailer', at: T.hook + 3, vol: 0.35, dur: 50},
	{sfx: 'tick', at: T.hook + 17, vol: 0.45},
	{sfx: 'tick', at: T.hook + 33, vol: 0.45},
	{sfx: 'bass_hit', at: T.tiga, vol: 0.55},
	{sfx: 'glitch_break', at: T.tiga, vol: 0.25},
	{sfx: 'whoosh_fast', at: T.jangan - 2, vol: 0.4},
	{sfx: 'impact_fast', at: T.jangan + 1, vol: 0.5},
	// semalam (rewind) -> first half / second half
	{sfx: 'swoosh_wind', at: T.semalam - 2, vol: 0.4},
	{sfx: 'pop_light', at: T.berulang, vol: 0.45},
	{sfx: 'whoosh_cine', at: T.half - 3, vol: 0.38},
	{sfx: 'pop_light', at: T.perform, vol: 0.5},
	{sfx: 'bass_drum', at: T.down, vol: 0.42},
	// tragedi stamp
	{sfx: 'riser', at: T.tragediWord, vol: 0.16},
	{sfx: 'impact_fast', at: T.tragediWord + 1, vol: 0.55},
	{sfx: 'bass_hit', at: T.tragediWord + 1, vol: 0.4},
	// fancy -> overconfident -> makan diri sendiri
	{sfx: 'whoosh_fast', at: T.fancy - 3, vol: 0.4},
	{sfx: 'pop_hard', at: T.fancyWord - 2, vol: 0.35},
	{sfx: 'swoosh_accent', at: T.over - 3, vol: 0.32},
	{sfx: 'zoom_impact', at: T.fancy2 + 1, vol: 0.3},
	{sfx: 'glitch_break', at: T.memakan + 2, vol: 0.22, dur: 18},
	// fancy crossed out
	{sfx: 'swoosh_accent', at: T.tolong + 1, vol: 0.3},
	{sfx: 'swoosh_accent', at: T.janganFancy + 3, vol: 0.35},
	{sfx: 'impact_fast', at: T.fancyX + 1, vol: 0.45},
	// jangan rush -> control game
	{sfx: 'bass_drum', at: T.rushWord, vol: 0.45},
	{sfx: 'whoosh_cine', at: T.control - 3, vol: 0.36},
	{sfx: 'pop_light', at: T.controlWord, vol: 0.45},
	// mental kuat (heartbeat + power-up)
	{sfx: 'heartbeat', at: T.mental + 2, vol: 0.7, dur: 22},
	{sfx: 'bass_hit', at: T.kuat, vol: 0.42},
	// boleh menang / habis
	{sfx: 'whoosh_fast', at: T.boleh - 3, vol: 0.38},
	{sfx: 'pop_light', at: T.menangWord + 3, vol: 0.5},
	{sfx: 'swoosh_accent', at: T.tapi, vol: 0.3},
	{sfx: 'impact_fast', at: T.habis + 1, vol: 0.5},
	// main cara nak menang
	{sfx: 'swoosh_wind', at: T.menang - 2, vol: 0.38},
	{sfx: 'bass_drum', at: T.menang2, vol: 0.24, dur: 12},
	// henjut x2 (throw + hit)
	{sfx: 'whoosh_fast', at: T.henjut1 + 1, vol: 0.5},
	{sfx: 'bass_hit', at: T.henjut1 + 4, vol: 0.5},
	{sfx: 'whoosh_fast', at: T.henjut2 + 1, vol: 0.5},
	{sfx: 'bass_hit', at: T.henjut2 + 4, vol: 0.5},
	// countdown
	{sfx: 'whoosh_cine', at: T.minit - 3, vol: 0.36},
	{sfx: 'tick', at: T.duaLima, vol: 0.4},
	{sfx: 'tick', at: T.duaLima + 10, vol: 0.4},
	{sfx: 'tick', at: T.duaLima + 20, vol: 0.4},
	{sfx: 'tick', at: T.duaLima + 30, vol: 0.4},
	{sfx: 'bass_drum', at: T.minitDown, vol: 0.42},
	// climax + end card
	{sfx: 'riser', at: T.letsgo + 2, vol: 0.2},
	{sfx: 'impact_fast', at: T.go1 + 1, vol: 0.45},
	{sfx: 'crowd', at: T.easy, vol: 0.2, trim: 4.5, fadeIn: 8},
	{sfx: 'impact_trailer', at: T.outro + 6, vol: 0.5, dur: 60},
	{sfx: 'bass_drum', at: T.outro + 6, vol: 0.45},
];

export const comebackEdit: EditConfig = {
	id: 'comeback',
	edl: EDL,
	faces,
	media: {
		master: 'comeback/video/master.mp4',
		proxy: 'comeback/video/proxy.mp4',
		voice: 'comeback/audio/voice.wav',
		music: 'shared/music/epical_drums_02.wav',
		musicTrimFrames: 61, // first drum hit at 2.04 s lands on the hook
	},
	captionY: 1310,
	zoomOriginY: 930,
	captionKeys: new Set(['3', 'BIJI', 'DOWN', 'SEMALAM', 'BERULANG', 'PERFORM', 'TRAGEDI', 'FANCY', 'OVERCONFIDENT', 'MEMAKAN', 'SENDIRI', 'RUSH', 'CONTROL', 'GAME', 'KUAT', 'MENANG', 'SUSAH', 'HABIS', 'HENJUT', '25', 'MINIT', 'GO', 'EASY']),
	captionAutoFit: true,
	Graphics,
	shakeHits: SHAKE_HITS,
	cues: CUES,
	musicUnderSpeech: 0.085,
	musicInGaps: 0.28,
	sfxBus: 0.55,
};
