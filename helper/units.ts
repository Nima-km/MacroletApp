/**
 * Body-weight units.
 *
 * Weight is stored in **grams**, always, and converted only at the edges — input,
 * formatting, chart axes. That is the whole rule: a stored number has exactly one
 * meaning, and nothing else in the app is allowed to know whether the person reading it
 * thinks in pounds or kilograms.
 *
 * Grams rather than kilograms because a tenth of a pound (45.36 g) has to survive the
 * round trip exactly, and weights are integers in the database.
 */

export type WeightUnit = "lb" | "kg";

/** Exact, not rounded: 0.1 lb must round-trip through grams without drifting. */
export const GRAMS_PER_LB = 453.59237;
export const GRAMS_PER_KG = 1000;

const GRAMS_PER: Record<WeightUnit, number> = {
	lb: GRAMS_PER_LB,
	kg: GRAMS_PER_KG,
};

/** The three countries that have not adopted the metric system. */
const IMPERIAL_REGIONS = new Set(["US", "LR", "MM"]);

/**
 * What this device probably wants.
 *
 * `Intl` is available in Hermes, and `resolvedOptions().locale` carries the region
 * ("en-GB"). No native module, no dependency; if the locale has no region we default to
 * pounds, which is what the app showed before units existed.
 */
export function localeWeightUnit(): WeightUnit {
	try {
		const locale = new Intl.DateTimeFormat().resolvedOptions().locale ?? "";
		const parts = locale.split(/[-_]/);
		const region = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
		return region && !IMPERIAL_REGIONS.has(region) ? "kg" : "lb";
	} catch {
		return "lb";
	}
}

/** Stored grams -> the number to show. */
export function toDisplay(grams: number, unit: WeightUnit): number {
	return (Number.isFinite(grams) ? grams : 0) / GRAMS_PER[unit];
}

/** A typed number -> grams to store. */
export function toGrams(value: number, unit: WeightUnit): number {
	return Math.round((Number.isFinite(value) ? value : 0) * GRAMS_PER[unit]);
}

/**
 * One decimal place — the precision a bathroom scale reports — in whichever unit is on
 * screen.
 */
export function formatWeight(grams: number, unit: WeightUnit): string {
	return toDisplay(grams, unit).toFixed(1);
}

/** A delta is already in display units; format it without converting again. */
export function formatDelta(displayDelta: number): string {
	return displayDelta.toFixed(1);
}

/** Short label: "lb" or "kg". */
export function unitLabel(unit: WeightUnit): string {
	return unit;
}

/** Longer label for headings where the unit stands alone: "lbs" / "kg". */
export function unitHeading(unit: WeightUnit): string {
	return unit === "lb" ? "lbs" : "kg";
}

/**
 * Accepted input range, expressed in the display unit so the same numbers guard the
 * field no matter what the user typed.
 *
 * 20–500 lb is the historical range; kg is the same physical range, not the same numbers.
 */
export function weightBounds(unit: WeightUnit): { min: number; max: number } {
	return {
		min: Math.ceil(toDisplay(toGrams(20, "lb"), unit)),
		max: Math.floor(toDisplay(toGrams(500, "lb"), unit)),
	};
}

/** Placeholder hint for the log field. */
export function weightPlaceholder(unit: WeightUnit): string {
	return unit === "lb" ? "0.0" : "0.0";
}

/**
 * Axis granularity. The chart constants were tuned in pounds; these keep the same
 * visual density in kilograms instead of rounding to 5 kg steps, which would flatten a
 * real trend into one line.
 */
export function axisStep(unit: WeightUnit): number {
	return unit === "lb" ? 5 : 2;
}

/** Empty space above and below the plotted area, in display units. */
export function axisPadding(unit: WeightUnit): number {
	return unit === "lb" ? 10 : 5;
}

/** Smallest vertical span the chart will draw, so a flat week is not a straight edge. */
export function axisMinSpan(unit: WeightUnit): number {
	return unit === "lb" ? 20 : 10;
}

/**
 * A band width ("±1 lb", "±0.5 kg").
 *
 * Converted from grams it comes out as 1.000898…, which is arithmetic, not a width
 * anyone chose. Round to one decimal and drop a trailing zero.
 */
export function formatBand(grams: number, unit: WeightUnit): string {
	const value = Number(toDisplay(grams, unit).toFixed(1));
	return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Snap a display value onto the wheel's step grid, so what is shown is what is saved. */
export function snapToStep(value: number, step: number, min: number): number {
	const snapped = min + Math.round((value - min) / step) * step;
	return Number(snapped.toFixed(3));
}
