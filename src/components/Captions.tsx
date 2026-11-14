import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, CAPTION_ZONE, FONT_UI} from '../lib/theme';
import {useEdit} from '../lib/edit';
import {clamp, pop} from '../lib/anim';

export const Captions: React.FC = () => {
	const e = useEdit();
	const frame = useCurrentFrame();
	const chunk = e.edl.chunks.find((c) => frame >= c.from && frame < c.to);
	if (!chunk) return null;
	// Caption band centre: per segment (picked from the measured face band) or the edit default.
	const cy = e.edl.seg(chunk.words[0].segId).captionY ?? e.captionY;
	const chars = chunk.words.reduce((n, w) => n + w.text.length + 1, 0);
	const fit = e.captionAutoFit ? (chars > 30 ? 0.72 : chars > 22 ? 0.84 : 1) : 1;
	const enter = pop(frame, chunk.from, 13, 0.5);
	const exit = interpolate(frame, [chunk.to - 3, chunk.to], [1, 0], clamp);
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: e.captionZone?.x ?? CAPTION_ZONE.x,
					top: cy - CAPTION_ZONE.h / 2,
					width: e.captionZone?.w ?? CAPTION_ZONE.w,
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
						const key = e.captionKeys.has(w.text);
						const s = active ? pop(frame, w.from, 9, 0.4) : 1;
						return (
							<span
								key={i}
								style={{
									fontFamily: FONT_UI,
									fontWeight: 900,
									fontSize: (key ? 76 : 66) * fit,
									lineHeight: 1.08,
									letterSpacing: -0.5,
									color: active && key ? C.gold : spoken ? C.white : 'rgba(255,255,255,0.72)',
									WebkitTextStroke: `12px ${C.navy}`,
									paintOrder: 'stroke fill',
									textShadow: '0 6px 0 rgba(10,22,51,0.9), 0 10px 24px rgba(0,0,0,0.45)',
									transform: `scale(${active ? 1 + 0.12 * s : 1}) rotate(${active && key ? -2 : 0}deg)`,
									display: 'inline-block',
									whiteSpace: 'nowrap',
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
