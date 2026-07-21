import React, { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import Barcode from "@/assets/svg/barcode.svg";
import Recent from "@/assets/svg/clock.svg";
import Quick from "@/assets/svg/quick.svg";
import Recipes from "@/assets/svg/recipe-book.svg";
import { colors } from "@/theme";
import { H6 } from "../UIComponents/Typography";

interface Option {
	label: string;
	icon: (style?: object) => ReactNode;
	value: number;
}

interface SelectionComponentProps {
	selectedValue: number;
	isNotRecipe?: boolean;
	onSelect: (value: number) => void;
}

const NavSelector = ({
	selectedValue,
	isNotRecipe = true,
	onSelect,
}: SelectionComponentProps) => {
	const width = 28;
	const height = 28;
	const options: Option[] = [
		{
			label: "Recent",
			value: 0,
			icon: (style) => (
				<Recent
					width={width}
					height={height}
					style={style}
					pointerEvents="none"
				/>
			),
		},
		...(isNotRecipe
			? [
					{
						label: "Recipes",
						value: 1,
						icon: (style?: object) => (
							<Recipes
								width={width}
								height={height}
								style={style}
								pointerEvents="none"
							/>
						),
					},
				]
			: []),
		{
			label: "Barcode",
			value: isNotRecipe ? 2 : 1,
			icon: (style) => (
				<Barcode
					width={width}
					height={height}
					style={style}
					pointerEvents="none"
				/>
			),
		},
		...(isNotRecipe
			? [
					{
						label: "Quick Add",
						value: 3,
						icon: (style?: object) => (
							<Quick
								width={width}
								height={height}
								style={style}
								pointerEvents="none"
							/>
						),
					},
				]
			: []),
	];
	//const [selectedValue, setSelectedValue] = useState<number | null>(options[0].value);
	const handleSelect = (value: number) => {
		//  setSelectedValue(value);
		onSelect(value);
	};

	return (
		<View>
			<View style={[styles.container]}>
				{options.map((option) => (
					<TouchableOpacity
						activeOpacity={1}
						key={option.value}
						style={[
							styles.optionButton,
							selectedValue === option.value &&
								styles.selectedButton,
							//  option.value === 0 && { marginLeft: 20 },
						]}
						onPress={() => handleSelect(option.value)}
						accessibilityRole="button"
						accessibilityState={{
							selected: selectedValue === option.value,
						}}
					>
						{option.icon({
							color:
								selectedValue === option.value
									? colors.primary
									: colors.primary_inactive,
						})}
						<H6
							style={[
								{
									color:
										selectedValue === option.value
											? colors.black
											: colors.inactive,
									marginBottom: 4,
								},
							]}
						>
							{option.label}
						</H6>

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
					</TouchableOpacity>
				))}
			</View>
		</View>
	);
};
export default NavSelector;

const styles = StyleSheet.create({
	container: {
		//gap: 50,
		flexDirection: "row",
		justifyContent: "space-around",
		borderBottomWidth: 1, // ultra thin (1px on most screens)
		borderBottomColor: colors.light_gray,
	},
	optionButton: {
		justifyContent: "center",
		gap: 6,
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
