import { RecipeData } from "@/types/recipe";
import { transformRecipeForAPI, transformRecipeFromAPI } from "./tranformers";

export async function updloadRecipe(
    recipe: RecipeData,
    token: string,
): Promise<RecipeData> {
    const payload = transformRecipeForAPI(recipe);
    console.log("this is the payload", payload.ingredients);
    const response = await fetch("https://macrolet.onrender.com/recipes/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
    }

    const apiRecipe = await response.json();

    return transformRecipeFromAPI(apiRecipe);
}
