import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EDL} from './edl';
import {C, FONT_DISPLAY, FONT_UI} from '../../lib/theme';
import {clamp, easeIn, pop, shake, window01} from '../../lib/anim';
import {Check, Display, Pill, TopZone} from '../../components/ui';

const {at, seg, segEnd} = EDL;
const start = (id: string) => seg(id).outFrom;

// ---------------------------------------------------------------- key moments (output frames)
export const T = {
	jangan: start('jangan'),
	beritahu0: at('jangan', 11.02),
	dah: at('jangan', 11.86),
	banyak: at('jangan', 12.24),
	janganEnd: segEnd('jangan'),
	siku: start('siku'),
	sikuWord: at('siku', 4.24),
	panggil: at('siku', 4.92),
	coach: at('siku', 5.82),
	sikuEnd: segEnd('siku'),
	biar: start('biar'),
	kitaOrang: at('biar', 8.0),
	beritahu: at('biar', 8.96),
	biarEnd: segEnd('biar'),
	td: start('td'),
	td1: at('td', 14.42),
	gaduh: at('td', 15.28),
	td2: at('td', 16.64),
	panggil2: at('td', 17.0),
	tdEnd: segEnd('td'),
	sikit: start('sikit'),
	sikit2: at('sikit', 20.88),
	sikitEnd: segEnd('sikit'),
	pernah: start('pernah'),
	tahu: at('pernah', 23.5),
	tanya: start('tanya'),
	tanyaWord: at('tanya', 25.18),
	tanyaEnd: segEnd('tanya'),
	kena: start('kena'),
	kenaEnd: segEnd('kena'),
	biasa: start('biasanya'),
	biasaPanggil: at('biasanya', 28.96),
	outro: EDL.cutEnd,
	end: EDL.totalFrames,
};

export const SHAKE_HITS = [T.jangan + 2, T.sikuWord + 2, T.td1 + 1, T.td2 + 1, T.kena + 2];

// ---------------------------------------------------------------- icons
const Card: React.FC<{size: number; color: string; flip: number}> = ({size, color, flip}) => (
	<div style={{width: size * 0.72, height: size, borderRadius: 10, background: color, border: `5px solid ${C.navy}`, boxShadow: '0 10px 22px rgba(0,0,0,0.45)', transform: `perspective(600px) rotateY(${(1 - flip) * 90}deg) rotate(-8deg)`}} />
);

const Warning: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.45))'}}>
		<path d="M50 6 L96 90 H4 Z" fill={C.gold} stroke={C.navy} strokeWidth="6" strokeLinejoin="round" />
		<rect x="45" y="34" width="10" height="32" rx="4" fill={C.navy} />
		<circle cx="50" cy="77" r="6" fill={C.navy} />
	</svg>
);

const Whistle: React.FC<{size: number; blow: number}> = ({size, blow}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))'}}>
		<circle cx="40" cy="60" r="26" fill={C.white} stroke={C.navy} strokeWidth="6" />
		<path d="M52 36 H92 V52 H60" fill={C.white} stroke={C.navy} strokeWidth="6" strokeLinejoin="round" />
		<circle cx="40" cy="60" r="8" fill={C.navy} />
		{[0, 1, 2].map((i) => (
			<path key={i} d={`M${72 + i * 8} ${26 - i * 4} q6 -8 0 -16`} fill="none" stroke={C.gold} strokeWidth="5" strokeLinecap="round" opacity={blow} />
		))}
	</svg>
);

// ---------------------------------------------------------------- 1. hook: JANGAN BERITAHU + tally
const Jangan: React.FC<{frame: number}> = ({frame}) => {
	if (frame >= T.janganEnd) return null;
	const k = pop(frame, T.jangan + 1, 8, 0.8);
	const sub = frame >= T.dah - 2 ? pop(frame, T.dah - 2, 11, 0.5) : 0;
	const out = interpolate(frame, [T.janganEnd - 5, T.janganEnd], [1, 0], clamp);
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: out}}>
				<Pill dot style={{opacity: interpolate(frame, [0, 6], [0, 1], clamp)}}>Taklimat coach · UMPSA Handball</Pill>
				<div
					style={{
						padding: '4px 30px',
						border: `9px solid ${C.red}`,
						borderRadius: 18,
						background: 'rgba(255,255,255,0.94)',
						color: C.red,
						fontFamily: FONT_DISPLAY,
						fontSize: 120,
						letterSpacing: 3,
						transform: `rotate(-5deg) scale(${2 - k})`,
						opacity: Math.min(1, k * 1.5),
						boxShadow: '0 14px 30px rgba(0,0,0,0.45)',
					}}
				>
					JANGAN
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 14, transform: `scale(${sub})`}}>
					<Pill bg={C.gold} color={C.navy} style={{fontSize: 34}}>Dah banyak kali</Pill>
					{/* Tally marks: "dah banyak kali dah" */}
					<div style={{display: 'flex', gap: 8}}>
						{[0, 1, 2, 3].map((i) => (
							<div key={i} style={{width: 10, height: 52, borderRadius: 4, background: C.white, boxShadow: `0 3px 0 ${C.navy}`, transform: `scaleY(${frame >= T.dah + i * 3 ? pop(frame, T.dah + i * 3, 9, 0.4) : 0})`}} />
						))}
					</div>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 2. BILA DIA SIKU-SIKU -> PANGGIL COACH
