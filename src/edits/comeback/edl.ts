// Edit decision list for the "kena tinggal 3 biji" talks: five clips (IMG_7671-7675)
// joined into one source by scripts/concat_sources.sh, 314.7 s raw -> ~35 s.
// Clip offsets in the joined source: 7671 0.0, 7672 131.3, 7673 152.43, 7674 179.1, 7675 228.0.
// Ranges come from two full Whisper large-v3 passes, a focused third pass on the
// lines where they disagreed, and a 100 ms loudness scan for onsets and pauses.
//
// Faces sit at y 515-1195 across the kept takes, so graphics use y 260-500 only
// (Graphics.tsx) and captions sit below the faces (centre 1310) throughout.
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';

const DEFS: SegmentDef[] = [
	{id: 'hook', srcStart: 181.55, srcEnd: 184.55, zoomFrom: 1.0, zoomTo: 1.06, zoomOriginY: 920, note: 'HOOK "Kena ingat, kena 3 biji pun, jangan down."'},
	{id: 'semalam', srcStart: 162.44, srcEnd: 164.76, zoomFrom: 1.0, zoomTo: 1.04, zoomOriginY: 950, note: '"Ingat, kita tak nak benda semalam berulang lagi."'},
	{id: 'half', srcStart: 165.34, srcEnd: 167.64, zoomFrom: 1.03, zoomTo: 1.07, zoomOriginY: 960, note: '"First half kita perform, second half kita down." (0.6 s pause removed before it)'},
	{id: 'tragedi', srcStart: 14.72, srcEnd: 17.1, zoomFrom: 1.0, zoomTo: 1.06, zoomOriginY: 945, note: '"Lepas tu apa jadi kat kita? Tragedi tau."'},
	{id: 'fancy', srcStart: 0.14, srcEnd: 3.42, zoomFrom: 1.0, zoomTo: 1.05, zoomOriginY: 970, note: '"Bila kita mula main fancy ni, kita akan rasa overconfident tau."'},
	{id: 'fancy2', srcStart: 4.22, srcEnd: 5.98, zoomFrom: 1.05, zoomTo: 1.08, zoomOriginY: 970, note: '"Overconfident ni akan memakan diri sendiri." (0.8 s pause removed before it)'},
	{id: 'tolong', srcStart: 18.66, srcEnd: 20.6, zoomFrom: 1.0, zoomTo: 1.05, zoomOriginY: 925, note: '"Tolong, tolong jangan mula main fancy."'},
	{id: 'rush', srcStart: 184.5, srcEnd: 185.34, zoomFrom: 1.06, zoomTo: 1.08, zoomOriginY: 935, note: '"Jangan rush."'},
	{id: 'control', srcStart: 186.32, srcEnd: 188.44, zoomFrom: 1.0, zoomTo: 1.05, zoomOriginY: 935, note: '"Tolong, control game." (1.0 s pause removed before it)'},
	{id: 'mental', srcStart: 168.8, srcEnd: 170.12, zoomFrom: 1.04, zoomTo: 1.07, zoomOriginY: 975, note: '"Mental kena kuat."'},
	{id: 'boleh', srcStart: 105.16, srcEnd: 108.36, zoomFrom: 1.0, zoomTo: 1.06, zoomOriginY: 860, note: '"Game ni boleh menang. Tapi kalau kau buat susah, habis lah."'},
	{id: 'menang', srcStart: 242.76, srcEnd: 244.46, zoomFrom: 1.0, zoomTo: 1.04, zoomOriginY: 765, note: '"Nak menang, cara main, main cara nak menang."'},
	{id: 'henjut', srcStart: 229.22, srcEnd: 231.56, zoomFrom: 1.0, zoomTo: 1.05, zoomOriginY: 760, note: '"Dapat bola, henjut! Dapat bola, henjut!"'},
	{id: 'minit', srcStart: 172.3, srcEnd: 175.12, zoomFrom: 1.0, zoomTo: 1.06, zoomOriginY: 935, note: '"Ada 25 minit lagi. Jangan down."'},
	{id: 'letsgo', srcStart: 137.44, srcEnd: 139.16, zoomFrom: 1.02, zoomTo: 1.08, zoomOriginY: 905, note: '"Let\'s go, let\'s go! Easy game, easy game."'},
];

// 54 frames of outro = the Hyperframes end card (hyperframes/comeback/endcard).
export const EDL = createEdl({defs: DEFS, transcript, outroFrames: 54});
