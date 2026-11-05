/**
 * Macro profiles: what macros a given calorie target corresponds to.
 *
 * A profile is a set of **checkpoints** of `(calories, protein, fat)`. Carbohydrate is never
 * stored — it is derived:
 *
 *     carbs = (calories − 4·protein − 9·fat) / 4
 *
 * Three typed numbers instead of four, and the checkpoint is consistent by construction: a
 * user cannot enter macros that disagree with their own calorie target, which is exactly
 * what happened when all four were fields (recomputing calories from three inputs and hoping
 * the fourth matched).
 *
 * **The profile is a pure mapping, like a fan curve.** It takes calories and returns the
 * macros that hit them. It has no opinion about whether the calorie target is sensible —
 * *"the clamp is set by the maintenance algorithm, not the macro profile"*. A 900 kcal
 * target gets a 900 kcal answer; refusing it is the guardrail's job, not the curve's.
 *
 *  - **Below the lowest checkpoint it interpolates**, so a profile anchored at
 *    `(0, 0, 0, 0)` is defined all the way down and nothing needs a special case.
 *  - **Above the highest checkpoint it holds**, the way a fan stops at full speed. Numbers
 *    past the top of a hand-built curve would be invented rather than mapped.
 *  - **Validate, don't correct.** An impossible checkpoint is rejected at entry rather than
 *    silently repaired into something the user did not ask for.
 */

export type MacroCheckpoint = {
	calories: number;
	protein: number;
	fat: number;
};

export type MacroTargets = {
	calories: number;
	protein: number;
	fat: number;
	carbs: number;
	/**
	 * `above` when the request exceeded the top checkpoint and was held there. There is no
	 * `below`: the curve interpolates down to its lowest checkpoint, which a profile
	 * anchored at zero carries all the way to zero.
	 */
	clamped: "none" | "above";
};

export const MACRO_BOUNDS = {
	calories: { min: 800, max: 6000 },
	protein: { min: 0, max: 500 },
	fat: { min: 0, max: 400 },
} as const;

/** Fat floor as a share of calories — below this a checkpoint is not a diet, it is a typo. */
export const MIN_FAT_SHARE = 0.2;

/** Protein floor as a share of calories, when bodyweight is unknown. */
export const MIN_PROTEIN_SHARE = 0.15;

/** Protein floor by bodyweight, when it is known (g per kg). */
export const MIN_PROTEIN_PER_KG = 1.4;

/** Carbs a checkpoint would produce. Negative means the checkpoint is impossible. */
export function deriveCarbs(checkpoint: MacroCheckpoint): number {
	return (checkpoint.calories - 4 * checkpoint.protein - 9 * checkpoint.fat) / 4;
}

export function deriveTargets(
	calories: number,
	protein: number,
	fat: number,
	clamped: MacroTargets["clamped"] = "none",
): MacroTargets {
	// Round the typed macros first, then derive carbs from the rounded values. Deriving from
	// the unrounded ones lets two roundings compound and the three numbers stop adding up to
	// the calorie target, which is the one thing a macro profile must always do.
	const roundedProtein = Math.round(protein);
	const roundedFat = Math.round(fat);
	return {
		calories: Math.round(calories),
		protein: roundedProtein,
		fat: roundedFat,
		carbs: Math.round((calories - 4 * roundedProtein - 9 * roundedFat) / 4),
		clamped,
	};
}

export type CheckpointProblem = { field: keyof MacroCheckpoint | "carbs"; message: string };

/**
 * Everything wrong with one checkpoint.
 *
 * Returned as a list so a form can show every problem at once rather than one per attempt.
 */
export function validateCheckpoint(
	checkpoint: MacroCheckpoint,
	weightKg?: number | null,
): CheckpointProblem[] {
	const problems: CheckpointProblem[] = [];

	// A checkpoint at zero is the curve's origin, not a diet: `(0, 0, 0, 0)` is what makes
	// the mapping defined at every calorie level without a clamp. It is exempt from the
	// minimum, and only valid when the macros are zero too.
	const isOrigin =
		checkpoint.calories === 0 &&
		checkpoint.protein === 0 &&
		checkpoint.fat === 0;

	if (
		!Number.isFinite(checkpoint.calories) ||
		checkpoint.calories < 0 ||
		(!isOrigin && checkpoint.calories < MACRO_BOUNDS.calories.min) ||
		checkpoint.calories > MACRO_BOUNDS.calories.max
	) {
		problems.push({
			field: "calories",
			message: `Calories must be between ${MACRO_BOUNDS.calories.min} and ${MACRO_BOUNDS.calories.max}.`,
		});
	}
	if (!Number.isFinite(checkpoint.protein) || checkpoint.protein < 0) {
		problems.push({ field: "protein", message: "Protein cannot be negative." });
	}
	if (!Number.isFinite(checkpoint.fat) || checkpoint.fat < 0) {
		problems.push({ field: "fat", message: "Fat cannot be negative." });
	}

	const carbs = deriveCarbs(checkpoint);
	if (carbs < 0) {
		problems.push({
			field: "carbs",
			message: "Protein and fat already exceed the calories — lower one of them.",
		});
	}

	const fatFloor = (checkpoint.calories * MIN_FAT_SHARE) / 9;
	if (checkpoint.fat > 0 && checkpoint.fat < fatFloor) {
		problems.push({
			field: "fat",
			message: `Below ${Math.round(fatFloor)} g of fat at this calorie level.`,
		});
	}

	const proteinFloor =
		weightKg && weightKg > 0
			? MIN_PROTEIN_PER_KG * weightKg
			: (checkpoint.calories * MIN_PROTEIN_SHARE) / 4;
	if (checkpoint.protein > 0 && checkpoint.protein < proteinFloor) {
		problems.push({
			field: "protein",
			message: `Below ${Math.round(proteinFloor)} g of protein at this calorie level.`,
		});
	}

	return problems;
}

