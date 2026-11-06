// Edit decision list for the Viva! juice teaser: a taste-test clip (70d625eb...mov,
// 35 s, the dialogue track), a 3.8 s pallet pan (9def2b7b...mov) and three stills
// of the Viva! pomegranate bottles. The dialogue runs on under the B-roll and the
// stills at the end (J-cut).
// Dropped: "Dah dah bangun?" (off-mic), "Nak ni", "Memang sangat sedap guys"
// (repeats "memang sedap sangat", and the camera whips to a second person's face),
// the trailing "okay", and the dead air between lines.
//
// Layout: in the talk shots the face sits at y 440-870 and the bottle she holds at
// y 800-1150, so captions go BELOW (1210-1410) and graphics use the strip above her
// head (y 255-410) or the left column (x 60-390). On the bottle stills the label sits
// at y 915-1460, so captions move ABOVE it (onto the juice) and the title stays thin.
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';

const BELOW = 1310;
const ON_JUICE = 735;
const broll = {kind: 'video' as const, master: 'viva/video/broll_master.mp4', proxy: 'viva/video/broll_proxy.mp4'};

const DEFS: SegmentDef[] = [
	{id: 'sip', srcStart: 4.6, srcEnd: 6.62, zoomFrom: 1.0, zoomTo: 1.04, captionY: BELOW, zoomOriginY: 720, note: 'HOOK: she sips, then "MasyaAllah"'},
	{id: 'guava', srcStart: 7.36, srcEnd: 12.84, zoomFrom: 1.0, zoomTo: 1.0, captionY: BELOW, zoomOriginY: 640, note: '"Awak pernah rasa tak? Selalu guava kita Malaysia warna apa? Warna pink kan? Tapi guava dia Mesir, ni colour dia."'},
	{id: 'guava2', srcStart: 13.3, srcEnd: 16.6, zoomFrom: 1.04, zoomTo: 1.04, captionY: BELOW, zoomOriginY: 640, note: '"Tapi dia punya pekat, dia punya sedap tu. Ya Allah, memang sedap sangat." (0.45 s pause cut before it)'},
	{id: 'persen', srcStart: 19.56, srcEnd: 20.8, zoomFrom: 1.03, zoomTo: 1.05, captionY: BELOW, zoomOriginY: 660, note: '"Dia pekat, berapa persen ada dalam ni?" (starts on the real onset, 19.62 s)'},
	{id: 'duaLima', srcStart: 22.22, srcEnd: 23.8, zoomFrom: 1.05, zoomTo: 1.06, captionY: BELOW, zoomOriginY: 660, note: '"25... 25 persen."'},
	{id: 'pallet', srcStart: 26.1, srcEnd: 28.7, zoomFrom: 1.0, zoomTo: 1.08, captionY: BELOW, visual: {...broll, srcStart: 0.2}, note: 'B-roll pallet pan under "Tak sabar akak nak promo kat korang"'},
	{id: 'crates', srcStart: 28.7, srcEnd: 30.0, zoomFrom: 1.0, zoomTo: 1.06, captionY: BELOW, zoomOriginY: 960, visual: {kind: 'image', src: 'viva/img/crates.jpg'}, note: 'Still: crates, under "semua yang best-best"'},
	{id: 'bottle1', srcStart: 30.0, srcEnd: 30.9, zoomFrom: 1.06, zoomTo: 1.1, captionY: ON_JUICE, zoomOriginY: 1180, visual: {kind: 'image', src: 'viva/img/bottle1.jpg'}, note: 'Still: bottle close-up, end of "best-best ni"'},
	{id: 'tunggu', srcStart: 31.46, srcEnd: 32.46, zoomFrom: 1.0, zoomTo: 1.05, captionY: ON_JUICE, zoomOriginY: 1160, visual: {kind: 'image', src: 'viva/img/bottle2.jpg'}, note: 'Still: bottle close-up under "Tunggu-tunggu"; held under the end card'},
];

export const EDL = createEdl({
	defs: DEFS,
	transcript,
	outroFrames: 50,
	fix: {'MasyaAllah,': 'MASYAALLAH', 'mesin,': 'MESIR', akhir: 'AKAK'},
	merge: [
		{s: 30.32, e: 30.77, text: 'BEST-BEST'},
		{s: 31.48, e: 32.47, text: 'TUNGGU-TUNGGU'},
		// "Awak" sits at 7.36 (p 0.05); keep it inside the hook segment.
		{s: 7.36, e: 7.37, text: 'AWAK', start: 7.38, end: 7.7},
		// ASR onsets corrected against the energy scan.
		{s: 12.78, e: 12.79, text: 'TAPI', start: 13.32, end: 13.4},
		{s: 19.08, e: 19.09, text: 'DIA', start: 19.62, end: 19.7},
	],
});
