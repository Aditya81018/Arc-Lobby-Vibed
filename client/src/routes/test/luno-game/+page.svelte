<script lang="ts">
	import { onMount } from 'svelte';
	import UnoHand from '../../../components/UnoHand.svelte';
	import UnoCard from '../../../components/UnoCard.svelte';
	import { userData, getUserForeground, getUserBackground } from '../../../features/user/store';

	interface Card {
		color: string;
		value: string;
	}

	// The hand state (made reactive in Svelte 5)
	let hand = $state<Card[]>([
		{ color: 'red', value: '3' },
		{ color: 'blue', value: '8' },
		{ color: 'yellow', value: 'skip' },
		{ color: 'green', value: 'reverse' },
		{ color: 'wild', value: 'wild-draw-four' },
		{ color: 'blue', value: 'draw-two' },
		{ color: 'red', value: '9' }
	]);

	let drawPileCount = $state(32);
	interface DiscardedCard {
		color: string;
		value: string;
		id: string;
		rotate: number;
		x: number;
		y: number;
		zIndex: number;
		playedBy?: string;
	}

	let discardPile = $state<DiscardedCard[]>([
		{
			color: 'red',
			value: '7',
			id: 'initial',
			rotate: 5,
			x: 0,
			y: 0,
			zIndex: 10
		}
	]);

	let selectedCardIndex = $state<number | null>(null);
	let isMobile = $state(false);
	let activeAnimation = $state<'top' | 'left' | 'right' | 'bottom'>('bottom');

	let showColorSelector = $state(false);
	let pendingDiscardIdx = $state<number | null>(null);

	function selectColor(color: 'red' | 'blue' | 'yellow' | 'green') {
		if (pendingDiscardIdx !== null) {
			discardCard(pendingDiscardIdx, color);
		}
		showColorSelector = false;
		pendingDiscardIdx = null;
	}

	// Detect mobile screen / coarse pointer interaction and retrieve settings
	onMount(() => {
		const mediaQuery = window.matchMedia('(pointer: coarse)');
		isMobile = mediaQuery.matches;

		const handler = (e: MediaQueryListEvent) => {
			isMobile = e.matches;
		};
		mediaQuery.addEventListener('change', handler);

		// Read animation config choice from localStorage
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

	function selectAnimation(type: 'top' | 'left' | 'right' | 'bottom') {
		activeAnimation = type;
		localStorage.setItem('luno_discard_anim', type);
	}

	function getRandomCard(): Card {
		// Total cards in UNO deck: 112
		const randomIndex = Math.floor(Math.random() * 112);

		if (randomIndex < 104) {
			const colors = ["red", "blue", "yellow", "green"];
			const colorIndex = Math.floor(randomIndex / 26);
			const cardInColorIndex = randomIndex % 26;

			const values = [
				"0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
				"skip", "reverse", "draw-two"
			];
			const valueIndex = Math.floor(cardInColorIndex / 2);

			return {
				color: colors[colorIndex],
				value: values[valueIndex],
			};
		} else {
			const wildIndex = randomIndex - 104;
			return {
				color: "wild",
				value: wildIndex < 4 ? "wild" : "wild-draw-four",
			};
		}
	}

	function drawRandomCard() {
		hand = [...hand, getRandomCard()];
	}

	function discardCard(idx: number, chosenColor?: string) {
		const card = hand[idx];
		if (!card) return;

		// Generate dynamic, persistent styles for the card when it is discarded
		const rotate = Math.floor(Math.random() * 26) - 13; // -13deg to 13deg
		const x = Math.floor(Math.random() * 21) - 10; // -10px to 10px
		const y = Math.floor(Math.random() * 17) - 8; // -8px to 8px
		const zIndex = 10 + discardPile.length;

		let finalColor = card.color;
		if (card.color === 'wild') {
			if (chosenColor && ['red', 'blue', 'yellow', 'green'].includes(chosenColor)) {
				finalColor = chosenColor;
			} else {
				finalColor = ['red', 'blue', 'yellow', 'green'][Math.floor(Math.random() * 4)];
			}
		}

		discardPile = [
			...discardPile,
			{
				color: finalColor,
				value: card.value,
				id: `${card.color}-${card.value}-${Date.now()}-${Math.random()}`,
				rotate,
				x,
				y,
				zIndex,
				playedBy: $userData.id
			}
		];
		hand = hand.filter((_, i) => i !== idx);
		selectedCardIndex = null;
	}

	function handleCardClick(card: Card, idx: number) {
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
				discardCard(idx);
			} else {
				if (selectedCardIndex === idx) {
					discardCard(idx);
				} else {
					selectedCardIndex = idx;
				}
			}
		}
	}

	function handleDiscardPileClick() {
		if (isMobile && selectedCardIndex !== null) {
			const card = hand[selectedCardIndex];
			if (card) {
				if (card.color === 'wild') {
					pendingDiscardIdx = selectedCardIndex;
					showColorSelector = true;
					selectedCardIndex = null;
				} else {
					discardCard(selectedCardIndex);
				}
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
	class="relative flex h-screen w-full items-end justify-center overflow-hidden bg-[#0A0D18] p-2"
	onclick={handleBackgroundClick}
>
	<!-- Draw Pile Component (original absolute position at bottom right) -->
	<button
		onclick={(e) => {
			e.stopPropagation();
			drawRandomCard();
		}}
		class="group absolute bottom-68 z-50 flex md:translate-x-40 cursor-pointer flex-col items-center gap-2 border-0 bg-transparent transition-all duration-100 outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 max-md:right-4"
		title="Draw a random card"
	>
		<div
			class="relative h-[90px] w-[60px] transition-transform duration-200 group-hover:-translate-y-1"
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
				<UnoCard faceDown={true} size="xs" thickBorder={true} playable={false} shadowDepth="none" />
			</div>
		</div>
		<!-- Label -->
		<span class="mt-1 font-mono text-[10px] font-[700] tracking-wider text-white/50 uppercase">
			Draw Pile (∞)
		</span>
	</button>

	<!-- Discard Pile Component (centered and md size) -->
	<div
		class="absolute top-[38%] left-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
		onclick={(e) => e.stopPropagation()}
	>
		<button
			onclick={(e) => {
				e.stopPropagation();
				handleDiscardPileClick();
			}}
			class="group flex cursor-pointer flex-col items-center gap-2 border-0 bg-transparent transition-all duration-100 outline-none active:scale-95"
			title={isMobile && selectedCardIndex !== null ? 'Discard selected card' : 'Discard pile'}
		>
			<div class="relative h-[180px] w-[128px]">
				{#each discardPile.slice(-4) as item (item.id)}
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
			<span class="mt-2 font-mono text-xs font-[700] tracking-wider text-white/50 uppercase">
				Discard Pile
			</span>
		</button>
	</div>

	<div class="mb-4 flex w-full max-w-lg flex-col items-center gap-4 select-none">
		<!-- Card Fan Container -->
		<div onclick={(e) => e.stopPropagation()}>
			<UnoHand
				cards={hand}
				cardSize="sm"
				playable={true}
				shadowDepth="retro"
				{selectedCardIndex}
				onclickCard={handleCardClick}
			/>
		</div>

		<!-- User Identity Card -->
		<div
			class="relative z-50 flex min-h-[100px] w-[100px] flex-col items-center justify-center rounded-sm p-3 py-4 shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<div
				class="mb-2 flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-inner"
				style="background-color: {getUserBackground($userData.color)};"
			>
				{$userData.emoji}
			</div>
			<span
				class="line-clamp-1 text-center font-sans text-xs font-semibold tracking-wider"
				style="color: {getUserForeground($userData.color)};"
			>
				{$userData.name}
			</span>
			<span class="mt-1 font-mono text-[10px] font-bold tracking-wider text-white/40 uppercase">
				{hand.length} Cards
			</span>
		</div>
	</div>

	<!-- Color Selector Overlay -->
	{#if showColorSelector}
		<div class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 transition-opacity duration-300">
			<div class="flex flex-col items-center gap-4 p-4 rounded-xl bg-[#12162A] border border-[#232840] shadow-2xl max-w-[280px] w-full mx-4 text-center animate-scaleUp">
				<div class="grid grid-cols-2 gap-3 w-full">
					<button
						onclick={() => selectColor('red')}
						class="flex items-center justify-center h-12 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-black/25"
						style="background-color: #FF5D8F;"
					>
						Red
					</button>
					<button
						onclick={() => selectColor('blue')}
						class="flex items-center justify-center h-12 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-black/25"
						style="background-color: #7C5CFC;"
					>
						Blue
					</button>
					<button
						onclick={() => selectColor('yellow')}
						class="flex items-center justify-center h-12 rounded-lg font-bold text-black transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-black/25"
						style="background-color: #F6C445;"
					>
						Yellow
					</button>
					<button
						onclick={() => selectColor('green')}
						class="flex items-center justify-center h-12 rounded-lg font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-black/25"
						style="background-color: #57D08C;"
					>
						Green
					</button>
				</div>

				<button
					onclick={() => {
						showColorSelector = false;
						pendingDiscardIdx = null;
					}}
					class="btn btn-ghost btn-xs text-gray-500 hover:text-white"
				>
					Cancel
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Keep page styling simple and clean */
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
</style>
