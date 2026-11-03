import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CHUNKS} from '../lib/edl';
import {C, CAPTION_ZONE, FONT_UI} from '../lib/theme';
import {clamp, pop} from '../lib/anim';

// Words that get the gold highlight + bigger scale when spoken.
const KEY = new Set(['7', 'ATTACK', 'KEEPER', 'SATU', 'TAK', 'DAPAT', '5', 'MINIT', 'SYAHMI', 'PLEASE', '1', '2', 'BIJI', 'ROTATE', 'MUQRI', 'CHAI', 'JASON', 'READY', 'LAST', '3', 'MINUTES', 'LEADING', 'GAP', 'KELUARKAN', 'BALIK', 'COME', 'ON']);

export const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const chunk = CHUNKS.find((c) => frame >= c.from && frame < c.to);
	if (!chunk) return null;
	const enter = pop(frame, chunk.from, 13, 0.5);
	const exit = interpolate(frame, [chunk.to - 3, chunk.to], [1, 0], clamp);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: CAPTION_ZONE.x,
					top: CAPTION_ZONE.y,
					width: CAPTION_ZONE.w,
					height: CAPTION_ZONE.h,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexWrap: 'wrap',
						justifyContent: 'center',
						gap: '4px 36px',
						transform: `scale(${0.82 + enter * 0.18}) translateY(${(1 - enter) * 24}px)`,
						opacity: Math.min(enter * 1.6, 1) * exit,
					}}
				>
					{chunk.words.map((w, i) => {
						const active = frame >= w.from && frame < Math.max(w.to, w.from + 4);
						const spoken = frame >= w.from;
						const key = KEY.has(w.text);
						const s = active ? pop(frame, w.from, 9, 0.4) : 1;
						return (
							<span
								key={i}
								style={{
									fontFamily: FONT_UI,
									fontWeight: 900,
									fontSize: key ? 76 : 66,
									lineHeight: 1.08,
									letterSpacing: -0.5,
									color: active && key ? C.gold : spoken ? C.white : 'rgba(255,255,255,0.72)',
									WebkitTextStroke: `12px ${C.navy}`,
									paintOrder: 'stroke fill',
									textShadow: '0 6px 0 rgba(10,22,51,0.9), 0 10px 24px rgba(0,0,0,0.45)',
									transform: `scale(${active ? 1 + 0.12 * s : 1}) rotate(${active && key ? -2 : 0}deg)`,
									display: 'inline-block',
								}}
							>
								{w.text}
							</span>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};
