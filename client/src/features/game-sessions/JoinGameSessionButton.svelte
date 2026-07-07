<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import LoadingScreen from '../../components/LoadingScreen.svelte';
	import { joinGameSession } from './controller';

	let { lobbyId } = page.params;
	let { gameSessionId } = $props();
	let isLoading = $state(false);

	async function handleJoinGameSession() {
		isLoading = true;
		const session = await joinGameSession(gameSessionId);
		if (session) {
			goto(resolve(`/${lobbyId}/${session.id}`));
			return;
		}

		if (!session) {
			isLoading = false;
		}
	}
</script>

{#if isLoading}
	<LoadingScreen />
{/if}
<button
	onclick={handleJoinGameSession}
	class="btn h-10 w-full rounded-md font-sans text-xs font-bold transition-all duration-200 shadow-md active:scale-95 bg-primary text-white border-none hover:bg-primary/90 cursor-pointer"
>
	Join Game
</button>
