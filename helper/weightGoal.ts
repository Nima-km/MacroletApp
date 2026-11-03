import { WeightGoalKind } from "@/types/weightGoal";

/**
 * When the current goal episode began.
 *
 * Changing a target weight mid-diet is the same episode, so the original start is
 * carried forward. Switching kind starts a new one. This matters beyond bookkeeping:
 * the estimator excludes the first two weeks after a goal starts, because that stretch
 * of weight loss is mostly water and glycogen — re-stamping the start on every edit
 * would exclude two more weeks each time, and the estimate would never converge.
 *
 * Pure so it can be tested without a database.
 */
export function startedAtFor(
	previous: { kind: WeightGoalKind; started_at: Date } | null | undefined,
	kind: WeightGoalKind,
	now: Date,
): Date {
	if (previous && previous.kind === kind) return previous.started_at;
	return now;
}

/** True when the goal has ended: hit, abandoned, or never set. */
export function isGoalReached(
	kind: WeightGoalKind,
	targetGrams: number,
	toleranceGrams: number | null,
	currentGrams: number,
): boolean {
	if (kind === "maintain") {
		const band = toleranceGrams ?? 0;
		return Math.abs(currentGrams - targetGrams) <= band;
	}
	if (kind === "lose") return currentGrams <= targetGrams;
	return currentGrams >= targetGrams;
}
