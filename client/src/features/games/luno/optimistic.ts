export interface OptimisticPlay {
	color: string;
	value: string;
	id: string;
	rotate: number;
	x: number;
	y: number;
}

let pendingOptimisticPlay: OptimisticPlay | null = null;

export function setOptimisticPlay(play: OptimisticPlay | null) {
	pendingOptimisticPlay = play;
}

export function getOptimisticPlay(): OptimisticPlay | null {
	return pendingOptimisticPlay;
}
