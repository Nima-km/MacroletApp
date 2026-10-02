import { notSignedIn } from "../errors";
import { fetchCreatorProfile, fetchCreatorRecipes } from "@/api/creator";
import { useAuth } from "@clerk/expo";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export const useCreatorProfile = (username: string) => {
	const { getToken } = useAuth();

	return useQuery({
		queryKey: ["creator", "profile", username],
		queryFn: async () => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return fetchCreatorProfile(username, token);
		},
		enabled: !!username,
		staleTime: 1000 * 60 * 5,
		retry: false,
	});
};

export const useCreatorRecipes = (username: string) => {
	const { getToken } = useAuth();

	return useInfiniteQuery({
		queryKey: ["creator", "recipes", username],
		queryFn: async ({ pageParam = 1 }) => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return fetchCreatorRecipes(username, token, pageParam);
		},
		getNextPageParam: (lastPage) =>
			lastPage.pagination.hasNextPage
				? lastPage.pagination.page + 1
				: undefined,
		initialPageParam: 1,
		enabled: !!username,
		staleTime: 1000 * 60 * 5,
		retry: false,
	});
};
