<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { socket } from '$lib/socket';
	import { onMount } from 'svelte';
	import LoadingScreen from '../../components/LoadingScreen.svelte';
	import { joinGameSession, rematchGameSession, getGameSessionById } from './controller';
	import { gameSessionsStore, type GameSession } from './store';
	import { getMemberFromId } from '../lobby/controllers';
	import { userData, getUserForeground, getUserBackground } from '../user/store';
	import UserAvatar from '../../components/UserAvatar.svelte';
	import { themeState } from '$lib/theme.svelte';
	import { Swords, RefreshCw, Eye, ArrowRight } from '@lucide/svelte';

	const {
		session
	}: {
		session: GameSession;
	} = $props();

	interface IncomingRequest {
		newSessionId: string;
		fromPlayerId: string;
	}

	let isLoading = $state(false);
	let incomingRequest = $state<IncomingRequest | undefined>(undefined);
	let incomingSession = $derived(
		incomingRequest ? $gameSessionsStore[incomingRequest.newSessionId] : undefined
	);
	let fromPlayer = $derived(getMemberFromId(incomingRequest?.fromPlayerId ?? ''));
	let wasPlayer = $derived(session.players.includes($userData.id));

	async function handleRequestRematch() {
		isLoading = true;
		const gameSession = await rematchGameSession(session.id, $userData.id);
		const joinedSession = await joinGameSession(gameSession.id);
		if (joinedSession) {
			goto(
				resolve(
					`/${joinedSession.lobbyId}/redirect?to=${`/${joinedSession.lobbyId}/${joinedSession.id}`}`
				)
			);
			return;
		}

		if (!joinedSession) {
			isLoading = false;
		}
	}

	async function handleAcceptRematch() {
		if (!incomingRequest) return;

		try {
			isLoading = true;
			const targetSessionId = incomingRequest.newSessionId;
			incomingRequest = undefined;
			const joinedSession = await joinGameSession(targetSessionId);
			if (joinedSession) {
				goto(
					resolve(
						`/${joinedSession.lobbyId}/redirect?to=${`/${joinedSession.lobbyId}/${joinedSession.id}`}`
					)
				);
				return;
			}
			if (!joinedSession) {
				isLoading = false;
			}
		} catch {
			if (incomingRequest) {
				goto(resolve(`/${session.lobbyId}/${incomingRequest.newSessionId}`));
				incomingRequest = undefined;
			}
			isLoading = false;
		}
	}

	async function handleSpectateRematch() {
		if (!incomingSession) return;
		const targetSessionId = incomingSession.id;
		const lobbyId = incomingSession.lobbyId;
		incomingRequest = undefined;
		goto(
			resolve(
				`/${lobbyId}/redirect?to=/${lobbyId}/${targetSessionId}`
			)
		);
	}

	function goBackToLobby() {
		incomingRequest = undefined;
		goto(resolve(`/${session.lobbyId}`));
	}

	onMount(() => {
		async function handleRematchRequest(newSessionId: string, fromPlayerId: string) {
			incomingRequest = {
				newSessionId,
				fromPlayerId
			};
			try {
				const sessionData = await getGameSessionById(newSessionId);
				if (sessionData) {
					gameSessionsStore.update((store) => {
						store[newSessionId] = sessionData;
						return store;
					});
				}
			} catch (err) {
				console.error('Failed to fetch rematch session:', err);
			}
		}
		socket.on('rematch', handleRematchRequest);
		return () => {
			socket.off('rematch', handleRematchRequest);
		};
	});
</script>

