import { useGetRecipeFromSlug } from "@/api/hooks/useSearchRecipe";
import HeaderFood from "@/components/navComponents/HeaderFood";
import KeyboardAware from "@/components/UIComponents/KeyboardAware/KeyboardAware";
import FoodView from "@/components/UIComponents/Modals/Food/FoodView";
import { H1 } from "@/components/UIComponents/Typography";
import { useCreateAndLogOnlineRecipe } from "@/db/hooks/recipe/useCreateRecipe";
import {
	isValidRecipeDraft,
	useRecipeStateStore,
} from "@/store/recipeStore/useRecipeStore";
import { FoodItemDefault } from "@/tests/testData";
import { FoodInsert, FoodItemData } from "@/types/food";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const onlineRecipe = () => {
	const router = useRouter();
	const { recipeSlug } = useLocalSearchParams<{ recipeSlug: string }>();
	const { data: fetchedData, isLoading } = useGetRecipeFromSlug(
		recipeSlug as string,
	);
	const initializeRecipe = useRecipeStateStore(
		(state) => state.initializeRecipe,
	);
	const recipeStoreData = useRecipeStateStore((state) => state.data);
	useEffect(() => {
		if (fetchedData) initializeRecipe(fetchedData);
	}, [fetchedData]);
	const {
		mutate: logAndCreateRecipe,
		isPending: logAndCreateRecipePending,
		error: logAndCreateRecipeError,
		isSuccess: logAndCreateRecipeSuccess,
	} = useCreateAndLogOnlineRecipe();

	const [edit, setEdit] = useState(false);
	const foodItemDefault = {
		...FoodItemDefault,
		timestamp: new Date(),
	};
	function LogNewFood(food: FoodInsert, foodItem: FoodItemData) {
		if (foodItem) {
			if (recipeStoreData.recipeData) {
				if (isValidRecipeDraft(recipeStoreData))
					logAndCreateRecipe(
						{
							recipeData: recipeStoreData,
							foodItem,
						},
						{
							onSuccess: () => {
								console.log(`${food.name} has been logged`);
								router.push("/(tabs)/(logs)/logs");
							},
							onError: (err) => {
								console.error("Insert failed:", err);
							},
						},
					);
			} else {
				console.log(`something went wrong A`);
			}
		} else {
			console.log(`something went wrong B`);
		}
	}
	if (!isValidRecipeDraft(recipeStoreData)) {
		return <H1>Loading</H1>;
	}
	return (
		<KeyboardAware>
			<HeaderFood
				title={"View Online Recipe"}
				isEdit={edit}
				onEdit={setEdit}
				onBack={() => router.back()}
			/>

			<View style={{ flex: 1 }}>
				<FoodView
					foodData={recipeStoreData.foodData}
					foodItemData={foodItemDefault}
					recipeData={recipeStoreData.recipeData}
					servingData={[]}
					primaryText={"Log"}
					primaryButton={LogNewFood}
					ingredientItemsData={recipeStoreData.ingredientItemsData}
					edit={edit}
					setEdit={setEdit}
				/>
			</View>
		</KeyboardAware>
	);
};

export default onlineRecipe;

const styles = StyleSheet.create({});
