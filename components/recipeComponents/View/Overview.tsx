import { FormInputNumber } from "@/components/UIComponents/TextInputs/FormInput";
import { calculateCalories } from "@/helper/calculateCalories";
import { macroSum } from "@/helper/calculateMacro";
import { CalculateMacroSumIngredient } from "@/helper/recipeMacroSum";
import {
	useRecipeDraftStore,
	useRecipeStateStore,
} from "@/store/recipeStore/useRecipeStore";
import { colors } from "@/theme";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
	SimpleChartCarbsMacro,
	SimpleChartFatMacro,
	SimpleChartProteinMacro,
} from "../../chartComponents/SimpleChart/SimpleChartMacro";
import PrepCookButton from "../../UIComponents/Buttons/PrepCookButton";
import { H1, H2, H3, H6 } from "../../UIComponents/Typography";
type MODETYPES = "draft" | "state";
type Props = {
	servings: string;
	mode?: MODETYPES;
	setServings: (newServing: string) => void;
};

const Overview = ({ servings, mode = "state", setServings }: Props) => {
	//const foodData = useRecipeStateStore((state) => state.data.foodData);
	const recipeData =
		mode == "state"
			? useRecipeStateStore((state) => state.data.recipeData)
			: useRecipeDraftStore((state) => state.data.recipeData);
	const ingredientItemsData =
		mode == "state"
			? useRecipeStateStore((state) => state.data.ingredientItemsData)
			: useRecipeDraftStore((state) => state.data.ingredientItemsData);
	const foodData = CalculateMacroSumIngredient(ingredientItemsData);
	const options = [];
	function calculate_final(inp: number) {
		const mult = recipeData.servings_yield ?? 1;

		return (inp * Number(servings)) / mult;
	}
	useEffect(() => {}, [foodData]);

	const calories = calculateCalories(foodData);
	const total_macro = macroSum(foodData);
	return (
		<View style={{ flex: 1, gap: 24 }}>
			<H2>Overview</H2>
			<PrepCookButton
				prepTime={recipeData.prep_time ?? 0}
				cookTime={recipeData.cook_time ?? 0}
				setCookTime={(hour, mins) => {}}
				setPrepTime={(hour, mins) => {}}
				disable
			/>

			<View style={{ flexDirection: "row" }}>
				<View style={{ justifyContent: "center", flex: 1 }}>
					<H1>{Math.floor(calculate_final(calories))} cal</H1>
				</View>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						gap: 8,
					}}
				>
					<H3 style={{ color: colors.primary }}>Servings</H3>
					<FormInputNumber
						value={servings}
						onChangeText={setServings}
						//  lowerLimit={1}
					/>
				</View>
			</View>
			<H6>Nutritional information shown are per serving</H6>
			<View style={styles.chartsContainer}>
				<SimpleChartProteinMacro
					target={total_macro}
					progress={calculate_final(foodData.protein ?? 0)}
					backgroundColor={colors.white}
				/>
				<SimpleChartCarbsMacro
					target={total_macro}
					progress={calculate_final(foodData.carbs ?? 0)}
					backgroundColor={colors.white}
				/>
				<SimpleChartFatMacro
					target={total_macro}
					progress={calculate_final(foodData.fat ?? 0)}
					backgroundColor={colors.white}
				/>
			</View>
		</View>
	);
};

export default Overview;

const styles = StyleSheet.create({
	chartsContainer: {
		flexDirection: "row",

		//alignItems: 'center',
		justifyContent: "space-between",
		gap: 20,
	},
});
