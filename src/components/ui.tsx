import React from 'react';
import {C, FONT_DISPLAY, FONT_UI, TOP_ZONE} from '../lib/theme';

/** Absolutely positioned box covering the top graphics band (y 260-610). */
export const TopZone: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div
		style={{
			position: 'absolute',
			left: TOP_ZONE.x,
			top: TOP_ZONE.y,
			width: TOP_ZONE.w,
			height: TOP_ZONE.h,
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			...style,
		}}
	>
		{children}
	</div>
);

export const Pill: React.FC<{children: React.ReactNode; bg?: string; color?: string; dot?: boolean; style?: React.CSSProperties}> = ({children, bg = C.navySoft, color = C.white, dot, style}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 12,
			padding: '10px 22px',
			borderRadius: 999,
			background: bg,
			color,
			fontFamily: FONT_UI,
			fontWeight: 900,
			fontSize: 30,
			letterSpacing: 3,
			textTransform: 'uppercase',
			boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
			...style,
		}}
	>
		{dot ? <span style={{width: 14, height: 14, borderRadius: 7, background: C.red, boxShadow: `0 0 12px ${C.red}`}} /> : null}
		{children}
	</div>
);

export const Display: React.FC<{children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties}> = ({children, size, color = C.white, style}) => (
	<div
		style={{
			fontFamily: FONT_DISPLAY,
			fontSize: size,
			lineHeight: 0.95,
			color,
			letterSpacing: 1,
			textTransform: 'uppercase',
			textShadow: `0 ${Math.round(size * 0.05)}px 0 ${C.navy}, 0 12px 30px rgba(0,0,0,0.45)`,
			...style,
		}}
	>
		{children}
	</div>
);

/** Handball icon: gold sphere with navy seams. */
export const Ball: React.FC<{size: number; rotate?: number}> = ({size, rotate = 0}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${rotate}deg)`, filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.45))'}}>
		<defs>
			<radialGradient id="bg" cx="35%" cy="30%" r="75%">
				<stop offset="0%" stopColor="#FFF3C4" />
				<stop offset="45%" stopColor={C.gold} />
				<stop offset="100%" stopColor="#C98A00" />
			</radialGradient>
		</defs>
		<circle cx="50" cy="50" r="46" fill="url(#bg)" stroke={C.navy} strokeWidth="5" />
		<path d="M50 4 C 30 30, 30 70, 50 96" fill="none" stroke={C.navy} strokeWidth="5" />
		<path d="M50 4 C 70 30, 70 70, 50 96" fill="none" stroke={C.navy} strokeWidth="5" />
		<path d="M6 40 C 35 52, 65 52, 94 40" fill="none" stroke={C.navy} strokeWidth="5" />
	</svg>
);

export const RotateIcon: React.FC<{size: number; rotate: number}> = ({size, rotate}) => (
	<svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${rotate}deg)`}}>
		<path d="M80 50 A30 30 0 1 1 65 24" fill="none" stroke={C.gold} strokeWidth="11" strokeLinecap="round" />
		<path d="M58 8 L80 22 L60 40 Z" fill={C.gold} />
	</svg>
);

export const Check: React.FC<{size: number; progress: number}> = ({size, progress}) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<circle cx="50" cy="50" r="44" fill={C.green} />
		<path d="M28 52 L44 67 L73 35" fill="none" stroke={C.navy} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="70" strokeDashoffset={70 * (1 - progress)} />
	</svg>
);
