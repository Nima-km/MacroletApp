import Bin from "@/assets/svg/bin.svg";
import { colors } from "@/theme";
import React, { memo, ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import SwipeableCore from "./SwipeableCore";
type SwipeableCoreProps = {
	children: ReactNode;
	onPress: () => void;
};

function SwipeableDelete({
	children,
	onPress,
}: Omit<SwipeableCoreProps, "underChildren" | "backgroundColor">) {
	// Stable element: SwipeableCore memoises on this reference.
	const underChildren = useMemo(
		() => (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<Bin style={{ color: colors.white }} pointerEvents="none" />
			</View>
		),
		[],
	);
	return (
		<SwipeableCore
			underChildren={underChildren}
			onPress={onPress}
			backgroundColor={colors.error}
		>
			{children}
		</SwipeableCore>
	);
}

export default memo(SwipeableDelete);

const styles = StyleSheet.create({});
