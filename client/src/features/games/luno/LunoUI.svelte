<script lang="ts">
	import {
		type UserData,
		userData as user,
		getUserForeground,
		getUserBackground
	} from '../../user/store';
	import { socket } from '$lib/socket';
	import type { LunoSession } from './types';
	import PlayersLayout from './PlayersLayout.svelte';
	import RematchButton from '../../game-sessions/RematchButton.svelte';
	import LeaveGameSessionButton from '../../game-sessions/LeaveGameSessionButton.svelte';
	import BackToLobbyButton from '../../game-sessions/BackToLobbyButton.svelte';
	import UnoHand from '../../../components/UnoHand.svelte';
	import UnoCard from '../../../components/UnoCard.svelte';
	import { onMount } from 'svelte';
	import { setOptimisticPlay } from './optimistic';
	import { currentGameSessionStore } from '../../game-sessions/store';

	const {
		session,
		players,
		isPlayer
	}: {
		session: LunoSession;
		players: (UserData | undefined)[];
		isPlayer: boolean;
	} = $props();

	let isPlayerTurn = $derived(
		isPlayer && session.players[session.data.turnOf] === $user.id && session.state === 'ongoing'
	);

	let selfIndex = $derived(players.findIndex((p) => p?.id === $user.id));
	let hand = $derived(
		selfIndex !== -1 && session.data.playersData[selfIndex]
			? session.data.playersData[selfIndex].hand
			: []
	);
	let shouldHighlightDrawPile = $derived(
		isPlayerTurn &&
			hand.length > 0 &&
			session.data.drawPileCount > 0 &&
			!hand.some((card) => isCardPlayable(card))
	);

	let selectedCardIndex = $state<number | null>(null);
	let isMobile = $state(false);
	let activeAnimation = $state<'top' | 'left' | 'right' | 'bottom'>('bottom');

	let showColorSelector = $state(false);
	let pendingDiscardIdx = $state<number | null>(null);

	$effect(() => {
		// Reset selector when the active turn player changes
		const _ = session.data.turnOf;
		showColorSelector = false;
		pendingDiscardIdx = null;
	});

	function discardCardOptimistically(cardIndex: number, chosenColor?: string) {
		const card = hand[cardIndex];
		if (!card) return;

		let finalColor = card.color;
		if (card.color === 'wild') {
			if (chosenColor) {
				finalColor = chosenColor;
			} else {
				finalColor = 'red';
			}
		}

		// 1. Generate optimistic card info
		const optId = `opt-${card.color}-${card.value}-${Date.now()}-${Math.random()}`;
		const rotate = Math.floor(Math.random() * 26) - 13;
		const x = Math.floor(Math.random() * 21) - 10;
		const y = Math.floor(Math.random() * 17) - 8;

		const optimisticPlay = {
			color: finalColor,
			value: card.value,
			id: optId,
			rotate,
			x,
			y,
			playedBy: $user.id
		};

		// 2. Set the optimistic play globally so layout can reconcile
		setOptimisticPlay(optimisticPlay);

		// 3. Emit the socket event
		socket.emit('luno-discard-card', cardIndex, chosenColor);

		// 4. Update the local store optimistically
		currentGameSessionStore.update((curr) => {
			if (!curr || curr.gameId !== 'luno') return curr;

			// Deep/shallow copy LunoData
			const lunoData = curr.data as any;
			if (!lunoData || !lunoData.playersData) return curr;

			const newPlayersData = lunoData.playersData.map((player: any, pIdx: number) => {
				if (pIdx === selfIndex) {
					const newHand = [...player.hand];
					newHand.splice(cardIndex, 1);
					return { ...player, hand: newHand };
				}
				return player;
			});

			const nextDiscardPile = [
				...lunoData.discardPile,
				{
					...optimisticPlay,
					zIndex: 10 + lunoData.discardPile.length
				}
			];

			// Simulate turn logic
			let dir = lunoData.direction;
			let skipNext = false;
			let accumulatedDrawCount = lunoData.accumulatedDrawCount || 0;
			let message = lunoData.message;

			if (card.value === 'reverse') {
				if (curr.players.length === 2) {
					skipNext = true;
					message = `${$user.name} played Reverse to get another turn`;
				} else {
					dir = (dir === 1 ? -1 : 1);
					message = `${$user.name} reversed direction`;
				}
			} else if (card.value === 'skip') {
				skipNext = true;
				message = `${$user.name} skipped the next player`;
			} else if (card.value === 'draw-two') {
				accumulatedDrawCount = (accumulatedDrawCount || 0) + 2;
				message = `${$user.name} played Draw 2`;
			} else if (card.value === 'wild-draw-four') {
				accumulatedDrawCount = (accumulatedDrawCount || 0) + 4;
				message = `${$user.name} played Wild Draw 4 and chose ${finalColor}`;
			} else if (card.color === 'wild' && card.value === 'wild') {
				message = `${$user.name} played Wild and chose ${finalColor}`;
			} else {
				message = `${$user.name} played ${card.color} ${card.value}`;
			}

			let tempTurnOf = lunoData.turnOf;
			if (skipNext) {
				tempTurnOf = (tempTurnOf + dir + curr.players.length) % curr.players.length;
			}

			let attempts = 0;
			do {
				tempTurnOf = (tempTurnOf + dir + curr.players.length) % curr.players.length;
				attempts++;
			} while (curr.players[tempTurnOf] === undefined && attempts < curr.players.length);

			const nextTurnOf = tempTurnOf;

			let nextState = curr.state;
			let nextWinner = curr.winner;
			if (newPlayersData[selfIndex].hand.length === 0) {
				nextState = 'finished';
				nextWinner = $user.id;
				message = `${$user.name} has won!`;
			}

			return {
				...curr,
				state: nextState,
				winner: nextWinner,
				data: {
					...lunoData,
					turnOf: nextTurnOf,
					direction: dir,
					playersData: newPlayersData,
					discardPile: nextDiscardPile,
					message,
					accumulatedDrawCount
				}
			};
		});
	}

	function selectColor(color: 'red' | 'blue' | 'yellow' | 'green') {
		if (pendingDiscardIdx !== null) {
			discardCardOptimistically(pendingDiscardIdx, color);
		}
		showColorSelector = false;
		pendingDiscardIdx = null;
	}

	onMount(() => {
		const mediaQuery = window.matchMedia('(pointer: coarse)');
		isMobile = mediaQuery.matches;

		const handler = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
		};
		mediaQuery.addEventListener('change', handler);

		const savedAnim = localStorage.getItem('luno_discard_anim');
		if (
			savedAnim === 'top' ||
			savedAnim === 'left' ||
			savedAnim === 'right' ||
			savedAnim === 'bottom'
		) {
			activeAnimation = savedAnim;
		}

		return () => mediaQuery.removeEventListener('change', handler);
	});

	function isCardPlayable(card: { color: string; value: string }) {
		if (!isPlayerTurn) return false;
		if (session.data.accumulatedDrawCount && session.data.accumulatedDrawCount > 0) {
			return card.value === 'draw-two' || card.value === 'wild-draw-four';
		}
		const topCard = session.data.discardPile[session.data.discardPile.length - 1];
		if (!topCard) return true;
		return card.color === 'wild' || card.color === topCard.color || card.value === topCard.value;
	}

	function handleCardClick(card: { color: string; value: string }, idx: number) {
		if (!isCardPlayable(card)) return;

		if (card.color === 'wild') {
			if (!isMobile) {
				pendingDiscardIdx = idx;
				showColorSelector = true;
				selectedCardIndex = null;
			} else {
				if (selectedCardIndex === idx) {
					pendingDiscardIdx = idx;
					showColorSelector = true;
					selectedCardIndex = null;
				} else {
					selectedCardIndex = idx;
				}
			}
		} else {
			if (!isMobile) {
				discardCardOptimistically(idx);
				selectedCardIndex = null;
			} else {
				if (selectedCardIndex === idx) {
					discardCardOptimistically(idx);
					selectedCardIndex = null;
				} else {
					selectedCardIndex = idx;
				}
			}
		}
	}

	function handleDrawPileClick() {
		if (!isPlayerTurn) return;
		socket.emit('luno-draw-card');
		selectedCardIndex = null;
	}

	function handleDiscardPileClick() {
		if (isMobile && selectedCardIndex !== null) {
			const card = hand[selectedCardIndex];
			if (card && isCardPlayable(card)) {
				if (card.color === 'wild') {
					pendingDiscardIdx = selectedCardIndex;
					showColorSelector = true;
					selectedCardIndex = null;
				} else {
					discardCardOptimistically(selectedCardIndex);
					selectedCardIndex = null;
				}
			}
		}
	}

	function handleBackgroundClick() {
		selectedCardIndex = null;
	}

	function getAnimationDirection(playedBy?: string): 'top' | 'left' | 'right' | 'bottom' {
		if (!playedBy) return 'bottom';
		const playedByIndex = session.players.indexOf(playedBy);
		if (playedByIndex === -1) return 'bottom';

		let selfIdx = session.players.indexOf($user.id);
		selfIdx = selfIdx === -1 ? 0 : selfIdx;

		const playersCount = session.players.length;
		const relativePosition = (playedByIndex - selfIdx + playersCount) % playersCount;

		if (playersCount === 2) {
			if (relativePosition === 0) return 'bottom';
			if (relativePosition === 1) return 'top';
		} else if (playersCount === 3) {
			if (relativePosition === 0) return 'bottom';
			if (relativePosition === 1) return 'left';
			if (relativePosition === 2) return 'right';
		} else if (playersCount === 4) {
			if (relativePosition === 0) return 'bottom';
			if (relativePosition === 1) return 'left';
			if (relativePosition === 2) return 'top';
			if (relativePosition === 3) return 'right';
		}

		return 'bottom';
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative flex h-full w-full flex-col bg-canvas text-ink transition-colors duration-200 p-4 overflow-hidden"
	onclick={handleBackgroundClick}
>
	<LeaveGameSessionButton />

	<PlayersLayout {players} playersData={session.data.playersData} {session}>
		{#if session.state === 'finished'}
			{@const winner = players.find((player) => player?.id === session.winner)}
			<div
				class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-canvas/90 backdrop-blur-sm p-4 text-center animate-scaleUp pointer-events-auto"
			>
				<div
					class="max-w-md w-full p-6 rounded-2xl border border-hairline bg-card flex flex-col items-center gap-6 shadow-2xl"
				>
					<div class="flex flex-col items-center gap-2">
						{#if winner}
							<div class="relative">
								<div
									class="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-md border-2 border-[#7C5CFC]"
									style="background-color: {getUserBackground(winner.color)};"
								>
									{winner.emoji}
								</div>
								<span class="absolute -top-2 -right-2 text-3xl animate-bounce">👑</span>
							</div>
						{/if}
						<h2 class="text-3xl font-extrabold font-display text-ink mt-2">
							{winner?.name ?? 'Unknown'} Won!
						</h2>
					</div>

					<!-- Leaderboard / Standings -->
					<div class="w-full flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
						{#each players as player, idx (player?.id ?? idx)}
							{#if player !== undefined}
								{@const pIdx = idx}
								{@const pData = session.data.playersData[pIdx]}
								{@const isWinner = player.id === session.winner}
								<div
									class="flex items-center justify-between p-3 rounded-xl {isWinner
										? 'bg-primary/20 border border-primary/40'
										: 'bg-canvas/50 border border-hairline/50'}"
								>
									<div class="flex items-center gap-3">
										<div
											class="w-8 h-8 rounded-full flex items-center justify-center text-lg"
											style="background-color: {getUserBackground(player.color)};"
										>
											{player.emoji}
										</div>
										<span class="font-semibold text-sm text-ink {isWinner ? 'font-bold' : ''}">
											{player.name}
											{#if player.id === $user.id}
												<span class="opacity-60 text-xs font-normal">(You)</span>
											{/if}
										</span>
									</div>
									<div class="flex items-center gap-1.5">
										{#if isWinner}
											<span class="badge badge-primary badge-sm font-bold tracking-wider uppercase">
												Winner
											</span>
										{:else}
											<span class="font-mono text-sm font-bold text-ink/70">
												{pData?.hand?.length ?? 0}
												{pData?.hand?.length === 1 ? 'Card' : 'Cards'}
											</span>
										{/if}
									</div>
								</div>
							{/if}
						{/each}
					</div>

					<div class="flex gap-4 w-full justify-center">
						<RematchButton {session} />
						<BackToLobbyButton {session} />
					</div>
				</div>
			</div>
		{:else}
			<!-- Dimmed game screen elements when waiting -->
			<div
				class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none {session.state ===
				'waiting'
					? 'opacity-25'
					: ''}"
			>
				<!-- Draw Pile Component -->
				<button
					onclick={(e) => {
						e.stopPropagation();
						handleDrawPileClick();
					}}
					class="group absolute bottom-52 z-1000 flex md:translate-x-44 cursor-pointer flex-col items-center gap-2 border-0 bg-transparent transition-all duration-100 outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 max-md:right-4 pointer-events-auto"
					disabled={!isPlayerTurn ||
						session.data.drawPileCount === 0 ||
						session.state === 'waiting'}
					title="Draw a card"
				>
					<div
						class="relative h-[80px] w-[54px] transition-transform duration-200 group-hover:-translate-y-1 {shouldHighlightDrawPile
							? 'draw-pile-highlight'
							: ''}"
					>
						<!-- Stack effect cards underneath -->
						<div
							class="absolute inset-0 translate-x-[3px] translate-y-[4px] rounded-[6px] border-2 border-white bg-[#171321] shadow-lg"
						></div>
						<div
							class="absolute inset-0 translate-x-[1.5px] translate-y-[2px] rounded-[6px] border-2 border-white bg-[#171321] shadow-md"
						></div>
						<!-- Top Card -->
						<div class="relative z-10">
							<UnoCard
								faceDown={true}
								size="xs"
								thickBorder={true}
								playable={false}
								shadowDepth="none"
							/>
						</div>
					</div>
					<!-- Label -->
					<span class="mt-3 font-mono text-[9px] font-[700] tracking-wider text-ink/50 uppercase">
						{#if session.data.accumulatedDrawCount > 0}
							Draw +{session.data.accumulatedDrawCount} ({session.data.drawPileCount})
						{:else}
							Draw ({session.data.drawPileCount})
						{/if}
					</span>
				</button>

				<!-- Discard Pile Component -->
				<button
					onclick={(e) => {
						e.stopPropagation();
						handleDiscardPileClick();
					}}
					class="group absolute max-md:bottom-108 md:bottom-1/2 left-1/2 z-40 -translate-x-1/2 flex cursor-pointer flex-col items-center gap-2 border-0 bg-transparent transition-all duration-100 outline-none active:scale-95 pointer-events-auto"
					disabled={session.state === 'waiting'}
					title={isMobile && selectedCardIndex !== null ? 'Discard selected card' : 'Discard pile'}
				>
					<div class="relative h-[150px] w-[108px]">
						{#each session.data.discardPile.slice(-4) as item (item.id)}
							<div
								class="absolute inset-0 discard-card-anim-{getAnimationDirection(item.playedBy)}"
								style="
									--rot: {item.rotate}deg;
									--tx: {item.x}px;
									--ty: {item.y}px;
									z-index: {item.zIndex};
								"
							>
								<UnoCard
									color={item.color}
									value={item.value}
									size="md"
									playable={false}
									shadowDepth="soft"
								/>
							</div>
						{/each}
					</div>
				</button>

				<!-- Live Game Message Overlay -->
				{#if session.state === 'ongoing'}
					<div
						class="absolute left-1/2 -translate-x-1/2 bottom-72 md:bottom-120 text-center px-4 max-w-sm pointer-events-auto"
					>
						<p class="text-sm font-semibold tracking-wide text-ink/70">
							{session.data.message}
						</p>
						{#if isPlayerTurn}
							<div
								class="badge badge-success badge-sm mt-2 font-bold uppercase tracking-wider animate-bounce"
							>
								Your Turn!
							</div>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Player's custom fan hand and identity card at the bottom -->
			{#if isPlayer}
				<div
					class="absolute bottom-1 md:bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 flex flex-col items-center gap-1 md:gap-4 select-none {session.state ===
					'waiting'
						? 'opacity-25 pointer-events-none'
						: ''}"
					onclick={(e) => e.stopPropagation()}
				>
					<UnoHand
						cards={hand}
						cardSize="sm"
						playable={isPlayerTurn && session.state === 'ongoing'}
						shadowDepth="retro"
						{selectedCardIndex}
						{isCardPlayable}
						onclickCard={handleCardClick}
					/>

					<!-- User Identity Card -->
					<div class="relative h-[120px] flex flex-col items-center justify-center p-3 py-4">
						<!-- <div
							class="mb-2 flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-inner bg-black/10"
							style="background-color: {getUserBackground($user.color)};"
						>
							{$user.emoji}
						</div>
						<span
							class="line-clamp-1 text-center font-sans text-xs font-semibold tracking-wider"
							style="color: {getUserForeground($user.color)};"
						>
							{$user.name}
						</span> -->
						<!-- <span
							class="mt-1 font-mono text-[10px] font-bold tracking-wider text-white/40 uppercase"
						>
							{hand.length} Cards
						</span> -->
					</div>
				</div>
			{/if}

			{#if session.state === 'waiting'}
				<div
					class="flex flex-col items-center justify-center gap-1 z-50 pointer-events-none select-none"
				>
					<div class="text-2xl font-bold text-ink">
						Waiting for players...
					</div>
					<div class="text-sm font-mono tracking-widest text-ink/60">
						({session.players.length}/{session.settings['players-count']})
					</div>
				</div>
			{/if}
		{/if}
	</PlayersLayout>

	<!-- Color Selector Overlay -->
	{#if isPlayerTurn && showColorSelector}
		<div
			class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 transition-opacity duration-300"
		>
			<div
				class="flex flex-col items-center gap-4 p-4 rounded-xl bg-card border border-hairline shadow-2xl max-w-[280px] w-full mx-4 text-center animate-scaleUp"
			>
				<div class="text-lg text-ink font-bold">Pick a color</div>
				<div class="grid grid-cols-2 gap-3 w-full">
					<button
						onclick={() => selectColor('red')}
						class="flex items-center justify-center h-12 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-black/25"
						style="background-color: #FF5D8F;"
						aria-label="Red"
					>
					</button>
					<button
						onclick={() => selectColor('blue')}
						class="flex items-center justify-center h-12 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-black/25"
						style="background-color: #7C5CFC;"
						aria-label="Blue"
					></button>
					<button
						onclick={() => selectColor('yellow')}
						class="flex items-center justify-center h-12 rounded-lg font-bold text-black transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-black/25"
						style="background-color: #F6C445;"
						aria-label="Yellow"
					></button>
					<button
						onclick={() => selectColor('green')}
						class="flex items-center justify-center h-12 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-black/25"
						style="background-color: #57D08C;"
						aria-label="Green"
					></button>
				</div>

				<button
					onclick={() => {
						showColorSelector = false;
						pendingDiscardIdx = null;
					}}
					class="btn btn-ghost btn-xs text-muted hover:text-ink"
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.discard-card-anim-top {
		transform: translate(var(--tx), var(--ty)) rotate(var(--rot));
		animation: drop-down-top 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards;
		transform-origin: center;
	}
	.discard-card-anim-left {
		transform: translate(var(--tx), var(--ty)) rotate(var(--rot));
		animation: fly-in-left 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards;
		transform-origin: center;
	}
	.discard-card-anim-right {
		transform: translate(var(--tx), var(--ty)) rotate(var(--rot));
		animation: fly-in-right 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards;
		transform-origin: center;
	}
	.discard-card-anim-bottom {
		transform: translate(var(--tx), var(--ty)) rotate(var(--rot));
		animation: fly-in-bottom 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards;
		transform-origin: center;
	}

	@keyframes drop-down-top {
		0% {
			opacity: 0;
			transform: translate(var(--tx), calc(var(--ty) - 200px)) rotate(calc(var(--rot) - 10deg))
				scale(1.15);
		}
		75% {
			opacity: 1;
			transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.97);
		}
		90% {
			transform: translate(var(--tx), calc(var(--ty) - 3px)) rotate(var(--rot)) scale(1.01);
		}
		100% {
			opacity: 1;
			transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1);
		}
	}

	@keyframes fly-in-left {
		0% {
			opacity: 0;
			transform: translate(calc(var(--tx) - 250px), var(--ty)) rotate(calc(var(--rot) - 15deg))
				scale(1.15);
		}
		75% {
			opacity: 1;
			transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.97);
		}
		90% {
			transform: translate(calc(var(--tx) + 3px), var(--ty)) rotate(var(--rot)) scale(1.01);
		}
		100% {
			opacity: 1;
			transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1);
		}
	}

	@keyframes fly-in-right {
		0% {
			opacity: 0;
			transform: translate(calc(var(--tx) + 250px), var(--ty)) rotate(calc(var(--rot) + 15deg))
				scale(1.15);
		}
		75% {
			opacity: 1;
			transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.97);
		}
		90% {
			transform: translate(calc(var(--tx) - 3px), var(--ty)) rotate(var(--rot)) scale(1.01);
		}
		100% {
			opacity: 1;
			transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1);
		}
	}

	@keyframes fly-in-bottom {
		0% {
			opacity: 0;
			transform: translate(var(--tx), calc(var(--ty) + 200px)) rotate(calc(var(--rot) + 10deg))
				scale(1.15);
		}
		75% {
			opacity: 1;
			transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(0.97);
		}
		90% {
			transform: translate(var(--tx), calc(var(--ty) + 3px)) rotate(var(--rot)) scale(1.01);
		}
		100% {
			opacity: 1;
			transform: translate(var(--tx), var(--ty)) rotate(var(--rot)) scale(1);
		}
	}

	@keyframes scaleUp {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	.animate-scaleUp {
		animation: scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}
	.draw-pile-highlight {
		animation: draw-pile-pulse 2s infinite ease-in-out;
	}
	@keyframes draw-pile-pulse {
		0%,
		100% {
			transform: translateY(0);
			filter: drop-shadow(0 0 2px rgba(124, 92, 252, 0.4));
		}
		50% {
			transform: translateY(-12px);
			filter: drop-shadow(0 0 10px rgba(124, 92, 252, 0.8));
		}
	}
</style>
