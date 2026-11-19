import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {EDL} from './edl';
import {C, FONT_DISPLAY, FONT_UI} from '../../lib/theme';
import {clamp, pop, window01} from '../../lib/anim';
import {Display} from '../../components/ui';

// Concept: the drill as a video game. A HUD (level + stamina) runs from the rewind to the
// K.O.; each coach command lands as a game callout; the stamina bar drains with the drill
// and hits 0% when he drops. Every graphic lives in y 260-610, x 70-950 (above all faces,
// inside the TikTok/IG safe area). The HOOK title and GAME OVER card are HyperFrames
// renders (src/edits/gkdrill/hyperframes), layered here as transparent WebM.

const {at, seg, segEnd} = EDL;
const start = (id: string) => seg(id).outFrom;

// ---------------------------------------------------------------- key moments (output frames)
export const T = {
	hookFall: 23, // hook picture starts at 70.00 s; he reaches the floor at 70.75 s
	hookTraining: 22,
	hookLevel: 33,
	hookMalaysia: 39,
	drill: start('drill'),
	go: at('drill', 7.64),
	footwork: at('drill', 8.28),
	laju: at('drill', 9.02),
	depan: at('drill', 9.98),
	belakang: at('drill', 10.34),
	nampak: at('drill', 13.0),
	masalah: at('drill', 14.1),
	split: start('split'),
	splitEnd: segEnd('split'),
	simple: start('simple'),
	tadi: at('simple', 21.88),
	simpleWord: at('simple', 22.56),
	lagi: start('lagi'),
	lagiWord: at('lagi', 31.58),
	footworkSeg: start('footwork'),
	footwork2: at('footwork', 35.5),
	good1: at('footwork', 35.9),
	depan2: at('footwork', 36.7),
	good2: at('footwork', 39.75),
	tukar: at('footwork', 41.48),
	masuk: start('masuk'),
	masuk1: at('masuk', 45.4),
	bawah: start('bawah'),
	bawahWord: at('bawah', 51.04),
	lari: start('lari'),
	lariWord: at('lari', 61.02),
	cepat: at('lari', 61.56),
	tangan: start('tangan'),
	tanganWord: at('tangan', 63.96),
	angkat: at('tangan', 64.5),
	lepas: at('tangan', 66.14),
	ko: start('ko'),
	impact: at('ko', 70.8),
	outro: EDL.cutEnd,
	end: EDL.totalFrames,
};
export const GAMEOVER_AT = T.impact + 21;

export const SHAKE_HITS = [T.hookFall, T.hookLevel + 1, T.lagi + 1, T.masuk1 + 1, T.impact, T.impact + 1];

/** Music gain automation: the bed drops out on the K.O. and comes back under the end card. */
export const musicGain = (f: number) =>
	f < T.impact ? 1 : interpolate(f, [T.impact, T.impact + 3, GAMEOVER_AT + 48, GAMEOVER_AT + 72], [1, 0, 0, 0.8], clamp);

// ---------------------------------------------------------------- stamina model
const STAMINA: [number, number][] = [
	[T.drill, 100],
	[T.splitEnd, 86],
	[T.lagi, 80],
	[segEnd('footwork'), 56],
	[segEnd('masuk'), 44],
	[segEnd('bawah'), 36],
	[segEnd('lari'), 22],
	[T.angkat, 10],
	[T.lepas, 4],
	[T.impact - 1, 3],
	[T.impact + 6, 0],
];
const staminaAt = (f: number) =>
	interpolate(
		f,
		STAMINA.map((s) => s[0]),
		STAMINA.map((s) => s[1]),
		clamp,
	);

const MY_RED = '#CC0001';
const MY_BLUE = '#010066';

