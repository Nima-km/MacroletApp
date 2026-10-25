import { colors } from "@/theme";
import BottomSheet from "@gorhom/bottom-sheet";
import React, { forwardRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { PrimaryButton } from "../Buttons/Button";
import DropDownFilterCore from "../DropDown/DropDownFilterCore";
import { H2, H5 } from "../Typography";
import { Pressable } from "react-native";
import { BottomSheetCore } from "./BottomSheetCore";

interface SearchFilterBottomSheet {
	onApply: (filters: Record<string, string>) => void;
}
interface MinMax {
	min: string;
	max: string;
}
const SearchFilterBottomSheet = forwardRef<
	BottomSheet,
	SearchFilterBottomSheet
>(({ onApply }, ref) => {
	const [calorieRange, setCalorieRange] = useState<MinMax>({
		min: "0",
		max: "0",
	});
	const [carbRange, setCarbRange] = useState<MinMax>({ min: "0", max: "0" });
	const [proteinRange, setProteinRange] = useState<MinMax>({
		min: "0",
		max: "0",
	});
	const [fatRange, setFatRange] = useState<MinMax>({ min: "0", max: "0" });
	const [servingsYieldRange, setServingsYieldRange] = useState<MinMax>({
		min: "0",
		max: "0",
	});

	/** How many of the five ranges are actually set. */
	const activeCount = [
		calorieRange,
		proteinRange,
		carbRange,
		fatRange,
		servingsYieldRange,
	].filter((range) => range.min !== "0" || range.max !== "0").length;

	const resetAll = () => {
		const empty = { min: "0", max: "0" };
		setCalorieRange(empty);
		setProteinRange(empty);
		setCarbRange(empty);
		setFatRange(empty);
		setServingsYieldRange(empty);
	};

	const handleApply = () => {
		const filters: Record<string, string> = {};

		if (calorieRange.min !== "0") filters.min_calories = calorieRange.min;
		if (calorieRange.max !== "0") filters.max_calories = calorieRange.max;

		if (proteinRange.min !== "0") filters.min_protein = proteinRange.min;
		if (proteinRange.max !== "0") filters.max_protein = proteinRange.max;

		if (carbRange.min !== "0") filters.min_carbs = carbRange.min;
		if (carbRange.max !== "0") filters.max_carbs = carbRange.max;

		if (fatRange.min !== "0") filters.min_fat = fatRange.min;
		if (fatRange.max !== "0") filters.max_fat = fatRange.max;

		if (servingsYieldRange.min !== "0")
			filters.min_servings = servingsYieldRange.min;
		if (servingsYieldRange.max !== "0")
			filters.max_servings = servingsYieldRange.max;

		// Call the callback
		onApply(filters);
	};
	return (
		<BottomSheetCore
			ref={ref}
			snapPoints={["3%", "50%", "70%", "90%"]}
			enablePanDownToClose
			style={{ backgroundColor: colors.off_white }}
			footer={
				<PrimaryButton onPress={() => handleApply()}>
					{activeCount > 0
						? `Apply ${activeCount} ${activeCount === 1 ? "filter" : "filters"}`
						: "Apply"}
				</PrimaryButton>
			}
			header={<View></View>}
		>
			<View
				style={{
					flex: 1,
					justifyContent: "space-between",
				}}
			>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<H2>Filter</H2>
					{/* Reset only appears when there is something to reset - it used to
					    look available with no filters applied. */}
					{activeCount > 0 ? (
						<Pressable onPress={resetAll} hitSlop={12}>
							<H5 style={{ color: colors.inactive }}>Reset</H5>
						</Pressable>
					) : null}
				</View>
				<DropDownFilterCore
					sliderDomain={{ min: 0, max: 1000 }}
					sliderStep={10}
					placeholder={`Calorie Range`}
					unit="cal"
					minValue={calorieRange.min}
					maxValue={calorieRange.max}
					setMinValue={(newVal) =>
						setCalorieRange((prev) => ({ ...prev, min: newVal }))
					}
					setMaxValue={(newVal) =>
						setCalorieRange((prev) => ({ ...prev, max: newVal }))
					}
				/>
				<DropDownFilterCore
					sliderDomain={{ min: 0, max: 100 }}
					placeholder={`Protein Range`}
					unit="g"
					minValue={proteinRange.min}
					maxValue={proteinRange.max}
					setMinValue={(newVal) =>
						setProteinRange((prev) => ({ ...prev, min: newVal }))
					}
					setMaxValue={(newVal) =>
						setProteinRange((prev) => ({ ...prev, max: newVal }))
					}
				/>
				<DropDownFilterCore
					sliderDomain={{ min: 0, max: 150 }}
					placeholder={`Carb Range`}
					unit="g"
					minValue={carbRange.min}
					maxValue={carbRange.max}
					setMinValue={(newVal) =>
						setCarbRange((prev) => ({ ...prev, min: newVal }))
					}
					setMaxValue={(newVal) =>
						setCarbRange((prev) => ({ ...prev, max: newVal }))
					}
				/>
				<DropDownFilterCore
					sliderDomain={{ min: 0, max: 100 }}
					placeholder={`Fat Range`}
					unit="g"
					minValue={fatRange.min}
					maxValue={fatRange.max}
					setMinValue={(newVal) =>
						setFatRange((prev) => ({ ...prev, min: newVal }))
					}
					setMaxValue={(newVal) =>
						setFatRange((prev) => ({ ...prev, max: newVal }))
					}
				/>
				<DropDownFilterCore
					sliderDomain={{ min: 1, max: 20 }}
					placeholder={`Servings Yield Range`}
					unit="g"
					minValue={servingsYieldRange.min}
					maxValue={servingsYieldRange.max}
					setMinValue={(newVal) =>
						setServingsYieldRange((prev) => ({
							...prev,
							min: newVal,
						}))
					}
					setMaxValue={(newVal) =>
						setServingsYieldRange((prev) => ({
							...prev,
							max: newVal,
						}))
					}
				/>
			</View>
		</BottomSheetCore>
	);
});
export default SearchFilterBottomSheet;

const styles = StyleSheet.create({
	rowContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 0,
	},
	chartsContainer: {
		flexDirection: "row",
		marginLeft: 20,
		flex: 1,
		justifyContent: "space-around",
	},
});
