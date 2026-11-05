/**
 * The anthropometric profile.
 *
 * These four fields exist for exactly one job: a starting estimate of maintenance energy
 * before the app has enough weigh-ins and food logs to derive it. Once the data is
 * confident, the profile stops contributing — it is a prior, not a fact. Individual
 * variation (metabolism, NEAT, absorption, logging error) dominates any formula, which is
 * why the app re-estimates from measurements rather than trusting this.
 */

export type Sex = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "very" | "extra";

/** Multipliers applied to BMR. Deliberately the conventional set, quoted as such. */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
	sedentary: 1.2,
	light: 1.375,
	moderate: 1.55,
	very: 1.725,
	extra: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
	sedentary: "Sedentary — desk work, little exercise",
	light: "Light — exercise 1–3 days a week",
	moderate: "Moderate — exercise 3–5 days a week",
	very: "Very active — exercise 6–7 days a week",
	extra: "Extra active — physical job or twice-daily training",
};

export type BodyProfile = {
	heightCm: number;
	birthYear: number;
	sex: Sex;
	activity: ActivityLevel;
};

export const PROFILE_BOUNDS = {
	heightCm: { min: 120, max: 250 },
	birthYear: { min: 1900, max: 2012 },
} as const;

/** Age from a birth year. A year is granular enough for BMR, and never goes stale. */
export function ageFromBirthYear(birthYear: number, now: Date): number {
	const years = now.getFullYear() - birthYear;
	return Math.max(13, Math.min(120, years));
}

/** Mifflin-St Jeor. Weight in kilograms, height in centimetres. */
export function bmrMifflin(
	kg: number,
	heightCm: number,
	age: number,
	sex: Sex,
): number {
	const base = 10 * kg + 6.25 * heightCm - 5 * age;
	return sex === "male" ? base + 5 : base - 161;
}

/**
 * Maintenance from the profile alone, in kcal/day.
 *
 * Returns null unless all four fields are present and plausible — a half-filled profile
 * silently producing a wrong number is worse than showing nothing.
 */
export function maintenancePrior(
	profile: BodyProfile | null | undefined,
	kg: number,
	now: Date,
): number | null {
	if (!profile) return null;
	if (!isProfileComplete(profile)) return null;
	if (!Number.isFinite(kg) || kg <= 0) return null;

	const age = ageFromBirthYear(profile.birthYear, now);
	const bmr = bmrMifflin(kg, profile.heightCm, age, profile.sex);
	return Math.round(bmr * ACTIVITY_FACTORS[profile.activity]);
}

export function isProfileComplete(
	profile: Partial<BodyProfile> | null | undefined,
): profile is BodyProfile {
	if (!profile) return false;
	const { heightCm, birthYear, sex, activity } = profile;
	if (typeof heightCm !== "number" || typeof birthYear !== "number") return false;
	if (sex !== "male" && sex !== "female") return false;
	if (!activity || !(activity in ACTIVITY_FACTORS)) return false;
	return (
		heightCm >= PROFILE_BOUNDS.heightCm.min &&
		heightCm <= PROFILE_BOUNDS.heightCm.max &&
		birthYear >= PROFILE_BOUNDS.birthYear.min &&
		birthYear <= PROFILE_BOUNDS.birthYear.max
	);
}
