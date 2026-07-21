import FoodCardIngredient from "@/components/chartComponents/Cards/FoodCardIngredient";
import { calculateCalories } from "@/helper/calculateCalories";
import { macroSum } from "@/helper/calculateMacro";
import { colors } from "@/theme";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";

import { SecondaryAddButton } from "@/components/UIComponents/Buttons/Button";
import IngredientModal from "@/components/UIComponents/Modals/IngredientModal";
import {
	useRecipeDraftStore,
	useRecipeStateStore,
} from "@/store/recipeStore/useRecipeStore";
import { DefaultServings } from "@/tests/testData";
import { H2, H3 } from "../../UIComponents/Typography";
type MODETYPES = "draft" | "state";

type Props = {
	servings: string;
	mode?: MODETYPES;
	canModifyIngredient?: boolean;
	setServings: (newServing: string) => void;
	addIngredient: () => void;
};
const Ingredients = ({
	servings,
	canModifyIngredient = true,
	addIngredient,
	mode = "state",
	setServings,
}: Props) => {
	const foodData =
		mode == "state"
			? useRecipeStateStore((state) => state.data.foodData)
			: useRecipeDraftStore((state) => state.data.foodData);
	const recipeData =
		mode == "state"
			? useRecipeStateStore((state) => state.data.recipeData)
			: useRecipeDraftStore((state) => state.data.recipeData);
	const ingredientItemsData =
		mode == "state"
			? useRecipeStateStore((state) => state.data.ingredientItemsData)
			: useRecipeDraftStore((state) => state.data.ingredientItemsData);
	const updateIngredient =
		mode == "state"
			? useRecipeStateStore((state) => state.updateIngredient)
			: useRecipeDraftStore((state) => state.updateIngredient);
	const removeIngredient =
		mode == "state"
			? useRecipeStateStore((state) => state.removeIngredient)
			: useRecipeDraftStore((state) => state.removeIngredient);
	const [showIngredientModal, setShowIngredientModal] = useState(false);
	const [selectedIngredient, setSelectedIngredient] = useState(0);
	function calculate_final(inp: number) {
		const mult = 1;
		return (inp * Number(servings)) / mult;
	}
	useEffect(() => {
		//console.log("recipe changed, ingredient", foodData);
	}, [foodData]);
	const calories = calculateCalories(foodData);
	const total_macro = macroSum(foodData);
	return (
		<View style={{ flex: 1, gap: 10 }}>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "space-between",
				}}
			>
				<H2>Ingredients</H2>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
						alignItems: "center",
						gap: 8,
					}}
				>
					<H3 style={{ color: colors.primary }}>
						Servings Yield: {recipeData.servings_yield}
					</H3>
				</View>
			</View>
			<FlatList
				data={ingredientItemsData}
				renderItem={({ item, index }) => (
					<Pressable
						onPress={() => {
							(setSelectedIngredient(index),
								setShowIngredientModal(true));
						}}
					>
						<FoodCardIngredient
							style={{ backgroundColor: "" }}
							food={item.food}
							ingredientItem={item.ingredientItem}
						/>
					</Pressable>
				)}
				scrollEnabled={false}
				ItemSeparatorComponent={() => (
					<View
						style={{
							height: 1,
							flex: 1,
							backgroundColor: colors.primary_bg,
							marginHorizontal: 20,
						}}
					/>
				)}
				extraData={showIngredientModal}
			/>
			{canModifyIngredient && (
				<View>
					<SecondaryAddButton onPress={addIngredient}>
						Add Ingredient
					</SecondaryAddButton>
				</View>
			)}
			{ingredientItemsData[selectedIngredient] && (
				<View>
					<Modal
						visible={showIngredientModal}
						transparent
						animationType="fade"
						onRequestClose={() => {
							setShowIngredientModal(false);
						}}
					>
						<IngredientModal
							foodData={
								ingredientItemsData[selectedIngredient]?.food
							}
							ingredientData={
								ingredientItemsData[selectedIngredient]
									.ingredientItem
							}
							options={[...DefaultServings]}
							selectedOption={0}
							setIngredient={(updatedIngredient) =>
								updateIngredient(
									selectedIngredient,
									updatedIngredient,
								)
							}
							onClose={() => setShowIngredientModal(false)}
							onSwap={() =>
								console.log(
									"implement onSwap for ingredientModal in Ingredients.tsx",
								)
							}
							onDelete={() =>
								ingredientItemsData.length > 1
									? (setSelectedIngredient(0),
										removeIngredient(selectedIngredient))
									: () => {}
							}
						/>
					</Modal>
				</View>
			)}
		</View>
	);
};

export default Ingredients;

const styles = StyleSheet.create({
	chartsContainer: {
		flexDirection: "row",

		//alignItems: 'center',
		justifyContent: "space-between",
		gap: 20,
	},
});
