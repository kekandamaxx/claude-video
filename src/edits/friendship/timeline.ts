import beatsJson from './beats.json';
import manifest from './photos.json';
import {Layout, Motion, REMAINDER_SCENE, SCENES, SceneSpec, ShotSpec, TextKey, Transition} from './story';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type Face = {x: number; y: number; w: number; h: number; score: number};
export type Photo = {id: string; file: string; src: string; bg: string; width: number; height: number; faces: Face[]};

export type Clip = {
	index: number;
	photos: Photo[]; // 1 photo, or 2 for a side-by-side pair
	scene: SceneSpec['key'];
	/** Frames on screen (including the transition overlaps and any hold into the next scene). */
	from: number;
	to: number;
	/** The shot's own slot, downbeat to downbeat. */
	slotFrom: number;
	slotTo: number;
	inT: {type: Transition; frames: number};
	outT: {type: Transition; frames: number};
	motion: Motion;
	layout: Layout;
	/** Frame the second photo of a pair starts to appear. */
	pairFrom?: number;
	text?: {key: TextKey; from: number; to: number};
	/** Held into the ending: dims from slotTo. */
	held: boolean;
};

export type SceneRange = {key: SceneSpec['key']; title: string; from: number; to: number; fromBar: number};
export type TransitionEvent = {type: Transition; from: number; frames: number};

/** Downbeat grid of the soundtrack. Bars past the end of the track are extrapolated. */
const GRID = beatsJson as {beat: number; downbeats: number[]};
export const BEAT = GRID.beat;
export const barTime = (bar: number) => {
	const d = GRID.downbeats;
	const i = Math.floor(bar);
	const frac = bar - i;
	const at = (k: number) => (k < d.length ? d[k] : d[d.length - 1] + (k - d.length + 1) * BEAT * 4);
	return at(i) + frac * (at(i + 1) - at(i));
};
export const barFrame = (bar: number) => Math.round(barTime(bar) * FPS);
export const beatsToFrames = (beats: number) => Math.round(beats * BEAT * FPS);

export const PHOTOS: Photo[] = (manifest as {photos: Photo[]}).photos;

const shotIds = (s: ShotSpec) => (s.pair ? [s.id, s.pair] : [s.id]);

/** Scene specs with every manifest photo assigned exactly once (throws on unknown / duplicate ids). */
export const resolveScenes = (scenes: SceneSpec[] = SCENES, photos: Photo[] = PHOTOS): SceneSpec[] => {
	const known = new Set(photos.map((p) => p.id));
	const seen = new Map<string, string>();
	for (const s of scenes) {
		for (const shot of s.shots) {
			for (const id of shotIds(shot)) {
				if (!known.has(id)) throw new Error(`story.ts: scene "${s.key}" lists "${id}", which is not in photos.json`);
				if (seen.has(id)) throw new Error(`story.ts: "${id}" is used in "${seen.get(id)}" and "${s.key}"`);
				seen.set(id, s.key);
			}
		}
	}
	const rest: ShotSpec[] = photos.filter((p) => !seen.has(p.id)).map((p) => ({id: p.id, bars: 2, motion: 'auto'}));
	return scenes.map((s) => (s.key === REMAINDER_SCENE ? {...s, shots: [...s.shots, ...rest]} : s));
};

const AUTO_MOTIONS: Motion[] = ['zoomIn', 'panRight', 'zoomOut', 'panLeft', 'panUp'];

export const buildTimeline = (scenes: SceneSpec[] = resolveScenes()) => {
	const byId = new Map(PHOTOS.map((p) => [p.id, p]));
	const clips: Clip[] = [];
	const ranges: SceneRange[] = [];
	const transitions: TransitionEvent[] = [];
	let bar = 0;
	let autoIdx = 0;
	for (const s of scenes) {
		const fromBar = bar;
		if (!s.shots.length) {
			bar += s.bars ?? 0;
		}
		for (const shot of s.shots) {
			const type = shot.transition ?? s.transition;
			const frames = beatsToFrames(shot.transitionBeats ?? s.transitionBeats);
			const slotFrom = barFrame(bar);
			const slotTo = barFrame(bar + shot.bars);
			const motion = shot.motion && shot.motion !== 'auto' ? shot.motion : AUTO_MOTIONS[autoIdx++ % AUTO_MOTIONS.length];
			const beatF = (b: number) => slotFrom + beatsToFrames(b);
			clips.push({
				index: clips.length,
				photos: shotIds(shot).map((id) => byId.get(id)!),
				scene: s.key,
				from: slotFrom - Math.floor(frames / 2),
				to: slotTo,
				slotFrom,
				slotTo,
				inT: {type, frames},
				outT: {type: 'toBlack', frames: beatsToFrames(2)},
				motion,
				layout: shot.layout ?? 'auto',
				pairFrom: shot.pair ? beatF(shot.pairDelayBeats ?? 4) : undefined,
				text: shot.text ? {key: shot.text.key, from: beatF(shot.text.inBeat), to: beatF(shot.text.outBeat)} : undefined,
				held: !!shot.holdBars,
			});
			if (type === 'lightLeak' || type === 'filmBurn') transitions.push({type, from: slotFrom - Math.floor(frames / 2), frames});
			bar += shot.bars;
			if (shot.holdBars) clips[clips.length - 1].to = barFrame(bar + shot.holdBars);
		}
		ranges.push({key: s.key, title: s.title, from: barFrame(fromBar), to: barFrame(bar), fromBar});
	}
	// Outgoing side of each cut: the next shot's transition, or a fade to black.
	for (let i = 0; i < clips.length; i++) {
		const c = clips[i];
		const next = clips[i + 1];
		if (c.held) {
			c.outT = {type: 'toBlack', frames: beatsToFrames(4)};
			continue; // `to` already set by holdBars; the ending scene controls its fade
		}
		if (next && next.slotFrom === c.slotTo) {
			c.outT = next.inT.type === 'fadeFromBlack' ? {type: 'toBlack', frames: next.inT.frames} : next.inT;
		} else {
			c.outT = {type: 'toBlack', frames: beatsToFrames(3)};
		}
		c.to = c.slotTo + Math.ceil(c.outT.frames / 2);
	}
	const totalFrames = barFrame(bar);
	return {clips, ranges, transitions, totalFrames};
};

export const TIMELINE = buildTimeline();
export type Timeline = typeof TIMELINE;
export const sceneRange = (key: SceneSpec['key']) => TIMELINE.ranges.find((r) => r.key === key)!;
