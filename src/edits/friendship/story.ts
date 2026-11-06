/**
 * "A Friendship to Remember": every editable decision lives here.
 *
 * Photos come from src/edits/friendship/photos.json, which scripts/prepare_friendship.sh writes
 * from assets/friendship/photos/. Scenes refer to photos by id (the filename without extension).
 * A photo the scenes do not list is appended to `REMAINDER_SCENE` automatically, so adding
 * photos to the folder and re-running the prep script is enough to include them.
 * timeline.ts refuses to build if an id is unknown or used twice.
 */

export type Motion = 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' | 'panUp' | 'panDown' | 'auto';
export type Layout = 'auto' | 'cover' | 'contain';
export type Transition = 'fadeFromBlack' | 'dissolve' | 'lightLeak' | 'filmBurn' | 'drift' | 'toBlack';

export type ShotSpec = {
	id: string;
	motion?: Motion;
	layout?: Layout;
	/** Text shown over this photo (appreciation scene). */
	text?: {key: TextKey; inAt: number; outAt: number};
};

export type SceneSpec = {
	key: 'opening' | 'beginning' | 'laughter' | 'journey' | 'appreciation' | 'ending';
	title: string;
	/** Seconds on the timeline (photo scenes stretch if needed to give each photo `minHold`). */
	seconds: number;
	minHold: number;
	/** Transition into every photo of this scene, and its length in seconds. */
	transition: Transition;
	transitionSeconds: number;
	/** Transition into the scene's first photo (scene boundary). */
	entry?: {transition: Transition; seconds: number};
	shots: ShotSpec[];
};

export type TextKey =
	| 'open1' | 'open2'
	| 'thanks1' | 'thanks2'
	| 'end1' | 'end2'
	| 'final' | 'signature';

/** All on-screen copy. Also exposed as Remotion props, so it can be edited in the Studio. */
export const TEXT: Record<TextKey, string> = {
	open1: 'Some people come into our lives…',
	open2: '…and become part of our greatest memories.',
	thanks1: 'Through every moment, every laugh and every memory…',
	thanks2: 'Thank you for being part of this journey.',
	end1: 'True friendship is not measured by time…',
	end2: '…but by the memories we create together.',
	final: 'Some memories last forever.',
	signature: 'A Friendship to Remember',
};

/**
 * Timing is cut to the soundtrack (see MUSIC): soft piano until 78 s, strings enter at 78 s,
 * a breakdown at ~101 s, the climax at ~119 s, and the piano outro from ~145 s.
 */
export const SCENES: SceneSpec[] = [
	{key: 'opening', title: 'Opening', seconds: 10, minHold: 0, transition: 'dissolve', transitionSeconds: 0, shots: []},
	{
		key: 'beginning', title: 'The Beginning of Memories', seconds: 34, minHold: 6,
		transition: 'dissolve', transitionSeconds: 1.8,
		entry: {transition: 'fadeFromBlack', seconds: 1.6},
		shots: [
			{id: '06-boardroom', motion: 'zoomIn'},
			{id: '02-numismatic-wall', motion: 'panRight'},
			{id: '03-mosque-visit', motion: 'zoomOut'},
			{id: '04-abu-waqqas-tomb', motion: 'panLeft'},
		],
	},
	{
		key: 'laughter', title: 'The Laughter and Moments', seconds: 34, minHold: 4.5,
		transition: 'drift', transitionSeconds: 1.0,
		entry: {transition: 'lightLeak', seconds: 1.6},
		shots: [
			{id: '07-mamak-night', motion: 'zoomIn'},
			{id: '09-wicker-chairs', motion: 'panLeft'},
			{id: '08-park-meetup', motion: 'panUp'},
			{id: '14-night-stall', motion: 'zoomIn'},
			{id: '10-wedding-dais', motion: 'zoomOut'},
		],
	},
	{
		key: 'journey', title: 'The Journey Together', seconds: 41, minHold: 5,
		transition: 'dissolve', transitionSeconds: 1.6,
		entry: {transition: 'filmBurn', seconds: 1.4},
		shots: [
			{id: '11-yellow-scarves', motion: 'zoomIn'},
			{id: '15-airport-elder', motion: 'zoomOut'},
			{id: '16-bench-elder', motion: 'zoomIn'},
			{id: '12-hospital-visit', motion: 'panDown'},
			{id: '13-grave-visit', motion: 'zoomOut'},
		],
	},
	{
		key: 'appreciation', title: 'The Appreciation', seconds: 26, minHold: 9,
		transition: 'dissolve', transitionSeconds: 2.4,
		entry: {transition: 'lightLeak', seconds: 2.4},
		shots: [
			{id: '05-night-gathering', motion: 'zoomIn', text: {key: 'thanks1', inAt: 1.6, outAt: 11.2}},
			{id: '01-raya-group', motion: 'zoomIn', text: {key: 'thanks2', inAt: 1.8, outAt: 11.6}},
		],
	},
	{key: 'ending', title: 'Final Ending', seconds: 27, minHold: 0, transition: 'toBlack', transitionSeconds: 2.6, shots: []},
];

/** Photos missing from SCENES go here (the brief: "Scene 4 shows the remaining photographs"). */
export const REMAINDER_SCENE: SceneSpec['key'] = 'journey';

/** Seconds, relative to the start of the opening / ending scenes. */
export const OPENING = {line1In: 0.9, line2In: 4.1, out: 8.3, outDur: 1.3};
export const ENDING = {line1In: 2.2, line2In: 5.6, out: 12.6, outDur: 1.6, finalIn: 15.2, signatureIn: 17.4, finalOut: 23.2, finalOutDur: 2.2};

export const MUSIC = {
	file: 'friendship/music.wav',
	credit: 'Music: "We Will Get It" by Eugenio Mininni (Mixkit, free licence)',
	/** The cut made in prepare_friendship.sh (source seconds). */
	cutFrom: 97.45,
	cutTo: 174.59,
	fadeInSeconds: 1.0,
	fadeOutSeconds: 7.0,
	volume: 1.0,
};

/** Look of the film. Values are CSS filter / overlay strengths. */
export const GRADE = {
	contrast: 1.06,
	saturate: 1.04,
	sepia: 0.1,
	brightness: 1.02,
	warmth: 0.16, // soft-light orange wash
	lift: 'rgb(26, 17, 10)', // film-fade black point (lighten blend)
	grain: 0.1,
	vignette: 0.55,
	glow: 0.12, // golden highlight bloom
};
