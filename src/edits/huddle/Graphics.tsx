import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {EDL} from './edl';
import {C, FONT_DISPLAY, FONT_UI} from '../../lib/theme';
import {clamp, easeIn, pop, shake, window01} from '../../lib/anim';
import {Ball, Check, Display, Pill, TopZone} from '../../components/ui';

const {at, seg, segEnd} = EDL;
const start = (id: string) => seg(id).outFrom;

// ---------------------------------------------------------------- key moments (output frames)
export const T = {
	hook: start('hook'),
	budak: at('hook', 43.38),
	kenaH: at('hook', 43.92),
	three: at('hook', 44.38),
	gol: at('hook', 44.55),
	tau: at('hook', 44.86),
	hookEnd: segEnd('hook'),
	afiq: at('afiq', 31.98),
	okay: at('afiq', 33.24),
	keeper: at('keeper', 33.95),
	syahmi: at('keeper', 34.76),
	captainSeg: start('captain'),
	captainW: at('captain', 36.04),
	simpan: at('captain', 36.46),
	lineupEnd: segEnd('captain'),
	wingSeg: start('wing'),
	wingW: at('wing', 26.1),
	ffSeg: start('fortyfive'),
	ff: at('fortyfive', 28.24),
	posEnd: segEnd('fortyfive'),
	moveSeg: start('move'),
	korang: at('move', 9.62),
	move: at('move', 10.62),
	semua2: at('move', 10.94),
	footwork: at('move', 11.36),
	moveEnd: segEnd('move'),
	basicSeg: start('basic'),
	remember: at('basic', 12.36),
	basic: at('basic', 13.26),
	basicEnd: segEnd('basic'),
	tebukSeg: start('tebuk'),
	tebuk: at('tebuk', 15.14),
	release: at('tebuk', 16.18),
	faham: at('tebuk', 16.64),
	macam: at('tebuk', 17.52),
	tebukEnd: segEnd('tebuk'),
	pressureSeg: start('forty'),
	full: at('forty', 38.76),
	pressure: at('forty', 38.96),
	forty: at('forty', 39.38),
	minit: at('forty', 39.8),
	ingat: at('forty', 40.64),
	fortyEnd: segEnd('forty'),
	mentalSeg: start('mental'),
	tinggal: at('mental', 41.8),
	jangan: at('mental', 42.1),
	mentalW: at('mental', 42.36),
	down: at('mental', 42.62),
	mentalEnd: segEnd('mental'),
	finale: start('menang'),
	boleh: at('menang', 45.64),
	menang: at('menang', 45.86),
	cheer: start('cheer'),
	shout: start('shout'),
	outro: EDL.cutEnd,
	end: EDL.totalFrames,
};

export const SHAKE_HITS = [T.three + 1, T.basic + 1, T.tinggal + 2, T.menang + 2, T.shout + 1];

// Low band used on clip3/clip4, where the coach's face fills y 260-840.
const LOW = {x: 90, y: 900, w: 840, h: 245};
const LowZone: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div style={{position: 'absolute', left: LOW.x, top: LOW.y, width: LOW.w, height: LOW.h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style}}>{children}</div>
);

const glass: React.CSSProperties = {background: 'rgba(10,22,51,0.88)', borderRadius: 26, boxShadow: '0 16px 40px rgba(0,0,0,0.45), inset 0 0 0 3px rgba(255,199,44,0.35)'};

// ---------------------------------------------------------------- icons
const Glove: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<path d="M30 92 V58 L18 44 Q14 36 22 34 L34 46 V16 Q34 9 41 9 Q47 9 47 16 V40 V10 Q47 4 54 4 Q60 4 60 10 V40 V14 Q60 8 66 8 Q72 8 72 14 V42 V22 Q72 16 78 16 Q84 16 84 22 V62 Q84 80 70 92 Z" fill={C.gold} stroke={C.navy} strokeWidth="5" strokeLinejoin="round" />
		<rect x="28" y="78" width="46" height="14" rx="4" fill={C.navy} />
	</svg>
);

