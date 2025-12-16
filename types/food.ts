import { food, foodItem } from "@/db/schema";

export type FoodInsert = typeof food.$inferInsert;
export type FoodItemInsert = typeof foodItem.$inferInsert
export type FoodType = Omit<FoodInsert, 'id'>
export type FoodItemType = Omit<FoodItemInsert, 'id'>


export type MacroType = {
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  calories?: number
}
