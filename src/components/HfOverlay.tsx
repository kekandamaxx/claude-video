import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';

/** A Hyperframes overlay (transparent PNG sequence from scripts/render_hyperframes.sh),
 *  played frame-for-frame from output frame `from`. */
export const HfOverlay: React.FC<{dir: string; from: number; frames: number}> = ({dir, from, frames}) => {
	const f = useCurrentFrame() - from;
	if (f < 0 || f >= frames) return null;
	return (
		<AbsoluteFill>
			<Img src={staticFile(`${dir}/${String(f).padStart(5, '0')}.png`)} style={{width: '100%', height: '100%'}} />
		</AbsoluteFill>
	);
};
