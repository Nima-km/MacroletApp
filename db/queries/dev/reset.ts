import { db } from "@/db/client";
import { food, foodItem, ingredientItem, recipe, recipeBookItem } from "@/db/schema";

/**
 * Empty every food, log and recipe table on the device.
 *
 * Development only. Used after the catalogue's serving weights changed, because local
 * rows keep the numbers they were cached with and nothing re-fetches them in place.
 *
 * Kept deliberately: goals, macro splits, weigh-ins, serving presets and tag
 * preferences. They are settings, not food data.
 *
 * Children first, or the foreign keys reject the deletes.
 */
export async function resetLocalCatalogue() {
	const foodItems = await db.delete(foodItem).returning();
	const ingredients = await db.delete(ingredientItem).returning();
	const bookItems = await db.delete(recipeBookItem).returning();
	// food before recipe: `food.recipe_id` points at a recipe.
	const foods = await db.delete(food).returning();
	const recipes = await db.delete(recipe).returning();

	return {
		foodItems: foodItems.length,
		ingredients: ingredients.length,
		bookItems: bookItems.length,
		foods: foods.length,
		recipes: recipes.length,
	};
}
