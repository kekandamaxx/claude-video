import React from 'react';
import {Composition} from 'remotion';
import {makeMain, mainSchema} from './Main';
import {FPS, HEIGHT, WIDTH} from './lib/edl';
import {timeoutEdit} from './edits/timeout';
import {semifinalEdit} from './edits/semifinal';
import {briefingEdit} from './edits/briefing';
import {vivaEdit} from './edits/viva';
import {drillEdit} from './edits/drill';
import {FriendshipTribute, friendshipDefaults, friendshipSchema} from './edits/friendship/FriendshipTribute';
import * as FT from './edits/friendship/timeline';
import {CapcutEdit, capcutDefaults, capcutSchema} from './edits/friendship/capcut/CapcutEdit';
import {CAP, FPS as CAP_FPS, H as CAP_H, W as CAP_W} from './edits/friendship/capcut/timeline';

const defaults = {preview: true, guides: false, music: true, sfx: true, voice: true};

// One composition per edited video; all share the same template (src/Main.tsx).
const EDITS = [
	{id: 'TimeoutEdit', edit: timeoutEdit},
	{id: 'SemifinalEdit', edit: semifinalEdit},
	{id: 'BriefingEdit', edit: briefingEdit},
	{id: 'VivaEdit', edit: vivaEdit},
	{id: 'DrillEdit', edit: drillEdit},
];

const COMPONENTS = EDITS.map((x) => ({...x, component: makeMain(x.edit)}));

export const RemotionRoot: React.FC = () => (
	<>
		{COMPONENTS.map(({id, edit, component}) => (
			<Composition key={id} id={id} component={component} schema={mainSchema} durationInFrames={edit.edl.totalFrames} fps={FPS} width={WIDTH} height={HEIGHT} defaultProps={defaults} />
		))}
		{/* 16:9 photo tribute (not part of the 9:16 coach-talk template). */}
		<Composition
			id="FriendshipTribute"
			component={FriendshipTribute}
			schema={friendshipSchema}
			defaultProps={friendshipDefaults}
			durationInFrames={FT.TIMELINE.totalFrames}
			fps={FT.FPS}
			width={FT.WIDTH}
			height={FT.HEIGHT}
		/>
		{/* 90 s vertical beat edit (CapCut style) of the same photos. */}
		<Composition
			id="FriendshipCapcut"
			component={CapcutEdit}
			schema={capcutSchema}
			defaultProps={capcutDefaults}
			durationInFrames={CAP.totalFrames}
			fps={CAP_FPS}
			width={CAP_W}
			height={CAP_H}
		/>
	</>
);
