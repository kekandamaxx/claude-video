import React from 'react';
import {AbsoluteFill, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {EDL} from './edl';
import {C, FONT_DISPLAY} from '../../lib/theme';
import {clamp, pop, window01} from '../../lib/anim';
import {Ball, Display, Pill, TopZone} from '../../components/ui';

const {at, seg, segEnd} = EDL;
const start = (id: string) => seg(id).outFrom;

// ---------------------------------------------------------------- key moments (output frames)
export const T = {
	hook: start('hook'),
	fly: at('hook', 32.38),
	belum: at('hook', 32.75),
	penalti: at('hook', 33.3),
	hookEnd: segEnd('hook'),
	kenapa: start('kenapa'),
	kenapaWord: at('kenapa', 27.36),
	kenapaEnd: segEnd('kenapa'),
	sebab: start('sebab'),
	wallWord: at('sebab', 36.28),
	sampai: at('sebab', 36.56),
	bola: at('sebab', 37.46),
	sebabEnd: segEnd('sebab'),
	kalau: start('kalau'),
	lambung: at('kalau', 23.1),
	wall: start('wall'),
	move: at('wall', 25.6),
	tutup: start('tutup'),
	tutupWord: at('tutup', 26.45),
	tutupEnd: segEnd('tutup'),
	sharp: start('sharp'),
	sharpWord: at('sharp', 21.48),
	sharpEnd: segEnd('sharp'),
	kenamove: start('kenamove'),
	move1: start('move1'),
	move1Word: at('move1', 11.38),
	move2: start('move2'),
	move2Word: at('move2', 12.2),
	point: at('move2', 12.5), // hand out, pointing where the ball goes
	move2End: segEnd('move2'),
	outro: start('outro'),
	end: EDL.totalFrames,
};

// HyperFrames boards (hyperframes/tactics): ball lands 1.80 s (lob) / 0.67 s (sharp) after the clip starts.
export const BOARD = {
	lob: T.kalau,
	lobLand: T.kalau + 54,
	sharp: T.sharpWord - 20, // flat pass arrives on the word "sharp"
	sharpLand: T.sharpWord,
	sharpShot: T.sharpWord + 9,
};

export const SHAKE_HITS = [T.penalti + 1, T.wallWord + 1, BOARD.lobLand + 1, T.tutupWord + 1, T.move1Word + 1, T.move2Word + 1, T.outro + 2];

// ---------------------------------------------------------------- 1. hook: FLY ≠ PENALTI
const Hook: React.FC<{frame: number}> = ({frame}) => {
	if (frame >= T.hookEnd + 2) return null;
	const fly = frame >= T.fly - 2 ? pop(frame, T.fly - 2, 9, 0.6) : 0;
	const pen = frame >= T.penalti - 2 ? pop(frame, T.penalti - 2, 8, 0.8) : 0;
	const strike = interpolate(frame, [T.penalti + 2, T.penalti + 8], [0, 1], clamp);
	const out = interpolate(frame, [T.hookEnd - 4, T.hookEnd + 2], [1, 0], clamp);
	return (
		<TopZone style={{top: 280, height: 420}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, opacity: out}}>
				<Pill dot style={{opacity: interpolate(frame, [0, 6], [0, 1], clamp)}}>Tip coach · Handball</Pill>
				<div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `scale(${fly})`}}>
					<Display size={150} color={C.gold}>Fly</Display>
					<Display size={120} style={{opacity: pen}}>≠</Display>
				</div>
				<div style={{position: 'relative', transform: `rotate(-4deg) scale(${2 - pen})`, opacity: Math.min(1, pen * 1.5)}}>
					<div style={{padding: '6px 34px', border: `9px solid ${C.red}`, borderRadius: 18, background: 'rgba(255,255,255,0.95)', color: C.red, fontFamily: FONT_DISPLAY, fontSize: 116, letterSpacing: 4, boxShadow: '0 14px 30px rgba(0,0,0,0.45)'}}>PENALTI</div>
					<div style={{position: 'absolute', left: -12, right: -12, top: '50%', height: 14, marginTop: -7, borderRadius: 7, background: C.red, transform: `scaleX(${strike}) rotate(-7deg)`, transformOrigin: 'left center', boxShadow: '0 4px 10px rgba(0,0,0,0.35)'}} />
				</div>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 1b. SEBAB DIA KENAPA?
