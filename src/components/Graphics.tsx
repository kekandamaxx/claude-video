import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {at, CUT_END, seg, TOTAL_FRAMES} from '../lib/edl';
import {C, FONT_DISPLAY, FONT_UI} from '../lib/theme';
import {clamp, easeIn, pop, shake, window01} from '../lib/anim';
import {Ball, Check, Display, Pill, RotateIcon, TopZone} from './ui';

// ---------------------------------------------------------------- key moments
export const T = {
	seven: at('hook', 8.74),
	zero: at('hook', 10.18),
	hookShrink: at('hook', 11.3),
	hookEnd: seg('hook').outFrom + seg('hook').len,
	five: seg('fiveMin').outFrom,
	fiveEnd: seg('fiveMin').outFrom + seg('fiveMin').len,
	syamil: at('syamil', 20.74),
	please: at('syamil', 22.4),
	nampak: at('syamil', 22.98),
	ball1: at('syamil', 23.86),
	ball2: at('syamil', 24.44),
	rotate: at('syamil', 25.44),
	rotateFive: at('syamil', 25.64),
	syamilEnd: seg('syamil').outFrom + seg('syamil').len,
	lineup: seg('lineup').outFrom,
	bukri: at('lineup', 31.02),
	chai: at('lineup', 31.84),
	jason: at('lineup', 32.56),
	ready: at('lineup', 32.96),
	lineupEnd: seg('lineup').outFrom + seg('lineup').len,
	last3: at('last3', 34.6),
	plan: at('last3', 36.0),
	leading: at('last3', 37.16),
	gap: at('last3', 38.98),
	keluar: at('last3', 39.96),
	balik: at('last3', 40.64),
	come1: at('last3', 41.28),
	come2: at('last3', 41.84),
	come3: at('last3', 42.5),
	outro: CUT_END,
	end: TOTAL_FRAMES,
};

/** Frames where the camera and top graphics shake. */
export const SHAKE_HITS = [T.seven + 3, T.zero + 1, T.ready + 2, T.come1 + 1, T.come2 + 1, T.come3 + 1];

