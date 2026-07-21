import Plus from "@/assets/svg/plus.svg";
import { colors } from "@/theme";
import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import SwipeableCore from "./SwipeableCore";

type SwipeableCoreProps = {
	children: ReactNode;
	onPress?: () => void;
	onSwipe?: () => void;
};

const SwipeableAdd = ({
	children,
	onPress = () => {},
	onSwipe,
}: Omit<SwipeableCoreProps, "underChildren" | "backgroundColor">) => {
	return (
		<SwipeableCore
			underChildren={
				<View
					style={{
						flex: 1,
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Plus pointerEvents="none" />
				</View>
			}
			onPress={onPress}
			onSwipe={onSwipe}
			backgroundColor={colors.primary}
			autoClose
		>
			{children}
		</SwipeableCore>
	);
};

export default SwipeableAdd;

const styles = StyleSheet.create({});
