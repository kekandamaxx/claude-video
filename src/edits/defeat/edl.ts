/**
 * DefeatEdit, "After the Loss": the edit decision list.
 *
 * Picture and dialogue are placed separately, so a line can run as a voice-over on a
 * shot whose speaker is not on screen (the night wides and the slow-motion shots).
 * Every source time below is in seconds of the original clip; the build turns them
 * into composition frames (30 fps). Clips are 60 fps, so rate 0.5 is real slow motion.
 */
import transcript from './transcript.json';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type ClipId = 'clip1' | 'clip2' | 'clip3' | 'clip4' | 'clip5';

export type Shot = {
	kind: 'shot';
	id: string;
	clip: ClipId;
	from: number;
	to: number;
	/** Playback rate of the picture. 0.5 = slow motion from the 60 fps source. */
	rate: number;
	/** 'sync': the clip's own dialogue; 'slow': the room an octave down (slow-mo bed); 'none'. */
	audio: 'sync' | 'slow' | 'none';
	/** Cross-dissolve from the previous shot, in frames (the shot starts this much earlier). */
	dissolve?: number;
	/** Fade up from black, in frames. */
	fadeIn?: number;
	/** Slow push: scale at the first and last frame. */
	zoom: [number, number];
};
export type Black = {kind: 'black'; id: string; dur: number};
export type Item = Shot | Black;

// ── Picture ────────────────────────────────────────────────────────────────────────────────
export const ITEMS: Item[] = [
	// HOOK. Players with their heads down, the coach's back to camera. Slow motion, the room
	// an octave down. The title lands first; then one voice: "the comeback... is hard".
	{kind: 'shot', id: 'hook', clip: 'clip5', from: 0.4, to: 4.4, rate: 0.5, audio: 'slow', fadeIn: 18, zoom: [1.0, 1.05]},
	{kind: 'black', id: 'black1', dur: 0.5},
	// REALITY. How it was lost, in the coach's words (speaker off-screen, synced room).
	{kind: 'shot', id: 'howlost', clip: 'clip2', from: 2.62, to: 10.26, rate: 1, audio: 'sync', zoom: [1.0, 1.03]},
	{kind: 'shot', id: 'pening', clip: 'clip1', from: 9.14, to: 13.36, rate: 1, audio: 'sync', zoom: [1.02, 1.05]},
	// SILENCE. No words. Heads down, slow motion, a heartbeat.
	{kind: 'shot', id: 'silence', clip: 'clip5', from: 9.4, to: 11.8, rate: 0.5, audio: 'slow', dissolve: 12, zoom: [1.04, 1.0]},
	// THE LESSON. Patience, one goal at a time.
	{kind: 'shot', id: 'sabar', clip: 'clip2', from: 14.62, to: 15.92, rate: 1, audio: 'sync', zoom: [1.03, 1.04]},
	{kind: 'shot', id: 'satu', clip: 'clip2', from: 17.5, to: 23.2, rate: 1, audio: 'sync', dissolve: 8, zoom: [1.0, 1.04]},
	// PIVOT. "When we get back, we... have to reset." The strings enter on the black after it.
	{kind: 'shot', id: 'reset1', clip: 'clip1', from: 15.45, to: 18.65, rate: 1, audio: 'sync', zoom: [1.0, 1.04]},
	{kind: 'black', id: 'black2', dur: 0.5},
	// TOGETHER. The coaches ease the room: relax, we'll go eat, it's a game.
	{kind: 'shot', id: 'makan', clip: 'clip3', from: 8.2, to: 19.35, rate: 1, audio: 'sync', fadeIn: 8, zoom: [1.0, 1.05]},
	{kind: 'shot', id: 'jalan', clip: 'clip3', from: 19.35, to: 22.27, rate: 1, audio: 'sync', zoom: [1.05, 1.07]},
	// CLOSE. The whole team under the tent, slow motion. Not the end.
	{kind: 'shot', id: 'team', clip: 'clip1', from: 0.2, to: 2.6, rate: 0.5, audio: 'slow', dissolve: 15, zoom: [1.06, 1.0]},
];

