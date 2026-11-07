import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import React, {useMemo, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import faces from './faces.json';
import {ClipId, EDL, FPS, Placed, Shot} from './edl';

export const defeatSchema = z.object({
	preview: z.boolean(),
	guides: z.boolean(),
	music: z.boolean(),
	sfx: z.boolean(),
	voice: z.boolean(),
	/** QA passes for scripts/overlap_qa.py: 'faces' = face boxes only, 'overlay' = text only. */
	qa: z.enum(['off', 'faces', 'overlay']).optional(),
});
type Props = z.infer<typeof defeatSchema>;
export const defeatDefaults: Props = {preview: true, guides: false, music: true, sfx: true, voice: true};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const SANS = 'Montserrat, Arial, sans-serif';
const SERIF = '"Cormorant Garamond", Georgia, serif';
const INK = '#ECE7DF';

/** Text bands (full-scale px). Titles: tent ceiling, above every face. Subtitles: below every face. */
const TITLE_CENTER_Y = 425;
const CAPTION_BOTTOM_Y = 1428;

type ShotP = Placed & Shot;
const SHOTS = EDL.placed.filter((p): p is ShotP => p.kind === 'shot');

// ── Picture ──────────────────────────────────────────────────────────────────────────────

const shotOpacity = (s: ShotP, f: number) => {
	const d = s.dissolve ?? s.fadeIn ?? 0;
	const fin = d ? interpolate(f, [0, d], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)}) : 1;
	// The last shot fades to black before the end card.
	const isLast = s === SHOTS[SHOTS.length - 1];
	const fout = isLast ? interpolate(f, [s.len - EDL.fadeOut, s.len], [1, 0], {...clamp, easing: Easing.in(Easing.sin)}) : 1;
	return fin * fout;
};

const zoomAt = (s: ShotP, f: number) => interpolate(f, [0, s.len], s.zoom, {...clamp, easing: Easing.inOut(Easing.sin)});

const ShotView: React.FC<{s: ShotP; preview: boolean}> = ({s, preview}) => {
	const f = useCurrentFrame();
	const src = staticFile(`defeat/video/${s.clip}${preview ? '_proxy' : ''}.mp4`);
	return (
		<AbsoluteFill style={{opacity: shotOpacity(s, f)}}>
			<AbsoluteFill style={{transform: `scale(${zoomAt(s, f)})`, transformOrigin: '50% 50%'}}>
				<OffthreadVideo
					src={src}
					muted
					playbackRate={s.rate}
					trimBefore={Math.round(s.from * FPS)}
					style={{width: '100%', height: '100%', objectFit: 'cover'}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** Documentary grade: cooler, desaturated, deep shadows, tamed tent lights, vignette, grain. */
const Grade: React.FC = () => {
	const frame = useCurrentFrame();
	const g = Math.floor(random(`g-${frame}`) * 12);
	const ox = Math.floor(random(`gx-${frame}`) * 512);
	const oy = Math.floor(random(`gy-${frame}`) * 512);
	return (
		<>
			{/* Cool the shadows, keep skin from going grey. */}
			<AbsoluteFill style={{background: '#16304a', mixBlendMode: 'soft-light', opacity: 0.55}} />
			<AbsoluteFill style={{background: '#3a2a1c', mixBlendMode: 'soft-light', opacity: 0.18}} />
			{/* The tent lights clip to white in every clip: pull the ceiling down so titles sit on it. */}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,7,12,0.78) 0%, rgba(4,7,12,0.62) 18%, rgba(4,7,12,0.30) 30%, rgba(4,7,12,0) 40%, rgba(4,7,12,0) 60%, rgba(4,7,12,0.42) 72%, rgba(4,7,12,0.70) 100%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 62% at 50% 50%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.58) 100%)'}} />
			<AbsoluteFill
				style={{
					backgroundImage: `url(${staticFile(`defeat/grain/g${g}.png`)})`,
					backgroundRepeat: 'repeat',
					backgroundPosition: `${ox}px ${oy}px`,
					mixBlendMode: 'overlay',
					opacity: 0.16,
				}}
			/>
		</>
	);
};

