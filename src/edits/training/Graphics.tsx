import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EDL, CALL} from './edl';
import {beat} from './beats';
import {C, FONT_DISPLAY, FONT_UI} from '../../lib/theme';
import {clamp, easeIn, pop, shake, window01} from '../../lib/anim';
import {Ball, Display, Pill, TopZone} from '../../components/ui';

const {seg} = EDL;
const start = (id: string) => seg(id).outFrom;

// ---------------------------------------------------------------- key moments (output frames)
// Sections follow the music: every boundary sits on a beat of the drum bed (beats.ts).
export const T = {
	hook: 0,
	hook2: start('h2'),
	drill: start('a1'),
	coach: start('c1'),
	coach2: start('c2'),
	swap: start('b1'),
	rest: start('r1'),
	rest2: start('r2'),
	build: start('u1'),
	climax: start('x1'),
	hero: start('fin'),
	outro: EDL.cutEnd,
	end: EDL.totalFrames,
	...CALL,
};

// Drill A: one word per bar, on the downbeat.
const DRILL_WORDS = [
	{w: 'Gerak', at: beat(8)},
	{w: 'Hantar', at: beat(12)},
	{w: 'Pindah', at: beat(16)},
	{w: 'Ulang', at: beat(20)},
];

// Drill B: rep counter ticks on every cut.
const REP_CUTS = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'].map(start);

export const SHAKE_HITS = [2, T.hook2, T.coach, T.swapWord + 1, T.satu + 1, T.sekali + 1, T.climax, T.pergi1 + 1, T.pergi2 + 1, T.pergi3 + 1, T.hero];

// ---------------------------------------------------------------- icons
const Eye: React.FC<{size: number; open: number}> = ({size, open}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.45))'}}>
		<path d={`M6 50 Q50 ${50 - 40 * open} 94 50 Q50 ${50 + 40 * open} 6 50 Z`} fill={C.white} stroke={C.navy} strokeWidth="6" strokeLinejoin="round" />
		<circle cx="50" cy="50" r={16 * open} fill={C.navy} />
		<circle cx="56" cy="44" r={5 * open} fill={C.white} />
	</svg>
);

