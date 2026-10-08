import { notSignedIn } from "../errors";
import { useAuth } from "@clerk/expo";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
	fetchAuthorFromSlug,
	fetchFilteredRecipes,
	fetchRecipeFromSlug,
} from "../searchRecipe";
export type RecipeFilters = {
	search?: string;
	minCalories?: number;
	maxCalories?: number;
	minProtein?: number;
	maxProtein?: number;
	minCarbs?: number;
	maxCarbs?: number;
	minFat?: number;
	maxFat?: number;
	minServings?: number;
	maxServings?: number;
};

export const useFilteredRecipes = (
	filters: Record<string, any>,
	committedSearch: string,
) => {
	const { getToken } = useAuth();

	return useInfiniteQuery({
		queryKey: ["recipes", "search", filters, committedSearch],
		queryFn: async ({ pageParam = 1 }) => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return fetchFilteredRecipes({
				filters,
				title: committedSearch,
				token,
				page: pageParam,
			});
		},
		getNextPageParam: (lastPage) =>
			lastPage.pagination?.hasNextPage
				? lastPage.pagination.page + 1
				: undefined,
		initialPageParam: 1,
		enabled: committedSearch.length >= 3,
		retry: false,
	});
};
export function useGetRecipeFromSlug(recipe_slug: string) {
	const { getToken, isSignedIn } = useAuth();
	console.log("useGetRecipeFromSlug gets called", isSignedIn);
	return useQuery({
		queryKey: ["online-recipes", recipe_slug],
		enabled: isSignedIn, // don't run if not signed in
		staleTime: 1000 * 60 * 5,
		queryFn: async () => {
			const token = await getToken();

			if (!token) throw new Error("No auth token");

			return fetchRecipeFromSlug(recipe_slug, token);
		},
	});
}
export function useGetAuthorFromSlug(recipe_slug: string) {
	const { getToken, isSignedIn } = useAuth();
	console.log("useGetAuthorFromSlug gets called", isSignedIn);
	return useQuery({
		queryKey: ["online-authors", recipe_slug],
		enabled: isSignedIn, // don't run if not signed in
		staleTime: 1000 * 60 * 5,
		queryFn: async () => {
			const token = await getToken();

			if (!token) throw new Error("No auth token");

			return fetchAuthorFromSlug(recipe_slug);
		},
	});
}
