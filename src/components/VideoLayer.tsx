import React from 'react';
import {AbsoluteFill, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CUT_END, SEGMENTS, srcTimeAt} from '../lib/edl';
import {ZOOM_ORIGIN_Y} from '../lib/theme';
import {clamp, pop, shake} from '../lib/anim';
import {SHAKE_HITS, T} from './Graphics';
import faces from '../data/faces.json';

const Clip: React.FC<{src: string; srcFrom: number; len: number; zoomFrom: number; zoomTo: number; first: boolean}> = ({src, srcFrom, len, zoomFrom, zoomTo, first}) => {
	const f = useCurrentFrame();
	const drift = interpolate(f, [0, len], [zoomFrom, zoomTo], clamp);
	// Punch-in on every cut: overshoot + motion blur settling in ~6 frames.
	const p = first ? 1 : pop(f, 0, 14, 0.5);
	const punch = 1 + 0.1 * (1 - p);
	const blur = first ? 0 : interpolate(f, [0, 5], [7, 0], clamp);
	return (
		<AbsoluteFill style={{transform: `scale(${drift * punch})`, transformOrigin: `50% ${ZOOM_ORIGIN_Y}px`, filter: `blur(${blur}px)`}}>
			<OffthreadVideo src={src} muted trimBefore={srcFrom} trimAfter={srcFrom + len} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		</AbsoluteFill>
	);
};

const FaceBoxes: React.FC<{offset: number}> = ({offset}) => {
	const frame = useCurrentFrame() + offset;
	const t = srcTimeAt(frame);
	if (t === null) return null;
	const near = faces.reduce((a, b) => (Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a));
	return (
		<>
			{near.faces.map((b, i) => (
				<div key={i} style={{position: 'absolute', left: b[0], top: b[1], width: b[2], height: b[3], border: '4px solid #00E5FF', borderRadius: 8}} />
			))}
		</>
	);
};

export const VideoLayer: React.FC<{src: string; guides: boolean}> = ({src, guides}) => {
	const frame = useCurrentFrame();
	const sh = shake(frame, SHAKE_HITS, 14, 7);
	const last = SEGMENTS[SEGMENTS.length - 1];
	const outroDim = interpolate(frame, [T.outro, T.outro + 10], [0, 0.35], clamp);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.03)`, filter: 'contrast(1.08) saturate(1.16) brightness(1.02)'}}>
				{SEGMENTS.map((s, i) => (
					<Sequence key={s.id} from={s.outFrom} durationInFrames={s.len} name={`clip:${s.id}`}>
						<Clip src={staticFile(src)} srcFrom={s.srcFrom} len={s.len} zoomFrom={s.zoomFrom} zoomTo={s.zoomTo} first={i === 0} />
						{guides ? <AbsoluteFill style={{transform: `scale(${s.zoomTo})`, transformOrigin: `50% ${ZOOM_ORIGIN_Y}px`}}><FaceBoxes offset={s.outFrom} /></AbsoluteFill> : null}
					</Sequence>
				))}
				{/* Outro: hold the last frame under the end card. */}
				<Sequence from={CUT_END} name="outro-freeze">
					<Freeze frame={last.len - 1}>
						<Clip src={staticFile(src)} srcFrom={last.srcFrom} len={last.len} zoomFrom={last.zoomFrom} zoomTo={last.zoomTo} first />
					</Freeze>
				</Sequence>
			</AbsoluteFill>
			{/* Grade: vignette + darker sky band so top graphics read on bright clouds. */}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)'}} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(6,12,32,0.55) 0%, rgba(6,12,32,0.25) 28%, rgba(6,12,32,0) 36%, rgba(6,12,32,0) 58%, rgba(6,12,32,0.35) 74%, rgba(6,12,32,0.5) 100%)'}} />
			<AbsoluteFill style={{background: '#000', opacity: outroDim}} />
		</AbsoluteFill>
	);
};

/** White flash on each hard cut (not the first frame). */
export const CutFlash: React.FC = () => {
	const frame = useCurrentFrame();
	let o = 0;
	for (const s of SEGMENTS.slice(1)) if (frame >= s.outFrom) o = Math.max(o, interpolate(frame, [s.outFrom, s.outFrom + 4], [0.55, 0], clamp));
	return <AbsoluteFill style={{background: '#fff', opacity: o, mixBlendMode: 'screen'}} />;
};
