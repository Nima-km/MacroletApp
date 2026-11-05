import {
	getIntakeDayOverrides,
	setIntakeDayOverride,
} from "@/db/queries/intakeDay";
import { DayOverride } from "@/helper/intakeDays";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const KEY = ["intake-day-overrides"];

export const useGetIntakeDayOverrides = () =>
	useQuery({ queryKey: KEY, queryFn: getIntakeDayOverrides, staleTime: 30_000 });

export const useSetIntakeDayOverride = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ day, state }: { day: string; state: DayOverride | null }) =>
			setIntakeDayOverride(day, state),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: KEY });
			// The estimate reads these, so it has to be re-derived.
			queryClient.invalidateQueries({ queryKey: ["daily-calorie-intake"] });
		},
	});
};
