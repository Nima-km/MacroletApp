import { useGetWeightGoal } from "@/db/hooks/weightGoal/useWeightGoal";
import { useGetLatestWeight } from "@/db/hooks/weight/useWeightLog";
import { useMaintenanceEstimate } from "@/db/hooks/weight/useMaintenance";
import { useGetProfile } from "@/db/hooks/profile/useProfile";
import { useGetNutriGoals, useInsertNutritionGoal } from "@/db/hooks/goals/nutritionGoal";
import { useSubscriptionState } from "@/api/hooks/useSubscriptionState";
import { changeLine, isUpdateDue, scaleMacros } from "@/helper/adaptiveGoal";
import { useActiveMacroProfile } from "@/db/hooks/macroProfile/useMacroProfile";
import { interpolateProfile } from "@/helper/macroProfile";
import { safeTarget, weeklyTarget } from "@/helper/calorieTarget";
import { ageFromBirthYear, bmrMifflin } from "@/helper/profile";
import { useEffect, useRef } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Applies the weekly adaptive update, once per due period.
 *
 * Runs from whichever screen shows the goal, because a local-first app has no scheduler
 * that survives being closed. The guard is the row's own timestamp: if seven days have not
 * passed, nothing happens, so opening the screen repeatedly is free.
 */
export const useAdaptiveGoal = () => {
	const { data: goals } = useGetNutriGoals();
	const { data: weightGoal } = useGetWeightGoal();
	const { data: latestWeight } = useGetLatestWeight();
	const { data: storedProfile } = useGetProfile();
	const { estimate } = useMaintenanceEstimate();
	const { mutate: insertGoal } = useInsertNutritionGoal();
	// A lapsed subscription leaves any adaptive row in place, but it stops moving.
	const { data: subscription } = useSubscriptionState();
	const entitled = subscription?.entitled === true;
	// The active profile, when there is one, decides the macro split: the calorie target is
	// the input and the profile maps it, rather than moving every macro proportionally.
	const { data: activeProfile } = useActiveMacroProfile();

	// One attempt per mount per goal row; the effect can re-run as queries settle.
	const attempted = useRef<string | null>(null);

	const current = goals?.[0];
	const maintenance = estimate?.maintenance ?? null;

	useEffect(() => {
		if (!entitled) return;
		if (!current || current.source !== "adaptive") return;
		if (maintenance === null) return;
		if (!latestWeight) return;
		if (!isUpdateDue(current.timestamp, new Date())) return;

		const key = `${current.id}:${maintenance}`;
		if (attempted.current === key) return;
		attempted.current = key;

		const now = new Date();
		const kg = latestWeight.weight / 1000;
		const bmr =
			storedProfile && storedProfile.heightCm && storedProfile.sex
				? bmrMifflin(
						kg,
						storedProfile.heightCm,
						ageFromBirthYear(storedProfile.birthYear ?? 1990, now),
						storedProfile.sex,
					)
				: null;

		const safe = safeTarget({
			maintenance,
			weightKg: kg,
			bmr,
			kind: weightGoal?.kind ?? "maintain",
			targetWeightKg: weightGoal ? weightGoal.target_weight / 1000 : null,
			targetDate: weightGoal?.target_date ?? null,
			now,
		});

		const daysIntoEpisode = weightGoal?.started_at
			? Math.floor((now.getTime() - weightGoal.started_at.getTime()) / DAY_MS)
			: 0;

		// Rows written before the calories column was populated have 0; fall back to the
		// macro arithmetic the app uses elsewhere.
		const currentCalories =
			current.calories > 0
				? current.calories
				: Math.round(current.protein * 4 + current.carbs * 4 + current.fat * 9);

		const plan = weeklyTarget(
			currentCalories,
			safe,
			daysIntoEpisode,
			estimate?.tier ?? "low",
		);
		if (!plan.changed) return;

		const macros =
			activeProfile && activeProfile.checkpoints.length > 0
				? (() => {
						const fromProfile = interpolateProfile(
							activeProfile.checkpoints,
							plan.target,
						);
						return fromProfile
							? {
									calories: fromProfile.calories,
									protein: fromProfile.protein,
									fat: fromProfile.fat,
									carbs: fromProfile.carbs,
								}
							: scaleMacros(
									{
										calories: currentCalories,
										protein: current.protein,
										fat: current.fat,
										carbs: current.carbs,
									},
									plan.target,
								);
					})()
				: scaleMacros(
						{
							calories: currentCalories,
							protein: current.protein,
							fat: current.fat,
							carbs: current.carbs,
						},
						plan.target,
					);

		console.log(
			"adaptive goal",
			changeLine(currentCalories, plan.target, current.maintenance ?? null, maintenance),
		);

		insertGoal({
			...macros,
			source: "adaptive",
			maintenance,
			timestamp: now.toISOString(),
		});
	}, [
		entitled,
		current,
		maintenance,
		latestWeight,
		storedProfile,
		weightGoal,
		estimate?.tier,
		activeProfile,
		insertGoal,
	]);
};
