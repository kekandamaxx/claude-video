import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EDL} from './edl';
import {C, FONT_DISPLAY, FONT_UI} from '../../lib/theme';
import {clamp, easeIn, pop, shake, window01} from '../../lib/anim';
import {Ball, Check, Display, Pill} from '../../components/ui';
import {HfOverlay} from '../../components/HfOverlay';

const {at, seg, segEnd} = EDL;
const start = (id: string) => seg(id).outFrom;

// ---------------------------------------------------------------- key moments (output frames)
export const T = {
	hook: start('hook'),
	tiga: at('hook', 183.24),
	jangan: at('hook', 183.94),
	semalam: start('semalam'),
	semalamWord: at('semalam', 163.82),
	berulang: at('semalam', 164.1),
	half: start('half'),
	perform: at('half', 166.1),
	second: at('half', 166.36),
	down: at('half', 167.26),
	halfEnd: segEnd('half'),
	tragedi: start('tragedi'),
	tragediWord: at('tragedi', 16.38),
	tragediEnd: segEnd('tragedi'),
	fancy: start('fancy'),
	fancyWord: at('fancy', 1.34),
	over: at('fancy', 2.34),
	fancy2: start('fancy2'),
	memakan: at('fancy2', 5.04),
	fancy2End: segEnd('fancy2'),
	tolong: start('tolong'),
	janganFancy: at('tolong', 19.64),
	fancyX: at('tolong', 20.3),
	tolongEnd: segEnd('tolong'),
	rush: start('rush'),
	rushWord: at('rush', 185.0),
	control: start('control'),
	controlWord: at('control', 187.1),
	controlEnd: segEnd('control'),
	mental: start('mental'),
	kuat: at('mental', 169.82),
	mentalEnd: segEnd('mental'),
	boleh: start('boleh'),
	menangWord: at('boleh', 106.48),
	tapi: at('boleh', 106.86),
	habis: at('boleh', 107.92),
	bolehEnd: segEnd('boleh'),
	menang: start('menang'),
	mainCara: at('menang', 243.63),
	menang2: at('menang', 244.11),
	menangEnd: segEnd('menang'),
	henjutSeg: start('henjut'),
	henjut1: at('henjut', 230.21),
	henjut2: at('henjut', 231.09),
	henjutEnd: segEnd('henjut'),
	minit: start('minit'),
	duaSetengah: at('minit', 173.1),
	minitDown: at('minit', 174.56),
	minitEnd: segEnd('minit'),
	letsgo: start('letsgo'),
	go1: at('letsgo', 137.97),
	go2: at('letsgo', 138.27),
	easy: at('letsgo', 138.35),
	outro: EDL.cutEnd,
	end: EDL.totalFrames,
};

export const SHAKE_HITS = [T.tiga + 1, T.jangan + 1, T.down + 1, T.tragediWord + 1, T.fancyX + 1, T.rushWord + 1, T.habis + 1, T.henjut1 + 1, T.henjut2 + 1, T.go1 + 1, T.outro + 7];

/** Graphics band y 260-500: above every face in every kept take, inside the TikTok/IG safe area. */
const Zone: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div style={{position: 'absolute', left: 70, top: 260, width: 880, height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style}}>{children}</div>
);

