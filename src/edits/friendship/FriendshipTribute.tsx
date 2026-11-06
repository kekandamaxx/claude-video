import React, {useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {Bokeh, Dust, Flicker, Grain, GradeOverlay, LightLeak, Vignette, WarmDark} from './FilmLook';
import {PhotoShot} from './PhotoShot';
import {ENDING, GRADE, MUSIC, OPENING, TEXT, TextKey} from './story';
import {beatsToFrames, FPS, sceneRange, TIMELINE} from './timeline';

/** Distance from the frame bottom to the photo-text baseline box (QA checks faces against it). */
export const TEXT_BOTTOM = 70;
import {Caps, GoldRule, RevealLine} from './Typography';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const s = (sec: number) => Math.round(sec * FPS);

export const friendshipSchema = z.object({
	open1: z.string(),
	open2: z.string(),
	thanks1: z.string(),
	thanks2: z.string(),
	end1: z.string(),
	end2: z.string(),
	final: z.string(),
	signature: z.string(),
	music: z.boolean(),
	/** QA overlay: draws every protect box (faces) and the text band. */
	qa: z.boolean(),
});
export type FriendshipProps = z.infer<typeof friendshipSchema>;
export const friendshipDefaults: FriendshipProps = {...TEXT, music: true, qa: false};

const useFonts = () => {
	const [handle] = useState(() => delayRender('friendship fonts'));
	useState(() => {
		Promise.all([
			document.fonts.load('italic 500 66px "Cormorant Garamond"'),
			document.fonts.load('italic 400 66px "Cormorant Garamond"'),
			document.fonts.load('400 22px Montserrat'),
		])
			.then(() => continueRender(handle))
			.catch(() => continueRender(handle));
		return null;
	});
};

/** Two centred lines with a gold rule between them (opening and ending). */
const TwoLines: React.FC<{a: string; b: string; aIn: number; bIn: number; out: number; outDur: number; children?: React.ReactNode}> = ({a, b, aIn, bIn, out, outDur, children}) => (
	<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 160px'}}>
		<div style={{display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center'}}>
			<RevealLine text={a} inAt={aIn} outAt={out} outDur={outDur} size={72} />
			<GoldRule inAt={aIn + 30} outAt={out} outDur={outDur} width={220} />
			<RevealLine text={b} inAt={bIn} outAt={out} outDur={outDur} size={72} />
			{children}
		</div>
	</AbsoluteFill>
);

/** Warm light that slowly rises behind the opening lines, like a projector lamp warming up. */
const LampGlow: React.FC<{from: number; peak: number; to: number}> = ({from, peak, to}) => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [from, peak, to - 20, to], [0, 1, 1, 0], clamp);
	const r = interpolate(frame, [from, to], [34, 46], clamp);
	return <AbsoluteFill style={{opacity: o * 0.8, background: `radial-gradient(ellipse ${r}% ${r * 0.62}% at 50% 52%, rgba(150, 92, 40, 0.5) 0%, rgba(90, 52, 22, 0.22) 45%, rgba(0,0,0,0) 100%)`}} />;
};

const Opening: React.FC<{p: FriendshipProps}> = ({p}) => {
	const frame = useCurrentFrame();
	const r = sceneRange('opening');
	if (frame >= r.to + s(1.5)) return null;
	const b = (beats: number) => r.from + beatsToFrames(beats);
	const O = OPENING;
	const bgIn = interpolate(frame, [0, s(1.2)], [0, 1], clamp);
	const bgOut = interpolate(frame, [b(O.out), r.to + s(0.8)], [1, 0], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: bgIn * bgOut}}>
				<WarmDark />
				<LampGlow from={0} peak={b(6)} to={r.to + s(0.8)} />
				<Bokeh seed="open" opacity={0.8} />
			</AbsoluteFill>
			<TwoLines a={p.open1} b={p.open2} aIn={b(O.line1In)} bIn={b(O.line2In)} out={b(O.out)} outDur={beatsToFrames(O.outBeats)}>
				<div style={{height: 6}} />
				<Caps text={p.signature} inAt={b(O.titleIn)} outAt={b(O.out)} outDur={beatsToFrames(O.outBeats)} size={20} />
			</TwoLines>
		</AbsoluteFill>
	);
};