const Jersey: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<path d="M34 8 L50 16 L66 8 L92 24 L82 44 L72 40 V92 H28 V40 L18 44 L8 24 Z" fill={C.gold} stroke={C.navy} strokeWidth="5" strokeLinejoin="round" />
		<path d="M40 10 Q50 24 60 10" fill="none" stroke={C.navy} strokeWidth="5" />
	</svg>
);

const Armband: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<rect x="8" y="26" width="84" height="48" rx="12" fill={C.gold} stroke={C.navy} strokeWidth="5" />
		<text x="50" y="65" textAnchor="middle" fontFamily={FONT_DISPLAY} fontSize="40" fill={C.navy}>C</text>
	</svg>
);

const Lock: React.FC<{size: number; closed: number}> = ({size, closed}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<path d={`M30 46 V32 Q30 12 50 12 Q70 12 70 32 V${46 - 14 * (1 - closed)}`} fill="none" stroke={C.white} strokeWidth="9" strokeLinecap="round" transform={`translate(${(1 - closed) * 10} ${-(1 - closed) * 10})`} />
		<rect x="20" y="44" width="60" height="46" rx="10" fill={C.gold} stroke={C.navy} strokeWidth="5" />
		<circle cx="50" cy="64" r="7" fill={C.navy} />
	</svg>
);

const Foot: React.FC<{size: number; flip: boolean}> = ({size, flip}) => (
	<svg width={size} height={size * 1.6} viewBox="0 0 60 96" style={{transform: flip ? 'scaleX(-1)' : undefined}}>
		<ellipse cx="30" cy="58" rx="17" ry="30" fill={C.white} />
		{[0, 1, 2, 3, 4].map((i) => (
			<circle key={i} cx={14 + i * 8} cy={20 - Math.abs(i - 1.2) * 3} r={i === 0 ? 6 : 4.5} fill={C.white} />
		))}
	</svg>
);

const Clipboard: React.FC<{size: number; draw: number}> = ({size, draw}) => (
	<svg width={size} height={size * 1.2} viewBox="0 0 100 120" style={{filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))'}}>
		<rect x="8" y="12" width="84" height="104" rx="10" fill={C.white} stroke={C.navy} strokeWidth="6" />
		<rect x="32" y="4" width="36" height="18" rx="6" fill={C.gold} stroke={C.navy} strokeWidth="5" />
		{[0, 1, 2].map((i) => (
			<g key={i}>
				<circle cx="26" cy={46 + i * 24} r="6" fill={i < Math.round(draw * 3) ? C.green : '#C9D2E3'} />
				<line x1="40" y1={46 + i * 24} x2={40 + 42 * Math.min(1, Math.max(0, draw * 3 - i))} y2={46 + i * 24} stroke={C.navy} strokeWidth="7" strokeLinecap="round" />
			</g>
		))}
	</svg>
);

const Stopwatch: React.FC<{size: number; progress: number}> = ({size, progress}) => {
	const r = 40;
	const len = 2 * Math.PI * r;
	return (
		<svg width={size} height={size} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))'}}>
			<rect x="42" y="2" width="16" height="10" rx="3" fill={C.gold} />
			<circle cx="50" cy="56" r={r + 5} fill={C.navy} stroke={C.white} strokeWidth="5" />
			<circle cx="50" cy="56" r={r - 4} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="8" />
			<circle cx="50" cy="56" r={r - 4} fill="none" stroke={C.gold} strokeWidth="8" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - progress)} transform="rotate(-90 50 56)" />
			<line x1="50" y1="56" x2={50 + 26 * Math.sin(progress * 2 * Math.PI)} y2={56 - 26 * Math.cos(progress * 2 * Math.PI)} stroke={C.white} strokeWidth="5" strokeLinecap="round" />
			<circle cx="50" cy="56" r="5" fill={C.white} />
		</svg>
	);
};

