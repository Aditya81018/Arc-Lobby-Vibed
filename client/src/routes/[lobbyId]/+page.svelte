<script lang="ts">
	import { page } from '$app/state';
	import { socket } from '$lib/socket';
	import {
		ArrowDown,
		Menu,
		MessageSquareDashed,
		Send,
		Copy,
		Check,
		Users,
		LogOut,
		Trophy,
		Gamepad
	} from '@lucide/svelte';
	import { getMemberFromId } from '../../features/lobby/controllers';
	import LeaveLobbyButton from '../../features/lobby/LeaveLobbyButton.svelte';
	import { membersStore } from '../../features/lobby/store';
	import { sendTextMessage } from '../../features/messages/controller';
	import { lobbyMessagesStore } from '../../features/messages/store';
	import SendGameInviteButton from '../../features/game-sessions/SendGameInviteButton.svelte';
	import { getLocalGameById } from '../../features/games/controller';
	import JoinGameSessionButton from '../../features/game-sessions/JoinGameSessionButton.svelte';
	import SpectateGameSessionButton from '../../features/game-sessions/SpectateGameSessionButton.svelte';
	import { gameSessionsStore } from '../../features/game-sessions/store';
	import { userData, getUserForeground, getUserBackground } from '../../features/user/store';
	import UserAvatar from '../../components/UserAvatar.svelte';
	import { gamesStore } from '../../features/games/store';
	import { onMount } from 'svelte';
	import ThemeToggle from '../../components/ThemeToggle.svelte';
	import { themeState } from '$lib/theme.svelte';

	const lobbyId = page.params.lobbyId!;
	let message = $state('');

	let messagesContainer: HTMLElement;
	let showScrollButton = $state(false);

	let copied = $state(false);
	function copyLobbyLink() {
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(window.location.href);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} else {
			try {
				const textArea = document.createElement('textarea');
				textArea.value = window.location.href;
				textArea.style.top = '0';
				textArea.style.left = '0';
				textArea.style.position = 'fixed';
				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();
				const successful = document.execCommand('copy');
				document.body.removeChild(textArea);
				if (successful) {
					copied = true;
					setTimeout(() => {
						copied = false;
					}, 2000);
				}
			} catch (err) {
				console.error('Fallback copy failed', err);
			}
		}
	}

	function handleSendTextMessage() {
		if (message.trim() === '') return;

		sendTextMessage(lobbyId, $userData.id, message);
		message = '';
	}

	function isNearBottom() {
		if (!messagesContainer) return true;

		const threshold = 250; // px
		const { scrollTop, scrollHeight, clientHeight } = messagesContainer;

		return scrollHeight - (scrollTop + clientHeight) < threshold;
	}

	function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
		if (!messagesContainer) return;

		messagesContainer.scrollTo({
			top: messagesContainer.scrollHeight,
			behavior
		});

		showScrollButton = false;
	}

	function handleScroll() {
		showScrollButton = !isNearBottom();
	}

	$effect(() => {
		const messages = $lobbyMessagesStore;
		if (!messages?.length) return;

		const lastMessage = messages[messages.length - 1];
		const isMe = lastMessage.senderId === $userData.id;

		// Always scroll if I sent it
		if (isMe) {
			scrollToBottom();
			return;
		}

		// Otherwise only scroll if near bottom
		if (isNearBottom()) {
			scrollToBottom();
		} else {
			showScrollButton = true;
		}
	});

	onMount(() => {
		scrollToBottom('instant');
	});
</script>

