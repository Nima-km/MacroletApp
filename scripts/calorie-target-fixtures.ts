/**
 * Fixtures for the safe calorie target.
 *
 * Run with:  node_modules/.bin/tsx scripts/calorie-target-fixtures.ts
 */

import { projectedDate, safeTarget } from "../helper/calorieTarget";

const now = new Date("2026-11-04T12:00:00");
const show = (label: string, args: Parameters<typeof safeTarget>[0]) => {
	const result = safeTarget(args);
	console.log(
		`  ${label}\n    target ${result.target} (maintenance ${result.maintenance}, rate ${result.rateKgPerWeek} kg/wk, ${result.clamped}) safe ${result.min}–${result.max}`,
	);
	return result;
};

// 1. ordinary deficit, no date: 0.5 % BW/week
show("lose, 84 kg, maintenance 2760, no date", {
	maintenance: 2760, weightKg: 84, bmr: 1750, kind: "lose", now,
});

// 2. an impossible date: 10 kg in 3 weeks — must clamp, not starve
const impossible = show("lose, 10 kg in 3 weeks (impossible)", {
	maintenance: 2760, weightKg: 84, bmr: 1750, kind: "lose",
	targetWeightKg: 74, targetDate: new Date("2026-11-25"), now,
});

// 3. a floor case: tiny maintenance
show("lose, maintenance 1500, bmr 1450", {
	maintenance: 1500, weightKg: 55, bmr: 1450, kind: "lose", now,
});

// 4. gain
show("gain, 70 kg, maintenance 2400", {
	maintenance: 2400, weightKg: 70, bmr: 1600, kind: "gain", now,
});

// 5. maintain
show("maintain, maintenance 2600", {
	maintenance: 2600, weightKg: 84, bmr: 1750, kind: "maintain", now,
});

// 6. projection from the clamped rate
const date = projectedDate(84, 74, impossible.rateKgPerWeek, now);
console.log(`  projected date at the safe rate: ${date ? date.toISOString().slice(0, 10) : "—"}`);
