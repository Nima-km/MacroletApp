import { useAuth } from "@clerk/expo";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchFilteredRecipes, fetchRecipeFromSlug } from "../searchRecipe";

export function useFilteredRecipes(filters: any, title: string) {
	const { getToken, isSignedIn } = useAuth();
	return useQuery({
		queryKey: ["recipes", filters, title],
		enabled: isSignedIn, // don't run if not signed in
		placeholderData: keepPreviousData,
		staleTime: 1000 * 60 * 5,
		retry: (failureCount, error) => {
			console.log("error in useFilterREcipes", error.message);
			if (error.message === "No active subscription") return false; // don't retry expected errors
			return failureCount < 3; // retry up to 3 times for unexpected errors
		},
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("No auth token");

			return fetchFilteredRecipes({
				filters,
				title,
				token,
			});
		},
	});
}
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

			return fetchRecipeFromSlug(recipe_slug);
		},
	});
}
