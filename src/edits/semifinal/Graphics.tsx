import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EDL} from './edl';
import {C, FONT_DISPLAY, FONT_UI} from '../../lib/theme';
import {clamp, easeIn, pop, shake, window01} from '../../lib/anim';
import {Check, Display, Pill, TopZone} from '../../components/ui';

const {at, seg, segEnd} = EDL;

// ---------------------------------------------------------------- key moments (output frames)
export const T = {
	hook: seg('hook').outFrom,
	tahun: at('hook', 52.66),
	finalWord: at('hook', 53.52),
	takSemua: at('hook', 53.74),
	buat: at('hook', 54.62),
	hookEnd: segEnd('hook'),
	pressure: seg('pressure').outFrom,
	noMore: at('pressure', 26.42),
	pressureEnd: segEnd('pressure'),
	semi: seg('semifinal').outFrom,
	semiWord: at('semifinal', 30.48),
	semiEnd: segEnd('semifinal'),
	menangSeg: seg('menang').outFrom,
	menang: at('menang', 62.08),
	buatlah: at('menang', 62.36),
	menangEnd: segEnd('menang'),
	jiwa: seg('jiwa').outFrom,
	jiwaEnd: segEnd('jiwa'),
	giveup: seg('giveup').outFrom,
	up: at('giveup', 69.42),
	giveupEnd: segEnd('giveup'),
	teknikalSeg: seg('teknikal').outFrom,
	sizing: at('teknikal', 78.62),
	masalah: at('teknikal', 79.6),
	teknikal: at('teknikal', 79.88),
	bagus: at('teknikal', 80.84),
	teknikalEnd: segEnd('teknikal'),
	lawanSeg: seg('lawan').outFrom,
	lawan1: at('lawan', 42.92),
	lawan2: at('lawan', 43.72),
	extraSeg: seg('extra').outFrom,
	extra1: at('extra', 45.38),
	tarik: at('extra', 45.94),
	extra2: at('extra', 46.5),
	extraEnd: segEnd('extra'),
	mesti: seg('mesti').outFrom,
	finalSeg: seg('final').outFrom,
	finalPay: at('final', 49.84),
	outro: EDL.cutEnd,
	end: EDL.totalFrames,
};

export const SHAKE_HITS = [T.takSemua + 2, T.semiWord + 2, T.menang + 1, T.up + 1, T.lawan2 + 1, T.finalSeg + 1, T.finalPay + 1];

// ---------------------------------------------------------------- icons
const Trophy: React.FC<{size: number; glow?: number}> = ({size, glow = 0}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{filter: `drop-shadow(0 8px 12px rgba(0,0,0,0.45)) drop-shadow(0 0 ${18 * glow}px ${C.gold})`}}>
		<defs>
			<linearGradient id="tg" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0%" stopColor="#FFF1B8" />
				<stop offset="50%" stopColor={C.gold} />
				<stop offset="100%" stopColor="#B87900" />
			</linearGradient>
		</defs>
		<path d="M28 10 H72 V36 C72 52 62 62 50 62 C38 62 28 52 28 36 Z" fill="url(#tg)" stroke={C.navy} strokeWidth="4" />
		<path d="M28 18 H14 C14 34 20 42 30 44 M72 18 H86 C86 34 80 42 70 44" fill="none" stroke={C.navy} strokeWidth="6" />
		<rect x="44" y="62" width="12" height="14" fill="url(#tg)" stroke={C.navy} strokeWidth="4" />
		<rect x="30" y="76" width="40" height="12" rx="3" fill={C.navy} />
	</svg>
);

/** Half-circle pressure gauge; `value` 0..1 (needle angle). */
const Gauge: React.FC<{size: number; value: number}> = ({size, value}) => {
	const a = Math.PI * (1 - value);
	const nx = 50 + Math.cos(a) * 34;
	const ny = 56 - Math.sin(a) * 34;
	return (
		<svg width={size} height={size * 0.66} viewBox="0 0 100 66">
			<path d="M10 56 A40 40 0 0 1 36 18" fill="none" stroke={C.green} strokeWidth="10" />
			<path d="M36 18 A40 40 0 0 1 64 18" fill="none" stroke={C.gold} strokeWidth="10" />
			<path d="M64 18 A40 40 0 0 1 90 56" fill="none" stroke={C.red} strokeWidth="10" />
			<line x1="50" y1="56" x2={nx} y2={ny} stroke={C.white} strokeWidth="5" strokeLinecap="round" />
			<circle cx="50" cy="56" r="6" fill={C.white} stroke={C.navy} strokeWidth="3" />
		</svg>
	);
};