export type ProfileProblem = { calories: number; problems: CheckpointProblem[] };

/** Validates the whole curve: each checkpoint, and that calories strictly ascend. */
export function validateProfile(
	checkpoints: MacroCheckpoint[],
	weightKg?: number | null,
): { ok: boolean; problems: ProfileProblem[]; error?: string } {
	if (checkpoints.length === 0) {
		return { ok: false, problems: [], error: "Add at least one checkpoint." };
	}

	const problems: ProfileProblem[] = checkpoints.map((checkpoint) => ({
		calories: checkpoint.calories,
		problems: validateCheckpoint(checkpoint, weightKg),
	}));

	const sorted = [...checkpoints].sort((a, b) => a.calories - b.calories);
	const duplicates = sorted.some(
		(checkpoint, index) => index > 0 && checkpoint.calories === sorted[index - 1].calories,
	);

	const ok =
		problems.every((entry) => entry.problems.length === 0) && !duplicates;

	return {
		ok,
		problems,
		error: duplicates ? "Two checkpoints have the same calories." : undefined,
	};
}

/**
 * The macros for a calorie target.
 *
 * Linear between neighbours, nearest checkpoint outside the range, and never an exception.
 */
export function interpolateProfile(
	checkpoints: MacroCheckpoint[],
	calories: number,
): MacroTargets | null {
	if (checkpoints.length === 0) return null;

	const sorted = [...checkpoints].sort((a, b) => a.calories - b.calories);
	const first = sorted[0];
	const last = sorted[sorted.length - 1];

	if (calories <= first.calories) {
		// The lowest checkpoint is reached; there is nothing below it to interpolate to.
		return deriveTargets(first.calories, first.protein, first.fat);
	}
	if (calories >= last.calories) {
		return deriveTargets(
			last.calories,
			last.protein,
			last.fat,
			calories > last.calories ? "above" : "none",
		);
	}

	for (let index = 0; index < sorted.length - 1; index++) {
		const low = sorted[index];
		const high = sorted[index + 1];
		if (calories >= low.calories && calories <= high.calories) {
			const span = high.calories - low.calories || 1;
			const t = (calories - low.calories) / span;
			const protein = low.protein + (high.protein - low.protein) * t;
			const fat = low.fat + (high.fat - low.fat) * t;
			return deriveTargets(calories, protein, fat);
		}
	}

	return deriveTargets(last.calories, last.protein, last.fat);
}

/**
 * A sensible checkpoint so nobody starts from an empty form.
 *
 * Protein by bodyweight when it is known, fat at 28 % of calories, carbohydrate as the
 * remainder — the conventional split, offered as a starting point rather than a rule.
 */
export function suggestCheckpoint(
	calories: number,
	weightKg?: number | null,
): MacroCheckpoint {
	const protein = weightKg && weightKg > 0 ? Math.round(1.8 * weightKg) : Math.round((calories * 0.3) / 4);
	const fat = Math.round((calories * 0.28) / 9);

	// Keep the suggestion valid even for a very low calorie level.
	const maxProtein = Math.floor((calories - 9 * fat) / 4);
	return {
		calories: Math.round(calories),
		protein: Math.max(0, Math.min(protein, maxProtein)),
		fat,
	};
}

/**
 * Points to draw the profile's curve.
 *
 * The shape is a fan: everything leaves the origin, protein stays roughly flat, fat climbs
 * gently and carbohydrate climbs steeply. Sampled rather than derived so the chart and the
 * numbers above it can never disagree — both go through `interpolateProfile`.
 */
export function sampleProfile(
	checkpoints: MacroCheckpoint[],
	from: number,
	to: number,
	steps = 40,
): MacroTargets[] {
	if (checkpoints.length === 0 || steps < 2) return [];
	const low = Math.min(from, to);
	const high = Math.max(from, to);
	if (!(high > low)) return [];

	const out: MacroTargets[] = [];
	for (let index = 0; index < steps; index++) {
		const calories = low + ((high - low) * index) / (steps - 1);
		const targets = interpolateProfile(checkpoints, calories);
		if (targets) out.push(targets);
	}
	return out;
}

/**
 * The calorie range a profile itself covers.
 *
 * The origin checkpoint is excluded: a range of "0–2,650 kcal" is technically true and
 * useless in a label. If a profile is *only* an origin, there is no range to show.
 */
export function profileRange(checkpoints: MacroCheckpoint[]): { from: number; to: number } {
	const calories = checkpoints
		.map((checkpoint) => checkpoint.calories)
		.filter((calories) => calories > 0)
		.sort((a, b) => a - b);
	if (calories.length === 0) return { from: 0, to: 0 };
	return { from: calories[0], to: calories[calories.length - 1] };
}
