// components/BottomSheetCore.tsx
import { colors } from "@/theme";
import BottomSheet, {
	BottomSheetBackdrop,
	BottomSheetFooter,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { forwardRef, ReactNode, useCallback, useMemo } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

type Props = {
	snapPoints?: (string | number)[];
	enablePanDownToClose?: boolean;
	style?: ViewStyle;
	children: ReactNode;
	footer?: ReactNode;
	header?: ReactNode;
	initialIndex?: number;
};

export const BottomSheetCore = forwardRef<BottomSheet, Props>(
	(
		{
			snapPoints = ["7%", "50%", "70%", "92%"],
			enablePanDownToClose = false,
			children,
			style,
			footer,
			header,
			initialIndex = 0,
		},
		ref,
	) => {
		const points = useMemo(() => snapPoints, []);
		const renderFooter = useCallback(
			(props?: any) => (
				<BottomSheetFooter {...props} bottomInset={0}>
					{footer}
				</BottomSheetFooter>
			),
			[footer],
		);

		return (
			<BottomSheet
				ref={ref}
				snapPoints={points}
				index={initialIndex}
				footerComponent={renderFooter}
				enablePanDownToClose={enablePanDownToClose}
				backdropComponent={(props) => (
					<BottomSheetBackdrop
						{...props}
						appearsOnIndex={1}
						disappearsOnIndex={0}
						enableTouchThrough
						pressBehavior="none"
					/>
				)}
				enableContentPanningGesture={false}
				style={[styles.sheet]}
				backgroundStyle={[style]}
				enableDynamicSizing={false}
				handleComponent={() => (
					<View style={{ marginBottom: 10, paddingHorizontal: 20 }}>
						<View
							style={{ marginVertical: 10, alignItems: "center" }}
						>
							<View
								style={{
									width: 60,
									height: 5,
									borderRadius: 2,
									backgroundColor: colors.light_gray,
								}}
							/>
						</View>
						{header}
					</View>
				)}
			>
				<BottomSheetScrollView>
					<View style={styles.content}>{children}</View>
				</BottomSheetScrollView>
			</BottomSheet>
		);
	},
);

const styles = StyleSheet.create({
	sheet: {
		shadowColor: "#000",
		shadowOpacity: 1,
		shadowRadius: 8,
	},
	content: {
		flex: 1,
		justifyContent: "space-between",
		paddingHorizontal: 10,
		//backgroundColor: 'red'
		//padding: 16,
	},
});