const Flame: React.FC<{size: number; flicker: number}> = ({size, flicker}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `scaleY(${1 + 0.06 * flicker})`, transformOrigin: '50% 100%', filter: `drop-shadow(0 0 16px ${C.red})`}}>
		<path d="M50 6 C62 30 82 40 80 64 C78 84 64 94 50 94 C36 94 22 84 20 64 C18 46 34 38 38 20 C44 32 46 40 50 44 C54 34 54 20 50 6 Z" fill={C.red} />
		<path d="M50 44 C58 56 66 62 64 74 C62 86 56 90 50 90 C44 90 38 86 36 74 C35 64 44 58 50 44 Z" fill={C.gold} />
	</svg>
);

// ---------------------------------------------------------------- 1. hook: 2 TAHUN BERTURUT-TURUT DI FINAL
const Hook: React.FC<{frame: number}> = ({frame}) => {
	if (frame >= T.hookEnd) return null;
	const a = pop(frame, T.hook + 1, 9, 0.7);
	const t1 = frame >= T.finalWord - 2 ? pop(frame, T.finalWord - 2, 9, 0.5) : 0;
	const t2 = frame >= T.finalWord + 4 ? pop(frame, T.finalWord + 4, 9, 0.5) : 0;
	const stamp = frame >= T.takSemua ? pop(frame, T.takSemua, 9, 0.8) : 0;
	const out = interpolate(frame, [T.hookEnd - 5, T.hookEnd], [1, 0], clamp);
	return (
		<TopZone>
			<div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: out}}>
				<Pill dot style={{opacity: interpolate(frame, [0, 6], [0, 1], clamp)}}>Pre-semifinal talk</Pill>
				<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
					<div style={{transform: `scale(${t1}) rotate(${(1 - t1) * -40}deg)`}}><Trophy size={120} glow={t1} /></div>
					<div style={{textAlign: 'center', transform: `scale(${0.4 + 0.6 * a})`, opacity: Math.min(1, a * 2), filter: `blur(${(1 - a) * 8}px)`}}>
						<Display size={190} color={C.gold}>2X</Display>
					</div>
					<div style={{transform: `scale(${t2}) rotate(${(1 - t2) * 40}deg)`}}><Trophy size={120} glow={t2} /></div>
				</div>
				<Pill bg={C.gold} color={C.navy} style={{fontSize: 32, transform: `scale(${pop(frame, T.tahun, 12)})`, opacity: 1 - Math.min(1, stamp * 2)}}>Final berturut-turut</Pill>
				<div
					style={{
						position: 'absolute',
						bottom: -6,
						padding: '6px 22px',
						background: C.red,
						color: C.white,
						fontFamily: FONT_DISPLAY,
						fontSize: 46,
						letterSpacing: 2,
						borderRadius: 10,
						transform: `rotate(-4deg) scale(${frame >= T.takSemua ? 1.8 - 0.8 * stamp : 0})`,
						opacity: frame >= T.takSemua ? Math.min(1, stamp * 1.5) : 0,
						boxShadow: '0 10px 24px rgba(0,0,0,0.4)',
						whiteSpace: 'nowrap',
					}}
				>
					TAK SEMUA ORANG BOLEH BUAT
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 2. FINAL = NO MORE PRESSURE (gauge drops)
const Pressure: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.pressure || frame >= T.pressureEnd) return null;
	const v = window01(frame, T.pressure, T.pressureEnd, 4);
	const p = pop(frame, T.pressure, 12, 0.6);
	const needle = interpolate(frame, [T.pressure, T.noMore, T.noMore + 14], [0.92, 0.92, 0.06], clamp);
	const wobble = frame < T.noMore ? Math.sin(frame * 1.7) * 0.03 : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', alignItems: 'center', gap: 30, opacity: v, transform: `scale(${0.7 + 0.3 * p})`}}>
				<Gauge size={230} value={needle + wobble} />
				<div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start'}}>
					<Pill bg={C.gold} color={C.navy}>Bila dah final</Pill>
					<Display size={92} style={{opacity: frame >= T.noMore ? 1 : 0.25}}>No more</Display>
					<Display size={92} color={frame >= T.noMore ? C.green : C.red}>pressure</Display>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 3. SEMIFINAL title slam
