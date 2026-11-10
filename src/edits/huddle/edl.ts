// Edit decision list for the pre-match huddle: four phone clips of the same talk,
// joined back to back by scripts/prepare_huddle.sh into one source (times below):
//   clip1 0.000-24.133  tactics ("tebuk, release")           464x832, upscaled
//   clip2 24.133-31.533 hands in, defence positions          speech unclear: B-roll only
//   clip3 31.533-46.100 line-up, "jangan mental down", the girls' comeback
//   clip4 46.100-50.633 hands in + team shout
//
// Story: open loop -> line-up -> tactics -> mindset -> loop closed -> cheer.
//   HOOK   "Budak perempuan kena tinggal 3 gol tau..." stops before "boleh menang".
//   ...    the payoff "Boleh menang." is held back until just before the cheer.
// Dropped: clip1 0-5.0 (unintelligible on every ASR pass), "dua tu je, yang lain tu tak
// boleh move / dia tu memang ada orang setting" (5.0-9.4, unclear, ambiguous meaning),
// the second "tebuk, release / jangan tebuk... kau tunggu, okey?" (18.4-24.1, a repeat
// of the line before it), all of clip2's speech (low confidence: "wing kiri", "45 kiri"),
// "Afiq, okay?" (31.5-33.3, name unclear), "Boleh? Okay, my full pleasure" (37.5-39.3,
// unclear), the 0.3-0.5 s pauses inside "Syahmi | Alright" and "Ingat, | kena tinggal",
// and the end of clip4 where the huddle breaks up.
//
// Layout (faces.json, YuNet 5 fps):
//   clip1/clip2  faces at y 640-1120        -> graphics in the top band (y 260-610)
//   clip3        coach's face at y 260-840  -> graphics in the low band (y 880-1140)
//   clip4        faces at y 500-820         -> low band
//   captions everywhere at y 1170-1430 (centre 1300).
import transcript from './transcript.json';
import {createEdl, SegmentDef} from '../../lib/edl';

const CAP = 1300;
const MASTER = 'huddle/video/master.mp4';
const clip2 = {kind: 'video' as const, master: MASTER, proxy: 'huddle/video/proxy.mp4', srcStart: 24.2, facesAt: 24.2};

const DEFS: SegmentDef[] = [
	{id: 'hook', srcStart: 43.3, srcEnd: 45.5, zoomFrom: 1.06, zoomTo: 1.12, captionY: CAP, zoomOriginY: 600, hideCaptions: true, note: 'HOOK (open loop): "Budak perempuan kena tinggal 3 gol tau..." as kinetic type (HyperFrames)'},
	{id: 'keeper', srcStart: 33.85, srcEnd: 35.32, zoomFrom: 1.0, zoomTo: 1.03, captionY: CAP, zoomOriginY: 520, note: '"Keeper, Syahmi."'},
	{id: 'captain', srcStart: 35.58, srcEnd: 37.22, zoomFrom: 1.09, zoomTo: 1.11, captionY: CAP, zoomOriginY: 460, note: '"Alright, captain aku simpan dulu." (0.26 s pause cut; zoom change hides the jump)'},
	{id: 'move', srcStart: 9.56, srcEnd: 11.82, zoomFrom: 1.0, zoomTo: 1.05, captionY: CAP, zoomOriginY: 940, note: '"Korang semua boleh move. Semua ada footwork."'},
	{id: 'basic', srcStart: 12.28, srcEnd: 14.26, zoomFrom: 1.02, zoomTo: 1.08, captionY: CAP, zoomOriginY: 900, visual: clip2, note: 'B-roll: hands in the huddle (clip2) under "Remember, basic instruction."'},
	{id: 'tebuk', srcStart: 15.06, srcEnd: 17.96, zoomFrom: 1.02, zoomTo: 1.06, captionY: CAP, zoomOriginY: 760, note: '"Tebuk, release. Faham tak tebuk, release tu macam mana?"'},
	{id: 'forty', srcStart: 39.34, srcEnd: 41.12, zoomFrom: 1.0, zoomTo: 1.03, captionY: CAP, zoomOriginY: 480, note: '"40 minit. Ingat,"'},
	{id: 'mental', srcStart: 41.46, srcEnd: 43.08, zoomFrom: 1.1, zoomTo: 1.14, captionY: CAP, zoomOriginY: 620, note: '"kena tinggal, jangan mental down." (0.34 s pause cut; tighter frame)'},
	{id: 'menang', srcStart: 45.56, srcEnd: 46.1, zoomFrom: 1.12, zoomTo: 1.14, captionY: CAP, zoomOriginY: 600, hideCaptions: true, note: 'PAYOFF (loop closed): "Boleh menang." (HyperFrames burst)'},
	{id: 'cheer', srcStart: 46.1, srcEnd: 48.62, zoomFrom: 1.0, zoomTo: 1.06, captionY: CAP, zoomOriginY: 640, hideCaptions: true, note: 'Hands in (clip4), coach call + count'},
	{id: 'shout', srcStart: 48.62, srcEnd: 49.5, zoomFrom: 1.04, zoomTo: 1.08, captionY: CAP, zoomOriginY: 640, hideCaptions: true, visual: {kind: 'image', src: 'huddle/img/freeze.jpg', facesAt: 48.5}, note: 'Freeze frame (hands up, 48.50 s) on the team shout; held under the end card'},
];

export const EDL = createEdl({
	defs: DEFS,
	transcript,
	outroFrames: 54,
	fix: {'3': '3', 'Syahmi.': 'SYAHMI'},
});
