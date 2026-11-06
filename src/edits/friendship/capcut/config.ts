/**
 * FriendshipCapcut: the 90-second vertical (9:16) cut, edited the way a CapCut beat edit is:
 * hard cuts on the beat, short punchy transitions (zoom punch, whip, spin, flash, shake),
 * a beat "pulse" on every photo, clean bright colour, bold pop-in text and karaoke lyrics.
 *
 * Song: public/friendship/song.wav, built by scripts/prepare_song.sh from your own copy of the song.
 * Lyrics: public/friendship/lyrics.lrc, your own timed lyrics (standard LRC against the full song).
 * Both are optional at render time: without lyrics.lrc the lyric layer stays empty.
 */

export type Cut = 'zoom' | 'whipLeft' | 'whipRight' | 'spin' | 'flash' | 'shake' | 'blur';

export type CapShot = {id: string; beats: number; cut: Cut};

export const SONG = {
	file: 'friendship/song.wav',
	/** Shown as a small music sticker on the opening when true (set it once the real song is in place). */
	showTitle: false,
	title: 'Musafir Rindu',
	targetSeconds: 90,
	fadeOutSeconds: 2.5,
};

/**
 * Order and length (in beats of the song). Beat counts are scaled together to land near
 * SONG.targetSeconds whatever the song's tempo. Every photo appears exactly once.
 */
export const SHOTS: CapShot[] = [
	{id: '07-mamak-night', beats: 8, cut: 'flash'}, // hook: the loudest, happiest group, title pops on it
	{id: '06-boardroom', beats: 6, cut: 'zoom'},
	{id: '02-numismatic-wall', beats: 6, cut: 'whipLeft'},
	{id: '03-mosque-visit', beats: 6, cut: 'whipLeft'},
	{id: '04-abu-waqqas-tomb', beats: 6, cut: 'spin'},
	{id: '14-night-stall', beats: 6, cut: 'flash'},
	{id: '09-wicker-chairs', beats: 6, cut: 'zoom'},
	{id: '08-park-meetup', beats: 6, cut: 'whipRight'},
	{id: '10-wedding-dais', beats: 4, cut: 'shake'},
	{id: '11-yellow-scarves', beats: 4, cut: 'shake'},
	{id: '16-bench-elder', beats: 8, cut: 'blur'},
	{id: '15-airport-elder', beats: 8, cut: 'zoom'},
	{id: '12-hospital-visit', beats: 8, cut: 'blur'},
	{id: '13-grave-visit', beats: 8, cut: 'blur'},
	{id: '05-night-gathering', beats: 8, cut: 'flash'},
	{id: '01-raya-group', beats: 16, cut: 'zoom'}, // ends the film; the closing text pops on its second half
];

export const CAP_TEXT = {
	title: 'A Friendship\nto Remember',
	final: 'Some memories\nlast forever.',
	signature: 'A FRIENDSHIP TO REMEMBER',
};

/** Frames each transition takes (centred on the beat). */
export const CUT_FRAMES: Record<Cut, number> = {zoom: 10, whipLeft: 10, whipRight: 10, spin: 12, flash: 6, shake: 2, blur: 14};

/** Clean modern look: no sepia, no grain. Photos are colour-matched by the prep script first. */
export const LOOK = {contrast: 1.08, saturate: 1.12, brightness: 1.03};
