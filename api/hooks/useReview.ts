import { notSignedIn } from "../errors";
import {
	fetchRecipeReviews,
	postCreatorResponse,
	postReport,
	postReview,
} from "@/api/review";
import { useAuth } from "@clerk/expo";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useRecipeReviews = (recipe_slug: string) => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();
	return useQuery({
		queryKey: ["reviews", recipe_slug],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return fetchRecipeReviews(recipe_slug, token);
		},
		enabled: !!recipe_slug,
		staleTime: 1000 * 60 * 5,
	});
};

export const useCreateReview = (recipe_slug: string) => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: { rating: number; content?: string }) => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return postReview(recipe_slug, body, token);
		},
		onSuccess: () => {
			// Invalidate so the reviews list refreshes
			queryClient.invalidateQueries({
				queryKey: ["reviews", recipe_slug],
			});
		},
	});
};

/*
export const useUpdateReview = (recipe_slug: string) => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: { rating?: number; content?: string }) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return patchReview(recipe_slug, body, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["reviews", recipe_slug],
			});
		},
	});
};
*/
export const useCreatorResponse = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			review_id,
			recipe_slug,
			content,
		}: {
			review_id: number;
			recipe_slug: string;
			content: string;
		}) => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return postCreatorResponse(review_id, content, token);
		},
		onSuccess: (_, { recipe_slug }) => {
			queryClient.invalidateQueries({
				queryKey: ["reviews", recipe_slug],
			});
		},
	});
};

export const useReportRecipe = (recipe_slug: string) => {
	const { getToken } = useAuth();

	return useMutation({
		mutationFn: async (body: {
			reason: string;
			details?: string | null;
		}) => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return postReport(recipe_slug, body, token);
		},
	});
};
