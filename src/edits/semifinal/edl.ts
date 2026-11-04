// Edit decision list for IMG_7546.MOV (pre-semifinal pep talk, 89 s raw).
// Ranges come from the word-level transcript (transcript.json) plus an energy
// scan for pauses. Dropped: repeats ("kita tetap kena menang" x2, "jiwa nak
// menang mesti ada" x3, "kita mesti (masuk|ada di) final" x4, "lawan tetap
// lawan" x3, "dia orang laju kita perlahan" x2), unclear ASR lines, dead air.
//
// captionY: the face band moves between takes (coach face y 730-1320), so each
// segment puts its captions where faces/foreground leave room:
//   BELOW = band 1190-1390 (faces end above 1150), ABOVE = band 665-865
//   (faces start below 898). zoomOriginY = coach face centre for that take.
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';

const BELOW = 1290;
const ABOVE = 765;

const DEFS: SegmentDef[] = [
	{id: 'hook', srcStart: 52.24, srcEnd: 54.84, zoomFrom: 1.0, zoomTo: 1.05, captionY: BELOW, zoomOriginY: 889, note: 'HOOK "Dua tahun berturut-turut berada di final. Tak semua orang boleh buat."'},
	{id: 'pressure', srcStart: 25.04, srcEnd: 27.4, zoomFrom: 1.04, zoomTo: 1.04, captionY: ABOVE, zoomOriginY: 1115, note: '"Final tu, no more pressure."'},
	{id: 'semifinal', srcStart: 29.1, srcEnd: 31.46, zoomFrom: 1.0, zoomTo: 1.05, captionY: ABOVE, zoomOriginY: 1218, note: '"Tetapi untuk game kali ni, semifinal kali ni,"'},
	{id: 'menang', srcStart: 59.5, srcEnd: 63.94, zoomFrom: 1.02, zoomTo: 1.07, captionY: BELOW, zoomOriginY: 878, note: '"Nak tak nak, kita tetap kena menang. Buatlah macam mana cara sekalipun." (second, cleaner take)'},
	{id: 'jiwa', srcStart: 13.66, srcEnd: 14.98, zoomFrom: 1.06, zoomTo: 1.06, captionY: ABOVE, zoomOriginY: 1176, note: '"Jiwa nak menang mesti ada." (best of three takes)'},
	{id: 'giveup', srcStart: 68.98, srcEnd: 69.66, zoomFrom: 1.08, zoomTo: 1.08, captionY: BELOW, zoomOriginY: 954, note: '"Jangan give up."'},
	{id: 'teknikal', srcStart: 77.86, srcEnd: 81.18, zoomFrom: 1.0, zoomTo: 1.05, captionY: ABOVE, zoomOriginY: 1072, note: '"Jangan takut sizing apa semua. Tak ada masalah. Teknikal kita bagus."'},
	{id: 'lawan', srcStart: 40.84, srcEnd: 44.32, zoomFrom: 1.0, zoomTo: 1.05, captionY: ABOVE, zoomOriginY: 1124, note: '"Biarlah sampai ke 50 minit yang terakhir, lawan tetap lawan."'},
	{id: 'extra', srcStart: 44.84, srcEnd: 47.02, zoomFrom: 1.04, zoomTo: 1.08, captionY: ABOVE, zoomOriginY: 1095, note: '"Kalau nak heret extra time, tariklah extra time." (0.5 s pause removed before it)'},
	{id: 'mesti', srcStart: 47.52, srcEnd: 48.64, zoomFrom: 1.0, zoomTo: 1.03, captionY: ABOVE, zoomOriginY: 1054, note: '"Kita mesti..."'},
	{id: 'final', srcStart: 49.1, srcEnd: 50.2, zoomFrom: 1.1, zoomTo: 1.12, captionY: BELOW, zoomOriginY: 962, note: '"...ada kat final." (0.45 s of the dramatic pause removed; punch-in on the payoff)'},
];

export const EDL = createEdl({
	defs: DEFS,
	transcript,
	outroFrames: 40,
	fix: {Buatlah: 'BUATLAH', Tariklah: 'TARIKLAH'},
	merge: [
		// ASR put "Dua" at 52.14, but the energy scan shows silence until 52.28.
		{s: 52.14, e: 52.66, text: 'DUA', start: 52.28},
		// ASR split the hyphenated word into two tokens.
		{s: 52.82, e: 53.18, text: 'BERTURUT-TURUT'},
	],
});
