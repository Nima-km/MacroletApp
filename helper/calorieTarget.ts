/**
 * Turning maintenance into a calorie target.
 *
 * The order matters more than the arithmetic. This module goes
 *
 *     safe intake range -> rate of change -> projected date
 *
 * and never the reverse. Deriving intake from a target date is how apps end up telling
 * someone who is "behind schedule" to eat 900 kcal: the date is an instruction they cannot
 * satisfy, so the number gets punished until they do. Here the intake is always inside a
 * safe band, and being behind schedule simply moves the projected date later.
 */

import { maxWeeklyMove, nextCalorieGoal, ConfidenceTier } from "./maintenance";

export type GoalKind = "lose" | "gain" | "maintain";

/** 7,700 kcal per kg, per week. */
const KCAL_PER_KG_WEEK = 7700;

/** Never below this, whatever the maths says. */
export const ABSOLUTE_FLOOR = 1200;

/** Deficit ceiling: 25 % of maintenance. */
const DEFICIT_PERCENT = 0.25;

/** Rate ceilings, as a fraction of bodyweight per week. */
const DEFICIT_RATE = 0.01;
const SURPLUS_RATE = 0.005;

/** Default pace when there is no target date to aim at. */
const DEFAULT_DEFICIT_RATE = 0.005;
const DEFAULT_SURPLUS_RATE = 0.0025;

export type SafeTarget = {
	target: number;
	maintenance: number;
	/** Resulting rate, kg per week, after clamping. Negative means losing. */
	rateKgPerWeek: number;
	/** The safe intake range at this bodyweight. */
	min: number;
	max: number;
	/** What bound the number, so the UI can say why. */
	clamped: "none" | "deficit-cap" | "floor" | "surplus-cap";
};

export type SafeTargetInput = {
	maintenance: number;
	weightKg: number;
	/** Estimated BMR, if known — the hard floor. */
	bmr?: number | null;
	kind: GoalKind;
	/** Current weight goal, used to derive a pace when a date exists. */
	targetWeightKg?: number | null;
	targetDate?: Date | null;
	now: Date;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The planned rate, kg per week (negative = losing).
 *
 * With a target date, the rate needed is taken as the wish and then clamped into the safe
 * band — so an impossible date produces the fastest *safe* rate, not a crash diet.
 */
function plannedRate(input: SafeTargetInput): number {
	const { kind, weightKg, targetWeightKg, targetDate, now } = input;
	if (kind === "maintain") return 0;

	const sign = kind === "lose" ? -1 : 1;
	const defaultRate = kind === "lose" ? DEFAULT_DEFICIT_RATE : DEFAULT_SURPLUS_RATE;

	if (
		!targetDate ||
		!targetWeightKg ||
		Number.isNaN(targetDate.getTime()) ||
		targetDate.getTime() <= now.getTime()
	) {
		return sign * defaultRate * weightKg;
	}

	const weeks = (targetDate.getTime() - now.getTime()) / (7 * DAY_MS);
	if (!(weeks > 0)) return sign * defaultRate * weightKg;

	const needed = (targetWeightKg - weightKg) / weeks;
	// A goal that points the wrong way still produces a rate in the intended direction.
	const wanted = Math.abs(needed);
	return sign * (wanted > 0 ? wanted : defaultRate * weightKg);
}

export function safeTarget(input: SafeTargetInput): SafeTarget {
	const { maintenance, weightKg, kind } = input;

	if (kind === "maintain") {
		const min = Math.max(ABSOLUTE_FLOOR, Math.round(maintenance * (1 - DEFICIT_PERCENT)));
		return {
			target: Math.round(maintenance),
			maintenance,
			rateKgPerWeek: 0,
			min,
			max: Math.round(maintenance * 1.15),
			clamped: "none",
		};
	}

	const losing = kind === "lose";
	const sign = losing ? -1 : 1;

	// Rate ceiling, whichever binds first: the percentage of bodyweight or the deficit as a
	// share of maintenance.
	const rateCeiling = losing ? DEFICIT_RATE * weightKg : SURPLUS_RATE * weightKg;
	const kcalCeiling = losing
		? maintenance * DEFICIT_PERCENT
		: maintenance * 0.15;
	const kcalRateCeiling = kcalCeiling / (KCAL_PER_KG_WEEK / 7);

	let rate = plannedRate(input);
	let clamped: SafeTarget["clamped"] = "none";

	const allowedRate = Math.min(rateCeiling, kcalRateCeiling);
	if (Math.abs(rate) > allowedRate) {
		rate = sign * allowedRate;
		clamped = losing ? "deficit-cap" : "surplus-cap";
	}

	let target = maintenance + sign * Math.abs(rate) * (KCAL_PER_KG_WEEK / 7);

	// Floors: an absolute one, and never below estimated BMR.
	const floor = Math.max(ABSOLUTE_FLOOR, input.bmr ?? 0);
	if (target < floor) {
		target = floor;
		clamped = "floor";
		if (maintenance > 0) {
			rate = (-(maintenance - floor) / (KCAL_PER_KG_WEEK / 7)) * 1;
		}
	}

	const min = Math.max(floor, Math.round(maintenance * (1 - DEFICIT_PERCENT)));
	const max = Math.round(maintenance * (losing ? 1.05 : 1.15));

	return {
		target: Math.round(target),
		maintenance,
		rateKgPerWeek: Number(rate.toFixed(3)),
		min,
		max,
		clamped,
	};
}

/**
 * The target for this week.
 *
 * The estimate may move a lot; what someone eats from should move at most by the weekly
 * cap. Returns the number to store and whether anything changed.
 */
export function weeklyTarget(
	current: number,
	safe: SafeTarget,
	daysIntoEpisode: number,
	tier: ConfidenceTier,
): { target: number; changed: boolean; cap: number } {
	const next = nextCalorieGoal(current, safe.target, daysIntoEpisode, tier);
	return { target: next, changed: next !== current, cap: maxWeeklyMove(daysIntoEpisode, tier) };
}

/** Where the current rate puts the goal weight. Information, not an instruction. */
export function projectedDate(
	weightKg: number,
	targetWeightKg: number,
	rateKgPerWeek: number,
	now: Date,
): Date | null {
	if (!rateKgPerWeek || Math.abs(rateKgPerWeek) < 1e-6) return null;
	const weeks = (targetWeightKg - weightKg) / rateKgPerWeek;
	if (!Number.isFinite(weeks) || weeks <= 0 || weeks > 520) return null;
	return new Date(now.getTime() + weeks * 7 * DAY_MS);
}
