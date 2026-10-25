import { queryClient } from "@/api/hooks/useBarcodeLookup";
import {
	getAllRecipeList,
	getRecipeBookList,
	getRecentRecipeList,
} from "@/db/queries/recipeBook";
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
export const useGetRecentRecipeList = (limit = 6) => {
	return useQuery({
		queryKey: ["recipe-list", "recent", limit],
		queryFn: () => getRecentRecipeList(limit),
		// Shorter than the full list: "what I ate last" changes as you log.
		staleTime: 1000 * 60 * 2,
	});
};

export const prefetchGetAllRecipeList = async () => {
	await queryClient.prefetchQuery({
		queryKey: ["recipe-list"],
		queryFn: getAllRecipeList,
	});
};
