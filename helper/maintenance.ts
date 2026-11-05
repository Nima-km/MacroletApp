/**
 * Maintenance calorie estimate.
 *
 * The idea is energy balance: what you ate, minus what the weight change says you burned.
 * The hard parts are not the arithmetic but which data to trust, how much, and what to say
 * when the answer is not trustworthy yet. This module is deliberately pure — no database,
 * no clock — so every rule below can be tested against fixtures.
 *
 * Drivers, in order of authority:
 *
 *  1. Logged intake — the "in" side of the balance.
 *  2. Weight slope — the "out" side, priced at 7,700 kcal per kg.
 *  3. Trend-vs-regression agreement — is the slope real or water?
 *  4. Stability across 14 / 28 / 56-day windows — has maintenance moved, or is it noise?
 *  5. Anthropometric prior — cold start, and rescue when confidence is very low.
 *
 * 1 and 2 produce the number. 3 and 4 produce the confidence. 5 only speaks when the data
 * cannot.
 */

import {
	BodyProfile,
	ageFromBirthYear,
	bmrMifflin,
	ACTIVITY_FACTORS,
	isProfileComplete,
} from "./profile";

const DAY_MS = 24 * 60 * 60 * 1000;

/** Half of the remaining weight is lost every 14 days — two weekly goal updates. */
export const HALF_LIFE_DAYS = 14;

/** Data older than this contributes nothing at all. */
export const MAX_WINDOW_DAYS = 56;

/** 7,700 kcal per kg of body mass, expressed per day. */
export const KCAL_PER_KG_DAY = 1100;

/** The first fortnight of an episode is a transition, not a trend: damp it. */
export const TRANSITION_DAYS = 14;
const TRANSITION_FLOOR = 0.4;

/** A week this far off the fitted line is travel or illness, not evidence. */
const OUTLIER_MAD = 3;

/** Below this confidence, the prior starts to carry the answer. */
const PRIOR_FLOOR = 0.5;

/** A weekly move smaller than this is noise; the target should not chase it. */
export const MOVE_DEADBAND_KCAL = 75;

export type WeighIn = { timestamp: Date; grams: number };

/**
 * One calendar day of food logging. `items` is what makes a zero different from a blank;
 * `excluded` marks a day the average must skip — either because the user dropped it or
 * because `helper/intakeDays.ts` judged it half-logged.
 */
export type IntakeDay = {
	day: Date;
	calories: number;
	items: number;
	excluded?: boolean;
};

export type MaintenanceInput = {
	now: Date;
	/** When the current goal episode began; dampens its transition fortnight. */
	episodeStart?: Date | null;
	weighIns: WeighIn[];
	intake: IntakeDay[];
	/** May be partial: an incomplete profile is ignored rather than half-applied. */
	profile?: Partial<BodyProfile> | null;
};

export type ConfidenceTier = "high" | "medium" | "low" | "prior" | "none";

export type MaintenanceDrivers = {
	weeksCovered: number;
	loggedDays: number;
	weighIns: number;
	droppedWeeks: number;
	meanIntake: number | null;
	slopeKgPerWeek: number | null;
	residualSdKg: number | null;
	e14: number | null;
	e28: number | null;
	e56: number | null;
	coverage: number;
	weighInScore: number;
	stability: number;
	noise: number;
	prior: number | null;
	priorShare: number;
};

export type MaintenanceEstimate = {
	maintenance: number | null;
	range: number | null;
	confidence: number;
	tier: ConfidenceTier;
	drivers: MaintenanceDrivers;
	notes: string[];
};

/* ------------------------------------------------------------------ weighting */

function recency(ageDays: number): number {
	return Math.pow(0.5, Math.max(0, ageDays) / HALF_LIFE_DAYS);
}

/**
 * Damping for the transition fortnight.
 *
 * Not a bias — the estimate still uses those days. It stops the water swing that opens a
 * diet from dominating once the episode is a month old. Before the episode starts the
 * factor is 1: that data is already down-weighted by recency alone.
 */
