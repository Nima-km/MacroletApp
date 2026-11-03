import { colors } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

type Props = {
	protein: number;
	carbs: number;
	fat: number;
	/** Bar thickness. 15 matches the full and small cards. */
	height?: number;
};

/**
 * The macro-spread bar: one row split in proportion to protein, carbs and fat.
 *
 * Extracted from `FoodCardFull` and `FoodCardSmall`, which each spelled it out inline.
 * The rounding is only on the outer ends, so the bar reads as one pill rather than three
 * blocks — which means a segment has to know whether it is first or last.
 */
export default function MacroBar({ protein, carbs, fat, height = 15 }: Props) {
	const p = Math.max(0, protein || 0);
	const c = Math.max(0, carbs || 0);
	const f = Math.max(0, fat || 0);

	// A food with no macros at all would otherwise render an empty coloured sliver.
	if (p + c + f <= 0) return null;

	// The rounding belongs to whichever segment is at each end, not to a fixed one:
	// protein gets the left cap whenever it is drawn, and the right cap only when it is
	// also last. Getting this the wrong way round leaves square corners on the pill.
	const leftCap = styles.leftCap;
	const rightCap = styles.rightCap;

	return (
		<View style={styles.row} accessibilityRole="progressbar">
			{p > 0 && (
				<View
					style={[
						styles.segment,
						{ height, backgroundColor: colors.protein, flex: p },
						leftCap,
						c === 0 && f === 0 && rightCap,
					]}
				/>
			)}
			{c > 0 && (
				<View
					style={[
						styles.segment,
						{ height, backgroundColor: colors.carbs, flex: c },
						p === 0 && leftCap,
						f === 0 && rightCap,
					]}
				/>
			)}
			{f > 0 && (
				<View
					style={[
						styles.segment,
						{ height, backgroundColor: colors.fat, flex: f },
						p === 0 && c === 0 && leftCap,
						rightCap,
					]}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		width: "100%",
	},
	segment: {
		height: 15,
	},
	leftCap: {
		borderTopLeftRadius: 8,
		borderBottomLeftRadius: 8,
	},
	rightCap: {
		borderTopRightRadius: 8,
		borderBottomRightRadius: 8,
	},
});
