import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	deleteRecipeBookApi,
	deleteRecipeFromBook,
	fetchCreatorRecipeBooks,
	fetchRecipesFromRecipeBook,
	postRecipeBook,
	postRecipeToBook,
	RecipeBookSummary,
} from "@/api/recipeBook";
import { useAuth } from "@clerk/expo";
import { RecipeCardData } from "../fetchDiscoverFeed";

export const useCreateRecipeBook = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: { name: string; pictures?: string[] }) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return postRecipeBook(body, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["creator", "profile"] });
		},
	});
};

export const useDeleteRecipeBook = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (recipeBook_id: number) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return deleteRecipeBookApi(recipeBook_id, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["creator", "profile"] });
		},
	});
};

export const useAddRecipeToBook = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			recipeBook_id,
			recipe_slug,
		}: {
			recipeBook_id: number;
			recipe_slug: string;
		}) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return postRecipeToBook(recipeBook_id, recipe_slug, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["creator", "profile"] });
		},
	});
};

export const useRemoveRecipeFromBook = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			recipeBook_id,
			recipe_slug,
		}: {
			recipeBook_id: number;
			recipe_slug: string;
		}) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return deleteRecipeFromBook(recipeBook_id, recipe_slug, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["creator", "profile"] });
		},
	});
};

export const useCreatorRecipeBooks = (username: string) => {
	const { getToken } = useAuth();

	return useQuery<RecipeBookSummary[], Error>({
		queryKey: ["recipebooks", "creator", username],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return fetchCreatorRecipeBooks(username, token);
		},
		enabled: !!username,
		staleTime: 1000 * 60 * 5,
	});
};

export const useRecipeBookRecipes = (recipeBook_slug: string) => {
	const { getToken } = useAuth();

	return useQuery<RecipeCardData[], Error>({
		queryKey: ["recipebooks", recipeBook_slug],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return fetchRecipesFromRecipeBook(recipeBook_slug, token);
		},
		enabled: !!recipeBook_slug,
		staleTime: 1000 * 60 * 5,
	});
};
