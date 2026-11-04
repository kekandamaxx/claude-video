// Edit decision list for IMG_7678.MOV (UMPSA handball timeout talk).
// Ranges were chosen from the word-level transcript (transcript.json):
// repeats ("5 minit saja lagi" x3, "7 attack / satu pun tak dapat" x2,
// "the last 3 minutes" x2), filler ("Ok", "Alright") and dead air are dropped.
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';

const DEFS: SegmentDef[] = [
	{id: 'hook', srcStart: 8.72, srcEnd: 14.4, zoomFrom: 1.0, zoomTo: 1.08, note: 'Hook: "7 kali attack, satu pun tak dapat. Tapi diorang attack, nasib baik keeper ada"'},
	{id: 'fiveMin', srcStart: 0.0, srcEnd: 1.14, zoomFrom: 1.1, zoomTo: 1.1, note: '"5 minit saja lagi" (best of three takes)'},
	{id: 'syahmi', srcStart: 20.04, srcEnd: 26.24, zoomFrom: 1.03, zoomTo: 1.1, note: '"So Syahmi mesti, tolong lah, please. Nampak 1 biji lagi, 2 biji lagi. Kita dah rotate, 5 minit lagi"'},
	{id: 'lineup', srcStart: 31.0, srcEnd: 33.56, zoomFrom: 1.12, zoomTo: 1.12, note: '"Muqri. Chai. Jason. Ready."'},
	{id: 'last3', srcStart: 34.56, srcEnd: 42.83, zoomFrom: 1.0, zoomTo: 1.12, note: '"The last 3 minutes, kalau kita masih leading, kalau tak ada gap, 2 aku tu keluarkan, korang balik. Ok. Come on x3"'},
];

export const EDL = createEdl({
	defs: DEFS,
	transcript,
	outroFrames: 36,
	// Caption spelling fixes on top of the raw ASR output, confirmed by the coach.
	fix: {diorang: 'DIORANG', lah: 'LAH', Ok: 'OK', Syamil: 'SYAHMI', Bukri: 'MUQRI'},
	// ASR split "keeper" into "kita pun" (13.86-14.14 s).
	merge: [{s: 13.86, e: 14.14, text: 'KEEPER'}],
});
