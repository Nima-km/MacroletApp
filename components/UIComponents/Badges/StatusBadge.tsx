import { colors } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { H6 } from "../Typography";

export type StatusTone = "positive" | "info" | "warning";

/**
 * Status pill following the style guide's pair rule (§7.5): a light fill with the
 * matching dark ink and a 1px border. There was no chip component, and the
 * pattern was being re-implemented per screen.
 */
export default function StatusBadge({
	label,
	tone = "info",
}: {
	label: string;
	tone?: StatusTone;
}) {
	return (
		<View style={[styles.badge, surfaces[tone]]}>
			<H6 style={inks[tone]}>{label}</H6>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		borderWidth: 1,
		borderRadius: 25,
		padding: 8,
		gap: 4,
		alignSelf: "flex-start",
	},
});

const surfaces: Record<
	StatusTone,
	{ backgroundColor: string; borderColor: string }
> = {
	positive: {
		backgroundColor: colors.light_green,
		borderColor: colors.dark_green,
	},
	info: {
		backgroundColor: colors.light_blue,
		borderColor: colors.dark_blue,
	},
	warning: {
		backgroundColor: colors.light_yellow,
		borderColor: colors.dark_yellow,
	},
};

const inks: Record<StatusTone, { color: string }> = {
	positive: { color: colors.dark_green },
	info: { color: colors.dark_blue },
	warning: { color: colors.dark_yellow },
};
