import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {CAP_TEXT, Cut, CUT_FRAMES, LOOK, SONG} from './config';
import {parseLrc, LyricLine} from './lyrics';
import {CAP, CapClip, coverScale9, FIT_CY, FPS, fullWindow, H, SONG_START, TITLE_BAND, W} from './timeline';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const FONT = 'Montserrat, Arial, sans-serif';
const YELLOW = '#FFD84D';
const filter = `contrast(${LOOK.contrast}) saturate(${LOOK.saturate}) brightness(${LOOK.brightness})`;

export const capcutSchema = z.object({
	title: z.string(),
	final: z.string(),
	signature: z.string(),
	music: z.boolean(),
	/** Lyrics file under public/ (your own timed LRC). Missing file = no lyrics. */
	lyricsFile: z.string(),
});
export type CapcutProps = z.infer<typeof capcutSchema>;
export const capcutDefaults: CapcutProps = {...CAP_TEXT, music: true, lyricsFile: 'friendship/lyrics.lrc'};


/** Beat pulse: a quick scale bump on every beat, bigger on the downbeat (decays in ~6 frames). */
const pulse = (frame: number) => {
	let s = 0;
	for (const b of CAP.beatFrames) {
		const d = frame - b;
		if (d < 0) break;
		if (d > 18) continue;
		s += Math.exp(-d / 5) * (CAP.downFrames.includes(b) ? 0.035 : 0.012);
	}
	return s;
};

/** Transition transforms on the incoming (dir=1) or outgoing (dir=-1) side; p goes 0..1 across its half. */
const cutFx = (cut: Cut, p: number, incoming: boolean) => {
	const e = incoming ? 1 - p : p; // 1 = furthest from rest
	const fast = Easing.in(Easing.cubic)(e);
	switch (cut) {
		case 'zoom':
			return {scale: 1 + 0.35 * fast, blur: 12 * fast, x: 0, rot: 0, opacity: incoming ? interpolate(p, [0, 0.5], [0, 1], clamp) : 1};
		case 'whipLeft':
		case 'whipRight': {
			const dir = cut === 'whipLeft' ? -1 : 1;
			return {scale: 1, blur: 14 * fast, x: (incoming ? -dir : dir) * W * fast, rot: 0, opacity: 1};
		}
		case 'spin':
			return {scale: 1 + 0.3 * fast, blur: 10 * fast, x: 0, rot: (incoming ? -1 : 1) * 25 * fast, opacity: incoming ? interpolate(p, [0, 0.4], [0, 1], clamp) : 1};
		case 'blur':
			return {scale: 1 + 0.06 * e, blur: 18 * e, x: 0, rot: 0, opacity: incoming ? Easing.inOut(Easing.sin)(p) : 1};
		default: // flash, shake: hard cut
			return {scale: 1, blur: 0, x: 0, rot: 0, opacity: 1};
	}
};

