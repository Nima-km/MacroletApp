import WeightChart from "@/components/chartComponents/LogHistoryCharts/WeightChart";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton, SecondaryButton } from "@/components/UIComponents/Buttons/Button";
import TopDateSelector from "@/components/UIComponents/Calendar/TopDateSelector";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputNumber } from "@/components/UIComponents/TextInputs/FormInput";
import { H1, H3, H4, H5, H6 } from "@/components/UIComponents/Typography";
import {
	useGetAllWeightItems,
	useGetWeightList,
	useInsertWeight,
	weightHistoryQueryOptions,
} from "@/db/hooks/weight/useWeightLog";
import { useGetWeightGoals } from "@/db/hooks/weightGoal/useWeightGoal";
import {
	formatWeight,
	toDisplay,
	toGrams,
	unitHeading,
	weightBounds,
} from "@/helper/units";
import {
	RANGES,
	RANGE_ORDER,
	WeightPeriod,
	WeightRange,
	rangeWindow,
} from "@/helper/weightRange";
import { emaTrend } from "@/helper/weightTrend";
import { useUnitStore } from "@/store/unitStore";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useState } from "react";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

/** The trend on the summary follows the same half-life as the chart's line. */
const TREND_HALF_LIFE_DAYS = 14;
/** How many logs the card shows before "See all". */
const RECENT_LOGS = 20;

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date = new Date()) {
	const date = new Date(value);
	date.setHours(0, 0, 0, 0);
	return date;
}

/** "Tue, Nov 3", with the year when it is not the current one. */
function dayLabel(date: Date) {
	return date.toLocaleDateString(undefined, {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
	});
}

/** "3 Nov", with the year when a window spans more than one. */
function shortDate(date: Date) {
	return date.toLocaleDateString(undefined, {
		day: "numeric",
		month: "short",
		year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
	});
}

