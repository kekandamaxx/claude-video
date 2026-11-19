// Edit decision list for the training-night montage: ten phone clips of one session,
// joined into one source by scripts/prepare_training.sh (clip offsets in
// public/training/offsets.json). All times below are in that joined source.
//
// Unlike the coach talks, the music leads here: every cut sits on a beat of the drum
// bed (beats.ts), and only the coach's short calls from the court are kept as dialogue.
// Shots carry their own sound when the call happened on that shot; the hook lays the
// "Main, main" call over the close throw (visual override).
//
// Layout: faces sit at y 733-1205 in every clip (wide shots, heads <= 93 px), so the
// graphics use the ceiling band (y 260-610) and captions the floor band below the faces.
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';
import {beat} from './beats';

const FLOOR = 1320;
const MASTER = {kind: 'video' as const, master: 'training/video/master.mp4', proxy: 'training/video/proxy.mp4'};

type Shot = {
	id: string;
	/** Beats on the music grid: shot runs from beat `b` for `n` beats. */
	b: number;
	n: number;
	/** Source time of the picture (and of the sound, unless `call` is set). */
	pic: number;
	/** Keep the court sound: true = the shot's own, a number = sound from that source time. */
	call?: true | number;
	zoom?: [number, number];
	note: string;
};

const SHOTS: Shot[] = [
	// ---- HOOK (bars 0-1)
	{id: 'h1', b: 0, n: 4, pic: 240.0, call: 61.05, zoom: [1.0, 1.06], note: 'HOOK: close shot, she throws across the men; sound: coach "Main, main, main" (c03)'},
	{id: 'h2', b: 4, n: 4, pic: 8.6, zoom: [1.04, 1.0], note: 'catch and throw near the camera (c01)'},
	// ---- DRILL 1: passing (bars 2-5), two beats per shot
	{id: 'a1', b: 8, n: 2, pic: 72.3, zoom: [1.06, 1.02], note: 'goal-side close shot, she crosses the frame (c03)'},
	{id: 'a2', b: 10, n: 2, pic: 11.35, call: true, note: '"Pas. Pergi." (c01)'},
	{id: 'a3', b: 12, n: 2, pic: 94.0, zoom: [1.0, 1.05], note: 'defensive shuffle, four players (c04)'},
	{id: 'a4', b: 14, n: 2, pic: 66.0, zoom: [1.05, 1.0], note: 'she sprints along the line (c03)'},
	{id: 'a5', b: 16, n: 2, pic: 109.6, call: true, note: '"Low!" (c05)'},
	{id: 'a6', b: 18, n: 2, pic: 190.6, zoom: [1.0, 1.05], note: 'shuffle, men behind with hands up (c09)'},
	{id: 'a7', b: 20, n: 2, pic: 114.5, call: true, note: '"Move, move" (c05)'},
	{id: 'a8', b: 22, n: 2, pic: 3.3, zoom: [1.04, 1.0], note: 'ball in hand, wide (c01)'},
	// ---- COACH (bars 6-7)
	{id: 'c1', b: 24, n: 4, pic: 137.8, zoom: [1.0, 1.07], note: 'coach in the MALAYSIA shirt watching the drill (c07)'},
	{id: 'c2', b: 28, n: 4, pic: 98.2, call: true, note: 'coach close, clapping: "Good try, good try" (c04)'},
	// ---- DRILL 2: swap (bars 8-11)
	{id: 'b1', b: 32, n: 2, pic: 47.55, call: true, note: '"Swap." (c03)'},
	{id: 'b2', b: 34, n: 2, pic: 156.95, call: true, note: 'she catches and jumps: "Okey, swap" (c08)'},
	{id: 'b3', b: 36, n: 2, pic: 160.5, zoom: [1.0, 1.05], note: 'no. 8 throws, close (c08)'},
	{id: 'b4', b: 38, n: 2, pic: 129.6, call: true, note: '"Swap" (c06)'},
	{id: 'b5', b: 40, n: 2, pic: 63.0, zoom: [1.05, 1.0], note: 'she runs the line (c03)'},
	{id: 'b6', b: 42, n: 2, pic: 216.9, call: true, note: '"Swap. Swap dulu." (c10)'},
	{id: 'b7', b: 44, n: 2, pic: 120.0, zoom: [1.0, 1.05], note: 'she walks back past the men (c05)'},
	{id: 'b8', b: 46, n: 2, pic: 219.0, call: true, note: '"Terus hantar sana." (c10)'},
	// ---- REST (bars 12-13, the quieter bars of the bed)
	{id: 'r1', b: 48, n: 4, pic: 35.4, zoom: [1.0, 1.06], note: 'three players resting on the floor (c02)'},
	{id: 'r2', b: 52, n: 4, pic: 96.6, zoom: [1.06, 1.0], note: 'hands on heads between reps (c04)'},
	// ---- BUILD (bars 14-17): calls, then one-beat cuts
	{id: 'u1', b: 56, n: 4, pic: 224.6, call: true, note: '"Okay. Again. Again. Again." (c10)'},
	{id: 'u2', b: 60, n: 2, pic: 201.0, zoom: [1.0, 1.05], note: 'coach points, players set (c10)'},
	{id: 'u3', b: 62, n: 2, pic: 226.85, call: true, note: '"One more." (c10)'},
	{id: 'u4', b: 64, n: 4, pic: 227.9, call: true, note: '"Flow dulu. Sekali lagi." (c10)'},
	{id: 'u5', b: 68, n: 1, pic: 242.2, note: 'she runs past the camera (c10)'},
	{id: 'u6', b: 69, n: 1, pic: 93.9, note: 'shuffle (c04)'},
	{id: 'u7', b: 70, n: 1, pic: 158.6, note: 'two players cut across (c08)'},
	{id: 'u8', b: 71, n: 1, pic: 10.0, note: 'release of the throw (c01)'},
	// ---- CLIMAX (bars 18-21)
	{id: 'x1', b: 72, n: 4, pic: 213.3, call: true, note: '"Pergi. Pergi. Pergi." (c10)'},
	{id: 'x2', b: 76, n: 2, pic: 191.3, zoom: [1.0, 1.06], note: 'defence, hands up (c09)'},
	{id: 'x3', b: 78, n: 2, pic: 220.95, call: true, note: '"Hantar wing." (c10)'},
	{id: 'x4', b: 80, n: 2, pic: 117.0, zoom: [1.06, 1.0], note: 'jump and throw, mid court (c05)'},
	{id: 'fin', b: 82, n: 4, pic: 203.85, zoom: [1.0, 1.08], note: 'HERO: line of men, she runs in and releases the ball at the last frame; held under the end card (c10)'},
];

