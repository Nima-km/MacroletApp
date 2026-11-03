import WeightChartFull from "@/components/chartComponents/LogHistoryCharts/WeightChartFull";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import TopDateSelector from "@/components/UIComponents/Calendar/TopDateSelector";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputNumber } from "@/components/UIComponents/TextInputs/FormInput";
import { H1, H3, H5, H6 } from "@/components/UIComponents/Typography";
import {
	useGetAllWeightItems,
	useGetWeightItems,
	useInsertWeight,
} from "@/db/hooks/weight/useWeightLog";
import { formatWindow, summarizeWeight } from "@/helper/weightSummary";
import {
	formatWeight,
	toDisplay,
	toGrams,
	unitLabel,
	weightBounds,
} from "@/helper/units";
import { emaTrend } from "@/helper/weightTrend";
import { useUnitStore } from "@/store/unitStore";
import { colors } from "@/theme";
import React, { useMemo, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

/** The screen shows the eight days before the selected end date. */
const WINDOW_DAYS = 8;

/**
 * The day the screen is looking at, at local midnight.
 *
 * The date control used to sit on the window's *exclusive* end — tomorrow — so it read
 * a day ahead of every weigh-in and could not change the date a log was stamped with.
 * It is now the selected day itself: it moves the window and it dates the next log.
 */
function startOfDay(value: Date = new Date()) {
	const date = new Date(value);
	date.setHours(0, 0, 0, 0);
	return date;
}

function dayLabel(date: Date) {
	return date.toLocaleDateString(undefined, {
		weekday: "short",
		day: "numeric",
		month: "short",
	});
}

export default function WeightHistory() {
	const [selectedDay, setSelectedDay] = useState(() => startOfDay());
	const [draft, setDraft] = useState("");

	const startDate = useMemo(() => {
		const from = new Date(selectedDay);
		from.setDate(from.getDate() - (WINDOW_DAYS - 1));
		return from;
	}, [selectedDay]);

	const endDate = useMemo(() => {
		const to = new Date(selectedDay);
		to.setDate(to.getDate() + 1);
		return to;
	}, [selectedDay]);

	const unit = useUnitStore((state) => state.unit);
	const bounds = weightBounds(unit);
	const WEIGHT_UNIT = unitLabel(unit);

	// Raw readings, not daily averages: a morning and an evening weigh-in are two points.
	const { data, isLoading, error } = useGetWeightItems(startDate, endDate);
	// History is every log ever, not just the visible window.
	const { data: allEntries } = useGetAllWeightItems();
	const { mutate: logWeight, isPending } = useInsertWeight();

	const summary = summarizeWeight(data);

	// The same trend the chart draws, so the number and the line can never disagree.
	const trend = useMemo(() => {
		const points = emaTrend(
			(data ?? []).map((entry) => ({
				timestamp: entry.timestamp,
				weight: entry.weight,
			})),
		);
		return points.length ? points[points.length - 1].trend : null;
	}, [data]);

	// Newest first; the query already returns them that way.
	const entries = allEntries ?? [];

	// Typed in the display unit; validated in it and stored in grams.
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

	// "Unchanged" is judged in the display unit: 0.05 lb is below a scale's precision, but
	// the same threshold in grams would call half a pound a change.
	const unchangedBelow = unit === "lb" ? 22 : 50;

	const deltaText = summary
		? Math.abs(summary.delta) < unchangedBelow
			? "No change over the week"
			: `${summary.delta > 0 ? "Up" : "Down"} ${formatWeight(Math.abs(summary.delta), unit)} ${WEIGHT_UNIT} over the week`
		: null;

	return (
		<KeyboardAware>
			<HeaderSimple title="Weight history" />

			<View style={styles.page}>
				{/* Current weight and the window's numbers. */}
				<View style={styles.card}>
					<View style={styles.rowBetween}>
						<H3>Weight</H3>
						<H6 style={styles.muted}>
							{formatWindow(startDate, endDate)}
						</H6>
					</View>

					{isLoading ? (
						<H5 style={styles.muted}>Loading…</H5>
					) : error ? (
						<H5 style={styles.muted}>
							Couldn't load your weigh-ins.
						</H5>
					) : summary ? (
						<>
							<View style={styles.valueRow}>
								<H1>{formatWeight(summary.current, unit)}</H1>
								<H5 style={styles.muted}>{WEIGHT_UNIT}</H5>
							</View>
							<H5 style={styles.muted}>{deltaText}</H5>
							<View style={styles.divider} />
							<View style={styles.rowBetween}>
								<H6 style={styles.muted}>Trend</H6>
								<H6>
									{trend === null
										? "—"
										: `${formatWeight(trend, unit)} ${WEIGHT_UNIT}`}
								</H6>
							</View>
							<View style={styles.rowBetween}>
								<H6 style={styles.muted}>7-day average</H6>
								<H6>
									{formatWeight(summary.average, unit)} {WEIGHT_UNIT}
								</H6>
							</View>
						</>
					) : (
						<H5 style={styles.muted}>
							No weigh-ins in this window. Log one below.
						</H5>
					)}
				</View>

				{/* Trend, with the date control that moves the window. */}
				<View style={styles.card}>
					<TopDateSelector date={selectedDay} setDate={setSelectedDay} />
					<WeightChartFull
						weightData={data?.length ? data : undefined}
						onSelect={() => {}}
					/>
					{/* Says out loud what the line is for, so a bad morning is not read
					    as a bad week. */}
					<H6 style={[styles.muted, styles.chartNote]}>
						Readings move with water, salt and food in transit. The dashed
						line is the trend.
					</H6>
				</View>

				{/* Logging. Guarded, with feedback, and it clears on success. */}
				<View style={styles.card}>
					<H3>Log a weight</H3>
					<H6 style={styles.muted}>
						{selectedDay.toLocaleDateString(undefined, {
							weekday: "long",
							day: "numeric",
							month: "short",
						})}
					</H6>
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

				{/* The entries the heading always promised, but never showed. */}
				<View style={styles.card}>
					<H3>History</H3>
					{entries.length === 0 ? (
						<H5 style={styles.muted}>Nothing logged yet.</H5>
					) : (
						entries.map((entry, index) => {
							const previous = entries[index + 1];
							const change = previous
								? entry.weight - previous.weight
								: 0;
							return (
								<View key={entry.timestamp.toISOString()}>
									{index > 0 ? (
										<View style={styles.divider} />
									) : null}
									<View style={styles.rowBetween}>
										<H5>{dayLabel(entry.timestamp)}</H5>
										<View style={styles.valueInline}>
											<H5>
												{formatWeight(entry.weight, unit)}{" "}
												{WEIGHT_UNIT}
											</H5>
											{Math.abs(change) < unchangedBelow ? null : (
												<H6 style={styles.muted}>
													{change > 0 ? "+" : "−"}
													{formatWeight(Math.abs(change), unit)}
												</H6>
											)}
										</View>
									</View>
								</View>
							);
						})
					)}
				</View>
			</View>
		</KeyboardAware>
	);
}

const styles = StyleSheet.create({
	chartNote: {
		marginTop: 4,
	},
	page: {
		// Style guide: 20 gutter between cards, 16 padding inside them.
		paddingHorizontal: 20,
		paddingBottom: 40,
		gap: 16,
	},
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		padding: 16,
		gap: 12,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	valueRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 6,
	},
	valueInline: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 8,
	},
	muted: {
		color: colors.inactive,
	},
	divider: {
		height: 1,
		backgroundColor: colors.light_gray,
		opacity: 0.6,
	},
	logRow: {
		flexDirection: "row",
		alignItems: "flex-end",
		gap: 12,
	},
	inputWidth: {
		width: 120,
	},
});
