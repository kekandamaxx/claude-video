// Edit decision list. All source times are seconds in IMG_7678.MOV (upright master,
// 30 fps). Ranges were chosen from the word-level transcript (src/data/transcript.json):
// repeats ("5 minit saja lagi" x3, "7 attack / satu pun tak dapat" x2,
// "the last 3 minutes" x2), filler ("Ok", "Alright") and dead air are dropped.
import transcript from '../data/transcript.json';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const OUTRO_FRAMES = 36;

export type SegmentId = 'hook' | 'fiveMin' | 'syahmi' | 'lineup' | 'last3';

type SegmentDef = {
	id: SegmentId;
	srcStart: number;
	srcEnd: number;
	zoomFrom: number;
	zoomTo: number;
	note: string;
};

const DEFS: SegmentDef[] = [
	{id: 'hook', srcStart: 8.72, srcEnd: 14.4, zoomFrom: 1.0, zoomTo: 1.08, note: 'Hook: "7 kali attack, satu pun tak dapat. Tapi diorang attack, nasib baik kita pun ada"'},
	{id: 'fiveMin', srcStart: 0.0, srcEnd: 1.14, zoomFrom: 1.1, zoomTo: 1.1, note: '"5 minit saja lagi" (best of three takes)'},
	{id: 'syahmi', srcStart: 20.04, srcEnd: 26.24, zoomFrom: 1.03, zoomTo: 1.1, note: '"So Syahmi mesti, tolong lah, please. Nampak 1 biji lagi, 2 biji lagi. Kita dah rotate, 5 minit lagi"'},
	{id: 'lineup', srcStart: 31.0, srcEnd: 33.56, zoomFrom: 1.12, zoomTo: 1.12, note: '"Muqri. Chai. Jason. Ready."'},
	{id: 'last3', srcStart: 34.56, srcEnd: 42.83, zoomFrom: 1.0, zoomTo: 1.12, note: '"The last 3 minutes, kalau kita masih leading, kalau tak ada gap, 2 aku tu keluarkan, korang balik. Ok. Come on x3"'},
];

export type Segment = SegmentDef & {
	srcFrom: number; // source frame
	len: number; // frames
	outFrom: number; // output frame
};

export const SEGMENTS: Segment[] = (() => {
	let out = 0;
	return DEFS.map((d) => {
		const srcFrom = Math.round(d.srcStart * FPS);
		const len = Math.round(d.srcEnd * FPS) - srcFrom;
		const seg = {...d, srcFrom, len, outFrom: out};
		out += len;
		return seg;
	});
})();

export const CUT_END = SEGMENTS[SEGMENTS.length - 1].outFrom + SEGMENTS[SEGMENTS.length - 1].len;
export const TOTAL_FRAMES = CUT_END + OUTRO_FRAMES;

export const seg = (id: SegmentId): Segment => {
	const s = SEGMENTS.find((x) => x.id === id);
	if (!s) throw new Error(`unknown segment ${id}`);
	return s;
};

/** Output frame at which source time `t` (inside segment `id`) plays. */
export const at = (id: SegmentId, t: number): number => {
	const s = seg(id);
	return s.outFrom + Math.round((t - s.srcStart) * FPS);
};

/** Source time (s) shown at output frame f, or null during the outro. */
export const srcTimeAt = (f: number): number | null => {
	for (const s of SEGMENTS) {
		if (f >= s.outFrom && f < s.outFrom + s.len) return (s.srcFrom + (f - s.outFrom)) / FPS;
	}
	return null;
};

export type Word = {text: string; from: number; to: number; segId: SegmentId};
export type Chunk = {words: Word[]; from: number; to: number};

// Caption spelling fixes on top of the raw ASR output.
// Names confirmed by the coach (ASR heard "Syamil" and "Bukri").
const FIX: Record<string, string> = {diorang: 'DIORANG', lah: 'LAH', Ok: 'OK', Syamil: 'SYAHMI', Bukri: 'MUQRI'};

/** Caption chunks on the output timeline, built from the kept transcript words. */
export const CHUNKS: Chunk[] = (() => {
	const chunks: Chunk[] = [];
	for (const s of SEGMENTS) {
		for (const ts of transcript.segments) {
			const words: Word[] = ts.words
				.filter((w) => w.s >= s.srcStart - 0.05 && w.e <= s.srcEnd + 0.1)
				.map((w) => ({
					text: (FIX[w.w] ?? w.w).replace(/[.,!?]/g, '').toUpperCase(),
					from: at(s.id, Math.max(w.s, s.srcStart)),
					to: at(s.id, Math.min(w.e, s.srcEnd)),
					segId: s.id,
				}));
			if (words.length) chunks.push({words, from: words[0].from, to: words[words.length - 1].to});
		}
	}
	chunks.sort((a, b) => a.from - b.from);
	// Hold each chunk until the next starts (max 12 frames of overhang), never past its segment.
	return chunks.map((c, i) => {
		const next = chunks[i + 1];
		const s = seg(c.words[0].segId);
		const hardEnd = s.outFrom + s.len;
		const to = Math.min(next ? next.from : hardEnd, c.to + 12, hardEnd);
		return {...c, to: Math.max(to, c.from + 6)};
	});
})();

/** Frames where speech is present (output timeline), padded, for music ducking. */
export const SPEECH: boolean[] = (() => {
	const arr = new Array(TOTAL_FRAMES).fill(false);
	for (const c of CHUNKS) for (const w of c.words) for (let f = w.from - 4; f <= w.to + 6; f++) if (f >= 0 && f < TOTAL_FRAMES) arr[f] = true;
	return arr;
})();
