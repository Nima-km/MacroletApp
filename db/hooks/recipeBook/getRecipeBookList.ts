import { getAllRecipeList, getRecipeBookList } from "@/db/queries/recipeBook";
import { useQuery } from "@tanstack/react-query";

export const useGetRecipeBookList = () => {
    return useQuery({
        queryKey: ["recipeBook-list"],
        queryFn: () => getRecipeBookList(),
        staleTime: 1000 * 60 * 5,
    });
};
export const useGetAllRecipeList = () => {
    return useQuery({
        queryKey: ["recipe-list"],
        queryFn: () => getAllRecipeList(),
        staleTime: 1000 * 60 * 5,
    });
};
