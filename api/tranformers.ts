import { RecipeData } from "@/types/recipe";

export function transformRecipeForAPI(data: RecipeData) {
    return {
        title: data.foodData.name,
        slug: data.recipeData.recipe_slug,
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
                micronutrients: item.food.micro_nutriants ?? {},
            },
        })),
    };
}
export function transformRecipeFromAPI(apiRecipe: any): RecipeData {
    return {
        recipeData: {
            id: apiRecipe.id,
            recipe_slug: apiRecipe.slug,
            description: apiRecipe.description,
            servings_yield: apiRecipe.servings,
            prep_time: apiRecipe.prep_time,
            cook_time: apiRecipe.cook_time,
            note: null,
            bannerImage: apiRecipe.cover_image ?? null,

            directions: apiRecipe.instructions
                ? apiRecipe.instructions
                      .split("\n")
                      .map((text: string, index: number) => ({
                          id: index.toString(),
                          text,
                          photo: "",
                      }))
                : [],

            tags:
                apiRecipe.tags_detail?.map((tag: string) => ({
                    tag,
                })) ?? [],
        },

        // Not really needed globally but keeping structure intact
        foodData: {
            name: apiRecipe.title,
            protein: apiRecipe.protein,
            fat: apiRecipe.fat,
            carbs: apiRecipe.carbs,
            fiber: 0,
            serving_100g: 100,
            volume_100ml: 100,
            micro_nutriants: {},
        },

        ingredientItemsData: apiRecipe.ingredients_detail?.map((item: any) => ({
            food: {
                id: 0, // if not returned by API
                name: item.ingredient_name,
                recipe_id: apiRecipe.id,
                nickname: null,
                protein: item.protein / item.quantity / item.serving_mult,
                fat: item.fat / item.quantity / item.serving_mult,
                carbs: item.carbs / item.quantity / item.serving_mult,
                fiber: 0,
                barcode: null,
                serving_100g: 100,
                volume_100ml: 100,
                micro_nutriants: {},
            },

            ingredientItem: {
                servings: item.quantity,
                serving_mult: item.serving_mult,
                serving_type: item.unit,
                prep_notes: null,
                display_name: item.ingredient_name,
            },
        })),
    };
}
export function transformRecipesFromAPI(recipes: any[]): RecipeData[] {
    return recipes.map(transformRecipeFromAPI);
}
