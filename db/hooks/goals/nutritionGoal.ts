import { getNutriGoals, insertNutritionGoal } from "@/db/queries/nutritionGoals";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


export const useGetNutriGoals = () => {
    return useQuery({
        queryKey: ["nutrition-goals"],
        queryFn: getNutriGoals,
        staleTime: 1000 * 60 * 5,
    });
};

export const useInsertNutritionGoal = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: insertNutritionGoal,
        onSuccess: newNutritionGoal => {
            queryClient.setQueryData(["nutrition-goals"], newNutritionGoal)
            queryClient.invalidateQueries({ queryKey:["nutrition-goals"]})
            console.log('inserted goal')
        }
    })
}