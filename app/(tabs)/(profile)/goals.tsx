import MacroBar from "@/components/chartComponents/MacroCharts/MacroBar";
import TimeWheel from "@/components/UIComponents/Calendar/TimeWheel";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import { H1, H4, H4_Bold, H5_SemiBold, H6 } from "@/components/UIComponents/Typography";
import {
	useGetNutriGoals,
	useInsertNutritionGoal,
} from "@/db/hooks/goals/nutritionGoal";
import { calculateCalories } from "@/helper/calculateCalories";
import { useGetWeightGoal } from "@/db/hooks/weightGoal/useWeightGoal";
import { formatBand, formatWeight } from "@/helper/units";
import { useUnitStore } from "@/store/unitStore";
import { colors } from "@/theme";
import type { WeightUnit } from "@/helper/units";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

/**
 * Macro goals.
 *
 * The wheels replace three number fields. A goal is a value you nudge — a few grams up
 * or down — which is exactly the gesture a wheel is good at, and it keeps the page to a
 * single screen with the calories updating as you move them.
 *
 * Steps of 5 g: nobody wants to spin a wheel 200 rows to reach 150 g protein, and a
 * macro target is not a figure that needs single-gram precision.
 */
const STEP = 5;

const COLUMNS = [
	{ key: "protein", label: "PROTEIN", color: colors.protein, max: 400 },
	{ key: "carbs", label: "CARBS", color: colors.carbs, max: 600 },
	{ key: "fat", label: "FAT", color: colors.fat, max: 250 },
] as const;

/** 0, 5, 10 ... max — the labels the wheel scrolls through. */
const valuesFor = (max: number) =>
	Array.from({ length: Math.floor(max / STEP) + 1 }, (_, i) =>
		String(i * STEP),
	);

/** Snap a stored gram value onto the wheel. */
const indexFor = (grams: number, max: number) =>
	Math.min(Math.floor(max / STEP), Math.max(0, Math.round(grams / STEP)));