// ── Text ─────────────────────────────────────────────────────────────────────────────────

/** Spaced capitals that settle word by word out of a soft blur, then dissolve as one line. */
const Title: React.FC<{text: string; start: number; end: number}> = ({text, start, end}) => {
	const frame = useCurrentFrame();
	if (frame < start - 1 || frame > end + 1) return null;
	const local = frame - start;
	const len = end - start;
	const out = interpolate(frame, [end - 20, end], [0, 1], {...clamp, easing: Easing.in(Easing.sin)});
	const spacing = interpolate(local, [0, len], [0.24, 0.17], clamp);
	const words = text.split(' ');
	const rule = interpolate(local, [10, 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<div style={{position: 'absolute', left: 60, width: 900, top: TITLE_CENTER_Y - 70, height: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 1 - out, filter: `blur(${out * 6}px)`}}>
			<div style={{fontFamily: SANS, fontWeight: 300, fontSize: 38, whiteSpace: 'nowrap', letterSpacing: `${spacing}em`, color: INK, textAlign: 'center', lineHeight: 1.35, textShadow: '0 2px 18px rgba(0,0,0,0.65)', paddingLeft: `${spacing}em`}}>
				{words.map((w, i) => {
					const p = interpolate(local, [i * 5, i * 5 + 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
					return (
						<span key={i} style={{display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `translateY(${(1 - p) * 12}px)`, marginRight: i < words.length - 1 ? '0.5em' : 0}}>
							{w}
						</span>
					);
				})}
			</div>
			<div style={{marginTop: 22, height: 2, width: 160 * rule, background: 'rgba(236,231,223,0.55)'}} />
		</div>
	);
};

const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const c = EDL.captions.find((x) => frame >= x.start && frame < x.end);
	if (!c) return null;
	const o = Math.min(interpolate(frame, [c.start, c.start + 5], [0, 1], clamp), interpolate(frame, [c.end - 6, c.end], [1, 0], clamp));
	return (
		<div style={{position: 'absolute', left: 150, width: 760, bottom: 1920 - CAPTION_BOTTOM_Y, textAlign: 'center', opacity: o}}>
			<div style={{fontFamily: SANS, fontWeight: 600, fontSize: 42, lineHeight: 1.2, color: '#F4F1EC', textShadow: '0 2px 10px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)'}}>{c.ms}</div>
			<div style={{marginTop: 8, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 38, lineHeight: 1.12, color: 'rgba(226,219,206,0.92)', textShadow: '0 2px 10px rgba(0,0,0,0.85)'}}>{c.en}</div>
		</div>
	);
};

const EndCard: React.FC = () => {
	const frame = useCurrentFrame();
	const local = frame - EDL.cardStart;
	if (local < 0) return null;
	const inP = interpolate(local, [0, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const out = interpolate(frame, [EDL.total - 22, EDL.total - 1], [1, 0], clamp);
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: inP * out}}>
			<div style={{marginTop: -60, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{fontFamily: SANS, fontWeight: 400, fontSize: 34, letterSpacing: `${0.62 - 0.1 * inP}em`, paddingLeft: '0.55em', color: INK}}>UMPSA HANDBALL</div>
				<div style={{marginTop: 26, height: 1.5, width: 120 * inP, background: 'rgba(236,231,223,0.5)'}} />
			</div>
		</AbsoluteFill>
	);
};

// ── Audio ────────────────────────────────────────────────────────────────────────────────

const HIT: Record<string, number> = {bass_hit: 0.06, impact_trailer: 0.92, heartbeat: 0.09, whoosh_cine: 0.71, swoosh_wind: 0.43};

const byId = (id: string) => EDL.placed.find((p) => p.id === id)!;

const buildMix = () => {
	const total = EDL.total;
	// Speech presence 0..1 (8-frame look-ahead, 10-frame release): ducks music, SFX and room.
	const env: number[] = [];
	let cur = 0;
	for (let f = 0; f < total; f++) {
		const tgt = EDL.speech.slice(f, f + 9).some(Boolean) ? 1 : 0;
		cur += (tgt - cur) * (tgt > cur ? 0.45 : 1 / 10);
		env.push(cur);
	}
	const strings = byId('black2').start;
	const music: number[] = [];
	let g = 0;
	for (let f = 0; f < total; f++) {
		// Before the strings: piano stays low. After: lifts in the gaps, still under the voice.
		const [under, gap] = f < strings ? [0.06, 0.34] : [0.06, 0.46];
		const lead = interpolate(f, [4 * FPS, 7 * FPS], [0, 1], clamp);
		const tgt = (under + (gap - under) * (1 - env[f])) * lead;
		g += (tgt - g) * (tgt < g ? 1 / 3 : 1 / 16);
		const xfade = interpolate(f, [EDL.music.outroAt, EDL.music.outroAt + 2 * FPS], [1, 0], clamp);
		music.push(g * xfade);
	}
	// Sub drone: carries the hook, the black frames and the silence; leaves when the strings arrive.
	const k = (id: string, add = 0) => byId(id).start + add;
	const dk: [number, number][] = [
		[0, 0], [12, 0.6], [k('howlost'), 0.5], [k('howlost', 20), 0.12], [k('silence'), 0.2], [k('silence', 12), 0.65],
		[k('sabar', -12), 0.55], [k('sabar'), 0.12], [k('black2', -2), 0.12], [k('black2'), 0.45], [k('makan', 60), 0], [k('team'), 0], [k('team', 30), 0.25], [total - 30, 0.2], [total - 1, 0],
	];
	const drone = Array.from({length: total}, (_, f) => interpolate(f, dk.map((x) => x[0]), dk.map((x) => x[1]), clamp) * (1 - 0.6 * env[f]));
	return {env, music, drone};
};

const SoundTrack: React.FC<{music: boolean; sfx: boolean; voice: boolean}> = ({music, sfx, voice}) => {
	const mix = useMemo(buildMix, []);
	const total = EDL.total;
	return (
		<>
			{voice
				? EDL.voice.map((v) => (
						<Sequence key={v.id} from={v.start} durationInFrames={v.len} layout="none" name={`voice:${v.id}`}>
							<Audio
								src={staticFile(`defeat/audio/${v.clip}.wav`)}
								trimBefore={Math.round(v.srcFrom * FPS)}
								volume={(f) => interpolate(f, [0, v.fadeIn, v.len - v.fadeOut, v.len], [0, 1, 1, 0], clamp) * v.gain}
							/>
						</Sequence>
					))
				: null}
			{/* Slow-motion room (an octave down) under every slow shot: ambience, so it rides the SFX bus. */}
			{sfx
				? SHOTS.filter((s) => s.audio === 'slow').map((s) => (
						<Sequence key={`slow-${s.id}`} from={s.start} durationInFrames={s.len} layout="none" name={`room:${s.id}`}>
							<Audio
								src={staticFile(`defeat/audio/${s.clip}_slow.wav`)}
								trimBefore={Math.round((s.from / s.rate) * FPS)}
								volume={(f) => interpolate(f, [0, 14, s.len - 14, s.len], [0, 1, 1, 0], clamp) * 0.8 * (1 - 0.88 * mix.env[Math.min(s.start + f, total - 1)])}
							/>
						</Sequence>
					))
				: null}
			{sfx ? <Audio src={staticFile('defeat/audio/drone.wav')} volume={(f) => mix.drone[Math.min(f, total - 1)]} /> : null}
			{music ? (
				<>
					<Audio src={staticFile('defeat/audio/music.wav')} trimBefore={Math.round(EDL.music.offset * FPS)} volume={(f) => mix.music[Math.min(f, total - 1)]} />
					<Sequence from={EDL.music.outroAt} layout="none" name="music:outro">
						<Audio
							src={staticFile('defeat/audio/music.wav')}
							trimBefore={Math.round(EDL.music.outroFrom * FPS)}
							volume={(f) => interpolate(f, [0, 2 * FPS], [0, 0.46], clamp) * interpolate(EDL.music.outroAt + f, [total - 2.6 * FPS, total - 1], [1, 0], clamp)}
						/>
					</Sequence>
				</>
			) : null}
			{sfx
				? EDL.sfx.map((c, i) => {
						const start = Math.max(0, c.at - Math.round((HIT[c.sfx] ?? 0) * FPS));
						return (
							<Sequence key={i} from={start} durationInFrames={Math.min(5 * FPS, total - start)} layout="none" name={`sfx:${c.sfx}`}>
								<Audio src={staticFile(`shared/sfx/${c.sfx}.wav`)} volume={(f) => c.vol * (1 - 0.75 * mix.env[Math.min(start + f, total - 1)])} />
							</Sequence>
						);
					})
				: null}
		</>
	);
};

// ── QA: face boxes on the canvas, following each shot's zoom ─────────────────────────────

type Box = [number, number, number, number];
const FACES = faces as unknown as Record<ClipId, [number, Box[]][]>;

const FaceBoxes: React.FC<{s: ShotP; color: string; fill: boolean}> = ({s, color, fill}) => {
	const f = useCurrentFrame();
	const t = s.from + (f / FPS) * s.rate;
	const list = FACES[s.clip];
	const near = list.reduce((a, b) => (Math.abs(b[0] - t) < Math.abs(a[0] - t) ? b : a));
	return (
		<AbsoluteFill style={{transform: `scale(${zoomAt(s, f)})`, transformOrigin: '50% 50%'}}>
			{near[1].map((b, i) => (
				<div key={i} style={{position: 'absolute', left: b[0] - 6, top: b[1] - 6, width: b[2] + 12, height: b[3] + 12, background: fill ? color : undefined, border: fill ? undefined : `3px solid ${color}`}} />
			))}
		</AbsoluteFill>
	);
};

const Guides: React.FC = () => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 250, background: 'rgba(255,0,0,0.18)'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 1440, bottom: 0, background: 'rgba(255,0,0,0.18)'}} />
		<div style={{position: 'absolute', left: 960, right: 0, top: 250, height: 1190, background: 'rgba(255,0,0,0.18)'}} />
		<div style={{position: 'absolute', left: 0, width: 60, top: 250, height: 1190, background: 'rgba(255,0,0,0.18)'}} />
	</AbsoluteFill>
);