const Battery: React.FC<{level: number; color: string; flicker: number}> = ({level, color, flicker}) => (
	<svg width={300} height={130} viewBox="0 0 300 130" style={{filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))'}}>
		<rect x="6" y="10" width="262" height="110" rx="18" fill={C.navy} stroke={C.white} strokeWidth="8" />
		<rect x="272" y="44" width="20" height="42" rx="6" fill={C.white} />
		{[0, 1, 2, 3, 4].map((i) => (
			<rect key={i} x={22 + i * 48} y="26" width="38" height="78" rx="7" fill={color} opacity={(i < level ? 1 : 0.12) * (i === Math.ceil(level) - 1 ? 1 - flicker : 1)} />
		))}
	</svg>
);

// ---------------------------------------------------------------- HyperFrames overlays (transparent WebM)
const HfOverlay: React.FC<{src: string}> = ({src}) => <OffthreadVideo src={staticFile(src)} transparent muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />;

// ---------------------------------------------------------------- 2-3. line-up: KEEPER SYAHMI, CAPTAIN SIMPAN DULU
const Row: React.FC<{frame: number; at: number; icon: React.ReactNode; label: string; children: React.ReactNode}> = ({frame, at: t, icon, label, children}) => {
	const k = frame >= t ? pop(frame, t, 13, 0.6) : 0;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 22, height: 74, padding: '0 28px', transform: `translateX(${(1 - k) * -120}px)`, opacity: Math.min(1, k * 1.5)}}>
			{icon}
			<div style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 30, letterSpacing: 4, color: C.gold, width: 200}}>{label}</div>
			<div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 14}}>{children}</div>
		</div>
	);
};

const Divider: React.FC<{show: boolean}> = ({show}) => <div style={{height: 3, margin: '0 28px', background: 'rgba(255,255,255,0.12)', opacity: show ? 1 : 0}} />;

const Lineup: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.afiq - 3 || frame >= T.lineupEnd) return null;
	const v = interpolate(frame, [T.lineupEnd - 6, T.lineupEnd], [1, 0], clamp);
	const panel = pop(frame, T.afiq - 3, 14, 0.6);
	const ok = frame >= T.okay - 1 ? pop(frame, T.okay - 1, 10, 0.5) : 0;
	const name = frame >= T.syahmi - 1 ? pop(frame, T.syahmi - 1, 10, 0.5) : 0;
	const lock = frame >= T.simpan ? easeIn(frame, T.simpan, 6) : 0;
	const simpan = frame >= T.simpan + 2 ? pop(frame, T.simpan + 2, 10, 0.5) : 0;
	// Three rows need a taller band than LOW: y 870-1160 (faces end at y ~810 in this take).
	return (
		<LowZone style={{top: 870, height: 290}}>
			<div style={{width: 780, opacity: v, transform: `translateY(${(1 - v) * 30}px)`}}>
				<div style={{display: 'flex', marginBottom: 8, transform: `scale(${panel})`, transformOrigin: 'left center'}}>
					<Pill bg={C.gold} color={C.navy} style={{fontSize: 28, padding: '8px 20px'}}>Line-up</Pill>
				</div>
				<div style={{...glass, padding: '6px 0', transform: `scaleY(${panel})`, transformOrigin: 'top center'}}>
					<Row frame={frame} at={T.afiq - 1} icon={<Jersey size={60} />} label="PLAYER">
						<Display size={64}>Afiq</Display>
						<div style={{transform: `scale(${ok})`, marginLeft: 6}}>
							<Pill bg={C.green} color={C.navy} style={{fontSize: 28, padding: '6px 16px'}}>Okay?</Pill>
						</div>
					</Row>
					<Divider show={frame >= T.keeper - 2} />
					<Row frame={frame} at={T.keeper - 2} icon={<Glove size={60} />} label="KEEPER">
						<Display size={64} style={{transform: `scale(${name})`, transformOrigin: 'left center'}}>Syahmi</Display>
					</Row>
					<Divider show={frame >= T.captainW - 2} />
					<Row frame={frame} at={T.captainW - 2} icon={<Armband size={60} />} label="CAPTAIN">
						<div style={{transform: `scale(${frame >= T.simpan - 2 ? 1 : 0})`}}>
							<Lock size={56} closed={lock} />
						</div>
						<Display size={56} style={{transform: `scale(${simpan})`, transformOrigin: 'left center', whiteSpace: 'nowrap'}}>Simpan dulu</Display>
					</Row>
				</div>
			</div>
		</LowZone>
	);
};