function transition(daysSinceStart: number | null): number {
	if (daysSinceStart === null || daysSinceStart < 0) return 1;
	if (daysSinceStart >= TRANSITION_DAYS) return 1;
	return TRANSITION_FLOOR + (1 - TRANSITION_FLOOR) * (daysSinceStart / TRANSITION_DAYS);
}

/* ------------------------------------------------------------------ statistics */

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? (sorted[mid - 1] + sorted[mid]) / 2
		: sorted[mid];
}

type WeightedPoint = { x: number; y: number; w: number };

/** Weighted least squares. x is weeks, y is kilograms. */
function weightedFit(points: WeightedPoint[]): { slope: number; intercept: number } | null {
	const totalW = points.reduce((sum, point) => sum + point.w, 0);
	if (points.length < 2 || totalW <= 0) return null;

	const meanX = points.reduce((sum, p) => sum + p.w * p.x, 0) / totalW;
	const meanY = points.reduce((sum, p) => sum + p.w * p.y, 0) / totalW;

	let num = 0;
	let den = 0;
	for (const point of points) {
		const dx = point.x - meanX;
		num += point.w * dx * (point.y - meanY);
		den += point.w * dx * dx;
	}
	if (den <= 0) return null;

	const slope = num / den;
	return { slope, intercept: meanY - slope * meanX };
}

/* ------------------------------------------------------------------ one window */

type WindowFit = {
	slopeKgPerWeek: number | null;
	meanIntake: number | null;
	residualSdKg: number | null;
	buckets: number;
	weeksCovered: number;
	loggedDays: number;
	weighInCount: number;
	droppedWeeks: number;
	estimate: number | null;
};

/**
 * Fit one window: weekly medians of weigh-ins, then the intake mean over logged days.
 *
 * Both sides use the same window and the same weights, because `intake − slope × cost` is
 * only meaningful if the two terms describe the same stretch of time.
 */
