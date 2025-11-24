import { getFoodItemHistory, getFoodItemSum } from "@/db/queries/history";
import { useQuery } from "@tanstack/react-query";

export const useGetFoodItemSum = (from: Date, to: Date) => {
  
  return useQuery({
    queryKey: ["daily-sum-history", "food-history", from.toISOString(), to.toISOString()],
    queryFn: () => getFoodItemSum(from, to),
  });
};

export const useGetFoodItemList = (from: Date, to: Date) => {
  return useQuery({
    queryKey: ["food-history", from.toISOString(), to.toISOString()],
    queryFn: () => getFoodItemHistory(from, to),
    staleTime: 1000 * 60 * 5,
  });
};
