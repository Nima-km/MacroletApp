/**
 * The span a weight chart is showing, and how to aggregate it.
 *
 * One rule drives the whole thing: **the span chooses the bucket, and the bucket is
 * chosen so the screen holds roughly 30–60 marks.** Daily points are right for a week and
 * useless for a year — 365 dots smear into a band, and nobody can read a single Tuesday
 * at that scale. Aggregating more coarsely is what makes a long span legible, at the cost
 * of detail the eye could not see anyway.
 */

export type WeightRange = "1W" | "1M" | "3M" | "1Y" | "ALL";

export type WeightPeriod = "day" | "week" | "month";

export type RangeConfig = {
	/** Short label for the segmented control. */
	label: string;
	/** Length of the window in days; `ALL` is capped, see below. */
	days: number;
	/** How readings are collapsed within the window. */
	period: WeightPeriod;
};

/** Five years. "All" means everything still shown, not everything ever. */
export const MAX_ALL_DAYS = 5 * 365;

/**
 * Every range is counted in days.
 *
 * Coarser buckets existed to stop the marks crowding — but the readings are now a faint
 * line with no markers, so a year of daily points costs almost nothing visually and shows
 * the actual measurements instead of a weekly summary of them. The trend absorbs the
 * noise; there is nothing left for aggregation to protect the reader from.
 */
export const RANGES: Record<WeightRange, RangeConfig> = {
	"1W": { label: "1W", days: 7, period: "day" },
	"1M": { label: "1M", days: 30, period: "day" },
	"3M": { label: "3M", days: 91, period: "day" },
	"1Y": { label: "1Y", days: 365, period: "day" },
	ALL: { label: "All", days: MAX_ALL_DAYS, period: "day" },
};

export const RANGE_ORDER: WeightRange[] = ["1W", "1M", "3M", "1Y", "ALL"];

/**
 * Bucket for an arbitrary span.
 *
 * Kept as a function rather than only the table above so a future free-form zoom can ask
 * for a span and get a sane bucket back.
 */
export function periodForDays(days: number): WeightPeriod {
	if (days <= 31) return "day";
	if (days <= 400) return "week";
	return "month";
}

/** How wide one mark is, in days — used to decide whether a gap is short or long. */
export function bucketDays(period: WeightPeriod): number {
	return period === "day" ? 1 : period === "week" ? 7 : 30;
}

/**
 * The longest silence that still joins up.
 *
 * With daily points, someone who weighs weekly would otherwise get a line broken into
 * confetti — every gap longer than a day. So the tolerance is stated in days directly: a
 * missed week still joins, three missed weeks do not. The line then means "weigh-ins at
 * least weekly", and a real break means they stopped.
 */
const BRIDGE_DAYS: Record<WeightPeriod, number> = {
	day: 8,
	week: 21,
	month: 90,
};

export function shouldBridge(gapMs: number, period: WeightPeriod): boolean {
	return gapMs <= BRIDGE_DAYS[period] * 24 * 60 * 60 * 1000;
}

/** The window for a range, ending at `end` (exclusive) and clamped at the 5-year cap. */
export function rangeWindow(
	range: WeightRange,
	end: Date,
): { from: Date; to: Date; period: WeightPeriod } {
	const config = RANGES[range];
	const from = new Date(end);
	from.setDate(from.getDate() - config.days);
	return { from, to: end, period: config.period };
}
