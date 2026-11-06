import React from 'react';
import {AbsoluteFill, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {GRADE} from './story';
import {HEIGHT, TransitionEvent, WIDTH} from './timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** CSS filter applied to every photo: gentle contrast, a touch of sepia, natural saturation. */
export const gradeFilter = (exposure = 1) =>
	`contrast(${GRADE.contrast}) saturate(${GRADE.saturate}) sepia(${GRADE.sepia}) brightness(${(GRADE.brightness * exposure).toFixed(3)})`;

/** Warm wash, faded film black point and a slow golden bloom over the photo layer. */
export const GradeOverlay: React.FC<{strength?: number}> = ({strength = 1}) => {
	const frame = useCurrentFrame();
	const gx = 22 + Math.sin(frame / 260) * 8;
	const gy = 18 + Math.cos(frame / 330) * 6;
	return (
		<AbsoluteFill style={{pointerEvents: 'none', opacity: strength}}>
			<AbsoluteFill style={{background: '#ff9440', mixBlendMode: 'soft-light', opacity: GRADE.warmth}} />
			<AbsoluteFill style={{background: GRADE.lift, mixBlendMode: 'lighten'}} />
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 55% 50% at ${gx}% ${gy}%, rgba(255, 206, 120, 1) 0%, rgba(255, 170, 80, 0.35) 40%, rgba(0,0,0,0) 72%)`,
					mixBlendMode: 'screen',
					opacity: GRADE.glow,
				}}
			/>
			{/* Highlights roll off to cream rather than clipping to white. */}
			<AbsoluteFill style={{background: 'rgb(255, 238, 214)', mixBlendMode: 'darken', opacity: 0.9}} />
		</AbsoluteFill>
	);
};

export const Vignette: React.FC = () => (
	<AbsoluteFill
		style={{
			pointerEvents: 'none',
			background: `radial-gradient(ellipse 78% 74% at 50% 48%, rgba(0,0,0,0) 52%, rgba(8, 4, 2, ${GRADE.vignette}) 100%)`,
		}}
	/>
);

/** 12 pre-rendered noise tiles, a new tile and offset every frame (24 fps-style cadence held for 1 frame). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = GRADE.grain}) => {
	const frame = useCurrentFrame();
	const i = Math.floor(random(`grain-${frame}`) * 12);
	const ox = Math.floor(random(`gx-${frame}`) * 512);
	const oy = Math.floor(random(`gy-${frame}`) * 512);
	return (
		<AbsoluteFill
			style={{
				pointerEvents: 'none',
				backgroundImage: `url(${staticFile(`friendship/grain/g${i}.png`)})`,
				backgroundRepeat: 'repeat',
				backgroundPosition: `${ox}px ${oy}px`,
				mixBlendMode: 'overlay',
				opacity,
			}}
		/>
	);
};

/** Projector flicker: +-1% exposure breathing, never a visible strobe. */
export const Flicker: React.FC = () => {
	const frame = useCurrentFrame();
	const v = (random(`flk-${Math.floor(frame / 2)}`) - 0.5) * 0.022 + Math.sin(frame / 9) * 0.006;
	return <AbsoluteFill style={{pointerEvents: 'none', background: v > 0 ? '#fff4e6' : '#000', opacity: Math.abs(v)}} />;
};

/** A few slow specks of dust, one at a time, rarely. */
export const Dust: React.FC = () => {
	const frame = useCurrentFrame();
	const slot = Math.floor(frame / 11);
	if (random(`dust-on-${slot}`) > 0.28) return null;
	const x = random(`dust-x-${slot}`) * WIDTH;
	const y = random(`dust-y-${slot}`) * HEIGHT;
	const r = 1.2 + random(`dust-r-${slot}`) * 2.2;
	const dark = random(`dust-c-${slot}`) > 0.5;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute', left: x, top: y, width: r * 2, height: r * (1.2 + random(`dust-h-${slot}`) * 2),
					borderRadius: '50%', background: dark ? 'rgba(20,12,6,0.55)' : 'rgba(255,245,230,0.5)', filter: 'blur(0.6px)',
				}}
			/>
		</AbsoluteFill>
	);
};

/** Warm light leak / film burn that peaks at the middle of a transition. */
export const LightLeak: React.FC<{event: TransitionEvent}> = ({event}) => {
	const frame = useCurrentFrame();
	const pad = Math.round(event.frames * 0.6);
	const p = interpolate(frame, [event.from - pad, event.from + event.frames + pad], [0, 1], clamp);
	if (p <= 0 || p >= 1) return null;
	const burn = event.type === 'filmBurn';
	const bell = Math.sin(Math.PI * p) ** 1.6;
	const x = interpolate(p, [0, 1], [-15, 115]);
	const x2 = interpolate(p, [0, 1], [110, 10]);
	return (
		<AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', opacity: bell * (burn ? 0.95 : 0.7)}}>
			<AbsoluteFill style={{background: `radial-gradient(ellipse 48% 95% at ${x}% 40%, rgba(255,150,60,0.95) 0%, rgba(255,90,30,0.45) 35%, rgba(0,0,0,0) 70%)`}} />
			<AbsoluteFill style={{background: `radial-gradient(ellipse 30% 60% at ${x2}% 70%, rgba(255,214,140,0.8) 0%, rgba(255,170,90,0.25) 45%, rgba(0,0,0,0) 75%)`}} />
			<AbsoluteFill style={{background: `linear-gradient(90deg, rgba(255,70,40,${burn ? 0.55 : 0.25}) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 78%, rgba(255,120,50,${burn ? 0.4 : 0.15}) 100%)`}} />
			{burn ? <AbsoluteFill style={{background: 'rgba(255, 236, 205, 1)', opacity: Math.max(0, bell - 0.55) * 1.1}} /> : null}
		</AbsoluteFill>
	);
};

/** Out-of-focus warm bokeh drifting upward, for the text-only scenes. */
export const Bokeh: React.FC<{count?: number; opacity?: number; seed?: string}> = ({count = 26, opacity = 1, seed = 'b'}) => {
	const frame = useCurrentFrame();
	const dots = Array.from({length: count}, (_, i) => {
		const r = 18 + random(`${seed}-r-${i}`) * 70;
		const speed = 0.12 + random(`${seed}-s-${i}`) * 0.35;
		const x0 = random(`${seed}-x-${i}`) * WIDTH;
		const y0 = random(`${seed}-y-${i}`) * (HEIGHT + 300);
		const y = ((y0 - frame * speed) % (HEIGHT + 300) + HEIGHT + 300) % (HEIGHT + 300) - 150;
		const x = x0 + Math.sin(frame / 90 + i) * 22;
		const a = (0.05 + random(`${seed}-a-${i}`) * 0.14) * (0.75 + 0.25 * Math.sin(frame / 37 + i * 1.7));
		const warm = random(`${seed}-c-${i}`);
		const col = warm > 0.6 ? '255, 196, 120' : warm > 0.25 ? '255, 160, 90' : '255, 228, 190';
		return (
			<div
				key={i}
				style={{
					position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%',
					background: `radial-gradient(circle, rgba(${col}, ${a}) 0%, rgba(${col}, ${a * 0.6}) 55%, rgba(${col}, 0) 72%)`,
				}}
			/>
		);
	});
	return <AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'screen'}}>{dots}</AbsoluteFill>;
};

/** Deep warm backdrop for the text scenes (not flat black). */
export const WarmDark: React.FC = () => {
	const frame = useCurrentFrame();
	const gx = 50 + Math.sin(frame / 200) * 6;
	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(ellipse 70% 60% at ${gx}% 55%, #2a1a10 0%, #150c07 45%, #070403 100%)`,
			}}
		/>
	);
};