const Arrows: React.FC<{size: number; spin: number}> = ({size, spin}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${spin}deg)`, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))'}}>
		<path d="M20 38 H72" stroke={C.gold} strokeWidth="11" strokeLinecap="round" />
		<path d="M64 22 L84 38 L64 54 Z" fill={C.gold} />
		<path d="M80 66 H28" stroke={C.white} strokeWidth="11" strokeLinecap="round" />
		<path d="M36 50 L16 66 L36 82 Z" fill={C.white} />
	</svg>
);

const Stamp: React.FC<{children: React.ReactNode; k: number; color?: string; size?: number; rot?: number}> = ({children, k, color = C.gold, size = 130, rot = -5}) => (
	<div
		style={{
			padding: '6px 34px',
			border: `9px solid ${color}`,
			borderRadius: 18,
			background: C.navySoft,
			color,
			fontFamily: FONT_DISPLAY,
			fontSize: size,
			letterSpacing: 3,
			transform: `rotate(${rot}deg) scale(${2 - k})`,
			opacity: Math.min(1, k * 1.5),
			boxShadow: '0 14px 30px rgba(0,0,0,0.45)',
			whiteSpace: 'nowrap',
		}}
	>
		{children}
	</div>
);

// ---------------------------------------------------------------- 1. hook: LATIHAN stamp
const Hook: React.FC<{frame: number}> = ({frame}) => {
	if (frame >= T.drill) return null;
	const k = pop(frame, 1, 8, 0.8);
	const sub = frame >= T.hook2 - 2 ? pop(frame, T.hook2 - 2, 11, 0.5) : 0;
	const out = interpolate(frame, [T.drill - 5, T.drill], [1, 0], clamp);
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: out}}>
				<Pill dot style={{opacity: interpolate(frame, [0, 6], [0, 1], clamp)}}>UMPSA Handball · Sesi latihan</Pill>
				<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
					<Ball size={110} rotate={frame * 6} />
					<Display size={150} color={C.gold} style={{transform: `scale(${2 - k})`, opacity: Math.min(1, k * 1.5)}}>Latihan</Display>
				</div>
				<Pill bg={C.gold} color={C.navy} style={{fontSize: 36, transform: `scale(${sub})`}}>Malam ni · Full gas</Pill>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 2. drill A: GERAK / HANTAR / PINDAH / ULANG
const DrillA: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.drill || frame >= T.coach) return null;
	const v = window01(frame, T.drill, T.coach, 4);
	const cur = [...DRILL_WORDS].reverse().find((d) => frame >= d.at) ?? DRILL_WORDS[0];
	const k = pop(frame, cur.at, 9, 0.6);
	const idx = DRILL_WORDS.indexOf(cur);
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: v}}>
				<Pill bg={C.navySoft} style={{transform: `scale(${pop(frame, T.drill, 12)})`}}>Drill 1 · Hantaran</Pill>
				<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
					<Arrows size={120} spin={interpolate(k, [0, 1], [-90, 0])} />
					<Display size={150} color={idx % 2 ? C.white : C.gold} style={{transform: `scale(${k}) translateY(${(1 - k) * 30}px)`, whiteSpace: 'nowrap'}}>
						{cur.w}
					</Display>
				</div>
				<div style={{display: 'flex', gap: 12}}>
					{DRILL_WORDS.map((d, i) => (
						<div key={i} style={{width: 70, height: 12, borderRadius: 6, background: i <= idx ? C.gold : 'rgba(255,255,255,0.3)', boxShadow: `0 3px 0 ${C.navy}`}} />
					))}
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 3. coach watching
const Coach: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.coach || frame >= T.swap) return null;
	const v = window01(frame, T.coach, T.swap, 4);
	const blink = frame % 46 < 4 ? 0.15 : 1;
	const a = pop(frame, T.coach + 1, 10, 0.6);
	const b = frame >= T.coach2 ? pop(frame, T.coach2, 10, 0.5) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: v}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${a})`}}>
					<Eye size={130} open={blink * a} />
					<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
						<Display size={74}>Mata coach</Display>
						<Display size={92} color={C.gold} style={{whiteSpace: 'nowrap'}}>Tak lepas</Display>
					</div>
				</div>
				<Pill bg={C.red} style={{fontSize: 32, transform: `scale(${b})`}}>Setiap gerak diperhati</Pill>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 4. drill B: SWAP + rep counter
const Swap: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.swap || frame >= T.rest) return null;
	const v = window01(frame, T.swap, T.rest, 4);
	const reps = REP_CUTS.filter((f) => frame >= f).length;
	const last = REP_CUTS[reps - 1] ?? T.swap;
	const tick = pop(frame, last, 9, 0.5);
	const s = frame >= T.swapWord - 2 ? pop(frame, T.swapWord - 2, 8, 0.7) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', alignItems: 'center', gap: 34, opacity: v}}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
					<Pill bg={C.navySoft} style={{fontSize: 26}}>Rep</Pill>
					<Display size={170} color={C.gold} style={{transform: `scale(${1.25 - 0.25 * tick})`, lineHeight: 1}}>
						{String(reps).padStart(2, '0')}
					</Display>
				</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start'}}>
					<Pill bg={C.navySoft} style={{transform: `scale(${pop(frame, T.swap, 12)})`}}>Drill 2</Pill>
					{s > 0 ? <Stamp k={s} color={C.white} size={120}>Swap!</Stamp> : <Display size={96}>Tukar posisi</Display>}
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 5. rest: TARIK NAFAS (breathing ring)
const Rest: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.rest || frame >= T.build) return null;
	const v = window01(frame, T.rest, T.build, 5);
	const breath = 0.5 - 0.5 * Math.cos(((frame - T.rest) / 60) * Math.PI * 2);
	const b = frame >= T.rest2 ? pop(frame, T.rest2, 11, 0.5) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', alignItems: 'center', gap: 30, opacity: v}}>
				<div style={{width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
					<div style={{width: 150 * (0.6 + 0.4 * breath), height: 150 * (0.6 + 0.4 * breath), borderRadius: '50%', border: `10px solid ${C.green}`, background: 'rgba(43,227,139,0.18)', boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}} />
				</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start'}}>
					<Pill bg={C.navySoft} style={{transform: `scale(${pop(frame, T.rest, 12)})`}}>Rehat sekejap</Pill>
					<Display size={110} style={{whiteSpace: 'nowrap'}}>Tarik nafas</Display>
					<Pill bg={C.gold} color={C.navy} style={{fontSize: 30, transform: `scale(${b})`}}>Lepas ni sambung</Pill>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 6. build: SATU LAGI -> SEKALI LAGI + energy bar
const Build: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.build || frame >= T.climax) return null;
	const v = window01(frame, T.build, T.climax, 3);
	const fill = interpolate(frame, [T.build, T.climax], [0.35, 1], clamp);
	const second = frame >= T.sekali - 2;
	const k = second ? pop(frame, T.sekali - 2, 8, 0.8) : frame >= T.satu - 2 ? pop(frame, T.satu - 2, 8, 0.8) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: v}}>
				{k > 0 ? (
					<Stamp k={k} color={second ? C.red : C.gold} rot={second ? 4 : -5}>
						{second ? 'Sekali lagi!' : 'Satu lagi!'}
					</Stamp>
				) : (
					<Display size={110}>Jangan slow</Display>
				)}
				<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
					<span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 30, color: C.white, letterSpacing: 3}}>TENAGA</span>
					<div style={{width: 540, height: 30, borderRadius: 15, background: 'rgba(255,255,255,0.25)', border: `4px solid ${C.navy}`, overflow: 'hidden'}}>
						<div style={{width: `${fill * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.red})`}} />
					</div>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 7. climax: PERGI! x3
