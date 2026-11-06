/**
 * Pre-render checks for FriendshipTribute. Run: npm run qa:friendship
 *  - every photo in the folder / manifest is on the timeline exactly once
 *  - every file the composition reads exists in public/
 *  - every frame of every cover shot keeps all protected face boxes inside the 16:9 frame
 *  - every cut lands on a downbeat of the soundtrack
 *  - no face (or print) sits under the appreciation text line while that text is on screen
 */
import fs from 'node:fs';
import path from 'node:path';
import beats from '../src/edits/friendship/beats.json';
import {containMove, coverMove, coverScale, fitInBox, protectBox, resolveLayout} from '../src/edits/friendship/framing';
import {TEXT_BOTTOM} from '../src/edits/friendship/FriendshipTribute';
import {CARD, pairLayout} from '../src/edits/friendship/PhotoShot';
import {MUSIC} from '../src/edits/friendship/story';
import {FPS, HEIGHT, PHOTOS, TIMELINE, WIDTH} from '../src/edits/friendship/timeline';

const root = process.cwd(); // npm runs scripts from the project root
const pub = (p: string) => path.join(root, 'public', p);
let errors = 0;
const fail = (m: string) => {
	errors++;
	console.log('  FAIL ' + m);
};

// 1. Coverage.
const folder = path.join(root, 'assets/friendship/photos');
const onDisk = fs.existsSync(folder) ? fs.readdirSync(folder).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)) : [];
const used = TIMELINE.clips.flatMap((c) => c.photos.map((p) => p.id));
const dup = used.filter((id, i) => used.indexOf(id) !== i);
console.log(`photos: folder ${onDisk.length}, manifest ${PHOTOS.length}, on timeline ${used.length}, unique ${new Set(used).size}`);
if (onDisk.length !== PHOTOS.length) fail(`folder has ${onDisk.length} photos but photos.json has ${PHOTOS.length}: re-run scripts/prepare_friendship.sh`);
if (dup.length) fail(`duplicated on timeline: ${dup.join(', ')}`);
for (const p of PHOTOS) if (!used.includes(p.id)) fail(`missing from timeline: ${p.id}`);
const expected = process.env.EXPECTED_PHOTOS ? Number(process.env.EXPECTED_PHOTOS) : null;
if (expected !== null && used.length !== expected) fail(`expected ${expected} photos, timeline has ${used.length}`);

// 2. Assets.
const files = [MUSIC.file, ...Array.from({length: 12}, (_, i) => `friendship/grain/g${i}.png`), ...PHOTOS.flatMap((p) => [p.src, p.bg])];
const missing = files.filter((f) => !fs.existsSync(pub(f)));
console.log(`assets: ${files.length - missing.length}/${files.length} present`);
missing.forEach((m) => fail(`missing asset public/${m}`));

// 3. Cuts on the beat.
const downs = (beats as {downbeats: number[]}).downbeats.map((t) => Math.round(t * FPS));
const offBeat = TIMELINE.clips.filter((c) => c.index > 0 && !downs.some((d) => Math.abs(d - c.slotFrom) <= 1));
console.log(`cuts on a downbeat: ${TIMELINE.clips.length - 1 - offBeat.length}/${TIMELINE.clips.length - 1}`);
offBeat.forEach((c) => fail(`cut into ${c.photos[0].id} is not on a downbeat`));

