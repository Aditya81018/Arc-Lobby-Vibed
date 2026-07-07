import type { GameSession } from '../../game-sessions/store';

export interface Card {
	color: string;
	value: string;
}

export interface DiscardedCard {
	color: string;
	value: string;
	id: string;
	rotate: number;
	x: number;
	y: number;
	zIndex: number;
}

export interface LunoPlayer {
	id: string;
	hand: Card[];
}

export interface LunoData {
	turnOf: number;
	direction: 1 | -1;
	playersData: LunoPlayer[];
	discardPile: DiscardedCard[];
	drawPileCount: number;
	nextTimestamp: number | undefined;
	message: string;
}

export interface LunoSession extends GameSession {
	data: LunoData;
}
