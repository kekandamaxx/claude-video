import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {EDL} from './edl';
import {C, FONT_DISPLAY} from '../../lib/theme';
import {clamp, easeIn, pop, shake, window01} from '../../lib/anim';
import {Check, Display, Pill, TopZone} from '../../components/ui';

const {at, seg, segEnd} = EDL;
const start = (id: string) => seg(id).outFrom;

const PINK = '#FF6F91';
const CREAM = '#F6E7B8';

// ---------------------------------------------------------------- key moments (output frames)
export const T = {
	sip: start('sip'),
	masya: at('sip', 6.08),
	sipEnd: segEnd('sip'),
	guava: start('guava'),
	warna: at('guava', 9.76),
	pink: at('guava', 10.5),
	tapi: at('guava', 11.08),
	mesir: at('guava', 11.82),
	colour: at('guava', 12.3),
	pekat: at('guava2', 13.74),
	sedap: at('guava2', 14.34),
	yaAllah: at('guava2', 14.82),
	sedapSangat: at('guava2', 15.8),
	guavaEnd: segEnd('guava2'),
	persenSeg: start('persen'),
	berapa: at('persen', 20.06),
	persenEnd: segEnd('persen'),
	dua: start('duaLima'),
	dua2: at('duaLima', 23.16),
	duaEnd: segEnd('duaLima'),
	pallet: start('pallet'),
	promo: at('pallet', 27.96),
	palletEnd: segEnd('pallet'),
	crates: start('crates'),
	cratesEnd: segEnd('crates'),
	bottle1: start('bottle1'),
	bottle1End: segEnd('bottle1'),
	tunggu: start('tunggu'),
	outro: EDL.cutEnd,
	end: EDL.totalFrames,
};

export const SHAKE_HITS = [T.masya + 1, T.pink + 1, T.mesir + 1, T.sedapSangat + 1, T.dua + 1, T.dua2 + 1, T.promo + 1, T.tunggu + 2];

// ---------------------------------------------------------------- zones for the talk shots
/** Strip above her head (y 255-410). */
const Strip: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{position: 'absolute', left: 70, top: 255, width: 880, height: 155, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14}}>{children}</div>
);
/** Column left of her (x 60-390, y 560-1150). */
const LeftCol: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{position: 'absolute', left: 64, top: 560, width: 320, height: 590, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12}}>{children}</div>
);

// ---------------------------------------------------------------- icons
const Fruit: React.FC<{size: number; flesh: string; label: string}> = ({size, flesh, label}) => (
	<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
		<svg width={size} height={size} viewBox="0 0 100 100" style={{filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.45))'}}>
			<circle cx="50" cy="50" r="46" fill="#7BB661" stroke={C.navy} strokeWidth="4" />
			<circle cx="50" cy="50" r="38" fill={flesh} />
			{[[50, 30], [34, 44], [66, 44], [40, 62], [60, 62], [50, 50]].map(([x, y], i) => (
				<ellipse key={i} cx={x} cy={y} rx="3" ry="4.5" fill="#E8D9A8" stroke="#8A6D3B" strokeWidth="1" />
			))}
		</svg>
		<Pill bg={C.navySoft} style={{fontSize: 26}}>{label}</Pill>
	</div>
);

const Stars: React.FC<{frame: number; from: number; size?: number}> = ({frame, from, size = 52}) => (
	<div style={{display: 'flex', gap: 6}}>
		{[0, 1, 2, 3, 4].map((i) => {
			const k = frame >= from + i * 3 ? pop(frame, from + i * 3, 8, 0.4) : 0;
			return (
				<svg key={i} width={size} height={size} viewBox="0 0 100 100" style={{transform: `scale(${k}) rotate(${(1 - k) * 90}deg)`, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))'}}>
					<path d="M50 5 L62 37 L96 38 L69 59 L79 92 L50 72 L21 92 L31 59 L4 38 L38 37 Z" fill={C.gold} stroke={C.navy} strokeWidth="5" strokeLinejoin="round" />
				</svg>
			);
		})}
	</div>
);

const Sparkles: React.FC<{frame: number; from: number}> = ({frame, from}) => (
	<div style={{position: 'relative', width: 280, height: 220}}>
		{[[30, 40, 70], [170, 10, 90], [110, 120, 60], [220, 140, 50], [40, 160, 44]].map(([x, y, s], i) => {
			const k = frame >= from + i * 2 ? pop(frame, from + i * 2, 7, 0.4) : 0;
			const fade = interpolate(frame, [from + 20 + i * 2, from + 34 + i * 2], [1, 0.35], clamp);
			return (
				<svg key={i} width={s} height={s} viewBox="0 0 100 100" style={{position: 'absolute', left: x, top: y, transform: `scale(${k}) rotate(${frame * 3}deg)`, opacity: fade}}>
					<path d="M50 0 C55 40 60 45 100 50 C60 55 55 60 50 100 C45 60 40 55 0 50 C40 45 45 40 50 0 Z" fill={C.gold} />
				</svg>
			);
		})}
	</div>
);

