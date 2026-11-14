import React, {createContext, useContext} from 'react';
import type {Edl} from './edl';

export type FaceSample = {t: number; faces: number[][]};

export type Cue = {sfx: string; at: number; vol: number; trim?: number; dur?: number; fadeIn?: number};

/** Everything that differs between two videos edited with this template. */
export type EditConfig = {
	id: string;
	edl: Edl;
	faces: FaceSample[];
	media: {
		master: string; // public/ paths
		proxy: string;
		voice: string;
		music: string;
		musicTrimFrames: number; // start the bed on its first downbeat
	};
	/** Default captions centre line and zoom pivot when a segment does not set its own. */
	captionY: number;
	zoomOriginY: number;
	captionKeys: Set<string>;
	/** Shrink long caption chunks so they stay inside the caption band (max ~2 lines). */
	captionAutoFit?: boolean;
	/** Override the caption box's x / width (default CAPTION_ZONE: x 170, w 680). */
	captionZone?: {x: number; w: number};
	/** Face boxes taller than this are treated as false positives in QA (default 320 px). */
	maxFaceHeight?: number;
	Graphics: React.FC;
	/** Transparent motion-graphics plate (e.g. a HyperFrames WebM/ProRes 4444 render) laid over
	 *  the whole edit from frame 0, between the edit's own graphics and the captions. */
	overlay?: {src: string};
	shakeHits: number[];
	cues: Cue[];
	/** Extra per-output-frame dialogue gain (clip gain automation). */
	voiceGain?: (f: number) => number;
	musicUnderSpeech: number;
	musicInGaps: number;
	sfxBus: number;
};

const Ctx = createContext<EditConfig | null>(null);

export const EditProvider: React.FC<{edit: EditConfig; children: React.ReactNode}> = ({edit, children}) => <Ctx.Provider value={edit}>{children}</Ctx.Provider>;

export const useEdit = (): EditConfig => {
	const e = useContext(Ctx);
	if (!e) throw new Error('useEdit outside EditProvider');
	return e;
};