function fitWindow(
	input: MaintenanceInput,
	days: number,
): WindowFit {
	const { now, episodeStart } = input;
	const from = new Date(now.getTime() - days * DAY_MS);
	const startMs = episodeStart ? episodeStart.getTime() : null;
	const sinceStart = (time: number) =>
		startMs === null ? null : Math.floor((time - startMs) / DAY_MS);

	const weighIns = input.weighIns.filter(
		(entry) => entry.timestamp > from && entry.timestamp <= now,
	);

	const intakeDays = input.intake.filter(
		(entry) => entry.day >= from && entry.day <= now && entry.items > 0 && !entry.excluded,
	);

	// --- intake -------------------------------------------------------------
	let meanIntake: number | null = null;
	if (intakeDays.length > 0) {
		let weightSum = 0;
		let calorieSum = 0;
		for (const entry of intakeDays) {
			const ageDays = (now.getTime() - entry.day.getTime()) / DAY_MS;
			const weight = recency(ageDays) * transition(sinceStart(entry.day.getTime()));
			weightSum += weight;
			calorieSum += weight * entry.calories;
		}
		if (weightSum > 0) meanIntake = calorieSum / weightSum;
	}

	// --- weekly buckets -----------------------------------------------------
	// Anchored on the episode start when there is one, so a "week" lines up with the day
	// the calorie goal updates rather than with an arbitrary Monday.
	const anchor = new Date((episodeStart ?? from).getTime());
	anchor.setHours(0, 0, 0, 0);

	type Bucket = { weeks: number[]; grams: number[]; weights: number[] };
	const buckets = new Map<number, Bucket>();
	for (const entry of weighIns) {
		const index = Math.floor((entry.timestamp.getTime() - anchor.getTime()) / (7 * DAY_MS));
		if (index < 0) continue;
		const bucket = buckets.get(index) ?? { weeks: [], grams: [], weights: [] };
		const ageDays = (now.getTime() - entry.timestamp.getTime()) / DAY_MS;
		bucket.weeks.push((entry.timestamp.getTime() - anchor.getTime()) / (7 * DAY_MS));
		bucket.grams.push(entry.grams / 1000);
		bucket.weights.push(
			recency(ageDays) * transition(sinceStart(entry.timestamp.getTime())),
		);
		buckets.set(index, bucket);
	}

	const points: WeightedPoint[] = [...buckets.values()].map((bucket) => ({
		x: bucket.weeks.reduce((sum, value) => sum + value, 0) / bucket.weeks.length,
		y: median(bucket.grams),
		// A week with four weigh-ins counts more than a week with one, which is what makes
		// "log more often" true rather than aspirational.
		w: bucket.weights.reduce((sum, value) => sum + value, 0),
	}));

	let fit = weightedFit(points);
	let used = points;
	let dropped = 0;

	// Drop the worst offender, refit, and look again — up to twice. A single pass over a
	// short window lets one travel week drag the line far enough that its own residual
	// looks ordinary while the innocent weeks look like outliers.
	for (let pass = 0; pass < 2 && fit && used.length > 2; pass++) {
		const residuals = used.map((point) =>
			Math.abs(point.y - (fit!.intercept + fit!.slope * point.x)),
		);
		const worst = residuals.indexOf(Math.max(...residuals));
		// 3×MAD is the right shape but wrong scale when there are only four or five buckets:
		// one wild week inflates the MAD enough to hide itself. Capping the MAD term keeps
		// the cut honest for small samples without abandoning it for large ones.
		const threshold = Math.max(Math.min(OUTLIER_MAD * median(residuals), 1.5), 0.4);
		if (residuals[worst] <= threshold) break;

		used = used.filter((_, index) => index !== worst);
		dropped += 1;
		fit = weightedFit(used);
	}

	const slopeKgPerWeek = fit ? fit.slope : null;

	let residualSdKg: number | null = null;
	if (fit && used.length >= 3) {
		const totalW = used.reduce((sum, p) => sum + p.w, 0);
		const variance =
			used.reduce(
				(sum, p) => sum + p.w * Math.pow(p.y - (fit!.intercept + fit!.slope * p.x), 2),
				0,
			) / totalW;
		residualSdKg = Math.sqrt(variance);
	}

	const weights = weighIns.map((entry) => entry.timestamp.getTime());
	const weeksCovered =
		weights.length > 1
			? (Math.max(...weights) - Math.min(...weights)) / (7 * DAY_MS)
			: 0;

	const estimate =
		meanIntake !== null && slopeKgPerWeek !== null
			? meanIntake - slopeKgPerWeek * KCAL_PER_KG_DAY
			: null;

	return {
		slopeKgPerWeek,
		meanIntake,
		residualSdKg,
		buckets: used.length,
		weeksCovered,
		loggedDays: intakeDays.length,
		weighInCount: weighIns.length,
		droppedWeeks: dropped,
		estimate,
	};
}

/* ------------------------------------------------------------------ confidence */

/** Weighted mean over whichever windows produced an estimate. */
function blend(parts: { value: number | null; weight: number }[]): number | null {
	const usable = parts.filter(
		(part): part is { value: number; weight: number } => part.value !== null,
	);
	if (usable.length === 0) return null;
	const totalWeight = usable.reduce((sum, part) => sum + part.weight, 0);
	if (totalWeight <= 0) return null;
	return usable.reduce((sum, part) => sum + part.value * part.weight, 0) / totalWeight;
}

function clamp01(value: number): number {
	return Math.max(0, Math.min(1, value));
}

function tierFor(confidence: number, hasData: boolean, hasPrior: boolean): ConfidenceTier {
	if (!hasData) return hasPrior ? "prior" : "none";
	if (confidence >= 0.75) return "high";
	if (confidence >= 0.5) return "medium";
	if (confidence >= 0.25) return "low";
	return hasPrior ? "prior" : "low";
}