// ---------------------------------------------------------------- 3b. positions: WING KIRI, 45 KIRI (attack shape, goal at the top)
// Seen from behind the attack, so the players' left is the viewer's left.
const SLOTS = [
	{id: 'lw', x: 70, y: 46, label: 'Wing kiri', lx: 40, ly: 80},
	{id: 'lb', x: 210, y: 190, label: '45 kiri', lx: 252, ly: 136},
	{id: 'cb', x: 410, y: 222, label: '', lx: 0, ly: 0},
	{id: 'rb', x: 610, y: 190, label: '', lx: 0, ly: 0},
	{id: 'rw', x: 750, y: 46, label: '', lx: 0, ly: 0},
	{id: 'pv', x: 410, y: 112, label: '', lx: 0, ly: 0},
];

const Positions: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.wingSeg || frame >= T.posEnd) return null;
	const v = interpolate(frame, [T.posEnd - 5, T.posEnd], [1, 0], clamp);
	const inP = pop(frame, T.wingSeg, 13, 0.6);
	const hit = (id: string) => (id === 'lw' ? T.wingW : id === 'lb' ? T.ff : null);
	return (
		// Pinned to the top of the band at 86 %: small background faces reach y ~500 late in clip2.
		<TopZone style={{justifyContent: 'flex-start', paddingTop: 4}}>
			<div style={{position: 'relative', width: 820, height: 280, opacity: v * Math.min(1, inP * 1.5), transform: `scale(${0.86 * (0.9 + 0.1 * inP)})`, transformOrigin: 'top center', ...glass}}>
				<svg width={820} height={280} viewBox="0 0 820 280" style={{position: 'absolute', inset: 0}}>
					<rect x="360" y="0" width="100" height="14" fill="none" stroke={C.white} strokeWidth="5" opacity="0.8" />
					<path d="M 250 0 A 160 120 0 0 0 570 0" fill="none" stroke={C.white} strokeWidth="4" opacity="0.55" />
					<path d="M 170 0 A 240 185 0 0 0 650 0" fill="none" stroke={C.white} strokeWidth="4" strokeDasharray="14 12" opacity="0.35" />
					{SLOTS.map((p) => {
						const t = hit(p.id);
						const on = t !== null && frame >= t - 1;
						const k = on ? pop(frame, (t as number) - 1, 9, 0.6) : 0;
						const ring = on ? interpolate(frame, [(t as number) - 1, (t as number) + 14], [0, 1], clamp) : 0;
						return (
							<g key={p.id} transform={`translate(${p.x} ${p.y})`}>
								{on ? <circle r={26 + 40 * ring} fill="none" stroke={C.gold} strokeWidth={6 * (1 - ring)} opacity={1 - ring} /> : null}
								<circle r={on ? 24 + 6 * k : 20} fill={on ? C.gold : 'rgba(255,255,255,0.28)'} stroke={on ? C.white : C.navy} strokeWidth="5" />
							</g>
						);
					})}
				</svg>
				{SLOTS.filter((p) => p.label).map((p) => {
					const t = hit(p.id) as number;
					const k = frame >= t ? pop(frame, t, 10, 0.5) : 0;
					return (
						<div key={p.id} style={{position: 'absolute', left: p.lx, top: p.ly, transform: `scale(${k})`, transformOrigin: 'left center'}}>
							<Display size={58} color={C.gold} style={{whiteSpace: 'nowrap'}}>{p.label}</Display>
						</div>
					);
				})}
				<div style={{position: 'absolute', right: 26, top: 216}}>
					<Pill bg="rgba(255,255,255,0.14)" style={{fontSize: 26, padding: '6px 16px', boxShadow: 'none'}}>Posisi</Pill>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 4. SEMUA BOLEH MOVE + footwork
const Move: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.moveSeg || frame >= T.moveEnd) return null;
	const v = window01(frame, T.moveSeg, T.moveEnd, 4);
	const l1 = pop(frame, T.korang, 12, 0.5);
	const m = frame >= T.move - 2 ? easeIn(frame, T.move - 2, 7) : 0;
	const mEase = 1 - Math.pow(1 - m, 3);
	const fw = frame >= T.footwork - 1 ? pop(frame, T.footwork - 1, 10, 0.5) : 0;
	const steps = 6;
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: v}}>
				<div style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 46, letterSpacing: 6, color: C.white, textShadow: `0 4px 0 ${C.navy}`, transform: `scale(${l1})`}}>SEMUA BOLEH</div>
				<div style={{position: 'relative', height: 190, display: 'flex', alignItems: 'center'}}>
					{/* Speed lines trail behind MOVE as it whips in from the left. */}
					{[0, 1, 2].map((i) => (
						<div key={i} style={{position: 'absolute', right: 470 + i * 20, top: 50 + i * 38, width: 220 * (1 - m * 0.6), height: 10, borderRadius: 5, background: C.gold, opacity: m > 0 && m < 1 ? 0.8 : interpolate(frame, [T.move + 5, T.move + 12], [0.8, 0], clamp) * (m > 0 ? 1 : 0)}} />
					))}
					<Display size={196} color={C.gold} style={{transform: `translateX(${(1 - mEase) * -520}px) skewX(${(1 - mEase) * -18}deg)`, filter: `blur(${(1 - mEase) * 10}px)`, opacity: m > 0 ? 1 : 0}}>MOVE</Display>
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 18, height: 74}}>
					{Array.from({length: steps}).map((_, i) => {
						const t = T.semua2 + i * 2;
						const s = frame >= t ? pop(frame, t, 10, 0.4) : 0;
						return (
							<div key={i} style={{transform: `translateY(${i % 2 ? 10 : -10}px) rotate(${i % 2 ? 12 : -12}deg) scale(${s})`, opacity: s > 0 ? 0.9 : 0}}>
								<Foot size={30} flip={i % 2 === 1} />
							</div>
						);
					})}
					<div style={{display: 'flex', alignItems: 'center', gap: 10, transform: `scale(${fw})`, marginLeft: 8}}>
						<Pill bg={C.gold} color={C.navy} style={{fontSize: 30}}>Footwork</Pill>
						<Check size={56} progress={frame >= T.footwork + 2 ? easeIn(frame, T.footwork + 2, 6) : 0} />
					</div>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 5. REMEMBER: BASIC (stamp)
