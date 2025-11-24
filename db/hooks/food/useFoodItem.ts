import { insertFoodItem, insertFoodItems } from "@/db/queries/food";
import { useMutation, useQueryClient } from "@tanstack/react-query";



export const useInsertFoodItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertFoodItem,
    onSuccess: () => {
      // Invalidate or refetch list of food items, if any
      queryClient.invalidateQueries({ queryKey: ["food-history"], exact: false});
    },
  });
};
export const useInsertFoodItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertFoodItems,
    onSuccess: () => {
      // Invalidate or refetch list of food items, if any
      queryClient.invalidateQueries({ queryKey: ["food-history"], exact: false});
    },
  });
};