{#if isLoading}
	<LoadingScreen />
{/if}

{#if incomingRequest !== undefined}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-all duration-300"
	>
		<!-- Modal Card -->
		<div
			class="animate-scaleUp relative flex w-full max-w-[380px] flex-col items-center gap-6 rounded-xl border border-hairline bg-card p-6 text-center shadow-2xl overflow-hidden select-none sm:p-8"
		>
			<!-- Header -->
			<div class="flex flex-col items-center gap-2 mt-2">
				<div
					class="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary shadow-inner"
				>
					<Swords size={28} />
				</div>
				<h2 class="font-sans text-xl font-[800] tracking-tight text-ink mt-2">
					{wasPlayer ? 'Rematch Challenge!' : 'New Match Starting!'}
				</h2>
				<p class="font-sans text-[13px] leading-normal font-medium text-body px-2">
					{wasPlayer
						? 'A new round is ready to begin. Do you accept the challenge?'
						: 'A rematch has been requested. Would you like to spectate?'}
				</p>
			</div>

			<!-- Challenger Block -->
			<div
				class="w-full flex flex-col gap-3 rounded-lg border border-hairline bg-canvas/30 p-4 relative overflow-hidden"
			>
				<div class="flex items-center gap-3">
					<div class="relative">
						<UserAvatar user={fromPlayer!} />
						<!-- Active indicator dot -->
						<span
							class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success"
						></span>
					</div>
					<div class="flex flex-col items-start gap-0.5">
						<span class="font-sans text-[10px] font-[700] tracking-[0.3px] text-muted uppercase"
							>Challenger</span
						>
						<span
							class="font-sans text-[15px] font-[800] leading-tight"
							style="color: {getUserForeground(fromPlayer?.color)}"
						>
							{fromPlayer?.name ?? 'Unknown'}
						</span>
					</div>
				</div>

				<!-- Dynamic Session Status Bar -->
				<div
					class="mt-1 flex items-center justify-between border-t border-hairline/60 pt-2 text-[12px] font-sans"
				>
					<span class="text-body font-medium">Session Status:</span>
					<div class="flex items-center gap-1.5 font-bold">
						{#if incomingSession?.state === 'waiting'}
							<span class="h-2 w-2 rounded-full bg-secondary animate-ping"></span>
							<span class="text-secondary font-bold">Waiting for players...</span>
						{:else if incomingSession?.state === 'ongoing'}
							<span class="h-2 w-2 rounded-full bg-info"></span>
							<span class="text-info font-bold">Ongoing (started)</span>
						{:else if incomingSession?.state === 'finished'}
							<span class="h-2 w-2 rounded-full bg-muted"></span>
							<span class="text-muted font-bold">Finished</span>
						{:else}
							<span class="h-2 w-2 rounded-full bg-secondary animate-pulse"></span>
							<span class="text-secondary font-bold">Connecting...</span>
						{/if}
					</div>
				</div>
			</div>

			<!-- Button Row -->
			<div class="flex w-full gap-3 mt-2">
				{#if incomingSession?.state === 'waiting'}
					{#if wasPlayer}
						<div class="flex flex-col w-full gap-3">
							<button
								class="flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 font-sans text-[14px] font-[700] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md
								{themeState.current === 'arc-dark'
									? 'bg-accent-yellow text-[#20180a] hover:bg-[#e2b033]'
									: 'bg-[#171321] text-white hover:bg-[#251e36]'}"
								onclick={handleAcceptRematch}
							>
								Accept Challenge <ArrowRight size={15} />
							</button>
							<div class="flex w-full gap-3">
								<button
									class="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-hairline bg-card px-4 font-sans text-[14px] font-[700] text-body transition-all hover:bg-base-300 hover:text-ink active:scale-95 cursor-pointer"
									onclick={goBackToLobby}
								>
									Decline
								</button>
								<button
									class="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-hairline bg-card px-4 font-sans text-[14px] font-[700] text-body transition-all hover:bg-base-300 hover:text-ink active:scale-95 cursor-pointer"
									onclick={handleSpectateRematch}
								>
									Spectate <Eye size={15} />
								</button>
							</div>
						</div>
					{:else}
						<div class="flex flex-col w-full gap-3">
							<button
								class="flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 font-sans text-[14px] font-[700] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md
								{themeState.current === 'arc-dark'
									? 'bg-primary text-white hover:bg-opacity-90'
									: 'bg-[#171321] text-white hover:bg-[#251e36]'}"
								onclick={handleSpectateRematch}
							>
								Spectate <Eye size={15} />
							</button>
							<button
								class="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-hairline bg-card px-4 font-sans text-[14px] font-[700] text-body transition-all hover:bg-base-300 hover:text-ink active:scale-95 cursor-pointer"
								onclick={goBackToLobby}
							>
								Decline
							</button>
						</div>
					{/if}
				{:else if incomingSession?.state === 'ongoing'}
					<button
						class="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-hairline bg-card px-4 font-sans text-[14px] font-[700] text-body transition-all hover:bg-base-300 hover:text-ink active:scale-95 cursor-pointer"
						onclick={goBackToLobby}
					>
						Decline
					</button>
					<button
						class="flex h-11 flex-1 items-center justify-center gap-2 rounded-md px-4 font-sans text-[14px] font-[700] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md
						{themeState.current === 'arc-dark'
							? 'bg-primary text-white hover:bg-opacity-90'
							: 'bg-[#171321] text-white hover:bg-[#251e36]'}"
						onclick={handleSpectateRematch}
					>
						Spectate <Eye size={15} />
					</button>
				{:else}
					<!-- Finished / Back To Lobby or undefined fallback -->
					<button
						class="flex h-11 w-full items-center justify-center gap-2 rounded-md px-4 font-sans text-[14px] font-[700] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md
						{themeState.current === 'arc-dark'
							? 'bg-primary text-white hover:bg-opacity-90'
							: 'bg-[#171321] text-white hover:bg-[#251e36]'}"
						onclick={goBackToLobby}
					>
						Back to Lobby <ArrowRight size={15} />
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<button
	class="btn btn-secondary hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
	onclick={handleRequestRematch}
>
	<RefreshCw size={15} class={isLoading ? 'animate-spin' : ''} />
	Rematch
</button>

<style>
	@keyframes scaleUp {
		0% {
			transform: scale(0.92) translateY(12px);
			opacity: 0;
		}
		100% {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}

	.animate-scaleUp {
		animation: scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
	}
</style>
