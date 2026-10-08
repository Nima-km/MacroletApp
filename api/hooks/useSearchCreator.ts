import { notSignedIn } from "../errors";
import {
	fetchCreatorSearch,
	MIN_SEARCH_LENGTH,
} from "../searchCreator";
import { useAuth } from "@clerk/expo";
import { useInfiniteQuery } from "@tanstack/react-query";

/**
 * Account results for the Discover search.
 *
 * Mirrors `useFilteredRecipes` so the two tabs of the same screen paginate and
 * gate identically. The query key prefix is `["creators", "search", …]` because
 * the follow mutation invalidates that prefix to refresh follower counts and
 * follow state.
 */
export const useSearchCreators = (committedSearch: string) => {
	const { getToken } = useAuth();

	return useInfiniteQuery({
		queryKey: ["creators", "search", committedSearch],
		queryFn: async ({ pageParam = 1 }) => {
			const token = await getToken();
			if (!token) throw notSignedIn();
			return fetchCreatorSearch({
				query: committedSearch,
				token,
				page: pageParam,
			});
		},
		getNextPageParam: (lastPage) =>
			lastPage.pagination?.hasNextPage
				? lastPage.pagination.page + 1
				: undefined,
		initialPageParam: 1,
		enabled: committedSearch.length >= MIN_SEARCH_LENGTH,
		retry: false,
	});
};
