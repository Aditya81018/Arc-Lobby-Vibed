<script lang="ts">
	import { Sun, Moon } from '@lucide/svelte';
	import { themeState, toggleTheme } from '$lib/theme.svelte';
</script>

<button
	class="btn btn-circle btn-ghost hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-200"
	onclick={toggleTheme}
	aria-label="Toggle light and dark mode"
>
	<div class="swap swap-rotate pointer-events-none active:scale-95 transition-transform">
		<input type="checkbox" checked={themeState.current === 'arc-dark'} readonly />
		<!-- Sun icon (shown in dark mode to switch to light) -->
		<Sun class="swap-on h-6 w-6 text-accent-yellow" />
		<!-- Moon icon (shown in light mode to switch to dark) -->
		<Moon class="swap-off h-6 w-6 text-primary" />
	</div>
</button>
