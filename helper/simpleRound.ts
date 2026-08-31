export function SimpleRound(value?: number) {
	return Math.floor((value ?? 0) * 10) / 10;
}
