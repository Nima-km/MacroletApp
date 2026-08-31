import { updateRecipeSlug } from "@/db/queries/recipe";
import { RecipeData } from "@/types/recipe";
import { useAuth } from "@clerk/expo";
import { useMutation } from "@tanstack/react-query";
import { updloadRecipe } from "../uploadRecipe";
import { queryClient } from "./useBarcodeLookup";

export const useUploadRecipe = () => {
	const { getToken } = useAuth();

	return useMutation({
		mutationFn: async (recipe: RecipeData) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			try {
				const result_slug = await updloadRecipe(recipe, token);
				if (recipe.recipeData.id)
					updateRecipeSlug(recipe.recipeData.id, result_slug);
				else throw Error("something went wrong");
			} catch (apiError) {
				console.warn("Uploading Recipe Failed:", apiError);
				throw apiError;
			}
			return recipe;
		},
		onSuccess: (data, variables, id) => {
			queryClient.invalidateQueries({ queryKey: ["food-history"] });
			queryClient.invalidateQueries({ queryKey: ["recipeBook-list"] });
			queryClient.invalidateQueries({ queryKey: ["recipe-list"] });
			queryClient.invalidateQueries({
				queryKey: ["recipe", data.recipeData.id],
			});
		},
	});
};