const Shot: React.FC<{c: CapClip; frame: number}> = ({c, frame}) => {
	const p = c.photo;
	const t = (frame - c.from) / Math.max(1, c.to - c.from);
	// Slow push in / pull back across the shot, plus the beat pulse.
	const drift = c.zoomIn ? 1 + 0.08 * t : 1.08 - 0.08 * t;
	const z = drift + pulse(frame);
	let fx = {scale: 1, blur: 0, x: 0, rot: 0, opacity: 1};
	const half = (cut: Cut) => Math.max(1, CUT_FRAMES[cut] / 2);
	if (frame < c.start && c.index > 0) fx = cutFx(c.inCut, (frame - c.from) / half(c.inCut), true);
	else if (frame >= c.start && frame < c.start + half(c.inCut) && c.index > 0) fx = cutFx(c.inCut, 1, true);
	if (c.outCut && frame >= c.end) fx = cutFx(c.outCut, (frame - c.end) / half(c.outCut), false);
	if ((c.inCut === 'flash' || c.inCut === 'shake') && frame < c.start) return null;
	if (c.outCut && (c.outCut === 'flash' || c.outCut === 'shake') && frame >= c.end) return null;
	// Shake on arrival.
	let sx = 0;
	let sy = 0;
	if (c.inCut === 'shake' && frame >= c.start && frame < c.start + 14) {
		const d = frame - c.start;
		const a = 26 * Math.exp(-d / 4);
		sx = Math.sin(d * 2.3) * a;
		sy = Math.cos(d * 3.1) * a * 0.6;
	}
	const wrap: React.CSSProperties = {
		opacity: fx.opacity,
		transform: `translate(${(fx.x + sx).toFixed(1)}px, ${sy.toFixed(1)}px) rotate(${fx.rot.toFixed(2)}deg) scale(${fx.scale.toFixed(4)})`,
		filter: fx.blur > 0.3 ? `blur(${fx.blur.toFixed(1)}px)` : undefined,
		overflow: 'hidden',
	};
	if (c.layout === 'full') {
		const win = fullWindow(p, z) ?? fullWindow(p, 1)!;
		const cx = Math.min(win.rx[1], Math.max(win.rx[0], (win.box.x0 + win.box.x1) / 2));
		const cy = Math.min(win.ry[1], Math.max(win.ry[0], (win.box.y0 + win.box.y1) / 2));
		const k = coverScale9(p);
		const w = p.width * k;
		const h = p.height * k;
		return (
			<AbsoluteFill style={wrap}>
				<Img
					src={staticFile(p.src)}
					style={{position: 'absolute', left: 0, top: 0, width: w, height: h, transformOrigin: '0 0', filter,
						transform: `translate(${(W / 2 - cx * w * z).toFixed(2)}px, ${(H / 2 - cy * h * z).toFixed(2)}px) scale(${z.toFixed(5)})`}}
				/>
			</AbsoluteFill>
		);
	}
	const fw = W;
	const fh = (W / p.width) * p.height;
	return (
		<AbsoluteFill style={wrap}>
			<Img
				src={staticFile(p.bg)}
				style={{position: 'absolute', left: (W - (H * 16) / 9) / 2, top: 0, width: (H * 16) / 9, height: H, filter: `${filter} brightness(0.55)`,
					transform: `scale(${(1.1 + 0.05 * t).toFixed(4)})`}}
			/>
			<Img
				src={staticFile(p.src)}
				style={{position: 'absolute', left: 0, top: (c.titled ? FIT_CY.titled : FIT_CY.normal) - fh / 2, width: fw, height: fh, filter, transformOrigin: `50% 50%`,
					transform: `scale(${z.toFixed(5)})`, boxShadow: '0 24px 60px rgba(0,0,0,0.5)'}}
			/>
		</AbsoluteFill>
	);
};

/** White flash peaking on every 'flash' cut. */
const Flash: React.FC<{frame: number}> = ({frame}) => {
	let o = 0;
	for (const c of CAP.clips) {
		if (c.inCut !== 'flash' || c.index === 0) continue;
		o = Math.max(o, interpolate(frame, [c.start - 2, c.start, c.start + 7], [0, 0.85, 0], clamp));
	}
	return o > 0 ? <AbsoluteFill style={{background: '#fff', opacity: o}} /> : null;
};

const strokeText = (px: number): React.CSSProperties => ({
	WebkitTextStroke: `${px}px rgba(0,0,0,0.85)`,
	paintOrder: 'stroke fill',
	textShadow: '0 6px 18px rgba(0,0,0,0.55)',
});

/** Bold pop-in text block (spring overshoot), white with a yellow underline bar. */
const PopText: React.FC<{text: string; at: number; out: number; size: number; y: number; frame: number; sub?: string}> = ({text, at, out, size, y, frame, sub}) => {
	if (frame < at || frame > out + 12) return null;
	const s = spring({frame: frame - at, fps: FPS, config: {damping: 9, mass: 0.6, stiffness: 170}});
	const o = interpolate(frame, [out, out + 10], [1, 0], clamp);
	const bar = interpolate(frame, [at + 8, at + 22], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<div style={{position: 'absolute', left: 60, width: 900, top: y, textAlign: 'center', opacity: o, transform: `scale(${(0.6 + 0.4 * s).toFixed(4)})`, transformOrigin: '50% 30%'}}>
			<div style={{fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.04, color: '#fff', whiteSpace: 'pre-line', letterSpacing: '-0.01em', ...strokeText(8)}}>{text}</div>
			<div style={{margin: '22px auto 0', width: 260 * bar, height: 10, borderRadius: 5, background: YELLOW, boxShadow: '0 4px 12px rgba(0,0,0,0.4)'}} />
			{sub ? <div style={{marginTop: 22, fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: '0.24em', color: YELLOW, ...strokeText(5), opacity: bar}}>{sub}</div> : null}
		</div>
	);
};

