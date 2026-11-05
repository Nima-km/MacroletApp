import {
	getAllWeightItems,
	getLatestWeightItem,
	getWeightHistory,
	getWeightItems,
	insertWeight,
} from "@/db/queries/weight";
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";

/**
 * One definition of a weight window query, shared by the hook and by prefetching.
 *
 * Keeping it in one place matters: a prefetch whose key differs from the hook's is a cache
 * miss that silently does nothing.
 */
export const weightHistoryQueryOptions = (
	from: Date,
	to: Date,
	period: "day" | "week" | "month" = "day",
) => ({
	// `period` belongs in the key: the same window bucketed differently is a different
	// result set, and leaving it out served day buckets to a weekly request.
	queryKey: ["weight-history", from.toISOString(), to.toISOString(), period] as const,
	queryFn: () => getWeightHistory(from, to, period),
	// Switching range must not blank the card while the next window loads — that gap is the
	// flash the user sees. Previous results stay on screen until the new ones land.
	placeholderData: keepPreviousData,
	staleTime: 30_000,
});

export const useGetWeightList = (
	from: Date,
	to: Date,
	period?: "day" | "week" | "month",
) => useQuery(weightHistoryQueryOptions(from, to, period));

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
