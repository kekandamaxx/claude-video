/**
 * Face-safe camera moves.
 *
 * Every photo gets a "protect box": the union of its detected faces, grown to include hair or
 * headwear above and the chin below. A cover shot may only show windows of the image that contain
 * the whole protect box, at every frame. A photo that cannot fill the 16:9 frame without cutting into
 * that box (or would need too much upscaling) is framed whole on a blurred copy of itself, and the
 * movement becomes a slow push or drift of the print against a counter-moving backdrop (parallax).
 *
 * All moves run at constant speed (CAMERA in story.ts): no ease-in/out, so a move never stops inside
 * a dissolve and every shot travels at the same pace whatever its length.
 */
import {CAMERA, Motion} from './story';
import {HEIGHT, Photo, WIDTH} from './timeline';

export type Box = {x0: number; y0: number; x1: number; y1: number};

/** Normalised image coordinates of what must stay visible. */
export const protectBox = (p: Photo): Box => {
	if (!p.faces.length) return {x0: 0.3, y0: 0.25, x1: 0.7, y1: 0.7};
	let b: Box = {x0: 1, y0: 1, x1: 0, y1: 0};
	for (const fc of p.faces) {
		b = {
			x0: Math.min(b.x0, fc.x - fc.w * 0.35),
			y0: Math.min(b.y0, fc.y - fc.h * 0.8),
			x1: Math.max(b.x1, fc.x + fc.w * 1.35),
			y1: Math.max(b.y1, fc.y + fc.h * 1.45),
		};
	}
	return {x0: Math.max(0, b.x0), y0: Math.max(0, b.y0), x1: Math.min(1, b.x1), y1: Math.min(1, b.y1)};
};

/** Cover scale (CSS px per original px) at zoom 1. */
export const coverScale = (p: Photo) => Math.max(WIDTH / p.width, HEIGHT / p.height);

const halfWindow = (p: Photo, z: number) => {
	const k = coverScale(p) * z;
	return {hx: WIDTH / (2 * k * p.width), hy: HEIGHT / (2 * k * p.height)};
};

/** Allowed window-centre interval on one axis, or null if none exists. */
const axisRange = (h: number, lo: number, hi: number): [number, number] | null => {
	const a = Math.max(h, hi - h);
	const b = Math.min(1 - h, lo + h);
	return a <= b + 1e-6 ? [a, Math.max(a, b)] : null;
};

export const feasible = (p: Photo, box: Box, z: number) => {
	const {hx, hy} = halfWindow(p, z);
	const rx = axisRange(hx, box.x0, box.x1);
	const ry = axisRange(hy, box.y0, box.y1);
	return rx && ry ? {rx, ry} : null;
};

const maxZoom = (p: Photo, box: Box, cap: number) => {
	if (!feasible(p, box, 1)) return 0;
	if (feasible(p, box, cap)) return cap;
	let lo = 1;
	let hi = cap;
	for (let i = 0; i < 30; i++) {
		const m = (lo + hi) / 2;
		if (feasible(p, box, m)) lo = m;
		else hi = m;
	}
	return lo;
};

export type ResolvedLayout = 'cover' | 'contain';

/** Upscale beyond this (over the original pixels) looks soft on a 1080p screen: frame it instead. */
const MAX_COVER_UPSCALE = 2.15;

export const resolveLayout = (p: Photo, requested: 'auto' | ResolvedLayout): ResolvedLayout => {
	if (requested !== 'auto') return requested;
	if (p.width / p.height < 1.25) return 'contain';
	if (coverScale(p) > MAX_COVER_UPSCALE) return 'contain';
	return maxZoom(p, protectBox(p), 1.2) >= 1.03 ? 'cover' : 'contain';
};

