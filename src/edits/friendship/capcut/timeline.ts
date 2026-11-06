import songBeats from './song_beats.json';
import {PHOTOS, Photo} from '../timeline';
import {protectBox} from '../framing';
import {CapShot, Cut, CUT_FRAMES, SHOTS, SONG} from './config';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

const GRID = songBeats as {beat: number; beats: number[]; downbeats: number[]; start?: number};
export const SONG_START = GRID.start ?? 0;
const beatTime = (k: number) => {
	const b = GRID.beats;
	return k < b.length ? b[k] : b[b.length - 1] + (k - b.length + 1) * GRID.beat;
};

export type CapClip = {
	index: number;
	photo: Photo;
	from: number; // frames on screen (with transition overlap)
	to: number;
	start: number; // the cut frame (on a beat)
	end: number;
	inCut: Cut;
	outCut: Cut | null;
	layout: 'full' | 'fit';
	zoomIn: boolean;
	/** First and last shots carry the big title text. */
	titled: boolean;
	/** Where lyrics go on this shot: the first band (bottom, top, lower) with no face in it. */
	lyricBand: {y0: number; y1: number};
};

/** Every manifest photo exactly once: listed shots first, any unlisted photo appended as a 6-beat shot. */
const resolveShots = (): CapShot[] => {
	const known = new Set(PHOTOS.map((p) => p.id));
	const seen = new Set<string>();
	for (const s of SHOTS) {
		if (!known.has(s.id)) throw new Error(`capcut/config.ts lists "${s.id}", which is not in photos.json`);
		if (seen.has(s.id)) throw new Error(`capcut/config.ts uses "${s.id}" twice`);
		seen.add(s.id);
	}
	const rest = PHOTOS.filter((p) => !seen.has(p.id)).map((p): CapShot => ({id: p.id, beats: 6, cut: 'zoom'}));
	// Unlisted photos go before the last two shots, so the ending stays the ending.
	return [...SHOTS.slice(0, -2), ...rest, ...SHOTS.slice(-2)];
};

/** Full-screen crop only if every protected face fits a 9:16 window without heavy upscaling. */
const MAX_UPSCALE = 2.45;
export const coverScale9 = (p: Photo) => Math.max(W / p.width, H / p.height);
export const fullWindow = (p: Photo, z = 1) => {
	const box = protectBox(p);
	const k = coverScale9(p) * z;
	const hx = W / (2 * k * p.width);
	const hy = H / (2 * k * p.height);
	const rx: [number, number] = [Math.max(hx, box.x1 - hx), Math.min(1 - hx, box.x0 + hx)];
	const ry: [number, number] = [Math.max(hy, box.y1 - hy), Math.min(1 - hy, box.y0 + hy)];
	return rx[0] <= rx[1] + 1e-6 && ry[0] <= ry[1] + 1e-6 ? {rx, ry, box} : null;
};
export const capLayout = (p: Photo): 'full' | 'fit' => (coverScale9(p) <= MAX_UPSCALE && fullWindow(p, 1.06) ? 'full' : 'fit');

/** Vertical centre of a fit-layout photo: lower on the first and last shots, which carry the big titles. */
export const FIT_CY = {normal: 860, titled: 1080};
export const TITLE_BAND = {y0: 268, y1: 590};
export const LYRIC_BANDS = [{y0: 1190, y1: 1420}, {y0: 300, y1: 520}, {y0: 1450 - 220, y1: 1450}];

/** Faces of a clip in frame pixels (y only), at rest, padded 40 px for the zoom drift and beat pulse. */
export const faceRows = (c: {photo: Photo; layout: 'full' | 'fit'; titled: boolean}) => {
	const p = c.photo;
	if (c.layout === 'full') {
		const win = fullWindow(p, 1)!;
		const k = coverScale9(p);
		const cy = Math.min(win.ry[1], Math.max(win.ry[0], (win.box.y0 + win.box.y1) / 2));
		return p.faces.map((f) => ({y0: H / 2 + (f.y - cy) * p.height * k - 40, y1: H / 2 + (f.y + f.h - cy) * p.height * k + 40}));
	}
	const fh = (W / p.width) * p.height;
	const top = (c.titled ? FIT_CY.titled : FIT_CY.normal) - fh / 2;
	return p.faces.map((f) => ({y0: top + f.y * fh - 40, y1: top + (f.y + f.h) * fh + 40}));
};
const hits = (rows: {y0: number; y1: number}[], b: {y0: number; y1: number}) => rows.some((r) => r.y1 > b.y0 && r.y0 < b.y1);

export const buildCapTimeline = () => {
	const shots = resolveShots();
	const sum = shots.reduce((a, s) => a + s.beats, 0);
	const factor = SONG.targetSeconds / (sum * GRID.beat);
	const byId = new Map(PHOTOS.map((p) => [p.id, p]));
	const clips: CapClip[] = [];
	let k = 0;
	shots.forEach((s, i) => {
		const n = Math.max(2, Math.round(s.beats * factor));
		const start = i === 0 ? 0 : Math.round(beatTime(k) * FPS);
		const end = Math.round(beatTime(k + n) * FPS);
		const photo = byId.get(s.id)!;
		clips.push({
			index: i, photo, start, end, from: start, to: end,
			inCut: s.cut, outCut: null, layout: capLayout(photo), zoomIn: i % 2 === 0,
			titled: i === 0 || i === shots.length - 1, lyricBand: LYRIC_BANDS[0],
		});
		k += n;
	});
	for (let i = 0; i < clips.length; i++) {
		const c = clips[i];
		const next = clips[i + 1];
		if (i > 0) c.from = c.start - Math.floor(CUT_FRAMES[c.inCut] / 2);
		if (next) {
			c.outCut = next.inCut;
			c.to = c.end + Math.ceil(CUT_FRAMES[next.inCut] / 2);
		}
	}
	for (const c of clips) {
		const rows = faceRows(c);
		const free = LYRIC_BANDS.filter((b) => !hits(rows, b) && !(c.titled && hits([b], TITLE_BAND)));
		c.lyricBand = free[0] ?? LYRIC_BANDS[0];
	}
	const totalFrames = clips[clips.length - 1].end;
	const beatFrames = GRID.beats.map((t) => Math.round(t * FPS)).filter((f) => f < totalFrames);
	const downFrames = GRID.downbeats.map((t) => Math.round(t * FPS)).filter((f) => f < totalFrames);
	return {clips, totalFrames, beatFrames, downFrames};
};

export const CAP = buildCapTimeline();
