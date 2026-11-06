// Edit decision list for the chat-uploaded clip (32 s raw): UMPSA Handball coach
// briefing on how to react when an opponent throws elbows.
// Two Whisper passes agree on every kept line. Dropped: the unclear opener
// (0.00-2.00 "kau orang punya sikit karek..."), a 0.00-confidence hallucination
// at 30.0 s, and the gaps between lines.
//
// Faces sit low in this clip (y >= 998), so every segment uses the ABOVE caption
// band (665-865) and graphics stay in the top band (260-610).
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';

const ABOVE = 765;

const DEFS: SegmentDef[] = [
	{id: 'jangan', srcStart: 10.6, srcEnd: 12.82, zoomFrom: 1.04, zoomTo: 1.08, captionY: ABOVE, zoomOriginY: 1156, note: 'HOOK (cold open) "Jangan beritahu. Dah banyak kali dah."'},
	{id: 'siku', srcStart: 3.28, srcEnd: 6.14, zoomFrom: 1.0, zoomTo: 1.05, captionY: ABOVE, zoomOriginY: 1222, note: '"Sekarang ni, bila dia siku-siku, kau panggil dia, Man, Coach!"'},
	{id: 'biar', srcStart: 7.58, srcEnd: 9.36, zoomFrom: 1.03, zoomTo: 1.06, captionY: ABOVE, zoomOriginY: 1224, note: '"Biar kita orang ni yang beritahu."'},
	{id: 'td', srcStart: 13.78, srcEnd: 17.36, zoomFrom: 1.0, zoomTo: 1.06, captionY: ABOVE, zoomOriginY: 1148, note: '"Nanti TD akan gaduh dekat. Nanti TD akan panggil dia."'},
	{id: 'sikit', srcStart: 20.2, srcEnd: 21.42, zoomFrom: 1.06, zoomTo: 1.08, captionY: ABOVE, zoomOriginY: 1190, note: '"Sikit lagi, sikit lagi."'},
	{id: 'pernah', srcStart: 21.54, srcEnd: 24.18, zoomFrom: 1.0, zoomTo: 1.04, captionY: ABOVE, zoomOriginY: 1190, note: '"Kau tak pernah pun main macam itu. Kau tak tahu kenapa."'},
	{id: 'tanya', srcStart: 24.62, srcEnd: 25.52, zoomFrom: 1.06, zoomTo: 1.07, captionY: ABOVE, zoomOriginY: 1192, note: '"Kau akan tanya dia." (0.4 s pause removed before it)'},
	{id: 'kena', srcStart: 26.68, srcEnd: 27.52, zoomFrom: 1.08, zoomTo: 1.1, captionY: ABOVE, zoomOriginY: 1167, note: '"Kena juga."'},
	{id: 'biasanya', srcStart: 28.32, srcEnd: 29.48, zoomFrom: 1.0, zoomTo: 1.04, captionY: ABOVE, zoomOriginY: 1118, note: '"Biasanya dia panggil macam ini."'},
];

export const EDL = createEdl({
	defs: DEFS,
	transcript,
	outroFrames: 40,
	// "TDI" is the ASR spelling of TD (technical delegate).
	fix: {TDI: 'TD'},
	merge: [{s: 4.24, e: 4.7, text: 'SIKU-SIKU'}],
});
