/**
 * Geometry for the weight chart.
 *
 * Pure and unit-agnostic: it takes numbers that are already in display units and returns
 * pixels. The chart component does the drawing; this file decides where things go, which
 * makes the parts that are easy to get wrong — time spacing and tick placement — testable
 * without a device.
 *
 * The previous chart came from a library whose x-axis is an *index*, so an 18-day gap and
 * a 1-day gap were drawn the same width. Here x is a time scale: gaps are visible, which
 * matters in a feature that expects people to weigh in irregularly.
 */

export type ChartPoint = { timestamp: Date; value: number };

const HOUR = 60 * 60 * 1000;

/** Chosen so axis labels never collide with the plot or each other. */
export const CHART_LAYOUT = {
	// Room for a sparse value axis: three labels, no heavy grid.
	left: 34,
	right: 12,
	// Headroom for the touch readout. It was 76 to guarantee a 48 pt box plus a 24 pt gap
	// above *any* point; that left a dead strip under the unit label, so it now covers most
	// cases and the box clamps on the rare point that reaches the very top.
	top: 52,
	bottom: 20,
};

/** The time span to draw. A single reading still needs a span, or it divides by zero. */
export function timeDomain(points: ChartPoint[]): { min: number; max: number } {
	if (points.length === 0) return { min: 0, max: 1 };
	const times = points.map((point) => point.timestamp.getTime());
	const min = Math.min(...times);
	const max = Math.max(...times);
	if (min === max) return { min: min - 6 * HOUR, max: max + 6 * HOUR };
	return { min, max };
}

/** Where a moment sits horizontally. */
export function timeToX(
	time: number,
	domain: { min: number; max: number },
	left: number,
	width: number,
): number {
	const span = domain.max - domain.min || 1;
	const ratio = (time - domain.min) / span;
	return left + Math.min(1, Math.max(0, ratio)) * width;
}

/**
 * Round tick values for a value axis.
 *
 * Steps come from the familiar 1, 2, 2.5, 5 × 10ⁿ ladder so the labels read as round
 * numbers in whatever unit is on screen — whole pounds, or tenths of a kilogram.
 */
export function niceTicks(min: number, max: number, target = 5): number[] {
	if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
	if (max <= min) return [min];

	const rough = (max - min) / Math.max(1, target - 1);
	const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
	const normalised = rough / magnitude;
	const step =
		(normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 2.5 ? 2.5 : normalised <= 5 ? 5 : 10) *
		magnitude;

	const ticks: number[] = [];
	const first = Math.ceil(min / step) * step;
	for (let value = first; value <= max + step * 1e-6; value += step) {
		ticks.push(Number(value.toFixed(6)));
	}
	return ticks;
}

/**
 * The step between value ticks, from the familiar 1, 2, 2.5, 5 × 10ⁿ ladder — so labels
 * read as round numbers in whatever unit is on screen.
 */
export function tickStep(span: number, target = 5): number {
	if (!(span > 0)) return 1;
	const rough = span / Math.max(1, target - 1);
	const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
	const normalised = rough / magnitude;
	return (
		(normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 2.5 ? 2.5 : normalised <= 5 ? 5 : 10) *
		magnitude
	);
}

export type ValueDomain = {
	min: number;
	max: number;
	step: number;
	ticks: number[];
};

/**
 * The vertical range to draw, and the ticks to label it with.
 *
 * Three things shape it, in order:
 *
 * 1. **The goal is included**, so a target above the heaviest reading stays on the chart.
 * 2. **A minimum span**, so a two-pound change is not stretched down the whole height.
 * 3. **Explicit padding** — `pad` on each side, then snapped *outward* to whole tick
 *    steps. Without this the axis snapped inward and the lowest reading sat on the floor
 *    with 10 lb of empty space above the highest: the plot looked like it was falling off
 *    the bottom. Snapping outward guarantees at least `pad` of air at both ends.
 */
