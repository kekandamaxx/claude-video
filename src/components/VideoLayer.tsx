import React from 'react';
import {AbsoluteFill, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {clamp, pop, shake} from '../lib/anim';
import {useEdit} from '../lib/edit';

const Clip: React.FC<{src: string; srcFrom: number; len: number; zoomFrom: number; zoomTo: number; originY: number; first: boolean}> = ({src, srcFrom, len, zoomFrom, zoomTo, originY, first}) => {
	const f = useCurrentFrame();
	const drift = interpolate(f, [0, len], [zoomFrom, zoomTo], clamp);
	// Punch-in on every cut: overshoot + motion blur settling in ~6 frames.
	const p = first ? 1 : pop(f, 0, 14, 0.5);
	const punch = 1 + 0.1 * (1 - p);
	const blur = first ? 0 : interpolate(f, [0, 5], [7, 0], clamp);
	return (
		<AbsoluteFill style={{transform: `scale(${drift * punch})`, transformOrigin: `50% ${originY}px`, filter: `blur(${blur}px)`}}>
			<OffthreadVideo src={src} muted trimBefore={srcFrom} trimAfter={srcFrom + len} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		</AbsoluteFill>
	);
};

const FaceBoxes: React.FC<{offset: number}> = ({offset}) => {
	const {edl, faces} = useEdit();
	const frame = useCurrentFrame() + offset;
	const t = edl.srcTimeAt(frame);
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
	const e = useEdit();
	const frame = useCurrentFrame();
	const sh = shake(frame, e.shakeHits, 14, 7);
	const segs = e.edl.segments;
	const last = segs[segs.length - 1];
	const origin = (s: (typeof segs)[number]) => s.zoomOriginY ?? e.zoomOriginY;
	const outroDim = interpolate(frame, [e.edl.cutEnd, e.edl.cutEnd + 10], [0, 0.35], clamp);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.03)`, filter: 'contrast(1.08) saturate(1.16) brightness(1.02)'}}>
				{segs.map((s, i) => (
					<Sequence key={s.id} from={s.outFrom} durationInFrames={s.len} name={`clip:${s.id}`}>
						<Clip src={staticFile(src)} srcFrom={s.srcFrom} len={s.len} zoomFrom={s.zoomFrom} zoomTo={s.zoomTo} originY={origin(s)} first={i === 0} />
						{guides ? <AbsoluteFill style={{transform: `scale(${s.zoomTo})`, transformOrigin: `50% ${origin(s)}px`}}><FaceBoxes offset={s.outFrom} /></AbsoluteFill> : null}
					</Sequence>
				))}
				{/* Outro: hold the last frame under the end card. */}
				<Sequence from={e.edl.cutEnd} name="outro-freeze">
					<Freeze frame={last.len - 1}>
						<Clip src={staticFile(src)} srcFrom={last.srcFrom} len={last.len} zoomFrom={last.zoomFrom} zoomTo={last.zoomTo} originY={origin(last)} first />
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
	const {edl} = useEdit();
	const frame = useCurrentFrame();
	let o = 0;
	for (const s of edl.segments.slice(1)) if (frame >= s.outFrom) o = Math.max(o, interpolate(frame, [s.outFrom, s.outFrom + 4], [0.55, 0], clamp));
	return <AbsoluteFill style={{background: '#fff', opacity: o, mixBlendMode: 'screen'}} />;
};

/** QA pass: every detected face (conf >= 0.7, h < 320 px) as a white box, with the same
 *  zoom/shake transform the video gets, on black. Compared against the overlay pass. */
export const FaceMask: React.FC = () => {
	const e = useEdit();
	const frame = useCurrentFrame();
	const sh = shake(frame, e.shakeHits, 14, 7);
	const s = e.edl.segmentAt(frame);
	if (!s) return null;
	const f = frame - s.outFrom;
	const drift = interpolate(f, [0, s.len], [s.zoomFrom, s.zoomTo], clamp);
	const p = s.outFrom === 0 ? 1 : pop(f, 0, 14, 0.5);
	const z = drift * (1 + 0.1 * (1 - p));
	const t = (s.srcFrom + f) / 30;
	const near = e.faces.reduce((a, b) => (Math.abs(b.t - t) < Math.abs(a.t - t) ? b : a));
	return (
		<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.03)`}}>
			<AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `50% ${s.zoomOriginY ?? e.zoomOriginY}px`}}>
				{near.faces
					.filter((b) => b[4] >= 0.7 && b[3] < 320)
					.map((b, i) => (
						<div key={i} style={{position: 'absolute', left: b[0], top: b[1], width: b[2], height: b[3], background: '#fff'}} />
					))}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
