<script lang="ts">
	import UnoCard from '../../components/UnoCard.svelte';
	import ThemeToggle from '../../components/ThemeToggle.svelte';
	import {
		ArrowLeft,
		Settings,
		Layers,
		Palette,
		Sparkles,
		Sliders,
		Play,
		Shuffle
	} from '@lucide/svelte';
	import { themeState } from '$lib/theme.svelte';
	import { resolve } from '$app/paths';

	// Sandbox State Variables
	let faceDown = $state(false);
	let themePreset = $state<'arc' | 'classic'>('arc');
	let colorPreset = $state<'red' | 'green' | 'blue' | 'yellow' | 'wild' | 'custom'>('red');
	let customColorHex = $state('#a855f7'); // Custom color (purple/violet)
	let valuePreset = $state<
		'number' | 'skip' | 'reverse' | 'draw-two' | 'wild' | 'wild-draw-four' | 'custom'
	>('number');
	let customNumberValue = $state(7);
	let customTextValue = $state('ARC');
	let size = $state<'sm' | 'md' | 'lg' | 'xl'>('md');
	let playable = $state(true);
	let selected = $state(false);
	let disabled = $state(false);
	let thickBorder = $state(true);
	let shadowDepth = $state<'none' | 'soft' | 'retro'>('retro');

	// Computed dynamic values for the Sandbox Card
	let cardColor = $derived.by(() => {
		if (colorPreset === 'custom') return customColorHex;
		return colorPreset;
	});

	let cardValue = $derived.by(() => {
		if (valuePreset === 'number') return String(customNumberValue);
		if (valuePreset === 'custom') return customTextValue;
		return valuePreset;
	});

	// Presets definitions
	const standardValues = [
		'0',
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'skip',
		'reverse',
		'draw-two'
	];
	const wildValues = ['wild', 'wild-draw-four'];

	// Discard pile state for layout demo
	let discardPile = $state([
		{ color: 'yellow', value: '3', rotation: -12, offset: 4 },
		{ color: 'blue', value: 'reverse', rotation: 8, offset: -2 },
		{ color: 'green', value: 'draw-two', rotation: -4, offset: 0 },
		{ color: 'red', value: '7', rotation: 15, offset: 5 }
	]);

	function shuffleDiscardPile() {
		discardPile = discardPile.map((card) => ({
			...card,
			rotation: Math.floor(Math.random() * 30) - 15,
			offset: Math.floor(Math.random() * 10) - 5
		}));
	}

	// Interactive hand tracking for fan demo
	let activeHandIndex = $state<number | null>(null);
	let playerHand = $state([
		{ color: 'red', value: '3', selected: false },
		{ color: 'blue', value: '8', selected: false },
		{ color: 'yellow', value: 'skip', selected: false },
		{ color: 'green', value: 'reverse', selected: false },
		{ color: 'wild', value: 'wild-draw-four', selected: false },
		{ color: 'blue', value: 'draw-two', selected: false },
		{ color: 'red', value: '9', selected: false }
	]);

	function toggleSelectCard(index: number) {
		playerHand[index].selected = !playerHand[index].selected;
	}
</script>

<div
	class="min-h-screen w-full bg-canvas text-ink transition-colors duration-200 px-4 py-8 md:p-12"
