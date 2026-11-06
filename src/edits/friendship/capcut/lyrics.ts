/** LRC parsing: "[mm:ss.xx] text" (several timestamps per line allowed). Times are song seconds. */
export type LyricLine = {start: number; end: number; text: string};

export const parseLrc = (src: string, offset: number, maxEnd: number): LyricLine[] => {
	const items: {t: number; text: string}[] = [];
	for (const raw of src.split(/\r?\n/)) {
		const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
		if (!stamps.length) continue;
		const text = raw.replace(/\[[^\]]*\]/g, '').trim();
		for (const m of stamps) items.push({t: Number(m[1]) * 60 + Number(m[2]) - offset, text});
	}
	items.sort((a, b) => a.t - b.t);
	const lines: LyricLine[] = [];
	items.forEach((it, i) => {
		const next = items[i + 1]?.t ?? it.t + 5;
		// A line holds until the next one, but never more than 7 s (instrumental gaps stay clean).
		const end = Math.min(next, it.t + 7, maxEnd);
		if (it.text && end > 0 && it.t < maxEnd) lines.push({start: it.t, end, text: it.text});
	});
	return lines;
};
