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
		/** The last source frame as a still (public/ path), held under the outro instead of a frozen video frame. */
		outroStill?: string;
	};
	/** Default captions centre line and zoom pivot when a segment does not set its own. */
	captionY: number;
	zoomOriginY: number;
	captionKeys: Set<string>;
	/** Shrink long caption chunks so they stay inside the caption band (max ~2 lines). */
	captionAutoFit?: boolean;
	/** Face boxes taller than this are treated as false positives in QA (default 320 px). */
	maxFaceHeight?: number;
	Graphics: React.FC;
	/** Full-frame colour/light effects on the picture (not graphics): drawn under the graphics, left out of the overlay QA pass. */
	Grade?: React.FC;
	shakeHits: number[];
	cues: Cue[];
	/** Extra per-output-frame dialogue gain (clip gain automation). */
	voiceGain?: (f: number) => number;
	/** Extra per-output-frame music gain on top of the speech ducking (drop-outs, swells). */
	musicGain?: (f: number) => number;
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