/** End card after the last shot fades to black (seconds). */
export const END = {fadeOut: 0.6, gap: 0.5, card: 3.2};

// ── Voice-over placed independently of the picture ───────────────────────────────────────────
export type VoiceOver = {id: string; clip: ClipId; from: number; to: number; at: number; gain?: number};
export const VOICE_OVER: VoiceOver[] = [
	// "So bila kita nak buat comeback ni, susah." over the hook.
	{id: 'vo-susah', clip: 'clip2', from: 10.26, to: 13.25, at: 3.56, gain: 1.41}, // +3 dB over the slow room
];

// ── Text ─────────────────────────────────────────────────────────────────────────────────
/** Emotional titles: composition seconds. Upper band (tent ceiling), clear of every face. */
export type Title = {text: string; at: number; dur: number};
export const TITLES: Title[] = [
	{text: 'NOT THE RESULT WE WANTED.', at: 0.45, dur: 2.9},
	{text: 'BUT WE FOUGHT TOGETHER.', at: 0, dur: 0}, // placed on the "Alright" gap in build()
	{text: 'THIS IS NOT THE END.', at: 0, dur: 0}, // placed on the closing shot in build()
];

/** Final score (UMPSA first). Shown in the hook after the first title, while the VO says "susah". */
export const SCORE = {us: 16, them: 17, label: 'FULL TIME', note: 'LOST BY ONE GOAL', at: 3.7, dur: 4.0};

/** Subtitles: source ranges of one clip, Malay as spoken + English. */
export type Line = {clip: ClipId; from: number; to: number; ms: string; en: string};
export const LINES: Line[] = [
	{clip: 'clip2', from: 10.27, to: 13.1, ms: 'So bila kita nak buat comeback ni… susah.', en: 'So when we try to come back… it’s hard.'},
	{clip: 'clip2', from: 2.8, to: 4.46, ms: 'Kita nak ikut dia main.', en: 'We tried to play their game.'},
	{clip: 'clip2', from: 4.66, to: 6.54, ms: 'Sebab dia nak main laju, kita nak ikut laju.', en: 'They played fast, so we went fast too.'},
	{clip: 'clip2', from: 7.08, to: 10.24, ms: 'So bila kita ikut dia laju, kita kena 5-1 tu.', en: 'And when we matched their pace, they went on a 5–1 run.'},
	{clip: 'clip1', from: 9.26, to: 11.14, ms: 'Kadang-kadang kami dengan Aiman ni pun pening.', en: 'Sometimes even Aiman and I don’t have the answers.'},
	{clip: 'clip1', from: 11.2, to: 13.2, ms: 'Nak atur kat dalam, nak atur kat luar.', en: 'Sorting it out on the court, and off it.'},
	{clip: 'clip2', from: 14.76, to: 15.86, ms: 'Kita kena sabar.', en: 'We have to be patient.'},
	{clip: 'clip2', from: 17.7, to: 21.04, ms: 'Kalau kita kena tinggal 3-4 biji, kita tak boleh tamak nak main laju.', en: 'Down by three or four, we can’t get greedy and rush.'},
	{clip: 'clip2', from: 21.05, to: 23.08, ms: 'Kita kena ambil satu… satu… satu.', en: 'We take them one… at a… time.'},
	{clip: 'clip1', from: 15.62, to: 18.4, ms: 'Kembali ni, kita… kena reset.', en: 'When we get back, we… have to reset.'},
	{clip: 'clip3', from: 8.35, to: 9.7, ms: 'Okay, relax. Settle down.', en: 'Okay, relax. Settle down.'},
	{clip: 'clip3', from: 10.69, to: 11.6, ms: 'Nanti kita pergi makan.', en: 'We’ll go eat after this.'},
	{clip: 'clip3', from: 12.64, to: 13.8, ms: 'Tu ikutlah nak makan apa.', en: 'Whatever you feel like.'},
	{clip: 'clip3', from: 14.76, to: 15.78, ms: 'Semua berlapar, kan.', en: 'Everyone’s hungry, right?'},
	{clip: 'clip3', from: 15.88, to: 17.08, ms: 'Tempat main ni, tempat main-main.', en: 'It’s a game. It’s where we play.'},
	{clip: 'clip3', from: 19.46, to: 20.56, ms: 'Reset, reset, reset, reset.', en: 'Reset. Reset. Reset.'},
	{clip: 'clip3', from: 21.32, to: 21.76, ms: 'Jalan.', en: 'Let’s go.'},
];

