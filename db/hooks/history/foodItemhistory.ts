import {
    getFoodItemHistory,
    getFoodItemRecent,
    getFoodItemSum,
} from "@/db/queries/history";
import { useQuery } from "@tanstack/react-query";

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
export const useGetFoodItemRecent = (showRecipe?: boolean) => {
    return useQuery({
        queryKey: ["food-history", "recent", showRecipe],
        queryFn: () => getFoodItemRecent({ showRecipe }),
        //  staleTime: 1000 * 60 * 5,
    });
};
