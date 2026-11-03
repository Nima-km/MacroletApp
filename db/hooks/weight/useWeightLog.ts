import {
	getAllWeightItems,
	getLatestWeightItem,
	getWeightHistory,
	getWeightItems,
	insertWeight,
} from "@/db/queries/weight";
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
			queryClient.invalidateQueries({ queryKey: ["weight-items"] });
			queryClient.invalidateQueries({ queryKey: ["weight-items-all"] });
			queryClient.invalidateQueries({ queryKey: ["weight-latest"] });
        },
    });
};

/** The newest weigh-in, for screens that need "where the user is now" rather than a window. */
export const useGetLatestWeight = () =>
	useQuery({
		queryKey: ["weight-latest"],
		queryFn: getLatestWeightItem,
	});

/** The readings themselves, in a window. */
export const useGetWeightItems = (from: Date, to: Date) =>
	useQuery({
		queryKey: ["weight-items", from.toISOString(), to.toISOString()],
		queryFn: () => getWeightItems(from, to),
	});

/** Every reading ever, newest first. */
export const useGetAllWeightItems = () =>
	useQuery({
		queryKey: ["weight-items-all"],
		queryFn: getAllWeightItems,
	});