const DEFS: SegmentDef[] = SHOTS.map((s) => {
	const len = beat(s.b + s.n) - beat(s.b);
	const own = s.call === true;
	const src = typeof s.call === 'number' ? s.call : s.pic;
	const srcFrom = Math.round(src * 30);
	return {
		id: s.id,
		srcStart: srcFrom / 30,
		srcEnd: (srcFrom + len) / 30,
		zoomFrom: s.zoom?.[0] ?? 1.0,
		zoomTo: s.zoom?.[1] ?? 1.04,
		captionY: FLOOR,
		zoomOriginY: 960,
		voice: s.call !== undefined,
		visual: own || s.call === undefined ? undefined : {...MASTER, srcStart: s.pic},
		note: s.note,
	};
});

// Shots are placed on the beat grid; check the EDL reproduces it exactly.
let out = 0;
for (const s of SHOTS) {
	if (beat(s.b) !== out) throw new Error(`shot ${s.id} starts at ${out}, beat ${s.b} is at ${beat(s.b)}`);
	out = beat(s.b + s.n);
}

export const EDL = createEdl({
	defs: DEFS,
	transcript,
	outroFrames: 60,
	fix: {'Okey,': 'OKAY', 'Okey.': 'OKAY'},
	// ASR onsets corrected against the energy of the court sound (50 ms scan).
	merge: [
		{s: 61.4, e: 61.5, text: 'MAIN', start: 61.2, end: 61.55},
		{s: 62.3, e: 62.4, text: 'MAIN', start: 61.9, end: 62.2},
		{s: 11.3, e: 11.4, text: 'PAS', start: 11.7, end: 11.9},
		{s: 11.85, e: 11.95, text: 'PERGI', start: 12.05, end: 12.38},
		{s: 109.7, e: 109.8, text: 'LOW', start: 109.95, end: 110.3},
		{s: 114.35, e: 114.45, text: 'MOVE', start: 114.7, end: 114.95},
		{s: 114.95, e: 115.0, text: 'MOVE', start: 115.3, end: 115.48},
		{s: 99.1, e: 99.4, text: 'GOOD TRY', start: 98.4, end: 98.95},
		{s: 99.4, e: 99.7, text: 'GOOD TRY', start: 99.05, end: 99.65},
		{s: 213.6, e: 213.7, text: 'PERGI', start: 213.42, end: 213.7},
		{s: 214.4, e: 214.5, text: 'PERGI', start: 214.15, end: 214.42},
		{s: 215.5, e: 215.6, text: 'PERGI', start: 214.85, end: 215.12},
		{s: 226.55, e: 227.1, text: 'ONE MORE', start: 226.95, end: 227.3},
	],
});

/** Call moments (output frames) the graphics react to. */
export const CALL = {
	main1: EDL.at('h1', 61.2),
	main2: EDL.at('h1', 61.9),
	swapWord: EDL.at('b1', 47.95),
	satu: EDL.at('u3', 226.95),
	sekali: EDL.at('u4', 228.48),
	pergi1: EDL.at('x1', 213.42),
	pergi2: EDL.at('x1', 214.15),
	pergi3: EDL.at('x1', 214.85),
};
