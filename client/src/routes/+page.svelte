<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createLobby, getLobbyById } from '../features/lobby/controllers';
	import { userData } from '../features/user/store';
	import { getRandomColor, getRandomEmoji, getRandomName } from '../features/user/controllers';
	import { themeState } from '$lib/theme.svelte';
	import ThemeToggle from '../components/ThemeToggle.svelte';
	import { User, Gamepad, Pencil, ArrowRight, Loader2, Dices } from '@lucide/svelte';
	import { faker } from '@faker-js/faker';

	// Preset Colors (20 soothing and playful options matching the website's contrast and vibe)
	const presetColors = [
		{ background: 'hsl(43, 90%, 48%)', foreground: 'hsl(43, 95%, 72%)' }, // Warm Yellow
		{ background: 'hsl(343, 85%, 52%)', foreground: 'hsl(343, 95%, 78%)' }, // Rose Pink
		{ background: 'hsl(166, 65%, 40%)', foreground: 'hsl(166, 80%, 75%)' }, // Mint
		{ background: 'hsl(255, 70%, 55%)', foreground: 'hsl(255, 85%, 80%)' }, // Purple/Lavender
		{ background: 'hsl(15, 80%, 52%)', foreground: 'hsl(15, 95%, 78%)' }, // Peach/Coral
		{ background: 'hsl(200, 80%, 45%)', foreground: 'hsl(200, 95%, 75%)' }, // Sky Blue
		{ background: 'hsl(100, 45%, 42%)', foreground: 'hsl(100, 60%, 75%)' }, // Sage Green
		{ background: 'hsl(142, 65%, 40%)', foreground: 'hsl(142, 80%, 75%)' }, // Soft Emerald
		{ background: 'hsl(180, 70%, 38%)', foreground: 'hsl(180, 85%, 72%)' }, // Teal
		{ background: 'hsl(275, 55%, 52%)', foreground: 'hsl(275, 75%, 80%)' }, // Lilac
		{ background: 'hsl(328, 70%, 50%)', foreground: 'hsl(328, 90%, 76%)' }, // Raspberry
		{ background: 'hsl(230, 65%, 48%)', foreground: 'hsl(230, 85%, 75%)' }, // Deep Indigo
		{ background: 'hsl(35, 85%, 45%)', foreground: 'hsl(35, 95%, 70%)' }, // Amber
		{ background: 'hsl(120, 50%, 35%)', foreground: 'hsl(120, 65%, 70%)' }, // Forest Green
		{ background: 'hsl(300, 55%, 45%)', foreground: 'hsl(300, 75%, 75%)' }, // Orchid Plum
		{ background: 'hsl(48, 85%, 45%)', foreground: 'hsl(48, 95%, 72%)' }, // Butter Yellow
		{ background: 'hsl(215, 60%, 46%)', foreground: 'hsl(215, 80%, 76%)' }, // Slate Blue
		{ background: 'hsl(188, 80%, 38%)', foreground: 'hsl(188, 95%, 72%)' }, // Electric Cyan
		{ background: 'hsl(25, 75%, 46%)', foreground: 'hsl(25, 90%, 74%)' }, // Terracotta
		{ background: 'hsl(290, 60%, 50%)', foreground: 'hsl(290, 80%, 78%)' } // Fuchsia
	];

	// Profile Name Draft & Commit
	let draft = $state($userData.name);

	$effect(() => {
		draft = $userData.name;
	});

	function commitName() {
		const trimmed = draft.trim();
		if (trimmed.length >= 3 && trimmed.length <= 18) {
			$userData.name = trimmed;
		} else {
			draft = $userData.name;
		}
	}

	function randomizeName() {
		const newName = getRandomName();
		draft = newName;
		$userData.name = newName;
	}

	function randomizeAvatar() {
		const randomIndex = Math.floor(Math.random() * presetColors.length);
		$userData = {
			...$userData,
			emoji: getRandomEmoji(),
			color: presetColors[randomIndex]
		};
	}

	function randomizeAll() {
		randomizeName();
		randomizeAvatar();
	}

	// Emoji modal selection
	let emojiModalRef: HTMLDialogElement;
	let selectedCategory = $state('😀 Smileys');

	const emojiCategories: Record<string, string[]> = {
		'😀 Smileys': (faker.definitions.internet?.emoji as any)?.smiley || [],
		'🐸 Nature': (faker.definitions.internet?.emoji as any)?.nature || [],
		'🍔 Food': (faker.definitions.internet?.emoji as any)?.food || [],
		'🏆 Activity': (faker.definitions.internet?.emoji as any)?.activity || [],
		'🚗 Travel': (faker.definitions.internet?.emoji as any)?.travel || [],
		'💡 Objects': (faker.definitions.internet?.emoji as any)?.object || [],
		'❤️ Symbols': (faker.definitions.internet?.emoji as any)?.symbol || [],
		'🚩 Flags': (faker.definitions.internet?.emoji as any)?.flag || [],
		'🙋 People': (faker.definitions.internet?.emoji as any)?.person || []
	};

	function openEmojiModal() {
		emojiModalRef.showModal();
	}

	function closeEmojiModal() {
		emojiModalRef.close();
	}

	function selectEmoji(emoji: string) {
		$userData.emoji = emoji;
		closeEmojiModal();
	}

	// Lobby Creation
	let isCreating = $state(false);
	async function handleCreateLobby() {
		isCreating = true;
		try {
			const lobby = await createLobby();
			if (lobby && lobby.id) {
				goto(resolve(`/${lobby.id}`));
			} else {
				isCreating = false;
			}
		} catch (err) {
			console.error(err);
			isCreating = false;
		}
	}

	// Lobby Joining
	let lobbyId = $state('');
	let isJoining = $state(false);
	let joinError = $state('');

	function handleLobbyIdInput() {
		joinError = '';
		lobbyId = lobbyId
			.toUpperCase()
			.replace(/[^A-Z0-9]/g, '')
			.slice(0, 6);
	}

	async function handleJoinSubmit(e: Event) {
		e.preventDefault();
		if (lobbyId.length !== 6) return;

		isJoining = true;
		joinError = '';
		try {
			const lobby = await getLobbyById(lobbyId);
			if (lobby) {
				goto(resolve(`/${lobbyId}`));
			} else {
				joinError = 'Invalid room code. Please check and try again.';
				isJoining = false;
			}
		} catch (err) {
			console.error(err);
			joinError = 'An error occurred. Please try again.';
			isJoining = false;
		}
	}
