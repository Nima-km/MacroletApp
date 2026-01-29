import {
  getIngredientsFromFoodID,
  getRecipeFromFoodID,
  getRecipeFromRecipeID,
} from "@/db/queries/recipe";
import { useQuery } from "@tanstack/react-query";

export const useGetRecipeFromFoodID = (foodID?: number, enabled = true) => {
    return useQuery({
        queryKey: ["recipe", foodID],
        queryFn: () => getRecipeFromFoodID(foodID!),
        enabled: enabled && !!foodID,
    });
};
export const useGetIngredientsFromFoodID = (
    foodID?: number,
    enabled = true,
) => {
    return useQuery({
        queryKey: ["ingredients-from-foodID", foodID],
        queryFn: () => getIngredientsFromFoodID(foodID!),
        enabled: enabled && !!foodID,
    });
};
export const useGetRecipeFromRecipeID = (recipeID?: number, enabled = true) => {
    return useQuery({
        queryKey: ["recipe-from-recipe-id", recipeID],
        queryFn: () => getRecipeFromRecipeID(recipeID!),
        enabled: enabled && !!recipeID,
    });
};
