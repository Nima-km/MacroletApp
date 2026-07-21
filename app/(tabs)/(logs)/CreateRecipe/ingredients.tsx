import FoodCardIngredient from "@/components/chartComponents/Cards/FoodCardIngredient";
import {
	SimpleChartCarbsSmall,
	SimpleChartFatSmall,
	SimpleChartProteinSmall,
} from "@/components/chartComponents/SimpleChart/SimpleChartSmall";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import StepIndicator from "@/components/recipeComponents/StepIndicator";
import {
	PrimaryButton,
	SecondaryAddButton,
} from "@/components/UIComponents/Buttons/Button";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import { FormInput } from "@/components/UIComponents/TextInputs/FormInput";
import { H1, H4, H5, H6 } from "@/components/UIComponents/Typography";
import { calculateCalories } from "@/helper/calculateCalories";
import { macroSum } from "@/helper/calculateMacro";
import { CalculateMacroSumIngredient } from "@/helper/recipeMacroSum";
import { useRecipeDraftStore } from "@/store/recipeStore/useRecipeStore";
import { colors } from "@/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

const ingredients = () => {
	const router = useRouter();
	const recipeObject = useRecipeDraftStore((state) => state);
	const [servingsYield, setServingsYield] = useState(
		recipeObject.data.recipeData.servings_yield?.toString() ?? "",
	);
	const removeIngredient = useRecipeDraftStore(
		(state) => state.removeIngredient,
	);
	const foodData = CalculateMacroSumIngredient(
		recipeObject.data.ingredientItemsData,
	);
	function calculate_final(inp: number) {
		const mult = recipeObject.data.recipeData.servings_yield;
		if (mult == 0 || mult == undefined) return inp;
		else return inp / mult;
	}
	function onServingChange(text: string) {
		setServingsYield(text);
		if (Number(text) && Number(text) != 0)
			recipeObject.updateRecipe("servings_yield", Number(text));
	}
	function goNext() {
		if (
			recipeObject.data.ingredientItemsData.length > 0 &&
			recipeObject.data.recipeData.servings_yield &&
			recipeObject.data.recipeData.servings_yield >= 1
		) {
			router.push("/(tabs)/(logs)/CreateRecipe/directions");
		} else {
			console.log("finish the steps");
		}
	}
	const calories = calculateCalories(foodData);
	console.log("ingredientEdit foodData", foodData);
	const total_macro = calculate_final(macroSum(foodData));
	return (
		<KeyboardAware>
			<HeaderSimple title={"Create Recipe"} />
			<StepIndicator activeStep={1} />
			<View style={{ flex: 1, padding: 20, gap: 12 }}>
				<View style={{ flex: 1, gap: 20 }}>
					<View
						style={{
							flexDirection: "row",
							gap: 8,
						}}
					>
						<View style={{ gap: 8, flex: 1 }}>
							<H4>Servings Yield</H4>
							<H5 style={{ color: colors.inactive }}>
								{"required"}
							</H5>
						</View>
						<View style={{ flex: 1 }}>
							<FormInput
								value={servingsYield}
								onChangeText={onServingChange}
								placeholder="Enter servings yield"
							/>
						</View>
					</View>

					<H6>Nutritional information shown are per serving</H6>
					<View
						style={[
							{
								flexDirection: "row",
								alignItems: "center",
								gap: 20,
								marginBottom: 20,
							},
						]}
					>
						<View
							style={{
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<H1>{Math.floor(calculate_final(calories))}</H1>
							<H4>Calories</H4>
						</View>
						<View
							style={{
								flexDirection: "row",
								flex: 1,
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<SimpleChartProteinSmall
								target={total_macro}
								progress={calculate_final(foodData.protein)}
								backgroundColor={colors.white}
							/>
							<SimpleChartCarbsSmall
								target={total_macro}
								progress={calculate_final(foodData.carbs)}
								backgroundColor={colors.white}
							/>
							<SimpleChartFatSmall
								target={total_macro}
								progress={calculate_final(foodData.fat)}
								backgroundColor={colors.white}
							/>
						</View>
					</View>
					<View style={{ flexDirection: "row", gap: 8 }}>
						<H4>Ingredients</H4>
						<H5 style={{ color: colors.inactive }}>{"required"}</H5>
					</View>
					<View style={{ gap: 10 }}>
						{recipeObject.data.ingredientItemsData.map(
							(item, index) => (
								<View key={index}>
									<FoodCardIngredient
										style={{ backgroundColor: "" }}
										food={item.food}
										ingredientItem={item.ingredientItem}
										onRemove={() => removeIngredient(index)}
									/>
									{index + 1 !=
										recipeObject.data.ingredientItemsData
											.length && (
										<View
											style={{
												height: 1,
												flex: 1,
												backgroundColor:
													colors.primary_bg,
											}}
										/>
									)}
								</View>
							),
						)}
					</View>

					<SecondaryAddButton
						onPress={() =>
							router.push(
								"/(tabs)/(logs)/CreateRecipe/AddIngredient",
							)
						}
					>
						Add Ingredient
					</SecondaryAddButton>
				</View>
				<PrimaryButton onPress={() => goNext()}>Next</PrimaryButton>
			</View>
		</KeyboardAware>
	);
};

export default ingredients;

const styles = StyleSheet.create({});
