import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EDL} from './edl';
import {C, FONT_DISPLAY, FONT_UI} from '../../lib/theme';
import {clamp, pop, window01} from '../../lib/anim';
import {Display, Pill} from '../../components/ui';

// Remotion half of the motion graphics. The hook (0-2 s), the ATTACK -> DEFENSE swap
// (2.6-6.5 s) and the end card are built in HyperFrames (hyperframes/drill) and come in as
// a transparent plate; everything here sits in the gaps between them. All graphics stay in
// the top band (x 70-950, y 260-650): the faces are at y 824-1081 and the captions at y ~720.

const {at, seg, segEnd} = EDL;
const start = (id: string) => seg(id).outFrom;

// ---------------------------------------------------------------- key moments (output frames)
export const T = {
	// hook (HyperFrames)
	lompat: at('hook', 21.4),
	move: at('hook', 22.02),
	// bukan -> defense (HyperFrames)
	attack: at('bukan', 2.56),
	defenseA: at('bukan', 4.04),
	// touch
	touchSeg: start('touch'),
	bola: at('touch', 6.4),
	touchW: at('touch', 7.81),
	patah: at('touch', 8.21),
	touchEnd: segEnd('touch'),
	// jalan, tutup, jalan, tutup, tutup, tutup / lama-lama
	jalanSeg: start('jalan'),
	jalan: at('jalan', 12.29),
	jalan2: at('jalan', 12.84),
	tutups: [at('jalan', 12.55), at('jalan', 12.96), at('jalan', 13.23), at('jalan', 13.57)],
	lama: start('lama'),
	lamaEnd: segEnd('lama'),
	// itu satu
	satuSeg: start('satu'),
	satuW: at('satu', 18.2),
	satuEnd: segEnd('satu'),
	// flow base, korang macam ni
	floorSeg: start('floor'),
	korangF: at('floor', 25.46),
	macamF: at('floor', 25.64),
	floorEnd: segEnd('floor'),
	// sebab itulah korang punya defense kena macam ni
	kenaSeg: start('kena'),
	defK: at('kena', 27.72),
	kenaK: at('kena', 28.38),
	macamK: at('kena', 28.62),
	kenaEnd: segEnd('kena'),
	// itu defense, sebab apa?
	sebabSeg: start('sebab'),
	sebabW: at('sebab', 34.08),
	sebabEnd: segEnd('sebab'),
	// berdua vs defense
	berduaSeg: start('berdua'),
	berduaW: at('berdua', 35.8),
	reverse1: at('berdua', 36.46),
	banyakSeg: start('banyak'),
	defM: at('banyak', 37.48),
	banyak: at('banyak', 37.88),
	reverse2: at('banyak', 38.02),
	outro: EDL.cutEnd,
	end: EDL.totalFrames,
};

export const SHAKE_HITS = [T.lompat + 1, T.attack + 1, T.defenseA + 1, T.satuW + 1, T.sebabW + 1, T.banyak + 1];

const BAND = {left: 70, top: 260, width: 880, height: 390} as const;

const Band: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div style={{position: 'absolute', ...BAND, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style}}>{children}</div>
);