// ---------------------------------------------------------------- small parts
const Arrow: React.FC<{size: number; rotate: number; color?: string}> = ({size, rotate, color = C.gold}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${rotate}deg)`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))'}}>
		<path d="M50 6 L92 52 L66 52 L66 94 L34 94 L34 52 L8 52 Z" fill={color} stroke={C.navy} strokeWidth="6" strokeLinejoin="round" />
	</svg>
);

const Feet: React.FC<{size: number; step: number}> = ({size, step}) => (
	<svg width={size * 1.3} height={size} viewBox="0 0 130 100" style={{filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))'}}>
		{[0, 1].map((i) => (
			<g key={i} transform={`translate(${18 + i * 52} ${i === step % 2 ? 0 : 18})`}>
				<ellipse cx="22" cy="44" rx="17" ry="27" fill={C.white} stroke={C.navy} strokeWidth="5" />
				<circle cx="10" cy="11" r="5" fill={C.white} stroke={C.navy} strokeWidth="3" />
				<circle cx="21" cy="7" r="5.5" fill={C.white} stroke={C.navy} strokeWidth="3" />
				<circle cx="32" cy="10" r="5" fill={C.white} stroke={C.navy} strokeWidth="3" />
			</g>
		))}
	</svg>
);

const Bolt: React.FC<{size: number}> = ({size}) => (
	<svg width={size * 0.7} height={size} viewBox="0 0 70 100" style={{filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))'}}>
		<path d="M44 2 L6 58 L32 58 L22 98 L64 38 L38 38 Z" fill={C.gold} stroke={C.navy} strokeWidth="5" strokeLinejoin="round" />
	</svg>
);

const Battery: React.FC<{level: number; color: string; size: number}> = ({level, color, size}) => (
	<svg width={size * 1.8} height={size} viewBox="0 0 180 100">
		<rect x="6" y="14" width="150" height="72" rx="12" fill="rgba(10,22,51,0.85)" stroke={C.white} strokeWidth="8" />
		<rect x="158" y="36" width="16" height="28" rx="4" fill={C.white} />
		<rect x="18" y="26" width={Math.max(0, 126 * level)} height="48" rx="5" fill={color} />
	</svg>
);

/** Simplified Jalur Gemilang: 14 stripes, canton with crescent and 14-point star. */
const Flag: React.FC<{w: number}> = ({w}) => {
	const h = w / 2;
	const star = Array.from({length: 28}, (_, i) => {
		const r = i % 2 === 0 ? 1 : 0.42;
		const a = (Math.PI * i) / 14 - Math.PI / 2;
		return `${(Math.cos(a) * r).toFixed(3)},${(Math.sin(a) * r).toFixed(3)}`;
	}).join(' ');
	return (
		<svg width={w} height={h} viewBox="0 0 280 140" style={{filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))', borderRadius: 6}}>
			{Array.from({length: 14}, (_, i) => (
				<rect key={i} x="0" y={i * 10} width="280" height="10" fill={i % 2 === 0 ? MY_RED : C.white} />
			))}
			<rect x="0" y="0" width="140" height="80" fill={MY_BLUE} />
			<circle cx="58" cy="40" r="28" fill="#FFCC00" />
			<circle cx="66" cy="40" r="24" fill={MY_BLUE} />
			<polygon points={star} fill="#FFCC00" transform="translate(104 40) scale(22)" />
		</svg>
	);
};

/** A command callout in the graphics band: pops in on `from`, out at `to`. */
const Callout: React.FC<{frame: number; from: number; to: number; children: React.ReactNode; top?: number}> = ({frame, from, to, children, top = 372}) => {
	const o = window01(frame, from, to, 3);
	if (o <= 0) return null;
	const k = pop(frame, from, 10, 0.5);
	return (
		<div style={{position: 'absolute', left: 70, top, width: 880, height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, opacity: o, transform: `scale(${0.6 + 0.4 * k}) translateY(${(1 - k) * 30}px)`}}>
			{children}
		</div>
	);
};

const Word: React.FC<{children: React.ReactNode; size?: number; color?: string; tilt?: number}> = ({children, size = 112, color = C.white, tilt = -3}) => (
	<Display size={size} color={color} style={{transform: `rotate(${tilt}deg)`, WebkitTextStroke: `3px ${C.navy}`}}>
		{children}
	</Display>
);

// ---------------------------------------------------------------- HUD
const Hud: React.FC<{frame: number}> = ({frame}) => {
	const vis = window01(frame, T.drill + 24, T.impact + 12, 6);
	if (vis <= 0) return null;
	const s = staminaAt(frame);
	const low = s < 25;
	const crit = s < 12;
	const blink = crit ? (Math.floor(frame / 4) % 2 === 0 ? 1 : 0.35) : 1;
	const color = s > 55 ? C.green : s > 25 ? C.gold : C.red;
	const mys = frame >= T.lagi;
	const lvlPop = mys ? pop(frame, T.lagi + 4, 9, 0.5) : 1;
	const slide = interpolate(frame, [T.drill + 24, T.drill + 34], [24, 0], clamp);
	return (
		<div style={{position: 'absolute', left: 70, top: 266, width: 880, height: 76, display: 'flex', alignItems: 'center', gap: 18, opacity: vis, transform: `translateY(${slide}px)`}}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					height: 64,
					padding: '0 20px',
					borderRadius: 14,
					background: mys ? MY_RED : C.navySoft,
					border: `4px solid ${mys ? C.gold : C.green}`,
					fontFamily: FONT_UI,
					fontWeight: 900,
					fontSize: 28,
					letterSpacing: 2,
					color: C.white,
					transform: `scale(${lvlPop})`,
					transformOrigin: '0% 50%',
					boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
					whiteSpace: 'nowrap',
				}}
			>
				<span style={{color: mys ? C.gold : C.green}}>LVL</span>
				{mys ? 'MALAYSIA' : '1 · SIMPLE'}
			</div>
			<div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 12, height: 64, padding: '0 16px', borderRadius: 14, background: C.navySoft, boxShadow: '0 8px 20px rgba(0,0,0,0.4)'}}>
				<span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 24, letterSpacing: 2, color: low ? C.red : C.white, opacity: blink}}>STAMINA</span>
				<div style={{flex: 1, height: 28, borderRadius: 8, border: `3px solid ${C.white}`, padding: 3, opacity: blink}}>
					<div style={{width: `${s}%`, height: '100%', borderRadius: 4, background: color, boxShadow: `0 0 12px ${color}`}} />
				</div>
				<span style={{width: 76, textAlign: 'right', fontFamily: FONT_DISPLAY, fontSize: 36, color: low ? C.red : C.white, opacity: blink}}>{Math.round(s)}%</span>
			</div>
		</div>
	);
};

// ---------------------------------------------------------------- scenes
const Rewind: React.FC<{frame: number}> = ({frame}) => {
	const d = frame - T.drill;
	if (d < -3 || d > 26) return null;
	const o = interpolate(d, [-3, 0, 18, 26], [0, 1, 1, 0], clamp);
	return (
		<div style={{position: 'absolute', left: 70, top: 300, width: 880, display: 'flex', justifyContent: 'center', opacity: o}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 18, padding: '14px 30px', background: 'rgba(10,22,51,0.8)', borderRadius: 16, border: `4px solid ${C.white}`}}>
				<svg width="76" height="48" viewBox="0 0 76 48">
					<path d="M36 4 L4 24 L36 44 Z M72 4 L40 24 L72 44 Z" fill={C.white} />
				</svg>
				<span style={{fontFamily: FONT_DISPLAY, fontSize: 64, color: C.white, letterSpacing: 3}}>SEBELUM ITU…</span>
			</div>
		</div>
	);
};

/** VHS rewind texture on the picture for the first 26 frames of the drill. */
const RewindTexture: React.FC<{frame: number}> = ({frame}) => {
	const d = frame - T.drill;
	if (d < -3 || d > 26) return null;
	const o = interpolate(d, [-3, 0, 18, 26], [0, 1, 1, 0], clamp);
	const bars = [0.12, 0.31, 0.58, 0.77];
	return (
		<AbsoluteFill style={{opacity: o}}>
			{bars.map((b, i) => (
				<div key={i} style={{position: 'absolute', left: 0, width: 1080, top: (((b * 1920 + d * 55 * (i % 2 ? 1 : -1)) % 1920) + 1920) % 1920, height: 10 + (i % 2) * 8, background: 'rgba(255,255,255,0.22)', mixBlendMode: 'screen'}} />
			))}
			<AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0 2px, rgba(0,0,0,0) 2px 5px)'}} />
		</AbsoluteFill>
	);
};

const SplitMeter: React.FC<{frame: number}> = ({frame}) => {
	const from = T.split + 4;
	const o = window01(frame, from, T.splitEnd, 5);
	if (o <= 0) return null;
	const deg = interpolate(frame, [from + 6, from + 46], [0, 180], {...clamp, easing: (t) => 1 - Math.pow(1 - t, 3)});
	const done = frame >= from + 46;
	const k = pop(frame, from, 10, 0.5);
	const a = Math.PI - (deg * Math.PI) / 180;
	const r = 150;
	return (
		<div style={{position: 'absolute', left: 70, top: 300, width: 880, height: 300, opacity: o, transform: `scale(${0.7 + 0.3 * k})`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 34}}>
			<svg width="360" height="200" viewBox="-180 -180 360 200" style={{filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))'}}>
				<path d={`M ${-r} 0 A ${r} ${r} 0 0 1 ${r} 0`} fill="rgba(10,22,51,0.82)" stroke={C.white} strokeWidth="8" />
				<path d={`M ${-r} 0 A ${r} ${r} 0 0 1 ${(Math.cos(a) * r).toFixed(1)} ${(-Math.sin(a) * r).toFixed(1)}`} fill="none" stroke={done ? C.green : C.gold} strokeWidth="18" strokeLinecap="round" />
				<line x1="0" y1="0" x2={(Math.cos(a) * (r - 24)).toFixed(1)} y2={(-Math.sin(a) * (r - 24)).toFixed(1)} stroke={C.white} strokeWidth="8" strokeLinecap="round" />
				<circle cx="0" cy="0" r="12" fill={C.white} />
			</svg>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingBottom: 14}}>
				<span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: C.white, textShadow: '0 4px 10px rgba(0,0,0,0.6)'}}>SPLIT CHECK</span>
				<Display size={120} color={done ? C.green : C.gold}>
					{Math.round(deg)}°
				</Display>
			</div>
		</div>
	);
};

const Difficulty: React.FC<{n: number; label: string; color: string}> = ({n, label, color}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
		<div style={{display: 'flex', gap: 12}}>
			{[0, 1, 2, 3, 4].map((i) => (
				<div key={i} style={{width: 64, height: 26, borderRadius: 6, background: i < n ? color : 'rgba(255,255,255,0.18)', border: `3px solid ${C.navy}`, boxShadow: i < n ? `0 0 14px ${color}` : undefined}} />
			))}
		</div>
		<span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 30, letterSpacing: 6, color: C.white, textShadow: '0 4px 10px rgba(0,0,0,0.6)'}}>{label}</span>
	</div>
);

const LevelUp: React.FC<{frame: number}> = ({frame}) => {
	const from = T.lagi;
	const to = T.footworkSeg + 40;
	const o = window01(frame, from, to, 4);
	if (o <= 0) return null;
	const k = pop(frame, from, 9, 0.6);
	const k2 = pop(frame, from + 8, 10, 0.5);
	const rays = interpolate(frame, [from, to], [0, 40], clamp);
	return (
		<div style={{position: 'absolute', left: 70, top: 352, width: 880, height: 252, opacity: o, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, overflow: 'hidden', borderRadius: 24}}>
			<div style={{position: 'absolute', inset: 0, background: `repeating-conic-gradient(from ${rays}deg at 50% 50%, rgba(255,199,44,0.22) 0deg 10deg, rgba(255,199,44,0) 10deg 20deg)`}} />
			<div style={{transform: `scale(${k}) rotate(${(1 - k) * -20}deg)`}}>
				<Flag w={230} />
			</div>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', transform: `translateX(${(1 - k2) * 80}px)`, opacity: Math.min(1, k2 * 1.5)}}>
				<Display size={96} color={C.gold} style={{WebkitTextStroke: `3px ${C.navy}`}}>
					LEVEL UP!
				</Display>
				<Display size={60} color={C.white}>
					LVL MALAYSIA
				</Display>
			</div>
		</div>
	);
};

const SpeedLines: React.FC<{frame: number; from: number; to: number}> = ({frame, from, to}) => {
	const o = window01(frame, from, to, 4) * 0.8;
	if (o <= 0) return null;
	const lines = [300, 340, 395, 450, 500, 560, 600];
	return (
		<>
			{lines.map((y, i) => {
				const x = ((frame - from) * (70 + i * 9) + i * 260) % 1400 - 320;
				return <div key={i} style={{position: 'absolute', top: y, left: 70 + Math.max(0, x), width: Math.max(0, Math.min(220, 880 - x)), height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.75)', opacity: o}} />;
			})}
		</>
	);
};

const LowStamina: React.FC<{frame: number}> = ({frame}) => {
	const from = T.tangan;
	const to = T.impact;
	if (frame < from - 2 || frame >= to) return null;
	const s = staminaAt(frame) / 100;
	const blink = Math.floor(frame / 5) % 2 === 0 ? 1 : 0.5;
	const k = pop(frame, from, 10, 0.5);
	return (
		<>
			<div style={{position: 'absolute', left: 70, top: 372, width: 880, height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, transform: `scale(${0.6 + 0.4 * k})`, opacity: Math.min(1, k * 1.5)}}>
				<div style={{opacity: blink}}>
					<Battery level={s} color={C.red} size={92} />
				</div>
				<div style={{display: 'flex', flexDirection: 'column'}}>
					<Display size={92} color={C.red} style={{WebkitTextStroke: `3px ${C.white}`, opacity: blink}}>
						LOW STAMINA
					</Display>
					<span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 30, letterSpacing: 3, color: C.white, textShadow: '0 4px 10px rgba(0,0,0,0.7)'}}>
						{frame >= T.lepas - 2 ? 'STEP: TAK LEPAS' : frame >= T.tanganWord ? 'TANGAN: TAK NAIK' : 'WARNING'}
					</span>
				</div>
			</div>
		</>
	);
};

const KO: React.FC<{frame: number}> = ({frame}) => {
	const from = T.impact;
	const o = window01(frame, from, GAMEOVER_AT + 2, 2);
	if (o <= 0) return null;
	const k = interpolate(frame, [from, from + 4], [1.35, 1], {...clamp, easing: (t) => t * t});
	return (
		<>
			<div style={{position: 'absolute', left: 70, top: 280, width: 880, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: o}}>
				<Display size={250} color={C.red} style={{transform: `scale(${k}) rotate(-6deg)`, WebkitTextStroke: `6px ${C.white}`, textShadow: `0 12px 0 #4A0008, 0 0 40px rgba(255,45,61,0.8)`}}>
					K.O.
				</Display>
			</div>
		</>
	);
};

