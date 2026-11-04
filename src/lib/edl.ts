// Generic edit-decision-list engine. Each edit (src/edits/<id>/edl.ts) passes its
// kept source ranges and the word-level transcript; everything downstream
// (graphics timing, captions, ducking) is derived from the result.

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export type SegmentDef = {
	id: string;
	srcStart: number; // seconds in the source clip
	srcEnd: number;
	zoomFrom: number;
	zoomTo: number;
	/** Captions centre line (px) for this segment; chosen from the measured face band. */
	captionY?: number;
	/** Zoom pivot (px from top); defaults to the edit's face-band centre. */
	zoomOriginY?: number;
	note: string;
};

export type Segment = SegmentDef & {srcFrom: number; len: number; outFrom: number};
export type Word = {text: string; from: number; to: number; segId: string};
export type Chunk = {words: Word[]; from: number; to: number};

type RawWord = {w: string; s: number; e: number};
type Transcript = {segments: {words: RawWord[]}[]};
/** Words starting in [s, e) collapse into `text`; `start`/`end` optionally re-time it (ASR timing error). */
type Merge = {s: number; e: number; text: string; start?: number; end?: number};

export type Edl = {
	segments: Segment[];
	cutEnd: number;
	outroFrames: number;
	totalFrames: number;
	seg: (id: string) => Segment;
	segEnd: (id: string) => number;
	at: (id: string, t: number) => number;
	srcTimeAt: (f: number) => number | null;
	segmentAt: (f: number) => Segment | null;
	chunks: Chunk[];
	speech: boolean[];
};

export const createEdl = (opts: {defs: SegmentDef[]; transcript: Transcript; fix?: Record<string, string>; merge?: Merge[]; outroFrames: number}): Edl => {
	const {defs, transcript, fix = {}, merge = [], outroFrames} = opts;
	let out = 0;
	const segments: Segment[] = defs.map((d) => {
		const srcFrom = Math.round(d.srcStart * FPS);
		const len = Math.round(d.srcEnd * FPS) - srcFrom;
		const s = {...d, srcFrom, len, outFrom: out};
		out += len;
		return s;
	});
	const cutEnd = out;
	const totalFrames = cutEnd + outroFrames;

	const seg = (id: string) => {
		const s = segments.find((x) => x.id === id);
		if (!s) throw new Error(`unknown segment ${id}`);
		return s;
	};
	const segEnd = (id: string) => seg(id).outFrom + seg(id).len;
	const at = (id: string, t: number) => {
		const s = seg(id);
		return s.outFrom + Math.round((t - s.srcStart) * FPS);
	};
	const segmentAt = (f: number) => segments.find((s) => f >= s.outFrom && f < s.outFrom + s.len) ?? null;
	const srcTimeAt = (f: number) => {
		const s = segmentAt(f);
		return s ? (s.srcFrom + (f - s.outFrom)) / FPS : null;
	};

	// Multi-word ASR corrections: words whose start falls in [s, e) collapse into one.
	const applyMerges = (ws: RawWord[]): RawWord[] => {
		const res: RawWord[] = [];
		for (const w of ws) {
			const m = merge.find((x) => w.s >= x.s - 0.01 && w.s < x.e);
			if (!m) res.push(w);
			else if (!res.some((o) => o.w === m.text && o.s === (m.start ?? m.s))) res.push({w: m.text, s: m.start ?? m.s, e: m.end ?? m.e});
		}
		return res;
	};

	const raw: Chunk[] = [];
	for (const s of segments) {
		for (const ts of transcript.segments) {
			const words: Word[] = applyMerges(ts.words)
				.filter((w) => w.s >= s.srcStart - 0.05 && w.e <= s.srcEnd + 0.1)
				.map((w) => ({
					text: (fix[w.w] ?? w.w).replace(/[.,!?]/g, '').toUpperCase(),
					from: at(s.id, Math.max(w.s, s.srcStart)),
					to: at(s.id, Math.min(w.e, s.srcEnd)),
					segId: s.id,
				}));
			if (words.length) raw.push({words, from: words[0].from, to: words[words.length - 1].to});
		}
	}
	raw.sort((a, b) => a.from - b.from);
	// Hold each chunk until the next starts (max 12 frames of overhang), never past its segment.
	const chunks = raw.map((c, i) => {
		const next = raw[i + 1];
		const hardEnd = segEnd(c.words[0].segId);
		const to = Math.min(next ? next.from : hardEnd, c.to + 12, hardEnd);
		return {...c, to: Math.max(to, c.from + 6)};
	});

	const speech = new Array(totalFrames).fill(false);
	for (const c of chunks) for (const w of c.words) for (let f = w.from - 4; f <= w.to + 6; f++) if (f >= 0 && f < totalFrames) speech[f] = true;

	return {segments, cutEnd, outroFrames, totalFrames, seg, segEnd, at, srcTimeAt, segmentAt, chunks, speech};
};
