/**
 * When an adaptive goal updates, and what happens to its macros.
 *
 * Kept separate from the hook because both rules are decisions about behaviour, not
 * plumbing: a cadence and a scaling rule that either feel trustworthy or don't.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Weekly, on the same weekday it last updated — never mid-day, never twice. */
export const ADAPTIVE_INTERVAL_DAYS = 7;

export function isUpdateDue(lastUpdated: Date | string, now: Date): boolean {
	const last = typeof lastUpdated === "string" ? new Date(lastUpdated) : lastUpdated;
	if (Number.isNaN(last.getTime())) return false;
	return now.getTime() - last.getTime() >= ADAPTIVE_INTERVAL_DAYS * DAY_MS;
}

export type MacroSet = { calories: number; protein: number; fat: number; carbs: number };

/**
 * Move the macros with the calories, keeping the split.
 *
 * An adaptive target that changed the calories but left protein at its old gram value would
 * quietly rewrite the macro split every week. Scaling preserves the ratios the user chose;
 * the caller may still override any of them by hand.
 */
export function scaleMacros(current: MacroSet, nextCalories: number): MacroSet {
	if (current.calories <= 0) {
		return { ...current, calories: nextCalories };
	}
	const factor = nextCalories / current.calories;
	const scale = (value: number) => Math.max(0, Math.round(value * factor));
	return {
		calories: Math.round(nextCalories),
		protein: scale(current.protein),
		fat: scale(current.fat),
		carbs: scale(current.carbs),
	};
}

/** "2,610 → 2,570" — the changelog line the doc asks for. */
export function changeLine(
	fromCalories: number,
	toCalories: number,
	fromMaintenance: number | null,
	toMaintenance: number,
): string {
	const delta = toCalories - fromCalories;
	const direction = delta === 0 ? "unchanged" : delta > 0 ? `+${delta}` : `${delta}`;
	const maintenance =
		fromMaintenance === null
			? `maintenance ${toMaintenance}`
			: `maintenance ${fromMaintenance} → ${toMaintenance}`;
	return `target ${fromCalories} → ${toCalories} (${direction}) · ${maintenance}`;
}