const Kenapa: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.kenapa || frame >= T.kenapaEnd) return null;
	const v = window01(frame, T.kenapa, T.kenapaEnd, 3);
	const k = pop(frame, T.kenapa, 10, 0.5);
	const q = frame >= T.kenapaWord ? pop(frame, T.kenapaWord, 7, 0.6) : 0;
	return (
		<TopZone style={{top: 300, height: 380}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 6, opacity: v}}>
				<Display size={150} color={C.white} style={{transform: `scale(${k})`}}>Kenapa</Display>
				<Display size={190} color={C.gold} style={{transform: `scale(${q}) rotate(${(1 - q) * 40 + 10}deg)`, transformOrigin: '50% 80%'}}>?</Display>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 2. race: WALL vs BOLA, wall arrives first
const Race: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.sebab || frame >= T.sebabEnd) return null;
	const v = window01(frame, T.sebab, T.sebabEnd, 4);
	// Wall fills fast from "wall"; ball crawls and only arrives on "bola".
	const wallP = interpolate(frame, [T.wallWord - 2, T.sampai + 8], [0, 1], {...clamp, easing: (t) => 1 - (1 - t) ** 3});
	const ballP = interpolate(frame, [T.wallWord, T.bola + 2], [0, 0.86], clamp);
	const win = frame >= T.sampai + 8 ? pop(frame, T.sampai + 8, 9, 0.6) : 0;
	const lane = (label: string, color: string, p: number, icon: React.ReactNode, badge?: React.ReactNode) => (
		<div style={{display: 'flex', alignItems: 'center', gap: 18, width: 820}}>
			<div style={{width: 150, fontFamily: FONT_DISPLAY, fontSize: 64, color, textShadow: `0 4px 0 ${C.navy}`}}>{label}</div>
			<div style={{position: 'relative', flex: 1, height: 64, borderRadius: 32, background: 'rgba(10,22,51,0.82)', border: '3px solid rgba(255,255,255,0.18)'}}>
				<div style={{position: 'absolute', left: 6, top: 6, bottom: 6, width: `calc(${p * 100}% - ${12 * p}px)`, borderRadius: 26, background: color}} />
				<div style={{position: 'absolute', right: 10, top: 6, bottom: 6, width: 8, borderRadius: 4, background: C.white, opacity: 0.85}} />
				<div style={{position: 'absolute', top: '50%', left: `calc(${p * 100}% - ${p * 60}px)`, transform: 'translate(-10%, -50%)'}}>{icon}</div>
			</div>
			<div style={{width: 120}}>{badge}</div>
		</div>
	);
	return (
		<TopZone style={{top: 290, height: 400}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: v}}>
				<Pill bg={C.navySoft} style={{transform: `scale(${pop(frame, T.sebab, 12)})`}}>Siapa sampai dulu?</Pill>
				{lane('WALL', C.red, wallP, <div style={{width: 52, height: 52, borderRadius: 26, background: C.white, border: `6px solid ${C.red}`}} />, <Pill bg={C.red} style={{fontSize: 30, padding: '8px 16px', transform: `scale(${win})`}}>1st</Pill>)}
				{lane('BOLA', C.gold, ballP, <Ball size={56} rotate={frame * 9} />)}
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- 3/4. HyperFrames tactics boards (alpha WebM)
const Board: React.FC<{src: string; from: number; until: number}> = ({src, from, until}) => {
	const frame = useCurrentFrame();
	const out = interpolate(frame, [until - 6, until], [1, 0], clamp);
	return (
		<Sequence from={from} durationInFrames={until - from} name={`board:${src}`} layout="none">
			<div style={{position: 'absolute', left: 60, top: 262, width: 900, height: 460, opacity: out, transform: `scale(${0.96 + 0.04 * out})`}}>
				<OffthreadVideo src={staticFile(`training/overlays/${src}.webm`)} transparent muted style={{width: 900, height: 460}} />
			</div>
		</Sequence>
	);
};

// ---------------------------------------------------------------- TUTUP stamp (on the word, over the lob board's lock)
const Tutup: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.tutupWord - 2 || frame >= T.tutupEnd + 4) return null;
	const k = pop(frame, T.tutupWord - 2, 8, 0.7);
	const out = interpolate(frame, [T.tutupEnd - 2, T.tutupEnd + 4], [1, 0], clamp);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 770, display: 'flex', justifyContent: 'center', opacity: out}}>
			<div style={{padding: '2px 30px', borderRadius: 16, background: C.red, color: C.white, fontFamily: FONT_DISPLAY, fontSize: 96, letterSpacing: 4, transform: `rotate(-6deg) scale(${2.2 - 1.2 * k})`, opacity: Math.min(1, k * 1.6), boxShadow: '0 14px 30px rgba(0,0,0,0.45)'}}>TUTUP!</div>
		</div>
	);
};

