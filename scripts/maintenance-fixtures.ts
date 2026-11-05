/**
 * Fixtures for the maintenance estimator.
 *
 * Run with:  node_modules/.bin/tsx scripts/maintenance-fixtures.ts
 *
 * Each case is a claim about behaviour that is easy to break by "improving" a constant:
 * the early gain has to be caught, a reversal has to lead the estimate, a travel week has
 * to be dropped, and the weekly move has to be capped.
 */

import { IntakeDay, WeighIn, estimateMaintenance, nextCalorieGoal } from "../helper/maintenance";

export const NOW = new Date("2026-11-04T12:00:00");
const DAY = 24 * 60 * 60 * 1000;

export function dayAgo(days: number, hour = 7): Date {
	const date = new Date(NOW.getTime() - days * DAY);
	date.setHours(hour, 0, 0, 0);
	return date;
}

/** weigh-ins every `every` days, weight following `kgAt(daysAgo)` */
export function weighIns(
	days: number,
	kgAt: (daysAgo: number) => number,
	every = 1,
): WeighIn[] {
	const out: WeighIn[] = [];
	for (let a = days; a >= 0; a -= every) {
		out.push({ timestamp: dayAgo(a), grams: Math.round(kgAt(a) * 1000) });
	}
	return out;
}

/** logged days with a given average intake, `logged` days out of `days` */
export function intake(days: number, kcal: number, logged = days): IntakeDay[] {
	const out: IntakeDay[] = [];
	for (let a = days - 1; a >= 0; a--) {
		const isLogged = a % Math.max(1, Math.round(days / logged)) === 0;
		if (!isLogged) continue;
		out.push({ day: dayAgo(a, 19), calories: kcal, items: 4 });
	}
	return out;
}

const profile = { heightCm: 178, birthYear: 1990, sex: "male" as const, activity: "moderate" as const };

const show = (label: string, estimate: ReturnType<typeof estimateMaintenance>) => {
	const d = estimate.drivers;
	console.log(`\n  ${label}`);
	console.log(`    maintenance ${estimate.maintenance} ± ${estimate.range}  (${estimate.tier}, c=${estimate.confidence})`);
	console.log(`    drivers  e14=${d.e14}  e28=${d.e28}  e56=${d.e56}  prior=${d.prior} (${Math.round(d.priorShare * 100)}%)`);
	console.log(`    data     intake=${d.meanIntake}  slope=${d.slopeKgPerWeek} kg/wk  logged=${d.loggedDays}/28  weighIns=${d.weighIns}  sd=${d.residualSdKg}`);
	console.log(`    parts    coverage=${d.coverage} weighIn=${d.weighInScore} stability=${d.stability} noise=${d.noise} dropped=${d.droppedWeeks}`);
	for (const note of estimate.notes) console.log(`    note     ${note}`);
};

// 1. steady loss, logged daily — expect ~2760, high confidence
show("1. steady loss: 2,100 kcal, −0.6 kg/week, daily logs", estimateMaintenance({
	now: NOW,
	weighIns: weighIns(56, (a) => 84 - 0.6 * ((56 - a) / 7)),
	intake: intake(56, 2100),
	profile,
	episodeStart: dayAgo(56),
}));

// 2. the case asked about: starts a diet, eats 2,300 and GAINS in the first fortnight
show("2. early gain: 2,300 kcal, +0.35 kg/week, 14 days", estimateMaintenance({
	now: NOW,
	weighIns: weighIns(14, (a) => 90 + 0.35 * ((14 - a) / 7)),
	intake: intake(14, 2300),
	profile,
	episodeStart: dayAgo(14),
}));

// 3. same gain, but the episode is 8 weeks old and the gain is only the last fortnight
show("3. gain after 6 weeks of losing: recent data should dominate", estimateMaintenance({
	now: NOW,
	weighIns: weighIns(56, (a) => (a > 14 ? 92 - 0.5 * ((56 - a) / 7) : 89 + 0.35 * ((14 - a) / 7))),
	intake: intake(56, 2400),
	profile,
	episodeStart: dayAgo(56),
}));

// 4. sparse: 4 weigh-ins, half the days logged
show("4. sparse data: 4 weigh-ins, 14 logged days", estimateMaintenance({
	now: NOW,
	weighIns: weighIns(28, (a) => 84 - 0.5 * ((28 - a) / 7), 7),
	intake: intake(28, 2100, 14),
	profile,
	episodeStart: dayAgo(28),
}));

// 5. a travel week 2 kg off the line
show("5. one implausible week (travel)", estimateMaintenance({
	now: NOW,
	weighIns: weighIns(56, (a) => (a >= 21 && a <= 27 ? 86.5 : 84 - 0.6 * ((56 - a) / 7))),
	intake: intake(56, 2100),
	profile,
	episodeStart: dayAgo(56),
}));

// 6. nothing at all
show("6. no data, profile only", estimateMaintenance({
	now: NOW,
	weighIns: [],
	intake: [],
	profile,
}));

// 7. the weekly action: never moves more than the cap
// A target far below the current goal, so the cap — not the gap — sets the pace.
const target = 1600;
let goal = 2400;
console.log("\n  weekly moves toward a low target (cap 150 early, 250 later):");
for (const week of [0, 1, 2, 3, 4, 8]) {
	goal = nextCalorieGoal(goal, target, week * 7, "medium");
	console.log(`    week ${week}: goal ${goal}`);
}