export default function WeightHistory() {
	const router = useRouter();
	const unit = useUnitStore((state) => state.unit);
	const bounds = weightBounds(unit);
	const WEIGHT_UNIT = unitHeading(unit);

	const [range, setRange] = useState<WeightRange>("1W");
	const [selectedDay, setSelectedDay] = useState(() => startOfDay());
	const [draft, setDraft] = useState("");

	const config = RANGES[range];

	// The window ends after the selected day, so the selected day is included.
	const windowEnd = useMemo(() => {
		const end = new Date(selectedDay);
		end.setDate(end.getDate() + 1);
		return end;
	}, [selectedDay]);

	const { from, to } = useMemo(
		() => rangeWindow(range, windowEnd),
		[range, windowEnd],
	);

	const period: WeightPeriod = config.period;

	const { data, isLoading, error } = useGetWeightList(from, to, period);

	// Warm the other four windows in the background, so switching range renders from cache
	// instead of starting a query. They are cheap local reads; the point is to remove the
	// pause between pressing a range and seeing it.
	const queryClient = useQueryClient();
	useEffect(() => {
		RANGE_ORDER.forEach((option) => {
			if (option === range) return;
			const window = rangeWindow(option, windowEnd);
			queryClient.prefetchQuery(
				weightHistoryQueryOptions(window.from, window.to, RANGES[option].period),
			);
		});
	}, [queryClient, windowEnd, range]);
	const { data: allEntries } = useGetAllWeightItems();
	const { data: goals } = useGetWeightGoals();
	const { mutate: logWeight, isPending } = useInsertWeight();

	const entries = allEntries ?? [];

	// Only the goal in force is drawn. The stepped history is a later question.
	const currentGoal = useMemo(() => {
		const latest = goals?.[goals.length - 1];
		return latest
			? { targetWeight: latest.target_weight, tolerance: latest.tolerance }
			: null;
	}, [goals]);

	/** Trend over the visible window, computed the same way the chart draws it. */
	const trendSummary = useMemo(() => {
		const points = (data ?? []).map((entry) => ({
			timestamp: entry.timestamp,
			weight: entry.weight,
		}));
		if (points.length < 2) return null;
		const trend = emaTrend(points, { halfLifeDays: TREND_HALF_LIFE_DAYS });
		const first = trend[0];
		const last = trend[trend.length - 1];
		const days = Math.max(
			(last.timestamp.getTime() - first.timestamp.getTime()) / DAY_MS,
			1,
		);
		const weeks = days / 7;
		const samples = (data ?? []).reduce(
			(total, entry) => total + (entry.count || 1),
			0,
		);
		return {
			delta: last.trend - first.trend,
			perWeek: (last.trend - first.trend) / weeks,
			since: first.timestamp,
			samples,
			weeks,
		};
	}, [data]);

	const parsed = Number(draft);
	const canLog =
		draft.trim().length > 0 &&
		Number.isFinite(parsed) &&
		parsed >= bounds.min &&
		parsed <= bounds.max;

	function submit() {
		if (!canLog) {
			Toast.show({
				type: "error",
				text1: "Enter a weight",
				text2: `Between ${bounds.min} and ${bounds.max} ${WEIGHT_UNIT}.`,
			});
			return;
		}

		Keyboard.dismiss();
		// Stamped with the selected day, keeping the clock time: picking a date is how a
		// missed weigh-in gets filled in.
		const stamp = new Date(selectedDay);
		const now = new Date();
		stamp.setHours(now.getHours(), now.getMinutes(), 0, 0);

		logWeight(
			{ weight: toGrams(parsed, unit), timestamp: stamp },
			{
				onSuccess: () => {
					setDraft("");
					Toast.show({ type: "success", text1: "Weight logged" });
				},
				onError: () =>
					Toast.show({
						type: "error",
						text1: "Couldn't log weight",
						text2: "Check the value and try again.",
					}),
			},
		);
	}

	// `trendSummary` works in stored grams; only the display converts.
	const summaryDelta = trendSummary?.delta ?? 0;
	const summaryUnchanged = Math.abs(summaryDelta) < (unit === "lb" ? 45 : 100);

	return (
		<KeyboardAware>
			<HeaderSimple title="Weight history" />

			<View style={styles.page}>
				{/* What the window says, phrased for its length. */}
				<View style={styles.card}>
					<View style={styles.rowBetween}>
						<H3>Weight</H3>
						<H6 style={styles.muted}>
							{shortDate(from)} – {shortDate(selectedDay)}
						</H6>
					</View>

					{isLoading ? (
						<H5 style={styles.muted}>Loading…</H5>
					) : error ? (
						<H5 style={styles.muted}>Couldn't load your weigh-ins.</H5>
					) : trendSummary ? (
						<>
							<View style={styles.valueRow}>
								<H1>
									{formatWeight(
										(data ?? [])[(data ?? []).length - 1]?.weight ?? 0,
										unit,
									)}
								</H1>
								<H5 style={styles.muted}>{WEIGHT_UNIT}</H5>
							</View>
							<H5 style={styles.muted}>
								{summaryUnchanged
									? `Held steady over ${range === "1W" ? "the week" : RANGES[range].label}`
									: `${summaryDelta > 0 ? "Up" : "Down"} ${formatWeight(
											Math.abs(summaryDelta),
											unit,
										)} ${WEIGHT_UNIT}${
											range === "1W"
												? " over the week"
												: ` since ${shortDate(trendSummary.since)}`
										}`}
							</H5>
							{range !== "1W" ? (
								<H6 style={styles.muted}>
									{Math.abs(trendSummary.perWeek) < (unit === "lb" ? 22 : 50)
										? `No net change over ${Math.round(
												trendSummary.weeks,
											)} weeks · ${trendSummary.samples} weigh-ins`
										: `${trendSummary.perWeek > 0 ? "+" : "−"}${formatWeight(
												Math.abs(trendSummary.perWeek),
												unit,
											)} ${WEIGHT_UNIT} per week over ${Math.round(
												trendSummary.weeks,
											)} weeks · ${trendSummary.samples} weigh-ins`}
								</H6>
							) : null}
						</>
					) : (
						<H5 style={styles.muted}>No weigh-ins in this window. Log one below.</H5>
					)}
				</View>

				{/* Range, then the window's end, then the trend. Full-bleed like the calorie
				    card on Home: no gap to the screen edges, so the plot gets the width. */}
				<View style={styles.chartBand}>
					<View style={styles.bandInset}>
					<View style={styles.segmented}>
						{RANGE_ORDER.map((option) => (
							<Pressable
								key={option}
								onPress={() => setRange(option)}
								accessibilityRole="button"
								accessibilityState={{ selected: range === option }}
								style={[
									styles.segment,
									range === option && styles.segmentActive,
								]}
							>
								<H6
									style={{
										color:
											range === option ? colors.white : colors.inactive,
									}}
								>
									{RANGES[option].label}
								</H6>
							</Pressable>
						))}
					</View>

					<TopDateSelector date={selectedDay} setDate={setSelectedDay} />
					</View>

					<WeightChart
						weightData={data?.length ? data : undefined}
						goal={currentGoal}
						period={period}
						height={215}
					/>

					<View style={styles.bandInset}>
						<H6 style={[styles.muted, styles.chartNote]}>
							Faint line is each weigh-in; the bold line is your trend. Tap for a
							day.
						</H6>
					</View>
				</View>

				{/* Logging. */}
				<View style={styles.card}>
					<H3>Log a weight</H3>
					<H6 style={styles.muted}>{dayLabel(selectedDay)}</H6>
					<View style={styles.logRow}>
						<View style={styles.inputWidth}>
							<FormInputNumber
								value={draft}
								placeholder="0.0"
								unit={WEIGHT_UNIT}
								viewStyle={{ backgroundColor: colors.off_white }}
								onChangeText={setDraft}
							/>
						</View>
						<PrimaryButton
							compact
							disabled={!canLog || isPending}
							onPress={submit}
							style={{ opacity: !canLog || isPending ? 0.5 : 1 }}
						>
							{isPending ? "Saving…" : "Log"}
						</PrimaryButton>
					</View>
				</View>

				{/* Recent logs; the full history is its own screen. */}
				<View style={styles.card}>
					<H3>History</H3>
					{entries.length === 0 ? (
						<H5 style={styles.muted}>Nothing logged yet.</H5>
					) : (
						<>
							{entries.slice(0, RECENT_LOGS).map((entry, index, shown) => (
								<View key={entry.id}>
									{index > 0 ? <View style={styles.divider} /> : null}
									<View style={styles.rowBetween}>
										<H5>{dayLabel(entry.timestamp)}</H5>
										<H5>
											{formatWeight(entry.weight, unit)} {WEIGHT_UNIT}
										</H5>
									</View>
									{index === shown.length - 1 && entries.length > RECENT_LOGS ? (
										<View style={{ marginTop: 12 }}>
											<SecondaryButton
												onPress={() => router.push("/(tabs)/(Home)/weightLogs")}
											>
												See all {entries.length}
											</SecondaryButton>
										</View>
									) : null}
								</View>
							))}
						</>
					)}
				</View>
			</View>
		</KeyboardAware>
	);
}

const styles = StyleSheet.create({
	page: {
		paddingHorizontal: 20,
		paddingBottom: 40,
		gap: 20,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		paddingTop: 20,
		gap: 12,
	},
	/** Edge to edge, matching the calorie card on Home. */
	chartBand: {
		backgroundColor: colors.white,
		marginHorizontal: -20,
		paddingVertical: 16,
		gap: 12,
	},
	bandInset: {
		paddingHorizontal: 20,
	},
	rowBetween: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	valueRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 6,
	},
	logRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	inputWidth: {
		flex: 1,
	},
	muted: {
		color: colors.inactive,
	},
	divider: {
		height: 1,
		backgroundColor: colors.line_break,
		marginVertical: 10,
	},
	segmented: {
		flexDirection: "row",
		backgroundColor: colors.off_white,
		borderRadius: 8,
		padding: 3,
		gap: 3,
	},
	segment: {
		flex: 1,
		paddingVertical: 7,
		borderRadius: 6,
		alignItems: "center",
	},
	segmentActive: {
		backgroundColor: colors.primary,
	},
	chartNote: {
		marginTop: 4,
	},
});
