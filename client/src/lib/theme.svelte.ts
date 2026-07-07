import { browser } from '$app/environment';

export const themeState = $state({
	current: 'arc-light'
});

export function initTheme() {
	if (!browser) return;
	const savedTheme =
		localStorage.getItem('theme') ||
		(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'arc-dark' : 'arc-light');
	themeState.current = savedTheme;
	document.documentElement.setAttribute('data-theme', savedTheme);
}

export function toggleTheme() {
	if (!browser) return;
	const nextTheme = themeState.current === 'arc-light' ? 'arc-dark' : 'arc-light';
	themeState.current = nextTheme;
	localStorage.setItem('theme', nextTheme);
	document.documentElement.setAttribute('data-theme', nextTheme);
}