export type Frame = {z: number; cx: number; cy: number};
const clampTo = (v: number, [a, b]: [number, number]) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Cover move over `seconds` of screen time, as a function of progress 0..1. Never leaves the protect box. */
export const coverMove = (p: Photo, motion: Motion, seconds: number) => {
	// A forced 'cover' on a photo that cannot keep every face: fall back to the frame centre.
	const box = feasible(p, protectBox(p), 1) ? protectBox(p) : {x0: 0.5, y0: 0.5, x1: 0.5, y1: 0.5};
	const zCap = maxZoom(p, box, 1.2);
	const centre = {x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2};
	const at = (z: number, x: number, y: number): Frame => {
		const r = feasible(p, box, z)!;
		return {z, cx: clampTo(x, r.rx), cy: clampTo(y, r.ry)};
	};
	const zoomAmount = Math.min(zCap, Math.exp(CAMERA.zoomPerSecond * seconds));
	const zoom = (): [Frame, Frame] => [at(1, lerp(0.5, centre.x, 0.35), lerp(0.5, centre.y, 0.35)), at(zoomAmount, centre.x, centre.y)];
	const pan = (axis: 'x' | 'y', dir: 1 | -1): [Frame, Frame] | null => {
		const px = CAMERA.panPxPerSecond * seconds;
		// Smallest zoom that gives the pan its travel (in normalised image units at that zoom).
		for (let z = 1.0; z <= zCap + 1e-9; z += 0.005) {
			const r = feasible(p, box, z);
			if (!r) break;
			const [lo, hi] = axis === 'x' ? r.rx : r.ry;
			const need = px / ((axis === 'x' ? p.width : p.height) * coverScale(p) * z);
			if (hi - lo >= need || z + 0.005 > zCap) {
				const span = Math.min(hi - lo, need);
				if (span < need * 0.5) return null;
				const mid = clampTo(axis === 'x' ? centre.x : centre.y, [lo + span / 2, hi - span / 2]);
				const s = mid - (dir * span) / 2;
				const e = mid + (dir * span) / 2;
				// A pan also breathes in slightly, so it never reads as a flat slide.
				const z2 = Math.min(zCap, z * Math.exp(CAMERA.zoomPerSecond * 0.25 * seconds));
				return axis === 'x' ? [at(z, s, centre.y), at(z2, e, centre.y)] : [at(z, centre.x, s), at(z2, centre.x, e)];
			}
		}
		return null;
	};
	let a: Frame;
	let b: Frame;
	switch (motion) {
		case 'panLeft':
			[a, b] = pan('x', -1) ?? zoom();
			break;
		case 'panRight':
			[a, b] = pan('x', 1) ?? zoom();
			break;
		case 'panUp':
			[a, b] = pan('y', -1) ?? zoom();
			break;
		case 'panDown':
			[a, b] = pan('y', 1) ?? zoom();
			break;
		case 'zoomOut':
			[b, a] = zoom();
			break;
		default:
			[a, b] = zoom();
	}
	return (t: number): Frame => {
		const e = Math.min(1, Math.max(0, t));
		const z = Math.exp(lerp(Math.log(a.z), Math.log(b.z), e));
		// Re-clamp every frame: the allowed window shrinks as the zoom grows.
		return at(z, lerp(a.cx, b.cx, e), lerp(a.cy, b.cy, e));
	};
};

/** A framed print: the whole photo inside a box (fractions of the frame), centred at (cx, cy). */
export const fitInBox = (p: Photo, boxW: number, boxH: number) => {
	const k = Math.min(boxW / p.width, boxH / p.height);
	return {w: p.width * k, h: p.height * k};
};

/** Framed-print move: slow push or pull, a drift, and the backdrop moving against it. */
export const containMove = (motion: Motion, seconds: number) => {
	const zoomOut = motion === 'zoomOut';
	const dx = motion === 'panLeft' ? -1 : motion === 'panRight' ? 1 : 0;
	const dy = motion === 'panUp' ? -1 : motion === 'panDown' ? 1 : 0;
	const s = Math.exp(CAMERA.cardScalePerSecond * seconds) - 1;
	const drift = CAMERA.cardDriftPxPerSecond * seconds;
	const para = CAMERA.parallaxPxPerSecond * seconds;
	return (t: number) => {
		const e = Math.min(1, Math.max(0, t)) - 0.5; // -0.5..0.5, centred so the print rests mid-shot
		return {
			fgScale: 1 + s * (zoomOut ? 0.5 - e : e + 0.5) * (dx || dy ? 0.5 : 1),
			fgX: dx * drift * e,
			fgY: dy * drift * e,
			bgScale: 1.16 + 0.06 * (zoomOut ? e + 0.5 : 0.5 - e),
			bgX: -(dx || 0.6) * para * e,
			bgY: -dy * para * 0.6 * e,
		};
	};
};
