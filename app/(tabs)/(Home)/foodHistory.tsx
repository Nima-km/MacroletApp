import FoodLogChart from "@/components/chartComponents/LogHistoryCharts/FoodLogChart";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import StyledRadioButton from "@/components/UIComponents/Buttons/RadioButton";
import TopDateSelector from "@/components/UIComponents/Calendar/TopDateSelector";
import {
	H1,
	H3,
	H5,
	H5_SemiBold,
	H6,
} from "@/components/UIComponents/Typography";
import { useGetNutriGoals } from "@/db/hooks/goals/nutritionGoal";
import { useGetDailyFoodSums } from "@/db/hooks/history/foodItemhistory";
import { useGetWeightList } from "@/db/hooks/weight/useWeightLog";
import { calculateCalories } from "@/helper/calculateCalories";
import { SimpleRound } from "@/helper/simpleRound";
import {
	formatWeight,
	summarizeWeight,
	WEIGHT_UNIT,
} from "@/helper/weightSummary";
import { useDateStore } from "@/store/dateStore";
import { colors } from "@/theme";
import { MacroDateType } from "@/types/food";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";

const RANGES = [
	{ label: "7 days", value: 7 },
	{ label: "30 days", value: 30 },
	{ label: "90 days", value: 90 },
];

const RANGE_DEFAULT_INDEX = 1;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Energy split as percentages of calories, from grams. */
function macroSplit(protein: number, carbs: number, fat: number) {
	const p = protein * 4;
	const c = carbs * 4;
	const f = fat * 9;
	const total = p + c + f;
	if (total <= 0) return null;
	return {
		protein: Math.round((p / total) * 100),
		carbs: Math.round((c / total) * 100),
		fat: Math.round((f / total) * 100),
	};
}

/** Longest run of consecutive calendar days among the given days. */
function longestStreak(days: MacroDateType[]) {
	if (days.length === 0) return 0;
	const keys = new Set(
		days.map((day) => {
			const d = new Date(day.date);
			d.setHours(0, 0, 0, 0);
			return d.toDateString();
		}),
	);
	let best = 0;
	keys.forEach((key) => {
		const date = new Date(key);
		const previous = new Date(date);
		previous.setDate(previous.getDate() - 1);
		// Only start counting from the first day of a run.
		if (keys.has(previous.toDateString())) return;
		let run = 0;
		const cursor = new Date(date);
		while (keys.has(cursor.toDateString())) {
			run += 1;
			cursor.setDate(cursor.getDate() + 1);
		}
		best = Math.max(best, run);
	});
	return best;
}