const Semifinal: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.semi || frame >= T.semiEnd) return null;
	const v = window01(frame, T.semi, T.semiEnd, 4);
	const k = frame >= T.semiWord - 2 ? pop(frame, T.semiWord - 2, 8, 0.7) : 0;
	const glitch = frame >= T.semiWord - 2 && frame < T.semiWord + 6 ? Math.sin(frame * 9) * 10 : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: v}}>
				<Pill bg={C.red} dot style={{transform: `scale(${pop(frame, T.semi, 12)})`}}>Tapi game kali ni</Pill>
				<div style={{position: 'relative', transform: `scale(${frame >= T.semiWord - 2 ? 1.6 - 0.6 * k : 0})`}}>
					<Display size={140} color="#00E5FF" style={{position: 'absolute', left: glitch, top: 0, opacity: glitch ? 0.6 : 0, textShadow: 'none'}}>Semifinal</Display>
					<Display size={140} color={C.red} style={{position: 'absolute', left: -glitch, top: 0, opacity: glitch ? 0.6 : 0, textShadow: 'none'}}>Semifinal</Display>
					<Display size={140}>Semifinal</Display>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 4. KENA MENANG
const KenaMenang: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.menangSeg || frame >= T.menangEnd) return null;
	const v = window01(frame, T.menangSeg, T.menangEnd, 4);
	const k = frame >= T.menang - 3 ? pop(frame, T.menang - 3, 8, 0.6) : 0;
	const sub = frame >= T.buatlah ? pop(frame, T.buatlah, 12, 0.5) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: v}}>
				<Pill bg={C.navySoft} style={{transform: `scale(${pop(frame, T.menangSeg, 12)})`}}>Nak tak nak</Pill>
				<Display size={160} color={C.gold} style={{transform: `scale(${frame >= T.menang - 3 ? 1.5 - 0.5 * k : 0})`, whiteSpace: 'nowrap'}}>
					Kena menang
				</Display>
				<Pill bg={C.red} style={{transform: `scale(${sub})`, fontSize: 30}}>Walau macam mana cara sekalipun</Pill>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 5. JIWA NAK MENANG
