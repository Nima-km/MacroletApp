import ArrowDown from "@/assets/svg/chevron-down.svg";
import { colors } from "@/theme";
import React, { memo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import RangeSliderTest from "../Slider/RangeSlider-test";
import { FormInputNumberStyled } from "../TextInputs/FormInput";
import { H3 } from "../Typography";

/**
 * TEST COPY - the previous implementation, kept for performance comparison.
 *
 * Pairs with RangeSlider-test.tsx: the slider reports values while dragging, so this
 * component re-renders during a drag. Swap the import in SearchFilterBottomSheet to
 * compare against the current version.
 *
 * Not imported by anything. Delete once the comparison is done.
 */
interface Props {
	placeholder?: string;
	unit?: string;
	minValue: string;
	maxValue: string;
	setMinValue: (newVal: string) => void;
	setMaxValue: (newVal: string) => void;
	sliderDomain?: { min: number; max: number };
	sliderStep?: number;
	sliderMinGap?: number;
}
const DropDownFilterCoreTest = ({
	placeholder,
	minValue,
	unit,
	maxValue,
	setMaxValue,
	setMinValue,
	sliderDomain,
	sliderStep = 1,
	sliderMinGap = 0,
}: Props) => {
	const [open, setOpen] = useState(false);
	const iconWidth = 25;
	const height = useRef(new Animated.Value(0)).current;

	const toggle = () => {
		setOpen(!open);
		Animated.timing(height, {
			toValue: open ? 0 : sliderDomain ? 180 : 100, // room for a slider when there is one
			duration: 150,
			useNativeDriver: false,
		}).start();
	};

	return (
		<View style={[{ width: "100%" }]}>
			{/* Selector button */}
			<Pressable style={styles.selector} onPress={toggle}>
				<H3>{placeholder}</H3>
				<ArrowDown
					pointerEvents="none"
					width={iconWidth + 5}
					height={iconWidth - 5}
					style={{
						marginLeft: 0,
						marginRight: -18,
						transform: [{ rotate: open ? "180deg" : "0deg" }],
					}}
				/>
			</Pressable>

			{/* Dropdown list */}
			<Animated.View style={[styles.dropdown, { height }]}>
				{sliderDomain ? (
					<RangeSliderTest
						min={sliderDomain.min}
						max={sliderDomain.max}
						low={Number(minValue) || sliderDomain.min}
						high={Number(maxValue) || sliderDomain.max}
						onChange={(lo, hi) => {
							setMinValue(String(Math.round(lo)));
							setMaxValue(String(Math.round(hi)));
						}}
					/>
				) : null}
				<View
					style={{
						flexDirection: "row",

						justifyContent: "center",
						gap: 20,
					}}
				>
					<FormInputNumberStyled
						value={minValue}
						unit={unit}
						leftText="Min"
						onChangeText={setMinValue}
					/>
					<FormInputNumberStyled
						value={maxValue}
						unit={unit}
						leftText="Max"
						onChangeText={setMaxValue}
					/>
				</View>
			</Animated.View>
		</View>
	);
};

export default memo(DropDownFilterCoreTest);

const styles = StyleSheet.create({
	selector: {
		paddingVertical: 14,
		borderRadius: 10,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	dropdown: {
		overflow: "hidden",
		marginTop: 1,
	},
});