// ── Sound effects (composition seconds; the build snaps them to frames) ─────────────────────
export type Sfx = {sfx: 'impact_trailer' | 'bass_hit' | 'heartbeat' | 'whoosh_cine' | 'swoosh_wind'; at: number | string; vol: number};
/** `at` may name an item ('black1', or 'team:start') so cues follow the edit. */
export const SFX: Sfx[] = [
	{sfx: 'bass_hit', at: 0.05, vol: 0.45},
	{sfx: 'impact_trailer', at: 'black1', vol: 0.5},
	{sfx: 'heartbeat', at: 'silence+0.5', vol: 0.55},
	{sfx: 'heartbeat', at: 'silence+2.3', vol: 0.4},
	{sfx: 'bass_hit', at: 'black2', vol: 0.4},
	{sfx: 'swoosh_wind', at: 'team', vol: 0.22},
	{sfx: 'bass_hit', at: 'card', vol: 0.3},
];

// ── Music: Mixkit "Silent Descent". Composition second t plays music second t + offset. ─────
export const MUSIC = {
	/** Strings enter at 41.98 s in the track; this lands them on the black after "reset". */
	stringsAt: 41.98,
	/** Piano outro section (sparse again), crossfaded in under the closing shot. */
	outroFrom: 126.6,
};

// ── Build ────────────────────────────────────────────────────────────────────────────────
export type Placed = Item & {start: number; len: number};
export type CaptionCue = {ms: string; en: string; start: number; end: number};
export type TitleCue = {text: string; start: number; end: number};
export type VoicePlacement = {id: string; clip: ClipId; srcFrom: number; srcTo: number; start: number; len: number; fadeIn: number; fadeOut: number; gain: number};
export type SfxCue = {sfx: Sfx['sfx']; at: number; vol: number};

type Word = [string, number, number, number];
const WORDS = transcript as unknown as Record<ClipId, Word[]>;

const f = (s: number) => Math.round(s * FPS);

