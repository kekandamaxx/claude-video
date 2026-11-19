// Beat grid of the music bed (Mixkit "Epical Drums 02", 117.5 BPM, 4/4) in OUTPUT frames,
// after the bed is trimmed by 61 frames (first drum hit lands on frame 0).
// Source: scripts/friendship_beats.py public/shared/music/epical_drums_02.wav (librosa beat
// tracker), times t -> round((t - 61/30) * 30). One bar = 4 beats = 60-61 frames.
export const BEATS = [
	0, 16, 30, 46, 60, 76, 90, 106, 120, 135, 150, 165, 180, 195, 210, 225, 241, 255, 271, 285, 301, 315, 330, 345, 360, 375, 390, 405, 420, 436, 450, 466, 480, 496, 510, 526, 540, 556, 570,
	585, 600, 615, 630, 645, 661, 675, 690, 705, 721, 735, 751, 765, 780, 796, 810, 826, 840, 856, 870, 885, 900, 916, 930, 946, 960, 976, 991, 1006, 1020, 1035, 1050, 1065, 1080, 1095, 1111,
	1125, 1141, 1155, 1171, 1185, 1201, 1216, 1230, 1245, 1260, 1276, 1290, 1306, 1320, 1335, 1350, 1365, 1380,
];

/** Output frame of beat k. */
export const beat = (k: number) => {
	const f = BEATS[k];
	if (f === undefined) throw new Error(`beat ${k} outside the grid`);
	return f;
};