// ---------------------------------------------------------------- MOVE! calls + direction arrow (coach points the ball's way)
const Move: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.move1 || frame >= T.outro + 6) return null;
	const out = interpolate(frame, [T.outro, T.outro + 6], [1, 0], clamp);
	const second = frame >= T.move2Word - 1;
	const hit = second ? T.move2Word - 1 : T.move1Word - 1;
	const k = frame >= hit ? pop(frame, hit, 8, 0.7) : 0;
	const arrow = interpolate(frame, [T.point, T.point + 12], [0, 1], {...clamp, easing: (t) => 1 - (1 - t) ** 3});
	const ballX = interpolate(frame, [T.point, T.move2End], [0, 1], clamp);
	const label = frame >= T.point + 6 ? pop(frame, T.point + 6, 11, 0.5) : 0;
	return (
		<TopZone style={{top: 270, height: 470, opacity: out}}>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
				<div style={{display: 'flex', alignItems: 'flex-end', gap: 16, transform: `rotate(-4deg) scale(${1.5 - 0.5 * k})`, opacity: Math.min(1, k * 1.6)}}>
					<Display size={second ? 170 : 150} color={C.gold}>Move!</Display>
					<Pill bg={C.red} style={{fontSize: 34, padding: '6px 16px', marginBottom: 18}}>{second ? '×2' : '×1'}</Pill>
				</div>
				{/* Arrow sweeps the way the coach's hand points (screen right), ball rides it. */}
				<div style={{position: 'relative', width: 760, height: 110, opacity: arrow > 0 ? 1 : 0}}>
					<svg width={760} height={110} viewBox="0 0 760 110" style={{position: 'absolute', inset: 0, overflow: 'visible', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))'}}>
						<path d={`M20 55 H${20 + 660 * arrow}`} stroke={C.white} strokeWidth={18} strokeLinecap="round" strokeDasharray="1 34" />
						<path d={`M20 55 H${20 + 660 * arrow}`} stroke={C.gold} strokeWidth={10} strokeLinecap="round" />
						<path d={`M${640 * arrow + 20} 15 L${700 * arrow + 30} 55 L${640 * arrow + 20} 95`} fill="none" stroke={C.gold} strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={arrow} />
					</svg>
					<div style={{position: 'absolute', top: 55, left: 20 + 560 * ballX * arrow, transform: 'translate(-50%, -50%)'}}>
						<Ball size={70} rotate={frame * 14} />
					</div>
				</div>
				<Pill bg={C.navySoft} style={{transform: `scale(${label})`, fontSize: 32}}>Ikut arah bola</Pill>
			</div>
		</TopZone>
	);
};

// ---------------------------------------------------------------- outro card
const EndCard: React.FC<{frame: number}> = ({frame}) => {
	const from = T.outro + 6;
	if (frame < from) return null;
	const a = pop(frame, from, 12, 0.6);
	const b = frame >= from + 8 ? pop(frame, from + 8, 10, 0.6) : 0;
	const c = frame >= from + 18 ? pop(frame, from + 18, 14, 0.5) : 0;
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(10,22,51,0.0) 0%, rgba(10,22,51,0.55) 14%, rgba(10,22,51,0.55) 40%, rgba(10,22,51,0) 52%)', opacity: interpolate(frame, [from, from + 8], [0, 1], clamp)}} />
			<TopZone style={{top: 300, height: 440}}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
					<div style={{display: 'flex', alignItems: 'center', gap: 18, transform: `scale(${a})`}}>
						<div style={{position: 'relative'}}>
							<Display size={92} color="rgba(255,255,255,0.75)">Bola lambung</Display>
							<div style={{position: 'absolute', left: -8, right: -8, top: '48%', height: 10, borderRadius: 5, background: C.red, transform: `scaleX(${interpolate(frame, [from + 4, from + 10], [0, 1], clamp)})`, transformOrigin: 'left'}} />
						</div>
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 20, transform: `scale(${b})`}}>
						<Display size={150} color={C.green}>Pass sharp</Display>
					</div>
					<Pill bg={C.gold} color={C.navy} style={{transform: `scale(${c})`, fontSize: 32}}>Bola sampai dulu sebelum wall</Pill>
				</div>
			</TopZone>
		</AbsoluteFill>
	);
};

export const Graphics: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<Hook frame={frame} />
			<Kenapa frame={frame} />
			<Race frame={frame} />
			<Board src="lob" from={BOARD.lob} until={T.tutupEnd + 2} />
			<Tutup frame={frame} />
			<Board src="sharp" from={BOARD.sharp} until={T.move1 + 3} />
			<Move frame={frame} />
			<EndCard frame={frame} />
		</AbsoluteFill>
	);
};
