// Edit decision list for IMG_6778.MOV (57.9 s raw, Google Drive > Video): coach on the
// sideline at handball training, explaining why a lobbed pass to the wing fails.
//
// Story order (problem -> cause -> mechanism -> fix), not source order:
//   hook   "Kau fly pun, belum tentu dapat penalti."   strongest, most counter-intuitive line
//   sebab  "Sebabnya wall sampai dulu sebelum bola."   answers the hook at once
//   kalau/wall/tutup  "Kalau kau lambung, wall akan move. Tutup."   pauses of 1.1 s and 0.4 s cut
//   kenapa "Sebab dia kenapa?"                         rhetorical question before the answer
//   sharp  "Tak nak lambung, dia mesti sharp."         the fix, as the payoff
//   kenamove/move1/move2  "Kena move, kena move. Move! Move!"  the wing moves with the
//          ball; the coach points the ball's direction with his hand (12.4-13.6)
//   outro  players drilling (no dialogue) under the end card
//
// Dropped: "Okay" (1.9 s), the unclear calls at 10.3 and 11.1 (okey / stay / sana), the first take of
// "Lambung kena, tak nak lambung" (16.3-17.5, repeated at 20.3), "Ada masa bola tu pergi, wall dah tutup" (27.9-30.5, same point as "wall sampai dulu
// sebelum bola"), "Kalau macam tu" (lead-in), and 37.6-41.8 ("kita nak dia dapat ... bola,
// wing ... tutup"): three Whisper passes disagree on two of its words, so it is not
// captioned or used.
//
// Faces (YuNet, 5 fps) sit at y 1000-1300 for the whole clip, so the tactics board
// lives in y 262-722, captions sit above the faces (centre 800-830), and zooms pivot
// on the face band (y 1100).
import transcript from './transcript_kept.json';
import {createEdl, SegmentDef} from '../../lib/edl';

const CAP = 800; // caption centre, above faces
const CAP_LOW = 836; // under the tactics board
const O = 1100;

const DEFS: SegmentDef[] = [
	{id: 'hook', srcStart: 31.84, srcEnd: 33.74, zoomFrom: 1.2, zoomTo: 1.26, captionY: CAP, zoomOriginY: O, note: 'HOOK "Kau fly pun, belum tentu dapat penalti."'},
	{id: 'kenapa', srcStart: 26.98, srcEnd: 27.9, zoomFrom: 1.12, zoomTo: 1.16, captionY: CAP, zoomOriginY: O, note: 'rhetorical "Sebab dia kenapa?" sets up the answer'},
	{id: 'sebab', srcStart: 35.9, srcEnd: 37.86, zoomFrom: 1.08, zoomTo: 1.15, captionY: CAP, zoomOriginY: O, note: '"Sebabnya wall sampai dulu sebelum bola."'},
	{id: 'kalau', srcStart: 22.7, srcEnd: 24.0, zoomFrom: 1.0, zoomTo: 1.04, captionY: CAP_LOW, zoomOriginY: O, note: '"Kalau kau lambung," (0.7 s pause before it cut)'},
	{id: 'wall', srcStart: 25.06, srcEnd: 26.08, zoomFrom: 1.06, zoomTo: 1.09, captionY: CAP_LOW, zoomOriginY: O, note: '"wall akan move," (1.1 s pause cut)'},
	{id: 'tutup', srcStart: 26.4, srcEnd: 26.92, zoomFrom: 1.16, zoomTo: 1.2, captionY: CAP_LOW, zoomOriginY: O, note: '"Tutup." (0.3 s pause cut)'},
	{id: 'sharp', srcStart: 20.26, srcEnd: 21.96, zoomFrom: 1.0, zoomTo: 1.07, captionY: CAP_LOW, zoomOriginY: O, note: 'PAYOFF "Tak nak lambung, dia mesti sharp."'},
	{id: 'kenamove', srcStart: 6.9, srcEnd: 7.9, zoomFrom: 1.04, zoomTo: 1.08, captionY: CAP_LOW, zoomOriginY: O, note: '"Kena move, kena move." wing moves with the ball'},
	{id: 'move1', srcStart: 11.32, srcEnd: 11.68, zoomFrom: 1.06, zoomTo: 1.08, captionY: CAP, zoomOriginY: O, note: '"Move!" staccato call 1'},
	{id: 'move2', srcStart: 12.14, srcEnd: 13.72, zoomFrom: 1.1, zoomTo: 1.16, captionY: CAP, zoomOriginY: O, note: '"Move!" call 2, then the coach points the way the ball goes (hand held to 13.6)'},
	{id: 'outro', srcStart: 47.0, srcEnd: 50.2, zoomFrom: 1.0, zoomTo: 1.05, voice: false, zoomOriginY: O, note: 'players drilling, no dialogue; end card'},
];

type KeptWords = {segments: {id: string; words: {w: string; s: number; e: number}[]}[]};

export const EDL = createEdl({
	defs: DEFS,
	transcript: transcript as KeptWords,
	outroFrames: 12,
});
