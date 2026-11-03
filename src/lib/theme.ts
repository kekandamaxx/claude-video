import '@fontsource/anton/400.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';

export const C = {
	gold: '#FFC72C',
	goldDeep: '#F2A900',
	navy: '#0A1633',
	navySoft: 'rgba(10, 22, 51, 0.88)',
	blue: '#1E5BFF',
	red: '#FF2D3D',
	white: '#FFFFFF',
	green: '#2BE38B',
};

export const FONT_DISPLAY = 'Anton, Impact, sans-serif';
export const FONT_UI = 'Montserrat, Arial, sans-serif';

// Layout on the 1080x1920 canvas.
// Unsafe for platform UI (TikTok + Instagram Reels, union of both):
//   top 0-250 (status bar, Following/For You, IG header), bottom 1440-1920
//   (caption, username, audio ticker, nav), right 960-1080 (like/comment/share
//   rail), left 0-60.
// Faces measured with YuNet over the whole clip sit at y 680-1060 (see
// src/data/faces.json). Graphics therefore live in two bands only:
export const SAFE = {left: 60, right: 960, top: 250, bottom: 1440};
export const TOP_ZONE = {x: 70, y: 260, w: 880, h: 350}; // y 260-610, above every face
export const CAPTION_ZONE = {x: 170, y: 1150, w: 680, h: 260}; // y 1150-1410, below faces, above UI
export const ZOOM_ORIGIN_Y = 864; // zoom pivots on the face band so faces stay put