// ---------------------------------------------------------------- 1. hook: taste test + MasyaAllah
const Sip: React.FC<{frame: number}> = ({frame}) => {
	if (frame >= T.sipEnd) return null;
	return (
		<>
			<Strip>
				<Pill dot style={{transform: `scale(${pop(frame, 1, 12)})`, fontSize: 46}}>Uji rasa</Pill>
			</Strip>
			<LeftCol>
				<Sparkles frame={frame} from={T.masya - 2} />
			</LeftCol>
		</>
	);
};

// ---------------------------------------------------------------- 2. pink vs Mesir, pekat, sedap
const Guava: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.guava || frame >= T.guavaEnd) return null;
	const pinkK = frame >= T.warna - 2 ? pop(frame, T.warna - 2, 9, 0.5) : 0;
	const toMesir = frame >= T.tapi ? easeIn(frame, T.tapi, 8) : 0;
	const mesirK = frame >= T.mesir - 2 ? pop(frame, T.mesir - 2, 9, 0.5) : 0;
	const inSedap = frame >= T.pekat - 4;
	const stripOut = interpolate(frame, [T.guavaEnd - 4, T.guavaEnd], [1, 0], clamp);
	return (
		<>
			<Strip>
				<div style={{display: 'flex', gap: 14, alignItems: 'center', opacity: stripOut}}>
					{!inSedap ? (
						<Pill bg={frame >= T.tapi ? C.gold : C.navySoft} color={frame >= T.tapi ? C.navy : C.white} style={{fontSize: 46, transform: `scale(${pop(frame, T.guava, 12)})`}}>
							{frame >= T.tapi ? 'Guava Mesir' : 'Guava Malaysia?'}
						</Pill>
					) : (
						<>
							{[['Pekat', T.pekat], ['Sedap', T.sedap]].map(([label, t]) => {
								const k = frame >= (t as number) - 2 ? pop(frame, (t as number) - 2, 10, 0.5) : 0;
								return (
									<div key={label as string} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderRadius: 14, background: C.gold, transform: `scale(${k})`, boxShadow: '0 8px 20px rgba(0,0,0,0.35)'}}>
										<span style={{fontFamily: FONT_DISPLAY, fontSize: 72, color: C.navy, textTransform: 'uppercase'}}>{label as string}</span>
										<Check size={58} progress={easeIn(frame, (t as number) + 4, 8)} />
									</div>
								);
							})}
						</>
					)}
				</div>
			</Strip>
			<LeftCol>
				{!inSedap ? (
					<div style={{position: 'relative', width: 300, height: 420}}>
						{/* Malaysian guava: pink, struck through once she says "tapi" */}
						<div style={{position: 'absolute', left: 60 - 50 * toMesir, top: 20, transform: `scale(${pinkK * (1 - 0.45 * toMesir)})`, transformOrigin: '0 0', opacity: 1 - 0.4 * toMesir}}>
							<Fruit size={210} flesh={PINK} label="Pink" />
							<div style={{position: 'absolute', left: -10, top: 84, width: 220 * toMesir, height: 12, background: C.red, transform: 'rotate(-20deg)', borderRadius: 6}} />
						</div>
						<div style={{position: 'absolute', left: 40, top: 150, transform: `scale(${mesirK})`}}>
							<Fruit size={240} flesh={CREAM} label="Mesir" />
						</div>
					</div>
				) : (
					<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: frame >= T.sedapSangat - 3 ? 1 : 0}}>
						<Stars frame={frame} from={T.sedapSangat - 3} size={56} />
						<Display size={76} color={C.gold} style={{textAlign: 'center'}}>Sedap sangat</Display>
					</div>
				)}
			</LeftCol>
		</>
	);
};

