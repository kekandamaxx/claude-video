// Edit decision list for the goalkeeper footwork drill (ac629d23...mov, 74.0 s, chat upload).
// 74.0 s -> 43.9 s of cut + 1.0 s outro = 44.9 s.
//
// Story: cold open on the punchline ("Ini baru training level Malaysia ni") over the
// collapse at the very end, rewind, then the drill in order: easy footwork, the split,
// "tadi simple sangat", level up, the commands speed up, stamina runs out, K.O.
//
// Dropped: 0.0-3.9 (camera settling, an off-mic "okay"), the first "ini level" (19.9-20.9,
// said twice), "ini baru training level Malaysia ni" in place (it is the hook), 26-31
// and 52.8-60.7 (dead air between throws), "pastikan" (56.8, cut off mid-sentence),
// 62.25-62.98 (pause), 66.8-69.0 (walk-off), and Whisper's closing "Terima kasih kerana
// menonton" (72.9 s, a hallucination).
//
// Layout: every measured face sits at y 830-1100 (wide gym shots) or y 635-1085 (the
// split close-up, 14.8-18 s). Graphics live in y 260-610, captions are centred on 1300.
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';

const master = {kind: 'video' as const, master: 'gkdrill/video/master.mp4', proxy: 'gkdrill/video/proxy.mp4', sameSource: true};

const DEFS: SegmentDef[] = [
	{id: 'hook', srcStart: 23.76, srcEnd: 25.8, zoomFrom: 1.12, zoomTo: 1.2, zoomOriginY: 1000, captions: false, visual: {...master, srcStart: 70.0}, note: 'HOOK: "(Hari) ini baru training level Malaysia ni" over the collapse (70.0-72.25), the HyperFrames title spells the line'},
	{id: 'drill', srcStart: 3.9, srcEnd: 14.8, zoomFrom: 1.0, zoomTo: 1.1, zoomOriginY: 990, note: '"(okay, move, bawah) Yes. Kita nak go, you punya footwork tu. Nak pergi laju. Depan, belakang. (Oh, tunggu) Nampak tak macam mana masalah dia?"'},
	{id: 'split', srcStart: 14.8, srcEnd: 18.3, zoomFrom: 1.0, zoomTo: 1.0, zoomOriginY: 760, note: 'The split close-up; no words, the dialogue runs on from "drill"'},
	{id: 'simple', srcStart: 20.9, srcEnd: 23.76, zoomFrom: 1.04, zoomTo: 1.1, zoomOriginY: 960, note: '"Ini level. Tadi simple sangat macam ni." (the first "ini level" at 19.9 is cut)'},
	{id: 'lagi', srcStart: 31.05, srcEnd: 32.0, zoomFrom: 1.12, zoomTo: 1.14, zoomOriginY: 960, note: 'LEVEL UP. "Okey, lagi."'},
	{id: 'footwork', srcStart: 34.25, srcEnd: 42.25, zoomFrom: 1.0, zoomTo: 1.12, zoomOriginY: 980, note: '"Kita nak bagi awak punya footwork. Good. Depan. (okey) Good. Okey, tukar pula."'},
	{id: 'masuk', srcStart: 43.85, srcEnd: 46.45, zoomFrom: 1.06, zoomTo: 1.14, zoomOriginY: 990, note: '"(okey) Masuk." Ends at 46.45: the passes disagree on 46.5-48.0 ("masuk" / "keluar" / noise), so it is left out'},
	{id: 'bawah', srcStart: 50.95, srcEnd: 53.6, zoomFrom: 1.14, zoomTo: 1.18, zoomOriginY: 990, note: '"Bawah. Okey." Runs on 0.85 s into the next save (no words)'},
	{id: 'lari', srcStart: 60.7, srcEnd: 62.25, zoomFrom: 1.0, zoomTo: 1.06, zoomOriginY: 990, note: '"Buat lari, kena cepat!"'},
	{id: 'tangan', srcStart: 62.98, srcEnd: 66.8, zoomFrom: 1.06, zoomTo: 1.16, zoomOriginY: 990, note: '"Nampak, tangan tak boleh angkat, step pun tak lepas dah." (0.73 s pause cut before it)'},
	{id: 'ko', srcStart: 69.0, srcEnd: 74.0, zoomFrom: 1.0, zoomTo: 1.1, zoomOriginY: 980, note: 'Payoff: he sits, rolls back and lies flat (floor at 70.80). K.O., GAME OVER, end card'},
];

export const EDL = createEdl({defs: DEFS, transcript, outroFrames: 30});
