import { db } from "@/db/client";
import { nutritionGoal } from "@/db/schema";
import { nutritionGoalInsert } from "@/types/goals";
import { desc } from 'drizzle-orm';


export const getNutriGoals = async () => {
  const result = db.select().from(nutritionGoal).orderBy(desc(nutritionGoal.timestamp)).limit(1)

  return result
};

export const insertNutritionGoal = async (sumNutrition : nutritionGoalInsert) => {
  console.log('insertNutritionGoal')
  return db.insert(nutritionGoal).values(sumNutrition)
};