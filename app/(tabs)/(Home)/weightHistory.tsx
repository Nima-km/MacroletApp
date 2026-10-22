import WeightChartFull from "@/components/chartComponents/LogHistoryCharts/WeightChartFull";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import TopDateSelector from "@/components/UIComponents/Calendar/TopDateSelector";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInputNumber } from "@/components/UIComponents/TextInputs/FormInput";
import { H1, H3, H5, H6 } from "@/components/UIComponents/Typography";
import {
	useGetWeightList,
	useInsertWeight,
} from "@/db/hooks/weight/useWeightLog";
import {
	formatWeight,
	formatWindow,
	MAX_WEIGHT,
	MIN_WEIGHT,
	summarizeWeight,
	WEIGHT_UNIT,
} from "@/helper/weightSummary";
import { colors } from "@/theme";
import React, { useMemo, useState } from "react";
import { Keyboard, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";

/** The screen shows the eight days before the selected end date. */
const WINDOW_DAYS = 8;

function startOfTomorrow() {
	const date = new Date();
	date.setHours(24, 0, 0, 0);
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
	const [endDate, setEndDate] = useState(startOfTomorrow);
	const [draft, setDraft] = useState("");

	const startDate = useMemo(() => {
		const from = new Date(endDate);
		from.setDate(from.getDate() - WINDOW_DAYS);
		return from;
	}, [endDate]);

	const { data, isLoading, error } = useGetWeightList(startDate, endDate);
	const { mutate: logWeight, isPending } = useInsertWeight();

	const summary = summarizeWeight(data);

	// Newest first for the list; the chart wants the ascending order it gets.
	const entries = useMemo(
		() =>
			[...(data ?? [])].sort(
				(a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
			),
		[data],
	);

	const parsed = Number(draft);
	const canLog =
		draft.trim().length > 0 &&
		Number.isFinite(parsed) &&
		parsed >= MIN_WEIGHT &&
		parsed <= MAX_WEIGHT;

	function submit() {
		if (!canLog) {
			Toast.show({
				type: "error",
				text1: "Enter a weight",
				text2: `Between ${MIN_WEIGHT} and ${MAX_WEIGHT} ${WEIGHT_UNIT}.`,
			});
			return;
		}

		Keyboard.dismiss();
		logWeight(
			{ weight: parsed },
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

	const deltaText = summary
		? Math.abs(summary.delta) < 0.05
			? "No change over the week"
			: `${summary.delta > 0 ? "Up" : "Down"} ${formatWeight(
					Math.abs(summary.delta),
				)} ${WEIGHT_UNIT} over the week`
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
								<H1>{formatWeight(summary.current)}</H1>
								<H5 style={styles.muted}>{WEIGHT_UNIT}</H5>
							</View>
							<H5 style={styles.muted}>{deltaText}</H5>
							<View style={styles.divider} />
							<View style={styles.rowBetween}>
								<H6 style={styles.muted}>7-day average</H6>
								<H6>
									{formatWeight(summary.average)} {WEIGHT_UNIT}
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
					<TopDateSelector date={endDate} setDate={setEndDate} />
					<WeightChartFull
						weightData={data?.length ? data : undefined}
						onSelect={() => {}}
					/>
				</View>

				{/* Logging. Guarded, with feedback, and it clears on success. */}
				<View style={styles.card}>
					<H3>Log a weight</H3>
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
												{formatWeight(entry.weight)}{" "}
												{WEIGHT_UNIT}
											</H5>
											{Math.abs(change) < 0.05 ? null : (
												<H6 style={styles.muted}>
													{change > 0 ? "+" : "−"}
													{formatWeight(
														Math.abs(change),
													)}
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
