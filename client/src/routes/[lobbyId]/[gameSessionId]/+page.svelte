<script lang="ts">
	import {
		currentGameSessionPlayersStore as players,
		currentGameSessionStore as session
	} from '../../../features/game-sessions/store';
	import SimpleGameUI from '../../../features/games/simple-game/SimpleGameUI.svelte';
	import TicTacToeUI from '../../../features/games/tic-tac-toe/TicTacToeUI.svelte';
	import LunoUI from '../../../features/games/luno/LunoUI.svelte';
	import { userData } from '../../../features/user/store';
	import { joinGameSession } from '../../../features/game-sessions/controller';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	const isPlayer = $derived($session?.players.includes($userData.id) || false);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const data = $derived({ session: $session as any, players: $players!, isPlayer });

	let isJoining = $state(false);
	const lobbyId = $derived(page.params.lobbyId!);

	const maxPlayers = $derived(
		$session
			? $session.gameId === 'tic-tac-toe'
				? 2
				: ($session.settings['players-count'] as number) || 4
			: 0
	);
	const isFull = $derived($session ? $session.players.length >= maxPlayers : false);

	async function handleJoinGame() {
		if (!$session) return;
		isJoining = true;
		await joinGameSession($session.id);
		isJoining = false;
	}

	function handleLeaveToLobby() {
		goto(resolve(`/${lobbyId}`));
	}
</script>

<svelte:head>
	<title>Arc Lobby - Playing {$session?.gameId ? $session.gameId.replace('-', ' ').toUpperCase() : 'Game'}</title>
	<meta name="description" content="Join or spectate this live game session of {$session?.gameId ? $session.gameId.replace('-', ' ') : 'a multiplayer game'} on Arc Lobby!" />
	<meta property="og:title" content="Arc Lobby - Live Game Session" />
	<meta property="og:description" content="Join or spectate this live game session of {$session?.gameId ? $session.gameId.replace('-', ' ') : 'a multiplayer game'} on Arc Lobby!" />
	<meta name="twitter:title" content="Arc Lobby - Live Game Session" />
	<meta name="twitter:description" content="Join or spectate this live game session of {$session?.gameId ? $session.gameId.replace('-', ' ') : 'a multiplayer game'} on Arc Lobby!" />
</svelte:head>

<h1 class="sr-only">Arc Lobby - Live Game Session: {$session?.gameId ? $session.gameId.replace('-', ' ').toUpperCase() : 'Game'}</h1>

<div class="relative flex h-dvh w-screen flex-col">
	{#if $session?.gameId === 'simple-game'}
		<SimpleGameUI {...data} />
	{:else if $session?.gameId === 'tic-tac-toe'}
		<TicTacToeUI {...data} />
	{:else if $session?.gameId === 'luno'}
		<LunoUI {...data} />
	{:else}
		No session
	{/if}

	{#if $session && $session.state === 'waiting' && !isPlayer && !isFull}
		<div class="absolute bottom-[20%] left-1/2 z-50 -translate-x-1/2 w-full max-w-[280px] px-4 animate-scaleUp">
			<button
				onclick={handleJoinGame}
				disabled={isJoining}
				class="btn btn-primary h-12 w-full rounded-md font-sans text-sm font-bold shadow-lg transition-all duration-200 active:scale-95 text-white border-none cursor-pointer flex items-center justify-center gap-2 hover:bg-primary/90"
			>
				{#if isJoining}
					<span class="loading loading-spinner loading-xs"></span> Joining...
				{:else}
					Join Game
				{/if}
			</button>
		</div>
	{/if}
</div>

<style>
	@keyframes scaleUp {
		0% {
			transform: scale(0.92) translateY(12px);
			opacity: 0;
		}
		100% {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	.animate-scaleUp {
		animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}
</style>
