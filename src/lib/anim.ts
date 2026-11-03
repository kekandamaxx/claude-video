import {interpolate, spring} from 'remotion';
import {FPS} from './edl';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const pop = (frame: number, start: number, damping = 11, mass = 0.6) =>
	spring({frame: frame - start, fps: FPS, config: {damping, mass, stiffness: 180}});

export const easeIn = (frame: number, start: number, dur: number) =>
	interpolate(frame, [start, start + dur], [0, 1], clamp);

/** Decaying shake offset (px) summed over every hit frame. */
export const shake = (frame: number, hits: number[], amp = 18, decay = 9) => {
	let x = 0;
	let y = 0;
	for (const h of hits) {
		const d = frame - h;
		if (d < 0 || d > decay * 3) continue;
		const k = Math.exp(-d / decay) * amp;
		x += Math.sin(d * 2.1) * k;
		y += Math.cos(d * 2.7) * k * 0.6;
	}
	return {x, y};
};

/** 1 while inside [from, to), with `fade`-frame ramps on both sides. */
export const window01 = (frame: number, from: number, to: number, fade = 5) => {
	const f = Math.max(0.5, Math.min(fade, (to - from) / 2 - 0.01));
	return interpolate(frame, [from - 0.001, from + f, to - f, to], [0, 1, 1, 0], clamp);
};
