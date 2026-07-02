<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	import { page } from '$app/state';

	let { gameSessionId } = $props();
	const lobbyId = page.params.lobbyId!;
</script>

<button
	onclick={() => {
		goto(resolve(`/${lobbyId}/${gameSessionId}`));
	}}
	class="btn h-10 w-full rounded-md font-sans text-xs font-bold transition-all duration-200 border border-hairline bg-card text-ink hover:bg-base-300 btn-ghost active:scale-95 cursor-pointer"
>
	Spectate
</button>
