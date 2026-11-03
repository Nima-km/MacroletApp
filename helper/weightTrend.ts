/**
 * Trend weight.
 *
 * A scale reading moves by a pound or two on water, salt, glycogen and food still in
 * transit. Any feature that reacts to one reading — a projection, "on track", an adaptive
 * calorie goal — is reacting mostly to noise. The trend is the signal.
 *
 * Two forms, for two different jobs:
 *
 * - **`emaTrend`** — an exponential moving average, for drawing. Every reading nudges
 *   the line; single-day spikes are absorbed.
 * - **`weeklyMedians`** — one median per week, for arithmetic. A median resists the
 *   one-off big meal the night before a weigh-in in a way a mean does not, and a weekly
 *   bucket is the smallest unit that is not dominated by day-to-day noise.
 *
 * Everything here is pure and takes plain `{ timestamp, weight }` objects, so it can be
 * reasoned about (and tested) without a database.
 */

export type WeightPoint = { timestamp: Date; weight: number };
export type TrendPoint = WeightPoint & { trend: number };

/** One week's readings collapsed to a median. */
export type WeekBucket = {
	/** Monday (or the chosen first day) at local midnight. */
	weekStart: Date;
	median: number;
	count: number;
	min: number;
	max: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Default smoothing. 0.1 is roughly a two-week half-life for daily readings. */
const DEFAULT_ALPHA = 0.1;

function median(values: number[]): number {
	const sorted = [...values].sort((a, b) => a - b);
	const middle = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0
		? (sorted[middle - 1] + sorted[middle]) / 2
		: sorted[middle];
}

/**
 * Start of the week containing `date`.
 *
 * `weekStartsOn` is 0 = Sunday, 1 = Monday. Local time on purpose: a weigh-in belongs to
 * the day the user experienced, not to UTC.
 */
export function weekStart(date: Date, weekStartsOn = 1): Date {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);
	const offset = (start.getDay() - weekStartsOn + 7) % 7;
	start.setDate(start.getDate() - offset);
	return start;
}

/**
 * Exponential moving average.
 *
 * The smoothing factor is applied per *day*, not per reading: someone weighing weekly
 * would otherwise see the line barely move, because 0.1 of a reading is applied once a
 * week instead of seven times. `1 - (1 - alpha) ^ days` gives the same smoothing as
 * daily readings over that gap.
 */
export function emaTrend(
	points: WeightPoint[],
	alpha = DEFAULT_ALPHA,
): TrendPoint[] {
	const entries = [...points]
		.filter((point) => Number.isFinite(point.weight) && point.weight > 0)
		.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

	if (entries.length === 0) return [];

	let trend = entries[0].weight;
	let previous = entries[0].timestamp.getTime();

	return entries.map((point, index) => {
		if (index > 0) {
			const days = Math.max((point.timestamp.getTime() - previous) / DAY_MS, 1);
			const effective = 1 - Math.pow(1 - alpha, days);
			trend = trend + effective * (point.weight - trend);
			previous = point.timestamp.getTime();
		}
		return { ...point, trend };
	});
}

/**
 * One median per week.
 *
 * Input is expected to be the daily buckets the weight query already returns, so a
 * "median" here is the median of those daily averages — with several weigh-ins on one
 * day the median is of the day, not of every reading. That is the same information the
 * chart draws, and it keeps the estimator and the chart agreeing about what a day is.
 */
export function weeklyMedians(
	points: WeightPoint[],
	weekStartsOn = 1,
): WeekBucket[] {
	const groups = new Map<number, WeightPoint[]>();

	for (const point of points) {
		if (!Number.isFinite(point.weight) || point.weight <= 0) continue;
		const start = weekStart(point.timestamp, weekStartsOn);
		const key = start.getTime();
		const bucket = groups.get(key);
		if (bucket) bucket.push(point);
		else groups.set(key, [point]);
	}

	return [...groups.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([key, entries]) => {
			const weights = entries.map((entry) => entry.weight);
			return {
				weekStart: new Date(key),
				median: median(weights),
				count: entries.reduce((total, entry) => total + 1, 0),
				min: Math.min(...weights),
				max: Math.max(...weights),
			};
		});
}