const Basic: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.basicSeg || frame >= T.basicEnd) return null;
	const v = window01(frame, T.basicSeg, T.basicEnd, 4);
	const c = pop(frame, T.remember, 12, 0.5);
	const st = frame >= T.basic - 1 ? pop(frame, T.basic - 1, 9, 0.9) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', alignItems: 'center', gap: 40, opacity: v}}>
				<div style={{transform: `scale(${c}) rotate(${(1 - c) * -20}deg)`}}>
					<Clipboard size={150} draw={frame >= T.remember + 4 ? easeIn(frame, T.remember + 4, 20) : 0} />
				</div>
				<div
					style={{
						padding: '6px 34px 2px',
						border: `10px solid ${C.red}`,
						borderRadius: 20,
						background: 'rgba(255,255,255,0.95)',
						color: C.red,
						fontFamily: FONT_DISPLAY,
						fontSize: 150,
						lineHeight: 1,
						letterSpacing: 6,
						transform: `rotate(-6deg) scale(${frame >= T.basic - 1 ? 2.2 - 1.2 * st : 0})`,
						opacity: Math.min(1, st * 2),
						boxShadow: '0 16px 34px rgba(0,0,0,0.45)',
					}}
				>
					BASIC
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 6. tactics board: TEBUK -> RELEASE
const Board: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.tebukSeg || frame >= T.tebukEnd) return null;
	const v = window01(frame, T.tebukSeg, T.tebukEnd, 5);
	const inP = pop(frame, T.tebukSeg, 13, 0.6);
	// Attacker drives into the gap between the two centre defenders on "tebuk".
	const drive = frame >= T.tebuk - 2 ? easeIn(frame, T.tebuk - 2, 11) : 0;
	const d = 1 - Math.pow(1 - drive, 3);
	const collapse = frame >= T.tebuk + 4 ? easeIn(frame, T.tebuk + 4, 9) : 0;
	const A = {x: 410, y: 292 - 128 * d};
	// The pass goes out to the right wing on "release".
	const pass = frame >= T.release - 1 ? easeIn(frame, T.release - 1, 9) : 0;
	const W = {x: 742, y: 74};
	const ball = {x: A.x + (W.x - A.x) * pass, y: A.y + (W.y - A.y) * pass - Math.sin(pass * Math.PI) * 26};
	const tebukL = frame >= T.tebuk ? pop(frame, T.tebuk, 10, 0.5) : 0;
	const relL = frame >= T.release ? pop(frame, T.release, 10, 0.5) : 0;
	const q = frame >= T.faham ? pop(frame, T.faham, 8, 0.6) : 0;
	const wig = frame >= T.macam ? Math.sin((frame - T.macam) * 0.9) * 10 * Math.exp(-(frame - T.macam) / 8) : 0;
	const defenders = [
		{x: 236, y: 102, dx: 0},
		{x: 352, y: 152, dx: 22},
		{x: 468, y: 152, dx: -22},
		{x: 584, y: 102, dx: 0},
	];
	const pathLen = 128;
	const passLen = Math.hypot(W.x - 410, W.y - 164);
	return (
		// Pinned to the top of the band at 86 %: faces rise to y ~570 late in this take as the camera tilts.
		<TopZone style={{justifyContent: 'flex-start', paddingTop: 4}}>
			<div style={{position: 'relative', width: 820, height: 330, opacity: v, transform: `scale(${0.86 * (0.9 + 0.1 * inP)})`, transformOrigin: 'top center', ...glass}}>
				<svg width={820} height={330} viewBox="0 0 820 330" style={{position: 'absolute', inset: 0}}>
					{/* court: goal, 6 m line, dashed 9 m line */}
					<rect x="360" y="0" width="100" height="16" fill="none" stroke={C.white} strokeWidth="5" opacity="0.8" />
					<path d="M 230 0 A 180 150 0 0 0 590 0" fill="none" stroke={C.white} strokeWidth="4" opacity="0.55" />
					<path d="M 150 0 A 260 225 0 0 0 670 0" fill="none" stroke={C.white} strokeWidth="4" strokeDasharray="14 12" opacity="0.35" />
					{/* drive arrow */}
					<line x1="410" y1="292" x2="410" y2={292 - pathLen * d} stroke={C.gold} strokeWidth="10" strokeLinecap="round" opacity={drive > 0 ? 1 : 0} />
					{drive > 0.95 ? <path d="M 394 182 L 410 160 L 426 182 Z" fill={C.gold} /> : null}
					{/* pass arrow (dashed) */}
					<line x1="410" y1="164" x2={410 + (W.x - 410) * pass} y2={164 + (W.y - 164) * pass} stroke={C.white} strokeWidth="7" strokeDasharray="16 12" strokeLinecap="round" opacity={pass > 0 ? 0.95 : 0} />
					{defenders.map((p, i) => (
						<g key={i} transform={`translate(${p.x + p.dx * collapse} ${p.y})`}>
							<circle r="22" fill={C.red} stroke={C.navy} strokeWidth="5" />
							<path d="M -8 -8 L 8 8 M 8 -8 L -8 8" stroke={C.white} strokeWidth="5" strokeLinecap="round" />
						</g>
					))}
					{/* teammates: left wing (static), right wing (receives) */}
					<circle cx="78" cy="74" r="22" fill={C.gold} stroke={C.navy} strokeWidth="5" />
					<circle cx={W.x} cy={W.y} r={22 + (pass >= 1 ? 6 * Math.exp(-(frame - T.release - 8) / 5) : 0)} fill={C.gold} stroke={C.navy} strokeWidth="5" />
					<circle cx={A.x} cy={A.y} r="25" fill={C.gold} stroke={C.white} strokeWidth="6" />
					<text x={A.x} y={A.y + 11} textAnchor="middle" fontFamily={FONT_DISPLAY} fontSize="30" fill={C.navy}>
						A
					</text>
				</svg>
				{pass > 0 && pass < 1 ? (
					<div style={{position: 'absolute', left: ball.x - 20, top: ball.y - 20}}>
						<Ball size={40} rotate={pass * 400} />
					</div>
				) : null}
				<div style={{position: 'absolute', left: 30, top: 22}}>
					<Pill bg="rgba(255,255,255,0.14)" style={{fontSize: 26, padding: '6px 16px', boxShadow: 'none'}}>Taktik</Pill>
				</div>
				<div style={{position: 'absolute', left: 54, top: 226, transform: `scale(${tebukL}) rotate(-4deg)`}}>
					<Display size={84} color={C.gold}>Tebuk</Display>
				</div>
				<div style={{position: 'absolute', right: 40, top: 232, transform: `scale(${relL}) rotate(3deg)`}}>
					<Display size={74}>Release</Display>
				</div>
				<div
					style={{
						position: 'absolute',
						right: 34,
						top: 120,
						width: 74,
						height: 74,
						borderRadius: 37,
						background: C.white,
						color: C.navy,
						fontFamily: FONT_DISPLAY,
						fontSize: 58,
						lineHeight: '74px',
						textAlign: 'center',
						transform: `scale(${q}) rotate(${wig}deg)`,
						boxShadow: `0 6px 0 ${C.navy}`,
					}}
				>
					?
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 7a. MAIN FULL PRESSURE gauge (hands over to the stopwatch on "40")
const Gauge: React.FC<{size: number; value: number}> = ({size, value}) => {
	const a = -120 + 240 * value;
	return (
		<svg width={size} height={size * 0.72} viewBox="0 0 100 72" style={{filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))'}}>
			<path d="M 12 64 A 40 40 0 0 1 88 64" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" strokeLinecap="round" />
			<path d="M 12 64 A 40 40 0 0 1 88 64" fill="none" stroke={C.red} strokeWidth="12" strokeLinecap="round" strokeDasharray="126" strokeDashoffset={126 * (1 - value)} />
			<line x1="50" y1="64" x2={50 + 32 * Math.sin((a * Math.PI) / 180)} y2={64 - 32 * Math.cos((a * Math.PI) / 180)} stroke={C.white} strokeWidth="6" strokeLinecap="round" />
			<circle cx="50" cy="64" r="7" fill={C.white} />
		</svg>
	);
};

const Pressure: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.pressureSeg || frame >= T.forty + 2) return null;
	const k = pop(frame, T.pressureSeg + 1, 12, 0.5);
	const needle = frame >= T.full - 2 ? easeIn(frame, T.full - 2, 9) : 0;
	const n = 1 - Math.pow(1 - needle, 3);
	const wob = needle >= 1 ? Math.sin((frame - T.full) * 1.7) * 0.02 : 0;
	const word = frame >= T.pressure - 1 ? pop(frame, T.pressure - 1, 15, 0.6) : 0;
	const out = interpolate(frame, [T.forty - 2, T.forty + 2], [1, 0], clamp);
	return (
		<LowZone>
			<div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '18px 40px', ...glass, opacity: out, transform: `scale(${k * (1 - 0.15 * (1 - out))})`}}>
				<Gauge size={190} value={Math.min(1, n * 0.97 + wob)} />
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
					<div style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 40, letterSpacing: 10, color: C.white}}>FULL</div>
					<Display size={104} color={C.red} style={{transform: `scale(${word})`, transformOrigin: 'left center', paddingRight: 8}}>Pressure</Display>
				</div>
			</div>
		</LowZone>
	);
};