const Card: React.FC<{children: React.ReactNode; border: string; style?: React.CSSProperties}> = ({children, border, style}) => (
	<div style={{background: 'linear-gradient(180deg, rgba(10,22,51,0.96), rgba(6,12,32,0.92))', border: `4px solid ${border}`, borderRadius: 24, boxShadow: '0 14px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ...style}}>{children}</div>
);

const Label: React.FC<{children: React.ReactNode; color?: string; size?: number}> = ({children, color = 'rgba(255,255,255,0.82)', size = 28}) => (
	<div style={{fontFamily: FONT_UI, fontWeight: 900, fontSize: size, letterSpacing: 4, textTransform: 'uppercase', color}}>{children}</div>
);

// ---------------------------------------------------------------- 2. semalam: rewind
const Semalam: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.semalam || frame >= T.half) return null;
	const o = window01(frame, T.semalam + 2, T.half, 4);
	const a = pop(frame, T.semalam + 2);
	const b = pop(frame, T.berulang, 9);
	const spin = interpolate(frame, [T.semalam, T.half], [0, -540]);
	return (
		<Zone style={{opacity: o}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${0.7 + 0.3 * a})`}}>
				<svg width={92} height={92} viewBox="0 0 100 100" style={{transform: `rotate(${spin}deg)`}}>
					<path d="M20 50 A30 30 0 1 0 35 24" fill="none" stroke={C.gold} strokeWidth="11" strokeLinecap="round" />
					<path d="M42 8 L20 22 L40 40 Z" fill={C.gold} />
				</svg>
				<Display size={120}>Semalam</Display>
			</div>
			<div style={{marginTop: 14, opacity: Math.min(b * 1.5, 1), transform: `scale(${0.6 + 0.4 * b})`}}>
				<Pill bg={C.red} style={{fontSize: 32}}>Jangan berulang lagi</Pill>
			</div>
		</Zone>
	);
};

// ---------------------------------------------------------------- 3. first half vs second half
const Half: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.half || frame >= T.halfEnd) return null;
	const a = pop(frame, T.half + 2);
	const p = pop(frame, T.perform, 9);
	const b = pop(frame, T.second, 10);
	const d = pop(frame, T.down, 8);
	const arrow = (up: boolean, color: string) => (
		<svg width={46} height={46} viewBox="0 0 100 100" style={{transform: up ? undefined : 'rotate(180deg)'}}>
			<path d="M50 10 L92 66 H66 V92 H34 V66 H8 Z" fill={color} />
		</svg>
	);
	return (
		<Zone style={{flexDirection: 'row', gap: 26}}>
			<Card border={C.green} style={{width: 410, height: 210, opacity: Math.min(a * 1.5, 1), transform: `translateY(${(1 - a) * 40}px)`}}>
				<Label>First half</Label>
				<div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, opacity: Math.min(p * 1.6, 1), transform: `scale(${0.6 + 0.4 * p})`}}>
					{arrow(true, C.green)}
					<Display size={88} color={C.green}>Perform</Display>
				</div>
			</Card>
			<Card border={C.red} style={{width: 410, height: 210, opacity: Math.min(b * 1.5, 1), transform: `translateY(${(1 - b) * 40}px)`}}>
				<Label>Second half</Label>
				<div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, opacity: Math.min(d * 1.6, 1), transform: `scale(${0.6 + 0.4 * d}) translateY(${(1 - d) * -30}px)`}}>
					{arrow(false, C.red)}
					<Display size={88} color={C.red}>Down</Display>
				</div>
			</Card>
		</Zone>
	);
};

// ---------------------------------------------------------------- 4. tragedi stamp
const Tragedi: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.tragedi || frame >= T.tragediEnd) return null;
	const q = pop(frame, T.tragedi + 3);
	const s = pop(frame, T.tragediWord, 8, 0.5);
	const hit = frame >= T.tragediWord;
	return (
		<Zone>
			{hit ? (
				<div style={{transform: `scale(${2.2 - 1.2 * s}) rotate(-5deg)`, opacity: Math.min(s * 2, 1), border: `10px solid ${C.red}`, borderRadius: 18, padding: '2px 34px 10px', background: 'rgba(10,22,51,0.82)'}}>
					<Display size={150} color={C.red} style={{textShadow: 'none', letterSpacing: 6}}>Tragedi</Display>
				</div>
			) : (
				<div style={{opacity: Math.min(q * 1.5, 1), transform: `scale(${0.7 + 0.3 * q})`}}>
					<Display size={104}>Apa jadi<span style={{color: C.gold}}> ?</span></Display>
				</div>
			)}
		</Zone>
	);
};

// ---------------------------------------------------------------- 5. fancy -> overconfident -> makan diri
const Fancy: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.fancy || frame >= T.fancy2End) return null;
	if (frame >= T.fancy2) {
		const a = pop(frame, T.fancy2 + 1);
		const b = pop(frame, T.memakan, 9);
		const bite = interpolate(frame, [T.memakan, T.fancy2End], [0, 1], clamp);
		return (
			<Zone>
				<div style={{opacity: Math.min(a * 1.5, 1), transform: `scale(${0.75 + 0.25 * a})`, position: 'relative'}}>
					<Display size={104} style={{letterSpacing: 2}}>Overconfident</Display>
					{/* the word gets eaten from the right as he says "memakan diri sendiri" */}
					<div style={{position: 'absolute', right: -6, top: -6, bottom: -6, width: `${bite * 62}%`, background: C.red, mixBlendMode: 'multiply', borderRadius: 8}} />
				</div>
				<div style={{marginTop: 14, opacity: Math.min(b * 1.5, 1), transform: `scale(${0.6 + 0.4 * b})`}}>
					<Pill bg={C.red} style={{fontSize: 34}}>Makan diri sendiri</Pill>
				</div>
			</Zone>
		);
	}
	const a = pop(frame, T.fancyWord - 2, 9);
	const arrow = easeIn(frame, T.over - 8, 8);
	const b = pop(frame, T.over, 10);
	const o = window01(frame, T.fancy, T.fancy2, 3);
	return (
		<Zone style={{opacity: o}}>
			<div style={{opacity: Math.min(a * 1.5, 1), transform: `scale(${0.6 + 0.4 * a}) rotate(-3deg)`}}>
				<Display size={112} color={C.gold}>Main fancy</Display>
			</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 6}}>
				<svg width={64} height={50} viewBox="0 0 100 80" style={{opacity: arrow, transform: `translateX(${(1 - arrow) * -30}px)`}}>
					<path d="M4 30 H60 V8 L96 40 L60 72 V50 H4 Z" fill={C.white} stroke={C.navy} strokeWidth="5" />
				</svg>
				<div style={{opacity: Math.min(b * 1.5, 1), transform: `scale(${0.6 + 0.4 * b})`}}>
					<Display size={84}>Overconfident</Display>
				</div>
			</div>
		</Zone>
	);
};

// ---------------------------------------------------------------- 6. fancy, crossed out
const Tolong: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.tolong || frame >= T.tolongEnd) return null;
	const a = pop(frame, T.tolong + 2);
	const strike = interpolate(frame, [T.janganFancy, T.janganFancy + 7], [0, 1], clamp);
	const x = pop(frame, T.fancyX, 8);
	return (
		<Zone>
			<div style={{position: 'relative', opacity: Math.min(a * 1.5, 1), transform: `scale(${0.7 + 0.3 * a})`}}>
				<Display size={150} color={interpolate(strike, [0, 1], [1, 0]) > 0.5 ? C.gold : 'rgba(255,255,255,0.75)'}>Main fancy</Display>
				<div style={{position: 'absolute', left: -20, top: '50%', height: 16, width: `calc(${strike * 100}% + ${strike * 40}px)`, background: C.red, borderRadius: 8, transform: 'rotate(-5deg)', boxShadow: `0 0 18px ${C.red}`}} />
			</div>
			<div style={{marginTop: 4, opacity: Math.min(x * 1.5, 1), transform: `scale(${0.6 + 0.4 * x})`}}>
				<Pill bg={C.red} style={{fontSize: 30}}>Tolong · jangan</Pill>
			</div>
		</Zone>
	);
};

// ---------------------------------------------------------------- 7. jangan rush -> control game
const Control: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.rush || frame >= T.controlEnd) return null;
	if (frame < T.control) {
		const a = pop(frame, T.rush + 1, 9);
		return (
			<Zone>
				<div style={{transform: `scale(${1.6 - 0.6 * a})`, opacity: Math.min(a * 2, 1)}}>
					<Display size={150}>Jangan <span style={{color: C.red}}>rush</span></Display>
				</div>
			</Zone>
		);
	}
	const a = pop(frame, T.control + 2);
	const b = pop(frame, T.controlWord, 9);
	// tempo dial easing from red (fast) back to green (controlled)
	const v = interpolate(frame, [T.control + 4, T.controlEnd - 6], [0.92, 0.3], clamp);
	const ang = Math.PI * (1 - v);
	return (
		<Zone style={{flexDirection: 'row', gap: 26}}>
			<svg width={230} height={152} viewBox="0 0 100 66" style={{opacity: Math.min(a * 1.5, 1), transform: `scale(${0.7 + 0.3 * a})`, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))'}}>
				<path d="M10 56 A40 40 0 0 1 36 18" fill="none" stroke={C.green} strokeWidth="10" />
				<path d="M36 18 A40 40 0 0 1 64 18" fill="none" stroke={C.gold} strokeWidth="10" />
				<path d="M64 18 A40 40 0 0 1 90 56" fill="none" stroke={C.red} strokeWidth="10" />
				<line x1="50" y1="56" x2={50 + Math.cos(ang) * 34} y2={56 - Math.sin(ang) * 34} stroke={C.white} strokeWidth="5" strokeLinecap="round" />
				<circle cx="50" cy="56" r="6" fill={C.white} stroke={C.navy} strokeWidth="3" />
			</svg>
			<div style={{opacity: Math.min(b * 1.5, 1), transform: `scale(${0.6 + 0.4 * b})`}}>
				<Display size={118} color={C.gold}>Control<br />game</Display>
			</div>
		</Zone>
	);
};

// ---------------------------------------------------------------- 8. mental kena kuat: power bar
const Mental: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.mental || frame >= T.mentalEnd) return null;
	const a = pop(frame, T.mental + 1);
	const fill = interpolate(frame, [T.mental + 4, T.kuat + 3], [0.18, 1], clamp);
	const k = pop(frame, T.kuat, 8);
	return (
		<Zone>
			<div style={{opacity: Math.min(a * 1.5, 1), transform: `scale(${0.75 + 0.25 * a})`, display: 'flex', alignItems: 'baseline', gap: 22}}>
				<Display size={112}>Mental</Display>
				<div style={{transform: `scale(${0.6 + 0.4 * k})`, opacity: Math.min(k * 1.6, 1)}}>
					<Display size={132} color={C.green}>Kuat</Display>
				</div>
			</div>
			<div style={{marginTop: 16, width: 640, height: 34, borderRadius: 17, background: C.navySoft, border: `4px solid ${C.white}`, overflow: 'hidden', opacity: Math.min(a * 1.5, 1)}}>
				<div style={{width: `${fill * 100}%`, height: '100%', background: `linear-gradient(90deg, ${C.gold}, ${C.green})`, boxShadow: `0 0 20px ${C.green}`}} />
			</div>
		</Zone>
	);
};

// ---------------------------------------------------------------- 9. boleh menang / buat susah = habis
const Boleh: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.boleh || frame >= T.bolehEnd) return null;
	if (frame < T.tapi) {
		const a = pop(frame, T.boleh + 3);
		const c = interpolate(frame, [T.menangWord, T.menangWord + 7], [0, 1], clamp);
		const o = window01(frame, T.boleh, T.tapi, 3);
		return (
			<Zone style={{flexDirection: 'row', gap: 22, opacity: o}}>
				<div style={{opacity: c, transform: `scale(${0.5 + 0.5 * c})`}}><Check size={120} progress={c} /></div>
				<div style={{opacity: Math.min(a * 1.5, 1), transform: `scale(${0.7 + 0.3 * a})`}}>
					<Display size={120}>Game ni<br /><span style={{color: C.green}}>boleh menang</span></Display>
				</div>
			</Zone>
		);
	}
	const a = pop(frame, T.tapi + 1, 10);
	const h = pop(frame, T.habis, 8, 0.5);
	return (
		<Zone style={{flexDirection: 'row', gap: 20}}>
			<div style={{opacity: Math.min(a * 1.5, 1), transform: `scale(${0.7 + 0.3 * a})`}}>
				<Display size={96}>Buat susah</Display>
			</div>
			<div style={{opacity: Math.min(h * 2, 1)}}><Display size={96} color={C.gold}>=</Display></div>
			<div style={{opacity: Math.min(h * 2, 1), transform: `scale(${2 - h}) rotate(-4deg)`}}>
				<Display size={132} color={C.red}>Habis</Display>
			</div>
		</Zone>
	);
};

// ---------------------------------------------------------------- 10. main cara nak menang
const Menang: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.menang || frame >= T.menangEnd) return null;
	const a = pop(frame, T.menang + 2);
	const b = pop(frame, T.mainCara, 9);
	const glow = pop(frame, T.menang2, 8);
	return (
		<Zone>
			<div style={{opacity: Math.min(a * 1.5, 1), transform: `scale(${0.7 + 0.3 * a})`}}>
				<Label size={34}>Nak menang?</Label>
			</div>
			<div style={{marginTop: 8, opacity: Math.min(b * 1.5, 1), transform: `scale(${0.6 + 0.4 * b})`}}>
				<Display size={104} style={{textAlign: 'center'}}>
					Main cara <span style={{color: C.gold, textShadow: `0 5px 0 ${C.navy}, 0 0 ${30 * glow}px ${C.gold}`}}>nak menang</span>
				</Display>
			</div>
		</Zone>
	);
};

// ---------------------------------------------------------------- 11. dapat bola, henjut! x2
const Henjut: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.henjutSeg || frame >= T.henjutEnd) return null;
	const second = frame >= T.henjut2 - 13;
	const hitAt = second ? T.henjut2 : T.henjut1;
	const from = second ? T.henjut2 - 13 : T.henjutSeg + 2;
	// ball winds up on "dapat bola", then is thrown across the band on "henjut"
	const hold = pop(frame, from, 10);
	const fly = interpolate(frame, [hitAt, hitAt + 7], [0, 1], clamp);
	const x = interpolate(fly, [0, 1], [-290, 520]);
	const h = pop(frame, hitAt + 3, 8, 0.5);
	const dir = second ? -1 : 1;
	return (
		<Zone style={{height: 210}}>
			<div style={{position: 'absolute', left: 440 - 55, top: 40, transform: `translateX(${x * dir}px) scale(${0.5 + 0.5 * hold})`, opacity: Math.min(hold * 2, 1) * (1 - fly * 0.999 > 0.02 ? 1 : 0)}}>
				<Ball size={110} rotate={frame * 24 * dir} />
			</div>
			{/* speed streak behind the ball */}
			<div style={{position: 'absolute', left: dir > 0 ? 150 : undefined, right: dir < 0 ? 150 : undefined, top: 87, height: 16, width: 560 * fly, borderRadius: 8, background: `linear-gradient(${dir > 0 ? 90 : 270}deg, rgba(255,199,44,0), ${C.gold})`, opacity: fly > 0 ? 1 - h * 0.9 : 0}} />
			{frame >= hitAt + 3 ? (
				<div style={{transform: `scale(${1.9 - 0.9 * h}) rotate(${-4 * dir}deg)`, opacity: Math.min(h * 2, 1)}}>
					<Display size={150} color={C.gold}>Henjut!</Display>
				</div>
			) : null}
		</Zone>
	);
};

// ---------------------------------------------------------------- 12. 2½ minit lagi: countdown
const Minit: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.minit || frame >= T.minitEnd) return null;
	const a = pop(frame, T.minit + 2);
	const secs = 150 - Math.max(0, Math.floor((frame - T.duaSetengah) / 10));
	const mm = Math.floor(secs / 60);
	const ss = String(secs % 60).padStart(2, '0');
	const tick = 1 + 0.05 * Math.max(0, 1 - ((((frame - T.duaSetengah) % 10) + 10) % 10) / 4);
	const d = pop(frame, T.minitDown - 9, 9);
	return (
		<Zone style={{flexDirection: 'row', gap: 28}}>
			<Card border={C.gold} style={{width: 370, height: 200, opacity: Math.min(a * 1.5, 1), transform: `scale(${(0.7 + 0.3 * a) * tick})`}}>
				<Label size={24}>Masa tinggal</Label>
				<div style={{fontFamily: FONT_DISPLAY, fontSize: 124, lineHeight: 1, color: C.gold, letterSpacing: 4, fontVariantNumeric: 'tabular-nums'}}>{mm}:{ss}</div>
			</Card>
			<div style={{opacity: Math.min(d * 1.5, 1), transform: `scale(${0.6 + 0.4 * d})`}}>
				<Display size={116}>Jangan<br /><span style={{color: C.gold}}>down</span></Display>
			</div>
		</Zone>
	);
};

// ---------------------------------------------------------------- 13. let's go!
const LetsGo: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.letsgo || frame >= T.outro) return null;
	const a = pop(frame, T.letsgo + 2, 8, 0.5);
	const b = pop(frame, T.go2, 8, 0.5);
	const e = pop(frame, T.easy + 4, 10);
	return (
		<Zone>
			<div style={{transform: `scale(${(1.8 - 0.8 * a) * (1 + 0.08 * (1 - Math.abs(1 - 2 * b)))})`, opacity: Math.min(a * 2, 1)}}>
				<Display size={170} color={C.gold}>Let&apos;s go!</Display>
			</div>
			<div style={{marginTop: 2, opacity: Math.min(e * 1.5, 1), transform: `scale(${0.6 + 0.4 * e})`}}>
				<Pill bg={C.navySoft} style={{fontSize: 30}}>Easy game</Pill>
			</div>
		</Zone>
	);
};

export const Graphics: React.FC = () => {
	const frame = useCurrentFrame();
	const sh = shake(frame, SHAKE_HITS, 8, 7);
	// Hard mask at the TikTok/IG safe area (x 60-960, y 250-1440).
	return (
		<AbsoluteFill style={{clipPath: 'inset(250px 120px 480px 60px)'}}>
			<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
				{/* Hook scoreboard and end card are Hyperframes renders (hyperframes/comeback). */}
				<HfOverlay dir="comeback/hf/hook" from={T.hook} frames={90} />
				<Semalam frame={frame} />
				<Half frame={frame} />
				<Tragedi frame={frame} />
				<Fancy frame={frame} />
				<Tolong frame={frame} />
				<Control frame={frame} />
				<Mental frame={frame} />
				<Boleh frame={frame} />
				<Menang frame={frame} />
				<Henjut frame={frame} />
				<Minit frame={frame} />
				<LetsGo frame={frame} />
				<HfOverlay dir="comeback/hf/endcard" from={T.outro} frames={54} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