const build = () => {
	const placed: Placed[] = [];
	let cursor = 0;
	for (const it of ITEMS) {
		if (it.kind === 'black') {
			const len = f(it.dur);
			placed.push({...it, start: cursor, len});
			cursor += len;
			continue;
		}
		const len = Math.round(((it.to - it.from) / it.rate) * FPS);
		const start = cursor - (it.dissolve ?? 0);
		placed.push({...it, start, len});
		cursor = start + len;
	}
	const cutEnd = cursor;
	const fadeOut = f(END.fadeOut);
	const cardStart = cutEnd + f(END.gap);
	const total = cardStart + f(END.card);

	const byId = (id: string) => {
		const p = placed.find((x) => x.id === id);
		if (!p) throw new Error(`no item ${id}`);
		return p;
	};
	const resolve = (at: number | string) => {
		if (typeof at === 'number') return f(at);
		if (at === 'card') return cardStart;
		const m = at.match(/^([a-z0-9]+)(?:\+([\d.]+))?$/);
		if (!m) throw new Error(`bad cue ${at}`);
		return byId(m[1]).start + f(Number(m[2] ?? 0));
	};

	// Dialogue: every sync shot plays its own range; voice-overs are placed on their own.
	const voice: VoicePlacement[] = [];
	for (const p of placed) {
		if (p.kind !== 'shot' || p.audio !== 'sync') continue;
		const d = p.dissolve ?? 0;
		voice.push({id: p.id, clip: p.clip, srcFrom: p.from, srcTo: p.to, start: p.start, len: p.len, fadeIn: Math.max(2, d), fadeOut: 2, gain: 1});
	}
	for (const v of VOICE_OVER) {
		voice.push({id: v.id, clip: v.clip, srcFrom: v.from, srcTo: v.to, start: f(v.at), len: f(v.to - v.from), fadeIn: 1, fadeOut: 4, gain: v.gain ?? 1});
	}
	// Give the outgoing shot's audio the same fade as the incoming dissolve.
	for (const v of voice) {
		const next = voice.find((w) => w.start > v.start && w.start < v.start + v.len);
		if (next) v.fadeOut = Math.max(v.fadeOut, v.start + v.len - next.start);
	}

	/** The placement that plays source second t of a clip (start-inclusive, end-exclusive). */
	const placementOf = (clip: ClipId, t: number) => {
		const hit = voice.find((v) => v.clip === clip && t >= v.srcFrom - 0.02 && t < v.srcTo - 0.02);
		if (!hit) throw new Error(`${clip} ${t}s is not in the cut`);
		return hit;
	};
	/** Composition frame of a source second in a clip. */
	const outFrame = (clip: ClipId, t: number, within?: VoicePlacement) => {
		const v = within ?? placementOf(clip, t);
		return v.start + (t - v.srcFrom) * FPS;
	};

	// Speech mask from the transcript words that are inside the cut.
	const speech = new Array<boolean>(total).fill(false);
	for (const v of voice) {
		for (const [, s, e] of WORDS[v.clip]) {
			if (s < v.srcFrom - 0.05 || e > v.srcTo + 0.05) continue;
			const a = Math.round(v.start + (s - v.srcFrom) * FPS);
			const b = Math.round(v.start + (e - v.srcFrom) * FPS);
			for (let i = Math.max(0, a); i <= Math.min(total - 1, b); i++) speech[i] = true;
		}
	}

	// Subtitles: on with the first word, hold 0.35 s after the last, never overlap the next.
	const captions: CaptionCue[] = LINES.map((l) => {
		const v = placementOf(l.clip, l.from);
		const end = Math.min(outFrame(l.clip, l.to, v) + f(0.35), v.start + v.len);
		return {ms: l.ms, en: l.en, start: Math.round(outFrame(l.clip, l.from, v)) - 2, end: Math.round(end)};
	});
	captions.sort((a, b) => a.start - b.start);
	for (let i = 0; i < captions.length; i++) {
		const c = captions[i];
		if (c.end - c.start < f(1.1)) c.end = c.start + f(1.1);
		const n = captions[i + 1];
		if (n && c.end > n.start - 2) c.end = n.start - 2;
	}

	// Titles: the first is fixed; "together" sits in the pause after "Alright" in the makan shot,
	// "not the end" on the closing team shot.
	const makan = byId('makan');
	const team = byId('team');
	const togetherStart = Math.round(outFrame('clip3', 17.15)) + 4;
	const titles: TitleCue[] = [
		{text: TITLES[0].text, start: f(TITLES[0].at), end: f(TITLES[0].at + TITLES[0].dur)},
		{text: TITLES[1].text, start: togetherStart, end: makan.start + makan.len - 2},
		{text: TITLES[2].text, start: team.start + f(0.7), end: cutEnd - 4},
	];

	const sfx: SfxCue[] = SFX.map((s) => ({sfx: s.sfx, at: resolve(s.at), vol: s.vol}));

	const strings = byId('black2').start;
	const music = {
		offset: MUSIC.stringsAt - strings / FPS,
		outroAt: team.start + f(1.2),
		outroFrom: MUSIC.outroFrom,
	};

	const score = {start: f(SCORE.at), end: Math.min(f(SCORE.at + SCORE.dur), byId('black1').start - 2)};

	return {placed, cutEnd, fadeOut, cardStart, total, voice, speech, captions, titles, score, sfx, music, outFrame};
};

export const EDL = build();
