import { colors } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { H3, H5_SemiBold } from "../Typography";

/**
 * Initials in a `primary_bg` circle - the stand-in for a profile picture.
 *
 * There is no image pipeline yet (no storage, no picker, no upload endpoint), and
 * a grey circle reads as broken. A monogram reads as deliberate and costs
 * nothing. Replace with `ImageView` once uploads exist - see
 * `Macrolet-Express/docs/IMAGE_PIPELINE.md`.
 */
export default function Monogram({
	name,
	size = 60,
}: {
	name: string;
	size?: number;
}) {
	const initials =
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() ?? "")
			.join("") || "?";

	return (
		<View
			style={[
				styles.circle,
				{ width: size, height: size, borderRadius: size / 2 },
			]}
		>
			{size >= 48 ? (
				<H3 style={styles.ink}>{initials}</H3>
			) : (
				<H5_SemiBold style={styles.ink}>{initials}</H5_SemiBold>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	// A circle: width === height === borderRadius (style guide §4).
	circle: {
		backgroundColor: colors.primary_bg,
		justifyContent: "center",
		alignItems: "center",
	},
	ink: {
		color: colors.primary,
	},
});
