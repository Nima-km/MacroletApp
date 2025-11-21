import { food, foodItem } from "@/db/schema";

export type FoodInsert = typeof food.$inferInsert;
export type FoodItemInsert = typeof foodItem.$inferInsert

export type FoodType = {
  name: string;
  nickname: string | null;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  barcode: number;
  serving_100g: number;
  volume_100g: number;
  recipe_id: number | null;
}

export type FoodItemType = {
  timestamp: Date;
  food_id: number;
  servings: number;
  serving_mult: number;
  serving_type: string;
}

export type MacroType = {
  protein: number,
  carbs: number,
  fat: number,
  fiber: number,
}



/*

/////// DELETE FROM HERE
// FIX THE ? after your done with testing
export type FoodRaw = {
  id: number;
  name: string
  description: string;
  protein: number;
  fat: number;
  calories: number | null;
  carbs: number;
  fiber: number;
  barcode: number | null;
  is_recipe: boolean;
  is_template: boolean;
  serving_100g: number;
  volume_100g: number;
}
export type FoodRawNoId = {
  id?: number;
  name: string
  description: string;
  protein: number;
  fat: number;
  calories: number | null;
  carbs: number;
  fiber: number;
  barcode: number | null;
  is_recipe: boolean;
  is_template: boolean;
  serving_100g: number;
  volume_100g: number;
}
export const DefaultFoodRawNoId: FoodRawNoId = {
  name: '',
  description: '',
  protein: 0,
  fat: 0,
  carbs: 0,
  fiber: 0,
  is_recipe: false,
  is_template: false,
  serving_100g: 1,
  volume_100g: 1,
  calories: null,
  barcode: null,
}
export type FoodItemRaw = {
  id: number;
  timestamp: Date;
  food_id: number;
  servings: number;
  serving_mult: number;
  serving_type: string;
}
export type FoodItemRawNoId = {
  id?: number;
  timestamp: Date;
  food_id: number;
  servings: number;
  serving_mult: number;
  serving_type: string;
}
  */