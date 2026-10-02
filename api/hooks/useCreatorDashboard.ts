import { useAuth } from "@clerk/expo";
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

import { PaginatedDashboardRecipes } from "@/types/dashboard";
import {
	archiveRecipe,
	fetchCreatorOverview,
	fetchCreatorRecipes,
	fetchPayoutHistory,
	fetchRecipeAnalytics,
	fetchTopPerformingRecipes,
	publishRecipe,
} from "../creatorDashboard";

export const useCreatorOverview = () => {
	const { getToken } = useAuth();

	return useQuery({
		queryKey: ["dashboard", "overview"],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return fetchCreatorOverview(token);
		},
		staleTime: 1000 * 60 * 5,
	});
};

export const useDashboardRecipes = () => {
	const { getToken } = useAuth();

	return useInfiniteQuery<PaginatedDashboardRecipes, Error>({
		queryKey: ["dashboard", "recipes"],
		queryFn: async ({ pageParam = 1 }) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return fetchCreatorRecipes(token, pageParam as number);
		},
		getNextPageParam: (lastPage) =>
			lastPage.pagination.hasNextPage
				? lastPage.pagination.page + 1
				: undefined,
		initialPageParam: 1,
		staleTime: 1000 * 60 * 5,
	});
};

export const useRecipeAnalytics = (recipe_slug: string) => {
	const { getToken } = useAuth();

	return useQuery({
		queryKey: ["dashboard", "analytics", recipe_slug],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return fetchRecipeAnalytics(recipe_slug, token);
		},
		enabled: !!recipe_slug,
		staleTime: 1000 * 60 * 5,
	});
};

export const usePayoutHistory = () => {
	const { getToken } = useAuth();

	return useQuery({
		queryKey: ["dashboard", "payouts"],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return fetchPayoutHistory(token);
		},
		staleTime: 1000 * 60 * 5,
	});
};

export const useTopPerformingRecipes = () => {
	const { getToken } = useAuth();

	return useQuery({
		queryKey: ["dashboard", "top"],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return fetchTopPerformingRecipes(token);
		},
		staleTime: 1000 * 60 * 5,
	});
};

export const useArchiveRecipe = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (recipe_slug: string) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return archiveRecipe(recipe_slug, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["dashboard", "recipes"],
			});
			queryClient.invalidateQueries({
				queryKey: ["dashboard", "overview"],
			});
		},
	});
};

export const usePublishRecipe = () => {
	const { getToken } = useAuth();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (recipe_slug: string) => {
			const token = await getToken();
			if (!token) throw new Error("Not authenticated");
			return publishRecipe(recipe_slug, token);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["dashboard", "recipes"],
			});
			queryClient.invalidateQueries({
				queryKey: ["dashboard", "overview"],
			});
		},
	});
};
/*
export const useDeleteRecipe = () => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipe_slug: string) => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return deleteRecipe(recipe_slug, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'recipes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'top'] });
    },
  });
};*/
