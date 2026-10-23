import { colors } from "@/theme";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import { H3, H5_SemiBold } from "../Typography";

/**
 * A profile picture, falling back to initials.
 *
 * Pass `uri` when the creator has an uploaded avatar; leave it out and this is the
 * `primary_bg` monogram it has always been. The fallback is deliberately complete -
 * an image is never a prerequisite for a working screen.
 */
export default function Monogram({
	name,
	size = 60,
	uri,
}: {
	name: string;
	size?: number;
	uri?: string | null;
}) {
	if (uri) {
		return (
			<Image
				source={{ uri }}
				style={{ width: size, height: size, borderRadius: size / 2 }}
				contentFit="cover"
				transition={150}
				// A picture is decorative next to the name it belongs to.
				accessibilityElementsHidden
				importantForAccessibility="no"
			/>
		);
	}

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
