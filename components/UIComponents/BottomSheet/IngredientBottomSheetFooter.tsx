import {
	SimpleChartCarbsSmall,
	SimpleChartFatSmall,
	SimpleChartProteinSmall,
} from "@/components/chartComponents/SimpleChart/SimpleChartSmall";
import { calculateCalories } from "@/helper/calculateCalories";
import { CalculateMacroSumIngredient } from "@/helper/recipeMacroSum";
import {
	useRecipeDraftStore,
	useRecipeStateStore,
} from "@/store/recipeStore/useRecipeStore";
import { useIngredientBottomSheetStore } from "@/store/useStore";
import { colors } from "@/theme";
import React from "react";
import { StyleSheet, View } from "react-native";
import { PrimaryButton } from "../Buttons/Button";
import { H1, H3, H4 } from "../Typography";

interface Props {
	onLogAll: () => void;
	isNewRecipe: boolean;
}

const IngredientBottomSheetFooter = ({ onLogAll, isNewRecipe }: Props) => {
	const { foodFullData } = useIngredientBottomSheetStore();
	const { data: newRecipe, addIngredient: addIngredientNewRecipe } =
		useRecipeDraftStore();
	const { data: recipe, addIngredient: addIngredientRecipe } =
		useRecipeStateStore();
	const foodData = CalculateMacroSumIngredient(foodFullData);
	console.log("ingredientBottomSheetFooter", foodData);
	const calories = calculateCalories(foodData);
	const total_macro = foodData.carbs + foodData.fat + foodData.protein;
	function onButton() {
		if (foodFullData) {
			console.log("FoodFullData", foodFullData);
			isNewRecipe
				? addIngredientNewRecipe(foodFullData)
				: addIngredientRecipe(foodFullData);
			onLogAll();
		}
	}
	return (
		<View
			style={{ backgroundColor: colors.off_white, padding: 16, gap: 20 }}
		>
			<H3>Nutrition Details</H3>

			<View style={[styles.rowContainer, { marginBottom: 20 }]}>
				<View
					style={{ justifyContent: "center", alignItems: "center" }}
				>
					<H1>{Math.floor(calories)}</H1>
					<H4>Calories</H4>
				</View>
				<View style={styles.chartsContainer}>
					<SimpleChartProteinSmall
						target={total_macro}
						progress={foodData.protein}
						backgroundColor={colors.white}
					/>
					<SimpleChartCarbsSmall
						target={total_macro}
						progress={foodData.carbs}
						backgroundColor={colors.white}
					/>
					<SimpleChartFatSmall
						target={total_macro}
						progress={foodData.fat}
						backgroundColor={colors.white}
					/>
				</View>
			</View>
			<PrimaryButton onPress={() => onButton()}>Confirm</PrimaryButton>
		</View>
	);
};

export default IngredientBottomSheetFooter;

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
