import { getWeightHistory, insertWeight } from "@/db/queries/weight";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetWeightList = (
    from: Date,
    to: Date,
    period?: "day" | "week" | "month",
) => {
    return useQuery({
        queryKey: ["weight-history", from.toISOString(), to.toISOString()],
        queryFn: () => getWeightHistory(from, to, period),
    });
};

export const useInsertWeight = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: insertWeight,
        onSuccess: () => {
            // Invalidate or refetch list of food items, if any
            queryClient.invalidateQueries({ queryKey: ["weight-history"] });
        },
    });
};
