import React, {useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, OffthreadVideo, staticFile} from 'remotion';
import {z} from 'zod';
import {VideoLayer, CutFlash, FaceMask} from './components/VideoLayer';
import {Captions} from './components/Captions';
import {AudioLayer} from './components/AudioLayer';
import {SafeZoneGuides} from './components/SafeZoneGuides';
import {EditConfig, EditProvider} from './lib/edit';

export const mainSchema = z.object({
	preview: z.boolean(),
	guides: z.boolean(),
	music: z.boolean(),
	sfx: z.boolean(),
	voice: z.boolean(),
	/** QA passes: 'faces' = filled face boxes only, 'overlay' = graphics + captions only (both on black). */
	qa: z.enum(['off', 'faces', 'overlay']).optional(),
});

export type MainProps = z.infer<typeof mainSchema>;

const useFonts = () => {
	const [handle] = useState(() => delayRender('fonts'));
	useState(() => {
		Promise.all([document.fonts.load('400 100px Anton'), document.fonts.load('900 60px Montserrat'), document.fonts.load('800 60px Montserrat')])
			.then(() => continueRender(handle))
			.catch(() => continueRender(handle));
		return null;
	});
};

/** The shared template: graded video + cut flashes + edit graphics + captions + mixed audio. */
export const makeMain = (edit: EditConfig): React.FC<MainProps> => {
	const Main: React.FC<MainProps> = ({preview, guides, music, sfx, voice, qa = 'off'}) => {
		useFonts();
		const G = edit.Graphics;
		if (qa !== 'off') {
			return (
				<EditProvider edit={edit}>
					<AbsoluteFill style={{background: '#000'}}>
						{qa === 'faces' ? <FaceMask /> : (
							<>
								<G />
								{edit.overlay ? <OffthreadVideo src={staticFile(edit.overlay.src)} transparent muted /> : null}
								<Captions />
							</>
						)}
					</AbsoluteFill>
				</EditProvider>
			);
		}
		return (
			<EditProvider edit={edit}>
				<AbsoluteFill style={{background: '#000'}}>
					<VideoLayer src={preview ? edit.media.proxy : edit.media.master} guides={guides} preview={preview} />
					<CutFlash />
					<G />
					{edit.overlay ? <OffthreadVideo src={staticFile(edit.overlay.src)} transparent muted /> : null}
					<Captions />
					{guides ? <SafeZoneGuides /> : null}
					<AudioLayer music={music} sfx={sfx} voice={voice} />
				</AbsoluteFill>
			</EditProvider>
		);
	};
	return Main;
};