const Jiwa: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.jiwa || frame >= T.jiwaEnd) return null;
	const v = window01(frame, T.jiwa, T.jiwaEnd, 3);
	const p = pop(frame, T.jiwa, 9, 0.5);
	return (
		<TopZone>
			<div style={{display: 'flex', alignItems: 'center', gap: 20, opacity: v, transform: `scale(${0.6 + 0.4 * p})`}}>
				<Flame size={170} flicker={Math.sin(frame * 1.3)} />
				<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
					<Display size={110}>Jiwa</Display>
					<Display size={110} color={C.gold}>nak menang</Display>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 6. JANGAN GIVE UP stamp
const GiveUp: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.giveup || frame >= T.giveupEnd + 4) return null;
	const k = pop(frame, T.giveup, 8, 0.8);
	return (
		<TopZone>
			<div
				style={{
					padding: '6px 28px',
					border: `9px solid ${C.red}`,
					borderRadius: 18,
					background: 'rgba(255,255,255,0.94)',
					color: C.red,
					fontFamily: FONT_DISPLAY,
					fontSize: 98,
					letterSpacing: 3,
					transform: `rotate(-6deg) scale(${2 - k})`,
					opacity: Math.min(1, k * 1.5),
					boxShadow: '0 14px 30px rgba(0,0,0,0.45)',
					whiteSpace: 'nowrap',
				}}
			>
				JANGAN GIVE UP
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 7. sizing vs teknikal checklist
const Teknikal: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.teknikalSeg || frame >= T.teknikalEnd) return null;
	const v = window01(frame, T.teknikalSeg, T.teknikalEnd, 4);
	const rows: {tag: string; text: string; t: number; good: boolean; tick: number}[] = [
		{tag: 'Sizing', text: 'Tak ada masalah', t: T.sizing - 4, good: false, tick: T.masalah},
		{tag: 'Teknikal', text: 'Kita bagus', t: T.teknikal - 4, good: true, tick: T.bagus},
	];
	return (
		<TopZone style={{justifyContent: 'flex-start'}}>
			<div style={{display: 'flex', flexDirection: 'column', gap: 14, width: 780, opacity: v}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 16, transform: `translateY(${(1 - pop(frame, T.teknikalSeg, 12)) * -40}px)`}}>
					<Display size={70}>Jangan takut</Display>
				</div>
				{rows.map((r) => {
					const k = frame >= r.t ? pop(frame, r.t, 12, 0.5) : 0;
					return (
						<div
							key={r.tag}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 18,
								height: 96,
								padding: '0 24px',
								borderRadius: 16,
								background: r.good ? C.gold : C.navySoft,
								boxShadow: '0 10px 26px rgba(0,0,0,0.35)',
								transform: `translateX(${(1 - k) * 820}px)`,
								opacity: k > 0.02 ? 1 : 0,
							}}
						>
							<span style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: 26, letterSpacing: 2, textTransform: 'uppercase', padding: '6px 12px', borderRadius: 8, background: r.good ? C.navy : C.gold, color: r.good ? C.gold : C.navy}}>{r.tag}</span>
							<span style={{flex: 1, fontFamily: FONT_UI, fontWeight: 900, fontSize: 46, color: r.good ? C.navy : C.white, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{r.text}</span>
							<Check size={58} progress={easeIn(frame, r.tick, 8)} />
						</div>
					);
				})}
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 8. LAWAN TETAP LAWAN -> EXTRA TIME
const Lawan: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.lawanSeg || frame >= T.extraEnd) return null;
	const v = window01(frame, T.lawanSeg, T.extraEnd, 4);
	const l1 = frame >= T.lawan1 ? pop(frame, T.lawan1, 9, 0.6) : 0;
	const l2 = frame >= T.lawan2 ? pop(frame, T.lawan2, 8, 0.6) : 0;
	const inExtra = frame >= T.extraSeg;
	const et = inExtra ? pop(frame, T.extra1 - 2, 9, 0.6) : 0;
	const tarik = frame >= T.tarik ? pop(frame, T.tarik, 10, 0.5) : 0;
	// Clock ticks toward the final minute, then flips to extra time.
	const sec = Math.min(59, Math.floor(interpolate(frame, [T.lawanSeg, T.lawan2], [40, 59], clamp)));
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: v}}>
				{!inExtra ? (
					<>
						<Pill bg={C.red} dot>Sampai minit terakhir · {`00:${String(sec).padStart(2, '0')}`}</Pill>
						<div style={{display: 'flex', gap: 34, alignItems: 'baseline'}}>
							<Display size={112} style={{transform: `scale(${l1})`}}>Lawan</Display>
							<Display size={112} color={C.gold} style={{transform: `scale(${l2})`}}>tetap lawan</Display>
						</div>
					</>
				) : (
					<>
						<Pill bg={C.gold} color={C.navy}>Kalau nak heret</Pill>
						<Display size={150} color={C.white} style={{transform: `scale(${1.4 - 0.4 * et})`, opacity: et, whiteSpace: 'nowrap'}}>
							Extra time?
						</Display>
						<Pill bg={C.red} style={{transform: `scale(${tarik})`, fontSize: 34}}>Tarik lah!</Pill>
					</>
				)}
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 9. KITA MESTI ... ADA KAT FINAL + end card
const Climax: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.mesti) return null;
	const a = pop(frame, T.mesti + 1, 10, 0.6);
	const inFinal = frame >= T.finalSeg;
	const b = inFinal ? pop(frame, T.finalPay - 3, 7, 0.7) : 0;
	const outro = easeIn(frame, T.outro, 10);
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transform: `translateY(${-30 * outro}px)`}}>
				<Display size={inFinal ? 80 : 150} style={{transform: `scale(${a})`, opacity: a}}>Kita mesti</Display>
				{inFinal ? (
					<div style={{display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${frame >= T.finalPay - 3 ? 1.5 - 0.5 * b : 0})`}}>
						<Trophy size={104} glow={b} />
						<Display size={124} color={C.gold} style={{whiteSpace: 'nowrap'}}>Ada kat final</Display>
					</div>
				) : null}
				<div style={{opacity: outro, transform: `scale(${0.8 + 0.2 * outro})`, marginTop: 10}}>
					<Pill bg={C.navySoft} dot>Semifinal · Jom ke final</Pill>
				</div>
			</div>
		</TopZone>
	);
};

export const Graphics: React.FC = () => {
	const frame = useCurrentFrame();
	const sh = shake(frame, SHAKE_HITS, 10, 7);
	// Hard mask at the TikTok/IG safe area (x 60-960, y 250-620): slide-ins and
	// pop overshoots reveal from inside it instead of crossing the platform UI.
	return (
		<AbsoluteFill style={{clipPath: 'inset(250px 120px 1300px 60px)'}}>
		<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
			<Hook frame={frame} />
			<Pressure frame={frame} />
			<Semifinal frame={frame} />
			<KenaMenang frame={frame} />
			<Jiwa frame={frame} />
			<GiveUp frame={frame} />
			<Teknikal frame={frame} />
			<Lawan frame={frame} />
			<Climax frame={frame} />
		</AbsoluteFill>
		</AbsoluteFill>
	);
};
