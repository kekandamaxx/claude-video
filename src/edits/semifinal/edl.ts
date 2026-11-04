// Edit decision list for IMG_7546.MOV (pre-semifinal pep talk, 89 s raw -> ~45 s).
// Ranges come from the word-level transcript (transcript.json), a focused second
// Whisper pass on unclear regions, and an energy scan for pauses.
// The coach asked for 45-50 s and for the rhetorical repeats to stay
// ("kena menang", "jiwa nak menang mesti ada", "kita mesti ada di final",
// "lawan tetap lawan"). Still dropped: unclear lines (55.98-59.48,
// 69.62-75.56, 83.0-88.6), filler and dead air.
//
// captionY: the face band moves between takes (coach face y 250-1360), so each
// segment puts its captions where faces leave room inside x 170-850:
//   BELOW = band 1190-1390, ABOVE = band 665-865. zoomOriginY = coach face centre.
// Segment 'menang2' is a close-up with the coach's face at y 250-850, so its
// graphic moves to the low band (see Graphics.tsx).
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';

const BELOW = 1290;
const ABOVE = 765;

const DEFS: SegmentDef[] = [
	{id: 'hook', srcStart: 52.24, srcEnd: 54.84, zoomFrom: 1.0, zoomTo: 1.05, captionY: BELOW, zoomOriginY: 889, note: 'HOOK "Dua tahun berturut-turut berada di final. Tak semua orang boleh buat."'},
	{id: 'harap', srcStart: 17.24, srcEnd: 20.72, zoomFrom: 1.0, zoomTo: 1.04, captionY: ABOVE, zoomOriginY: 1220, note: '"Aku memang berharap yang terbaik, duduk di final."'},
	{id: 'pressure', srcStart: 23.36, srcEnd: 27.4, zoomFrom: 1.02, zoomTo: 1.06, captionY: ABOVE, zoomOriginY: 1111, note: '"Korang pilih nak menang apa dah. Final tu, no more pressure."'},
	{id: 'semifinal', srcStart: 29.1, srcEnd: 31.46, zoomFrom: 1.0, zoomTo: 1.05, captionY: ABOVE, zoomOriginY: 1218, note: '"Tetapi untuk game kali ni, semifinal kali ni,"'},
	{id: 'masuk1', srcStart: 32.58, srcEnd: 33.8, zoomFrom: 1.03, zoomTo: 1.05, captionY: ABOVE, zoomOriginY: 1208, note: '"Kita mesti masuk final."'},
	{id: 'masuk2', srcStart: 34.6, srcEnd: 35.5, zoomFrom: 1.07, zoomTo: 1.08, captionY: ABOVE, zoomOriginY: 1140, note: '"Kita mesti ada di final." (0.8 s pause removed before it)'},
	{id: 'menang', srcStart: 59.5, srcEnd: 63.94, zoomFrom: 1.02, zoomTo: 1.07, captionY: BELOW, zoomOriginY: 878, note: '"Nak tak nak, kita tetap kena menang. Buatlah macam mana cara sekalipun."'},
	{id: 'menang2', srcStart: 5.97, srcEnd: 7.42, zoomFrom: 1.0, zoomTo: 1.02, captionY: BELOW, zoomOriginY: 502, note: '"Kita tetap kena menang." (close-up take, face high in frame)'},
	{id: 'jiwa1', srcStart: 8.52, srcEnd: 10.4, zoomFrom: 1.0, zoomTo: 1.04, captionY: BELOW, zoomOriginY: 928, note: '"Jiwa nak menang, mesti ada."'},
	{id: 'jiwa2', srcStart: 11.5, srcEnd: 14.98, zoomFrom: 1.0, zoomTo: 1.05, captionY: ABOVE, zoomOriginY: 1172, note: '"Kena tinggal ada 3 biji gol, jiwa nak menang mesti ada."'},
	{id: 'giveup', srcStart: 68.98, srcEnd: 69.66, zoomFrom: 1.08, zoomTo: 1.08, captionY: BELOW, zoomOriginY: 954, note: '"Jangan give up."'},
	{id: 'teknikal', srcStart: 77.86, srcEnd: 82.5, zoomFrom: 1.0, zoomTo: 1.05, captionY: ABOVE, zoomOriginY: 1057, note: '"Jangan takut sizing apa semua. Tak ada masalah. Teknikal kita bagus. Dia orang laju, kita perlahan."'},
	{id: 'lawan0', srcStart: 37.66, srcEnd: 39.42, zoomFrom: 1.03, zoomTo: 1.06, captionY: ABOVE, zoomOriginY: 1138, note: '"Lawan tetap lawan."'},
	{id: 'lawan', srcStart: 40.84, srcEnd: 44.32, zoomFrom: 1.0, zoomTo: 1.05, captionY: ABOVE, zoomOriginY: 1124, note: '"Biarlah sampai ke 50 minit yang terakhir, lawan tetap lawan."'},
	{id: 'extra', srcStart: 44.84, srcEnd: 47.02, zoomFrom: 1.04, zoomTo: 1.08, captionY: ABOVE, zoomOriginY: 1095, note: '"Kalau nak heret extra time, tariklah extra time." (0.5 s pause removed before it)'},
	{id: 'jiwa3', srcStart: 65.74, srcEnd: 67.62, zoomFrom: 1.02, zoomTo: 1.05, captionY: BELOW, zoomOriginY: 1034, note: '"Lawan! Jiwa nak menang mesti ada."'},
	{id: 'ada', srcStart: 36.3, srcEnd: 37.7, zoomFrom: 1.0, zoomTo: 1.04, captionY: ABOVE, zoomOriginY: 1134, note: '"Kita mesti ada final."'},
	{id: 'mesti', srcStart: 47.52, srcEnd: 48.64, zoomFrom: 1.0, zoomTo: 1.03, captionY: ABOVE, zoomOriginY: 1054, note: '"Kita mesti..."'},
	{id: 'final', srcStart: 49.1, srcEnd: 50.2, zoomFrom: 1.1, zoomTo: 1.12, captionY: BELOW, zoomOriginY: 962, note: '"...ada kat final." (0.45 s of the dramatic pause removed; punch-in on the payoff)'},
];

export const EDL = createEdl({
	defs: DEFS,
	transcript,
	outroFrames: 45,
	fix: {Buatlah: 'BUATLAH', Tariklah: 'TARIKLAH'},
	// ASR onsets corrected against the energy scan / second Whisper pass, so the
	// words land inside the kept range and highlight on time.
	merge: [
		{s: 52.14, e: 52.66, text: 'DUA', start: 52.28},
		{s: 52.82, e: 53.18, text: 'BERTURUT-TURUT'},
		{s: 16.38, e: 16.39, text: 'AKU', start: 17.28, end: 17.8},
		{s: 17.12, e: 17.13, text: 'MEMANG', start: 17.82, end: 18.14},
		{s: 32.16, e: 32.17, text: 'KITA', start: 32.64, end: 32.74},
		{s: 33.66, e: 33.67, text: 'KITA', start: 34.62, end: 34.7},
		{s: 34.58, e: 34.59, text: 'MESTI', start: 34.7, end: 34.98},
		{s: 5.5, e: 5.51, text: 'KITA', start: 5.99, end: 6.36},
		{s: 8.22, e: 8.23, text: 'JIWA', start: 8.55, end: 8.84},
		{s: 65.6, e: 65.61, text: 'LAWAN', start: 65.76, end: 66.16},
	],
});
