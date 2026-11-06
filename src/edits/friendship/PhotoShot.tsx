import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {gradeFilter} from './FilmLook';
import {containMove, coverMove, coverScale, fitInBox, resolveLayout} from './framing';
import {ENDING} from './story';
import {beatsToFrames, Clip, FPS, HEIGHT, Photo, WIDTH} from './timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sine = Easing.bezier(0.37, 0, 0.63, 1);

/** Card boxes (px). Text shots shrink and lift the print so the line sits below it, never on people. */
export const CARD = {
	normal: {w: WIDTH * 0.9, h: HEIGHT * 0.88, cy: HEIGHT / 2},
	withText: {w: WIDTH * 0.86, h: HEIGHT * 0.74, cy: 60 + (HEIGHT * 0.74) / 2},
	pair: {w: WIDTH * 0.44, h: HEIGHT * 0.86, cy: HEIGHT / 2, gap: 40},
};

/** Opacity and exposure of a clip at absolute frame `frame` (transitions on both sides, ending dim). */
export const clipEnvelope = (c: Clip, frame: number) => {
	const inEnd = c.from + c.inT.frames;
	const outStart = c.to - c.outT.frames;
	let opacity = c.inT.frames ? interpolate(frame, [c.from, inEnd], [0, 1], {...clamp, easing: sine}) : 1;
	if (c.outT.type === 'toBlack') opacity *= interpolate(frame, [outStart, c.to], [1, 0], {...clamp, easing: sine});
	// Film burn: the incoming shot arrives over-exposed and settles.
	let exposure = c.inT.type === 'filmBurn' ? interpolate(frame, [c.from, inEnd + 8], [1.4, 1], {...clamp, easing: Easing.out(Easing.quad)}) : 1;
	let saturate = 1;
	if (c.held) {
		// Dims as the thank-you line leaves, so the closing lines sit on a dark ghost of the photo, not on faces.
		const d = interpolate(frame, [c.slotTo - beatsToFrames(1), c.slotTo + beatsToFrames(3)], [0, 1], {...clamp, easing: sine});
		exposure *= 1 - d * (1 - ENDING.dimTo);
		saturate = 1 - d * 0.45;
	}
	return {opacity, exposure, saturate};
};

/** Where a pair's two prints sit (px, top-left) before motion. */
export const pairLayout = (a: Photo, b: Photo) => {
	const A = fitInBox(a, CARD.pair.w, CARD.pair.h);
	const B = fitInBox(b, CARD.pair.w, CARD.pair.h);
	const total = A.w + B.w + CARD.pair.gap;
	const x0 = (WIDTH - total) / 2;
	return [
		{...A, x: x0, y: CARD.pair.cy - A.h / 2},
		{...B, x: x0 + A.w + CARD.pair.gap, y: CARD.pair.cy - B.h / 2},
	];
};

const Print: React.FC<{photo: Photo; x: number; y: number; w: number; h: number; tx: number; ty: number; scale: number; filter: string; opacity?: number}> = ({photo, x, y, w, h, tx, ty, scale, filter, opacity = 1}) => (
	<div
		style={{
			position: 'absolute', left: x, top: y, width: w, height: h, transformOrigin: '50% 50%', opacity,
			transform: `translate(${tx.toFixed(3)}px, ${ty.toFixed(3)}px) scale(${scale.toFixed(5)})`,
			boxShadow: '0 30px 70px rgba(0,0,0,0.55), 0 8px 22px rgba(0,0,0,0.4)',
			outline: '1px solid rgba(255, 236, 205, 0.16)',
		}}
	>
		<Img src={staticFile(photo.src)} style={{width: '100%', height: '100%', display: 'block', filter}} />
	</div>
);

