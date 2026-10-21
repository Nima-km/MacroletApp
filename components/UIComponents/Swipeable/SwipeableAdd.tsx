import Plus from "@/assets/svg/plus.svg";
import { colors } from "@/theme";
import React, { memo, ReactNode, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import SwipeableCore from "./SwipeableCore";

type SwipeableCoreProps = {
	children: ReactNode;
	onPress?: () => void;
	onSwipe?: () => void;
};

const NOOP = () => {};

function SwipeableAdd({
	children,
	onPress = NOOP,
	onSwipe,
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
				<Plus pointerEvents="none" />
			</View>
		),
		[],
	);
	return (
		<SwipeableCore
			underChildren={underChildren}
			onPress={onPress}
			onSwipe={onSwipe}
			backgroundColor={colors.primary}
			autoClose
		>
			{children}
		</SwipeableCore>
	);
};

export default memo(SwipeableAdd);

const styles = StyleSheet.create({});
