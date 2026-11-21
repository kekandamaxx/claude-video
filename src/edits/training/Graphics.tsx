import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {EDL} from './edl';
import {C, FONT_DISPLAY, FONT_UI} from '../../lib/theme';
import {clamp, easeIn, pop, shake, window01} from '../../lib/anim';
import {Ball, Check, Display, Pill, RotateIcon} from '../../components/ui';

const {at, seg, segEnd} = EDL;
const start = (id: string) => seg(id).outFrom;

// ---------------------------------------------------------------- key moments (output frames)
export const T = {
	highway: at('hook', 122.84),
	tahan: at('hook', 123.34),
	hookEnd: segEnd('hook'),
	lineup: start('lineup'),
	centerX: at('lineup', 11.72),
	ipan: at('lineup', 12.02),
	ipanX: at('lineup', 12.46),
	engkau: at('lineup', 12.76),
	lineupEnd: segEnd('lineup'),
	board: start('title'),
	attack: at('title', 25.08),
	flow: at('flow', 34.04),
	b45: at('pos45', 42.64),
	luar: at('luar', 47.36),
	belakang: at('jangan', 54.38),
	tarik: at('tarik', 57.48),
	boardEnd: segEnd('tarik'),
	flow3: start('flow3'),
	tengok: at('flow3', 66.16),
	flow3End: segEnd('flow3'),
	drill: start('drill'),
	lagi: start('lagi'),
	lagi1: at('lagi', 82.1),
	lagi2: at('lagi', 82.28),
	lagi3: at('lagi', 82.46),
	drill2: start('drill2'),
	drillEnd: segEnd('drill2'),
	sw: start('switch'),
	sw1: at('switch', 97.71),
	sw2: at('switch', 98.51),
	swEnd: segEnd('switch'),
	rebound: start('rebound'),
	reboundW: at('rebound', 147.25),
	pivot: start('pivot'),
	pivotW: at('pivot', 149.17),
	pivotEnd: segEnd('pivot'),
	brk: start('brk'),
	masuk: at('masuk', 169.67),
	masukEnd: segEnd('masuk'),
	ikut: start('ikut'),
	opt1: at('ikut', 176.29),
	opt2: at('ikut', 176.67),
	opt3: at('ikut', 177.05),
	ikutEnd: segEnd('ikut'),
	improvise: at('improvise', 178.32),
	outro: EDL.cutEnd,
	end: EDL.totalFrames,
};

export const SHAKE_HITS = [T.highway + 1, T.tahan + 1, T.b45 + 1, T.lagi1 + 1, T.lagi3 + 1, T.masuk + 1, T.improvise + 2];

// ---------------------------------------------------------------- zones
// Every face in this clip sits at y 420-1100 (players mid-court, filmed from the sideline);
// graphics use the ceiling band y 262-610, except 'flow3' (a player close to the lens,
// face from y 424) where they stay in y 262-400.
const Band: React.FC<{children: React.ReactNode; h?: number; style?: React.CSSProperties}> = ({children, h = 340, style}) => (
	<div style={{position: 'absolute', left: 80, top: 266, width: 860, height: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, ...style}}>{children}</div>
);

const Stamp: React.FC<{frame: number; at: number; children: React.ReactNode; color?: string; size?: number; rot?: number}> = ({frame, at: a, children, color = C.red, size = 120, rot = -5}) => {
	if (frame < a - 1) return null;
	const k = pop(frame, a - 1, 8, 0.8);
	return (
		<div style={{padding: '2px 30px', border: `9px solid ${color}`, borderRadius: 18, background: 'rgba(255,255,255,0.95)', color, fontFamily: FONT_DISPLAY, fontSize: size, lineHeight: 1.1, letterSpacing: 3, transform: `rotate(${rot}deg) scale(${2 - k})`, opacity: Math.min(1, k * 1.5), boxShadow: '0 14px 30px rgba(0,0,0,0.45)'}}>{children}</div>
	);
};

const LiveBadge: React.FC<{frame: number; label: string; from: number}> = ({frame, label, from}) => {
	const blink = Math.floor((frame - from) / 12) % 2 === 0 ? 1 : 0.35;
	const secs = Math.max(0, frame - from) / 30;
	return (
		<div style={{display: 'flex', gap: 12, alignItems: 'center', transform: `translateY(${(1 - pop(frame, from, 12)) * -50}px)`}}>
			<Pill bg={C.red} style={{fontSize: 30, gap: 10}}>
				<span style={{width: 16, height: 16, borderRadius: 8, background: '#fff', opacity: blink}} />
				Live drill
			</Pill>
			<Pill bg={C.navySoft} style={{fontSize: 30, fontVariantNumeric: 'tabular-nums'}}>{label} · 0:{secs.toFixed(1).padStart(4, '0')}</Pill>
		</div>
	);
};

