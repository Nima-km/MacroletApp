import { RecipeData } from "@/types/recipe";

export function transformRecipeForAPIOLD(data: RecipeData) {
	return {
		title: data.foodData.name,
		description: data.recipeData.description ?? "",
		instructions: data.recipeData.directions?.map((d) => d.text).join("\n"),
		servings: data.recipeData.servings_yield ?? 1,
		prep_time: data.recipeData.prep_time ?? 0,
		cook_time: data.recipeData.cook_time ?? 0,
		tags: data.recipeData.tags?.map((t) => t.tag) ?? [],

		ingredients: data.ingredientItemsData.map((item) => ({
			ingredientItem: {
				quantity: item.ingredientItem.servings,
				serving_mult: item.ingredientItem.serving_mult,
				unit: item.ingredientItem.serving_type,
			},
			food: {
				name: item.food.name,
				barcode: item.food.barcode,
				protein: item.food.protein,
				carbs: item.food.carbs,
				fat: item.food.fat,
				serving_100g: item.food.serving_100g,
				volume_100ml: item.food.volume_100ml,
				micronutrients: item.food.micro_nutriants ?? {},
			},
		})),
	};
}
export function transformRecipeForAPI(data: RecipeData) {
	return {
		name: data.foodData.name,
		description: data.recipeData.description ?? "",
		note: data.recipeData.note ?? "",
		servings_yield: data.recipeData.servings_yield ?? 1,
		prep_time: data.recipeData.prep_time ?? 0,
		cook_time: data.recipeData.cook_time ?? 0,
		directions: data.recipeData.directions ?? [],
		tags: data.recipeData.tags ?? [],
		// IMPLEMENT THIS FOR IMAGES bannerImage: "https://example.com/image.jpg",
		ingredients: data.ingredientItemsData.map((item) => ({
			prep_notes: item.ingredientItem.prep_notes ?? undefined,
			display_name: item.ingredientItem.display_name ?? undefined,
			serving_mult: item.ingredientItem.serving_mult,
			serving_type: item.ingredientItem.serving_type,
			servings: item.ingredientItem.servings,
			barcode: item.food.barcode,
		})),
	};
}
export function transformRecipeFromAPI(apiRecipe: any): RecipeData {
	return {
		recipeData: apiRecipe.recipeData,
		foodData: apiRecipe.foodData,
		ingredientItemsData: apiRecipe.ingredientItemsData,
	};
}
export function transformRecipesFromAPI(
	apiRecipes: any,
): Omit<RecipeData, "ingredientItemsData">[] {
	return apiRecipes.map((apiRecipe: any) => ({
		recipeData: {
			recipe_slug: apiRecipe.recipe_slug,
			description: apiRecipe.description,
			servings_yield: apiRecipe.servings_yield,
			prep_time: apiRecipe.prep_time,
			cook_time: apiRecipe.cook_time,
			note: apiRecipe.note,
			bannerImage: apiRecipe.bannerImage ?? null,

			directions: apiRecipe.directions,

			tags: apiRecipe.tags,
		},

		// Not really needed globally but keeping structure intact
		foodData: {
			name: apiRecipe.name,
			protein: apiRecipe.protein,
			fat: apiRecipe.fat,
			carbs: apiRecipe.carbs,
			fiber: apiRecipe.fiber,
			serving_100g: 0,
			volume_100ml: 0,
			micro_nutriants: {},
		},
	}));
}
