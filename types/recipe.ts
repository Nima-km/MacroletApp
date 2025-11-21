import { ingredientItem, recipe } from "@/db/schema";
import { FoodInsert } from "./food";

export type RecipeInsert = typeof recipe.$inferInsert;
export type IngredientItemInsert = typeof ingredientItem.$inferInsert



export type RecipeType = {
    name: string,
    servings_yield: number,
    directions: string,
    prep_time: number,
    cook_time: number,
}
export type RecipeData = {
  recipeData: RecipeInsert,
  foodData: Omit<FoodInsert, 'recipe_id'>,
  ingredientItemsData: Array<Omit<IngredientItemInsert, 'recipe_id'>>
}

export type IngredientItemType = {
  recipe_id: number;
  servings: number;
  serving_mult: number;
  serving_type: string;
}