export function rangeForTier(tier: ConfidenceTier): number | null {
	switch (tier) {
		case "high":
			return 100;
		case "medium":
			return 175;
		case "low":
			return 250;
		case "prior":
			return 250;
		default:
			return null;
	}
}

/* ------------------------------------------------------------------ the public call */

export function estimateMaintenance(input: MaintenanceInput): MaintenanceEstimate {
	const notes: string[] = [];
	const { now, profile } = input;

	const w56 = fitWindow(input, MAX_WINDOW_DAYS);
	const w28 = fitWindow(input, 28);
	const w14 = fitWindow(input, 14);

	/**
	 * The headline number blends the three windows with recency in charge.
	 *
	 * A single regression over 56 days cannot turn quickly: six weeks of losing outweighs
	 * two weeks of gaining inside one straight line, so the estimate lagged a real
	 * reversal by ~900 kcal. Weighting the windows ½ : ⅓ : ⅕ fixes that while keeping the
	 * longer windows as corroboration rather than discarding them.
	 */
	const blended = blend([
		{ value: w14.estimate, weight: 0.5 },
		{ value: w28.estimate, weight: 0.3 },
		{ value: w56.estimate, weight: 0.2 },
	]);

	/**
	 * An intake mean from a handful of days is not an intake mean.
	 *
	 * Two logged days produced a maintenance of 3,956 kcal on the test device — internally
	 * consistent, and meaningless, because "average intake" was really "what I ate twice".
	 * Below a week of logging the estimate is withheld rather than computed from noise, and
	 * the profile prior answers instead.
	 */
	const MIN_LOGGED_DAYS = 7;
	const intakeTooThin = w28.loggedDays < MIN_LOGGED_DAYS;
	const data = intakeTooThin ? null : blended;

	// --- prior --------------------------------------------------------------
	let prior: number | null = null;
	if (isProfileComplete(profile) && w56.weighInCount > 0) {
		const latestWeighIn = [...input.weighIns]
			.filter((entry) => entry.timestamp <= now)
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
		const kg = (latestWeighIn?.grams ?? 0) / 1000;
		if (kg > 0) {
			const age = ageFromBirthYear(profile.birthYear, now);
			prior = Math.round(
				bmrMifflin(kg, profile.heightCm, age, profile.sex) *
					ACTIVITY_FACTORS[profile.activity],
			);
		}
	}

	// --- confidence components ---------------------------------------------
	const coverage = clamp01(w28.loggedDays / 20);
	const weighInScore = clamp01(w28.weighInCount / 16);

	// Stability is only meaningful once the window spans more than a fortnight: earlier the
	// two windows see the same days and would agree trivially.
	let stability = 0.5;
	if (w14.estimate !== null && w28.estimate !== null && w28.weeksCovered >= 2.5) {
		stability = clamp01(1 - Math.abs(w14.estimate - w28.estimate) / 300);
	}

	const noise =
		w56.residualSdKg === null ? 0.5 : clamp01(1 - w56.residualSdKg / 0.5);

	// Coverage also caps the score: weight data can be perfect and the answer still wrong if
	// food was logged twice, so a thin week cannot be outvoted by plentiful weigh-ins.
	const coverageGate = clamp01(w28.loggedDays / 7);
	const confidence = Math.min(
		clamp01(0.3 * coverage + 0.25 * weighInScore + 0.3 * stability + 0.15 * noise),
		coverageGate,
	);

	// --- blend with the prior ----------------------------------------------
	let maintenance: number | null = data;
	let priorShare = 0;

	if (data === null) {
		maintenance = prior;
		priorShare = prior ? 1 : 0;
		if (prior) {
			notes.push("Not enough weigh-ins and food logs yet — this is an estimate from your profile.");
		}
	} else if (prior !== null && confidence < PRIOR_FLOOR) {
		const t = confidence / PRIOR_FLOOR;
		maintenance = t * data + (1 - t) * prior;
		priorShare = 1 - t;
		notes.push(
			`Blended ${Math.round(priorShare * 100)}% toward your profile estimate while the data is thin.`,
		);
	}

	const hasData = data !== null;
	const tier = tierFor(confidence, hasData, prior !== null);
	const range = rangeForTier(tier);

	// --- plain-language reasons --------------------------------------------
	if (intakeTooThin) {
		notes.push(
			`Only ${w28.loggedDays} day${w28.loggedDays === 1 ? "" : "s"} of food logged in the last 28 — too few to average.`,
		);
	}
	if (hasData && w28.loggedDays < 20) {
		const missing = 28 - w28.loggedDays;
		notes.push(`Food logged on ${w28.loggedDays} of the last 28 days — ${missing} missing.`);
	}
	if (hasData && w28.weighInCount < 16) {
		notes.push(`${w28.weighInCount} weigh-ins in the last 28 days.`);
	}
	if (w56.slopeKgPerWeek !== null && w56.weighInCount > 1) {
		const newest = [...input.weighIns]
			.filter((entry) => entry.timestamp <= now)
			.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
		const latestKg = newest ? newest.grams / 1000 : 0;
		const percentPerWeek =
			latestKg > 0 ? (Math.abs(w56.slopeKgPerWeek) / latestKg) * 100 : 0;
		if (percentPerWeek > 1.5) {
			notes.push(
				`Weight is moving ${percentPerWeek.toFixed(1)}% a week, faster than 1.5% — often under-logged food rather than a real deficit.`,
			);
		}
	}
	if (w56.droppedWeeks > 0) {
		notes.push(`${w56.droppedWeeks} unusual week${w56.droppedWeeks > 1 ? "s" : ""} ignored.`);
	}

	return {
		maintenance: maintenance === null ? null : Math.round(maintenance),
		range,
		confidence: Number(confidence.toFixed(3)),
		tier,
		notes,
		drivers: {
			weeksCovered: Number(w56.weeksCovered.toFixed(1)),
			loggedDays: w28.loggedDays,
			weighIns: w28.weighInCount,
			droppedWeeks: w56.droppedWeeks,
			meanIntake: w56.meanIntake === null ? null : Math.round(w56.meanIntake),
			slopeKgPerWeek:
				w56.slopeKgPerWeek === null ? null : Number(w56.slopeKgPerWeek.toFixed(3)),
			residualSdKg:
				w56.residualSdKg === null ? null : Number(w56.residualSdKg.toFixed(3)),
			e14: w14.estimate === null ? null : Math.round(w14.estimate),
			e28: w28.estimate === null ? null : Math.round(w28.estimate),
			e56: w56.estimate === null ? null : Math.round(w56.estimate),
			coverage: Number(coverage.toFixed(2)),
			weighInScore: Number(weighInScore.toFixed(2)),
			stability: Number(stability.toFixed(2)),
			noise: Number(noise.toFixed(2)),
			prior,
			priorShare: Number(priorShare.toFixed(2)),
		},
	};
}

/**
 * How far the calorie goal may move this week.
 *
 * The estimate can swing early; the target that a person actually eats from should not.
 * Caps widen as the episode ages and as confidence firms up.
 */
export function maxWeeklyMove(
	daysIntoEpisode: number,
	tier: ConfidenceTier,
): number {
	if (daysIntoEpisode < 14) return 150;
	if (daysIntoEpisode < 42) return 250;
	return tier === "high" ? 350 : 250;
}

/** The goal for next week: deadband, then cap. */
export function nextCalorieGoal(
	current: number,
	target: number,
	daysIntoEpisode: number,
	tier: ConfidenceTier,
): number {
	const delta = target - current;
	if (Math.abs(delta) < MOVE_DEADBAND_KCAL) return current;
	const cap = maxWeeklyMove(daysIntoEpisode, tier);
	const moved = Math.max(-cap, Math.min(cap, delta));
	return Math.round(current + moved);
}
