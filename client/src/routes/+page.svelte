<script lang="ts">
	import CreateLobbyButton from '../features/lobby/CreateLobbyButton.svelte';
	import JoinLobbyButton from '../features/lobby/JoinLobbyButton.svelte';
	import UsernameInput from '../features/user/UsernameInput.svelte';
	import ThemeToggle from '../components/ThemeToggle.svelte';
</script>

<div class="relative flex h-svh w-screen flex-col items-center justify-center gap-4">
	<div class="absolute top-4 right-4 z-50">
		<ThemeToggle />
	</div>

	<h1 class="text-4xl font-medium font-display">Arc Lobby</h1>
	<UsernameInput />
	<div class="flex gap-2">
		<CreateLobbyButton />
		<JoinLobbyButton />
	</div>
</div>
