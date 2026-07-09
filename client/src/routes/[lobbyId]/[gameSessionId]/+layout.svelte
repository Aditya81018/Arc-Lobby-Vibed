<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { socket } from '$lib/socket';
	import {
		currentGameSessionPlayersStore,
		currentGameSessionStore,
		type GameSession
	} from '../../../features/game-sessions/store';
	import { getGameSessionById, leaveGameSession } from '../../../features/game-sessions/controller';
	import LoadingScreen from '../../../components/LoadingScreen.svelte';
	import { getLocalMembers } from '../../../features/lobby/controllers';
	import { getOptimisticPlay, setOptimisticPlay } from '../../../features/games/luno/optimistic';
	import { userData } from '../../../features/user/store';

	const { children } = $props();
	const lobbyId = page.params.lobbyId!;
	const gameSessionId = page.params.gameSessionId!;
	let isLoading = $state(true);

	onMount(() => {
		async function handlePlayersUpdate(players: string[]) {
			if (!$currentGameSessionStore) {
				$currentGameSessionPlayersStore = null;
				return;
			}
			$currentGameSessionStore.players = players;
			$currentGameSessionPlayersStore = getLocalMembers(players);
		}

		async function handleSessionDataUpdate(newData: GameSession['data']) {
			if (!$currentGameSessionStore) return;

			if ($currentGameSessionStore.gameId === 'luno') {
				const opt = getOptimisticPlay();
				if (opt && newData && Array.isArray((newData as any).discardPile) && (newData as any).discardPile.length > 0) {
					const lData = newData as any;
					const topCard = lData.discardPile[lData.discardPile.length - 1];
					if (topCard.color === opt.color && topCard.value === opt.value && topCard.playedBy === $userData.id) {
						topCard.id = opt.id;
						topCard.rotate = opt.rotate;
						topCard.x = opt.x;
						topCard.y = opt.y;
						setOptimisticPlay(null);
					}
				}
			}

			$currentGameSessionStore.data = newData;
		}

		function handleSessionUpdate(updatedSession: GameSession) {
			if (!$currentGameSessionStore) return;
			$currentGameSessionStore = updatedSession;
			$currentGameSessionPlayersStore = getLocalMembers(updatedSession.players);
		}

		function handleSocketConnect() {
			socket.emit('join-game-session', gameSessionId);
		}

		handle();
		async function handle() {
			try {
				const gameSession = await getGameSessionById(gameSessionId);
				if (!gameSession || gameSession.lobbyId !== lobbyId) {
					return goto(resolve(`/${lobbyId}`));
				}

				$currentGameSessionStore = gameSession;
				$currentGameSessionPlayersStore = await getLocalMembers(gameSession.players);

				socket.emit('join-game-session', gameSessionId);
				socket.on('players-update', handlePlayersUpdate);
				socket.on('session-data-update', handleSessionDataUpdate);
				socket.on('session-update', handleSessionUpdate);
				socket.on('connect', handleSocketConnect);

				isLoading = false;
			} catch {
				goto(resolve(`/${lobbyId}`));
			}
		}

		return () => {
			leaveGameSession(gameSessionId);
			$currentGameSessionStore = null;
			$currentGameSessionPlayersStore = null;

			socket.emit('leave-game-session', gameSessionId);
			socket.off('players-update', handlePlayersUpdate);
			socket.off('session-data-update', handleSessionDataUpdate);
			socket.off('session-update', handleSessionUpdate);
			socket.off('connect', handleSocketConnect);
		};
	});
</script>

{#if isLoading}
	<LoadingScreen />
{:else}
	{@render children()}
{/if}
