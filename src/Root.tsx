import React from 'react';
import {Composition} from 'remotion';
import {makeMain, mainSchema} from './Main';
import {FPS, HEIGHT, WIDTH} from './lib/edl';
import {timeoutEdit} from './edits/timeout';
import {semifinalEdit} from './edits/semifinal';
import {briefingEdit} from './edits/briefing';
import {vivaEdit} from './edits/viva';

const defaults = {preview: true, guides: false, music: true, sfx: true, voice: true};

// One composition per edited video; all share the same template (src/Main.tsx).
const EDITS = [
	{id: 'TimeoutEdit', edit: timeoutEdit},
	{id: 'SemifinalEdit', edit: semifinalEdit},
	{id: 'BriefingEdit', edit: briefingEdit},
	{id: 'VivaEdit', edit: vivaEdit},
];

const COMPONENTS = EDITS.map((x) => ({...x, component: makeMain(x.edit)}));

export const RemotionRoot: React.FC = () => (
	<>
		{COMPONENTS.map(({id, edit, component}) => (
			<Composition key={id} id={id} component={component} schema={mainSchema} durationInFrames={edit.edl.totalFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={defaults} />
		))}
	</>
);
