import { writable } from 'svelte/store';
import request from '$lib/request';
import { getRandomColor, getRandomEmoji, getRandomName } from './controllers';
import { themeState } from '$lib/theme.svelte';

export interface UserData {
	id: string;
	name: string;
	emoji: string;
	color: {
		foregroundLight: string;
		foregroundDark: string;
		backgroundLight: string;
		backgroundDark: string;
		pickerColor?: string;
	};
}

export const userData = writable<UserData>(getInitialData());

function getInitialData() {
	let data: any = {};
	try {
		const stored = localStorage.getItem('user-data');
		if (stored) {
			data = JSON.parse(stored) || {};
		}
	} catch (e) {
		console.error('Failed to parse user-data from localStorage:', e);
	}

	// Validate or migrate color structure
	let color = getRandomColor();
	if (data.color && typeof data.color === 'object') {
		if (
			typeof data.color.foregroundLight === 'string' &&
			typeof data.color.backgroundLight === 'string'
		) {
			color = data.color;
		} else if (typeof data.color.background === 'string') {
			// Migrate legacy color
			const match = data.color.background.match(/hsl\((\d+(?:\.\d+)?)/);
			if (match) {
				const hue = parseFloat(match[1]);
				color = {
					foregroundLight: `hsl(${hue}, 80%, 38%)`,
					foregroundDark: `hsl(${hue}, 95%, 72%)`,
					backgroundLight: `hsl(${hue}, 75%, 82%)`,
					backgroundDark: `hsl(${hue}, 60%, 42%)`,
					pickerColor: `hsl(${hue}, 85%, 55%)`
				};
			}
		}
	}

	return {
		name: getRandomName(),
		emoji: getRandomEmoji(),
		...data,
		id: data.id || crypto.randomUUID(),
		color
	} as UserData;
}

userData.subscribe((data) => {
	try {
		localStorage.setItem('user-data', JSON.stringify(data));
	} catch (e) {
		console.error('Failed to write user-data to localStorage:', e);
	}
	if (data.id !== '') {
		request<UserData>(`/users/${data.id}`, 'PUT', data);
	}
});

export function getUserForeground(color: UserData['color'] | undefined) {
	if (!color) return 'gray';
	if (typeof color.foregroundLight !== 'string') {
		return (color as any).foreground || 'gray';
	}
	return themeState.current === 'arc-dark' ? color.foregroundDark : color.foregroundLight;
}

export function getUserBackground(color: UserData['color'] | undefined) {
	if (!color) return 'gray';
	if (typeof color.backgroundLight !== 'string') {
		return (color as any).background || 'gray';
	}
	return themeState.current === 'arc-dark' ? color.backgroundDark : color.backgroundLight;
}
