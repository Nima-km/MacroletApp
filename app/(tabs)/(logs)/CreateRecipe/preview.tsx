import { updloadRecipe } from "@/api/uploadRecipe";
import HeaderSimple from "@/components/navComponents/HeaderSimple";
import RecipeInfoCore from "@/components/recipeComponents/RecipeInfoCore";
import StepIndicator from "@/components/recipeComponents/StepIndicator";
import { PrimaryButton } from "@/components/UIComponents/Buttons/Button";
import {
	useCreateRecipeWithFoodAndIngredients,
	useUpdateRecipeWithFoodAndIngredients,
	useUpdateSlugRecipe,
} from "@/db/hooks/recipe/useCreateRecipe";
import {
	allMet,
	firstUnmet,
	privateRequirements,
	publicRequirements,
} from "@/helper/recipeDraftValidation";
import {
	isValidRecipeDraft,
	useRecipeDraftStore,
} from "@/store/recipeStore/useRecipeStore";
import { RecipeData } from "@/types/recipe";
import { useAuth } from "@clerk/expo";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

type SectionKey = "ingredients" | "overview" | "directions";
const preview = () => {
	const router = useRouter();
	const { getToken, has } = useAuth();
	const { mutate: saveRecipe } = useCreateRecipeWithFoodAndIngredients();
	const resetDraft = useRecipeDraftStore((state) => state.reset);
	const recipeFullData = useRecipeDraftStore((state) => state.data);
	const visibility = useRecipeDraftStore((state) => state.visibility);
	const { mutate: updateSlug } = useUpdateSlugRecipe();
	const { mutate: updateRecipe } = useUpdateRecipeWithFoodAndIngredients();
	// What stands between this draft and a published recipe, if anything.
	const publishBlocker = firstUnmet(publicRequirements(recipeFullData));
	const publishReady = publishBlocker === undefined;
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
			.catch((e) => {
				console.log(e);
				return undefined;
			})
			.then((uploaded) => {
				// Record the slug on the local row. From here the recipe is online:
				// its name, media, tags and steps stop being editable, and only its
				// ingredients and servings yield can change in place.
				const recipeId = recipeFullData.recipeData.id;
				const slug =
					typeof uploaded === "string"
						? uploaded
						: (uploaded as { recipe_slug?: string } | undefined)
								?.recipe_slug;
				if (slug && recipeId) {
					updateSlug({ recipe_Id: recipeId, recipe_slug: slug });
				}
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
		// `isValidRecipeDraft` checks name, servings and at least one ingredient - the
		// private rule set - and narrows the draft for the insert. It does not require
		// a description or tags, so a private recipe can be saved without them.
		if (isValidRecipeDraft(recipeFullData)) {
			const existingRecipeId = recipeFullData.recipeData.id;
			const draft = {
				...recipeFullData,
				foodData: {
					...recipeFullData.foodData,
				},
			};

			// An existing recipe must be updated, not inserted - otherwise editing a
			// private recipe leaves two copies of it on the device.
			if (existingRecipeId) {
				updateRecipe(draft, {
					onSuccess: (updated) => {
						router.dismissAll();
						router.navigate({
							pathname: "/(tabs)/(logs)/food",
							params: { food_id: updated.food.id },
						});
						resetDraft();
					},
				});
				return;
			}

			saveRecipe(draft, {
				onSuccess: (item) => {
					router.dismissAll();
					router.navigate({
						pathname: "/(tabs)/(logs)/food",
						params: { food_id: item.food.id },
					});
					resetDraft();
				},
			});
		} else {
			console.log("not valid recipe", recipeFullData);
		}
	}
	function handleSaveAndUpload() {
		// Publishing is blocked until the recipe is complete enough to be useful to
		// strangers - and, crucially, until every ingredient resolves to a food the
		// server has, because it computes the macros from them.
		const unmet = firstUnmet(publicRequirements(recipeFullData));
		if (unmet) {
			Toast.show({
				type: "warning",
				text1: "Not ready to publish",
				text2: unmet.label,
			});
			return;
		}
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
						<PrimaryButton
							onPress={handleSaveAndUpload}
							style={{ opacity: publishReady ? 1 : 0.5 }}
						>
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
