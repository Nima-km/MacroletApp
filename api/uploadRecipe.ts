import { toApiError } from "./errors";
import { RecipeData } from "@/types/recipe";
import { transformRecipeForAPI } from "./tranformers";

export async function updloadRecipe(
	recipe: RecipeData,
	token: string,
): Promise<string> {
	if (recipe.recipeData.recipe_slug) {
		throw new Error("recipe has been uploaded already");
	}
	const payload = transformRecipeForAPI(recipe);
	console.log("this is the payload", payload.ingredients);
	const response = await fetch(
		`${process.env.EXPO_PUBLIC_API_URL}/recipes/`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(payload),
		},
	);
	if (!response.ok) throw await toApiError(response);

	const apiRecipe = await response.json();
	const result = apiRecipe;
	console.log("the result for uploading recipe: ", result);
	return result;
}
