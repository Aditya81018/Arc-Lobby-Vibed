import { writable, derived } from 'svelte/store';
import { lobbyStore, membersStore } from '../lobby/store';
import type { UserData } from '../user/store';

export interface GameSession {
	id: string;
	gameId: string;
	lobbyId: string;
	players: (string | undefined)[];
	winner: string | undefined;
	settings: Record<string, unknown>;
	data: unknown;
	state: 'waiting' | 'ongoing' | 'finished';
}

export const gameSessionsStore = writable<Record<string, GameSession>>({});
export const currentGameSessionStore = writable<GameSession | null>(null);
export const currentGameSessionPlayersStore = derived(
	[currentGameSessionStore, membersStore],
	([$session, $members]) => {
		if (!$session) return null;
		return $session.players.map((id) => {
			if (!id) return undefined;
			return $members?.find((member) => member.id === id) ?? undefined;
		});
	}
);

lobbyStore.subscribe((lobby) => {
	if (!lobby) {
		gameSessionsStore.set({});
		return;
	}
});