</script>

<div
	class="relative flex min-h-screen w-full flex-col items-center justify-start gap-12 bg-canvas px-4 py-12 text-ink transition-colors duration-200 md:gap-16"
>
	<!-- Theme Toggle -->
	<div class="absolute top-4 right-4 z-50">
		<ThemeToggle />
	</div>

	<!-- Header / Hero wordmark -->
	<header class="flex max-w-2xl flex-col items-center gap-3 px-4 text-center select-none">
		<h1 class="font-display text-5xl leading-[1.05] font-[800] tracking-[-0.5px] md:text-7xl">
			<span class="text-ink">Arc</span> <span class="text-primary">Lobby</span>
		</h1>
		<p class="max-w-[540px] font-sans text-[15px] leading-[1.55] font-normal text-body">
			Gather your friends for instant, zero-friction multiplayer gaming.
			<br class="hidden sm:inline" />
			No accounts, no installs—just create a room, share the lobby code, and start playing right from
			your browser.
		</p>
	</header>

	<!-- Main Layout cards -->
	<div class="grid w-full max-w-[1100px] grid-cols-1 items-stretch gap-6 md:grid-cols-12">
		<!-- Customize Profile Card -->
		<section
			class="col-span-1 flex min-h-[460px] flex-col items-start rounded-xl border border-hairline bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] md:col-span-5"
		>
			<!-- Header -->
			<div class="flex w-full items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"
					>
						<User size={20} />
					</div>
					<h2 class="font-sans text-xl leading-none font-[800] text-ink">Customize Profile</h2>
				</div>
				<button
					type="button"
					onclick={randomizeAll}
					class="btn btn-circle text-primary btn-ghost transition-all btn-sm active:scale-95"
					title="Randomize All Profile Details"
				>
					<Dices size={20} />
				</button>
			</div>

			<!-- Avatar Circle editor -->
			<div class="relative my-6 flex w-full flex-grow flex-col items-center justify-center">
				<div class="group relative h-40 w-40">
					<button
						type="button"
						onclick={openEmojiModal}
						class="relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-card shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:scale-105"
						style="background-color: {$userData.color.background};"
						aria-label="Choose Avatar Emoji"
					>
						<div
							class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						></div>
						<span
							class="filter text-7xl drop-shadow-sm transition-transform duration-300 select-none group-hover:scale-110"
						>
							{$userData.emoji}
						</span>
					</button>

					<!-- Edit indicator -->
					<div
						class="pointer-events-none absolute right-1 bottom-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-primary text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-12"
					>
						<Pencil size={15} />
					</div>
				</div>
			</div>

			<!-- Username field -->
			<div class="mt-auto w-full">
				<label
					class="mb-2 block font-sans text-[13px] font-[700] tracking-[0.3px] text-body uppercase"
				>
					Display Name
				</label>
				<div class="relative w-full">
					<input
						type="text"
						bind:value={draft}
						onblur={commitName}
						onkeydown={(e) => e.key === 'Enter' && commitName()}
						maxlength="18"
						class="h-12 w-full rounded-md border border-hairline bg-card px-4 text-center font-sans text-[16px] font-[600] text-ink transition-colors focus:border-primary focus:outline-none sm:text-left"
						placeholder="Enter name"
					/>
				</div>

				<!-- Pick Color Section -->
				<div class="mt-5 w-full">
					<label
						class="mb-2 block font-sans text-[13px] font-[700] tracking-[0.3px] text-body uppercase"
					>
						Pick Color
					</label>
					<div class="scrollbar-none flex w-full gap-2.5 overflow-x-auto pb-1 select-none">
						{#each presetColors as color (color.background)}
							<button
								type="button"
								onclick={() => ($userData.color = color)}
								class="h-8 w-8 shrink-0 cursor-pointer rounded border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95
									{$userData.color.background === color.background ? 'ring-2 ring-primary ring-offset-2' : ''}"
								style="background-color: {color.background}; --tw-ring-offset-color: var(--card);"
								aria-label="Select color"
							></button>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- Host or Join Lobby Card -->
		<section
			class="col-span-1 flex min-h-[460px] flex-col justify-between rounded-xl border border-hairline bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] md:col-span-7"
		>
			<!-- Header -->
			<div class="flex w-full items-center gap-3">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-accent-yellow text-[#20180A]"
				>
					<Gamepad size={20} />
				</div>
				<h2 class="font-sans text-xl leading-none font-[800] text-ink">Host or Join Lobby</h2>
			</div>

			<!-- Host Panel -->
			<div
				class="relative mt-6 flex flex-col items-start gap-2 overflow-hidden rounded-lg border border-host-border bg-host-panel p-6"
			>
				<h3 class="font-sans text-[18px] font-[700] text-ink">Host a New Room</h3>
				<p class="max-w-[75%] font-sans text-[15px] leading-[1.55] font-normal text-body">
					Create a fresh, private playroom. You'll be able to launch live game sessions and invite
					your friends in real-time.
				</p>
				<button
					onclick={handleCreateLobby}
					disabled={isCreating}
					class="relative z-10 mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-md px-6 font-sans text-[15px] font-[700] transition-colors disabled:opacity-50 sm:w-auto
					{themeState.current === 'arc-dark'
						? 'bg-accent-yellow text-[#20180A] hover:bg-[#e2b033]'
						: 'bg-[#171321] text-white hover:bg-[#251e36]'}"
				>
					{#if isCreating}
						<Loader2 size={16} class="animate-spin" />
						Creating...
					{:else}
						Create Lobby
						<ArrowRight size={16} />
					{/if}
				</button>
				<!-- Mascot Emoji -->
				<div
					class="pointer-events-none absolute top-4 right-4 translate-y-2 -rotate-12 text-6xl opacity-90 transition-transform duration-300 select-none hover:scale-110 md:text-8xl"
				>
					🎮
				</div>
			</div>

			<!-- Divider -->
			<div class="my-6 flex w-full items-center justify-center gap-4">
				<div class="flex-grow border-t border-dashed border-hairline"></div>
				<span class="font-sans text-[12px] font-[700] tracking-wider text-muted">OR</span>
				<div class="flex-grow border-t border-dashed border-hairline"></div>
			</div>

			<!-- Join Panel -->
			<div
				class="relative flex flex-col items-start gap-2 overflow-hidden rounded-lg border border-join-border bg-join-panel p-6"
			>
				<h3 class="font-sans text-[18px] font-[700] text-ink">Join with Room Code</h3>
				<p class="max-w-[75%] font-sans text-[15px] leading-[1.55] font-normal text-body">
					Already have an invite? Enter the 6-character room code from your friends to jump into
					their lobby.
				</p>
				<form
					onsubmit={handleJoinSubmit}
					class="relative z-10 mt-2 flex w-full flex-col gap-3 sm:flex-row"
				>
					<input
						type="text"
						placeholder="Enter 6-character code"
						bind:value={lobbyId}
						oninput={handleLobbyIdInput}
						maxlength="6"
						class="h-12 flex-grow rounded-md border border-hairline bg-card px-4 text-center font-sans text-[16px] font-[600] text-ink placeholder-muted transition-colors focus:border-primary focus:outline-none sm:text-left"
					/>
					<button
						type="submit"
						disabled={isJoining || lobbyId.length !== 6}
						class="flex h-12 items-center justify-center gap-2 rounded-md px-6 font-sans text-[15px] font-[700] whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50
						{themeState.current === 'arc-dark'
							? 'hover:bg-opacity-90 bg-primary text-white'
							: 'bg-[#171321] text-white hover:bg-[#251e36]'}"
					>
						{#if isJoining}
							<Loader2 size={16} class="animate-spin" />
							Joining...
						{:else}
							Join Lobby
							<ArrowRight size={16} />
						{/if}
					</button>
				</form>
				{#if joinError}
					<p class="relative z-10 mt-2 font-sans text-[13px] text-error">{joinError}</p>
				{/if}
				<!-- Mascot Emoji -->
				<div
					class="pointer-events-none absolute top-1/3 -right-4 -translate-y-1/2 -rotate-90 text-7xl opacity-90 transition-all duration-300 select-none hover:scale-110"
				>
					🐸
				</div>
			</div>
		</section>
	</div>

	<!-- Emoji Picker Modal -->
	<dialog bind:this={emojiModalRef} class="modal modal-bottom sm:modal-middle">
		<div
			class="modal-box flex max-h-[500px] flex-col overflow-hidden border border-hairline bg-card p-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-hairline p-4">
				<h3 class="font-sans text-lg font-[800] text-ink">Choose your Emoji</h3>
				<button
					onclick={closeEmojiModal}
					class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full font-sans text-xl text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/5"
				>
					✕
				</button>
			</div>

			<!-- Categories Tab Row -->
			<div
				class="scrollbar-none flex gap-1 overflow-x-auto border-b border-hairline bg-canvas/30 p-2 select-none"
			>
				{#each Object.keys(emojiCategories) as categoryName (categoryName)}
					<button
						onclick={() => (selectedCategory = categoryName)}
						class="cursor-pointer rounded-full px-3 py-1.5 font-sans text-[13px] font-[600] whitespace-nowrap transition-colors
						{selectedCategory === categoryName
							? 'bg-primary text-white'
							: 'text-body hover:bg-black/5 dark:hover:bg-white/5'}"
					>
						{categoryName}
					</button>
				{/each}
			</div>

			<!-- Emoji Grid Body -->
			<div
				class="custom-scrollbar grid max-h-[300px] flex-grow grid-cols-6 gap-2 overflow-y-auto p-4 sm:grid-cols-8"
			>
				{#each emojiCategories[selectedCategory] as emoji (emoji)}
					<button
						onclick={() => selectEmoji(emoji)}
						class="flex cursor-pointer items-center justify-center rounded-lg p-2 text-3xl transition-all select-none hover:scale-110 hover:bg-primary/10 active:scale-95"
					>
						{emoji}
					</button>
				{/each}
			</div>
		</div>

		<form method="dialog" class="modal-backdrop bg-black/40 backdrop-blur-[2px]">
			<button>close</button>
		</form>
	</dialog>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}
</style>
