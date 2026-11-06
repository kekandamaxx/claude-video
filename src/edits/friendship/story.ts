/**
 * "A Friendship to Remember": every editable decision lives here.
 *
 * Photos come from src/edits/friendship/photos.json (written by scripts/prepare_friendship.sh from
 * assets/friendship/photos/). Shots refer to photos by id (filename without extension); a shot can
 * hold two portrait photos side by side (`pair`). A photo no shot lists is appended to
 * `REMAINDER_SCENE`, so new photos are never dropped. timeline.ts refuses unknown or repeated ids.
 *
 * Timing is musical: shots are measured in bars of the soundtrack (76 BPM 4/4, ~3.12 s per bar) and
 * every cut is centred on a real downbeat from beats.json. Transition lengths are in beats.
 *
 * Soundtrack map (bars): piano 0-25 · strings enter 25 · music seam 32 · breakdown 34-36 ·
 * rebuild 36-40 · climax 40-48 · piano outro 48-57.
 */

export type Motion = 'zoomIn' | 'zoomOut' | 'panLeft' | 'panRight' | 'panUp' | 'panDown' | 'auto';
export type Layout = 'auto' | 'cover' | 'contain';
export type Transition = 'fadeFromBlack' | 'dissolve' | 'lightLeak' | 'filmBurn' | 'toBlack';

export type TextKey = 'open1' | 'open2' | 'thanks1' | 'thanks2' | 'end1' | 'end2' | 'final' | 'signature';

export type ShotSpec = {
	id: string;
	/** Second portrait shown beside the first (a diptych); it arrives `pairDelayBeats` later. */
	pair?: string;
	pairDelayBeats?: number;
	bars: number;
	motion?: Motion;
	layout?: Layout;
	/** Transition into this shot (defaults to the scene's). */
	transition?: Transition;
	transitionBeats?: number;
	/** Line shown under the photo; beats from the shot's first downbeat. */
	text?: {key: TextKey; inBeat: number; outBeat: number};
	/** Keep the shot on screen this many bars into the next scene (it dims under the ending lines). */
	holdBars?: number;
};

export type SceneSpec = {
	key: 'opening' | 'beginning' | 'laughter' | 'journey' | 'appreciation' | 'ending';
	title: string;
	/** Length of a scene without photos (opening / ending), in bars. */
	bars?: number;
	transition: Transition;
	transitionBeats: number;
	shots: ShotSpec[];
};

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

export const SCENES: SceneSpec[] = [
	{key: 'opening', title: 'Opening', bars: 3, transition: 'dissolve', transitionBeats: 0, shots: []},
	{
		// Where it started, then the trip to Guangzhou: two friends, then the group grows to four.
		key: 'beginning', title: 'The Beginning of Memories', transition: 'dissolve', transitionBeats: 2,
		shots: [
			{id: '06-boardroom', bars: 3, motion: 'zoomOut', transition: 'fadeFromBlack', transitionBeats: 2},
			{id: '02-numismatic-wall', bars: 3, motion: 'panRight'},
			{id: '03-mosque-visit', bars: 3, motion: 'panRight'},
			{id: '04-abu-waqqas-tomb', bars: 3, motion: 'zoomIn'},
		],
	},
	{
		// Quicker: two-bar shots and one-beat dissolves. Night out, night food, late talk, then the
		// formal milestones (wedding, scarf ceremony) as a pair that closes the scene.
		key: 'laughter', title: 'The Laughter and Moments', transition: 'dissolve', transitionBeats: 1,
		shots: [
			{id: '07-mamak-night', bars: 2, motion: 'panLeft', transition: 'filmBurn', transitionBeats: 2},
			{id: '14-night-stall', bars: 2, motion: 'zoomIn'},
			{id: '09-wicker-chairs', bars: 2, motion: 'panRight'},
			{id: '10-wedding-dais', pair: '11-yellow-scarves', pairDelayBeats: 4, bars: 4, motion: 'panUp', transitionBeats: 2},
		],
	},
	{
		// Strings enter on the elder pair. The hospital visit sits on the breakdown, the grave visit on
		// the rebuild, so the climax lifts out of the quietest image.
		key: 'journey', title: 'The Journey Together', transition: 'dissolve', transitionBeats: 3,
		shots: [
			{id: '16-bench-elder', pair: '15-airport-elder', pairDelayBeats: 4, bars: 4, motion: 'panDown', transition: 'lightLeak', transitionBeats: 4},
			{id: '08-park-meetup', bars: 3, motion: 'panLeft'},
			{id: '12-hospital-visit', bars: 4, motion: 'zoomIn'},
			{id: '13-grave-visit', bars: 4, motion: 'zoomOut'},
		],
	},
	{
		// The climax: slower, one-bar dissolves, the two largest groups, the thank-you lines.
		key: 'appreciation', title: 'The Appreciation', transition: 'dissolve', transitionBeats: 4,
		shots: [
			{id: '05-night-gathering', bars: 4, motion: 'panLeft', transition: 'lightLeak', transitionBeats: 4, text: {key: 'thanks1', inBeat: 2, outBeat: 13.5}},
			{id: '01-raya-group', bars: 4, motion: 'zoomIn', holdBars: 4, text: {key: 'thanks2', inBeat: 2, outBeat: 14}},
		],
	},
	{key: 'ending', title: 'Final Ending', bars: 9, transition: 'toBlack', transitionBeats: 4, shots: []},
];

/** Photos missing from SCENES go here (the brief: "Scene 4 shows the remaining photographs"). */
export const REMAINDER_SCENE: SceneSpec['key'] = 'journey';

/** In beats from the start of the opening / ending scenes (4 beats = 1 bar). */
export const OPENING = {line1In: 1, line2In: 5, titleIn: 7.5, out: 9.75, outBeats: 1.5};
export const ENDING = {line1In: 2, line2In: 6.5, dimTo: 0.2, out: 14, outBeats: 2, photoOut: 16, finalIn: 21, signatureIn: 25, finalOut: 31, finalOutBeats: 3};

export const MUSIC = {
	file: 'friendship/music.wav',
	credit: 'Music: "We Will Get It" by Eugenio Mininni (Mixkit, free licence)',
	/** The cut made in prepare_friendship.sh (source seconds, both downbeats). */
	cutFrom: 99.8,
	cutTo: 171.48,
	fadeInSeconds: 0.8,
	fadeOutSeconds: 6.0,
	volume: 1.0,
};

/**
 * Camera speeds, constant through each shot (no ease-in/out, so moves never stall in a dissolve).
 * The amount of movement is speed x time on screen, so long and short shots move alike.
 */
export const CAMERA = {
	zoomPerSecond: 0.0075, // log-scale: about 7.8% over 10 s
	panPxPerSecond: 11, // output pixels
	cardScalePerSecond: 0.0042, // framed photos
	cardDriftPxPerSecond: 5,
	parallaxPxPerSecond: 12, // blurred backdrop, against the photo
};

/** Look of the film. Values are CSS filter / overlay strengths (photos are colour-matched first). */
export const GRADE = {
	contrast: 1.05,
	saturate: 1.03,
	sepia: 0.09,
	brightness: 1.02,
	warmth: 0.15, // soft-light orange wash
	lift: 'rgb(24, 16, 10)', // film-fade black point (lighten blend)
	grain: 0.09,
	vignette: 0.5,
	glow: 0.1, // golden highlight bloom
};
