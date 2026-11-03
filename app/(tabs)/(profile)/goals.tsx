import MacroBar from "@/components/chartComponents/MacroCharts/MacroBar";
import TimeWheel from "@/components/UIComponents/Calendar/TimeWheel";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import { H1, H4, H4_Bold, H6 } from "@/components/UIComponents/Typography";
import {
	useGetNutriGoals,
	useInsertNutritionGoal,
} from "@/db/hooks/goals/nutritionGoal";
import { calculateCalories } from "@/helper/calculateCalories";
import { colors } from "@/theme";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

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
	dot: {
		width: 8,
		height: 8,
		borderRadius: 8,
	},
});