const goals = () => {
	const { mutate: addNewGoal } = useInsertNutritionGoal();
	const { data: nutriGoals, isLoading: nutriGoalsLoading } =
		useGetNutriGoals();

	const unit = useUnitStore((state) => state.unit);
	const setUnit = useUnitStore((state) => state.setUnit);
	const router = useRouter();
	const { data: weightGoal } = useGetWeightGoal();

	// One line that answers "what am I aiming at" without opening the editor.
	const weightGoalSummary = weightGoal
		? weightGoal.kind === "maintain"
			? `Maintain around ${formatWeight(weightGoal.target_weight, unit)} ${unit}${
					weightGoal.tolerance
						? ` ±${formatBand(weightGoal.tolerance, unit)}`
						: ""
				}`
			: `${weightGoal.kind === "lose" ? "Lose to" : "Gain to"} ${formatWeight(
					weightGoal.target_weight,
					unit,
				)} ${unit}`
		: "Not set";

	const [protein, setProtein] = useState(0);
	const [carbs, setCarbs] = useState(0);
	const [fat, setFat] = useState(0);

	useEffect(() => {
		const saved = nutriGoals?.[0];
		if (!saved) return;
		setProtein(Math.round(saved.protein / STEP) * STEP);
		setCarbs(Math.round(saved.carbs / STEP) * STEP);
		setFat(Math.round(saved.fat / STEP) * STEP);
	}, [nutriGoals]);

	const calories = useMemo(
		() => calculateCalories({ protein, carbs, fat }),
		[protein, carbs, fat],
	);

	function addGoal() {
		addNewGoal({ protein, carbs, fat });
	}

	if (nutriGoalsLoading) return <H1>Loading</H1>;

	const setters = { protein: setProtein, carbs: setCarbs, fat: setFat };

	return (
		<View style={{ flex: 1 }}>
			<HeaderSimple title="Goals" />

			<View style={styles.page}>
				{/* The target, answering "what does this add up to" before any input. */}
				<View style={styles.hero}>
					<H6 style={{ color: colors.inactive }}>Daily target</H6>
					<View style={styles.heroValue}>
						<H1>{calories}</H1>
						<H4 style={{ color: colors.inactive }}>kcal</H4>
					</View>
					<MacroBar
						protein={protein}
						carbs={carbs}
						fat={fat}
						height={20}
					/>
				</View>

				<H4 style={styles.sectionTitle}>Macros</H4>

				<View style={styles.wheelCard}>
					<View style={styles.wheels}>
						{COLUMNS.map((column) => {
							const values = valuesFor(column.max);
							const index = indexFor(
								{ protein, carbs, fat }[column.key],
								column.max,
							);
							return (
								<View key={column.key} style={styles.column}>
									<View style={styles.columnTitle}>
										<H4_Bold style={styles.columnName}>
											{column.label}
										</H4_Bold>
										<View
											style={[
												styles.pill,
												{
													backgroundColor:
														column.color,
												},
											]}
										/>
									</View>
									<TimeWheel
										values={values}
										index={index}
										onIndexChange={(next) =>
											setters[column.key](
												Number(values[next]),
											)
										}
										width={64}
										visibleRows={3}
									/>
								</View>
							);
						})}
					</View>
				</View>

				{/* Weight goal lives on its own screen: its target picker is a wheel, and a
				    wheel is a FlatList, which cannot be nested in a scrolling page. */}
				<Pressable
					onPress={() => router.push("/(tabs)/(profile)/weightGoal")}
					accessibilityRole="button"
					accessibilityLabel="Edit weight goal"
					style={styles.unitCard}
				>
					<View style={{ flex: 1 }}>
						<H4>Weight goal</H4>
						<H6 style={{ color: colors.inactive }}>
							{weightGoalSummary}
						</H6>
					</View>
					<H6 style={{ color: colors.primary }}>
						{weightGoal ? "Change" : "Set"}
					</H6>
				</Pressable>

				{/* Display preference, saved on tap — it is not a goal, so it does not
				    wait for Apply. Storage is always grams; this only changes what is
				    shown, everywhere at once. */}
				<View style={styles.unitCard}>
					<View style={{ flex: 1 }}>
						<H4>Units</H4>
						<H6 style={{ color: colors.inactive }}>
							Body weight is shown in this unit.
						</H6>
					</View>
					<View style={styles.segmented}>
						{(["lb", "kg"] as WeightUnit[]).map((option) => (
							<Pressable
								key={option}
								onPress={() => setUnit(option)}
								accessibilityRole="button"
								accessibilityState={{ selected: unit === option }}
								style={[
									styles.segment,
									unit === option && styles.segmentActive,
								]}
							>
								<H5_SemiBold
									style={{
										color:
											unit === option
												? colors.white
												: colors.inactive,
									}}
								>
									{option}
								</H5_SemiBold>
							</Pressable>
						))}
					</View>
				</View>

				<View style={{ flex: 1 }} />

				<PrimaryButton onPress={addGoal}>Apply</PrimaryButton>
			</View>
		</View>
	);
};

export default goals;

const styles = StyleSheet.create({
	page: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 8,
		paddingBottom: 20,
		gap: 20,
	},
	hero: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 20,
		gap: 8,
	},
	heroValue: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 6,
	},
	sectionTitle: {
		marginTop: 4,
	},
	wheelCard: {
		backgroundColor: colors.white,
		borderRadius: 8,
		paddingVertical: 16,
		paddingHorizontal: 20,
		gap: 12,
	},
	wheels: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	column: {
		alignItems: "center",
		gap: 8,
		flex: 1,
	},
	columnTitle: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		height: 24,
	},
	columnName: {
		letterSpacing: 0.5,
	},
	pill: {
		width: 8,
		height: 20,
		borderRadius: 8,
	},
	columnLabel: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	hint: {
		color: colors.inactive,
		textAlign: "center",
	},
	unitCard: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
	},
	segmented: {
		flexDirection: "row",
		backgroundColor: colors.off_white,
		borderRadius: 8,
		padding: 3,
		gap: 3,
	},
	segment: {
		paddingHorizontal: 16,
		paddingVertical: 7,
		borderRadius: 6,
	},
	segmentActive: {
		backgroundColor: colors.primary,
	},
	dot: {
		width: 8,
		height: 8,
		borderRadius: 8,
	},
});
