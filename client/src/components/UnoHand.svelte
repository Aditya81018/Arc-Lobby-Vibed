<script lang="ts">
	import UnoCard from './UnoCard.svelte';

	interface Card {
		color: string;
		value: string;
	}

	interface Props {
		cards: Card[];
		cardSize?: 'sm' | 'md' | 'lg' | 'xl' | string;
		playable?: boolean;
		shadowDepth?: 'none' | 'soft' | 'retro';
		angleStep?: number;
		translateStep?: number;
		archDepth?: number;
		maxAngleSpan?: number;
		onclickCard?: (card: Card, index: number) => void;
		selectedCardIndex?: number | null;
		isCardPlayable?: (card: Card, index: number) => boolean;
	}

	let {
		cards = [],
		cardSize = 'sm',
		playable = true,
		shadowDepth = 'retro',
		angleStep = 10,
		translateStep = 26,
		archDepth = 0,
		maxAngleSpan = 90,
		onclickCard,
		selectedCardIndex = null,
		isCardPlayable
	}: Props = $props();

	// Automatically derive height and max-width based on card size to prevent clipping
	let containerHeight = $derived.by(() => {
		if (cardSize === 'sm') return '160px';
		if (cardSize === 'md') return '230px';
		if (cardSize === 'lg') return '300px';
		if (cardSize === 'xl') return '370px';
		return '160px';
	});

	let containerMaxWidth = $derived.by(() => {
		if (cardSize === 'sm') return '380px';
		if (cardSize === 'md') return '520px';
		if (cardSize === 'lg') return '680px';
		if (cardSize === 'xl') return '820px';
		return '380px';
	});

	// Derived proportional step sizes to prevent huge hands from extending too wide or flipping upside down
	let derivedAngleStep = $derived.by(() => {
		const count = cards.length;
		if (count <= 1) return 0;

		const defaultSpan = (count - 1) * angleStep;

		if (defaultSpan > maxAngleSpan) {
			return maxAngleSpan / (count - 1);
		}
		return angleStep;
	});

	let derivedTranslateStep = $derived.by(() => {
		const count = cards.length;
		if (count <= 1) return 0;

		// Calculate maximum allowed horizontal translation range based on card size
		let maxTranslateSpan = 240;
		if (cardSize === 'md') maxTranslateSpan = 360;
		if (cardSize === 'lg') maxTranslateSpan = 480;
		if (cardSize === 'xl') maxTranslateSpan = 600;

		const defaultSpan = (count - 1) * translateStep;
		if (defaultSpan > maxTranslateSpan) {
			return maxTranslateSpan / (count - 1);
		}
		return translateStep;
	});
</script>

<div
	class="relative flex w-full items-end justify-center overflow-visible select-none"
	style="height: {containerHeight}; max-width: {containerMaxWidth};"
>
	{#each cards as card, idx (card.color + '-' + card.value + '-' + idx)}
		{@const count = cards.length}
		{@const mid = (count - 1) / 2}

		<!-- Symmetrical fanning angles -->
		{@const angle = (idx - mid) * derivedAngleStep}

		<!-- Horizontal translation to distribute cards -->
		{@const translateX = (idx - mid) * derivedTranslateStep}

		<!-- Vertical translation to create a downward arch on both sides -->
		{@const translateY = Math.abs(idx - mid) * archDepth}

		<div
			class="absolute bottom-0 origin-bottom transition-all duration-300"
			class:playable-wrapper={playable}
			style="
				transform: rotate({angle}deg) translate({translateX}px, {translateY}px);
				z-index: {selectedCardIndex === idx ? 999 : 10 + idx};
			"
		>
			<UnoCard
				color={card.color}
				value={card.value}
				size={cardSize}
				playable={playable && (isCardPlayable ? isCardPlayable(card, idx) : true)}
				{shadowDepth}
				selected={selectedCardIndex === idx}
				onclick={() => onclickCard?.(card, idx)}
			/>
		</div>
	{/each}
</div>

<style>
	.playable-wrapper {
		/* Establish a transition context for clean hover effects */
		transition:
			transform 0.3s ease,
			z-index 0s;
	}
	.playable-wrapper:hover {
		z-index: 1000 !important;
	}
</style>
