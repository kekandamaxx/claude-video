import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {useEdit} from '../lib/edit';
import {CAPTION_ZONE, FONT_UI, SAFE, TOP_ZONE} from '../lib/theme';

const Block: React.FC<{x: number; y: number; w: number; h: number; color: string; label?: string; dashed?: boolean}> = ({x, y, w, h, color, label, dashed}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			width: w,
			height: h,
			background: dashed ? 'transparent' : color,
			border: dashed ? `4px dashed ${color}` : undefined,
			color: '#fff',
			fontFamily: FONT_UI,
			fontWeight: 800,
			fontSize: 26,
			padding: 8,
			boxSizing: 'border-box',
		}}
	>
		{label}
	</div>
);

/** Debug overlay: platform UI no-go areas (red), graphics/caption bands (green); cyan face boxes come from VideoLayer. */
export const SafeZoneGuides: React.FC = () => {
	const e = useEdit();
	const frame = useCurrentFrame();
	const s = e.edl.segmentAt(frame);
	const cy = s?.captionY ?? e.captionY;
	return (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<Block x={0} y={0} w={1080} h={SAFE.top} color="rgba(255,0,0,0.28)" label="TikTok/IG top UI" />
		<Block x={0} y={SAFE.bottom} w={1080} h={1920 - SAFE.bottom} color="rgba(255,0,0,0.28)" label="TikTok/IG caption + nav" />
		<Block x={SAFE.right} y={SAFE.top} w={1080 - SAFE.right} h={SAFE.bottom - SAFE.top} color="rgba(255,0,0,0.28)" label="" />
		<Block x={0} y={SAFE.top} w={SAFE.left} h={SAFE.bottom - SAFE.top} color="rgba(255,0,0,0.28)" />
		<Block x={TOP_ZONE.x} y={TOP_ZONE.y} w={TOP_ZONE.w} h={TOP_ZONE.h} color="#39FF6A" dashed label="graphics" />
		<Block x={CAPTION_ZONE.x} y={cy - CAPTION_ZONE.h / 2} w={CAPTION_ZONE.w} h={CAPTION_ZONE.h} color="#39FF6A" dashed label="captions" />
	</AbsoluteFill>
	);
};
