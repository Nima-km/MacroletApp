import FindFood from "@/components/findFoodTabs/FindFood";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import QuickAddIngredientModal from "@/components/UIComponents/Modals/QuickAddIngredientModal";
import { useGetFood } from "@/db/hooks/food/useFood";
import { servingSizeProvider } from "@/helper/ServingSizeProvider";
import { useFindFoodSelectedPageStore } from "@/store/useStore";
import { FoodItemData } from "@/types/food";
import { IngredientFullData } from "@/types/recipe";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet } from "react-native";

const AddIngredient = () => {
	const router = useRouter();
	const [selectedFoodID, setSelectedFoodID] = useState<number | null>(null);
	const [servingsData, setServingsData] = useState([]);
	const [foodList, setFoodList] = useState<IngredientFullData[]>([]);
	const [ingredientModalVisible, setIngredientModalVisible] = useState(false);
	const [ingredientIndex, setIngredientIndex] = useState<number>();
	const setSelectedPage = useFindFoodSelectedPageStore(
		(s) => s.setSelectedPage,
	);
	const [ingredientItemData, setIngredientItemData] =
		useState<FoodItemData>();
	const {
		data: foodData,
		isLoading: foodDataLoading,
		error: errorfoodData,
	} = useGetFood(selectedFoodID ?? undefined, !!selectedFoodID);
	function onFoodCardID(
		food_id: number,
		index?: number,
		foodItemData?: FoodItemData,
	) {
		console.log("onFoodCardID id is", food_id, foodData);
		setIngredientIndex(index);
		setIngredientItemData(foodItemData);
		setSelectedFoodID(food_id);
		setIngredientModalVisible(true);
	}
	const onLogFoodList = () => {
		router.replace("/(tabs)/(logs)/CreateRecipe/ingredients");
	};
	useEffect(() => {
		if (foodData) {
			console.log("food data in AddIngredient", foodData[0]);
		}
	}, [foodData]);
	useEffect(() => {
		if (foodList) {
			console.log("food data in AddIngredient", foodList[0]);
		}
	}, [foodList]);
	return (
		<KeyboardAware>
			<FindFood
				onFoodCardID={onFoodCardID}
				onLogFoodList={onLogFoodList}
				ingredientList={foodList}
				setIngredientList={setFoodList}
				isNewRecipe
			/>
			{foodData && (
				<Modal
					visible={ingredientModalVisible}
					transparent
					animationType="fade"
					onRequestClose={() => {
						setIngredientModalVisible(false);
					}}
				>
					<KeyboardAware>
						<QuickAddIngredientModal
							foodData={foodData[0]}
							foodItemData={ingredientItemData}
							options={servingSizeProvider({
								servingData: servingsData,
								serving_100g: foodData[0].serving_100g,
							})}
							setIngredient={(item) =>
								setFoodList((prev) => [...prev, item])
							}
							cleanUp={() =>
								ingredientIndex !== undefined
									? setFoodList((prev) =>
											prev.filter(
												(_, index) =>
													index !== ingredientIndex,
											),
										)
									: console.log("didnt run")
							}
							onClose={() => setIngredientModalVisible(false)}
						/>
					</KeyboardAware>
				</Modal>
			)}
		</KeyboardAware>
	);
};

export default AddIngredient;

const styles = StyleSheet.create({});