// ---------------------------------------------------------------- 1. hook: "buka highway"
const Road: React.FC<{frame: number}> = ({frame}) => {
	const k = pop(frame, 0, 12, 0.6);
	const dash = (frame * 14) % 80;
	return (
		<svg width={760} height={120} viewBox="0 0 760 120" style={{transform: `scaleX(${k})`, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))'}}>
			<path d="M60 110 L250 10 L510 10 L700 110 Z" fill="#20242f" stroke={C.gold} strokeWidth={5} />
			<line x1={380} y1={110} x2={380} y2={10} stroke="#fff" strokeWidth={7} strokeDasharray="24 16" strokeDashoffset={-dash} />
			<line x1={220} y1={110} x2={316} y2={10} stroke="#fff" strokeWidth={4} strokeDasharray="16 14" strokeDashoffset={-dash} opacity={0.6} />
			<line x1={540} y1={110} x2={444} y2={10} stroke="#fff" strokeWidth={4} strokeDasharray="16 14" strokeDashoffset={-dash} opacity={0.6} />
		</svg>
	);
};

const Hook: React.FC<{frame: number}> = ({frame}) => {
	if (frame >= T.hookEnd) return null;
	const hk = frame >= T.highway - 2 ? pop(frame, T.highway - 2, 9, 0.7) : 0;
	return (
		<Band>
			<Road frame={frame} />
			<div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: -6}}>
				<Display size={70} style={{opacity: Math.min(1, frame / 4)}}>Buka</Display>
				<Display size={128} color={C.gold} style={{transform: `scale(${hk === 0 ? 0 : 1.6 - 0.6 * hk}) rotate(-3deg)`}}>Highway</Display>
			</div>
			<div style={{position: 'absolute', right: 8, top: 4}}>
				<Stamp frame={frame} at={T.tahan} size={64} rot={8}>TAHAN!</Stamp>
			</div>
		</Band>
	);
};

// ---------------------------------------------------------------- 2. who plays center?
const Chip: React.FC<{frame: number; at: number; label: string; cross?: number; ok?: number}> = ({frame, at: a, label, cross, ok}) => {
	const k = frame >= a - 2 ? pop(frame, a - 2, 10, 0.5) : 0;
	const x = cross !== undefined ? easeIn(frame, cross, 6) : 0;
	const good = ok !== undefined && frame >= ok;
	return (
		<div style={{position: 'relative', transform: `scale(${k * (good ? 1.12 : 1)})`, opacity: 1 - 0.45 * x}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', borderRadius: 16, background: good ? C.gold : C.navySoft, border: `4px solid ${good ? C.navy : 'rgba(255,255,255,0.5)'}`, color: good ? C.navy : C.white, fontFamily: FONT_DISPLAY, fontSize: 64, textTransform: 'uppercase', boxShadow: '0 8px 20px rgba(0,0,0,0.4)'}}>
				{label}
				{good ? <Check size={50} progress={easeIn(frame, ok as number, 8)} /> : null}
			</div>
			<div style={{position: 'absolute', left: -6, top: '46%', width: `${104 * x}%`, height: 11, background: C.red, borderRadius: 6, transform: 'rotate(-8deg)'}} />
		</div>
	);
};

const Lineup: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.lineup || frame >= T.lineupEnd) return null;
	return (
		<Band style={{opacity: window01(frame, T.lineup, T.lineupEnd, 4)}}>
			<Pill bg={C.red} dot style={{fontSize: 34, transform: `scale(${pop(frame, T.lineup, 12)})`}}>Siapa center?</Pill>
			<div style={{display: 'flex', gap: 18}}>
				<Chip frame={frame} at={T.lineup + 1} label="Center" cross={T.centerX} />
				<Chip frame={frame} at={T.ipan} label="Ipan" cross={T.ipanX} />
				<Chip frame={frame} at={T.engkau} label="Engkau" ok={T.engkau + 6} />
			</div>
		</Band>
	);
};

// ---------------------------------------------------------------- 3. tactic board (HyperFrames render, transparent VP9)
const Board: React.FC = () => (
	<Sequence from={T.board} durationInFrames={T.boardEnd - T.board} name="hyperframes:tactic" layout="none">
		<div style={{position: 'absolute', left: 100, top: 268, width: 880 * 0.98, height: 340 * 0.98}}>
			<OffthreadVideo src={staticFile('training/gfx/tactic.webm')} transparent muted style={{width: '100%', height: '100%'}} />
		</div>
	</Sequence>
);