const Climax: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.climax || frame >= T.hero) return null;
	const v = window01(frame, T.climax, T.hero, 3);
	const hits = [T.pergi1, T.pergi2, T.pergi3];
	const n = hits.filter((h) => frame >= h - 2).length;
	const k = n ? pop(frame, hits[n - 1] - 2, 8, 0.7) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: v}}>
				<Pill bg={C.red} dot style={{transform: `scale(${pop(frame, T.climax, 12)})`}}>Full intensity</Pill>
				{n > 0 ? (
					<Stamp k={k} color={n === 3 ? C.red : C.gold} rot={n % 2 ? -5 : 4} size={140}>
						Pergi!
					</Stamp>
				) : null}
				<div style={{display: 'flex', gap: 14}}>
					{hits.map((h, i) => (
						<div key={i} style={{width: 34, height: 34, borderRadius: 17, background: i < n ? C.gold : 'rgba(255,255,255,0.3)', border: `4px solid ${C.navy}`, transform: `scale(${i < n ? pop(frame, h - 2, 9, 0.4) : 1})`}} />
					))}
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 8. hero shot + end card
const End: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.hero) return null;
	const a = pop(frame, T.hero + 1, 10, 0.6);
	const outro = easeIn(frame, T.outro, 10);
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, transform: `translateY(${-20 * outro}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${a})`}}>
					<Ball size={120} rotate={frame * 4} />
					<div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
						<Display size={80}>Penat hari ni</Display>
						<Display size={96} color={C.gold} style={{whiteSpace: 'nowrap'}}>Kuat esok</Display>
					</div>
				</div>
				<div style={{opacity: outro, transform: `scale(${0.8 + 0.2 * outro})`}}>
					<Pill bg={C.navySoft} dot style={{whiteSpace: 'nowrap'}}>UMPSA Handball · Sesi latihan</Pill>
				</div>
			</div>
		</TopZone>
	);
};

export const Graphics: React.FC = () => {
	const frame = useCurrentFrame();
	const sh = shake(frame, SHAKE_HITS, 10, 7);
	// Hard mask at the TikTok/IG safe area (x 60-960, y 250-1440).
	return (
		<AbsoluteFill style={{clipPath: 'inset(250px 120px 480px 60px)'}}>
			<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
				<Hook frame={frame} />
				<DrillA frame={frame} />
				<Coach frame={frame} />
				<Swap frame={frame} />
				<Rest frame={frame} />
				<Build frame={frame} />
				<Climax frame={frame} />
				<End frame={frame} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
