<script lang="ts">
	import { LogOut } from '@lucide/svelte';
	import { resolve } from '$app/paths';
</script>

<a
	class="btn btn-wide h-11 rounded-md font-sans text-sm font-bold border-none transition-all duration-200 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 active:scale-95 flex items-center justify-center gap-2 mt-auto"
	href={resolve(`/`)}
>
	<LogOut size={16} />
	<span>Leave Lobby</span>
</a>
