import { colors } from "@/theme";
import React, { ReactNode, useRef, useState } from "react";
import { Animated, FlatList, Pressable, StyleSheet, View } from "react-native";
import { H3 } from "../Typography";
export interface DropdownOption {
	label: string;
	value: any;
	color: string;
	icon: ReactNode;
}

interface DropdownSelectProps {
	options: DropdownOption[] | undefined;
	children: React.ReactNode;
	defaultOption?: number;
	placeholder?: string;
	extraButtonText?: string;
	open: boolean;
	setOpen: (newVal: boolean) => void;
	onSelect?: (option: DropdownOption) => void;
	extraButton?: (value: any) => void;
	style?: any;
}
const iconWidth = 25;
export default function DropdownButton({
	options,
	children,
	placeholder = "Dropdown",
	defaultOption,
	open,
	setOpen,
	onSelect,
	extraButton,
	extraButtonText,
	style,
}: DropdownSelectProps) {
	const [selected, setSelected] = useState<DropdownOption | undefined>(
		defaultOption !== undefined ? options?.[defaultOption] : undefined,
	);
	const height = useRef(new Animated.Value(0)).current;

	const toggle = () => {
		setOpen(!open);
		Animated.timing(height, {
			toValue: open ? 0 : 120 + (extraButton ? 50 : 0), // auto size based on options
			duration: 200,
			useNativeDriver: false,
		}).start();
	};

	const handleSelect = (option: DropdownOption) => {
		setSelected(option);
		/* setOpen(false);
        Animated.timing(height, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        */
		toggle();
		console.log("i got pressed", option.value);
		onSelect?.(option);
	};

	return (
		<View style={[{}, style]}>
			{/* Selector button */}
			<Pressable onPress={toggle}>{children}</Pressable>
			{/*<Pressable style={styles.selector} onPress={toggle}>
				<H3>{selected ? selected.label : placeholder}</H3>
				<ArrowDown
					pointerEvents="none"
					width={iconWidth + 5}
					height={iconWidth - 5}
					style={{ marginLeft: 0, marginRight: -18 }}
				/>
			</Pressable>*/}

			{/* Dropdown list - now overlays instead of pushing content */}
			<Animated.View
				style={[styles.dropdown, { height }, styles.dropdownOverlay]}
			>
				<View>
					<FlatList
						data={options}
						keyExtractor={(item) => item.label}
						nestedScrollEnabled
						renderItem={({ item }) => (
							<Pressable
								style={[styles.option]}
								onPress={() => handleSelect(item)}
							>
								<H3
									style={[
										styles.optionText,
										{
											color: item.color,
											flexShrink: 1,
										},
									]}
								>
									{item.label}
								</H3>
								{item.icon}
							</Pressable>
						)}
						removeClippedSubviews={false}
						windowSize={(options?.length ?? 0) + 20}
						initialNumToRender={options?.length ?? 0}
						scrollEnabled={false}
						style={{ marginHorizontal: 12 }}
						ItemSeparatorComponent={() => (
							<View
								style={{
									height: 2,
									backgroundColor: colors.primary_bg,
								}}
							/>
						)}
					/>
				</View>
				{extraButton && (
					<Pressable onPress={extraButton} style={styles.extraButton}>
						<H3 style={{ color: colors.primary }}>
							{extraButtonText}
						</H3>
					</Pressable>
				)}
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	selector: {
		padding: 14,
		// height: 50,
		paddingHorizontal: 24,
		backgroundColor: colors.white,
		borderRadius: 10,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	dropdownOverlay: {
		position: "absolute",
		top: -10,
		//left: 0,
		right: 50,
		zIndex: 999, // stacks above siblings on iOS
		elevation: 20, // Android needs elevation, zIndex alone won't work
		backgroundColor: colors.white,
		overflow: "hidden",
	},
	dropdown: {
		overflow: "hidden",
		borderRadius: 8,
		width: 175,
		marginTop: 1,
		backgroundColor: colors.white,
	},
	option: {
		paddingVertical: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		//paddingHorizontal: 18,
		//backgroundColor: "red",
		borderRadius: 8,
	},
	extraButton: {
		paddingVertical: 16,
		paddingHorizontal: 24,
		borderTopColor: colors.light_gray,
		borderTopWidth: 1,
		borderRadius: 8,
	},
	selectedOption: {
		backgroundColor: colors.primary_bg,
		paddingHorizontal: 12,
	},
	selectedOptionText: {
		color: colors.primary,
	},
	optionText: {
		color: colors.inactive,
	},
});