/** Music sticker (song title only, shown when SONG.showTitle is on). */
const SongSticker: React.FC<{frame: number}> = ({frame}) => {
	if (!SONG.showTitle) return null;
	const s = spring({frame: frame - 20, fps: FPS, config: {damping: 12}});
	const o = interpolate(frame, [CAP.clips[0].end - 12, CAP.clips[0].end], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', left: 0, right: 120, top: 760, display: 'flex', justifyContent: 'center', opacity: s * o}}>
			<div style={{fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#111', background: YELLOW, borderRadius: 40, padding: '12px 30px', transform: `scale(${s})`}}>{'♪'} {SONG.title}</div>
		</div>
	);
};

/** Karaoke lyrics: current line pops in, a yellow sweep follows the line's time. */
const Lyrics: React.FC<{lines: LyricLine[]; frame: number}> = ({lines, frame}) => {
	const t = frame / FPS;
	const line = lines.find((l) => t >= l.start - 0.15 && t < l.end);
	if (!line) return null;
	const clip = CAP.clips.find((c) => frame >= c.start && frame < c.end) ?? CAP.clips[0];
	const band = clip.lyricBand;
	const inP = spring({frame: frame - Math.round(line.start * FPS), fps: FPS, config: {damping: 11, mass: 0.5, stiffness: 200}});
	const outO = interpolate(t, [line.end - 0.2, line.end], [1, 0], clamp);
	const sweep = interpolate(t, [line.start, line.end - 0.25], [0, 100], clamp);
	const style: React.CSSProperties = {fontFamily: FONT, fontWeight: 800, fontSize: 56, lineHeight: 1.18, textAlign: 'center', ...strokeText(7)};
	return (
		<div style={{position: 'absolute', left: 60, width: 900, top: band.y0, height: band.y1 - band.y0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: outO}}>
			<div style={{position: 'relative', transform: `scale(${(0.85 + 0.15 * inP).toFixed(4)})`}}>
				<div style={{...style, color: '#fff'}}>{line.text}</div>
				<div style={{...style, color: YELLOW, position: 'absolute', inset: 0, clipPath: `inset(0 ${(100 - sweep).toFixed(2)}% 0 0)`}}>{line.text}</div>
			</div>
		</div>
	);
};

const useLyrics = (file: string) => {
	const [lines, setLines] = useState<LyricLine[]>([]);
	const [handle] = useState(() => delayRender('lyrics'));
	useEffect(() => {
		fetch(staticFile(file))
			.then((r) => (r.ok ? r.text() : ''))
			.catch(() => '')
			.then((txt) => {
				setLines(txt ? parseLrc(txt, SONG_START, CAP.totalFrames / FPS) : []);
				continueRender(handle);
			});
	}, [file, handle]);
	return lines;
};

const useFonts = () => {
	const [handle] = useState(() => delayRender('capcut fonts'));
	useEffect(() => {
		Promise.all([document.fonts.load('900 100px Montserrat'), document.fonts.load('800 56px Montserrat')]).finally(() => continueRender(handle));
	}, [handle]);
};

export const CapcutEdit: React.FC<CapcutProps> = ({title, final, signature, music, lyricsFile}) => {
	useFonts();
	const lines = useLyrics(lyricsFile);
	const frame = useCurrentFrame();
	const total = CAP.totalFrames;
	const first = CAP.clips[0];
	const last = CAP.clips[CAP.clips.length - 1];
	const lastMid = Math.round((last.start + last.end) / 2);
	const visible = useMemo(() => CAP.clips, []);
	return (
		<AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
			{visible.filter((c) => frame >= c.from && frame < c.to).map((c) => <Shot key={c.index} c={c} frame={frame} />)}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 70% at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)'}} />
			<Flash frame={frame} />
			<PopText text={title} at={6} out={first.end - 14} size={100} y={TITLE_BAND.y0} frame={frame} />
			<SongSticker frame={frame} />
			<PopText text={final} at={lastMid} out={total - 16} size={88} y={TITLE_BAND.y0} frame={frame} sub={signature} />
			<Lyrics lines={lines} frame={frame} />
			<AbsoluteFill style={{background: '#000', opacity: interpolate(frame, [0, 4, total - 14, total - 1], [1, 0, 0, 1], clamp)}} />
			{music ? (
				<Audio src={staticFile(SONG.file)} volume={(f) => interpolate(f, [total - SONG.fadeOutSeconds * FPS, total - 1], [1, 0], clamp)} />
			) : null}
		</AbsoluteFill>
	);
};
