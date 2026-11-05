/**
 * Generated macro profiles.
 *
 * A preset is not a stored formula — it is a snapshot built from the user's body when they
 * add it, because a profile that silently rewrites itself every week cannot be edited. The
 * "refresh" action rebuilds it on request instead.
 *
 * The shape is the one worked out by hand: an origin, a low checkpoint at the minimum fat
 * and carbohydrate, and a high checkpoint at the maximum of both, with protein held flat.
 */

import { MacroCheckpoint } from "./macroProfile";

export type PresetKey = "balanced" | "fatLoss" | "muscleGain" | "endurance";

export const PRESET_ORDER: PresetKey[] = [
	"balanced",
	"fatLoss",
	"muscleGain",
	"endurance",
];

export const PRESET_LABELS: Record<PresetKey, string> = {
	balanced: "Balanced",
	fatLoss: "Fat loss",
	muscleGain: "Muscle gain",
	endurance: "Endurance",
};

type PresetRule = {
	/** Grams of protein per pound of effective bodyweight. */
	proteinPerLb: number;
	/** Grams of fat per pound, at the low and high ends of the curve. */
	fatPerLbLow: number;
	fatPerLbHigh: number;
};

/**
 * Protein and fat needs scale with body mass, but not without limit: at 300 lb the
 * straightforward 1 g/lb would prescribe 300 g of protein, which is expensive and no
 * better. The effective weight is therefore capped by height rather than by a flat 220 lb,
 * so a 250 lb person at 5'2" is corrected more than 250 lb at 6'4".
 */
const PRESET_RULES: Record<PresetKey, PresetRule> = {
	balanced: { proteinPerLb: 0.8, fatPerLbLow: 0.26, fatPerLbHigh: 0.39 },
	fatLoss: { proteinPerLb: 1.0, fatPerLbLow: 0.22, fatPerLbHigh: 0.33 },
	muscleGain: { proteinPerLb: 0.9, fatPerLbLow: 0.26, fatPerLbHigh: 0.5 },
	endurance: { proteinPerLb: 0.7, fatPerLbLow: 0.2, fatPerLbHigh: 0.3 },
};

/** Carbohydrate anchors, which set the two calorie ends of a generated curve. */
const CARBS_FLOOR_G = 100;
const CARBS_CEILING_G = 300;

/** The cap is the weight at this BMI, so it moves with height. */
const CAP_BMI = 35;

/** Sanity rails, so an extreme frame cannot produce an absurd cap. */
const CAP_MIN_LB = 150;
const CAP_MAX_LB = 320;

/**
 * The bodyweight a preset should be computed from.
 *
 * Above the cap the extra mass is treated as not requiring more protein or fat — the same
 * intent as the original flat 220 lb, expressed in a way that respects height.
 */
export function effectiveWeightLb(weightLb: number, heightCm: number): number {
	if (!Number.isFinite(weightLb) || weightLb <= 0) return 0;
	if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250) {
		// No usable height: fall back to the old flat cap rather than skipping the limit.
		return Math.min(weightLb, 220);
	}
	const metres = heightCm / 100;
	const capLb = Math.min(
		CAP_MAX_LB,
		Math.max(CAP_MIN_LB, (CAP_BMI * metres * metres * 2.2046226)),
	);
	return Math.min(weightLb, capLb);
}

/** Two checkpoints plus the origin, in the shape the worked example used. */
export function presetCheckpoints(
	preset: PresetKey,
	weightLb: number,
	heightCm: number,
): MacroCheckpoint[] {
	const effective = effectiveWeightLb(weightLb, heightCm);
	if (effective <= 0) return [];

	const rule = PRESET_RULES[preset];
	const protein = Math.round(rule.proteinPerLb * effective);
	const fatLow = Math.round(rule.fatPerLbLow * effective);
	const fatHigh = Math.round(rule.fatPerLbHigh * effective);

	const lowCalories = 4 * protein + 4 * CARBS_FLOOR_G + 9 * fatLow;
	const highCalories = 4 * protein + 4 * CARBS_CEILING_G + 9 * fatHigh;

	return [
		{ calories: 0, protein: 0, fat: 0 },
		{ calories: lowCalories, protein, fat: fatLow },
		{ calories: Math.max(highCalories, lowCalories + 1), protein, fat: fatHigh },
	];
}