export default function FoodHistory() {
	const router = useRouter();
	const setDate = useDateStore((state) => state.setDate);

	const [endDate, setEndDate] = useState(() => {
		const tomorrow = new Date();
		tomorrow.setHours(24, 0, 0, 0);
		return tomorrow;
	});
	const [days, setDays] = useState(RANGES[RANGE_DEFAULT_INDEX].value);
	const [showWeight, setShowWeight] = useState(true);

	const startDate = useMemo(() => {
		const from = new Date(endDate);
		from.setHours(0, 0, 0, 0);
		from.setDate(from.getDate() - days);
		return from;
	}, [endDate, days]);

	const { data, isLoading, error } = useGetDailyFoodSums(startDate, endDate);
	const { data: weightData } = useGetWeightList(startDate, endDate);
	const { data: goals } = useGetNutriGoals();

	const goal = goals?.[0];
	const goalCalories = calculateCalories(goal);
	const goalSplit = goal
		? macroSplit(goal.protein, goal.carbs, goal.fat)
		: null;

	const loggedDays = useMemo(
		() =>
			[...(data ?? [])]
				.filter((day) => (day.calories ?? 0) > 0)
				.sort((a, b) => a.date.getTime() - b.date.getTime()),
		[data],
	);

	const summary = useMemo(() => {
		if (loggedDays.length === 0) return null;
		const total = (pick: (day: MacroDateType) => number) =>
			loggedDays.reduce((acc, day) => acc + pick(day), 0);
		return {
			days: loggedDays.length,
			calories: total((day) => day.calories ?? 0) / loggedDays.length,
			protein: total((day) => day.protein) / loggedDays.length,
			carbs: total((day) => day.carbs) / loggedDays.length,
			fat: total((day) => day.fat) / loggedDays.length,
		};
	}, [loggedDays]);

	const split = summary
		? macroSplit(summary.protein, summary.carbs, summary.fat)
		: null;

	const streak = useMemo(() => longestStreak(loggedDays), [loggedDays]);

	// The trend behind the noise: mean of the days logged in the last week of the range.
	const rolling = useMemo(() => {
		if (loggedDays.length === 0) return null;
		const cutoff = new Date(endDate);
		cutoff.setDate(cutoff.getDate() - 7);
		const recent = loggedDays.filter((day) => day.date >= cutoff);
		const window = recent.length > 0 ? recent : loggedDays.slice(-7);
		return (
			window.reduce((acc, day) => acc + (day.calories ?? 0), 0) /
			window.length
		);
	}, [loggedDays, endDate]);

	// Which weekday pulls the average around.
	const weekday = useMemo(() => {
		if (loggedDays.length < 5 || !summary) return null;
		const buckets = new Map<number, number[]>();
		loggedDays.forEach((day) => {
			const index = day.date.getDay();
			buckets.set(index, [
				...(buckets.get(index) ?? []),
				day.calories ?? 0,
			]);
		});
		// A for...of loop rather than forEach: assigning through a closure leaves
		// TypeScript unable to narrow the result.
		let worst: { label: string; delta: number } | null = null;
		for (const [index, values] of buckets.entries()) {
			const average =
				values.reduce((acc, value) => acc + value, 0) / values.length;
			const delta = average - summary.calories;
			if (worst === null || Math.abs(delta) > Math.abs(worst.delta)) {
				worst = { label: WEEKDAYS[index], delta };
			}
		}
		return worst;
	}, [loggedDays, summary]);

	// Bodyweight over the same window, stated against intake.
	const weightSummary = summarizeWeight(weightData);

	const highlights = useMemo(() => {
		if (loggedDays.length < 2) return null;
		const sorted = [...loggedDays].sort(
			(a, b) => (b.calories ?? 0) - (a.calories ?? 0),
		);
		return { highest: sorted[0], lowest: sorted[sorted.length - 1] };
	}, [loggedDays]);

	function openDay(day: MacroDateType) {
		setDate(day.date);
		router.push("/(tabs)/(logs)/logs");
	}

	function dayLabel(date: Date) {
		return date.toLocaleDateString(undefined, {
			weekday: "short",
			day: "numeric",
			month: "short",
		});
	}

	return (
		<View style={{ flex: 1 }}>
			<HeaderSimple title="History" />

			<ScrollView
				contentContainerStyle={styles.page}
				showsVerticalScrollIndicator={false}
			>
				{/* Range: everything below follows this selection. */}
				<View style={styles.card}>
					<StyledRadioButton
						options={RANGES}
						defaultOption={RANGE_DEFAULT_INDEX}
						onSelect={(value: number) => setDays(value)}
					/>
					<TopDateSelector date={endDate} setDate={setEndDate} />
					<View style={styles.rowBetween}>
						<H6 style={styles.muted}>Show bodyweight</H6>
						<Switch
							trackColor={{
								false: colors.light_gray,
								true: colors.primary_bg,
							}}
							thumbColor={
								showWeight ? colors.primary : colors.white
							}
							ios_backgroundColor={colors.off_white}
							onValueChange={() => setShowWeight((prev) => !prev)}
							value={showWeight}
						/>
					</View>
					<FoodLogChart
						foodData={data}
						weightData={weightData?.length ? weightData : undefined}
						showWeight={showWeight}
						goal={goal}
						onSelect={() => {}}
					/>
					<View style={styles.goalRow}>
						<View style={styles.dash} />
						<H5>Daily calorie goal</H5>
						<H5_SemiBold>{goalCalories} cal</H5_SemiBold>
					</View>
				</View>

				{isLoading ? (
					<View style={styles.card}>
						<H5 style={styles.muted}>Loading…</H5>
					</View>
				) : error ? (
					<View style={styles.card}>
						<H5 style={styles.muted}>
							Couldn't load your history.
						</H5>
					</View>
				) : !summary ? (
					<View style={styles.card}>
						<H3>Nothing logged yet</H3>
						<H5 style={styles.muted}>
							Log a few days and this page will show your average,
							your consistency, and what your weight is doing
							against your intake.
						</H5>
					</View>
				) : (
					<>
						{/* Average, and the trend behind the daily noise. */}
						<View style={styles.card}>
							<View style={styles.rowBetween}>
								<H3>Average</H3>
								<H6 style={styles.muted}>
									{summary.days}{" "}
									{summary.days === 1 ? "day" : "days"} logged
								</H6>
							</View>
							<View style={styles.heroRow}>
								<H1>{SimpleRound(summary.calories)}</H1>
								<H5 style={styles.muted}>cal / day</H5>
							</View>
							{rolling ? (
								<H6 style={styles.muted}>
									7-day rolling average {SimpleRound(rolling)}{" "}
									cal
								</H6>
							) : null}
							<View style={styles.macroRow}>
								<MacroStat
									label="Protein"
									dot={colors.protein}
									value={summary.protein}
								/>
								<MacroStat
									label="Carbs"
									dot={colors.carbs}
									value={summary.carbs}
								/>
								<MacroStat
									label="Fat"
									dot={colors.fat}
									value={summary.fat}
								/>
							</View>
							{goalCalories > 0 ? (
								<>
									<View style={styles.divider} />
									<H6 style={styles.muted}>
										{summary.calories > goalCalories
											? `${SimpleRound(
													summary.calories -
														goalCalories,
												)} cal above your goal`
											: `${SimpleRound(
													goalCalories -
														summary.calories,
												)} cal below your goal`}
									</H6>
								</>
							) : null}
						</View>

						{/* Consistency: the metric that predicts progress. */}
						<View style={styles.card}>
							<H3>Consistency</H3>
							<View style={styles.heroRow}>
								<H1>{summary.days}</H1>
								<H5 style={styles.muted}>
									of {days} days logged
								</H5>
							</View>
							<View style={styles.barTrack}>
								<View
									style={[
										styles.barFill,
										{
											width: `${Math.min(
												100,
												(summary.days / days) * 100,
											)}%`,
										},
									]}
								/>
							</View>
							<H6 style={styles.muted}>
								Longest run {streak}{" "}
								{streak === 1 ? "day" : "days"} in a row
							</H6>
						</View>

						{/* Macro split, actual against target. */}
						{split ? (
							<View style={styles.card}>
								<H3>Macro split</H3>
								<SplitRow label="You" split={split} />
								{goalSplit ? (
									<SplitRow label="Target" split={goalSplit} />
								) : null}
							</View>
						) : null}

						{/* Weekday pattern. */}
						{weekday ? (
							<View style={styles.card}>
								<H3>Pattern</H3>
								<H5>
									{weekday.label} averages{" "}
									{SimpleRound(Math.abs(weekday.delta))} cal{" "}
									{weekday.delta > 0 ? "more" : "less"} than
									your average.
								</H5>
							</View>
						) : null}

						{/* Bodyweight, in the context of what was eaten. */}
						{weightSummary ? (
							<View style={styles.card}>
								<H3>Weight</H3>
								<View style={styles.heroRow}>
									<H1>
										{formatWeight(weightSummary.current)}
									</H1>
									<H5 style={styles.muted}>
										{WEIGHT_UNIT}
									</H5>
								</View>
								<H5 style={styles.muted}>
									{Math.abs(weightSummary.delta) < 0.05
										? `Held steady over ${days} days`
										: `${
												weightSummary.delta > 0
													? "Up"
													: "Down"
											} ${formatWeight(
												Math.abs(weightSummary.delta),
											)} ${WEIGHT_UNIT} over ${days} days while averaging ${SimpleRound(
												summary.calories,
											)} cal / day`}
								</H5>
							</View>
						) : null}

						{/* Highlights. */}
						{highlights ? (
							<View style={styles.card}>
								<H3>Highlights</H3>
								<HighlightRow
									label="Highest"
									day={highlights.highest}
									dayLabel={dayLabel}
								/>
								<View style={styles.divider} />
								<HighlightRow
									label="Lowest"
									day={highlights.lowest}
									dayLabel={dayLabel}
								/>
							</View>
						) : null}

						{/* The history itself: tap a day to open it in Logs. */}
						<View style={styles.card}>
							<H3>Days</H3>
							{[...loggedDays].reverse().map((day, index) => (
								<View key={day.date.toISOString()}>
									{index > 0 ? (
										<View style={styles.divider} />
									) : null}
									<Pressable
										onPress={() => openDay(day)}
										style={({ pressed }) => [
											styles.dayRow,
											pressed && styles.pressed,
										]}
										accessibilityRole="button"
										accessibilityLabel={`Open ${day.date.toDateString()}, ${SimpleRound(
											day.calories ?? 0,
										)} calories`}
									>
										<H5>{dayLabel(day.date)}</H5>
										<View style={styles.dayValue}>
											<H5>
												{SimpleRound(day.calories ?? 0)}{" "}
												cal
											</H5>
											<H6 style={styles.muted}>›</H6>
										</View>
									</Pressable>
								</View>
							))}
						</View>
					</>
				)}
			</ScrollView>
		</View>
	);
}

