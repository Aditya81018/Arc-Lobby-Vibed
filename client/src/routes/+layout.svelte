<script lang="ts">
	import './layout.css';
	import { socket } from '$lib/socket';
	import { loadInitialDataFromServer } from '$lib/load-data';
	import LoadingScreen from '../components/LoadingScreen.svelte';
	import { initTheme } from '$lib/theme.svelte';
	let isLoading = $state(true);

	let { children } = $props();
	initTheme();

	socket.connect();
	socket.on('connect', async () => {
		await loadInitialDataFromServer();
		isLoading = false;
	});
</script>

{#if isLoading}
	<LoadingScreen />
{:else}
	<div class="min-h-screen bg-canvas text-ink transition-colors duration-200">
		{@render children()}
	</div>
{/if}
