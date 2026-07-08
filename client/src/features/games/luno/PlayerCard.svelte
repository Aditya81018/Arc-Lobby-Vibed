<script lang="ts">
	import { userData, getUserForeground, type UserData } from '../../user/store';
	import type { LunoPlayer, LunoSession } from './types';
	import UserAvatar from '../../../components/UserAvatar.svelte';
	import { onMount } from 'svelte';

	const {
		player,
		playerData,
		session
	}: {
		player: UserData | undefined;
		playerData: LunoPlayer | undefined;
		session: LunoSession;
	} = $props();

	// Check if this player is the current active player in turnOf
	let isPlayerTurn = $derived(
		player !== undefined && session.players[session.data.turnOf] === player.id
	);

	let timeLeft = $state(0);
	let isVisible = $state(true);

	$effect(() => {
		let isLoopNeeded = () => isPlayerTurn && session.state === 'ongoing' && isVisible;

		if (!isLoopNeeded()) return;

		function animate() {
			timeLeft = Math.max(Math.fround((session.data.nextTimestamp! - Date.now()) / 1000), 0);
			if (isLoopNeeded()) requestAnimationFrame(animate);
		}

		requestAnimationFrame(animate);
	});

	onMount(() => {
		isVisible = true;
		return () => {
			isVisible = false;
		};
	});

	const cardCount = $derived(playerData?.hand?.length ?? 0);
</script>

<div
	class="flex w-fit flex-col items-center justify-center gap-0.5 p-2 {player === undefined
		? 'saturate-0'
		: 'saturate-100'}"
>
	{#if isPlayerTurn && timeLeft !== 0}
		<div
			class="radial-progress"
			style="--value:{(timeLeft / 30) * 100}; color: {getUserForeground(
				player?.color
			)}; --size: 48px; --thickness: 4px"
		>
			<UserAvatar user={player} />
		</div>
	{:else}
		<div class="my-2">
			<UserAvatar user={player} />
		</div>
	{/if}

	<div
		class="text-sm font-semibold flex items-center gap-1"
		style="color: {getUserForeground(player?.color)};"
	>
		{player?.name ?? (session.state === 'waiting' ? 'Waiting...' : 'Unknown')}
		{#if $userData.id === player?.id}
			<span class="text-xs font-bold opacity-70">(You)</span>
		{/if}
	</div>

	{#if player !== undefined && session.state !== 'waiting'}
		<div class="flex flex-col items-center">
			<span class="font-mono text-xs font-bold text-ink/50">
				{cardCount}
				{cardCount === 1 ? 'Card' : 'Cards'}
			</span>
			{#if cardCount === 1}
				<span
					class="badge badge-error badge-xs mt-0.5 animate-pulse font-extrabold text-[9px] tracking-wider uppercase"
				>
					Luno!
				</span>
			{/if}
		</div>
	{/if}
</div>
