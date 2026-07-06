<script lang="ts">
	import { themeState } from '$lib/theme.svelte';
	import { Ban, Repeat } from '@lucide/svelte';

	// Preset Colors
	const arcColors = {
		red: '#FF5D8F', // Accent Pink
		green: '#57D08C', // Accent Green
		blue: '#7C5CFC', // Primary Purple
		yellow: '#F6C445', // Accent Yellow
		wild: '#171321' // Ink
	};

	const classicColors = {
		red: '#EF3340', // Classic Red
		green: '#37B44A', // Classic Green
		blue: '#0063B1', // Classic Blue
		yellow: '#FFD100', // Classic Yellow
		wild: '#111111' // Dark
	};

	// Self-contained pixel dimensions to bypass dynamic Tailwind compilation
	const sizeSpecs = {
		sm: {
			width: '80px',
			height: '120px',
			borderRadius: '8px',
			borderWidth: '2px',
			innerBorderInset: '4px',
			innerBorderWidth: '1px',
			innerBorderRadius: '5px',
			ovalWidth: '68px',
			ovalHeight: '32px',
			fontSizeCenter: '24px',
			fontSizeCorner: '12px',
			cornerOffset: '8px', // Shifted inward to prevent clipping
			cornerIconSize: 11,
			backOvalWidth: '64px', // Reduced to fit within inner border
			backOvalHeight: '32px',
			backFontSize: '16px', // Scaled text to fit
			svgSize: 22
		},
		md: {
			width: '128px',
			height: '180px',
			borderRadius: '14px',
			borderWidth: '4px',
			innerBorderInset: '6px',
			innerBorderWidth: '2px',
			innerBorderRadius: '8px',
			ovalWidth: '108px',
			ovalHeight: '50px',
			fontSizeCenter: '44px',
			fontSizeCorner: '18px',
			cornerOffset: '12px', // Shifted inward to prevent clipping
			cornerIconSize: 16,
			backOvalWidth: '100px', // Reduced to fit within inner border
			backOvalHeight: '50px',
			backFontSize: '26px', // Scaled text to fit
			svgSize: 36
		},
		lg: {
			width: '160px',
			height: '240px',
			borderRadius: '20px',
			borderWidth: '4px',
			innerBorderInset: '8px',
			innerBorderWidth: '2px',
			innerBorderRadius: '12px',
			ovalWidth: '136px',
			ovalHeight: '64px',
			fontSizeCenter: '48px',
			fontSizeCorner: '22px',
			cornerOffset: '16px', // Shifted inward to prevent clipping
			cornerIconSize: 20,
			backOvalWidth: '128px', // Reduced to fit within inner border
			backOvalHeight: '60px',
			backFontSize: '32px', // Scaled text to fit
			svgSize: 48
		},
		xl: {
			width: '200px',
			height: '300px',
			borderRadius: '28px',
			borderWidth: '6px',
			innerBorderInset: '10px',
			innerBorderWidth: '3px',
			innerBorderRadius: '18px',
			ovalWidth: '176px',
			ovalHeight: '82px',
			fontSizeCenter: '72px',
			fontSizeCorner: '28px',
			cornerOffset: '20px', // Shifted inward to prevent clipping
			cornerIconSize: 26,
			backOvalWidth: '160px', // Reduced to fit within inner border
			backOvalHeight: '74px',
			backFontSize: '42px', // Scaled text to fit
			svgSize: 64
		}
	};

	interface Props {
		color?: 'red' | 'green' | 'blue' | 'yellow' | 'wild' | string;
		value?:
			| '0'
			| '1'
			| '2'
			| '3'
			| '4'
			| '5'
			| '6'
			| '7'
			| '8'
			| '9'
			| 'skip'
			| 'reverse'
			| 'draw-two'
			| 'wild'
			| 'wild-draw-four'
			| string;
		size?: 'sm' | 'md' | 'lg' | 'xl' | string;
		themePreset?: 'arc' | 'classic';
		faceDown?: boolean;
		playable?: boolean;
		selected?: boolean;
		disabled?: boolean;
		thickBorder?: boolean;
		shadowDepth?: 'none' | 'soft' | 'retro';
		customClass?: string;
		onclick?: (event: MouseEvent) => void;
	}

	let {
		color = 'red',
		value = '0',
		size = 'md',
		themePreset = 'arc',
		faceDown = false,
		playable = false,
		selected = false,
		disabled = false,
		thickBorder = true,
		shadowDepth = 'retro',
		customClass = '',
		onclick
	}: Props = $props();

	// Resolve the color palette to use
	let colors = $derived(themePreset === 'classic' ? classicColors : arcColors);

	// Get base background and glow colors
	let resolvedBgColor = $derived.by(() => {
		if (color === 'red') return colors.red;
		if (color === 'green') return colors.green;
		if (color === 'blue') return colors.blue;
		if (color === 'yellow') return colors.yellow;
		if (color === 'wild') return colors.wild;
		return color; // Custom color string
	});

	// Glow/Pulse outline color mapping
	let glowColor = $derived.by(() => {
		if (color === 'red') return colors.red;
		if (color === 'green') return colors.green;
		if (color === 'blue') return colors.blue;
		if (color === 'yellow') return colors.yellow;
		if (color === 'wild') return '#7C5CFC'; // Default purple glow for wild
		return color;
	});

	let backColor = $derived(colors.wild);

	// Determine if size preset matches
	let isSizePreset = $derived(size === 'sm' || size === 'md' || size === 'lg' || size === 'xl');
	let spec = $derived(isSizePreset ? sizeSpecs[size as keyof typeof sizeSpecs] : sizeSpecs.md);

	// Large center icon size calculation for action cards (skip and reverse)
	let centerIconSize = $derived.by(() => {
		if (value === 'skip' || value === 'reverse') {
			if (size === 'sm') return 28;
			if (size === 'md') return 44;
			if (size === 'lg') return 56;
			if (size === 'xl') return 76;
			return Math.round(spec.svgSize * 1.25);
		}
		return spec.svgSize;
	});

	// Keypress handler for interactive card
	function handleKeyDown(event: KeyboardEvent) {
		if (disabled || !playable) return;
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			if (onclick) {
				const mockEvent = new MouseEvent('click');
				onclick(mockEvent);
			}
		}
	}