// 4. Framing, every frame: protected faces inside the frame, no face under the text line.
type Rect = {x0: number; y0: number; x1: number; y1: number};
const TEXT_BAND = {y0: HEIGHT - TEXT_BOTTOM - 75, y1: HEIGHT - TEXT_BOTTOM};
const printRects = (c: (typeof TIMELINE.clips)[number], t: number, seconds: number): {p: (typeof PHOTOS)[number]; r: Rect; protect: Rect}[] => {
	const p = c.photos[0];
	const map = (r: Rect, x: number, y: number, w: number, h: number): Rect => ({x0: x + r.x0 * w, y0: y + r.y0 * h, x1: x + r.x1 * w, y1: y + r.y1 * h});
	const full = {x0: 0, y0: 0, x1: 1, y1: 1};
	if (c.photos.length === 2) {
		const m = containMove(c.motion, seconds)(t);
		const v = m.fgY || m.fgX;
		return pairLayout(p, c.photos[1]).map((L, i) => {
			const w = L.w * m.fgScale;
			const h = L.h * m.fgScale;
			const x = L.x + (L.w - w) / 2;
			const y = L.y + (L.h - h) / 2 + (i ? -v : v);
			const ph = c.photos[i];
			return {p: ph, r: map(full, x, y, w, h), protect: map(protectBox(ph), x, y, w, h)};
		});
	}
	if (resolveLayout(p, c.layout) === 'cover') {
		const {z, cx, cy} = coverMove(p, c.motion, seconds)(t);
		const k = coverScale(p) * z;
		const x = WIDTH / 2 - cx * p.width * k;
		const y = HEIGHT / 2 - cy * p.height * k;
		return [{p, r: map(full, x, y, p.width * k, p.height * k), protect: map(protectBox(p), x, y, p.width * k, p.height * k)}];
	}
	const m = containMove(c.motion, seconds)(t);
	const box = c.text ? CARD.withText : CARD.normal;
	const fg = fitInBox(p, box.w, box.h);
	const w = fg.w * m.fgScale;
	const h = fg.h * m.fgScale;
	const x = (WIDTH - fg.w) / 2 + (fg.w - w) / 2 + m.fgX;
	const y = box.cy - fg.h / 2 + (fg.h - h) / 2 + m.fgY;
	return [{p, r: map(full, x, y, w, h), protect: map(protectBox(p), x, y, w, h)}];
};
console.log('\n  #  scene         photo(s)                              layout  motion    on screen (s)    in            face margin  print margin');
for (const c of TIMELINE.clips) {
	const seconds = (c.to - c.from) / FPS;
	let faceMargin = Infinity;
	let printMargin = Infinity;
	for (let fr = c.from; fr < c.to; fr++) {
		const t = (fr - c.from) / Math.max(1, c.to - c.from);
		for (const {p, r, protect} of printRects(c, t, seconds)) {
			faceMargin = Math.min(faceMargin, protect.x0, protect.y0, WIDTH - protect.x1, HEIGHT - protect.y1);
			if (c.photos.length === 2 || resolveLayout(p, c.layout) === 'contain') printMargin = Math.min(printMargin, r.x0, r.y0, WIDTH - r.x1, HEIGHT - r.y1);
			if (c.text && fr >= c.text.from && fr <= c.text.to) {
				const h = r.y1 - r.y0;
				for (const f of p.faces) {
					const fy0 = r.y0 + f.y * h;
					const fy1 = r.y0 + (f.y + f.h) * h;
					if (fy1 > TEXT_BAND.y0 && fy0 < TEXT_BAND.y1) fail(`${p.id}: face under the text line at frame ${fr}`);
				}
				if (r.y1 > TEXT_BAND.y0 + 4) fail(`${p.id}: print reaches under the text line at frame ${fr}`);
			}
		}
	}
	if (faceMargin < -0.5) fail(`${c.photos[0].id}: protected faces leave the frame by ${(-faceMargin).toFixed(1)} px`);
	if (printMargin < -0.5) fail(`${c.photos[0].id}: a framed print is cut by the frame edge`);
	const layout = c.photos.length === 2 ? 'pair' : resolveLayout(c.photos[0], c.layout);
	console.log(
		`${String(c.index + 1).padStart(3)}  ${c.scene.padEnd(13)} ${c.photos.map((p) => p.id).join(' + ').padEnd(37)} ${layout.padEnd(7)} ${c.motion.padEnd(9)} ${(c.from / FPS).toFixed(2).padStart(6)}-${(c.to / FPS).toFixed(2).padEnd(7)} ${c.inT.type.padEnd(13)} ${faceMargin.toFixed(0).padStart(6)} px ${Number.isFinite(printMargin) ? printMargin.toFixed(0).padStart(8) + ' px' : '        -'}`,
	);
}
console.log('\nscenes:');
for (const r of TIMELINE.ranges) console.log(`  ${r.title.padEnd(28)} bar ${String(r.fromBar).padStart(2)}  ${(r.from / FPS).toFixed(1).padStart(6)} - ${(r.to / FPS).toFixed(1)} s`);
console.log(`total: ${TIMELINE.totalFrames} frames = ${(TIMELINE.totalFrames / FPS).toFixed(2)} s @ ${FPS} fps, ${WIDTH}x${HEIGHT}`);
console.log(errors ? `\n${errors} problem(s)` : '\nall checks passed');
process.exit(errors ? 1 : 0);
