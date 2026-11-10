// Writes the HyperFrames variables for the HuddleEdit overlays from the EDL, so the
// kinetic type always lands on the words: out/.hf/huddle_{hook,finale}.json.
// Run by scripts/render_huddle_hf.sh (bundled with esbuild).
import {mkdirSync, writeFileSync} from 'fs';
import {EDL} from '../src/edits/huddle/edl';
import {FPS} from '../src/lib/edl';

const word = (seg: string, text: string) => {
	for (const c of EDL.chunks) for (const w of c.words) if (w.segId === seg && w.text === text) return w.from;
	throw new Error(`word ${text} not found in ${seg}`);
};
const sec = (f: number, from: number) => +((f - from) / FPS).toFixed(4);

const h0 = EDL.seg('hook').outFrom;
const hook = {
	tBudak: sec(word('hook', 'BUDAK'), h0),
	tPerempuan: sec(word('hook', 'PEREMPUAN'), h0),
	tKena: sec(word('hook', 'KENA'), h0),
	tTinggal: sec(word('hook', 'TINGGAL'), h0),
	t3: sec(word('hook', '3'), h0),
	tGol: sec(word('hook', 'GOL'), h0),
	tTau: sec(word('hook', 'TAU'), h0),
	tEnd: sec(EDL.segEnd('hook'), h0),
};
const f0 = EDL.seg('menang').outFrom;
const finale = {
	tBoleh: sec(word('menang', 'BOLEH'), f0),
	tMenang: sec(word('menang', 'MENANG'), f0),
	tCheer: sec(EDL.seg('cheer').outFrom, f0),
	tFreeze: sec(EDL.seg('shout').outFrom, f0),
	tEnd: sec(EDL.totalFrames, f0),
};
mkdirSync('out/.hf', {recursive: true});
writeFileSync('out/.hf/huddle_hook.json', JSON.stringify(hook));
writeFileSync('out/.hf/huddle_finale.json', JSON.stringify(finale));
console.log(JSON.stringify({hookFrames: EDL.segEnd('hook') - h0, finaleFrames: EDL.totalFrames - f0, hook, finale}));
