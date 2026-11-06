import manifest from './photos.json';
import {Layout, Motion, REMAINDER_SCENE, SCENES, SceneSpec, ShotSpec, TextKey, Transition} from './story';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type Face = {x: number; y: number; w: number; h: number; score: number};
export type Photo = {id: string; file: string; src: string; bg: string; width: number; height: number; faces: Face[]};

export type Clip = {
	index: number;
	photo: Photo;
	scene: SceneSpec['key'];
	/** Frames the clip is on screen (includes the transition overlaps). */
	from: number;
	to: number;
	/** The clip's own slot (no overlaps). */
	slotFrom: number;
	slotTo: number;
	inT: {type: Transition; frames: number};
	outT: {type: Transition; frames: number};
	motion: Motion;
	layout: Layout;
	text?: {key: TextKey; from: number; to: number};
};

export type SceneRange = {key: SceneSpec['key']; title: string; from: number; to: number};
export type TransitionEvent = {type: Transition; from: number; frames: number};

const f = (s: number) => Math.round(s * FPS);

export const PHOTOS: Photo[] = (manifest as {photos: Photo[]}).photos;

/** Scene specs with every manifest photo assigned exactly once (throws on unknown / duplicate ids). */
export const resolveScenes = (scenes: SceneSpec[] = SCENES, photos: Photo[] = PHOTOS): SceneSpec[] => {
	const known = new Set(photos.map((p) => p.id));
	const seen = new Map<string, string>();
	for (const s of scenes) {
		for (const shot of s.shots) {
			if (!known.has(shot.id)) throw new Error(`story.ts: scene "${s.key}" lists "${shot.id}", which is not in photos.json`);
			if (seen.has(shot.id)) throw new Error(`story.ts: "${shot.id}" is used in "${seen.get(shot.id)}" and "${s.key}"`);
			seen.set(shot.id, s.key);
		}
	}
	const rest: ShotSpec[] = photos.filter((p) => !seen.has(p.id)).map((p) => ({id: p.id, motion: 'auto'}));
	return scenes.map((s) => (s.key === REMAINDER_SCENE ? {...s, shots: [...s.shots, ...rest]} : s));
};

const AUTO_MOTIONS: Motion[] = ['zoomIn', 'panRight', 'zoomOut', 'panLeft', 'panUp'];

export const buildTimeline = (scenes: SceneSpec[] = resolveScenes()) => {
	const byId = new Map(PHOTOS.map((p) => [p.id, p]));
	const clips: Clip[] = [];
	const ranges: SceneRange[] = [];
	const transitions: TransitionEvent[] = [];
	let t = 0; // seconds
	let autoIdx = 0;
	for (let si = 0; si < scenes.length; si++) {
		const s = scenes[si];
		const n = s.shots.length;
		const seconds = Math.max(s.seconds, n * s.minHold);
		const from = f(t);
		const to = f(t + seconds);
		ranges.push({key: s.key, title: s.title, from, to});
		const slot = seconds / Math.max(1, n);
		s.shots.forEach((shot, i) => {
			const isFirst = i === 0;
			const inT = isFirst && s.entry ? {type: s.entry.transition, frames: f(s.entry.seconds)} : {type: s.transition, frames: f(s.transitionSeconds)};
			const slotFrom = f(t + i * slot);
			const slotTo = f(t + (i + 1) * slot);
			const photo = byId.get(shot.id)!;
			const motion = shot.motion && shot.motion !== 'auto' ? shot.motion : AUTO_MOTIONS[autoIdx++ % AUTO_MOTIONS.length];
			clips.push({
				index: clips.length,
				photo,
				scene: s.key,
				from: slotFrom - Math.floor(inT.frames / 2),
				to: slotTo, // extended below once the next clip's transition is known
				slotFrom,
				slotTo,
				inT,
				outT: {type: 'toBlack', frames: f(1.5)},
				motion,
				layout: shot.layout ?? 'auto',
				text: shot.text ? {key: shot.text.key, from: slotFrom + f(shot.text.inAt), to: slotFrom + f(shot.text.outAt)} : undefined,
			});
			if (inT.type === 'lightLeak' || inT.type === 'filmBurn') transitions.push({type: inT.type, from: slotFrom - Math.floor(inT.frames / 2), frames: inT.frames});
		});
		t += seconds;
	}
	// Outgoing side of each cut: the next clip's in-transition (or a fade to black for the last photo).
	for (let i = 0; i < clips.length; i++) {
		const next = clips[i + 1];
		const c = clips[i];
		if (next && next.slotFrom === c.slotTo) {
			c.outT = next.inT.type === 'fadeFromBlack' ? {type: 'toBlack', frames: next.inT.frames} : next.inT;
		} else {
			// Followed by a text scene: use that scene's transition length (fade to black).
			const nextScene = scenes.find((s) => ranges.find((r) => r.key === s.key)!.from === c.slotTo);
			c.outT = {type: 'toBlack', frames: f(nextScene?.transitionSeconds || 1.5)};
		}
		c.to = c.slotTo + Math.ceil(c.outT.frames / 2);
	}
	const totalFrames = f(t);
	return {clips, ranges, transitions, totalFrames};
};

export const TIMELINE = buildTimeline();
export type Timeline = typeof TIMELINE;
export const sceneRange = (key: SceneSpec['key']) => TIMELINE.ranges.find((r) => r.key === key)!;
