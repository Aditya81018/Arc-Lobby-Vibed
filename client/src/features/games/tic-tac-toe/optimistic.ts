export interface OptimisticMove {
	position: number;
}

let pendingOptimisticMove: OptimisticMove | null = null;

export function setOptimisticMove(move: OptimisticMove | null) {
	pendingOptimisticMove = move;
}

export function getOptimisticMove(): OptimisticMove | null {
	return pendingOptimisticMove;
}
