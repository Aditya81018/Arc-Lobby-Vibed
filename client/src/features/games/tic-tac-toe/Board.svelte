<script lang="ts">
	import { socket } from '$lib/socket';
	import { userData, getUserForeground, type UserData } from '../../user/store';
	import Token from './Token.svelte';
	import type { TicTacToePlayer, TicTacToeSession } from './types';
	import WinningStroke from './WinningStroke.svelte';
	import { currentGameSessionStore } from '../../game-sessions/store';
	import { setOptimisticMove } from './optimistic';

	const {
		session,
		players,
		playersData
	}: {
		session: TicTacToeSession;
		players: (UserData | undefined)[];
		playersData: TicTacToePlayer[];
	} = $props();

	function occupiedBy(position: number) {
		return playersData.find((player) => player.moves.includes(position));
	}

	function onClick(position: number) {
		return () => {
			if (
				session.state === 'ongoing' &&
				session.data.turnOf === session.players.indexOf($userData.id) &&
				!occupiedBy(position)
			) {
				// 1. Set optimistic move
				setOptimisticMove({ position });

				// 2. Emit socket event
				socket.emit('place-token', position);

				// 3. Update local store
				currentGameSessionStore.update((curr) => {
					if (!curr || curr.gameId !== 'tic-tac-toe') return curr;

					const tttData = curr.data as any;
					if (!tttData || !tttData.playersData) return curr;

					const selfIndex = curr.players.indexOf($userData.id);
					if (selfIndex === -1 || tttData.turnOf !== selfIndex) return curr;

					const newPlayersData = tttData.playersData.map((player: any) => {
						if (player.id === selfIndex) {
							const newMoves = [...player.moves];
							if (!newMoves.includes(position)) {
								newMoves.push(position);
							}
							if (curr.settings['is-moving'] && newMoves.length > 3) {
								newMoves.splice(0, 1);
							}
							return { ...player, moves: newMoves };
						}
						return player;
					});

					const findWinningCombo = (moves: number[]) => {
						const WIN_COMBOS = ['012', '345', '678', '036', '147', '258', '048', '246'];
						const movesStr = moves.join();
						for (const combo of WIN_COMBOS) {
							if (
								movesStr.includes(combo[0]) &&
								movesStr.includes(combo[1]) &&
								movesStr.includes(combo[2])
							)
								return WIN_COMBOS.indexOf(combo);
						}
						return undefined;
					};

					const winningCombo = findWinningCombo(newPlayersData[selfIndex].moves);
					let nextState = curr.state;
					let nextWinner = curr.winner;

					if (winningCombo !== undefined) {
						nextState = 'finished';
						nextWinner = curr.players[selfIndex];
					} else if (newPlayersData[0].moves.length + newPlayersData[1].moves.length === 9) {
						nextState = 'finished';
						nextWinner = 'draw';
					}

					const nextTurnOf = nextState === 'ongoing' ? (selfIndex === 0 ? 1 : 0) : tttData.turnOf;

					return {
						...curr,
						state: nextState,
						winner: nextWinner,
						data: {
							...tttData,
							turnOf: nextTurnOf,
							playersData: newPlayersData,
							winningCombo
						}
					};
				});
			}
		};
	}
</script>

<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<div class="relative flex flex-col">
	{#each new Array(3) as row, i (i)}
		<div class="flex">
			{#each new Array(3) as box, j (j)}
				{@const playerData = occupiedBy(i * 3 + j)}
				{@const player = playerData ? players[playerData.id] : undefined}
				<button
					onclick={onClick(i * 3 + j)}
					class="h-28 w-28 border-base-300 font-mono {i !== 0 ? 'border-t-4' : ''} {j !== 0
						? 'border-l-4'
						: ''}"
					style="color: {getUserForeground(player?.color)};"
				>
					{#if playerData?.token !== undefined}
						<Token token={playerData.token} />
					{/if}
				</button>
			{/each}
		</div>
	{/each}
	{#if session.state === 'finished'}
		<WinningStroke combo={session.data.winningCombo!} />
	{/if}
</div>
