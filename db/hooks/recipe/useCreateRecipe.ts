import {
	createAndLogOnlineRecipe,
	createAndLogRecipeWithFoodAndIngredients,
	createRecipeWithFoodAndIngredients,
	updateRecipe,
	updateRecipeSlug,
	updateRecipeWithFoodAndIngredients,
} from "@/db/queries/recipe";
import { FoodItemInsert } from "@/types/food";
import { RecipeData, RecipeInsert } from "@/types/recipe";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateRecipeWithFoodAndIngredients = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (recipeData: RecipeData) =>
			createRecipeWithFoodAndIngredients(
				recipeData.recipeData,
				recipeData.foodData,
				recipeData.ingredientItemsData,
			),
		onSuccess: (data) => {
			console.log("new recipe logged", data);
			queryClient.invalidateQueries({ queryKey: ["food-history"] });
			queryClient.invalidateQueries({ queryKey: ["recipeBook-list"] });
			queryClient.invalidateQueries({ queryKey: ["recipe-list"] });
		},
		onError: (error) => {
			console.log("something went wrong with saving recipe", error);
		},
	});
};

interface Props {
	recipeData: RecipeData;
	foodItem: Omit<FoodItemInsert, "food_id">;
}
export const useCreateAndLogRecipeWithFoodAndIngredients = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ recipeData, foodItem }: Props) =>
			createAndLogRecipeWithFoodAndIngredients(
				recipeData.recipeData,
				recipeData.foodData,
				foodItem,
				recipeData.ingredientItemsData,
			),
		onSuccess: (data) => {
			console.log("new recipe logged", data);
			queryClient.invalidateQueries({ queryKey: ["food-history"] });
			queryClient.invalidateQueries({ queryKey: ["recipeBook-list"] });
			queryClient.invalidateQueries({ queryKey: ["recipe-list"] });
		},
		onError: (error) => {
			console.log("something went wrong with saving recipe", error);
		},
	});
};
export const useCreateAndLogOnlineRecipe = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ recipeData, foodItem }: Props) =>
			createAndLogOnlineRecipe(
				recipeData.recipeData,
				recipeData.foodData,
				foodItem,
				recipeData.ingredientItemsData,
			),
		onSuccess: (data) => {
			console.log("new recipe logged", data);
			queryClient.invalidateQueries({ queryKey: ["food-history"] });
			queryClient.invalidateQueries({ queryKey: ["recipeBook-list"] });
			queryClient.invalidateQueries({ queryKey: ["recipe-list"] });
		},
		onError: (error) => {
			console.log("something went wrong with saving recipe", error);
		},
	});
};
interface UpdateRecipeProps {
	recipeData: RecipeInsert;
	recipe_Id: number;
}
/**
 * Saves changes over an existing local recipe: recipe row, its `food` row (which holds
 * the name), and its ingredient list, in one transaction.
 *
 * This is what the edit path uses. `useCreateRecipeWithFoodAndIngredients` *inserts*,
 * so saving an edited recipe with it silently produces a duplicate.
 */
export const useUpdateRecipeWithFoodAndIngredients = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: RecipeData) =>
			updateRecipeWithFoodAndIngredients(
				data.recipeData.id as number,
				data.recipeData,
				data.foodData as never,
				// The draft stores the ingredient item alongside its food; the query
				// wants the item alone, minus the recipe id it sets itself.
				data.ingredientItemsData.map(
					(item) => item.ingredientItem,
				) as Parameters<
					typeof updateRecipeWithFoodAndIngredients
				>[3],
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["food-history"] });
			queryClient.invalidateQueries({ queryKey: ["recipeBook-list"] });
			queryClient.invalidateQueries({ queryKey: ["recipe-list"] });
		},
	});
};

export const useUpdateRecipe = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ recipeData, recipe_Id }: UpdateRecipeProps) =>
			updateRecipe(recipe_Id, recipeData),
		onSuccess: (data, variables, id) => {
			console.log("Updated recipe", data);
			queryClient.invalidateQueries({ queryKey: ["food-history"] });
			queryClient.invalidateQueries({ queryKey: ["recipeBook-list"] });
			queryClient.invalidateQueries({ queryKey: ["recipe-list"] });
		},
	});
};
interface UpdateRecipeSlugProps {
	recipe_slug: string;
	recipe_Id: number;
}
export const useUpdateSlugRecipe = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ recipe_slug, recipe_Id }: UpdateRecipeSlugProps) =>
			updateRecipeSlug(recipe_Id, recipe_slug),
		onSuccess: (data, variables, id) => {
			console.log("Updated recipe", data);
			queryClient.invalidateQueries({ queryKey: ["food-history"] });
			queryClient.invalidateQueries({ queryKey: ["recipeBook-list"] });
			queryClient.invalidateQueries({ queryKey: ["recipe-list"] });
		},
	});
};
