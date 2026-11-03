import React, {useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {z} from 'zod';
import {VideoLayer, CutFlash} from './components/VideoLayer';
import {Graphics} from './components/Graphics';
import {Captions} from './components/Captions';
import {AudioLayer} from './components/AudioLayer';
import {SafeZoneGuides} from './components/SafeZoneGuides';

export const mainSchema = z.object({
	preview: z.boolean(),
	guides: z.boolean(),
	music: z.boolean(),
	sfx: z.boolean(),
	voice: z.boolean(),
});

export type MainProps = z.infer<typeof mainSchema>;

export const Main: React.FC<MainProps> = ({preview, guides, music, sfx, voice}) => {
	const [handle] = useState(() => delayRender('fonts'));
	useState(() => {
		Promise.all([
			document.fonts.load('400 100px Anton'),
			document.fonts.load('900 60px Montserrat'),
			document.fonts.load('800 60px Montserrat'),
		])
			.then(() => continueRender(handle))
			.catch(() => continueRender(handle));
		return null;
	});
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<VideoLayer src={preview ? 'video/proxy.mp4' : 'video/master.mp4'} guides={guides} />
			<CutFlash />
			<Graphics />
			<Captions />
			{guides ? <SafeZoneGuides /> : null}
			<AudioLayer music={music} sfx={sfx} voice={voice} />
		</AbsoluteFill>
	);
};