const Backdrop: React.FC<{photo: Photo; x: number; y: number; scale: number; filter: string; opacity?: number}> = ({photo, x, y, scale, filter, opacity = 1}) => (
	<Img
		src={staticFile(photo.bg)}
		style={{
			position: 'absolute', left: 0, top: 0, width: WIDTH, height: HEIGHT, transformOrigin: '50% 50%', opacity,
			transform: `translate(${x.toFixed(3)}px, ${y.toFixed(3)}px) scale(${scale.toFixed(5)})`,
			filter: `${filter} brightness(0.7)`,
		}}
	/>
);

export const PhotoShot: React.FC<{clip: Clip}> = ({clip}) => {
	const frame = useCurrentFrame();
	const p = clip.photos[0];
	const pair = clip.photos[1];
	const seconds = (clip.to - clip.from) / FPS;
	const layout = useMemo(() => (pair ? 'contain' : resolveLayout(p, clip.layout)), [p, pair, clip.layout]);
	const cover = useMemo(() => (layout === 'cover' ? coverMove(p, clip.motion, seconds) : null), [layout, p, clip.motion, seconds]);
	const contain = useMemo(() => (layout === 'contain' ? containMove(clip.motion, seconds) : null), [layout, clip.motion, seconds]);
	if (frame < clip.from || frame >= clip.to) return null;
	const env = clipEnvelope(clip, frame);
	const t = (frame - clip.from) / Math.max(1, clip.to - clip.from);
	// Gate weave: sub-pixel, slow.
	const wx = (random(`wx-${Math.floor(frame / 3)}`) - 0.5) * 0.7;
	const wy = (random(`wy-${Math.floor(frame / 3)}`) - 0.5) * 0.7;
	const filter = gradeFilter(env.exposure) + (env.saturate < 1 ? ` saturate(${env.saturate.toFixed(3)})` : '');

	let body: React.ReactNode;
	if (cover) {
		const {z, cx, cy} = cover(t);
		const k0 = coverScale(p);
		const w = p.width * k0;
		const h = p.height * k0;
		body = (
			<Img
				src={staticFile(p.src)}
				style={{
					position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0',
					transform: `translate(${(WIDTH / 2 - cx * w * z + wx).toFixed(3)}px, ${(HEIGHT / 2 - cy * h * z + wy).toFixed(3)}px) scale(${z.toFixed(5)})`,
					filter,
				}}
			/>
		);
	} else if (pair) {
		const m = contain!(t);
		const [A, B] = pairLayout(p, pair);
		const bIn = interpolate(frame, [clip.pairFrom!, clip.pairFrom! + beatsToFrames(3)], [0, 1], {...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1)});
		const slide = (1 - bIn) * ((WIDTH - A.w) / 2 - A.x);
		// The two prints drift against each other: one rises while the other settles.
		const v = m.fgY || m.fgX;
		body = (
			<>
				<Backdrop photo={p} x={m.bgX} y={m.bgY} scale={m.bgScale} filter={filter} />
				<Backdrop photo={pair} x={m.bgX} y={m.bgY} scale={m.bgScale} filter={filter} opacity={bIn * 0.6} />
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35) 100%)'}} />
				{/* The first print opens centred; as its partner arrives both glide left together, gap intact. */}
				<Print photo={p} {...A} tx={wx + slide} ty={v + wy} scale={m.fgScale} filter={filter} />
				<Print photo={pair} {...B} tx={wx + slide} ty={-v + wy} scale={m.fgScale} filter={filter} opacity={bIn * bIn} />
			</>
		);
	} else {
		const m = contain!(t);
		const box = clip.text ? CARD.withText : CARD.normal;
		const fg = fitInBox(p, box.w, box.h);
		body = (
			<>
				<Backdrop photo={p} x={m.bgX} y={m.bgY} scale={m.bgScale} filter={filter} />
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35) 100%)'}} />
				<Print photo={p} x={(WIDTH - fg.w) / 2} y={box.cy - fg.h / 2} w={fg.w} h={fg.h} tx={m.fgX + wx} ty={m.fgY + wy} scale={m.fgScale} filter={filter} />
			</>
		);
	}
	return <AbsoluteFill style={{opacity: env.opacity, overflow: 'hidden'}}>{body}</AbsoluteFill>;
};
