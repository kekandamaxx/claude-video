import React from 'react';
import {Composition} from 'remotion';
import {Main, mainSchema} from './Main';
import {FPS, HEIGHT, TOTAL_FRAMES, WIDTH} from './lib/edl';

export const RemotionRoot: React.FC = () => (
	<Composition
		id="TimeoutEdit"
		component={Main}
		schema={mainSchema}
		durationInFrames={TOTAL_FRAMES}
		fps={FPS}
		width={WIDTH}
		height={HEIGHT}
		defaultProps={{preview: true, guides: false, music: true, sfx: true, voice: true}}
	/>
);