// ---------------------------------------------------------------- 7. 40 MINIT stopwatch
const Forty: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.forty - 1 || frame >= T.fortyEnd) return null;
	const v = interpolate(frame, [T.fortyEnd - 4, T.fortyEnd], [1, 0], clamp);
	const k = pop(frame, T.forty - 1, 12, 0.5);
	const roll = frame >= T.forty ? easeIn(frame, T.forty, 13) : 0;
	const n = Math.round(40 * (1 - Math.pow(1 - roll, 2)));
	const lab = frame >= T.minit - 1 ? pop(frame, T.minit - 1, 10, 0.5) : 0;
	const pulse = frame >= T.ingat ? 1 + 0.06 * Math.exp(-(frame - T.ingat) / 4) : 1;
	return (
		<LowZone>
			<div style={{display: 'flex', alignItems: 'center', gap: 30, padding: '18px 44px', ...glass, opacity: v, transform: `scale(${k * pulse})`}}>
				<Stopwatch size={170} progress={roll} />
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
					<Display size={150} color={C.gold} style={{fontVariantNumeric: 'tabular-nums', letterSpacing: 4}}>
						{String(n).padStart(2, '0')}:00
					</Display>
					<div style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 38, letterSpacing: 12, color: C.white, transform: `scale(${lab})`, transformOrigin: 'left center'}}>MINIT</div>
				</div>
			</div>
		</LowZone>
	);
};

