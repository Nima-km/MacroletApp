import { colors, typography } from "@/theme";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { H5_SemiBold, H6 } from "../Typography";

interface Option {
	label: string;
	description?: string;
	value: any;
}

interface SelectionComponentProps {
	options: Option[];
	defaultOption?: number;
	selected?: any;
	onSelect: (value: any) => void;
}

const StyledRadioButton = ({
	options,
	defaultOption = 0,
	onSelect,
}: SelectionComponentProps) => {
	const [selectedValue, setSelectedValue] = useState<any>(
		options[defaultOption].value,
	);

	const handleSelect = (value: number) => {
		setSelectedValue(value);
		onSelect(value);
	};

	return (
		<View style={[styles.styled_container]}>
			{options.map((option) => (
				//    <View key={option.value} style={{ flex: 1 }}>
				<Pressable
					key={option.value}
					style={[
						selectedValue === option.value
							? styles.styled_selectedButton
							: styles.styled_notSelectedButton,
					]}
					onPress={() => handleSelect(option.value)}
					accessibilityRole="button"
					accessibilityState={{
						selected: selectedValue === option.value,
					}}
				>
					<H5_SemiBold
						style={[
							styles.styled_optionText,
							selectedValue === option.value &&
								styles.styled_selectedButtonText,
						]}
					>
						{option.label}
					</H5_SemiBold>
				</Pressable>
				//  </View>
			))}
		</View>
	);
};
export const DefaultRadioButton = ({
	options,
	onSelect,
}: SelectionComponentProps) => {
	const [selectedValue, setSelectedValue] = useState<number>(
		options[0].value,
	);

	const handleSelect = (value: number) => {
		setSelectedValue(value);
		onSelect(value);
	};

	return (
		<View style={[styles.container]}>
			{options.map((option) => (
				//    <View key={option.value} style={{ flex: 1 }}>
				<Pressable
					key={option.value}
					style={
						[
							// styles.styled_notSelectedButton,
						]
					}
					onPress={() => handleSelect(option.value)}
					accessibilityRole="button"
					accessibilityState={{
						selected: selectedValue === option.value,
					}}
				>
					<View
						style={{ flexDirection: "row", alignItems: "center" }}
					>
						<View
							style={[
								styles.radio_button_inactive,
								selectedValue === option.value &&
									styles.radio_button_active,
							]}
						>
							{selectedValue === option.value && (
								<View style={[styles.radio_button_inside]} />
							)}
						</View>
						<View style={styles.text_container}>
							<H5_SemiBold>{option.label}</H5_SemiBold>
						</View>
					</View>
				</Pressable>
				//  </View>
			))}
		</View>
	);
};
export const DetailedRadioButton = ({
	options,
	selected,
	onSelect,
}: SelectionComponentProps) => {
	const handleSelect = (value: any) => {
		//setSelectedValue(value);
		onSelect(value);
	};

	return (
		<View style={[{ flexDirection: "row", gap: 8 }]}>
			{options.map((option) => (
				//    <View key={option.value} style={{ flex: 1 }}>
				<Pressable
					key={option.value}
					style={[
						{
							backgroundColor: colors.white,
							padding: 20,
							borderRadius: 12,
							gap: 4,
							flex: 1,
							borderWidth: 2,
							borderColor: "transparent",
						},
						selected == option.value && {
							borderColor: colors.primary,
							backgroundColor: colors.primary_bg,
						},
					]}
					onPress={() => handleSelect(option.value)}
					accessibilityRole="button"
					accessibilityState={{
						selected: selected === option.value,
					}}
				>
					<View
						style={{ flexDirection: "row", alignItems: "center" }}
					>
						<View
							style={[
								styles.radio_button_inactive,

								styles.radio_button_active,
							]}
						>
							{selected === option.value && (
								<View style={[styles.radio_button_inside]} />
							)}
						</View>
						<View style={styles.text_container}>
							<H5_SemiBold
								style={
									selected == option.value && {
										color: colors.primary,
									}
								}
							>
								{option.label}
							</H5_SemiBold>
						</View>
					</View>
					<H6 style={{ color: colors.medium_gray, lineHeight: 20 }}>
						{option.description}
					</H6>
				</Pressable>
				//  </View>
			))}
		</View>
	);
};

export default StyledRadioButton;

const styles = StyleSheet.create({
	container: {},
	text_container: {
		marginLeft: 6,
	},
	radio_button_inactive: {
		height: 20,
		width: 20,
		borderRadius: typography.h5_SemiBold.fontSize - 1,
		outlineWidth: 1,
		outlineColor: colors.inactive,
		justifyContent: "center",
		alignItems: "center",
	},
	radio_button_inside: {
		height: 12,
		width: 12,
		borderRadius: typography.h5_SemiBold.fontSize - 4,
		backgroundColor: colors.primary,
	},
	radio_button_active: {
		outlineColor: colors.primary,
	},
	styled_container: {
		flexDirection: "row",
		backgroundColor: colors.primary_bg,
		borderRadius: 10,
		padding: 6,
	},
	styled_optionButton: {
		padding: 5,
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		// backgroundColor: 'white',
	},
	styled_selectedButton: {
		padding: 9,
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.white,
		borderRadius: 10,
		elevation: 2,
		shadowColor: "#000000",
	},
	styled_notSelectedButton: {
		padding: 9,
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 10,
		elevation: 2,
		shadowColor: colors.primary_bg,
	},
	styled_selectedButtonText: {
		color: colors.primary,
	},
	styled_shadowProp: {
		elevation: 5,
		shadowColor: "#000000",
	},
	styled_optionText: {
		color: colors.primary_inactive,
	},
});
