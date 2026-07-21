import { updloadRecipe } from "@/api/uploadRecipe";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import RecipeInfoCore from "@/components/recipeComponents/RecipeInfoCore";
import StepIndicator from "@/components/recipeComponents/StepIndicator";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import { useCreateRecipeWithFoodAndIngredients } from "@/db/hooks/recipe/useCreateRecipe";
import {
	isValidRecipeDraft,
	useRecipeDraftStore,
} from "@/store/recipeStore/useRecipeStore";
import { RecipeData } from "@/types/recipe";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

type SectionKey = "ingredients" | "overview" | "directions";
const preview = () => {
	const router = useRouter();
	const { getToken, has } = useAuth();
	const { mutate: saveRecipe } = useCreateRecipeWithFoodAndIngredients();
	const resetDraft = useRecipeDraftStore((state) => state.reset);
	const recipeFullData = useRecipeDraftStore((state) => state.data);
	const visibility = useRecipeDraftStore((state) => state.visibility);
	async function onUpload(food_id: number) {
		const clerk_token = await getToken();
		const recipeDataWithDirections = {
			...recipeFullData,
			recipeData: {
				...recipeFullData.recipeData,
				directions: recipeFullData.recipeData.directions || [],
			},
		};
		updloadRecipe(recipeDataWithDirections as RecipeData, clerk_token ?? "")
			.catch((e) => console.log(e))
			.then(() => {
				console.log("navigating");
				router.dismissAll();
				router.navigate({
					pathname: "/(tabs)/(logs)/food",
					params: { food_id },
				});
				console.log("reseting draft");
				resetDraft();
				//
			});
		//.then(updateRecipe(recipe)); FOR MAKING SURE DUPLICATE RECIPES DON'T GET REUPLOADED
	}
	function handleSave() {
		if (isValidRecipeDraft(recipeFullData)) {
			console.log("recipe to add", recipeFullData.ingredientItemsData);
			saveRecipe(
				{
					...recipeFullData,
					foodData: {
						...recipeFullData.foodData,
					},
				},
				{
					onSuccess: (item) => {
						router.dismissAll();
						router.navigate({
							pathname: "/(tabs)/(logs)/food",
							params: { food_id: item.food.id },
						});
						resetDraft();
					},
				},
			);
			//router.navigate('')
		} else {
			console.log("not valid recipe", recipeFullData);
		}
	}
	function handleSaveAndUpload() {
		if (isValidRecipeDraft(recipeFullData)) {
			console.log("recipe to add", recipeFullData.ingredientItemsData);
			saveRecipe(
				{
					...recipeFullData,
					foodData: {
						...recipeFullData.foodData,
					},
				},
				{
					onSuccess: (item) => {
						onUpload(item.food.id);
					},
				},
			);
			//router.navigate('')
		} else {
			console.log("not valid recipe", recipeFullData);
		}
	}
	return (
		<View style={{ flex: 1, gap: 20 }}>
			<HeaderSimple title={"Create Recipe"} />
			<StepIndicator activeStep={0} />
			<View style={{ flex: 1 }}>
				<RecipeInfoCore
					servings={1}
					canModifyIngredient={false}
					setServings={(newServing) => {}}
					onLogRecipe={() => {}}
					mode="draft"
				/>
				<View style={{ padding: 20 }}>
					{visibility == "public" ? (
						<PrimaryButton onPress={handleSaveAndUpload}>
							Publish Recipe
						</PrimaryButton>
					) : (
						<PrimaryButton onPress={handleSave}>
							Save Recipe
						</PrimaryButton>
					)}
				</View>
			</View>
		</View>
	);
};

export default preview;
