import { db } from "@/db/client";
import { weightGoal } from "@/db/schema";
import { startedAtFor } from "@/helper/weightGoal";
import { WeightGoalGet, WeightGoalInput } from "@/types/weightGoal";
import { asc, desc } from "drizzle-orm";

/** The active goal: the newest row, or null when there is none. */
export async function getLatestWeightGoal(): Promise<WeightGoalGet | null> {
	const rows = await db
		.select()
		.from(weightGoal)
		.orderBy(desc(weightGoal.created_at), desc(weightGoal.id))
		.limit(1);
	return rows[0] ?? null;
}

/**
 * Save a goal.
 *
 * Appends a row rather than updating one, matching the other goal tables. `started_at`
 * is inherited when only the numbers change: changing a target weight mid-diet is the
 * same episode, and restarting it would make the estimator skip the water-drop window a
 * second time. Switching kind is a new episode and starts the clock again.
 */
export async function saveWeightGoal(input: WeightGoalInput): Promise<WeightGoalGet> {
	const previous = await getLatestWeightGoal();
	const now = new Date();
	const startedAt = startedAtFor(previous, input.kind, now);

	const [row] = await db
		.insert(weightGoal)
		.values({
			kind: input.kind,
			target_weight: input.targetWeight,
			tolerance: input.kind === "maintain" ? (input.tolerance ?? null) : null,
			target_date: input.targetDate ?? null,
			started_at: startedAt,
			created_at: now,
		})
		.returning();

	return row;
}

/**
 * Remove the goal.
 *
 * A user who hits their target, gives up, or switches to no goal needs a way out, and a
 * deleted history has no reader today — the estimator keys off `started_at` on the row
 * that exists. If goal history ever matters, this becomes a tombstone instead.
 */
export async function clearWeightGoal(): Promise<void> {
	await db.delete(weightGoal);
}

/** Every goal ever set, oldest first. The chart draws these as steps over time. */
export async function getAllWeightGoals(): Promise<WeightGoalGet[]> {
	return db
		.select()
		.from(weightGoal)
		.orderBy(asc(weightGoal.started_at), asc(weightGoal.id));
}
