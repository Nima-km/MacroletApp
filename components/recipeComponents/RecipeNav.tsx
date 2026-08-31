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
	scrollNavRef: React.RefObject<ScrollView | null>;
	onSelect: (value: number) => void;
}

const RecipeNav = ({
	selectedValue,
	scrollNavRef,
	style,
	onSelect,
}: SelectionComponentProps) => {
	const options: Option[] = [
		{ label: "Overview", value: 0 },
		{ label: "Ingredients", value: 1 },
		{ label: "Directions", value: 2 },
		{ label: "Reviews", value: 3 },
	];
	//const [selectedValue, setSelectedValue] = useState<number | null>(options[0].value);

	const handleSelect = (value: number) => {
		//  setSelectedValue(value);
		onSelect(value);
	};

	return (
		<ScrollView
			collapsable={false}
			style={{ zIndex: 10 }}
			ref={scrollNavRef}
			horizontal
			showsHorizontalScrollIndicator={false}
			nestedScrollEnabled={true}
		>
			<View
				style={{
					borderBottomWidth: 1,

					paddingHorizontal: 20,
					borderBottomColor: colors.light_gray,
				}}
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
			</View>
		</ScrollView>
	);
};

export default RecipeNav;

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",

		gap: 65,
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
