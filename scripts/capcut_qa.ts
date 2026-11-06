/** Pre-render checks for FriendshipCapcut: coverage, ~90 s, cuts on beats, faces clear of titles and lyrics. */
import fs from 'node:fs';
import {PHOTOS} from '../src/edits/friendship/timeline';
import beats from '../src/edits/friendship/capcut/song_beats.json';
import {CAP, faceRows, FIT_CY, H, TITLE_BAND, W} from '../src/edits/friendship/capcut/timeline';
let errors = 0;
const fail = (m: string) => { errors++; console.log('  FAIL ' + m); };
const ids = CAP.clips.map((c) => c.photo.id);
console.log(`photos: manifest ${PHOTOS.length}, in edit ${ids.length}, unique ${new Set(ids).size}`);
if (new Set(ids).size !== PHOTOS.length || ids.length !== PHOTOS.length) fail('every photo must appear exactly once');
const secs = CAP.totalFrames / 30;
console.log(`length: ${secs.toFixed(2)} s, ${W}x${H}`);
if (secs < 80 || secs > 100) fail('length should be about 90 s');
const bf = (beats as {beats: number[]}).beats.map((t) => Math.round(t * 30));
const off = CAP.clips.slice(1).filter((c) => !bf.some((b) => Math.abs(b - c.start) <= 1));
console.log(`cuts on a beat: ${CAP.clips.length - 1 - off.length}/${CAP.clips.length - 1}`);
off.forEach((c) => fail(`cut into ${c.photo.id} is off the beat`));
for (const f of ['public/friendship/song.wav', ...PHOTOS.flatMap((p) => ['public/' + p.src, 'public/' + p.bg])]) if (!fs.existsSync(f)) fail(`missing ${f}`);
console.log(fs.existsSync('public/friendship/lyrics.lrc') ? 'lyrics: public/friendship/lyrics.lrc found' : 'lyrics: none (public/friendship/lyrics.lrc not present)');
for (const c of CAP.clips) {
	const rows = faceRows(c);
	const hit = (b: {y0: number; y1: number}) => rows.some((r) => r.y1 > b.y0 && r.y0 < b.y1);
	if (c.titled && hit(TITLE_BAND)) fail(`${c.photo.id}: a face is under the title text`);
	if (hit(c.lyricBand)) fail(`${c.photo.id}: no lyric band free of faces`);
	console.log(`  ${c.photo.id.padEnd(22)} ${c.layout.padEnd(4)} ${c.inCut.padEnd(9)} ${(c.start / 30).toFixed(2).padStart(6)}s  lyrics y ${c.lyricBand.y0}-${c.lyricBand.y1}${c.titled ? '  (title)' : ''}`);
}
void FIT_CY;
console.log(errors ? `\n${errors} problem(s)` : '\nall checks passed');
process.exit(errors ? 1 : 0);
