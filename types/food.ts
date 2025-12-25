import { food, foodItem } from "@/db/schema";

export type FoodInsert = typeof food.$inferInsert;
export type FoodGet = typeof food.$inferSelect;
export type FoodItemInsert = typeof foodItem.$inferInsert
export type FoodType = Omit<FoodInsert, 'id'>
export type FoodItemType = Omit<FoodItemInsert, 'id'>
export type FoodItemData = Omit<FoodItemType, 'food_id'>
export type FoodFullData = {
  food: FoodGet
  foodItem: FoodItemData
}


export type MacroType = {
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
  calories?: number
}