function MacroStat({
	label,
	dot,
	value,
}: {
	label: string;
	dot: string;
	value: number;
}) {
	return (
		<View style={styles.macroCell}>
			<View style={styles.macroLabel}>
				<View style={[styles.dot, { backgroundColor: dot }]} />
				<H6 style={styles.muted}>{label}</H6>
			</View>
			<H5>{SimpleRound(value)} g</H5>
		</View>
	);
}

function SplitRow({
	label,
	split,
}: {
	label: string;
	split: { protein: number; carbs: number; fat: number };
}) {
	return (
		<View style={styles.splitRow}>
			<H6 style={styles.splitLabel}>{label}</H6>
			<View style={styles.splitBar}>
				<View
					style={[
						styles.splitSegment,
						{
							width: `${split.protein}%`,
							backgroundColor: colors.protein,
						},
					]}
				/>
				<View
					style={[
						styles.splitSegment,
						{
							width: `${split.carbs}%`,
							backgroundColor: colors.carbs,
						},
					]}
				/>
				<View
					style={[
						styles.splitSegment,
						{
							width: `${split.fat}%`,
							backgroundColor: colors.fat,
						},
					]}
				/>
			</View>
			<H6 style={styles.muted}>
				{split.protein}/{split.carbs}/{split.fat}
			</H6>
		</View>
	);
}