// ---------------------------------------------------------------- 4. flow -> tengok (tight band: face from y 424)
const Flow3: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.flow3 || frame >= T.flow3End) return null;
	const k2 = frame >= T.tengok - 2 ? pop(frame, T.tengok - 2, 10, 0.5) : 0;
	return (
		<Band h={130} style={{flexDirection: 'row', opacity: window01(frame, T.flow3, T.flow3End, 3)}}>
			<Pill bg={C.gold} color={C.navy} style={{fontSize: 44, transform: `scale(${pop(frame, T.flow3 + 1, 10)})`}}>Flow</Pill>
			<svg width={70} height={40} viewBox="0 0 70 40" style={{opacity: k2}}>
				<path d="M4 20 L56 20 M42 6 L60 20 L42 34" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
			<Pill bg={C.navySoft} style={{fontSize: 44, transform: `scale(${k2})`}}>Tengok dulu</Pill>
		</Band>
	);
};

// ---------------------------------------------------------------- 5. drill: live badge + LAGI x3
const Drill: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.drill || frame >= T.drillEnd) return null;
	const out = interpolate(frame, [T.drillEnd - 5, T.drillEnd], [1, 0], clamp);
	const inLagi = frame >= T.lagi && frame < T.drill2 + 10;
	return (
		<Band style={{justifyContent: 'flex-start', paddingTop: 6, opacity: out}}>
			<LiveBadge frame={frame} label="Double pivot" from={T.drill} />
			{inLagi ? (
				<div style={{display: 'flex', gap: 16, marginTop: 30}}>
					{[T.lagi1, T.lagi2, T.lagi3].map((a, i) => {
						const k = frame >= a - 1 ? pop(frame, a - 1, 8, 0.6) : 0;
						return (
							<Display key={i} size={110 + i * 14} color={i === 2 ? C.gold : C.white} style={{transform: `scale(${k}) rotate(${(i - 1) * 5}deg)`}}>
								Lagi!
							</Display>
						);
					})}
				</div>
			) : null}
		</Band>
	);
};

// ---------------------------------------------------------------- 6. switch
const Switch: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.sw || frame >= T.swEnd) return null;
	const spin = interpolate(frame, [T.sw1 - 3, T.sw1 + 8], [0, 360], clamp) + interpolate(frame, [T.sw2 - 3, T.sw2 + 8], [0, 360], clamp);
	const k = pop(frame, T.sw1 - 3, 9, 0.6);
	const sure = frame >= T.sw2 - 2;
	return (
		<Band style={{flexDirection: 'row', gap: 22, opacity: window01(frame, T.sw, T.swEnd, 3)}}>
			<RotateIcon size={150} rotate={spin} />
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6}}>
				<Display size={150} color={C.gold} style={{transform: `scale(${frame >= T.sw1 - 3 ? k : 0})`, transformOrigin: '0 50%'}}>Switch</Display>
				<Pill bg={sure ? C.green : C.navySoft} color={sure ? C.navy : C.white} style={{fontSize: 30, opacity: frame >= T.sw ? 1 : 0}}>
					{sure ? 'Pastikan switch ✓' : 'Bila dah switch…'}
				</Pill>
			</div>
		</Band>
	);
};

