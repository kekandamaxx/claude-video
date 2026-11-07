// Writes out/DefeatEdit/words.json: every transcript word inside the cut, in composition seconds.
import {mkdirSync, writeFileSync} from 'fs';
import transcript from '../src/edits/defeat/transcript.json';
import {EDL, FPS} from '../src/edits/defeat/edl';
const T = transcript as unknown as Record<string, [string, number, number, number][]>;
const words: [string, number, number][] = [];
for (const v of EDL.voice)
	for (const [w, s, e] of T[v.clip])
		if (s >= v.srcFrom - 0.05 && e <= v.srcTo + 0.05) words.push([w, (v.start + (Math.max(s, v.srcFrom) - v.srcFrom) * FPS) / FPS, (v.start + (Math.min(e, v.srcTo) - v.srcFrom) * FPS) / FPS]);
mkdirSync('out/DefeatEdit', {recursive: true});
writeFileSync('out/DefeatEdit/words.json', JSON.stringify(words.sort((a, b) => a[1] - b[1])));
console.log(`${words.length} words`);
