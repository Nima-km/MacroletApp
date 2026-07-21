import React, { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { useDateStore } from "@/store/dateStore";
import { colors } from "@/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TopDateSelector from "../UIComponents/Calendar/TopDateSelector";
import { H1 } from "../UIComponents/Typography";

type Props = {
	title: string | undefined;
	dateSelector?: boolean;
	LeftButton?: ReactNode;
	RightButton?: ReactNode;
	logo?: ReactNode;
};
function HeaderCore({
	title,
	LeftButton,
	RightButton,
	logo,
	dateSelector = false,
}: Props) {
	const date = useDateStore((state) => state.date);
	const setDate = useDateStore((state) => state.setDate);
	const insets = useSafeAreaInsets();

	return (
		<View
			style={[
				styles.container,
				{
					gap: 10,
					paddingTop: insets.top + 10,
					paddingRight: insets.right,
					paddingLeft: insets.left,
				},
			]}
			//edges={["top", "right", "left"]}
		>
			<View
				style={{
					paddingHorizontal: 20,
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "space-between",
				}}
			>
				<View style={styles.leftButton}>{LeftButton}</View>
				<View
					style={[
						{
							//		flex: 1,
							alignItems: "center",
							justifyContent: "center",
						},
					]}
				>
					{title && <H1>{title}</H1>}

					{logo}
				</View>
				<View style={styles.rightButton}>{RightButton}</View>
			</View>
			{dateSelector ? (
				<TopDateSelector date={date} setDate={setDate} />
			) : (
				<View />
			)}
		</View>
	);
}
export default HeaderCore;

const styles = StyleSheet.create({
	container: {
		paddingTop: 20,
		paddingBottom: 0,
		backgroundColor: colors.off_white,
		//  alignItems: "center",
	},
	leftButton: {
		width: 70,
	},
	rightButton: {
		width: 70,
	},
});
