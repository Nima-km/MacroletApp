/**
 * Fixtures for day classification.
 *
 * Run with:  node_modules/.bin/tsx scripts/intake-day-fixtures.ts
 */

import { classifyIntakeDays, dayKey } from "../helper/intakeDays";

const day = (daysAgo: number, calories: number, items: number) => ({
	day: new Date(2026, 10, 4 - daysAgo),
	calories,
	items,
});

const days = [
	day(0, 2400, 6),
	day(1, 2350, 5),
	day(2, 700, 1),   // half-logged
	day(3, 2450, 7),
	day(4, 0, 0),     // nothing logged
	day(5, 2380, 6),
	day(6, 1500, 2),  // thin
	day(7, 2420, 5),
];

const show = (label: string, overrides = {}) => {
	console.log(`\n  ${label}`);
	for (const result of classifyIntakeDays(days, overrides)) {
		const mark = result.counted ? "•" : " ";
		console.log(
			`   ${mark} ${dayKey(result.day)}  ${String(result.calories).padStart(4)} kcal  ${result.items} items  ${result.state}`,
		);
	}
	const counted = classifyIntakeDays(days, overrides).filter((d) => d.counted);
	const mean =
		counted.reduce((sum, d) => sum + d.calories, 0) / Math.max(1, counted.length);
	console.log(`   average over counted days: ${Math.round(mean)} kcal (${counted.length} days)`);
};

show("automatic");
show("user re-includes the 700 kcal day", { [dayKey(days[2].day)]: "include" });
show("user excludes a normal day (a party they logged)", { [dayKey(days[3].day)]: "exclude" });