function HighlightRow({
	label,
	day,
	dayLabel,
}: {
	label: string;
	day: MacroDateType;
	dayLabel: (date: Date) => string;
}) {
	return (
		<View style={styles.rowBetween}>
			<H6 style={styles.muted}>{label}</H6>
			<View style={styles.dayValue}>
				<H5>{dayLabel(day.date)}</H5>
				<H6 style={styles.muted}>
					{SimpleRound(day.calories ?? 0)} cal
				</H6>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	page: {
		paddingHorizontal: 20,
		paddingTop: 16,
		paddingBottom: 40,
		gap: 16,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 12,
	},
	muted: {
		color: colors.inactive,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	goalRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	dash: {
		width: 18,
		height: 2,
		backgroundColor: colors.primary,
	},
	heroRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 8,
	},
	macroRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	macroCell: {
		gap: 6,
	},
	macroLabel: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	barTrack: {
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.off_white,
		overflow: "hidden",
	},
	barFill: {
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.primary,
	},
	splitRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	splitLabel: {
		width: 52,
		color: colors.inactive,
	},
	splitBar: {
		flexDirection: "row",
		flex: 1,
		height: 10,
		borderRadius: 5,
		overflow: "hidden",
		backgroundColor: colors.off_white,
	},
	splitSegment: {
		height: 10,
	},
	divider: {
		height: 1,
		backgroundColor: colors.light_gray,
		opacity: 0.6,
	},
	dayRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 8,
	},
	pressed: {
		opacity: 0.6,
	},
	dayValue: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
});