// ---------------------------------------------------------------- 8. MENTAL battery: drains on "kena tinggal", refills, DOWN struck out
const Mental: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.mentalSeg || frame >= T.mentalEnd) return null;
	const v = interpolate(frame, [T.mentalEnd - 4, T.mentalEnd], [1, 0], clamp);
	const k = pop(frame, T.mentalSeg, 12, 0.5);
	const drain = frame >= T.tinggal ? easeIn(frame, T.tinggal, 7) : 0;
	const charge = frame >= T.mentalW ? easeIn(frame, T.mentalW, 10) : 0;
	const level = 5 - 4 * drain + 4 * charge;
	const low = drain > 0.5 && charge < 0.5;
	const flicker = low ? (Math.floor(frame / 2) % 2) * 0.7 : 0;
	const jit = low ? Math.sin(frame * 3.1) * 6 : 0;
	const jg = frame >= T.jangan - 1 ? pop(frame, T.jangan - 1, 9, 0.6) : 0;
	const dn = frame >= T.down - 1 ? pop(frame, T.down - 1, 10, 0.5) : 0;
	const strike = frame >= T.down + 3 ? easeIn(frame, T.down + 3, 5) : 0;
	return (
		<LowZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: v, transform: `scale(${k})`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 26, transform: `translateX(${jit}px)`}}>
					<Display size={112}>Mental</Display>
					<Battery level={level} color={low ? C.red : C.green} flicker={flicker} />
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 20, height: 92}}>
					<div style={{transform: `scale(${jg}) rotate(-4deg)`}}>
						<Pill bg={C.red} style={{fontSize: 34}}>Jangan</Pill>
					</div>
					<div style={{position: 'relative', transform: `scale(${dn})`}}>
						<Display size={84} color="rgba(255,255,255,0.92)">Down</Display>
						<div style={{position: 'absolute', left: -10, top: 38, height: 12, width: `${(100 + 12) * strike}%`, background: C.red, borderRadius: 6, transform: 'rotate(-8deg)', boxShadow: `0 3px 0 ${C.navy}`}} />
					</div>
				</div>
			</div>
		</LowZone>
	);
};

export const Graphics: React.FC = () => {
	const frame = useCurrentFrame();
	const sh = shake(frame, SHAKE_HITS, 10, 7);
	// Hard mask at the TikTok/IG safe area (x 60-960, y 250-1440).
	return (
		<AbsoluteFill style={{clipPath: 'inset(250px 120px 480px 60px)'}}>
			<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
				<Sequence from={T.hook} durationInFrames={T.hookEnd - T.hook + 8} name="hf:hook" layout="none">
					<HfOverlay src="huddle/hf/hook.webm" />
				</Sequence>
				<Lineup frame={frame} />
				<Positions frame={frame} />
				<Move frame={frame} />
				<Basic frame={frame} />
				<Board frame={frame} />
				<Pressure frame={frame} />
				<Forty frame={frame} />
				<Mental frame={frame} />
				<Sequence from={T.finale} durationInFrames={T.end - T.finale} name="hf:finale" layout="none">
					<HfOverlay src="huddle/hf/finale.webm" />
				</Sequence>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