const Siku: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.siku || frame >= T.sikuEnd) return null;
	const v = window01(frame, T.siku, T.sikuEnd, 4);
	const w = frame >= T.sikuWord - 3 ? pop(frame, T.sikuWord - 3, 8, 0.6) : 0;
	const p = frame >= T.panggil - 2 ? pop(frame, T.panggil - 2, 10, 0.5) : 0;
	const c = frame >= T.coach - 2 ? pop(frame, T.coach - 2, 8, 0.6) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: v}}>
				<Pill bg={C.navySoft} style={{transform: `scale(${pop(frame, T.siku, 12)})`}}>Situasi</Pill>
				<div style={{display: 'flex', alignItems: 'center', gap: 20, transform: `scale(${w})`}}>
					<Warning size={120} />
					<Display size={120} color={C.gold} style={{whiteSpace: 'nowrap'}}>Kena siku</Display>
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${p})`}}>
					<Pill bg={C.red} style={{fontSize: 34}}>Panggil</Pill>
					<Display size={70} style={{transform: `scale(${frame >= T.coach - 2 ? 1.3 - 0.3 * c : 0.8})`, color: frame >= T.coach - 2 ? C.white : 'rgba(255,255,255,0.5)'}}>Coach!</Display>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 3. BIAR KITA ORANG YANG BERITAHU (player vs coach)
const Biar: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.biar || frame >= T.biarEnd) return null;
	const v = window01(frame, T.biar, T.biarEnd, 4);
	const row = (label: string, ok: boolean, t: number) => {
		const k = frame >= t ? pop(frame, t, 12, 0.5) : 0;
		return (
			<div style={{display: 'flex', alignItems: 'center', gap: 18, height: 92, padding: '0 26px', borderRadius: 16, background: ok ? C.gold : C.navySoft, transform: `translateX(${(1 - k) * 820}px)`, opacity: k > 0.02 ? 1 : 0, boxShadow: '0 10px 26px rgba(0,0,0,0.35)', width: 640}}>
				<span style={{flex: 1, fontFamily: FONT_UI, fontWeight: 900, fontSize: 44, color: ok ? C.navy : C.white, textTransform: 'uppercase'}}>{label}</span>
				{ok ? (
					<Check size={58} progress={easeIn(frame, T.beritahu, 8)} />
				) : (
					<svg width={58} height={58} viewBox="0 0 100 100">
						<circle cx="50" cy="50" r="44" fill={C.red} />
						<path d="M32 32 L68 68 M68 32 L32 68" stroke={C.white} strokeWidth="11" strokeLinecap="round" />
					</svg>
				)}
			</div>
		);
	};
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: v}}>
				<Display size={64}>Siapa yang beritahu?</Display>
				{row('Pemain', false, T.biar + 2)}
				{row('Coach', true, T.kitaOrang - 2)}
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 4. NANTI TD... (card flips)
const TD: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.td || frame >= T.tdEnd) return null;
	const v = window01(frame, T.td, T.tdEnd, 4);
	const b = frame >= T.td1 - 2 ? pop(frame, T.td1 - 2, 9, 0.6) : 0;
	const y = frame >= T.gaduh ? pop(frame, T.gaduh, 9, 0.5) : 0;
	const p = frame >= T.panggil2 - 2 ? pop(frame, T.panggil2 - 2, 9, 0.5) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', alignItems: 'center', gap: 34, opacity: v}}>
				<div style={{display: 'flex', gap: 10}}>
					<Card size={150} color={C.gold} flip={y} />
					<Card size={150} color={C.red} flip={p} />
				</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start'}}>
					<Pill bg={C.red} dot style={{transform: `scale(${pop(frame, T.td, 12)})`}}>Nanti</Pill>
					<Display size={150} style={{transform: `scale(${b})`}}>TD</Display>
					<Pill bg={C.gold} color={C.navy} style={{fontSize: 32, transform: `scale(${Math.max(y, p)})`}}>{frame >= T.panggil2 - 2 ? 'Akan panggil dia' : 'Akan gaduh'}</Pill>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 5. SIKIT LAGI (bar fills)
const Sikit: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.sikit || frame >= T.sikitEnd) return null;
	const v = window01(frame, T.sikit, T.sikitEnd, 3);
	const fill = interpolate(frame, [T.sikit, T.sikit2, T.sikitEnd], [0.55, 0.78, 0.94], clamp);
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: v}}>
				<Display size={130} color={C.gold} style={{transform: `scale(${pop(frame, T.sikit, 9, 0.6)})`, whiteSpace: 'nowrap'}}>Sikit lagi</Display>
				<div style={{width: 640, height: 30, borderRadius: 15, background: 'rgba(255,255,255,0.25)', border: `4px solid ${C.navy}`, overflow: 'hidden'}}>
					<div style={{width: `${fill * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.green})`}} />
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 6. KAU TAK TAHU KENAPA -> KAU AKAN TANYA DIA
const Kenapa: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.pernah || frame >= T.tanyaEnd) return null;
	const v = window01(frame, T.pernah, T.tanyaEnd, 4);
	const q = frame >= T.tahu - 3 ? pop(frame, T.tahu - 3, 8, 0.6) : 0;
	const t = frame >= T.tanya ? pop(frame, T.tanya, 10, 0.5) : 0;
	return (
		<TopZone>
			<div style={{display: 'flex', alignItems: 'center', gap: 26, opacity: v}}>
				<Display size={240} color={C.gold} style={{transform: `scale(${q}) rotate(${(1 - q) * -30}deg)`, lineHeight: 1}}>?</Display>
				<div style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start'}}>
					<Pill bg={C.navySoft} style={{transform: `scale(${pop(frame, T.pernah, 12)})`}}>Tak pernah main macam tu</Pill>
					<Display size={92} style={{opacity: frame >= T.tahu - 3 ? 1 : 0, whiteSpace: 'nowrap'}}>Tak tahu kenapa</Display>
					<Pill bg={C.red} style={{fontSize: 34, transform: `scale(${t})`}}>Kau akan tanya dia</Pill>
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 7. KENA JUGA stamp
const Kena: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.kena || frame >= T.kenaEnd + 3) return null;
	const k = pop(frame, T.kena, 8, 0.8);
	return (
		<TopZone>
			<div style={{padding: '6px 34px', border: `9px solid ${C.gold}`, borderRadius: 18, background: C.navySoft, color: C.gold, fontFamily: FONT_DISPLAY, fontSize: 130, letterSpacing: 3, transform: `rotate(-5deg) scale(${2 - k})`, opacity: Math.min(1, k * 1.5), boxShadow: '0 14px 30px rgba(0,0,0,0.45)', whiteSpace: 'nowrap'}}>
				KENA JUGA
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 8. BIASANYA DIA PANGGIL + end card
const Biasa: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.biasa) return null;
	const a = pop(frame, T.biasa + 1, 10, 0.6);
	const blow = frame >= T.biasaPanggil - 2 ? Math.abs(Math.sin((frame - T.biasaPanggil) * 0.6)) : 0;
	const outro = easeIn(frame, T.outro, 10);
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transform: `translateY(${-24 * outro}px)`}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${a})`}}>
					<Whistle size={130} blow={blow} />
					<div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
						<Display size={70}>Biasanya</Display>
						<Display size={84} color={C.gold} style={{whiteSpace: 'nowrap'}}>Dia panggil</Display>
					</div>
				</div>
				<div style={{opacity: outro, transform: `scale(${0.8 + 0.2 * outro})`}}>
					<Pill bg={C.navySoft} dot style={{whiteSpace: 'nowrap'}}>UMPSA Handball · Biar coach cakap</Pill>
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
				<Jangan frame={frame} />
				<Siku frame={frame} />
				<Biar frame={frame} />
				<TD frame={frame} />
				<Sikit frame={frame} />
				<Kenapa frame={frame} />
				<Kena frame={frame} />
				<Biasa frame={frame} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