</script>

<!-- Outer Card Container -->
<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<div
	role="button"
	tabindex={playable && !disabled ? 0 : -1}
	{onclick}
	onkeydown={handleKeyDown}
	class="uno-card relative overflow-hidden border-solid border-white font-sans transition-all duration-300 select-none
		{playable && !disabled ? 'card-playable' : ''}
		{selected && !disabled ? 'card-selected' : ''}
		{disabled ? 'card-disabled' : ''}
		{shadowDepth === 'retro' ? `shadow-retro-${size}` : ''}
		{shadowDepth === 'soft' ? 'shadow-lg hover:shadow-xl' : ''}
		{!thickBorder ? 'border-0' : ''}
		{!isSizePreset ? size : ''}
		{customClass}"
	style="
		--card-color: {resolvedBgColor};
		--card-color-glow: {glowColor};
		--ink: {themeState.current === 'arc-dark' ? '#ffffff' : '#171321'};
		background-color: {faceDown ? backColor : resolvedBgColor};
		{isSizePreset
		? `width: ${spec.width}; height: ${spec.height}; border-radius: ${spec.borderRadius}; border-width: ${spec.borderWidth};`
		: ''}
	"
>
	<!-- Wild Conic Gradient Background Overlay -->
	{#if !faceDown && color === 'wild'}
		<div
			class="absolute inset-0 z-0 bg-conic"
			style="
				--c-red: {colors.red};
				--c-yellow: {colors.yellow};
				--c-green: {colors.green};
				--c-blue: {colors.blue};
			"
		></div>
	{/if}

	<!-- White Inner Border Offset (only if thickBorder is on) -->
	{#if thickBorder}
		<div
			class="pointer-events-none absolute z-10 border-solid border-white/40"
			style="
				top: {spec.innerBorderInset};
				left: {spec.innerBorderInset};
				right: {spec.innerBorderInset};
				bottom: {spec.innerBorderInset};
				border-width: {spec.innerBorderWidth};
				border-radius: {spec.innerBorderRadius};
			"
		></div>
	{/if}

	<!-- CARD BACK SIDE -->
	{#if faceDown}
		<!-- Textured Polka Pattern Overlay for Card Back -->
		<div class="bg-polka absolute inset-0 z-0 opacity-20"></div>

		<!-- Star Sparkles (Corner Ornaments) -->
		<div
			class="pointer-events-none absolute z-10 animate-pulse font-display font-bold text-white/90"
			style="top: {spec.cornerOffset}; left: {spec.cornerOffset}; font-size: {spec.fontSizeCorner};"
		>
			✦
		</div>
		<div
			class="pointer-events-none absolute z-10 animate-pulse font-display font-bold text-white/90"
			style="bottom: {spec.cornerOffset}; right: {spec.cornerOffset}; font-size: {spec.fontSizeCorner};"
		>
			✦
		</div>

		<div class="absolute inset-0 z-10 flex items-center justify-center">
			<!-- Oval Center Backdrop -->
			<div
				class="flex items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)]"
				style="
					width: {spec.ovalWidth};
					height: {spec.ovalHeight};
					border-radius: 50%;
					background-color: rgba(255, 255, 255, 0.95);
					transform: rotate(-24deg) skewX(-12deg);
				"
			>
				<!-- Brand Text -->
				<div
					class="flex items-center justify-center font-display font-[900] italic"
					style="
						color: {backColor};
						font-size: {spec.backFontSize};
						line-height: 1;
						transform: skewX(12deg) rotate(24deg);
					"
				>
					{themePreset === 'arc' ? 'ARC' : 'UNO'}
				</div>
			</div>
		</div>

		<!-- CARD FRONT SIDE -->
	{:else}
		<!-- Main center white oval -->
		<div class="absolute inset-0 z-10 flex items-center justify-center">
			<div
				class="flex items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)]"
				style="
					width: {spec.ovalWidth};
					height: {spec.ovalHeight};
					border-radius: 50%;
					background-color: rgba(255, 255, 255, 0.95);
					transform: rotate(-24deg) skewX(-12deg);
				"
			>
				<!-- Large center value content -->
				<div
					class="flex items-center justify-center font-display font-[900] italic"
					style="
						color: {color === 'wild' ? '#171321' : resolvedBgColor};
						font-size: {spec.fontSizeCenter};
						line-height: 1;
						transform: skewX(12deg) rotate(24deg);
					"
				>
					{#if value === 'skip'}
						<!-- Skip Lucide Icon -->
						<Ban size={centerIconSize} strokeWidth={3.8} />
					{:else if value === 'reverse'}
						<!-- Reverse Lucide Icon -->
						<Repeat size={centerIconSize} strokeWidth={3.8} />
					{:else if value === 'draw-two'}
						<!-- Draw Two SVG -->
						<div class="relative flex items-center justify-center">
							<svg
								viewBox="0 0 24 24"
								fill="currentColor"
								stroke="currentColor"
								stroke-width="1.5"
								style="
									width: {spec.svgSize}px;
									height: {spec.svgSize}px;
								"
							>
								<!-- Back Card -->
								<rect
									x="2"
									y="6"
									width="10"
									height="14"
									rx="1.5"
									fill="white"
									stroke="currentColor"
								/>
								<!-- Front Card -->
								<rect
									x="8"
									y="2"
									width="10"
									height="14"
									rx="1.5"
									fill="white"
									stroke="currentColor"
								/>
							</svg>
							<span
								class="text-outline absolute font-[900] text-white select-none"
								style="
									right: calc(-1.5 * {spec.borderWidth});
									bottom: calc(-1.5 * {spec.borderWidth});
									font-size: calc({spec.fontSizeCorner} + 1px);
								"
							>
								+2
							</span>
						</div>
					{:else if value === 'wild'}
						<!-- Wild Center Color Sector Oval -->
						<svg
							viewBox="0 0 100 100"
							style="
								width: {spec.svgSize}px;
								height: {spec.svgSize}px;
							"
						>
							<path d="M 50 50 L 50 10 A 40 40 0 0 0 10 50 Z" fill={colors.red} />
							<path d="M 50 50 L 90 50 A 40 40 0 0 0 50 10 Z" fill={colors.yellow} />
							<path d="M 50 50 L 50 90 A 40 40 0 0 0 90 50 Z" fill={colors.green} />
							<path d="M 50 50 L 10 50 A 40 40 0 0 0 50 90 Z" fill={colors.blue} />
						</svg>
					{:else if value === 'wild-draw-four'}
						<!-- Wild Draw Four Center Card Stack -->
						<div class="relative flex items-center justify-center">
							<svg
								viewBox="0 0 24 24"
								style="
									width: calc({spec.svgSize}px + 4px);
									height: calc({spec.svgSize}px + 4px);
								"
							>
								<rect
									x="2"
									y="10"
									width="8"
									height="12"
									rx="1.5"
									fill={colors.blue}
									stroke="white"
									stroke-width="0.8"
								/>
								<rect
									x="6"
									y="8"
									width="8"
									height="12"
									rx="1.5"
									fill={colors.green}
									stroke="white"
									stroke-width="0.8"
								/>
								<rect
									x="10"
									y="6"
									width="8"
									height="12"
									rx="1.5"
									fill={colors.yellow}
									stroke="white"
									stroke-width="0.8"
								/>
								<rect
									x="14"
									y="4"
									width="8"
									height="12"
									rx="1.5"
									fill={colors.red}
									stroke="white"
									stroke-width="0.8"
								/>
							</svg>
							<span
								class="text-outline absolute font-[900] text-white"
								style="
									right: calc(-1.5 * {spec.borderWidth});
									bottom: calc(-1.5 * {spec.borderWidth});
									font-size: calc({spec.fontSizeCorner} + 1px);
								"
							>
								+4
							</span>
						</div>
					{:else}
						<!-- Plain value (number/custom text) -->
						<span
							class="text-outline text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)] select-none"
						>
							{value}
						</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Mini-symbols in corners -->
		<!-- Top-Left Corner Symbol -->
		<div
			class="absolute z-20 flex flex-col items-center justify-start font-display leading-none font-[900] text-white italic"
			style="
				top: {spec.cornerOffset};
				left: {spec.cornerOffset};
				font-size: {spec.fontSizeCorner};
			"
		>
			{#if value === 'skip'}
				<Ban size={spec.cornerIconSize} strokeWidth={3.8} />
			{:else if value === 'reverse'}
				<Repeat size={spec.cornerIconSize} strokeWidth={3.8} />
			{:else if value === 'draw-two'}
				+2
			{:else if value === 'wild'}
				W
			{:else if value === 'wild-draw-four'}
				+4
			{:else}
				{value}
			{/if}
		</div>

		<!-- Bottom-Right Corner Symbol (Upside Down) -->
		<div
			class="absolute z-20 flex rotate-180 flex-col items-center justify-start font-display leading-none font-[900] text-white italic"
			style="
				bottom: {spec.cornerOffset};
				right: {spec.cornerOffset};
				font-size: {spec.fontSizeCorner};
			"
		>
			{#if value === 'skip'}
				<Ban size={spec.cornerIconSize} strokeWidth={3.8} />
			{:else if value === 'reverse'}
				<Repeat size={spec.cornerIconSize} strokeWidth={3.8} />
			{:else if value === 'draw-two'}
				+2
			{:else if value === 'wild'}
				W
			{:else if value === 'wild-draw-four'}
				+4
			{:else}
				{value}
			{/if}
		</div>
	{/if}
</div>

<style>
	/* Base card shape & border solid configuration */
	.uno-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		border-style: solid;
		flex-shrink: 0;
	}

	/* Card back polka dot texture */
	.bg-polka {
		background-image: radial-gradient(rgba(255, 255, 255, 0.25) 1.5px, transparent 1.5px);
		background-size: 8px 8px;
	}

	/* Conic Gradient for Wild Cards */
	.bg-conic {
		background: conic-gradient(
			var(--c-red) 0deg 90deg,
			var(--c-yellow) 90deg 180deg,
			var(--c-green) 180deg 270deg,
			var(--c-blue) 270deg 360deg
		);
	}

	/* Text outline effect to make numbers extremely bold and readable */
	.text-outline {
		text-shadow:
			-1.5px -1.5px 0 #171321,
			1.5px -1.5px 0 #171321,
			-1.5px 1.5px 0 #171321,
			1.5px 1.5px 0 #171321,
			-2px 0 0 #171321,
			2px 0 0 #171321,
			0 -2px 0 #171321,
			0 2px 0 #171321;
	}

	/* Retro shadows - Use :global to prevent Svelte from pruning dynamic bindings */
	:global(.shadow-retro-sm) {
		box-shadow: 3px 3px 0px var(--ink) !important;
	}
	:global(.shadow-retro-md) {
		box-shadow: 5px 5px 0px var(--ink) !important;
	}
	:global(.shadow-retro-lg) {
		box-shadow: 7px 7px 0px var(--ink) !important;
	}
	:global(.shadow-retro-xl) {
		box-shadow: 9px 9px 0px var(--ink) !important;
	}

	/* Playable State Animations & Hover */
	.card-playable {
		cursor: pointer;
		transition:
			transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275),
			box-shadow 0.25s ease;
	}
	.card-playable:hover {
		transform: translateY(-8px) scale(1.04) rotate(1deg);
		box-shadow:
			0 12px 24px rgba(0, 0, 0, 0.15),
			0 0 16px var(--card-color-glow);
		z-index: 40 !important;
	}
	.card-playable:active {
		transform: translateY(-2px) scale(0.98);
	}

	/* Selected State */
	.card-selected {
		transform: translateY(-16px) rotate(-1deg) !important;
		box-shadow:
			0 16px 28px rgba(0, 0, 0, 0.2),
			0 0 20px var(--card-color-glow);
		z-index: 30 !important;
	}

	/* Disabled State */
	.card-disabled {
		opacity: 0.45;
		filter: grayscale(0.85) contrast(0.9);
		cursor: not-allowed;
		pointer-events: none;
	}
</style>