const useFonts = () => {
	const [handle] = useState(() => delayRender('fonts'));
	useState(() => {
		Promise.all([document.fonts.load('300 46px Montserrat'), document.fonts.load('600 37px Montserrat'), document.fonts.load('400 34px Montserrat'), document.fonts.load('italic 500 35px "Cormorant Garamond"')])
			.then(() => continueRender(handle))
			.catch(() => continueRender(handle));
		return null;
	});
};

const Text: React.FC = () => (
	<>
		{EDL.titles.map((t, i) => (
			<Title key={i} {...t} />
		))}
		<Captions />
		<EndCard />
	</>
);

export const DefeatEdit: React.FC<Props> = ({preview, guides, music, sfx, voice, qa = 'off'}) => {
	useFonts();
	if (qa !== 'off') {
		return (
			<AbsoluteFill style={{background: '#000'}}>
				{qa === 'faces'
					? SHOTS.map((s) => (
							<Sequence key={s.id} from={s.start} durationInFrames={s.len}>
								<FaceBoxes s={s} color="#fff" fill />
							</Sequence>
						))
					: <Text />}
			</AbsoluteFill>
		);
	}
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{filter: 'saturate(0.6) contrast(1.12) brightness(0.93)'}}>
				{SHOTS.map((s) => (
					<Sequence key={s.id} from={s.start} durationInFrames={s.len} name={`shot:${s.id}`}>
						<ShotView s={s} preview={preview} />
						{guides ? <FaceBoxes s={s} color="#00E5FF" fill={false} /> : null}
					</Sequence>
				))}
			</AbsoluteFill>
			<Grade />
			<Text />
			{guides ? <Guides /> : null}
			<SoundTrack music={music} sfx={sfx} voice={voice} />
		</AbsoluteFill>
	);
};
