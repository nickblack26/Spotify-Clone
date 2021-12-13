import { atom } from 'recoil';

// store current id of song playing
export const currentTrackIdState = atom({
	key: 'currentTrackIdState',
	default: null,
});

export const isPlayingState = atom({
	key: 'isPlayingState',
	default: false,
});
