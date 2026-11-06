import React, {useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {Bokeh, Dust, Flicker, Grain, GradeOverlay, LightLeak, Vignette, WarmDark} from './FilmLook';
import {PhotoShot} from './PhotoShot';
import {ENDING, MUSIC, OPENING, TEXT, TextKey} from './story';
import {FPS, sceneRange, TIMELINE} from './timeline';
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

/** Two centred lines (opening and ending). */
const TwoLines: React.FC<{a: string; b: string; aIn: number; bIn: number; out: number; outDur: number}> = ({a, b, aIn, bIn, out, outDur}) => (
	<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 160px'}}>
		<div style={{display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'center'}}>
			<RevealLine text={a} inAt={aIn} outAt={out} outDur={outDur} size={70} />
			<GoldRule inAt={aIn + 30} outAt={out} outDur={outDur} width={220} />
			<RevealLine text={b} inAt={bIn} outAt={out} outDur={outDur} size={70} />
		</div>
	</AbsoluteFill>
);

const Opening: React.FC<{p: FriendshipProps}> = ({p}) => {
	const frame = useCurrentFrame();
	const r = sceneRange('opening');
	if (frame >= r.to + s(1)) return null;
	const bgIn = interpolate(frame, [0, s(1.2)], [0, 1], clamp);
	const bgOut = interpolate(frame, [r.from + s(OPENING.out), r.to + s(0.6)], [1, 0], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: bgIn * bgOut}}>
				<WarmDark />
				<Bokeh seed="open" opacity={0.85} />
			</AbsoluteFill>
			<TwoLines a={p.open1} b={p.open2} aIn={r.from + s(OPENING.line1In)} bIn={r.from + s(OPENING.line2In)} out={r.from + s(OPENING.out)} outDur={s(OPENING.outDur)} />
		</AbsoluteFill>
	);
};

const Ending: React.FC<{p: FriendshipProps}> = ({p}) => {
	const frame = useCurrentFrame();
	const r = sceneRange('ending');
	if (frame < r.from) return null;
	const E = ENDING;
	const at = (sec: number) => r.from + s(sec);
	// Warm backdrop rises after the last photo, then everything fades to true black before the final card.
	const bg = interpolate(frame, [at(0.6), at(2.4), at(E.out), at(E.out + E.outDur + 0.6)], [0, 1, 1, 0], clamp);
	const finalGlow = interpolate(frame, [at(E.finalIn - 0.4), at(E.finalIn + 2), at(E.finalOut), at(E.finalOut + E.finalOutDur)], [0, 1, 1, 0], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: bg}}>
				<WarmDark />
				<Bokeh seed="end" opacity={0.9} />
			</AbsoluteFill>
			<AbsoluteFill style={{opacity: finalGlow * 0.55, background: 'radial-gradient(ellipse 40% 26% at 50% 50%, rgba(120, 72, 30, 0.55) 0%, rgba(0,0,0,0) 100%)'}} />
			<TwoLines a={p.end1} b={p.end2} aIn={at(E.line1In)} bIn={at(E.line2In)} out={at(E.out)} outDur={s(E.outDur)} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 34, alignItems: 'center', transform: 'translateY(14px)'}}>
					<RevealLine text={p.final} inAt={at(E.finalIn)} outAt={at(E.finalOut)} outDur={s(E.finalOutDur)} size={84} stagger={7} wordDur={44} />
					<GoldRule inAt={at(E.signatureIn - 0.6)} outAt={at(E.finalOut)} outDur={s(E.finalOutDur)} width={300} />
					<Caps text={p.signature} inAt={at(E.signatureIn)} outAt={at(E.finalOut)} outDur={s(E.finalOutDur)} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** Appreciation-scene text over a photo, on a soft scrim in the lower third. */
const PhotoText: React.FC<{p: FriendshipProps}> = ({p}) => {
	const frame = useCurrentFrame();
	const c = TIMELINE.clips.find((cl) => cl.text && frame >= cl.text.from - 2 && frame <= cl.text.to + s(1.4));
	if (!c || !c.text) return null;
	const {from, to} = c.text;
	const scrim = interpolate(frame, [from - s(0.6), from + s(0.8), to, to + s(1.4)], [0, 1, 1, 0], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{opacity: scrim, background: 'linear-gradient(0deg, rgba(8,4,2,0.78) 0%, rgba(8,4,2,0.5) 22%, rgba(8,4,2,0) 44%)'}} />
			<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 92}}>
				<RevealLine text={p[c.text.key as TextKey]} inAt={from} outAt={to} outDur={s(1.2)} size={58} />
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
			<div style={{position: 'absolute', left: 0, right: 0, top: 1080 - 92 - 90, height: 90, outline: '3px dashed cyan'}} />
			<div style={{position: 'absolute', left: 30, top: 24, color: '#0f0', font: '28px monospace'}}>
				{TIMELINE.clips.filter((c) => frame >= c.from && frame < c.to).map((c) => `${c.photo.id} [${c.motion}]`).join('  |  ')} f{frame}
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
						<PhotoShot key={c.photo.id} clip={c} />
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
			<Grain opacity={0.1 * grainOut} />
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
