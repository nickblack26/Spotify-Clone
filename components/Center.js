import { signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { shuffle } from 'lodash';
import { useRecoilValue, useRecoilState } from 'recoil';
import { playlistIdState, playlistState } from '../atoms/playlistAtom';
import useSpotify from '../hooks/useSpotify';
import Songs from './Songs';
import { ChevronDownIcon } from '@heroicons/react/outline';

const colors = [
	'from-indigo-500',
	'from-blue-500',
	'from-green-500',
	'from-red-500',
	'from-yellow-500',
	'from-pink-500',
	'from-purple-500',
];

function Center() {
	const { data: session } = useSession();
	const spotifyAPI = useSpotify();
	const [color, setColor] = useState(null);
	const playlistId = useRecoilValue(playlistIdState);
	const [playlist, setPlaylist] = useRecoilState(playlistState);

	useEffect(() => {
		setColor(shuffle(colors).pop());
	}, [playlistId]);

	useEffect(() => {
		spotifyAPI
			.getPlaylist(playlistId)
			.then((data) => {
				setPlaylist(data.body);
			})
			.catch((err) => console.error(err));
	}, [spotifyAPI, playlistId]);

	return (
		<div className='flex-grow text-white h-screen overflow-y-scroll scrollbar-hide'>
			<header className='absolute top-5 right-8'>
				<div
					className='flex items-center bg-black space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full p-[2px] pr-2 text-white'
					onClick={signOut}
				>
					<img
						className='rounded-full w-7 h-7'
						src={session?.user.image}
						alt=''
					/>
					<h2 className='text-sm'>{session?.user.name}</h2>
					<ChevronDownIcon className='h-4 w-4' />
				</div>
			</header>

			<section
				className={`flex items-end space-x-7 bg-gradient-to-b to-black ${color} h-80 text-white p-8`}
			>
				<img
					className='h-44 w-44 shadow-2xl'
					src={playlist?.images?.[0]?.url}
				/>
				<div>
					<p className='text-sm'>PLAYLIST</p>
					<h1 className='text-3xl md:text-4xl xl:text-5xl'>
						{playlist?.name}
					</h1>
					<p className='text-gray-400'>{playlist?.description}</p>
					<div className='flex text-gray-400'>
						<p>{playlist?.owner.display_name}</p>
						<p
							before='• '
							className='before:content-[attr(before)] after:content-[attr(after)]'
						>
							{playlist?.followers.total} likes
						</p>
						<p
							before='• '
							className='before:content-[attr(before)]'
						>
							{playlist?.tracks.total} songs
						</p>
					</div>
				</div>
			</section>
			<div>
				<Songs />
			</div>
		</div>
	);
}

export default Center;
