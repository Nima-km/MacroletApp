import { nutritionGoal } from "@/db/schema";

export type nutritionGoalInsert = typeof nutritionGoal.$inferInsert;
export type nutritionGoalGet = typeof nutritionGoal.$inferSelect;
