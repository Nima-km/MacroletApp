import { WeightHistoryRecord } from "@/types/weight";

/**
 * The data model stores a bare number: there is no unit on a weight record, so this
 * label is fixed. Changing it needs a unit on the record or in settings - see the
 * Home weight card notes.
 */
export const WEIGHT_UNIT = "lbs";

/** Sensible bounds for a logged weight, used to guard the input. */
export const MIN_WEIGHT = 20;
export const MAX_WEIGHT = 500;

export type WeightSummary = {
	/** The most recent reading in the window. */
	current: number;
	/** When it was taken. */
	currentDate: Date;
	/** Change from the first reading in the window to the latest. */
	delta: number;
	/** Average across the window, weighted by each bucket's sample count. */
	average: number;
	samples: number;
};

/** One decimal place, which is the precision a scale reports. */
export function formatWeight(value: number) {
	return value.toFixed(1);
}

/**
 * Summarise a window of weigh-ins.
 *
 * Shared by the Home card and the history screen so the two can never disagree about
 * what "current" or "7-day average" means. Records arrive bucketed and ascending;
 * buckets carry a `count`, so the average weights by samples rather than by bucket.
 */
export function summarizeWeight(
	data?: WeightHistoryRecord[],
): WeightSummary | null {
	const entries = (data ?? [])
		.filter((entry) => Number.isFinite(entry.weight) && entry.weight > 0)
		.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

	if (entries.length === 0) return null;

	const latest = entries[entries.length - 1];
	const earliest = entries[0];
	const samples = entries.reduce(
		(total, entry) => total + (entry.count || 1),
		0,
	);
	const weighted = entries.reduce(
		(total, entry) => total + entry.weight * (entry.count || 1),
		0,
	);

	return {
		current: latest.weight,
		currentDate: latest.timestamp,
		delta: latest.weight - earliest.weight,
		average: samples > 0 ? weighted / samples : latest.weight,
		samples,
	};
}

/** "12–21 Oct" style label for the window, given its ends. */
export function formatWindow(from: Date, to: Date) {
	const end = new Date(to);
	// The window is [from, to), so the last included day is the day before `to`.
	end.setDate(end.getDate() - 1);
	const day = (d: Date) => d.getDate().toString();
	const month = (d: Date) =>
		d.toLocaleDateString(undefined, { month: "short" });
	if (from.getMonth() === end.getMonth()) {
		return `${day(from)}–${day(end)} ${month(end)}`;
	}
	return `${day(from)} ${month(from)} – ${day(end)} ${month(end)}`;
}
