import { weightGoal } from "@/db/schema";

/**
 * `maintain` also covers recomp — see docs/WEIGHT_GOALS.md §5. They differ in intent but
 * not in what the app can observe: both want the trend flat, so one kind judges both.
 */
export type WeightGoalKind = "lose" | "gain" | "maintain";

export type WeightGoalGet = typeof weightGoal.$inferSelect;
export type WeightGoalInsert = typeof weightGoal.$inferInsert;

/**
 * What the UI hands over.
 *
 * Weights are **grams**, like everything stored — the form converts from whichever unit
 * is on screen before it gets here.
 */
export type WeightGoalInput = {
	kind: WeightGoalKind;
	targetWeight: number;
	/** Band half-width in grams. Only meaningful for `maintain`. */
	tolerance?: number | null;
	targetDate?: Date | null;
};
