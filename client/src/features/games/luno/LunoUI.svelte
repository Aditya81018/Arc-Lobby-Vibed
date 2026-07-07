<script lang="ts">
	import { type UserData, userData as user } from '../../user/store';
	import { socket } from '$lib/socket';
	import type { LunoSession } from './types';
	import PlayersLayout from './PlayersLayout.svelte';
	import RematchButton from '../../game-sessions/RematchButton.svelte';
	import LeaveGameSessionButton from '../../game-sessions/LeaveGameSessionButton.svelte';
	import BackToLobbyButton from '../../game-sessions/BackToLobbyButton.svelte';
	import UnoHand from '../../../components/UnoHand.svelte';
	import UnoCard from '../../../components/UnoCard.svelte';
	import { onMount } from 'svelte';

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

	let selectedCardIndex = $state<number | null>(null);
	let isMobile = $state(false);
	let activeAnimation = $state<'top' | 'left' | 'right' | 'bottom'>('bottom');

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
		const topCard = session.data.discardPile[session.data.discardPile.length - 1];
		if (!topCard) return true;
		return card.color === 'wild' || card.color === topCard.color || card.value === topCard.value;
	}

	function handleCardClick(card: { color: string; value: string }, idx: number) {
		if (!isCardPlayable(card)) return;

		if (!isMobile) {
			socket.emit('luno-discard-card', idx);
			selectedCardIndex = null;
		} else {
			if (selectedCardIndex === idx) {
				socket.emit('luno-discard-card', idx);
				selectedCardIndex = null;
			} else {
				selectedCardIndex = idx;
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
				socket.emit('luno-discard-card', selectedCardIndex);
				selectedCardIndex = null;
			}
		}
	}

	function handleBackgroundClick() {
		selectedCardIndex = null;
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="relative flex h-full w-full flex-col bg-[#0A0D18] p-4 overflow-hidden"
	onclick={handleBackgroundClick}
>
	<LeaveGameSessionButton />

	<PlayersLayout {players} playersData={session.data.playersData} {session}>
		{#if session.state === 'finished'}
			{@const winner = players.find((player) => player?.id === session.winner)}
			<div class="flex flex-col items-center gap-4 z-50">
				<div class="text-4xl font-black text-white">{winner?.name ?? 'Unknown'} Won!</div>
				<div class="flex gap-2">
					<RematchButton {session} />
					<BackToLobbyButton {session} />
				</div>
			</div>
		{:else if session.state === 'waiting'}
			<div class="flex flex-col items-center justify-center gap-4 opacity-50 z-50">
				<div class="text-2xl font-bold text-white">Waiting for players to join...</div>
				<div class="text-sm font-mono tracking-widest text-white/60">
					({session.players.length}/{session.settings['players-count']})
				</div>
			</div>
		{:else}
			<!-- Active game session elements -->
			<div
				class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
			>
				<!-- Draw Pile Component -->
				<button
					onclick={(e) => {
						e.stopPropagation();
						handleDrawPileClick();
					}}
					class="group absolute bottom-52 z-50 flex md:translate-x-44 cursor-pointer flex-col items-center gap-2 border-0 bg-transparent transition-all duration-100 outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 max-md:right-4 pointer-events-auto"
					disabled={!isPlayerTurn || session.data.drawPileCount === 0}
					title="Draw a card"
				>
					<div
						class="relative h-[80px] w-[54px] transition-transform duration-200 group-hover:-translate-y-1"
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
					<span class="mt-1 font-mono text-[9px] font-[700] tracking-wider text-white/50 uppercase">
						Draw ({session.data.drawPileCount})
					</span>
				</button>

				<!-- Discard Pile Component -->
				<button
					onclick={(e) => {
						e.stopPropagation();
						handleDiscardPileClick();
					}}
					class="group absolute top-[44%] left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 flex cursor-pointer flex-col items-center gap-2 border-0 bg-transparent transition-all duration-100 outline-none active:scale-95 pointer-events-auto"
					title={isMobile && selectedCardIndex !== null ? 'Discard selected card' : 'Discard pile'}
				>
					<div class="relative h-[150px] w-[108px]">
						{#each session.data.discardPile.slice(-4) as item (item.id)}
							<div
								class="absolute inset-0 discard-card-anim-{activeAnimation}"
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
					<!-- Label -->
					<span
						class="mt-2 font-mono text-[10px] font-[700] tracking-wider text-white/50 uppercase"
					>
						Discard
					</span>
				</button>

				<!-- Live Game Message Overlay -->
				<div class="absolute top-[68%] text-center px-4 max-w-sm pointer-events-auto">
					<p class="text-sm font-semibold tracking-wide text-white/70">
						{session.data.message}
					</p>
					{#if isPlayerTurn}
						<div
							class="badge badge-success badge-sm mt-1.5 font-bold uppercase tracking-wider animate-bounce"
						>
							Your Turn!
						</div>
					{/if}
				</div>
			</div>

			<!-- Player's custom fan hand at the bottom -->
			{#if isPlayer}
				<div
					class="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 flex flex-col items-center select-none"
					onclick={(e) => e.stopPropagation()}
				>
					<UnoHand
						cards={hand}
						cardSize="sm"
						playable={isPlayerTurn}
						shadowDepth="retro"
						{selectedCardIndex}
						{isCardPlayable}
						onclickCard={handleCardClick}
					/>
				</div>
			{/if}
		{/if}
	</PlayersLayout>
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
</style>
