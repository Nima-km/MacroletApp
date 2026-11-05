/**
 * Which logged days count towards the intake average.
 *
 * Two rules, and the order between them matters:
 *
 *  1. **What the user said wins.** A day they explicitly include or exclude is never
 *     re-decided by a heuristic. Someone who knows they ate normally on a day the app
 *     thinks looks thin must be able to say so.
 *  2. **Under-logged days are dropped automatically** from the days they have not ruled on,
 *     because a half-logged Tuesday is not a 700 kcal Tuesday. Left in, partial days pull
 *     the average down and maintenance with it.
 *
 * A day with nothing logged is not a day of zero intake; it is a day of no data.
 */

import { IntakeDay } from "./maintenance";

export type IntakeDayState =
	| "used"
	| "excluded-manual"
	| "excluded-underlogged"
	| "excluded-empty"
	| "included-manual";

export type ClassifiedDay = IntakeDay & {
	state: IntakeDayState;
	/** True when this day contributes to the average. */
	counted: boolean;
};

export type DayOverride = "include" | "exclude";

/** A day this far below the usual is not a light day, it is an incomplete one. */
export const UNDER_LOGGED_FRACTION = 0.4;

/** Below this many candidate days there is no "usual" to compare against. */
export const MIN_DAYS_FOR_BASELINE = 4;

function median(values: number[]): number {
	if (values.length === 0) return 0;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? (sorted[mid - 1] + sorted[mid]) / 2
		: sorted[mid];
}

export function dayKey(day: Date): string {
	const year = day.getFullYear();
	const month = String(day.getMonth() + 1).padStart(2, "0");
	const date = String(day.getDate()).padStart(2, "0");
	return `${year}-${month}-${date}`;
}

/**
 * Classify a window of days.
 *
 * The baseline is built only from days the user has not excluded, so manually dropping a
 * bingeing weekend does not drag the "usual" down and start excluding ordinary days.
 */
export function classifyIntakeDays(
	days: IntakeDay[],
	overrides: Record<string, DayOverride> = {},
): ClassifiedDay[] {
	const logged = days.filter((day) => day.items > 0);

	const baselinePool = logged.filter(
		(day) => overrides[dayKey(day.day)] !== "exclude",
	);
	const baseline = median(baselinePool.map((day) => day.calories));
	const baselineItems = median(baselinePool.map((day) => day.items));
	const hasBaseline = baselinePool.length >= MIN_DAYS_FOR_BASELINE && baseline > 0;

	return days.map((day) => {
		const key = dayKey(day.day);
		const override = overrides[key];

		if (day.items === 0) {
			return { ...day, state: "excluded-empty", counted: false };
		}
		if (override === "exclude") {
			return { ...day, state: "excluded-manual", counted: false };
		}
		if (override === "include") {
			return { ...day, state: "included-manual", counted: true };
		}

		const thinCalories =
			hasBaseline && day.calories < baseline * UNDER_LOGGED_FRACTION;
		const thinItems =
			hasBaseline && baselineItems > 0 && day.items < baselineItems * UNDER_LOGGED_FRACTION;

		if (thinCalories || thinItems) {
			return { ...day, state: "excluded-underlogged", counted: false };
		}
		return { ...day, state: "used", counted: true };
	});
}
