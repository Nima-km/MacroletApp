import {
	SimpleChartCarbsSmall,
	SimpleChartFatSmall,
	SimpleChartProteinSmall,
} from "@/components/chartComponents/SimpleChart/SimpleChartSmall";
import { useCreateRecipeWithFoodAndIngredients } from "@/db/hooks/recipe/useCreateRecipe";
import { calculateCalories } from "@/helper/calculateCalories";
import {
	CalculateMacroSum,
	CalculateMacroSumIngredient,
} from "@/helper/recipeMacroSum";
import { useFoodSelectionStore } from "@/store/foodSelectionStore";
import { colors, typography } from "@/theme";
import { FoodFullData } from "@/types/food";
import ArrowLeft from "@/assets/svg/chevron-left.svg";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { PrimaryButton, SecondaryButton } from "../Buttons/Button";
import { FormInput, FormInputNumber } from "../TextInputs/FormInput";
import { H1, H3, H4, H5, H5_SemiBold } from "../Typography";

type Props = {
	/** The current selection. Passed in rather than mirrored through a store. */
	foodFullData: FoodFullData[];
	onLogAll: (foodObject: FoodFullData[]) => void;
};

const MIN_NAME_LENGTH = 4;

/**
 * Footer of the food drawer.
 *
 * Two ways out of the same selection: log it as a meal, or turn it into a private
 * recipe. The second replaces the nutrition summary with the two things a recipe
 * needs - a name and a yield - and otherwise reuses what the drawer already holds.
 */
const FoodBottomSheetFooter = ({ foodFullData, onLogAll }: Props) => {
	const router = useRouter();
	const clearFood = useFoodSelectionStore((state) => state.clearFood);
	const { mutate: createRecipe, isPending } =
		useCreateRecipeWithFoodAndIngredients();

	const [mode, setMode] = useState<"cart" | "recipe">("cart");
	const [name, setName] = useState("");
	const [servings, setServings] = useState("");

	// The sum only changes when the selection does, not on every keystroke in the
	// quick-recipe form.
	const foodData = useMemo(
		() => CalculateMacroSum(foodFullData),
		[foodFullData],
	);
	const calories = calculateCalories(foodData);
	const total_macro = foodData.carbs + foodData.fat + foodData.protein;

	/**
	 * Hard rule: a recipe cannot be built out of another recipe.
	 *
	 * Checked before the drawer switches into recipe mode, so the user is told the
	 * moment they ask for it rather than after filling in a name and a yield.
	 */
	function blockedByNestedRecipe() {
		const nested = (foodFullData ?? []).find(
			(item) => item.food.recipe_id != null,
		);
		if (!nested) return false;
		Toast.show({
			type: "warning",
			text1: "A recipe can't be an ingredient",
			text2: `Remove "${nested.food.name}" and pick the individual foods.`,
		});
		return true;
	}

	function startRecipeMode() {
		if (blockedByNestedRecipe()) return;
		setMode("recipe");
	}

	function saveAsRecipe() {
		// Checked again on submit: the rule holds even if the mode was reached some
		// other way.
		if (blockedByNestedRecipe()) return;

		const yieldValue = Number(servings);
		if (name.trim().length < MIN_NAME_LENGTH) {
			Toast.show({
				type: "warning",
				text1: "Recipe needs a name",
				text2: `At least ${MIN_NAME_LENGTH} characters.`,
			});
			return;
		}
		if (!Number.isFinite(yieldValue) || yieldValue < 1) {
			Toast.show({
				type: "warning",
				text1: "How many servings?",
				text2: "The yield has to be at least 1.",
			});
			return;
		}

		const ingredients = (foodFullData ?? []).map((item) => ({
			food: item.food,
			ingredientItem: item.foodItem,
		}));

		// The recipe's own food row carries the per-serving macros, which is what the
		// rest of the app reads when a serving is logged.
		const perServing = CalculateMacroSumIngredient(ingredients, yieldValue);

		createRecipe(
			{
				recipeData: {
					servings_yield: yieldValue,
					prep_time: 0,
					cook_time: 0,
					directions: [],
					tags: [],
				},
				foodData: {
					name: name.trim(),
					protein: perServing.protein,
					carbs: perServing.carbs,
					fat: perServing.fat,
					fiber: perServing.fiber,
					serving_100g: 0,
					volume_100ml: 0,
				},
				ingredientItemsData: ingredients,
			},
			{
				onSuccess: (created) => {
					// The selection became a recipe, so the cart empties.
					clearFood();
					setMode("cart");
					setName("");
					setServings("");
					router.push({
						pathname: "/(tabs)/(logs)/food",
						params: { food_id: created.food.id },
					});
				},
				onError: () =>
					Toast.show({
						type: "error",
						text1: "Couldn't save the recipe",
						text2: "Nothing was logged. Try again.",
					}),
			},
		);
	}

	if (mode === "recipe") {
		return (
			<View style={styles.sheet}>
				<Pressable
					onPress={() => setMode("cart")}
					style={styles.backLink}
					accessibilityRole="button"
					accessibilityLabel="Back to the selected foods"
				>
					<ArrowLeft color={colors.primary} height={16} width={16} />
					<H5_SemiBold style={{ color: colors.primary }}>Back</H5_SemiBold>
				</Pressable>

				<View style={{ gap: 10 }}>
					<View style={styles.labelRow}>
						<H4>Recipe Name</H4>
						<H5 style={{ color: colors.inactive }}>required</H5>
					</View>
					<FormInput
						value={name}
						onChangeText={setName}
						placeholder="Enter recipe name"
					/>
				</View>

				{/* Label on the left, field on the right, as in the design. */}
				<View style={styles.rowField}>
					<View style={{ gap: 2 }}>
						<H4>Servings Yield</H4>
						<H5 style={{ color: colors.inactive }}>required</H5>
					</View>
					<View style={{ flex: 1 }}>
						<FormInputNumber
							value={servings}
							onChangeText={setServings}
							placeholder="Enter servings yield"
							// Left-aligned like every other text field, not centred, and
							// at the same size as the recipe name field (FormInput uses
							// h5; FormInputNumber defaults to the larger h3).
							center={false}
							style={typography.h5}
						/>
					</View>
				</View>

				<PrimaryButton onPress={saveAsRecipe}>
					{isPending ? "Saving…" : "Create Recipe"}
				</PrimaryButton>
			</View>
		);
	}

	return (
		<View style={styles.sheet}>
			<H3>Nutrition Details</H3>

			<View style={[styles.rowContainer, { marginBottom: 20 }]}>
				<View style={{ justifyContent: "center", alignItems: "center" }}>
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

			<PrimaryButton onPress={() => onLogAll(foodFullData ?? [])}>
				Log all Selected
			</PrimaryButton>
			<SecondaryButton onPress={startRecipeMode}>
				Save as Recipe
			</SecondaryButton>
		</View>
	);
};

export default FoodBottomSheetFooter;

const styles = StyleSheet.create({
	sheet: {
		backgroundColor: colors.off_white,
		padding: 16,
		gap: 20,
	},
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
	labelRow: {
		flexDirection: "row",
		gap: 8,
	},
	rowField: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	backLink: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		gap: 4,
	},
});
