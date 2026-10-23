import { queryClient } from "@/api/hooks/useBarcodeLookup";
import {
	getDailyFoodSums,
	getFoodItemHistory,
	getFoodItemRecent,
	getFoodItemSum,
	Period,
	RECENT_LIST_LIMIT,
} from "@/db/queries/history";
import {
	keepPreviousData,
	useInfiniteQuery,
	useQuery,
} from "@tanstack/react-query";

// for retrieving the total sum of macros logged in foodItem from-to date
export const useGetFoodItemSum = (from: Date, to: Date) => {
	return useQuery({
		queryKey: [
			"food-history",
			"food-sum",
			from.toISOString(),
			to.toISOString(),
		],
		queryFn: () => getFoodItemSum(from, to),
	});
};
// for retrieving daily sums of macros, from a date to a date (used to display daily history)
export const useGetDailyFoodSums = (from: Date, to: Date) => {
	return useQuery({
		queryKey: [
			"food-history",
			"daily-food-sums",
			from.toISOString(),
			to.toISOString(),
		],
		queryFn: () => getDailyFoodSums(from, to),
	});
};
// for retreving the history of foods ate from-to date
export const useGetFoodItemList = (from: Date, to: Date) => {
	return useQuery({
		queryKey: [
			"food-history",
			"food-list",
			from.toISOString(),
			to.toISOString(),
		],
		queryFn: () => getFoodItemHistory(from, to),
		staleTime: 1000 * 60 * 5,
	});
};

// for retreving recently logged foods
/**
 * Rows per page. The empty term is the short "recent" list; a typed search is a
 * browsing list, so it gets a real page size and infinite scroll.
 */
export const RECENT_SEARCH_PAGE_SIZE = 20;

export const useGetFoodItemRecent = (showRecipe?: boolean, term = "") => {
	const pageSize = term.trim() ? RECENT_SEARCH_PAGE_SIZE : RECENT_LIST_LIMIT;

	return useInfiniteQuery({
		queryKey: ["food-history", "recent", showRecipe, term],
		queryFn: ({ pageParam }) =>
			getFoodItemRecent({
				showRecipe,
				term,
				limit: pageSize,
				offset: pageParam,
			}),
		initialPageParam: 0,
		// A short page means the end; otherwise the next starts after what we have.
		getNextPageParam: (lastPage, pages) =>
			lastPage.length < pageSize ? undefined : pages.length * pageSize,
		// Keeps the previous rows on screen while a new term is queried, so typing
		// doesn't flash an empty list between keystrokes.
		placeholderData: keepPreviousData,
	});
};
export const prefetchGetFoodItemRecent = async () => {
	await queryClient.prefetchInfiniteQuery({
		queryKey: ["food-history", "recent", true, ""],
		queryFn: () =>
			getFoodItemRecent({
				showRecipe: true,
				term: "",
				limit: RECENT_LIST_LIMIT,
				offset: 0,
			}),
		initialPageParam: 0,
	});
};
