import { io } from 'socket.io-client';
import { get } from 'svelte/store';
import { userData } from '../features/user/store';
import { PUBLIC_SERVER_URL } from '$env/static/public';

export const socket = io(PUBLIC_SERVER_URL, {
	autoConnect: false,
	auth: {
		data: get(userData)
	}
});

