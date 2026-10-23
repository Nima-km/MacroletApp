import { useFoodSelectionStore } from "@/store/foodSelectionStore";
import { FoodItemData } from "@/types/food";
import BottomSheet from "@gorhom/bottom-sheet";
import React, { useRef, useState } from "react";
import { Modal } from "react-native";
import { servingSizeProvider } from "@/helper/ServingSizeProvider";
import FoodBottomSheet from "../UIComponents/BottomSheet/FoodBottomSheet";
import IngredientBottomSheet from "../UIComponents/BottomSheet/IngredientBottomSheet";
import QuickAddIngredientModal from "../UIComponents/Modals/QuickAddIngredientModal";

type Props = {
	/**
	 * Which drawer this flow owns. Logging a food shows only the food sheet, a recipe's
	 * "add ingredient" shows only the ingredient sheet - otherwise navigating back to
	 * LogFood mid-recipe revealed the half-built ingredient list, because the store
	 * deliberately keeps it.
	 */
	mode: "food" | "ingredient";
	onLogFoodList: () => void;
	onFoodCardID: (
		id: number,
		index?: number,
		ingredientItemData?: FoodItemData,
	) => void;
	isNewRecipe?: boolean;
};

/**
 * The sheets and the quick-add modal for the current selection.
 *
 * Extracted from `FindFood` for one reason: this is the **only** part of that
 * screen that displays the picked items, so it is the only part that needs to
 * re-render when one is added. Keeping it here means a swipe in the recent tab
 * updates the sheet without re-rendering the PagerView or the recent list - the
 * frame drops that gesture used to cause.
 *
 * `quickSelectedIndex` and the modal's visibility live here too, since nothing
 * outside this component reads them.
 */
export default function FoodSelectionSheets({
	mode,
	onLogFoodList,
	onFoodCardID,
	isNewRecipe = false,
}: Props) {
	const foodList = useFoodSelectionStore((s) => s.foodList);
	const ingredientList = useFoodSelectionStore((s) => s.ingredientList);
	const addFood = useFoodSelectionStore((s) => s.addFood);
	const removeFood = useFoodSelectionStore((s) => s.removeFood);
	const removeIngredient = useFoodSelectionStore((s) => s.removeIngredient);

	const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
	const [quickSelectedIndex, setQuickSelectedIndex] = useState<number>();
	const sheetRef = useRef<BottomSheet>(null);

	const selected =
		quickSelectedIndex !== undefined ? foodList[quickSelectedIndex] : undefined;

	return (
		<>
			{mode === "food" && foodList.length > 0 ? (
				<FoodBottomSheet
					onLogAll={onLogFoodList}
					ref={sheetRef}
					foodFullData={foodList}
					onRemove={removeFood}
					onModify={(index) => {
						setQuickSelectedIndex(index);
						setIngredientModalVisible(true);
					}}
				/>
			) : null}

			{mode === "ingredient" && ingredientList.length > 0 ? (
				<IngredientBottomSheet
					onLogAll={onLogFoodList}
					ref={sheetRef}
					ingredientFullData={ingredientList}
					isNewRecipe={isNewRecipe}
					onRemove={removeIngredient}
					onModify={(index, food_id, ingredientItemData) =>
						onFoodCardID(food_id, index, ingredientItemData)
					}
				/>
			) : null}

			{mode === "food" && selected ? (
				<Modal
					visible={ingredientModalVisible}
					transparent
					animationType="fade"
					onRequestClose={() => setIngredientModalVisible(false)}
				>
					<QuickAddIngredientModal
						foodData={selected.food}
						foodItemData={selected.foodItem}
						options={servingSizeProvider({
							servingData: [],
							serving_100g: selected.food.serving_100g,
						})}
						setFoodItem={addFood}
						cleanUp={() =>
							quickSelectedIndex !== undefined
								? removeFood(quickSelectedIndex)
								: undefined
						}
						onClose={() => setIngredientModalVisible(false)}
					/>
				</Modal>
			) : null}
		</>
	);
}
