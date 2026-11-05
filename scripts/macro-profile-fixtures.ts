/**
 * Fixtures for the macro curve.
 *
 * Run with:  node_modules/.bin/tsx scripts/macro-profile-fixtures.ts
 */

import {
	deriveCarbs,
	interpolateProfile,
	suggestCheckpoint,
	validateProfile,
} from "../helper/macroProfile";

// The worked example: an origin, a minimum, and a maximum. 1,580 and 2,650 are both
// self-consistent (4p + 4c + 9f).
const curve = [
	{ calories: 0, protein: 0, fat: 0 },
	{ calories: 1580, protein: 160, fat: 60 },
	{ calories: 2650, protein: 160, fat: 90 },
];

const line = (label: string, value: ReturnType<typeof interpolateProfile>) =>
	console.log(
		`  ${label.padEnd(26)} ${value ? `${value.protein}p / ${value.fat}f / ${value.carbs}c (${value.calories} kcal) ${value.clamped === "none" ? "" : `[clamped ${value.clamped}]`}` : "null"}`,
	);

line("the minimum (1580)", interpolateProfile(curve, 1580));
line("between (1900)", interpolateProfile(curve, 1900));
line("top (2650)", interpolateProfile(curve, 2650));
line("below the minimum (900)", interpolateProfile(curve, 900));
line("above the top (3000)", interpolateProfile(curve, 3000));

console.log("\n  derived carbs:", deriveCarbs({ calories: 2000, protein: 160, fat: 60 }));
console.log("  suggestion at 2200, 84 kg:", JSON.stringify(suggestCheckpoint(2200, 84)));

console.log("\n  origin checkpoint accepted:", validateProfile([{ calories: 0, protein: 0, fat: 0 }, ...curve.slice(1)]).ok);

const bad = validateProfile([
	{ calories: 2000, protein: 300, fat: 200 }, // impossible: carbs negative
	{ calories: 1200, protein: 10, fat: 20 },   // floors
	{ calories: 1200, protein: 120, fat: 40 },  // duplicate calories
]);
console.log("\n  validation:", bad.ok ? "ok" : "rejected");
for (const entry of bad.problems) {
	for (const problem of entry.problems) {
		console.log(`    ${entry.calories} kcal · ${problem.message}`);
	}
}
if (bad.error) console.log(`    ${bad.error}`);
