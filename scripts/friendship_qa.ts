/**
 * Pre-render checks for FriendshipTribute. Run: npm run qa:friendship
 *  - every photo in the folder / manifest is on the timeline exactly once
 *  - every file the composition reads exists in public/
 *  - every frame of every cover shot keeps all protected face boxes inside the 16:9 frame
 *  - no face sits under the appreciation text band while that text is on screen
 */
import fs from 'node:fs';
import path from 'node:path';
import {containMove, containSize, coverMove, coverScale, protectBox, resolveLayout} from '../src/edits/friendship/framing';
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
const used = TIMELINE.clips.map((c) => c.photo.id);
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

// 3. Framing, per frame.
const TEXT_BAND = {y0: HEIGHT - 92 - 100, y1: HEIGHT - 92 + 4};
console.log('\n  #  scene         photo                       layout   motion    on screen (s)      min face margin');
for (const c of TIMELINE.clips) {
	const p = c.photo;
	const layout = resolveLayout(p, c.layout);
	let minMargin = Infinity;
	const faceBoxesAt = (frame: number) => {
		const t = (frame - c.from) / Math.max(1, c.to - c.from);
		if (layout === 'cover') {
			const {z, cx, cy} = coverMove(p, c.motion)(t);
			const k = coverScale(p) * z;
			const map = (x: number, y: number) => ({X: WIDTH / 2 + (x - cx) * p.width * k, Y: HEIGHT / 2 + (y - cy) * p.height * k});
			const pb = protectBox(p);
			const a = map(pb.x0, pb.y0);
			const b = map(pb.x1, pb.y1);
			minMargin = Math.min(minMargin, a.X, a.Y, WIDTH - b.X, HEIGHT - b.Y);
			return p.faces.map((f) => ({y0: map(f.x, f.y).Y, y1: map(f.x + f.w, f.y + f.h).Y}));
		}
		const m = containMove(c.motion)(t);
		const fg = containSize(p);
		const w = fg.w * m.fgScale;
		const h = fg.h * m.fgScale;
		const x0 = (WIDTH - w) / 2 + m.fgX;
		const y0 = (HEIGHT - h) / 2 + m.fgY;
		minMargin = Math.min(minMargin, x0, y0, WIDTH - (x0 + w), HEIGHT - (y0 + h));
		return p.faces.map((f) => ({y0: y0 + f.y * h, y1: y0 + (f.y + f.h) * h}));
	};
	for (let fr = c.from; fr < c.to; fr++) {
		const faces = faceBoxesAt(fr);
		if (c.text && fr >= c.text.from && fr <= c.text.to) {
			for (const f of faces) if (f.y1 > TEXT_BAND.y0 && f.y0 < TEXT_BAND.y1) {
				fail(`${p.id}: a face is under the text band at frame ${fr}`);
				break;
			}
		}
	}
	if (minMargin < -0.5) fail(`${p.id}: protected area leaves the frame by ${(-minMargin).toFixed(1)} px`);
	console.log(
		`${String(c.index + 1).padStart(3)}  ${c.scene.padEnd(13)} ${p.id.padEnd(27)} ${layout.padEnd(8)} ${c.motion.padEnd(9)} ${(c.from / FPS).toFixed(2).padStart(6)}-${(c.to / FPS).toFixed(2).padEnd(7)} ${c.inT.type.padEnd(13)} ${minMargin.toFixed(0)} px`,
	);
}
console.log('\nscenes:');
for (const r of TIMELINE.ranges) console.log(`  ${r.title.padEnd(28)} ${(r.from / FPS).toFixed(1).padStart(6)} - ${(r.to / FPS).toFixed(1)} s`);
console.log(`total: ${TIMELINE.totalFrames} frames = ${(TIMELINE.totalFrames / FPS).toFixed(2)} s @ ${FPS} fps, ${WIDTH}x${HEIGHT}`);
console.log(errors ? `\n${errors} problem(s)` : '\nall checks passed');
process.exit(errors ? 1 : 0);
