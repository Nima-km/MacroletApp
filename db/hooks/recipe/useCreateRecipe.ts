import {
    createAndLogOnlineRecipe,
    createAndLogRecipeWithFoodAndIngredients,
    createRecipeWithFoodAndIngredients,
    updateRecipe,
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
export const useUpdateRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ recipeData, recipe_Id }: UpdateRecipeProps) =>
            updateRecipe(recipe_Id, recipeData),
        onSuccess: (data, variables, id) => {
            console.log("Updated recipe", data);
            queryClient.invalidateQueries({ queryKey: ["food-history"] });
        },
    });
};
