import WeightLogChartSmall from "@/components/chartComponents/LogHistoryCharts/WeightLogChartSmall";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import { H1, H3, H5, H6 } from "@/components/UIComponents/Typography";
import { colors } from "@/theme";
import {
	formatWeight,
	summarizeWeight,
	WEIGHT_UNIT as UNIT,
} from "@/helper/weightSummary";
import { WeightHistoryRecord } from "@/types/weight";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
	data?: WeightHistoryRecord[];
	/** Tap anywhere on the card: opens weight history. */
	onOpenHistory: () => void;
	/** The explicit "Log" affordance: goes straight to logging. */
	onLogWeight: () => void;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Home weight card.
 *
 * Leads with the current weight, because the previous card showed the words "Weekly
 * Average" and a unit but never a number. Then the change against the start of the
 * window, when it was last logged, the real 7-day average, and the trend line.
 *
 * The delta is deliberately neutral: for weight, up is not failure and down is not
 * success - that depends on the user's goal, which the app does not know.
 */
export default function WeightCard({ data, onOpenHistory, onLogWeight }: Props) {
	// Shared with the history screen, so the two cannot disagree about what
	// "current weight" or "7-day average" mean.
	const summary = summarizeWeight(data);
	const lastLogged = summary
		? WEEKDAYS[summary.currentDate.getDay()]
		: null;

	if (!summary) {
		return (
			<View style={styles.card}>
				<View style={styles.headerRow}>
					<H3>Weight</H3>
				</View>
				<H5 style={styles.emptyText}>
					No weigh-ins yet. Logging weekly is enough to see a
					trend.
				</H5>
				<PrimaryButton onPress={onLogWeight}>
					Log your first weight
				</PrimaryButton>
			</View>
		);
	}

	const gained = summary.delta > 0;
	const equal = Math.abs(summary.delta) < 0.05;

	return (
		<Pressable
			onPress={onOpenHistory}
			style={({ pressed }) => [styles.card, pressed && styles.pressed]}
			accessibilityRole="button"
			accessibilityLabel={`Weight, ${formatWeight(summary.current)} ${UNIT}, ${
				equal
					? "unchanged"
					: `${gained ? "up" : "down"} ${formatWeight(
							Math.abs(summary.delta),
						)} ${UNIT}`
			} over the last 7 days. Opens weight history.`}
		>
			<View style={styles.headerRow}>
				<H3>Weight</H3>
				<Pressable
					onPress={onLogWeight}
					hitSlop={12}
					style={({ pressed }) => [
						styles.logButton,
						pressed && styles.pressed,
					]}
					accessibilityRole="button"
					accessibilityLabel="Log a new weight"
				>
					<H6 style={styles.logButtonText}>Log</H6>
				</Pressable>
			</View>

			<View style={styles.valueRow}>
				<H1>{formatWeight(summary.current)}</H1>
				<H5 style={styles.unit}>{UNIT}</H5>
			</View>

			<H5 style={styles.meta}>
				{equal
					? "No change over the week"
					: `${gained ? "Up" : "Down"} ${formatWeight(
							Math.abs(summary.delta),
						)} ${UNIT} over the week`}
				{"  ·  "}
				<H5 style={styles.metaMuted}>
					last logged {lastLogged}
				</H5>
			</H5>

			<View style={styles.divider} />

			<View style={styles.averageRow}>
				<H6 style={styles.metaMuted}>7-day average</H6>
				<H6>
					{formatWeight(summary.average)} {UNIT}
				</H6>
			</View>

			{data && data.length > 0 ? (
				<WeightLogChartSmall weightData={data} />
			) : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.white,
		borderRadius: 8,
		// Style guide: 16 for content cards, and cards are flat.
		padding: 16,
		gap: 12,
	},
	pressed: {
		opacity: 0.85,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	logButton: {
		backgroundColor: colors.primary_bg,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 6,
	},
	logButtonText: {
		color: colors.primary,
	},
	valueRow: {
		flexDirection: "row",
		alignItems: "baseline",
		gap: 6,
	},
	unit: {
		color: colors.inactive,
	},
	meta: {
		color: colors.black,
	},
	metaMuted: {
		color: colors.inactive,
	},
	emptyText: {
		color: colors.inactive,
	},
	divider: {
		height: 1,
		backgroundColor: colors.light_gray,
		opacity: 0.6,
	},
	averageRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
});
