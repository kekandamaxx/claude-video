/**
 * Face-safe Ken Burns framing.
 *
 * Every photo gets a "protect box": the union of its detected faces, grown to include hair or
 * headwear above and the chin below. A shot is only allowed to show windows of the image that
 * contain the whole protect box, at every frame. If the photo cannot fill the 16:9 frame without
 * cutting into that box (or would need too much upscaling), it is shown whole ("contain") on a
 * blurred, enlarged copy of itself, and the movement is applied to the layers as parallax.
 */
import {Easing, interpolate} from 'remotion';
import {Motion} from './story';
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

/** Half the visible window, in normalised image units, at zoom z. */
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
	let lo = 1;
	let hi = cap;
	if (feasible(p, box, hi)) return hi;
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
	const aspect = p.width / p.height;
	if (aspect < 1.25) return 'contain';
	if (coverScale(p) > MAX_COVER_UPSCALE) return 'contain';
	// Need at least a little zoom headroom so the shot can move.
	return maxZoom(p, protectBox(p), 1.2) >= 1.03 ? 'cover' : 'contain';
};

export type Frame = {z: number; cx: number; cy: number};

const clampTo = (v: number, [a, b]: [number, number]) => Math.min(b, Math.max(a, v));

/** The move, as a function of progress 0..1, for a cover-layout photo. Never leaves the protect box. */
export const coverMove = (p: Photo, motion: Motion) => {
	// A forced 'cover' on a photo that cannot keep every face: fall back to the frame centre.
	const box = feasible(p, protectBox(p), 1) ? protectBox(p) : {x0: 0.5, y0: 0.5, x1: 0.5, y1: 0.5};
	const zCap = maxZoom(p, box, 1.18);
	const centre = {x: (box.x0 + box.x1) / 2, y: (box.y0 + box.y1) / 2};
	const at = (z: number, x: number, y: number): Frame => {
		const r = feasible(p, box, z)!;
		return {z, cx: clampTo(x, r.rx), cy: clampTo(y, r.ry)};
	};
	let a: Frame;
	let b: Frame;
	const zoomEnd = Math.min(1.13, zCap);
	const pan = (axis: 'x' | 'y', dir: 1 | -1): [Frame, Frame] | null => {
		const z = Math.min(axis === 'x' ? 1.1 : 1.05, zCap);
		const r = feasible(p, box, z)!;
		const [lo, hi] = axis === 'x' ? r.rx : r.ry;
		const span = Math.min(hi - lo, axis === 'x' ? 0.09 : 0.11);
		if (span < 0.02) return null;
		const mid = clampTo(axis === 'x' ? centre.x : centre.y, [lo + span / 2, hi - span / 2]);
		const s = mid - (dir * span) / 2;
		const e = mid + (dir * span) / 2;
		return axis === 'x' ? [at(z, s, centre.y), at(z, e, centre.y)] : [at(z, centre.x, s), at(z, centre.x, e)];
	};
	const zoom = (): [Frame, Frame] => [at(1, 0.5, 0.5), at(zoomEnd, centre.x, centre.y)];
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
		const e = Easing.bezier(0.3, 0.05, 0.7, 0.95)(Math.min(1, Math.max(0, t)));
		const z = Math.exp(interpolate(e, [0, 1], [Math.log(a.z), Math.log(b.z)]));
		// Re-clamp at every frame: the allowed window shrinks as the zoom grows.
		return at(z, interpolate(e, [0, 1], [a.cx, b.cx]), interpolate(e, [0, 1], [a.cy, b.cy]));
	};
};

/** Contain layout: the whole photo, as large as fits inside `fill` of the frame. */
export const containSize = (p: Photo, fill = 0.88) => {
	const k = Math.min((WIDTH * fill) / p.width, (HEIGHT * fill) / p.height);
	return {w: p.width * k, h: p.height * k, k};
};

/** Contain layout move: foreground scale + drift, background moves the other way (parallax). */
export const containMove = (motion: Motion) => {
	const zoomIn = motion !== 'zoomOut';
	const dx = motion === 'panLeft' ? -1 : motion === 'panRight' ? 1 : 0;
	const dy = motion === 'panUp' ? -1 : motion === 'panDown' ? 1 : 0;
	return (t: number) => {
		const e = Easing.bezier(0.3, 0.05, 0.7, 0.95)(Math.min(1, Math.max(0, t)));
		const s = zoomIn ? interpolate(e, [0, 1], [1, 1.055]) : interpolate(e, [0, 1], [1.055, 1]);
		return {
			fgScale: s,
			fgX: dx * interpolate(e, [0, 1], [-14, 14]),
			fgY: dy * interpolate(e, [0, 1], [-10, 10]),
			bgScale: zoomIn ? interpolate(e, [0, 1], [1.22, 1.14]) : interpolate(e, [0, 1], [1.14, 1.22]),
			bgX: -dx * interpolate(e, [0, 1], [-40, 40]) + interpolate(e, [0, 1], [18, -18]),
			bgY: -dy * interpolate(e, [0, 1], [-24, 24]),
		};
	};
};
