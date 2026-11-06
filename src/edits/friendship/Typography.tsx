import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';

export const SERIF = '"Cormorant Garamond", Georgia, serif';
export const SANS = 'Montserrat, Arial, sans-serif';
export const INK = '#F7ECDD';
export const GOLD = '#E8C27A';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/**
 * A line that reveals word by word (fade, rise, defocus to focus) and leaves as one piece.
 * Frames are absolute composition frames.
 */
export const RevealLine: React.FC<{
	text: string;
	inAt: number;
	outAt: number;
	outDur?: number;
	size?: number;
	italic?: boolean;
	color?: string;
	stagger?: number;
	wordDur?: number;
	style?: React.CSSProperties;
}> = ({text, inAt, outAt, outDur = 36, size = 66, italic = true, color = INK, stagger = 5, wordDur = 34, style}) => {
	const frame = useCurrentFrame();
	if (frame < inAt - 1 || frame > outAt + outDur + 1) return null;
	const out = interpolate(frame, [outAt, outAt + outDur], [0, 1], {...clamp, easing: Easing.bezier(0.45, 0, 0.55, 1)});
	const words = text.split(' ');
	return (
		<div
			style={{
				fontFamily: SERIF,
				fontStyle: italic ? 'italic' : 'normal',
				fontWeight: 500,
				fontSize: size,
				lineHeight: 1.25,
				letterSpacing: '0.01em',
				color,
				textAlign: 'center',
				textShadow: '0 0 28px rgba(255, 196, 120, 0.28), 0 2px 18px rgba(0,0,0,0.55)',
				opacity: 1 - out,
				filter: out > 0 ? `blur(${(out * 6).toFixed(2)}px)` : undefined,
				transform: `translateY(${(-out * 10).toFixed(2)}px)`,
				...style,
			}}
		>
			{words.map((w, i) => {
				const p = interpolate(frame, [inAt + i * stagger, inAt + i * stagger + wordDur], [0, 1], {...clamp, easing: easeOut});
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity: p,
							transform: `translateY(${((1 - p) * 16).toFixed(2)}px)`,
							filter: p < 1 ? `blur(${((1 - p) * 9).toFixed(2)}px)` : undefined,
							marginRight: i < words.length - 1 ? '0.26em' : 0,
						}}
					>
						{w}
					</span>
				);
			})}
		</div>
	);
};

/** Thin gold rule that draws out from the centre. */
export const GoldRule: React.FC<{inAt: number; outAt: number; outDur?: number; width?: number}> = ({inAt, outAt, outDur = 36, width = 260}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [inAt, inAt + 50], [0, 1], {...clamp, easing: easeOut});
	const o = 1 - interpolate(frame, [outAt, outAt + outDur], [0, 1], clamp);
	return (
		<div
			style={{
				width: width * p,
				height: 1.5,
				margin: '0 auto',
				opacity: o * 0.9,
				background: `linear-gradient(90deg, rgba(232,194,122,0) 0%, ${GOLD} 50%, rgba(232,194,122,0) 100%)`,
			}}
		/>
	);
};

/** Small spaced capitals (signature / labels). */
export const Caps: React.FC<{text: string; inAt: number; outAt: number; outDur?: number; size?: number}> = ({text, inAt, outAt, outDur = 36, size = 22}) => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [inAt, inAt + 45], [0, 1], {...clamp, easing: easeOut});
	const o = 1 - interpolate(frame, [outAt, outAt + outDur], [0, 1], clamp);
	return (
		<div
			style={{
				fontFamily: SANS,
				fontWeight: 400,
				fontSize: size,
				letterSpacing: `${(0.42 + (1 - p) * 0.25).toFixed(3)}em`,
				textTransform: 'uppercase',
				color: GOLD,
				textAlign: 'center',
				opacity: p * o * 0.92,
				paddingLeft: '0.42em', // optically centre tracked caps
			}}
		>
			{text}
		</div>
	);
};