<div class="drawer h-dvh w-screen bg-canvas text-ink transition-colors duration-200 lg:drawer-open">
	<input id="member-drawer" type="checkbox" class="drawer-toggle" />

	<div class="drawer-content flex h-dvh flex-col overflow-hidden lg:p-4">
		<div
			class="flex h-full w-full flex-col overflow-hidden border-hairline bg-card shadow-[0_8px_30px_rgb(0,0,0,0.02)] lg:rounded-2xl lg:border"
		>
			<header class="navbar shrink-0 border-b border-hairline bg-card px-4 py-3 select-none">
				<div class="flex w-full flex-1 justify-between gap-2">
					<label for="member-drawer" class="btn btn-square btn-ghost lg:hidden"><Menu /></label>

					<div class="flex items-center gap-3">
						<!-- Mini brand logo -->
						<div class="mr-1 hidden items-center gap-2 sm:flex">
							<span class="font-display text-xl font-extrabold text-ink">Arc</span>
							<span class="font-display text-xl font-extrabold text-primary">Lobby</span>
						</div>
					</div>

					<div class="flex items-center gap-3">
						<!-- Room Code Chip -->
						<div
							class="flex items-center gap-2 rounded-full border border-hairline bg-canvas/40 px-3 py-1 pr-1"
						>
							<span class="text-xs leading-none font-bold tracking-wider text-muted uppercase"
								>Lobby</span
							>
							<button
								onclick={copyLobbyLink}
								class="flex cursor-pointer items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-mono text-sm font-extrabold text-primary transition-all duration-200 hover:bg-primary/20 active:scale-95"
								title="Click to copy invite link"
							>
								<span>{lobbyId}</span>
								{#if copied}
									<Check size={12} class="text-success" />
								{:else}
									<Copy size={12} />
								{/if}
							</button>
						</div>
						<ThemeToggle />
					</div>
				</div>
			</header>

			<main
				bind:this={messagesContainer}
				onscroll={handleScroll}
				class="custom-scrollbar relative flex-1 space-y-4 overflow-y-auto bg-canvas/45 p-4"
			>
				{#each $lobbyMessagesStore as msg, i (i)}
					{@const isMe = msg.senderId === $userData.id}
					{@const memberData = getMemberFromId(msg.senderId)}
					<div class="chat {isMe ? 'chat-end' : 'chat-start'} gap-1">
						<div
							class="chat-header mb-1 text-xs font-bold"
							style="color: {getUserForeground(memberData?.color)};"
						>
							{memberData?.name || 'Unknown'}
							{#if isMe}
								<span class="ml-1 text-[9px] font-normal opacity-50">(You)</span>
							{/if}
						</div>

						{#if msg.type === 'text'}
							<div
								class="chat-bubble border border-black/5 px-4 py-2.5 font-sans text-sm leading-relaxed dark:border-white/5"
								style="background-color: {getUserBackground(memberData?.color)};"
							>
								{msg.content}
							</div>
						{:else if msg.type === 'game-session-invite'}
							{@const gameSession = $gameSessionsStore[msg.content as string]}
							{@const game = getLocalGameById(gameSession?.gameId)!}

							{#if gameSession && game}
								<div
									class="animate-fade-in chat-bubble rounded-2xl border border-join-border bg-join-panel p-5 text-ink shadow-md"
								>
									<!-- Ticket Header -->
									<div
										class="mb-4 flex items-center justify-between border-b border-join-border/40 pb-3 select-none"
									>
										<div class="flex items-center gap-2">
											<div
												class="flex h-6 w-6 items-center justify-center rounded-full bg-primary font-bold text-white"
											>
												<Gamepad size={14} />
											</div>
											<span class="text-[11px] font-extrabold tracking-wider text-primary uppercase"
												>Game Session</span
											>
										</div>
										<span class="text-[11px] font-bold text-muted uppercase">
											{#if gameSession.state === 'waiting'}
												Waiting
											{:else if gameSession.state === 'ongoing'}
												Ongoing
											{:else if gameSession.state === 'finished'}
												Finished
											{/if}
										</span>
									</div>

									<!-- Ticket Body -->
									<div class="flex items-start gap-4">
										<div class="shrink-0 select-none">
											<div
												class="h-16 w-16 overflow-hidden rounded-xl border border-join-border/60 bg-base-300 shadow-inner"
											>
												<img src={game.image} alt={game.name} class="h-full w-full object-cover" />
											</div>
										</div>

										<div class="min-w-0 flex-1">
											<h3
												class="truncate font-sans text-base leading-tight font-extrabold text-ink"
											>
												{game.name}
											</h3>

											<!-- Settings chips -->
											<div class="mt-2.5 flex flex-wrap gap-1.5">
												{#each Object.entries(gameSession.settings) as [key, value], i (i)}
													{@const setting = $gamesStore[gameSession.gameId].settings![key]}
													<div
														class="badge h-5 gap-1 rounded-full border-none bg-card/70 px-2.5 py-0 font-sans text-[10px] font-semibold text-ink select-none"
													>
														<span class="text-[9px] font-bold uppercase opacity-60"
															>{setting.name}:</span
														>
														<span class="max-w-15 truncate">
															{#if typeof value === 'boolean'}
																{value === true ? 'Yes' : 'No'}
															{:else}
																{Array.isArray(value) ? value.length : value}
															{/if}
														</span>
													</div>
												{/each}
											</div>
										</div>
									</div>

									<!-- Ticket Actions / Footer -->
									{#if gameSession.state === 'waiting'}
										<div class="mt-5 grid grid-cols-2 gap-3 border-t border-join-border/40 pt-4">
											<JoinGameSessionButton gameSessionId={gameSession.id} />
											<SpectateGameSessionButton gameSessionId={gameSession.id} />
										</div>
									{:else if gameSession.state === 'ongoing'}
										<div class="mt-5 grid grid-cols-1 border-t border-join-border/40 pt-4">
											<SpectateGameSessionButton gameSessionId={gameSession.id} />
										</div>
									{:else if gameSession.state === 'finished'}
										<div class="mt-5 border-t border-join-border/40 pt-4">
											{#if gameSession.winner}
												{@const winner =
													gameSession.winner === 'draw'
														? 'draw'
														: (getMemberFromId(gameSession.winner) ?? undefined)}
												<div
													class="flex items-center justify-center gap-2 rounded-xl border border-join-border/30 bg-card/40 p-3"
												>
													{#if winner === 'draw'}
														<div
															class="flex items-center gap-1.5 text-sm font-extrabold text-muted"
														>
															<span>🤝 Game Draw</span>
														</div>
													{:else if winner === undefined}
														<div
															class="flex items-center gap-1.5 text-sm font-extrabold text-muted"
														>
															<span>Game Ended</span>
														</div>
													{:else}
														<div class="scale-75">
															<UserAvatar user={winner} />
														</div>
														<div class="truncate text-sm font-extrabold">
															<span style="color: {getUserForeground(winner.color)};">
																{winner.name}
															</span>
															<span class="text-ink">Won! 🏆</span>
														</div>
													{/if}
												</div>
											{:else}
												<div
													class="rounded-lg bg-card/30 py-2 text-center text-xs font-semibold text-muted"
												>
													Game Expired
												</div>
											{/if}
										</div>
									{/if}
								</div>
							{:else}
								<div class="chat-bubble chat-bubble-error text-xs italic">
									Invite expired or game not found.
								</div>
							{/if}
						{/if}
					</div>
				{:else}
					<div
						class="h-full flex flex-col items-center gap-4 justify-center text-center p-8 select-none mx-auto my-auto opacity-70"
					>
						<div
							class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 animate-pulse"
						>
							<MessageSquareDashed size={32} />
						</div>
						<h3 class="font-sans text-lg font-extrabold text-ink">Welcome to the Lobby!</h3>
					</div>
				{/each}
			</main>

			{#if showScrollButton}
				<button
					class="btn fixed right-6 bottom-24 z-40 btn-circle h-10 min-h-0 w-10 cursor-pointer border-none p-0 shadow-xl transition-all duration-200 btn-primary hover:scale-105 active:scale-95"
					onclick={() => scrollToBottom()}
					aria-label="Scroll to bottom"
				>
					<ArrowDown size={18} />
				</button>
			{/if}

			<form
				class="flex shrink-0 gap-2 border-t border-hairline bg-card p-4"
				onsubmit={(e) => {
					e.preventDefault();
					handleSendTextMessage();
				}}
			>
				<SendGameInviteButton />
				<input
					class="h-12 flex-1 rounded-md border border-hairline bg-canvas/30 px-4 font-sans text-[16px] font-[600] text-ink placeholder-muted transition-colors focus:border-primary focus:outline-none"
					type="text"
					placeholder="Type a message..."
					bind:value={message}
				/>
				<button
					class="btn btn-square h-12 w-12 cursor-pointer rounded-md border-none transition-all duration-200 active:scale-95
					{themeState.current === 'arc-dark'
						? 'bg-accent-yellow text-[#20180A] hover:bg-[#e2b033]'
						: 'bg-primary text-white hover:bg-primary/95'}"
					type="submit"
					disabled={!message.trim()}
				>
					<Send size={18} />
				</button>
			</form>
		</div>
	</div>

	<div class="drawer-side z-50">
		<label for="member-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
		<div
			class="flex h-dvh w-72 flex-col items-center border-r border-hairline bg-card pb-4
			lg:my-4 lg:mr-0 lg:ml-4 lg:h-[calc(100dvh-2rem)] lg:rounded-2xl lg:border lg:border-hairline lg:bg-canvas/40 lg:shadow-[0_8px_30px_rgb(0,0,0,0.01)] lg:backdrop-blur-sm"
		>
			<div
				class="flex w-full items-center justify-between border-b border-hairline bg-canvas/30 p-4 select-none lg:border-b-hairline/40 lg:bg-transparent"
			>
				<h2 class="font-sans text-lg font-bold text-ink">Members</h2>
				<div class="badge rounded-full px-2 py-1 text-xs font-bold badge-primary">
					{$membersStore?.length}
				</div>
			</div>
			<ul class="custom-scrollbar flex h-full w-full flex-col gap-2 overflow-y-auto p-3">
				{#each $membersStore as member, i (i)}
					{@const isMe = member.id === $userData.id}
					<li>
						<div
							class="flex items-center gap-3 rounded-xl border border-hairline/40 bg-card/45 px-3 py-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all duration-200 hover:scale-[1.02] hover:border-hairline hover:bg-card hover:shadow-sm"
							style="color: {getUserForeground(member.color)}"
						>
							<UserAvatar user={member} />
							<span
								class="flex-1 truncate font-sans text-sm font-semibold {isMe ? 'font-bold' : ''}"
								>{member.name}</span
							>
							{#if isMe}
								<span
									class="badge rounded-md border-none bg-primary/10 px-1.5 py-0.5 badge-sm font-bold text-primary"
									>You</span
								>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
			<LeaveLobbyButton />
		</div>
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(124, 92, 252, 0.15);
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(124, 92, 252, 0.3);
	}
</style>