// ---------------------------------------------------------------- 7. rebound / ball to the pivot
const Pivot: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.rebound || frame >= T.pivotEnd) return null;
	if (frame < T.pivot) {
		const k = frame >= T.reboundW - 3 ? pop(frame, T.reboundW - 3, 9, 0.6) : 0;
		return (
			<Band style={{opacity: window01(frame, T.rebound, T.pivot + 2, 3)}}>
				<Pill bg={C.navySoft} style={{fontSize: 34, transform: `scale(${pop(frame, T.rebound, 12)})`}}>Cuba try</Pill>
				<Display size={140} color={C.gold} style={{transform: `scale(${k})`}}>Rebound</Display>
			</Band>
		);
	}
	const fly = easeIn(frame, T.pivot + 6, T.pivotW - T.pivot - 6);
	const arrive = frame >= T.pivotW ? pop(frame, T.pivotW, 8, 0.6) : 0;
	return (
		<Band style={{opacity: window01(frame, T.pivot, T.pivotEnd, 3)}}>
			<div style={{position: 'relative', width: 700, height: 200}}>
				<div style={{position: 'absolute', left: 40 + 470 * fly, top: 60 - Math.sin(fly * Math.PI) * 70}}>
					<Ball size={90} rotate={fly * 540} />
				</div>
				<div style={{position: 'absolute', right: 30, top: 30, width: 150, height: 150, borderRadius: 75, background: C.gold, border: `8px solid ${C.navy}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT_DISPLAY, fontSize: 92, color: C.navy, transform: `scale(${1 + 0.25 * arrive * (1 - easeIn(frame, T.pivotW + 6, 8))})`, boxShadow: `0 0 ${40 * arrive}px ${C.gold}`}}>P</div>
				<div style={{position: 'absolute', left: 0, bottom: 0}}>
					<Pill bg={C.navySoft} style={{fontSize: 34}}>Bola tu bola pivot</Pill>
				</div>
			</div>
		</Band>
	);
};

// ---------------------------------------------------------------- 8. game: live badge + MASUK!
const Game: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.brk || frame >= T.masukEnd) return null;
	return (
		<Band style={{justifyContent: 'flex-start', paddingTop: 6, opacity: interpolate(frame, [T.masukEnd - 4, T.masukEnd], [1, 0], clamp)}}>
			<LiveBadge frame={frame} label="Attack" from={T.brk} />
			<div style={{marginTop: 34}}>
				<Stamp frame={frame} at={T.masuk} size={130} color={C.green}>MASUK!</Stamp>
			</div>
		</Band>
	);
};

// ---------------------------------------------------------------- 9. banyak option -> IMPROVISE
const Options: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.ikut || frame >= T.improvise) return null;
	const hdr = frame >= T.opt1 - 2 ? pop(frame, T.opt1 - 2, 10, 0.5) : 0;
	return (
		<Band style={{opacity: interpolate(frame, [T.improvise - 3, T.improvise], [1, 0], clamp)}}>
			<Pill bg={C.navySoft} style={{fontSize: 34, transform: `scale(${pop(frame, T.ikut + 2, 12)})`}}>Pun boleh · jadi ikut</Pill>
			<Display size={96} color={C.gold} style={{transform: `scale(${hdr})`}}>Banyak option</Display>
			<div style={{display: 'flex', gap: 18}}>
				{['A', 'B', 'C', '?'].map((l, i) => {
					const a = [T.opt1, T.opt2, T.opt3, T.opt3 + 6][i];
					const k = frame >= a ? pop(frame, a, 8, 0.5) : 0;
					return (
						<div key={l} style={{width: 92, height: 92, borderRadius: 22, background: i === 3 ? C.red : C.white, color: i === 3 ? C.white : C.navy, fontFamily: FONT_DISPLAY, fontSize: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${k}) rotate(${(i - 1.5) * 6}deg)`, boxShadow: '0 8px 18px rgba(0,0,0,0.4)'}}>{l}</div>
					);
				})}
			</div>
		</Band>
	);
};

const Improvise: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.improvise - 1) return null;
	const letters = 'IMPROVISE'.split('');
	const outro = easeIn(frame, T.outro, 10);
	return (
		<Band>
			<div style={{display: 'flex', transform: `scale(${1 - 0.18 * outro}) translateY(${-30 * outro}px)`}}>
				{letters.map((l, i) => {
					const a = T.improvise - 1 + i * 2;
					const k = frame >= a ? pop(frame, a, 7, 0.5) : 0;
					return (
						<span key={i} style={{fontFamily: FONT_DISPLAY, fontSize: 150, color: C.gold, display: 'inline-block', transform: `translateY(${(1 - k) * -120}px) rotate(${(1 - k) * (i % 2 ? 25 : -25)}deg)`, opacity: Math.min(1, k * 2), textShadow: `0 8px 0 ${C.navy}, 0 14px 34px rgba(0,0,0,0.5)`}}>{l}</span>
					);
				})}
			</div>
			<div style={{display: 'flex', gap: 12, opacity: outro, transform: `scale(${0.8 + 0.2 * outro})`}}>
				<Pill bg={C.gold} color={C.navy} style={{fontSize: 34}}>UMPSA Handball</Pill>
				<Pill bg={C.navySoft} style={{fontSize: 34}}>Attack · Double pivot</Pill>
			</div>
		</Band>
	);
};

export const Graphics: React.FC = () => {
	const frame = useCurrentFrame();
	const sh = shake(frame, SHAKE_HITS, 8, 7);
	// Hard mask at the TikTok/IG safe area (x 60-960, y 250-1440).
	return (
		<AbsoluteFill style={{clipPath: 'inset(250px 120px 480px 60px)'}}>
			<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
				<Hook frame={frame} />
				<Lineup frame={frame} />
				<Board />
				<Flow3 frame={frame} />
				<Drill frame={frame} />
				<Switch frame={frame} />
				<Pivot frame={frame} />
				<Game frame={frame} />
				<Options frame={frame} />
				<Improvise frame={frame} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
