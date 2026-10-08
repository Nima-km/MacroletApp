import { colors } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { H5_SemiBold } from "../Typography";

/**
 * The membership pill.
 *
 * Brand fill with inverse text rather than a macro colour - the style guide
 * reserves `protein`/`carbs`/`fat` for macro data only (§1.2). Used beside the
 * display name on Profile and next to the wordmark on the paywall, so it is one
 * component rather than one per screen.
 */
export default function ProBadge({ label = "PRO" }: { label?: string }) {
	return (
		<View style={styles.badge}>
			<H5_SemiBold style={styles.ink}>{label}</H5_SemiBold>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		backgroundColor: colors.primary,
		borderRadius: 22,
		paddingVertical: 5,
		paddingHorizontal: 10,
	},
	ink: {
		color: colors.white,
	},
});
