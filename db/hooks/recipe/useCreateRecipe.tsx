import {
    createAndLogRecipeWithFoodAndIngredients,
    createRecipeWithFoodAndIngredients,
} from "@/db/queries/recipe";
import { FoodItemInsert } from "@/types/food";
import { RecipeData } from "@/types/recipe";
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
