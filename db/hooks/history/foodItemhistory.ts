import { queryClient } from "@/api/hooks/useBarcodeLookup";
import {
	getDailyFoodSums,
	getFoodItemHistory,
	getFoodItemRecent,
	getFoodItemSum,
	Period,
} from "@/db/queries/history";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

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
export const useGetDailyFoodSums = (from: Date, to: Date, period: Period) => {
	return useQuery({
		queryKey: [
			"food-history",
			"daily-food-sums",
			from.toISOString(),
			to.toISOString(),
		],
		queryFn: () => getDailyFoodSums(from, to, period),
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
export const useGetFoodItemRecent = (showRecipe?: boolean, term = "") => {
	return useQuery({
		queryKey: ["food-history", "recent", showRecipe, term],
		queryFn: () => getFoodItemRecent({ showRecipe, term }),
		// Keeps the previous rows on screen while a new term is queried, so typing
		// doesn't flash an empty list between keystrokes.
		placeholderData: keepPreviousData,
	});
};
export const prefetchGetFoodItemRecent = async () => {
	await queryClient.prefetchQuery({
		queryKey: ["food-history", "recent", true, ""],
		queryFn: () => getFoodItemRecent({ showRecipe: true, term: "" }),
	});
};
