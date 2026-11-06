import React, {useMemo} from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {gradeFilter} from './FilmLook';
import {containMove, containSize, coverMove, coverScale, resolveLayout} from './framing';
import {Clip, HEIGHT, WIDTH} from './timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const sine = Easing.bezier(0.37, 0, 0.63, 1);

/** Opacity, offset and exposure of a clip at absolute frame `frame` (transitions on both sides). */
export const clipEnvelope = (c: Clip, frame: number) => {
	const inEnd = c.from + c.inT.frames;
	const outStart = c.to - c.outT.frames;
	let opacity = c.inT.frames ? interpolate(frame, [c.from, inEnd], [0, 1], {...clamp, easing: sine}) : 1;
	if (c.outT.type === 'toBlack') opacity *= interpolate(frame, [outStart, c.to], [1, 0], {...clamp, easing: sine});
	let x = 0;
	if (c.inT.type === 'drift') x += interpolate(frame, [c.from, inEnd], [70, 0], {...clamp, easing: Easing.out(Easing.cubic)});
	if (c.outT.type === 'drift') x += interpolate(frame, [outStart, c.to], [0, -40], {...clamp, easing: Easing.in(Easing.cubic)});
	// Film burn: the incoming shot arrives over-exposed and settles.
	const exposure = c.inT.type === 'filmBurn' ? interpolate(frame, [c.from, inEnd + 10], [1.45, 1], {...clamp, easing: Easing.out(Easing.quad)}) : 1;
	return {opacity, x, exposure};
};

/** Ken Burns progress: the move spans the whole time the clip is visible, so it never stops mid-dissolve. */
const progress = (c: Clip, frame: number) => (frame - c.from) / Math.max(1, c.to - c.from);

export const PhotoShot: React.FC<{clip: Clip}> = ({clip}) => {
	const frame = useCurrentFrame();
	const p = clip.photo;
	const layout = useMemo(() => resolveLayout(p, clip.layout), [p, clip.layout]);
	const cover = useMemo(() => (layout === 'cover' ? coverMove(p, clip.motion) : null), [layout, p, clip.motion]);
	const contain = useMemo(() => (layout === 'contain' ? containMove(clip.motion) : null), [layout, clip.motion]);
	if (frame < clip.from || frame >= clip.to) return null;
	const env = clipEnvelope(clip, frame);
	const t = progress(clip, frame);
	// Gate weave: sub-pixel, slow.
	const wx = (random(`wx-${Math.floor(frame / 3)}`) - 0.5) * 0.7;
	const wy = (random(`wy-${Math.floor(frame / 3)}`) - 0.5) * 0.7;
	const filter = gradeFilter(env.exposure);
	const src = staticFile(p.src);

	let body: React.ReactNode;
	if (cover) {
		const {z, cx, cy} = cover(t);
		const k0 = coverScale(p);
		const w = p.width * k0;
		const h = p.height * k0;
		const tx = WIDTH / 2 - cx * w * z;
		const ty = HEIGHT / 2 - cy * h * z;
		body = (
			<Img
				src={src}
				style={{
					position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0',
					transform: `translate(${(tx + wx).toFixed(3)}px, ${(ty + wy).toFixed(3)}px) scale(${z.toFixed(5)})`,
					filter,
				}}
			/>
		);
	} else {
		const m = contain!(t);
		const fg = containSize(p);
		const bgK = Math.max(WIDTH / 1920, HEIGHT / 1080) * m.bgScale;
		body = (
			<>
				<Img
					src={staticFile(p.bg)}
					style={{
						position: 'absolute', left: 0, top: 0, width: WIDTH, height: HEIGHT, transformOrigin: '50% 50%',
						transform: `translate(${m.bgX.toFixed(3)}px, ${m.bgY.toFixed(3)}px) scale(${bgK.toFixed(5)})`,
						filter: `${filter} brightness(0.72)`,
					}}
				/>
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.35) 100%)'}} />
				<div
					style={{
						position: 'absolute', left: (WIDTH - fg.w) / 2, top: (HEIGHT - fg.h) / 2, width: fg.w, height: fg.h,
						transformOrigin: '50% 50%',
						transform: `translate(${(m.fgX + wx).toFixed(3)}px, ${(m.fgY + wy).toFixed(3)}px) scale(${m.fgScale.toFixed(5)})`,
						boxShadow: '0 30px 70px rgba(0,0,0,0.55), 0 8px 22px rgba(0,0,0,0.4)',
						outline: '1px solid rgba(255, 236, 205, 0.16)',
					}}
				>
					<Img src={src} style={{width: '100%', height: '100%', display: 'block', filter}} />
				</div>
			</>
		);
	}
	return (
		<AbsoluteFill style={{opacity: env.opacity, transform: env.x ? `translateX(${env.x.toFixed(2)}px)` : undefined, overflow: 'hidden'}}>
			{body}
		</AbsoluteFill>
	);
};