>
	<!-- Page Header -->
	<header
		class="mx-auto max-w-[1200px] flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-hairline pb-8 mb-8"
	>
		<div class="flex items-center gap-4">
			<a
				href={resolve('/')}
				class="btn btn-circle btn-ghost border border-hairline bg-card hover:bg-black/5 dark:hover:bg-white/5 shadow-sm active:scale-95 transition-all"
				aria-label="Back to home"
			>
				<ArrowLeft size={20} />
			</a>
			<div>
				<h1 class="font-display text-4xl leading-none font-[800] tracking-[-0.5px]">
					Uno Card Sandbox
				</h1>
				<p class="font-sans text-[14px] leading-relaxed text-body mt-1">
					Customizable, animated game asset matching the Arc Lobby design language.
				</p>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<span class="text-xs font-[700] tracking-wider text-muted uppercase">Toggle Mode:</span>
			<ThemeToggle />
		</div>
	</header>

	<main class="mx-auto max-w-[1200px] flex flex-col gap-12">
		<!-- SECTION 1: SANDBOX PLAYGROUND -->
		<section class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
			<!-- Left Column: The Card Table Mat -->
			<div class="lg:col-span-5 flex flex-col gap-3">
				<h2
					class="font-sans text-xs font-[800] tracking-[0.3px] text-body uppercase flex items-center gap-2"
				>
					<Play size={12} class="text-primary" /> Game Card Table
				</h2>
				<!-- Wooden border felt card mat -->
				<div
					class="flex-grow flex flex-col items-center justify-center p-12 min-h-[380px] lg:min-h-[460px] rounded-2xl border-4 border-emerald-950/40 bg-emerald-900 dark:bg-emerald-950/60 shadow-[inset_0_4px_16px_rgba(0,0,0,0.5)] relative overflow-hidden"
				>
					<!-- Table pattern lines -->
					<div class="absolute inset-8 border border-white/5 rounded-xl pointer-events-none"></div>
					<div
						class="absolute inset-0 bg-radial-gradient from-transparent to-black/20 pointer-events-none"
					></div>

					<!-- The Card element -->
					<div class="relative z-10 filter drop-shadow-2xl">
						<UnoCard
							color={cardColor}
							value={cardValue}
							{size}
							{themePreset}
							{faceDown}
							{playable}
							{selected}
							{disabled}
							{thickBorder}
							{shadowDepth}
							onclick={() => alert(`Clicked sandbox card: ${cardColor} ${cardValue}`)}
						/>
					</div>

					<div class="absolute bottom-3 text-center pointer-events-none">
						<span class="text-[10px] font-mono tracking-widest text-emerald-100/40 uppercase">
							{faceDown ? 'CARD BACK' : `${cardColor.toUpperCase()} ${cardValue.toUpperCase()}`}
						</span>
					</div>
				</div>
			</div>

			<!-- Right Column: Control Panel -->
			<div class="lg:col-span-7 flex flex-col gap-3">
				<h2
					class="font-sans text-xs font-[800] tracking-[0.3px] text-body uppercase flex items-center gap-2"
				>
					<Settings size={12} class="text-primary" /> Card Customizer Controls
				</h2>

				<div class="bg-card border border-hairline rounded-xl p-6 shadow-sm flex flex-col gap-6">
					<!-- Segmented Controls Row -->
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<!-- Card Side -->
						<div class="flex flex-col gap-2">
							<span class="text-[11px] font-[700] tracking-wider text-muted uppercase"
								>Card Side</span
							>
							<div class="join w-full">
								<button
									onclick={() => (faceDown = false)}
									class="btn btn-sm join-item flex-1 font-sans {!faceDown
										? 'btn-primary text-white'
										: 'btn-outline bg-card'}"
								>
									Front
								</button>
								<button
									onclick={() => (faceDown = true)}
									class="btn btn-sm join-item flex-1 font-sans {faceDown
										? 'btn-primary text-white'
										: 'btn-outline bg-card'}"
								>
									Back
								</button>
							</div>
						</div>

						<!-- Color Theme Preset -->
						<div class="flex flex-col gap-2">
							<span class="text-[11px] font-[700] tracking-wider text-muted uppercase"
								>Theme Preset</span
							>
							<div class="join w-full">
								<button
									onclick={() => (themePreset = 'arc')}
									class="btn btn-sm join-item flex-1 font-sans {themePreset === 'arc'
										? 'btn-primary text-white'
										: 'btn-outline bg-card'}"
								>
									Arc Lobby
								</button>
								<button
									onclick={() => (themePreset = 'classic')}
									class="btn btn-sm join-item flex-1 font-sans {themePreset === 'classic'
										? 'btn-primary text-white'
										: 'btn-outline bg-card'}"
								>
									Classic
								</button>
							</div>
						</div>

						<!-- Card Size -->
						<div class="flex flex-col gap-2">
							<span class="text-[11px] font-[700] tracking-wider text-muted uppercase"
								>Preset Size</span
							>
							<div class="join w-full">
								{#each ['sm', 'md', 'lg', 'xl'] as s (s)}
									<button
										onclick={() => (size = s as any)}
										class="btn btn-sm join-item flex-1 font-sans font-normal uppercase {size === s
											? 'btn-primary text-white'
											: 'btn-outline bg-card text-xs'}"
									>
										{s}
									</button>
								{/each}
							</div>
						</div>
					</div>

					<!-- Divider -->
					<div class="border-t border-hairline my-1"></div>

					<!-- Color Controls -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div class="flex flex-col gap-2">
							<span class="text-[11px] font-[700] tracking-wider text-muted uppercase"
								>Card Color Option</span
							>
							<select
								bind:value={colorPreset}
								class="select select-sm select-bordered w-full font-sans bg-card"
							>
								<option value="red">Red / Pink</option>
								<option value="green">Green</option>
								<option value="blue">Blue / Purple</option>
								<option value="yellow">Yellow</option>
								<option value="wild">Wild (Black)</option>
								<option value="custom">Custom Color Hex</option>
							</select>
						</div>

						{#if colorPreset === 'custom'}
							<div class="flex flex-col gap-2">
								<span class="text-[11px] font-[700] tracking-wider text-muted uppercase"
									>Hex Value</span
								>
								<div class="flex gap-2">
									<input
										type="color"
										bind:value={customColorHex}
										class="h-8 w-12 cursor-pointer rounded border border-hairline bg-card p-0.5"
									/>
									<input
										type="text"
										bind:value={customColorHex}
										class="input input-sm input-bordered flex-grow font-mono bg-card"
										placeholder="#a855f7"
									/>
								</div>
							</div>
						{/if}
					</div>

					<!-- Value Controls -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div class="flex flex-col gap-2">
							<span class="text-[11px] font-[700] tracking-wider text-muted uppercase"
								>Value Type</span
							>
							<select
								bind:value={valuePreset}
								class="select select-sm select-bordered w-full font-sans bg-card"
							>
								<option value="number">Numeric (0 - 9)</option>
								<option value="skip">Action: Skip</option>
								<option value="reverse">Action: Reverse</option>
								<option value="draw-two">Action: Draw Two (+2)</option>
								<option value="wild">Wild Card</option>
								<option value="wild-draw-four">Wild Draw Four (+4)</option>
								<option value="custom">Custom Text / Value</option>
							</select>
						</div>

						{#if valuePreset === 'number'}
							<div class="flex flex-col gap-2 md:col-span-2">
								<span class="text-[11px] font-[700] tracking-wider text-muted uppercase"
									>Number Value ({customNumberValue})</span
								>
								<input
									type="range"
									min="0"
									max="9"
									bind:value={customNumberValue}
									class="range range-xs range-primary mt-2"
								/>
							</div>
						{:else if valuePreset === 'custom'}
							<div class="flex flex-col gap-2 md:col-span-2">
								<span class="text-[11px] font-[700] tracking-wider text-muted uppercase"
									>Custom Value text</span
								>
								<input
									type="text"
									bind:value={customTextValue}
									maxlength="8"
									class="input input-sm input-bordered w-full font-sans bg-card"
									placeholder="UNO"
								/>
							</div>
						{/if}
					</div>

					<!-- Divider -->
					<div class="border-t border-hairline my-1"></div>

					<!-- Interactive States Toggles -->
					<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
						<label
							class="label cursor-pointer flex items-center justify-start gap-3 bg-canvas/30 px-3 py-2 rounded-lg border border-hairline"
						>
							<input
								type="checkbox"
								bind:checked={playable}
								class="checkbox checkbox-sm checkbox-primary bg-card"
							/>
							<span class="label-text font-sans text-xs font-[700] text-ink">Playable</span>
						</label>

						<label
							class="label cursor-pointer flex items-center justify-start gap-3 bg-canvas/30 px-3 py-2 rounded-lg border border-hairline"
						>
							<input
								type="checkbox"
								bind:checked={selected}
								class="checkbox checkbox-sm checkbox-primary bg-card"
							/>
							<span class="label-text font-sans text-xs font-[700] text-ink">Selected</span>
						</label>

						<label
							class="label cursor-pointer flex items-center justify-start gap-3 bg-canvas/30 px-3 py-2 rounded-lg border border-hairline"
						>
							<input
								type="checkbox"
								bind:checked={disabled}
								class="checkbox checkbox-sm checkbox-primary bg-card"
							/>
							<span class="label-text font-sans text-xs font-[700] text-ink">Disabled</span>
						</label>

						<label
							class="label cursor-pointer flex items-center justify-start gap-3 bg-canvas/30 px-3 py-2 rounded-lg border border-hairline"
						>
							<input
								type="checkbox"
								bind:checked={thickBorder}
								class="checkbox checkbox-sm checkbox-primary bg-card"
							/>
							<span class="label-text font-sans text-xs font-[700] text-ink">Thick Border</span>
						</label>
					</div>

					<!-- Shadow depth -->
					<div class="flex flex-col gap-2">
						<span class="text-[11px] font-[700] tracking-wider text-muted uppercase"
							>Shadow Type</span
						>
						<div class="join w-full">
							{#each ['none', 'soft', 'retro'] as shadow (shadow)}
								<button
									onclick={() => (shadowDepth = shadow as any)}
									class="btn btn-sm join-item flex-1 font-sans capitalize {shadowDepth === shadow
										? 'btn-primary text-white'
										: 'btn-outline bg-card'}"
								>
									{shadow} Depth
								</button>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- SECTION 2: PALETTE COMPARISONS -->
		<section class="flex flex-col gap-4">
			<div class="border-b border-hairline pb-2">
				<h2 class="font-sans text-lg font-[800] text-ink flex items-center gap-2">
					<Palette size={18} class="text-primary" /> Theme Color Palettes Comparison
				</h2>
				<p class="font-sans text-xs text-body mt-0.5">
					Compare how the cards adapt from Arc Lobby's custom brand tones to the retro Classic Uno
					deck tones.
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
				<!-- Arc Lobby Palette -->
				<div class="bg-card border border-hairline rounded-xl p-6 flex flex-col gap-4">
					<div class="flex items-center justify-between">
						<span class="font-sans font-[800] text-[15px] text-ink">Arc Lobby theme preset</span>
						<span class="badge badge-primary font-mono text-[10px] font-bold"
							>themePreset="arc"</span
						>
					</div>
					<div
						class="flex flex-wrap gap-4 justify-center items-center py-4 bg-canvas/20 rounded-lg"
					>
						<UnoCard themePreset="arc" color="red" value="1" size="sm" />
						<UnoCard themePreset="arc" color="yellow" value="2" size="sm" />
						<UnoCard themePreset="arc" color="green" value="3" size="sm" />
						<UnoCard themePreset="arc" color="blue" value="4" size="sm" />
						<UnoCard themePreset="arc" color="wild" value="wild" size="sm" />
					</div>
				</div>

				<!-- Classic Uno Palette -->
				<div class="bg-card border border-hairline rounded-xl p-6 flex flex-col gap-4">
					<div class="flex items-center justify-between">
						<span class="font-sans font-[800] text-[15px] text-ink">Classic Uno preset</span>
						<span
							class="badge badge-neutral font-mono text-[10px] font-bold bg-base-300 text-ink-light border-0"
							>themePreset="classic"</span
						>
					</div>
					<div
						class="flex flex-wrap gap-4 justify-center items-center py-4 bg-canvas/20 rounded-lg"
					>
						<UnoCard themePreset="classic" color="red" value="1" size="sm" />
						<UnoCard themePreset="classic" color="yellow" value="2" size="sm" />
						<UnoCard themePreset="classic" color="green" value="3" size="sm" />
						<UnoCard themePreset="classic" color="blue" value="4" size="sm" />
						<UnoCard themePreset="classic" color="wild" value="wild" size="sm" />
					</div>
				</div>
			</div>
		</section>

		<!-- SECTION 3: ACTIONS & SPECIAL CARDS -->
		<section class="flex flex-col gap-4">
			<div class="border-b border-hairline pb-2">
				<h2 class="font-sans text-lg font-[800] text-ink flex items-center gap-2">
					<Sparkles size={18} class="text-primary" /> Special Action Cards
				</h2>
				<p class="font-sans text-xs text-body mt-0.5">
					A showcase of Skip, Reverse, Draw Two, Wild, and Wild Draw Four cards with custom vectors.
				</p>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-5 gap-6 justify-items-center">
				<div class="flex flex-col items-center gap-2">
					<UnoCard color="red" value="skip" size="md" />
					<span class="text-xs font-mono font-[700] text-muted">Red Skip</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<UnoCard color="yellow" value="reverse" size="md" />
					<span class="text-xs font-mono font-[700] text-muted">Yellow Reverse</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<UnoCard color="green" value="draw-two" size="md" />
					<span class="text-xs font-mono font-[700] text-muted">Green Draw Two</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<UnoCard color="wild" value="wild" size="md" />
					<span class="text-xs font-mono font-[700] text-muted">Wild Card</span>
				</div>
				<div class="flex flex-col items-center gap-2">
					<UnoCard color="wild" value="wild-draw-four" size="md" />
					<span class="text-xs font-mono font-[700] text-muted">Wild Draw Four</span>
				</div>
			</div>
		</section>

		<!-- SECTION 4: SIZE & INTERACTIVE STATE SHOWCASE -->
		<section class="grid grid-cols-1 md:grid-cols-12 gap-8">
			<!-- Size Presets -->
			<div class="md:col-span-7 flex flex-col gap-4">
				<div class="border-b border-hairline pb-2">
					<h2 class="font-sans text-lg font-[800] text-ink flex items-center gap-2">
						<Sliders size={18} class="text-primary" /> Size Scaling Presets
					</h2>
					<p class="font-sans text-xs text-body mt-0.5">
						Lined up sizes from Small (sm) to Extra Large (xl) with scaling typography and elements.
					</p>
				</div>

				<div
					class="bg-card border border-hairline rounded-xl p-6 flex flex-row flex-wrap items-end justify-center gap-6 bg-canvas/10"
				>
					<div class="flex flex-col items-center gap-2">
						<UnoCard color="blue" value="5" size="sm" />
						<span class="text-[10px] font-bold text-muted">SM (80x112px)</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<UnoCard color="blue" value="5" size="md" />
						<span class="text-[10px] font-bold text-muted">MD (128x176px)</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<UnoCard color="blue" value="5" size="lg" />
						<span class="text-[10px] font-bold text-muted">LG (160x224px)</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<UnoCard color="blue" value="5" size="xl" />
						<span class="text-[10px] font-bold text-muted">XL (208x288px)</span>
					</div>
				</div>
			</div>

			<!-- Status & Custom Colors -->
			<div class="md:col-span-5 flex flex-col gap-4">
				<div class="border-b border-hairline pb-2">
					<h2 class="font-sans text-lg font-[800] text-ink flex items-center gap-2">
						<Sparkles size={18} class="text-primary" /> Status States & Customs
					</h2>
					<p class="font-sans text-xs text-body mt-0.5">
						Cards configured for custom colors, selection states, and disabled cues.
					</p>
				</div>

				<div
					class="bg-card border border-hairline rounded-xl p-6 grid grid-cols-3 gap-4 justify-items-center"
				>
					<div class="flex flex-col items-center gap-2">
						<UnoCard color="#FF8A3D" value="9" size="sm" />
						<span class="text-[10px] font-bold text-muted">Custom Orange</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<UnoCard color="red" value="4" size="sm" selected={true} />
						<span class="text-[10px] font-bold text-muted">selected=true</span>
					</div>
					<div class="flex flex-col items-center gap-2">
						<UnoCard color="green" value="reverse" size="sm" disabled={true} />
						<span class="text-[10px] font-bold text-muted">disabled=true</span>
					</div>
				</div>
			</div>
		</section>

		<!-- SECTION 5: REAL GAME BOARD LAYOUTS -->
		<section class="flex flex-col gap-4 mb-8">
			<div class="border-b border-hairline pb-2">
				<h2 class="font-sans text-lg font-[800] text-ink flex items-center gap-2">
					<Layers size={18} class="text-primary" /> Board Layout Demonstrations
				</h2>
				<p class="font-sans text-xs text-body mt-0.5">
					Simulating realistic Uno game states: draw/discard table piles and an interactive fanned
					player hand.
				</p>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
				<!-- Draw/Discard Piles -->
				<div
					class="lg:col-span-5 bg-emerald-900 border-4 border-emerald-950/40 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] relative overflow-hidden"
				>
					<div class="absolute inset-4 border border-white/5 rounded-lg pointer-events-none"></div>

					<button
						onclick={shuffleDiscardPile}
						class="absolute top-3 right-3 btn btn-circle btn-xs bg-black/30 hover:bg-black/60 text-white border-0"
						title="Shuffle Discard Pile Rotation"
					>
						<Shuffle size={12} />
					</button>

					<div class="flex gap-16 items-center z-10">
						<!-- Draw Pile Stack (Face Down) -->
						<div class="flex flex-col items-center gap-2">
							<div class="relative w-[80px] h-[120px]">
								<!-- Stack effect cards underneath -->
								<div
									class="absolute inset-0 bg-accent-pink border-2 border-white rounded-lg translate-y-[6px] translate-x-[4px] shadow-md border-solid"
								></div>
								<div
									class="absolute inset-0 bg-accent-pink border-2 border-white rounded-lg translate-y-[3px] translate-x-[2px] shadow-md border-solid"
								></div>
								<div class="relative z-10">
									<UnoCard
										faceDown={true}
										size="sm"
										thickBorder={true}
										playable={true}
										onclick={() => alert('Drew a card!')}
									/>
								</div>
							</div>
							<span class="text-[10px] font-mono font-[700] text-emerald-100/50 uppercase mt-2"
								>Draw Pile (32)</span
							>
						</div>

						<!-- Discard Pile (Face Up overlapping) -->
						<div class="flex flex-col items-center gap-2">
							<div class="relative w-[80px] h-[120px]">
								{#each discardPile as card, i (i)}
									<div
										class="absolute inset-0 transition-transform duration-500"
										style="transform: rotate({card.rotation}deg) translate({card.offset}px, {card.offset}px);"
									>
										<UnoCard
											color={card.color}
											value={card.value}
											size="sm"
											playable={i === discardPile.length - 1}
											onclick={i === discardPile.length - 1
												? () => alert('Discard pile details')
												: undefined}
										/>
									</div>
								{/each}
							</div>
							<span class="text-[10px] font-mono font-[700] text-emerald-100/50 uppercase mt-2"
								>Discard Pile</span
							>
						</div>
					</div>
				</div>

				<!-- Fan Deck Player Hand -->
				<div
					class="lg:col-span-7 bg-card border border-hairline rounded-xl p-8 flex flex-col justify-between min-h-[300px]"
				>
					<div>
						<div class="flex items-center justify-between mb-4">
							<span class="font-sans font-[800] text-[15px] text-ink"
								>Interactive Fan Hand (Player View)</span
							>
							<span class="text-xs text-muted">Hover to lift, click to select/deselect card</span>
						</div>
						<p class="text-xs text-body mb-8 max-w-[85%] leading-relaxed">
							Overlapping cards are offset and rotated symmetrically. Selecting a card raises its
							height index and translates it upwards dynamically.
						</p>
					</div>

					<!-- Fan wrapper mat -->
					<div
						class="flex items-end justify-center py-10 px-4 bg-canvas/30 rounded-xl relative min-h-[180px] overflow-visible"
					>
						<div
							class="relative flex justify-center items-end h-28 w-full max-w-[380px] select-none"
						>
							{#each playerHand as card, idx (idx)}
								<!-- Calculate fan angles -->
								{@const count = playerHand.length}
								{@const mid = (count - 1) / 2}
								{@const angle = (idx - mid) * 8}
								{@const translateX = (idx - mid) * 28}
								{@const translateY = Math.abs(idx - mid) * 4}

								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="absolute bottom-0 transition-all duration-300 origin-bottom"
									style="
										transform: rotate({angle}deg) translate({translateX}px, {translateY}px);
										z-index: {idx === activeHandIndex ? 50 : 10 + idx};
									"
									onmouseenter={() => (activeHandIndex = idx)}
									onmouseleave={() => (activeHandIndex = null)}
								>
									<UnoCard
										color={card.color}
										value={card.value}
										size="sm"
										playable={true}
										selected={card.selected}
										onclick={() => toggleSelectCard(idx)}
									/>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</section>
	</main>
</div>

<style>
	/* Background gradient helpers for table mat */
	.bg-radial-gradient {
		background-image: radial-gradient(var(--tw-gradient-stops));
	}
</style>
