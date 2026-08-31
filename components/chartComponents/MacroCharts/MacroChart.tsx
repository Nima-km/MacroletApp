import { colors } from "@/theme";
import { FoodInsert } from "@/types/food";
import React from "react";
import { StyleSheet, View } from "react-native";
type Props = {
	food: FoodInsert;
	height?: number;
};
const MacroChart = ({ food, height = 15 }: Props) => {
	return (
		<View style={[{ flexDirection: "row" }]}>
			<View
				style={[
					styles.progressBar,
					{ height: height },
					{
						backgroundColor: colors.protein,
						borderTopLeftRadius: 8,
						borderBottomLeftRadius: 8,

						flex: food.protein,
					},
					(food.fat ?? 0) + (food.carbs ?? 0) == 0
						? {
								borderTopRightRadius: 8,
								borderBottomRightRadius: 8,
							}
						: {},
				]}
			/>
			<View
				style={[
					styles.progressBar,
					{ height: height },
					{
						backgroundColor: colors.carbs,
						flex: food.carbs,
					},
					food.fat == 0
						? {
								borderTopRightRadius: 8,
								borderBottomRightRadius: 8,
							}
						: {},
					food.protein == 0
						? {
								borderTopLeftRadius: 8,
								borderBottomLeftRadius: 8,
							}
						: {},
				]}
			/>
			<View
				style={[
					styles.progressBar,
					{ height: height },
					{
						backgroundColor: colors.fat,
						borderTopRightRadius: 8,
						borderBottomRightRadius: 8,
						flex: food.fat,
					},
					(food.protein ?? 0) + (food.carbs ?? 0) == 0
						? {
								borderTopLeftRadius: 8,
								borderBottomLeftRadius: 8,
							}
						: {},
				]}
			/>
		</View>
	);
};

export default MacroChart;

const styles = StyleSheet.create({
	progressBar: {
		height: 15,
	},
});
