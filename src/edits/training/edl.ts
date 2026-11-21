// Edit decision list for the handball training clip: two phone takes from Google Drive >
// Video, joined end to end (IMG_4790.mp4 0-143.433 s, then IMG_4793.mp4 from 143.433 s).
// The coach films and talks at the same time, so the voice is close and the players are
// small and mid-frame (faces measured at y 420-1100).
//
// Story: hook ("buka highway") -> who plays center -> "attack double pivot" -> positions
// (45, stand outside, not behind, pull the defender out) -> flow -> drill -> switch ->
// rebound / pivot -> fast break -> "banyak option... improvise".
//
// Dropped: the second "ada banyak option", repeated "switch switch switch", "kau sebelah
// sini" (x2, too faint to caption), "memang kau masuk, kau duduk dalam cerita dia" (unclear),
// "kau akan pasang bola pada dia, kau jump" (second pass disagreed), every okay/alright,
// and all dead air between lines.
//
// Layout: graphics in the top band (y 260-610, ceiling) except 'flow3' where a player's
// face rises to y 424 (that segment keeps graphics in y 260-400). Captions below the faces.
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';

const CAP = 1290;
const O = 900; // zoom pivot on the player band
type D = Omit<SegmentDef, 'zoomFrom' | 'zoomTo' | 'captionY'> & Partial<SegmentDef>;
const s = (d: D): SegmentDef => ({zoomFrom: 1.0, zoomTo: 1.05, captionY: CAP, zoomOriginY: O, ...d});

const DEFS: SegmentDef[] = [
	s({id: 'hook', srcStart: 122.52, srcEnd: 123.98, zoomFrom: 1.12, zoomTo: 1.18, note: 'HOOK "Kau buka highway untuk dia, tahan!"'}),
	s({id: 'lineup', srcStart: 11.4, srcEnd: 13.45, note: '"Center tak ada. Ipan tak ada. Engkau lah, center."'}),
	s({id: 'title', srcStart: 22.6, srcEnd: 26.45, zoomFrom: 1.0, zoomTo: 1.08, note: '"Yang ni korang-korang tengok eh. Ni kita main attack double pivot."'}),
	s({id: 'flow', srcStart: 33.85, srcEnd: 34.85, zoomFrom: 1.08, zoomTo: 1.1, note: '"Ok, bola flow dulu."'}),
	s({id: 'pos45', srcStart: 41.98, srcEnd: 43.3, zoomFrom: 1.04, zoomTo: 1.08, note: '"Sebabnya dia 45." (trailing breath cut)'}),
	s({id: 'luar', srcStart: 45.74, srcEnd: 47.98, zoomFrom: 1.08, zoomTo: 1.12, note: '"Tapi kau kena berdiri kat luar ni."'}),
	s({id: 'jangan', srcStart: 53.95, srcEnd: 55.02, zoomFrom: 1.1, zoomTo: 1.14, note: '"Kau jangan belakang sini."'}),
	s({id: 'tarik', srcStart: 56.26, srcEnd: 58.12, zoomFrom: 1.02, zoomTo: 1.06, note: '"Kau kena berdiri di sini, sebab kita tarik keluar." (1.3 s pause cut)'}),
	s({id: 'flow3', srcStart: 65.62, srcEnd: 66.64, zoomFrom: 1.0, zoomTo: 1.04, zoomOriginY: 620, note: '"Flow, flow, flow. Tengok dulu." (the second "tengok dulu" is only a breath) (player close to lens)'}),
	s({id: 'drill', srcStart: 68.95, srcEnd: 72.4, zoomFrom: 1.06, zoomTo: 1.14, note: 'ACTION: drill starts (hall sound only)'}),
	s({id: 'lagi', srcStart: 82.0, srcEnd: 82.72, zoomFrom: 1.1, zoomTo: 1.14, note: '"Lagi, lagi, lagi."'}),
	s({id: 'drill2', srcStart: 83.4, srcEnd: 86.2, zoomFrom: 1.0, zoomTo: 1.08, note: 'ACTION: drill (hall sound only)'}),
	s({id: 'switch', srcStart: 97.15, srcEnd: 98.8, zoomFrom: 1.04, zoomTo: 1.1, note: '"Bila dah switch, pastikan switch."'}),
	s({id: 'rebound', srcStart: 146.55, srcEnd: 147.55, zoomFrom: 1.0, zoomTo: 1.04, note: '"Ok, cuba kita try rebound."'}),
	s({id: 'pivot', srcStart: 148.05, srcEnd: 149.45, zoomFrom: 1.04, zoomTo: 1.08, note: '"Tapi bola tu bola pivot." (0.5 s pause cut)'}),
	s({id: 'brk', srcStart: 160.9, srcEnd: 164.0, zoomFrom: 1.12, zoomTo: 1.2, note: 'ACTION: fast break (hall sound only)'}),
	s({id: 'masuk', srcStart: 167.9, srcEnd: 170.22, zoomFrom: 1.1, zoomTo: 1.2, note: 'ACTION: attack runs in, "Ok, masuk!"'}),
	// IMG_4793 27.0-33.9 s plays through with no cut ('shot' then 'ikut' are contiguous in the source):
	// the back feeds the pivot at 173.3 s and the pivot turns to shoot at 173.5-173.9 s.
	s({id: 'shot', srcStart: 170.22, srcEnd: 174.4, zoomFrom: 1.22, zoomTo: 1.42, zoomOriginX: 430, zoomOriginY: 960, note: 'ACTION: pivot gets the ball and attempts the shot (hall sound, "Haa!")'}),
	s({id: 'ikut', srcStart: 174.4, srcEnd: 177.33, zoomFrom: 1.42, zoomTo: 1.2, zoomOriginX: 430, zoomOriginY: 960, seamless: true, note: '"Haa, pun boleh, jadi ikut. Ada banyak option." (continues the shot take)'}),
	s({id: 'improvise', srcStart: 178.3, srcEnd: 179.62, zoomFrom: 1.08, zoomTo: 1.16, note: 'CLIMAX "Improvise." (repeat of "ada banyak option" cut)'}),
];

export const ACTION = new Set(['drill', 'drill2', 'brk', 'masuk', 'shot']);

export const EDL = createEdl({defs: DEFS, transcript, outroFrames: 75});
