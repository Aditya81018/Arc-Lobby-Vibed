<script lang="ts">
	import { Gamepad, X, ChevronLeft, Send } from '@lucide/svelte';
	import type { Game } from '../games/types';
	import { sendGameSessionInvite } from '../messages/controller';
	import { createGameSession, joinGameSession } from './controller';
	import { page } from '$app/state';
	import { userData } from '../user/store';
	import { gamesStore } from '../games/store';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import LoadingScreen from '../../components/LoadingScreen.svelte';

	const lobbyId = page.params.lobbyId!;

	let isLoading = $state(false);
	let modalRef: HTMLDialogElement;

	let selectedGame = $state<Game | null>(null);
	let settingsValues = $state<Record<string, any>>({});

	const openModal = () => {
		selectedGame = null;
		settingsValues = {};
		modalRef.showModal();
	};

	const closeModal = () => modalRef.close();

	const handleGameSelect = (game: Game) => {
		selectedGame = game;
		const defaults: Record<string, any> = {};
		Object.values(game.settings || {}).forEach((s) => {
			defaults[s.id] = s.defaultValue;
		});
		settingsValues = defaults;
	};

	const toggleMultiSelect = (settingId: string, value: any) => {
		const current = settingsValues[settingId] as any[];
		if (current.includes(value)) {
			settingsValues[settingId] = current.filter((v) => v !== value);
		} else {
			settingsValues[settingId] = [...current, value];
		}
	};

	const handleSendGameInvite = async () => {
		isLoading = true;
		const gameSession = await createGameSession(selectedGame!.id, lobbyId, settingsValues);
		sendGameSessionInvite(lobbyId, $userData.id, gameSession.id);

		const session = await joinGameSession(gameSession.id);
		if (session) {
			goto(resolve(`/${lobbyId}/${session.id}`));
			return;
		}

		if (!session) {
			closeModal();
			isLoading = false;
		}
	};
</script>

<button
	class="btn btn-square h-12 w-12 cursor-pointer rounded-md border border-hairline bg-accent-mint text-white shadow-sm btn-ghost transition-all hover:bg-accent-mint/80 active:scale-95"
	type="button"
	onclick={openModal}
	title="Send Game Invite"
>
	<Gamepad size={20} />
</button>

<dialog bind:this={modalRef} class="modal modal-bottom sm:modal-middle">
	{#if isLoading}
		<LoadingScreen />
	{/if}
	<div
		class="modal-box flex flex-col overflow-hidden border border-hairline bg-card p-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
	>
		<div class="flex items-center justify-between border-b border-hairline bg-canvas/30 px-6 py-4">
			<div class="flex items-center gap-3">
				{#if selectedGame}
					<button class="btn btn-circle btn-ghost btn-xs" onclick={() => (selectedGame = null)}>
						<ChevronLeft size={20} />
					</button>
				{/if}
				<h3 class="font-sans text-lg font-[800] text-ink">
					{selectedGame ? selectedGame.name : 'Select Game'}
				</h3>
			</div>
			<button
				class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/5"
				onclick={closeModal}
				aria-label="Close modal"
			>
				<X size={20} />
			</button>
		</div>

		<div class="custom-scrollbar overflow-y-auto px-6 pt-4 pb-6">
			{#if !selectedGame}
				<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
					{#each Object.values($gamesStore) as game, i (i)}
						<button
							onclick={() => handleGameSelect(game)}
							class="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-hairline bg-base-300 transition-all duration-300 hover:scale-[1.02] active:scale-95"
						>
							<img
								src={game.image}
								alt={game.name}
								class="absolute inset-0 h-full w-full object-cover"
							/>
							<div class="absolute inset-0 flex items-end bg-black/50 p-3">
								<span class="text-xs font-bold text-white sm:text-sm">{game.name}</span>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<div class="divide-y divide-hairline">
					{#each Object.values(selectedGame.settings || {}) as setting, i (i)}
						<div class="flex items-center gap-4 py-5 first:pt-0">
							<!-- svelte-ignore a11y_label_has_associated_control -->
							<label
								class="block font-sans text-xs font-[700] tracking-[0.3px] text-body uppercase select-none"
							>
								{setting.name}:
							</label>

							{#if setting.type === 'boolean'}
								<input
									type="checkbox"
									class="toggle toggle-primary"
									bind:checked={settingsValues[setting.id]}
								/>
							{:else if setting.type === 'pick-one'}
								<div class="flex flex-wrap gap-2">
									{#each setting.options as option, i (i)}
										<button
											class="no-animation btn cursor-pointer rounded-md font-sans text-xs font-semibold transition-all duration-200 btn-sm {settingsValues[
												setting.id
											] === option.value
												? 'border-none bg-primary text-white shadow-sm'
												: 'border border-hairline bg-canvas text-ink hover:bg-base-300'}"
											onclick={() => (settingsValues[setting.id] = option.value)}
										>
											{option.name}
										</button>
									{/each}
								</div>
							{:else if setting.type === 'pick-many'}
								<div class="flex flex-wrap gap-2">
									{#each setting.options as option, i (i)}
										<button
											class="no-animation btn cursor-pointer rounded-md font-sans text-xs font-semibold transition-all duration-200 btn-sm {settingsValues[
												setting.id
											].includes(option.value)
												? 'border-none bg-primary text-white shadow-sm'
												: 'border border-hairline bg-canvas text-ink hover:bg-base-300'}"
											onclick={() => toggleMultiSelect(setting.id, option.value)}
										>
											{option.name}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>

		{#if selectedGame}
			<div class="border-t border-hairline bg-card p-6 pt-2">
				<button
					class="btn h-12 btn-block cursor-pointer rounded-md border-none bg-primary font-sans text-sm font-bold text-white shadow-md transition-all hover:bg-primary/95 active:scale-95"
					disabled={isLoading}
					onclick={handleSendGameInvite}
				>
					<Send size={18} class="mr-2" />
					Send Game Invite
				</button>
			</div>
		{/if}
	</div>

	<form method="dialog" class="modal-backdrop bg-black/40 backdrop-blur-[2px]">
		<button>close</button>
	</form>
</dialog>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(124, 92, 252, 0.15);
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(124, 92, 252, 0.3);
	}
</style>