export function valueDomain(
	values: number[],
	goal?: number | null,
	options: {
		minSpan?: number;
		pad?: number;
		target?: number;
		/** Trim the extremes this far in, on long spans only. */
		clipPercentile?: number;
	} = {},
): ValueDomain {
	const { minSpan = 0, pad = 0, target = 6, clipPercentile = 0.02 } = options;

	const all = values.filter((value) => Number.isFinite(value));
	if (all.length === 0 && (goal === null || goal === undefined)) {
		return { min: 0, max: 1, step: 1, ticks: [0, 1] };
	}

	// One mistyped reading (18 instead of 180) collapses a year into a flat line at the
	// top of the axis. Over enough points, take the domain from percentiles so a single
	// outlier is clipped instead of obeyed. Below that, percentiles are meaningless and
	// the real extremes are kept so nothing is hidden.
	const sorted = [...all].sort((a, b) => a - b);
	const clipFrom =
		sorted.length >= 10 ? Math.floor(sorted.length * clipPercentile) : 0;
	const trimmed = sorted.slice(clipFrom, sorted.length - clipFrom || undefined);
	const basis = trimmed.length > 1 ? trimmed : sorted;

	let min = basis.length ? Math.min(...basis) : Number.POSITIVE_INFINITY;
	let max = basis.length ? Math.max(...basis) : Number.NEGATIVE_INFINITY;

	// The goal is never clipped: it is a chosen target, not an outlier, and hiding it
	// pushes the target line off the bottom of the chart.
	if (goal !== null && goal !== undefined && Number.isFinite(goal)) {
		min = Math.min(min, goal);
		max = Math.max(max, goal);
	}
	if (!Number.isFinite(min) || !Number.isFinite(max)) {
		return { min: 0, max: 1, step: 1, ticks: [0, 1] };
	}
	if (min === max) {
		min -= 1;
		max += 1;
	}

	if (minSpan > 0 && max - min < minSpan) {
		const middle = (min + max) / 2;
		min = middle - minSpan / 2;
		max = middle + minSpan / 2;
	}

	min -= pad;
	max += pad;

	const step = tickStep(max - min, target);
	const low = Math.floor(min / step) * step;
	const high = Math.ceil(max / step) * step;

	const ticks: number[] = [];
	for (let value = low; value <= high + step * 1e-6; value += step) {
		ticks.push(Number(value.toFixed(6)));
	}

	return { min: low, max: high, step, ticks };
}

/** Where a value sits vertically. Higher value, smaller y. */
export function valueToY(
	value: number,
	domain: { min: number; max: number },
	top: number,
	height: number,
): number {
	const span = domain.max - domain.min || 1;
	return top + ((domain.max - value) / span) * height;
}

/**
 * Which readings get a date label.
 *
 * Up to four, spread across the plot and always including both ends. Evenly spaced points
 * rather than round dates: the label then sits exactly under its dot, instead of claiming
 * a tick where there is no reading.
 */
export function labelIndices(count: number, max = 4): number[] {
	if (count <= 0) return [];
	if (count <= max) return Array.from({ length: count }, (_, index) => index);
	const step = (count - 1) / (max - 1);
	const picked = new Set<number>();
	for (let slot = 0; slot < max; slot++) {
		picked.add(Math.round(slot * step));
	}
	return [...picked].sort((a, b) => a - b);
}

/** The reading closest to a touch, measured in time rather than in pixel index. */
export function nearestPointIndex(
	points: ChartPoint[],
	x: number,
	domain: { min: number; max: number },
	left: number,
	width: number,
): number {
	if (points.length === 0) return -1;
	let best = 0;
	let bestDistance = Infinity;
	points.forEach((point, index) => {
		const pointX = timeToX(point.timestamp.getTime(), domain, left, width);
		const distance = Math.abs(pointX - x);
		if (distance < bestDistance) {
			bestDistance = distance;
			best = index;
		}
	});
	return best;
}

/** Decimal places a tick needs, given the gap between ticks. */
export function tickDecimals(ticks: number[]): number {
	if (ticks.length < 2) return 0;
	const step = Math.abs(ticks[1] - ticks[0]);
	if (step >= 1) return 0;
	return step >= 0.1 ? 1 : 2;
}
