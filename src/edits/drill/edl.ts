// Edit decision list for the defence drill talk. Three phone clips from Google Drive,
// joined into one source (scripts/prepare_drill.sh): IMG_6114 at 0.000 s, IMG_6115 at
// 5.455 s, IMG_6116 at 20.403 s. 41.3 s raw -> 19.9 s cut + 2.5 s end card.
//
// Dropped: "That's why" lead-ins, "Okay? Right?" (9.8-11.0), the 2nd-8th repeated "tok"
// after 13.86, "Okay?" after "lama-lama", "Alright?" (16.8-17.8), "Defend drill / Defense 3,
// lompat" (30.1-31.1; the two Whisper passes disagree and the focused pass hallucinates),
// "Okay?" (32.6-33.0), the trailing "Right? Okay." and all dead air.
//
// Layout: every face (the coach and the players) sits at y 824-1081, small (h 20-60 px).
// The coach demonstrates footwork and stance with his whole body, so the floor stays clear:
// captions sit ABOVE the heads (centre y 720, up to 4 words split on phrase breaks) and graphics in the top band
// (y 260-610). Each take zooms 1.2-1.4x pivoting on the coach's face (zoomOriginX/Y),
// so he grows in place and never drifts into the right-hand UI rail.
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';

export const CAPTION_Y = 720;

const DEFS: SegmentDef[] = [
	{id: 'hook', srcStart: 20.76, srcEnd: 22.36, zoomFrom: 1.3, zoomTo: 1.38, zoomOriginX: 682, zoomOriginY: 984, note: 'HOOK (cold open): "Melainkan dia lompat, baru you move."'},
	{id: 'bukan', srcStart: 0.72, srcEnd: 4.32, zoomFrom: 1.16, zoomTo: 1.24, zoomOriginX: 595, zoomOriginY: 900, note: '"Sekarang ni kita bukan cerita pasal attack ni, kita nak cerita pasal korang punya defense."'},
	{id: 'touch', srcStart: 5.58, srcEnd: 8.76, zoomFrom: 1.22, zoomTo: 1.28, zoomOriginX: 540, zoomOriginY: 943, note: '"Aku kata, bila dapat bola je, korang kena touch, korang patah balik."'},
	{id: 'jalan', srcStart: 12.04, srcEnd: 13.86, zoomFrom: 1.24, zoomTo: 1.3, zoomOriginX: 571, zoomOriginY: 925, note: '"Bila jalan, tok, jalan, tok, tok, tok" (the next five "tok" cut)'},
	{id: 'lama', srcStart: 14.36, srcEnd: 15.26, zoomFrom: 1.32, zoomTo: 1.35, zoomOriginX: 566, zoomOriginY: 911, note: '"Lama-lama"'},
	{id: 'satu', srcStart: 17.86, srcEnd: 18.5, zoomFrom: 1.36, zoomTo: 1.38, zoomOriginX: 455, zoomOriginY: 891, note: '"Itu satu."'},
	{id: 'floor', srcStart: 24.3, srcEnd: 26.04, zoomFrom: 1.24, zoomTo: 1.3, zoomOriginX: 635, zoomOriginY: 990, note: '"Kalau dia floor base, korang macam ni." (to confirm: "floor base")'},
	{id: 'kena', srcStart: 26.9, srcEnd: 29.06, zoomFrom: 1.28, zoomTo: 1.34, zoomOriginX: 729, zoomOriginY: 1015, note: '"Sebab itulah korang punya defense kena macam ni."'},
	{id: 'sebab', srcStart: 33.22, srcEnd: 34.6, zoomFrom: 1.3, zoomTo: 1.36, zoomOriginX: 710, zoomOriginY: 928, note: '"Itu defense. Sebab apa?"'},
	{id: 'berdua', srcStart: 35.2, srcEnd: 36.72, zoomFrom: 1.24, zoomTo: 1.3, zoomOriginX: 660, zoomOriginY: 932, note: '"Bila korang berdua, korang tak ada reverse." (to confirm: "reverse")'},
	{id: 'banyak', srcStart: 37.04, srcEnd: 38.36, zoomFrom: 1.32, zoomTo: 1.4, zoomOriginX: 695, zoomOriginY: 951, note: 'CLIMAX: "Bila defense, korang banyak reverse."'},
];

export const EDL = createEdl({
	defs: DEFS.map((d) => ({...d, captionY: CAPTION_Y})),
	transcript,
	outroFrames: 75,
	maxChunkWords: 4,
	fix: {'top,': 'TOK,', 'top.': 'TOK.', top: 'TOK', ini: 'NI', lompat: 'LOMPAT,', 'baru,': 'BARU'},
	merge: [
		// "(Sebab) itulah" ends at 0.76, inside the first take's 0.72 in-point: keep it out of the captions.
		{s: 0.69, e: 0.71, text: ''},
		// "Kalau" is stamped 24.24 (before the in-point); the energy scan has it starting at 24.4.
		{s: 24.24, e: 24.25, text: 'KALAU', start: 24.36, end: 24.62},
		{s: 14.36, e: 15.0, text: 'LAMA-LAMA', start: 14.4, end: 15.18},
		// "kena" sits at 28.00-28.62 in the ASR; the energy scan puts it at 28.38.
		{s: 28.0, e: 28.01, text: 'KENA', start: 28.38, end: 28.6},
	],
});