// ---------------------------------------------------------------- hook: 7 ATTACK / 0 GOL
const HookStat: React.FC<{frame: number}> = ({frame}) => {
	if (frame >= T.hookEnd) return null;
	const a = pop(frame, T.seven + 2, 9, 0.7);
	const b = pop(frame, T.zero, 8, 0.7);
	const shrink = interpolate(frame, [T.hookShrink, T.hookShrink + 10], [0, 1], clamp);
	const ease = 1 - Math.pow(1 - shrink, 3);
	const s = 1 - 0.45 * ease;
	const tx = -205 * ease;
	const ty = -95 * ease;
	const flash = interpolate(frame, [T.zero, T.zero + 8], [0.9, 0], clamp);
	return (
		<TopZone>
			<div style={{transform: `translate(${tx}px, ${ty}px) scale(${s})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
				<Pill dot style={{opacity: interpolate(frame, [0, 6], [0, 1], clamp)}}>
					Timeout · UMPSA Handball
				</Pill>
				<div style={{display: 'flex', alignItems: 'flex-end', gap: 26}}>
					<div style={{textAlign: 'center', transform: `scale(${0.4 + 0.6 * a})`, opacity: Math.min(1, a * 2), filter: `blur(${(1 - a) * 8}px)`}}>
						<Display size={210} color={C.gold}>7</Display>
						<Pill bg={C.gold} color={C.navy} style={{fontSize: 30, marginTop: 6}}>Kali attack</Pill>
					</div>
					<Display size={150} style={{opacity: a, transform: 'skewX(-12deg)', marginBottom: 70}}>/</Display>
					<div style={{textAlign: 'center', transform: `scale(${frame < T.zero ? 0 : 0.3 + 0.7 * b}) rotate(${(1 - b) * -12}deg)`, opacity: frame < T.zero ? 0 : 1}}>
						<Display size={210} color={C.red} style={{textShadow: `0 10px 0 ${C.navy}, 0 0 ${40 * flash}px rgba(255,45,61,${flash})`}}>0</Display>
						<Pill bg={C.red} style={{fontSize: 30, marginTop: 6}}>Gol</Pill>
					</div>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 05:00 scoreboard clock
const Clock: React.FC<{frame: number; from: number; to: number; minutes: number; label: string; color: string; size?: number}> = ({frame, from, to, minutes, label, color, size = 190}) => {
	if (frame < from || frame >= to) return null;
	const p = pop(frame, from, 10, 0.6);
	const v = window01(frame, from, to, 4);
	const elapsed = Math.floor((frame - from) / 30);
	const total = minutes * 60 - elapsed;
	const mm = String(Math.floor(total / 60)).padStart(2, '0');
	const ss = String(total % 60).padStart(2, '0');
	const blink = Math.floor((frame - from) / 8) % 2 === 0 ? 1 : 0.35;
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: v, transform: `scale(${1.5 - 0.5 * p})`, filter: `blur(${(1 - p) * 6}px)`}}>
				<Pill bg={color} color={color === C.gold ? C.navy : C.white}>{label}</Pill>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						padding: '6px 40px 14px',
						borderRadius: 28,
						background: 'linear-gradient(180deg, #111C3D 0%, #050A1C 100%)',
						border: `6px solid ${color}`,
						boxShadow: `0 0 40px ${color}88, inset 0 0 30px rgba(0,0,0,0.6)`,
					}}
				>
					<span style={{fontFamily: FONT_DISPLAY, fontSize: size, color: C.white, lineHeight: 1, fontVariantNumeric: 'tabular-nums', textShadow: `0 0 24px ${color}`}}>
						{mm}
						<span style={{opacity: blink}}>:</span>
						{ss}
					</span>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- SYAMIL call-out
const CoachCall: React.FC<{frame: number}> = ({frame}) => {
	const from = T.syamil - 2;
	const to = T.nampak;
	if (frame < from || frame >= to) return null;
	const p = pop(frame, from, 12, 0.6);
	const v = window01(frame, from, to, 4);
	const plead = pop(frame, T.please, 7, 0.4);
	const pulse = frame >= T.please ? 1 + 0.08 * Math.sin(Math.min(1, plead) * Math.PI) : 1;
	return (
		<TopZone>
			<div style={{opacity: v, transform: `translateX(${(1 - p) * -500}px) skewX(${(1 - p) * -14}deg) scale(${pulse})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12}}>
				<Pill bg={C.gold} color={C.navy}>Coach call</Pill>
				<Display size={190}>Syamil</Display>
				<div style={{height: 14, width: 420 * easeIn(frame, from + 4, 10), background: C.gold, borderRadius: 7, boxShadow: `0 6px 0 ${C.navy}`}} />
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 1 biji / 2 biji target
const Target: React.FC<{frame: number}> = ({frame}) => {
	const from = T.nampak;
	const to = T.rotate;
	if (frame < from || frame >= to) return null;
	const v = window01(frame, from, to, 4);
	const b1 = frame >= T.ball1 ? pop(frame, T.ball1, 8, 0.5) : 0;
	const b2 = frame >= T.ball2 ? pop(frame, T.ball2, 8, 0.5) : 0;
	const ball = (k: number, label: string) => (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, transform: `scale(${k})`, opacity: k > 0 ? 1 : 0}}>
			<Ball size={170} rotate={(1 - k) * -180} />
			<Pill bg={C.navySoft} style={{fontSize: 34}}>{label}</Pill>
		</div>
	);
	return (
		<TopZone>
			<div style={{opacity: v, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
				<Pill bg={C.gold} color={C.navy} style={{transform: `scale(${pop(frame, from, 12)})`}}>Target</Pill>
				<div style={{display: 'flex', gap: 70}}>
					{ball(b1, '1 biji lagi')}
					{ball(b2, '2 biji lagi')}
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- ROTATE + 5 MIN
const Rotate: React.FC<{frame: number}> = ({frame}) => {
	const from = T.rotate - 1;
	const to = T.syamilEnd;
	if (frame < from || frame >= to) return null;
	const p = pop(frame, from, 10, 0.5);
	const spin = interpolate(frame, [from, from + 14], [-200, 0], clamp);
	const chip = frame >= T.rotateFive ? pop(frame, T.rotateFive, 10, 0.5) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', alignItems: 'center', gap: 26, transform: `scale(${p})`}}>
				<RotateIcon size={170} rotate={spin} />
				<div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
					<Display size={140}>Rotate</Display>
					<Pill bg={C.red} style={{transform: `scale(${chip})`, alignSelf: 'flex-start'}}>05:00 lagi</Pill>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- LINEUP + READY stamp
const Lineup: React.FC<{frame: number}> = ({frame}) => {
	const from = T.lineup;
	const to = T.lineupEnd;
	if (frame < from || frame >= to) return null;
	const names: [string, number][] = [['Bukri', T.bukri], ['Chai', T.chai], ['Jason', T.jason]];
	const stamp = frame >= T.ready ? pop(frame, T.ready, 9, 0.8) : 0;
	return (
		<TopZone style={{justifyContent: 'flex-start'}}>
			<div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: 12, width: 620}}>
				<Pill bg={C.gold} color={C.navy} style={{alignSelf: 'flex-start', transform: `scale(${pop(frame, from, 12)})`}}>Masuk · Lineup</Pill>
				{names.map(([n, t], i) => {
					const k = frame >= t - 1 ? pop(frame, t - 1, 12, 0.5) : 0;
					return (
						<div
							key={n}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 22,
								height: 84,
								padding: '0 26px',
								borderRadius: 16,
								background: C.navySoft,
								borderLeft: `14px solid ${C.gold}`,
								boxShadow: '0 10px 26px rgba(0,0,0,0.35)',
								transform: `translateX(${(1 - k) * -720}px)`,
								opacity: k > 0.02 ? 1 : 0,
							}}
						>
							<span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 30, color: C.gold}}>0{i + 1}</span>
							<span style={{fontFamily: FONT_DISPLAY, fontSize: 70, color: C.white, letterSpacing: 2, textTransform: 'uppercase'}}>{n}</span>
						</div>
					);
				})}
				<div
					style={{
						position: 'absolute',
						right: -40,
						top: 120,
						padding: '4px 28px',
						border: `9px solid ${C.red}`,
						borderRadius: 18,
						color: C.red,
						fontFamily: FONT_DISPLAY,
						fontSize: 120,
						letterSpacing: 4,
						background: 'rgba(255,255,255,0.92)',
						transform: `rotate(-10deg) scale(${frame >= T.ready ? 2.2 - 1.2 * stamp : 0})`,
						opacity: frame >= T.ready ? Math.min(1, stamp * 1.5) : 0,
						boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
					}}
				>
					READY
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- GAME PLAN
const GamePlan: React.FC<{frame: number}> = ({frame}) => {
	const from = T.plan;
	const to = T.come1;
	if (frame < from || frame >= to) return null;
	const v = window01(frame, from, to, 4);
	const rows: {tag: string; text: string; t: number; final?: boolean}[] = [
		{tag: 'Kalau', text: 'Masih leading', t: T.leading - 4},
		{tag: 'Kalau', text: 'Tak ada gap', t: T.gap - 4},
		{tag: 'Plan', text: '2 keluar, korang balik', t: T.keluar - 6, final: true},
	];
	return (
		<TopZone style={{justifyContent: 'flex-start'}}>
			<div style={{display: 'flex', flexDirection: 'column', gap: 12, width: 780, opacity: v}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 16, transform: `translateY(${(1 - pop(frame, from, 12)) * -40}px)`}}>
					<Pill bg={C.red} dot>03:00</Pill>
					<Display size={64}>Game plan</Display>
				</div>
				{rows.map((r) => {
					const k = frame >= r.t ? pop(frame, r.t, 12, 0.5) : 0;
					return (
						<div
							key={r.text}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 18,
								height: 80,
								padding: '0 22px',
								borderRadius: 16,
								background: r.final ? C.gold : C.navySoft,
								boxShadow: '0 10px 26px rgba(0,0,0,0.35)',
								transform: `translateX(${(1 - k) * 820}px)`,
								opacity: k > 0.02 ? 1 : 0,
							}}
						>
							<span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 24, letterSpacing: 2, textTransform: 'uppercase', padding: '6px 12px', borderRadius: 8, background: r.final ? C.navy : C.gold, color: r.final ? C.gold : C.navy}}>{r.tag}</span>
							<span style={{flex: 1, fontFamily: FONT_UI, fontWeight: 900, fontSize: 42, color: r.final ? C.navy : C.white, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{r.text}</span>
							{r.final ? null : <Check size={50} progress={easeIn(frame, r.t + 6, 8)} />}
						</div>
					);
				})}
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- COME ON x3 + end card
const ComeOn: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.come1) return null;
	const hits = [T.come1, T.come2, T.come3];
	const count = hits.filter((h) => frame >= h).length;
	const last = hits[count - 1];
	const k = pop(frame, last, 7, 0.5);
	const outro = easeIn(frame, T.outro, 10);
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transform: `translateY(${-40 * outro}px)`}}>
				<Display size={170} color={count === 3 ? C.gold : C.white} style={{transform: `scale(${1.25 - 0.25 * k}) rotate(${count % 2 ? -3 : 3}deg)`, whiteSpace: 'nowrap'}}>
					Come on!
				</Display>
				<div style={{display: 'flex', gap: 14, marginTop: 6}}>
					{hits.map((h, i) => (
						<div key={i} style={{width: 70, height: 12, borderRadius: 6, background: frame >= h ? C.gold : 'rgba(255,255,255,0.3)', boxShadow: `0 4px 0 ${C.navy}`}} />
					))}
				</div>
				<div style={{opacity: outro, transform: `scale(${0.8 + 0.2 * outro})`, marginTop: 14}}>
					<Pill bg={C.navySoft} dot>UMPSA Handball · Last 3 minutes</Pill>
				</div>
			</div>
		</TopZone>
	);
};

export const Graphics: React.FC = () => {
	const frame = useCurrentFrame();
	const sh = shake(frame, SHAKE_HITS, 10, 7);
	return (
		<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
			<HookStat frame={frame} />
			<Clock frame={frame} from={T.five} to={T.fiveEnd} minutes={5} label="Minit lagi" color={C.red} />
			<CoachCall frame={frame} />
			<Target frame={frame} />
			<Rotate frame={frame} />
			<Lineup frame={frame} />
			<Clock frame={frame} from={T.last3 - 1} to={T.plan} minutes={3} label="The last 3 minutes" color={C.gold} size={200} />
			<GamePlan frame={frame} />
			<ComeOn frame={frame} />
		</AbsoluteFill>
	);
};

