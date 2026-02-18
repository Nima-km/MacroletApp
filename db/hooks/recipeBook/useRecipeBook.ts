import {
    getRecipeBookData,
    insertRecipeBook,
    insertRecipeBookItem,
} from "@/db/queries/recipeBook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetRecipeBook = (recipeBookID: number) => {
    return useQuery({
        queryKey: ["recipeBook", recipeBookID],
        queryFn: () => getRecipeBookData(recipeBookID),
        staleTime: 1000 * 60 * 5,
    });
};
export const useInsertRecipeBook = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: insertRecipeBook,

        onSuccess: () => {
            // Invalidate or refetch list of food items, if any
            queryClient.invalidateQueries({ queryKey: ["recipeBook-list"] });
        },
    });
};
export const useInsertRecipeBookItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: insertRecipeBookItem,

        onSuccess: (item) => {
            // Invalidate or refetch list of food items, if any
            queryClient.invalidateQueries({
                queryKey: ["recipeBook-list"],
            });
        },
    });
};