// ---------------------------------------------------------------- 3. berapa persen? -> 25%
const Persen: React.FC<{frame: number}> = ({frame}) => {
	if (frame >= T.persenSeg && frame < T.persenEnd) {
		const k = frame >= T.berapa - 2 ? pop(frame, T.berapa - 2, 9, 0.6) : 0;
		return (
			<LeftCol>
				<Display size={200} color={C.gold} style={{transform: `scale(${k}) rotate(${Math.sin(frame * 0.5) * 4}deg)`}}>?%</Display>
				<Pill bg={C.navySoft} style={{fontSize: 26, opacity: k}}>Berapa persen?</Pill>
			</LeftCol>
		);
	}
	if (frame >= T.dua && frame < T.duaEnd) {
		const n = Math.round(interpolate(frame, [T.dua, T.dua + 12], [0, 25], clamp));
		const punch = frame >= T.dua2 ? 1.25 - 0.25 * pop(frame, T.dua2, 8, 0.6) : 1;
		return (
			<LeftCol>
				<div style={{padding: '10px 26px', borderRadius: 24, background: C.navySoft, border: `6px solid ${C.gold}`, transform: `scale(${punch})`, boxShadow: `0 0 30px ${C.gold}88`}}>
					<Display size={170} color={C.gold} style={{fontVariantNumeric: 'tabular-nums'}}>{n}%</Display>
				</div>
				<Pill bg={C.gold} color={C.navy} style={{fontSize: 28}}>Dalam ni</Pill>
			</LeftCol>
		);
	}
	return null;
};

// ---------------------------------------------------------------- 4. B-roll: PROMO + stills
const Promo: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.pallet || frame >= T.cratesEnd) return null;
	if (frame < T.crates) {
		const v = window01(frame, T.pallet, T.palletEnd, 4);
		const k = frame >= T.promo - 3 ? pop(frame, T.promo - 3, 8, 0.7) : 0;
		return (
			<TopZone>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: v}}>
					<Pill bg={C.red} dot style={{transform: `scale(${pop(frame, T.pallet, 12)})`, fontSize: 34}}>Tak sabar!</Pill>
					<Display size={200} color={C.gold} style={{transform: `scale(${frame >= T.promo - 3 ? 1.5 - 0.5 * k : 0}) rotate(-4deg)`}}>Promo</Display>
				</div>
			</TopZone>
		);
	}
	const v = window01(frame, T.crates, T.cratesEnd, 3);
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: v, transform: `scale(${pop(frame, T.crates, 10, 0.5)})`}}>
				<Display size={92}>Semua yang</Display>
				<Display size={130} color={C.gold}>best-best</Display>
			</div>
		</TopZone>
	);
};

/** Thin title over the bottle stills: only facts printed on the label. */
const BottleTitle: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.bottle1 || frame >= T.bottle1End) return null;
	return (
		<div style={{position: 'absolute', left: 70, top: 262, width: 880, display: 'flex', justifyContent: 'center', gap: 12, transform: `translateY(${(1 - pop(frame, T.bottle1, 12, 0.5)) * -60}px)`}}>
			<Pill bg={C.red} style={{fontSize: 42}}>Viva!</Pill>
			<Pill bg={C.navySoft} style={{fontSize: 42}}>Pomegranate · 250 ml</Pill>
		</div>
	);
};

// ---------------------------------------------------------------- 5. TUNGGU! + end card
const Tunggu: React.FC<{frame: number}> = ({frame}) => {
	if (frame < T.tunggu) return null;
	const k = pop(frame, T.tunggu, 8, 0.8);
	const outro = easeIn(frame, T.outro, 10);
	return (
		<TopZone>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
				<div style={{padding: '4px 30px', border: `9px solid ${C.red}`, borderRadius: 18, background: 'rgba(255,255,255,0.94)', color: C.red, fontFamily: FONT_DISPLAY, fontSize: 120, letterSpacing: 3, transform: `rotate(-5deg) scale(${2 - k})`, opacity: Math.min(1, k * 1.5), boxShadow: '0 14px 30px rgba(0,0,0,0.45)'}}>TUNGGU!</div>
				<div style={{display: 'flex', gap: 12, opacity: outro, transform: `scale(${0.8 + 0.2 * outro})`}}>
					<Pill bg={C.red} style={{fontSize: 34}}>Viva!</Pill>
					<Pill bg={C.gold} color={C.navy} style={{fontSize: 34}}>Promo akan datang</Pill>
				</div>
			</div>
		</TopZone>
	);
};

export const Graphics: React.FC = () => {
	const frame = useCurrentFrame();
	const sh = shake(frame, SHAKE_HITS, 8, 7);
	// Hard mask at the TikTok/IG safe area (x 60-960, y 250-1440).
	return (
		<AbsoluteFill style={{clipPath: 'inset(250px 120px 480px 60px)'}}>
			<AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
				<Sip frame={frame} />
				<Guava frame={frame} />
				<Persen frame={frame} />
				<Promo frame={frame} />
				<BottleTitle frame={frame} />
				<Tunggu frame={frame} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