const Ending: React.FC<{p: FriendshipProps}> = ({p}) => {
	const frame = useCurrentFrame();
	const r = sceneRange('ending');
	if (frame < r.from) return null;
	const E = ENDING;
	const b = (beats: number) => r.from + beatsToFrames(beats);
	// The closing lines sit over the last group photo as it dims; then true black, then the final card.
	const scrim = interpolate(frame, [r.from, b(3), b(E.out), b(E.photoOut)], [0, 1, 1, 0], clamp);
	const card = interpolate(frame, [b(E.finalIn - 2), b(E.finalIn + 4), b(E.finalOut), b(E.finalOut + E.finalOutBeats)], [0, 1, 1, 0], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: scrim * 0.55, background: 'radial-gradient(ellipse 62% 40% at 50% 50%, rgba(10,5,2,0.9) 0%, rgba(10,5,2,0.35) 70%, rgba(10,5,2,0) 100%)'}} />
			<AbsoluteFill style={{opacity: card}}>
				<WarmDark />
				<Bokeh seed="end" opacity={0.55} count={18} />
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 40% 26% at 50% 50%, rgba(120, 72, 30, 0.35) 0%, rgba(0,0,0,0) 100%)'}} />
			</AbsoluteFill>
			<TwoLines a={p.end1} b={p.end2} aIn={b(E.line1In)} bIn={b(E.line2In)} out={b(E.out)} outDur={beatsToFrames(E.outBeats)} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 34, alignItems: 'center', transform: 'translateY(14px)'}}>
					<RevealLine text={p.final} inAt={b(E.finalIn)} outAt={b(E.finalOut)} outDur={beatsToFrames(E.finalOutBeats)} size={86} stagger={7} wordDur={44} />
					<GoldRule inAt={b(E.signatureIn - 1)} outAt={b(E.finalOut)} outDur={beatsToFrames(E.finalOutBeats)} width={300} />
					<Caps text={p.signature} inAt={b(E.signatureIn)} outAt={b(E.finalOut)} outDur={beatsToFrames(E.finalOutBeats)} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** Appreciation lines: set in the space under the (lifted) print, never over people. */
const PhotoText: React.FC<{p: FriendshipProps}> = ({p}) => {
	const frame = useCurrentFrame();
	const c = TIMELINE.clips.find((cl) => cl.text && frame >= cl.text.from - 2 && frame <= cl.text.to + s(1.4));
	if (!c || !c.text) return null;
	const {from, to} = c.text;
	const scrim = interpolate(frame, [from - s(0.6), from + s(0.8), to, to + s(1.4)], [0, 1, 1, 0], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: scrim, background: 'linear-gradient(0deg, rgba(8,4,2,0.6) 0%, rgba(8,4,2,0.3) 16%, rgba(8,4,2,0) 30%)'}} />
			<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: TEXT_BOTTOM}}>
				<RevealLine text={p[c.text.key as TextKey]} inAt={from} outAt={to} outDur={s(1.2)} size={56} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** Final fade: grain and every layer settle into true black. */
const Curtain: React.FC = () => {
	const frame = useCurrentFrame();
	const end = TIMELINE.totalFrames;
	const o = interpolate(frame, [end - s(1.6), end - s(0.4)], [0, 1], clamp);
	return o > 0 ? <AbsoluteFill style={{background: '#000', opacity: o}} /> : null;
};

const QaOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1080 - TEXT_BOTTOM - 75, height: 75, outline: '3px dashed cyan'}} />
			<div style={{position: 'absolute', left: 30, top: 24, color: '#0f0', font: '28px monospace'}}>
				{TIMELINE.clips.filter((c) => frame >= c.from && frame < c.to).map((c) => `${c.photos.map((x) => x.id).join('+')} [${c.motion}]`).join('  |  ')} f{frame}
			</div>
		</AbsoluteFill>
	);
};

export const FriendshipTribute: React.FC<FriendshipProps> = (props) => {
	useFonts();
	const frame = useCurrentFrame();
	const total = TIMELINE.totalFrames;
	const photosFrom = TIMELINE.clips[0].from;
	const photosTo = TIMELINE.clips[TIMELINE.clips.length - 1].to;
	const onPhotos = frame >= photosFrom && frame < photosTo;
	const grainOut = interpolate(frame, [total - s(1.2), total - s(0.2)], [1, 0], clamp);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			{onPhotos ? (
				<AbsoluteFill style={{isolation: 'isolate', background: '#000'}}>
					{TIMELINE.clips.map((c) => (
						<PhotoShot key={c.index} clip={c} />
					))}
					<GradeOverlay />
				</AbsoluteFill>
			) : null}
			<Vignette />
			{TIMELINE.transitions.map((t, i) => (
				<LightLeak key={i} event={t} />
			))}
			<Opening p={props} />
			<PhotoText p={props} />
			<Ending p={props} />
			<Dust />
			<Flicker />
			<Grain opacity={GRADE.grain * grainOut} />
			<Curtain />
			{props.qa ? <QaOverlay /> : null}
			{props.music ? (
				<Audio
					src={staticFile(MUSIC.file)}
					volume={(f) =>
						MUSIC.volume *
						interpolate(f, [0, s(MUSIC.fadeInSeconds)], [0, 1], clamp) *
						interpolate(f, [total - s(MUSIC.fadeOutSeconds), total - 1], [1, 0], {...clamp, easing: (x) => x * x * (3 - 2 * x)})
					}
				/>
			) : null}
		</AbsoluteFill>
	);
};
