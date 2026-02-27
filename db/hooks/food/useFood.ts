import {
    deleteFood,
    getFood,
    insertFoodAndItem,
    updateFood,
    updateFoodAndItem,
} from "@/db/queries/food";
import { FoodInsert, FoodItemData } from "@/types/food";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetFood = (foodID?: number, enabled = true) => {
    return useQuery({
        queryKey: ["food", foodID],
        queryFn: () => getFood(foodID!),
        enabled: enabled && !!foodID,
    });
};

export const useInsertFoodAndItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            foodData,
            foodItemData,
        }: {
            foodData: FoodInsert;
            foodItemData: FoodItemData;
        }) => insertFoodAndItem(foodData, foodItemData),
        onSuccess: (data, variables, id) => {
            queryClient.invalidateQueries({ queryKey: ["food", id] });
            queryClient.invalidateQueries({ queryKey: ["food-item"] });
            queryClient.invalidateQueries({ queryKey: ["food-history"] });
        },
    });
};
export const useUpdateFoodAndItem = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            foodData,
            foodItemData,
            foodItemID,
        }: {
            foodData: FoodInsert;
            foodItemData: FoodItemData;
            foodItemID: number;
        }) => updateFoodAndItem(foodData, foodItemData, foodItemID),
        onSuccess: (data, variables, id) => {
            queryClient.invalidateQueries({ queryKey: ["food", id] });
            queryClient.invalidateQueries({ queryKey: ["food-item"] });
            queryClient.invalidateQueries({ queryKey: ["food-history"] });
        },
    });
};

export const useUpdateFood = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: FoodInsert }) =>
            updateFood(id, data),
        onSuccess: (data, variables, id) => {
            queryClient.invalidateQueries({ queryKey: ["food", id] });
            queryClient.invalidateQueries({ queryKey: ["food-item"] });
            queryClient.invalidateQueries({ queryKey: ["food-history"] });
        },
    });
};

export const useDeleteFood = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteFood(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["food", id] });
            queryClient.invalidateQueries({ queryKey: ["food-item"] });
            queryClient.invalidateQueries({ queryKey: ["food-history"] });
        },
    });
};