// ---------------------------------------------------------------- icons
const Num: React.FC<{n: string; size: number; bg?: string}> = ({n, size, bg = C.gold}) => (
	<div style={{width: size, height: size, borderRadius: size / 2, background: bg, border: `5px solid ${C.navy}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontSize: size * 0.62, color: C.navy, flexShrink: 0}}>{n}</div>
);

const UTurn: React.FC<{size: number; progress: number}> = ({size, progress}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<path d="M78 86 V42 A26 26 0 0 0 26 42 V70" fill="none" stroke={C.navy} strokeWidth="13" strokeLinecap="round" strokeDasharray="190" strokeDashoffset={190 * (1 - progress)} />
		<path d="M10 58 L26 80 L42 58" fill="none" stroke={C.navy} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" opacity={progress > 0.85 ? 1 : 0} />
	</svg>
);

const Chevrons: React.FC<{frame: number; color: string}> = ({frame, color}) => (
	<svg width={90} height={86} viewBox="0 0 90 86">
		{[0, 1, 2].map((i) => {
			const o = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((frame - i * 4) / 3.2));
			return <path key={i} d={`M10 ${8 + i * 26} L45 ${30 + i * 26} L80 ${8 + i * 26}`} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" opacity={o} />;
		})}
	</svg>
);

const Cross: React.FC<{size: number; p: number}> = ({size, p}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<circle cx="50" cy="50" r="44" fill={C.red} />
		<path d="M32 32 L68 68 M68 32 L32 68" stroke="#fff" strokeWidth="12" strokeLinecap="round" strokeDasharray="52" strokeDashoffset={52 * (1 - p)} />
	</svg>
);

const Tick: React.FC<{size: number; p: number}> = ({size, p}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<circle cx="50" cy="50" r="44" fill={C.green} />
		<path d="M28 52 L44 67 L73 35" fill="none" stroke={C.navy} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - p)} />
	</svg>
);

// ---------------------------------------------------------------- scenes
/** "bila dapat bola je, korang kena TOUCH, korang PATAH BALIK" */
const TouchSteps: React.FC<{f: number}> = ({f}) => {
	const vis = window01(f, T.bola - 3, T.touchEnd + 4, 4);
	if (vis <= 0) return null;
	const pill = pop(f, T.bola - 3, 12);
	const c1 = pop(f, T.touchW - 2, 10);
	const c2 = pop(f, T.patah - 2, 10);
	const ring = interpolate(f, [T.touchW, T.touchW + 12], [0, 1], clamp);
	const turn = interpolate(f, [T.patah, T.patah + 9], [0, 1], clamp);
	const chip = (p: number, from: number): React.CSSProperties => ({
		display: 'flex', alignItems: 'center', gap: 18, padding: '12px 30px 12px 14px', borderRadius: 999, background: C.navySoft, border: `4px solid ${C.gold}`,
		boxShadow: '0 10px 26px rgba(0,0,0,0.45)', opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * from}px) scale(${0.7 + 0.3 * p})`,
	});
	return (
		<Band style={{opacity: vis, justifyContent: 'flex-start', paddingTop: 0, gap: 14}}>
			<Pill style={{opacity: pill, transform: `translateY(${(1 - pill) * -20}px)`}}>Bila dapat bola</Pill>
			<div style={{...chip(c1, -80), position: 'relative'}}>
				<Num n="1" size={84} />
				<span style={{fontFamily: FONT_DISPLAY, fontSize: 92, color: C.white, lineHeight: 1}}>TOUCH</span>
				<div style={{position: 'absolute', left: 14 + 42 - 60, top: '50%', width: 120, height: 120, marginTop: -60, borderRadius: 60, border: `5px solid ${C.gold}`, transform: `scale(${0.7 + ring})`, opacity: 1 - ring}} />
			</div>
			<div style={chip(c2, 80)}>
				<Num n="2" size={84} />
				<span style={{fontFamily: FONT_DISPLAY, fontSize: 92, color: C.gold, lineHeight: 1}}>PATAH BALIK</span>
				<div style={{width: 76, height: 76, borderRadius: 38, background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<UTurn size={60} progress={turn} />
				</div>
			</div>
		</Band>
	);
};

/** "bila jalan, tutup, jalan, tutup, tutup, tutup" + "lama-lama": the word on screen follows
 *  the voice, and two walls close the space around the attacker (white dot) on every "tutup". */
const JalanTutup: React.FC<{f: number}> = ({f}) => {
	const vis = window01(f, T.jalan - 4, T.lamaEnd + 3, 4);
	if (vis <= 0) return null;
	const words = [
		{t: T.jalan, text: 'Jalan'},
		{t: T.tutups[0], text: 'Tutup'},
		{t: T.jalan2, text: 'Jalan'},
		...T.tutups.slice(1).map((t) => ({t, text: 'Tutup'})),
	];
	const cur = [...words].reverse().find((w) => f >= w.t - 2) ?? words[0];
	const wp = pop(f, cur.t - 2, 9);
	const lamaIn = pop(f, T.lama, 12);
	const fill = interpolate(f, [T.lama + 2, T.lamaEnd - 2], [0, 1], {...clamp, easing: (x) => 1 - (1 - x) ** 2});
	// Walls step inward on each "tutup": 4 steps from the edges to the attacker.
	const closed = T.tutups.reduce((a, t) => a + Math.min(1.1, pop(f, t - 2, 10)), 0) / T.tutups.length;
	const TRACK = 680;
	const WALL = 56;
	const travel = TRACK / 2 - WALL - 38;
	const hit = Math.max(0, ...T.tutups.map((t) => interpolate(f, [t - 1, t + 6], [1, 0], clamp) * (f >= t - 1 ? 1 : 0)));
	const tutup = cur.text === 'Tutup';
	const wall = (side: 'l' | 'r'): React.CSSProperties => ({
		position: 'absolute', top: 6, width: WALL, height: 108, borderRadius: 14, background: C.gold, border: `5px solid ${C.navy}`,
		boxShadow: '0 8px 18px rgba(0,0,0,0.45)', [side === 'l' ? 'left' : 'right']: travel * closed,
	});
	return (
		<Band style={{opacity: vis, justifyContent: 'flex-start', paddingTop: 6}}>
			<div style={{position: 'relative', height: 132, width: '100%'}}>
				<Display size={128} color={tutup ? C.gold : C.white} style={{position: 'absolute', width: '100%', textAlign: 'center', opacity: 1 - lamaIn, transform: `scale(${0.7 + 0.3 * wp}) translateY(${-30 * lamaIn}px)`}}>
					{cur.text}
				</Display>
				<Display size={120} color={C.gold} style={{position: 'absolute', width: '100%', textAlign: 'center', opacity: lamaIn, transform: `scale(${0.7 + 0.3 * lamaIn})`}}>
					Lama-lama
				</Display>
			</div>
			<div style={{position: 'relative', width: TRACK, height: 120, marginTop: 10, borderRadius: 20, background: 'rgba(10,22,51,0.72)', border: '3px solid rgba(255,255,255,0.35)', opacity: 1 - 0.4 * lamaIn}}>
				<div style={wall('l')} />
				<div style={wall('r')} />
				<div style={{position: 'absolute', left: TRACK / 2 - 30, top: 30, width: 60, height: 60, borderRadius: 30, background: C.white, border: `5px solid ${C.navy}`, transform: `scale(${1 - 0.15 * hit})`}} />
				<div style={{position: 'absolute', left: TRACK / 2 - 70, top: -10, width: 140, height: 140, borderRadius: 70, border: `5px solid ${C.gold}`, opacity: hit * 0.9, transform: `scale(${1.4 - 0.4 * hit})`}} />
			</div>
			<div style={{width: 680, height: 30, borderRadius: 15, background: C.navySoft, border: `4px solid ${C.white}`, overflow: 'hidden', opacity: lamaIn, marginTop: 14}}>
				<div style={{width: `${fill * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.goldDeep}, ${C.gold})`}} />
			</div>
		</Band>
	);
};

/** "Itu satu." */
const Satu: React.FC<{f: number}> = ({f}) => {
	const vis = window01(f, T.satuSeg, T.satuEnd + 3, 3);
	if (vis <= 0) return null;
	const pill = pop(f, T.satuSeg, 12);
	const stamp = interpolate(f, [T.satuW - 4, T.satuW], [0, 1], clamp);
	const tick = interpolate(f, [T.satuW + 1, T.satuW + 8], [0, 1], clamp);
	return (
		<Band style={{opacity: vis, flexDirection: 'row', gap: 30}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, opacity: pill, transform: `translateX(${(1 - pill) * -60}px)`}}>
				<Pill bg={C.gold} color={C.navy}>Point</Pill>
				<Display size={110}>Itu satu</Display>
			</div>
			<div style={{position: 'relative', opacity: stamp, transform: `scale(${1.5 - 0.5 * stamp}) rotate(${-14 + 8 * stamp}deg)`}}>
				<div style={{width: 230, height: 230, borderRadius: 115, border: `10px solid ${C.gold}`, background: C.navySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px rgba(255,199,44,0.45)`}}>
					<span style={{fontFamily: FONT_DISPLAY, fontSize: 150, color: C.gold, lineHeight: 1}}>01</span>
				</div>
				<div style={{position: 'absolute', right: -14, bottom: -6}}>
					<Tick size={86} p={tick} />
				</div>
			</div>
		</Band>
	);
};

/** "Kalau dia flow base, korang MACAM NI." */
const MacamNi: React.FC<{f: number}> = ({f}) => {
	const vis = window01(f, T.korangF - 3, T.floorEnd + 3, 3);
	if (vis <= 0) return null;
	const k = pop(f, T.korangF - 3, 12);
	const m = pop(f, T.macamF - 1, 9);
	return (
		<Band style={{opacity: vis, justifyContent: 'flex-start', paddingTop: 40, gap: 6}}>
			<Pill style={{opacity: k, transform: `translateY(${(1 - k) * -20}px)`}}>Korang</Pill>
			<Display size={150} color={C.gold} style={{opacity: Math.min(1, m * 1.5), transform: `scale(${1.35 - 0.35 * m})`}}>
				Macam ni
			</Display>
			<div style={{opacity: m, transform: `translateY(${Math.sin(f / 3) * 6}px)`}}>
				<Chevrons frame={f} color={C.gold} />
			</div>
		</Band>
	);
};

/** "Sebab itulah korang punya DEFENSE, KENA MACAM NI." */
const KenaDefense: React.FC<{f: number}> = ({f}) => {
	const vis = window01(f, T.defK - 4, T.kenaEnd + 3, 3);
	if (vis <= 0) return null;
	const d = pop(f, T.defK - 2, 9);
	const k = pop(f, T.kenaK - 1, 11);
	const line = interpolate(f, [T.macamK, T.macamK + 8], [0, 1], clamp);
	const flash = interpolate(f, [T.defK, T.defK + 6], [1, 0], clamp);
	return (
		<Band style={{opacity: vis, gap: 8}}>
			<Display size={160} color={C.gold} style={{opacity: Math.min(1, d * 1.5), transform: `scale(${1.35 - 0.35 * d})`, textShadow: `0 8px 0 ${C.navy}, 0 0 ${40 * flash}px rgba(255,255,255,${flash})`}}>
				Defense
			</Display>
			<div style={{position: 'relative', opacity: k, transform: `translateY(${(1 - k) * 30}px)`}}>
				<Display size={86}>Kena macam ni</Display>
				<div style={{position: 'absolute', left: 0, bottom: -16, height: 12, width: `${line * 100}%`, borderRadius: 6, background: C.gold, boxShadow: `0 4px 0 ${C.navy}`}} />
			</div>
		</Band>
	);
};

/** "Itu defense. SEBAB APA?" */
const SebabApa: React.FC<{f: number}> = ({f}) => {
	const vis = window01(f, T.sebabSeg, T.sebabEnd + 3, 3);
	if (vis <= 0) return null;
	const q = pop(f, T.sebabSeg + 1, 8);
	const s = interpolate(f, [T.sebabW - 3, T.sebabW], [0, 1], clamp);
	const glitch = interpolate(f, [T.sebabW, T.sebabW + 8], [1, 0], clamp);
	const gx = glitch * 14 * Math.sin(f * 2.3);
	const word = (color: string, dx: number, op: number) => (
		<div style={{position: 'absolute', inset: 0, transform: `translateX(${dx}px)`, opacity: op, mixBlendMode: color === C.white ? 'normal' : 'screen'}}>
			<Display size={118} color={color} style={{textShadow: color === C.white ? undefined : 'none'}}>
				Sebab
				<br />
				apa?
			</Display>
		</div>
	);
	return (
		<Band style={{opacity: vis, flexDirection: 'row', gap: 36}}>
			<div style={{fontFamily: FONT_DISPLAY, fontSize: 290, lineHeight: 1, color: C.gold, textShadow: `0 12px 0 ${C.navy}, 0 18px 40px rgba(0,0,0,0.5)`, transform: `scale(${q}) rotate(${(1 - q) * -40 + Math.sin(f / 4) * 4}deg)`}}>?</div>
			<div style={{position: 'relative', width: 330, height: 236, opacity: s, transform: `scale(${1.5 - 0.5 * s})`}}>
				{glitch > 0 ? word('#00E5FF', -gx, 0.8 * glitch) : null}
				{glitch > 0 ? word('#FF2D3D', gx, 0.8 * glitch) : null}
				{word(C.white, 0, 1)}
			</div>
		</Band>
	);
};

/** "Bila korang berdua, korang tak ada reverse. Bila defense, korang banyak reverse." */
const Compare: React.FC<{f: number}> = ({f}) => {
	const vis = window01(f, T.berduaSeg, T.outro + 2, 3);
	if (vis <= 0) return null;
	const l = pop(f, T.berduaSeg, 12);
	const lh = pop(f, T.berduaW - 2, 11);
	const lx = interpolate(f, [T.reverse1 - 1, T.reverse1 + 6], [0, 1], clamp);
	const r = pop(f, T.banyakSeg, 12);
	const rh = pop(f, T.defM - 2, 11);
	const rb = pop(f, T.banyak - 2, 8);
	const rt = interpolate(f, [T.reverse2, T.reverse2 + 7], [0, 1], clamp);
	const dimL = interpolate(f, [T.banyakSeg, T.banyakSeg + 8], [1, 0.5], clamp);
	const glow = 0.5 + 0.5 * Math.sin(f / 3);
	const card = (border: string): React.CSSProperties => ({
		width: 400, height: 324, borderRadius: 28, background: 'rgba(10,22,51,0.9)', border: `6px solid ${border}`, boxShadow: '0 14px 34px rgba(0,0,0,0.5)',
		display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20, gap: 12,
	});
	const head: React.CSSProperties = {fontFamily: FONT_UI, fontWeight: 900, fontSize: 40, letterSpacing: 4, color: C.white};
	return (
		<Band style={{opacity: vis, flexDirection: 'row', gap: 40, alignItems: 'flex-start', paddingTop: 4}}>
			<div style={{...card(C.red), opacity: l * dimL, transform: `translateY(${(1 - l) * 50}px) scale(${0.96 + 0.04 * dimL})`}}>
				<div style={{...head, opacity: lh}}>BERDUA</div>
				<div style={{opacity: lx, transform: `scale(${0.6 + 0.4 * lx})`}}><Cross size={84} p={lx} /></div>
				<div style={{textAlign: 'center', opacity: lx}}>
					<div style={{fontFamily: FONT_UI, fontWeight: 800, fontSize: 30, color: 'rgba(255,255,255,0.8)', letterSpacing: 2}}>TAK ADA</div>
					<div style={{fontFamily: FONT_DISPLAY, fontSize: 70, color: C.white, lineHeight: 1, textDecoration: 'line-through', textDecorationColor: C.red, textDecorationThickness: 8}}>REVERSE</div>
				</div>
			</div>
			<div style={{...card(C.green), opacity: r, transform: `translateY(${(1 - r) * 50}px) scale(${1 + 0.03 * rb})`, boxShadow: `0 14px 34px rgba(0,0,0,0.5), 0 0 ${30 + 30 * glow * rt}px rgba(43,227,139,${0.55 * rt})`}}>
				<div style={{...head, color: C.gold, opacity: rh}}>DEFENSE</div>
				<div style={{opacity: rb, transform: `scale(${0.6 + 0.4 * rb})`}}><Tick size={84} p={rt} /></div>
				<div style={{textAlign: 'center', opacity: rb}}>
					<div style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 30, color: C.green, letterSpacing: 2}}>BANYAK</div>
					<div style={{fontFamily: FONT_DISPLAY, fontSize: 70, color: C.white, lineHeight: 1}}>REVERSE</div>
				</div>
			</div>
		</Band>
	);
};

export const Graphics: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<TouchSteps f={f} />
			<JalanTutup f={f} />
			<Satu f={f} />
			<MacamNi f={f} />
			<KenaDefense f={f} />
			<SebabApa f={f} />
			<Compare f={f} />
		</AbsoluteFill>
	);
};
