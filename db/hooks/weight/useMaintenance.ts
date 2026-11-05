import { getDailyCalorieIntake } from "@/db/queries/history";
import { useGetWeightItems } from "@/db/hooks/weight/useWeightLog";
import { useGetWeightGoal } from "@/db/hooks/weightGoal/useWeightGoal";
import {
	MAX_WINDOW_DAYS,
	MaintenanceEstimate,
	estimateMaintenance,
	nextCalorieGoal,
} from "@/helper/maintenance";
import { useGetProfile } from "@/db/hooks/profile/useProfile";
import { useGetIntakeDayOverrides } from "@/db/hooks/intakeDay/useIntakeDayOverrides";
import { classifyIntakeDays } from "@/helper/intakeDays";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The maintenance estimate for the current moment, assembled from the database.
 *
 * Kept as a hook rather than a screen-side calculation so every surface that needs it (the
 * goals screen, the adaptive calorie goal, the weekly job) reads the same number from the
 * same inputs. `now` is captured once per mount so the three windows stay consistent
 * within one calculation.
 */
export const useMaintenanceEstimate = (): {
	estimate: MaintenanceEstimate | null;
	isLoading: boolean;
} => {
	const now = useMemo(() => new Date(), []);
	const from = useMemo(
		() => new Date(now.getTime() - MAX_WINDOW_DAYS * DAY_MS),
		[now],
	);

	const { data: storedProfile } = useGetProfile();
	const { data: overrides } = useGetIntakeDayOverrides();
	const { data: goal } = useGetWeightGoal();
	const { data: weighIns, isLoading: weighInsLoading } = useGetWeightItems(from, now);

	const { data: intake, isLoading: intakeLoading } = useQuery({
		queryKey: ["daily-calorie-intake", from.toISOString(), now.toISOString()],
		queryFn: () => getDailyCalorieIntake(from, now),
		staleTime: 30_000,
	});

	const estimate = useMemo(() => {
		if (!weighIns || !intake) return null;

		// The user's own decisions win over the heuristic; whatever is left is classified
		// automatically, and excluded days are marked rather than dropped silently so the
		// surface can show why a day did not count.
		const classified = classifyIntakeDays(intake, overrides ?? {});

		return estimateMaintenance({
			now,
			episodeStart: goal?.started_at ?? null,
			weighIns: weighIns.map((entry) => ({
				timestamp: entry.timestamp,
				grams: entry.weight,
			})),
			intake: classified.map((day) => ({
				day: day.day,
				calories: day.calories,
				items: day.items,
				excluded: !day.counted,
			})),
			profile: storedProfile ?? undefined,
		});
	}, [weighIns, intake, goal, storedProfile, overrides, now]);

	return { estimate, isLoading: weighInsLoading || intakeLoading };
};

export { nextCalorieGoal };

/** The classified days, for the review surface. */
export const useIntakeDayReview = () => {
	const now = useMemo(() => new Date(), []);
	const from = useMemo(() => new Date(now.getTime() - MAX_WINDOW_DAYS * DAY_MS), [now]);
	const { data: overrides } = useGetIntakeDayOverrides();
	const { data: intake, isLoading } = useQuery({
		queryKey: ["daily-calorie-intake", from.toISOString(), now.toISOString()],
		queryFn: () => getDailyCalorieIntake(from, now),
		staleTime: 30_000,
	});

	const days = useMemo(
		() => classifyIntakeDays(intake ?? [], overrides ?? {}),
		[intake, overrides],
	);
	return { days, isLoading };
};
