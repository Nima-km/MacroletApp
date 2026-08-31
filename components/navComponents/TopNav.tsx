import { colors } from "@/theme";
import React from "react";
import { ScrollView, StyleSheet, View, ViewStyle } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { H5_SemiBold } from "../UIComponents/Typography";
interface Option {
	label: string;
	value: number;
}

interface SelectionComponentProps {
	selectedValue: number;
	style?: ViewStyle;
	scrollEnabled?: boolean;
	scrollNavRef?: React.RefObject<ScrollView | null>;
	options: Option[];
	onSelect: (value: number) => void;
}

const TopNav = ({
	selectedValue,
	scrollNavRef,
	style,
	options,
	scrollEnabled = false,
	onSelect,
}: SelectionComponentProps) => {
	const handleSelect = (value: number) => {
		onSelect(value);
	};

	return (
		<View
			style={{
				borderBottomWidth: 1,
				paddingHorizontal: 35,
				justifyContent: "center",
				alignItems: "center",
				borderBottomColor: colors.light_gray,
			}}
		>
			<ScrollView
				collapsable={false}
				style={{ zIndex: 10, flexShrink: 1 }}
				ref={scrollNavRef}
				scrollEnabled={scrollEnabled}
				horizontal
				showsHorizontalScrollIndicator={false}
				nestedScrollEnabled={true}
				contentContainerStyle={{ flexGrow: 1 }}
			>
				<View style={[styles.container, style]}>
					{options.map((option) => (
						<Pressable
							key={option.value}
							style={[
								styles.optionButton,
								selectedValue === option.value &&
									styles.selectedButton,
							]}
							onPress={() => handleSelect(option.value)}
							accessibilityRole="button"
							accessibilityState={{
								selected: selectedValue === option.value,
							}}
						>
							<H5_SemiBold
								style={[
									{
										color:
											selectedValue === option.value
												? colors.black
												: colors.inactive,
										marginBottom: 10,
									},
								]}
							>
								{option.label}
							</H5_SemiBold>

							{selectedValue === option.value && (
								<View
									style={[
										{
											flexDirection: "row",
											alignItems: "center",
										},
									]}
								>
									<View
										style={{
											backgroundColor: colors.error,
											height: 3,
											//marginTop: 10,
											flex: 1,
										}}
									/>
								</View>
							)}
						</Pressable>
					))}
				</View>
			</ScrollView>
		</View>
	);
};

export default TopNav;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		flex: 1,
		justifyContent: "space-around",
	},
	optionButton: {
		justifyContent: "center",
		alignItems: "center",
	},
	selectedButton: {
		elevation: 1,
		shadowColor: "#000000",
	},
	shadowProp: {
		elevation: 5,
		shadowColor: "#000000",
	},
	optionText: {
		fontSize: 16,
		color: "#333333",
	},
});
