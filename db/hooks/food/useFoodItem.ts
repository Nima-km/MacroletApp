import { deleteFoodItem, getFoodItem, insertFoodItem, insertFoodItems, updateFoodItem } from "@/db/queries/food";
import { FoodItemData } from "@/types/food";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";




export const useGetFoodItem = (foodItemID: number, enabled = true) => {
  console.log('useGetFoodItem gets init')
  return useQuery({
    queryKey: ['food-item', foodItemID],
    queryFn: () => getFoodItem(foodItemID),
    enabled: enabled && !!foodItemID, // prevent query unless foodItemID is truthy
  });
};

export const useInsertFoodItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertFoodItem,
    onSuccess: () => {
      // Invalidate or refetch list of food items, if any
      queryClient.invalidateQueries({ queryKey: ["food-history"] });
    },
  });
};
export const useInsertFoodItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: insertFoodItems,
    onSuccess: () => {
      // Invalidate or refetch list of food items, if any
      queryClient.invalidateQueries({ queryKey: ["food-history"] });
    },
  });
};

export const useUpdateFoodItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FoodItemData }) =>
      updateFoodItem(id, data),
    onSuccess: (data, variables, id) => {
      queryClient.invalidateQueries({ queryKey: ['food-item', id] });
      queryClient.invalidateQueries({ queryKey: ["food-history"] });
    },
  });
};

export const useDeleteFoodItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteFoodItem(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['food-item', id] });
      queryClient.invalidateQueries({ queryKey: ["food-history"] });
    },
  });
};