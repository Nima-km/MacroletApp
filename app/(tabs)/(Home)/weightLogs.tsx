import HeaderSimple from "@/components/navComponents/HeaderSimple";
import { H5 } from "@/components/UIComponents/Typography";
import { useGetAllWeightItems } from "@/db/hooks/weight/useWeightLog";
import { formatWeight, unitHeading } from "@/helper/units";
import { useUnitStore } from "@/store/unitStore";
import { colors } from "@/theme";
import React from "react";
import { FlatList, StyleSheet, View } from "react-native";

/**
 * Every weight log ever recorded, newest first.
 *
 * This is the long list the History section of `weightHistory` only shows in a card:
 * it can hold thousands of rows, so it is a virtualised `FlatList` rather than a map.
 */

/** "Tue, Nov 3", plus the year when the entry is not from this year. */
function dayLabel(timestamp: Date) {
	const date = timestamp.toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
	});

	return timestamp.getFullYear() === new Date().getFullYear()
		? date
		: `${date} ${timestamp.getFullYear()}`;
}

export default function WeightLogs() {
	const unit = useUnitStore((state) => state.unit);
	const { data, isLoading } = useGetAllWeightItems();

	const entries = data ?? [];

	return (
		<View style={styles.screen}>
			<HeaderSimple title="All weigh-ins" />

			{isLoading ? (
				<View style={styles.centred}>
					<H5 style={styles.muted}>Loading…</H5>
				</View>
			) : entries.length === 0 ? (
				<View style={styles.centred}>
					<H5 style={styles.muted}>No weigh-ins yet.</H5>
				</View>
			) : (
				<FlatList
					data={entries}
					keyExtractor={(item) => String(item.id)}
					contentContainerStyle={styles.list}
					ItemSeparatorComponent={() => <View style={styles.divider} />}
					renderItem={({ item }) => (
						<View style={styles.rowBetween}>
							<H5>{dayLabel(item.timestamp)}</H5>
							<H5>
								{formatWeight(item.weight, unit)}{" "}
								{unitHeading(unit)}
							</H5>
						</View>
					)}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	centred: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingBottom: 40,
	},
	muted: {
		color: colors.inactive,
		textAlign: "center",
	},
	list: {
		paddingHorizontal: 20,
		paddingBottom: 40,
	},
	rowBetween: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 12,
	},
	divider: {
		height: 1,
		backgroundColor: colors.line_break,
	},
});