/** Picture grade: a red edge pulse while stamina runs out (a light effect, not a graphic; left out of overlay QA). */
export const Grade: React.FC = () => {
	const frame = useCurrentFrame();
	const pulse = 0.5 + 0.5 * Math.sin(((frame - T.tangan) / 15) * Math.PI * 2);
	return (
		<AbsoluteFill>
			<RewindTexture frame={frame} />
			{/* K.O. flash */}
			<AbsoluteFill style={{background: '#fff', opacity: interpolate(frame, [T.impact - 0.5, T.impact, T.impact + 5], [0, 0.7, 0], clamp), mixBlendMode: 'screen'}} />
			{frame >= T.tangan - 2 && frame < T.impact ? <AbsoluteFill style={{boxShadow: `inset 0 0 ${120 + 60 * pulse}px rgba(255,20,40,${0.35 + 0.25 * pulse})`}} /> : null}
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------- composition
export const Graphics: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{/* HOOK title: HyperFrames render (hyperframes/hook), timed to the spoken line. */}
			<Sequence from={0} durationInFrames={segEnd('hook')} name="hf:hook" layout="none">
				<AbsoluteFill>
					<OffthreadVideo src={staticFile('gkdrill/hf/hook.webm')} transparent muted style={{width: 1080, height: 1920}} />
				</AbsoluteFill>
			</Sequence>
			<Rewind frame={frame} />
			<Hud frame={frame} />

			{/* LEVEL 1: the easy drill */}
			<Callout frame={frame} from={T.go} to={T.footwork}>
				<Word size={150} color={C.green}>
					GO!
				</Word>
			</Callout>
			<Callout frame={frame} from={T.footwork} to={T.laju}>
				<Feet size={120} step={Math.floor((frame - T.footwork) / 6)} />
				<Word>FOOTWORK</Word>
			</Callout>
			<Callout frame={frame} from={T.laju} to={T.depan}>
				<Bolt size={150} />
				<Word color={C.gold}>LAJU!</Word>
			</Callout>
			<SpeedLines frame={frame} from={T.laju} to={T.depan} />
			<Callout frame={frame} from={T.depan} to={T.belakang}>
				<Arrow size={140} rotate={0} />
				<Word>DEPAN</Word>
			</Callout>
			<Callout frame={frame} from={T.belakang} to={T.belakang + 30}>
				<Arrow size={140} rotate={180} />
				<Word>BELAKANG</Word>
			</Callout>
			<Callout frame={frame} from={T.masalah} to={T.split + 4}>
				<Display size={190} color={C.gold} style={{WebkitTextStroke: `4px ${C.navy}`, transform: `rotate(${Math.sin((frame - T.masalah) / 3) * 6}deg)`}}>
					?
				</Display>
				<Word size={100}>MASALAH DIA</Word>
			</Callout>
			<SplitMeter frame={frame} />
			<Callout frame={frame} from={T.simpleWord - 4} to={T.lagi}>
				<Difficulty n={1} label="TADI: SIMPLE" color={C.green} />
			</Callout>

			{/* LEVEL MALAYSIA */}
			<LevelUp frame={frame} />
			<Callout frame={frame} from={T.footworkSeg + 40} to={T.good1}>
				<Difficulty n={5} label="DIFFICULTY: MAX" color={C.red} />
			</Callout>
			<Callout frame={frame} from={T.good1} to={T.depan2}>
				<Word color={C.green}>GOOD!</Word>
				<Word size={70} color={C.gold} tilt={4}>
					+100
				</Word>
			</Callout>
			<Callout frame={frame} from={T.depan2} to={T.depan2 + 34}>
				<Arrow size={140} rotate={0} />
				<Word>DEPAN</Word>
			</Callout>
			<Callout frame={frame} from={T.good2} to={T.good2 + 30}>
				<Word color={C.green}>GOOD!</Word>
				<Word size={70} color={C.gold} tilt={4}>
					+200
				</Word>
			</Callout>
			<Callout frame={frame} from={T.tukar - 2} to={segEnd('footwork')}>
				<Arrow size={110} rotate={-90} />
				<Word>TUKAR!</Word>
				<Arrow size={110} rotate={90} />
			</Callout>
			<Callout frame={frame} from={T.masuk1 - 1} to={segEnd('masuk')}>
				<Arrow size={110} rotate={90} />
				<Word color={C.gold}>MASUK!</Word>
				<Arrow size={110} rotate={-90} />
			</Callout>
			<Callout frame={frame} from={T.bawahWord - 1} to={segEnd('bawah')}>
				<Arrow size={140} rotate={180} />
				<Word>BAWAH</Word>
			</Callout>
			<Callout frame={frame} from={T.lariWord - 1} to={segEnd('lari')}>
				<Word color={C.gold}>LARI!</Word>
				<Word size={70} tilt={3}>
					{frame >= T.cepat ? 'CEPAT!' : ''}
				</Word>
			</Callout>
			<SpeedLines frame={frame} from={T.lari} to={segEnd('lari')} />
			<LowStamina frame={frame} />
			<KO frame={frame} />

			{/* GAME OVER end card: HyperFrames render (hyperframes/gameover). */}
			<Sequence from={GAMEOVER_AT} durationInFrames={T.end - GAMEOVER_AT} name="hf:gameover" layout="none">
				<AbsoluteFill>
					<OffthreadVideo src={staticFile('gkdrill/hf/gameover.webm')} transparent muted style={{width: 1080, height: 1920}} />
				</AbsoluteFill>
			</Sequence>
		</AbsoluteFill>
	);
};
